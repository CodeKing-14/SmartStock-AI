"""
Core Data Analyst AI  (Agent #1 of the Smart AI debate system)
================================================================
Reads the seeded retail data, pre-computes exact metrics in Python,
and asks an LLM to write a concise, factual, per-store summary.
It NEVER suggests solutions - that is the job of the later agents.

Usage (from this folder):
    python data_analyst_ai.py                 # uses OpenAI API
    python data_analyst_ai.py --offline       # no API / no credit needed
    python data_analyst_ai.py --store S1      # one store only
    python data_analyst_ai.py --model gpt-4o  # choose model

Environment variables (or put them in a .env file):
    OPENAI_API_KEY   your key
    OPENAI_MODEL     optional, default gpt-4o-mini
    OPENAI_BASE_URL  optional, for OpenAI-compatible providers
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Make Windows consoles handle any character safely.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DATA_FILE = BASE_DIR / "data" / "retail_data.json"
REPORT_DIR = BASE_DIR / "reports"

# Thresholds used to flag facts (they are observations, not recommendations)
SALES_CHANGE_FLAG_PCT = 20      # +/- % week-over-week
LOW_STOCK_DAYS = 7              # days of cover at this week's sales rate
HIGH_STOCK_DAYS = 45
PRICE_GAP_FLAG_PCT = 5          # our price vs competitor price

SYSTEM_PROMPT = (
    "You are a Data Analyst AI for a retail chain. Your job is to summarize the "
    "key facts from the provided data for each store. Be concise and factual. "
    "Highlight any significant sales changes, stock concerns, and competitor "
    "actions. Do not suggest solutions."
)


# --------------------------------------------------------------------------
# Data loading and metric enrichment
# --------------------------------------------------------------------------
def load_data(path: Path = DATA_FILE) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def enrich_store(store: dict) -> dict:
    """Add exact computed metrics so the LLM never has to do arithmetic."""
    enriched_products = []
    for p in store["products"]:
        last, this = p["sales_last_week"], p["sales_this_week"]
        change_pct = round((this - last) / last * 100, 1) if last else None
        daily_rate = this / 7
        cover_days = round(p["stock_level"] / daily_rate, 1) if daily_rate else None
        gap_pct = round((p["our_price"] - p["competitor_price"]) / p["competitor_price"] * 100, 1)

        flags = []
        if change_pct is not None and change_pct >= SALES_CHANGE_FLAG_PCT:
            flags.append("SALES_SURGE")
        if change_pct is not None and change_pct <= -SALES_CHANGE_FLAG_PCT:
            flags.append("SALES_DROP")
        if cover_days is not None and cover_days < LOW_STOCK_DAYS:
            flags.append("LOW_STOCK")
        if cover_days is not None and cover_days > HIGH_STOCK_DAYS:
            flags.append("HIGH_STOCK")
        if gap_pct >= PRICE_GAP_FLAG_PCT:
            flags.append("PRICED_ABOVE_COMPETITOR")
        if gap_pct <= -PRICE_GAP_FLAG_PCT:
            flags.append("PRICED_BELOW_COMPETITOR")

        enriched_products.append({
            **p,
            "sales_change_pct": change_pct,
            "days_of_stock_cover": cover_days,
            "price_gap_vs_competitor_pct": gap_pct,
            "flags": flags,
        })
    return {**store, "products": enriched_products}


# --------------------------------------------------------------------------
# LLM analyst
# --------------------------------------------------------------------------
def build_user_prompt(store: dict, meta: dict) -> str:
    payload = {
        "chain": meta.get("chain_name"),
        "currency": meta.get("currency"),
        "period": meta.get("week_label"),
        "store": store,
    }
    return (
        "Summarize the key facts for this store using only the data below. "
        "Use a short heading, then bullet points grouped as: Sales, Stock, "
        "Competitor pricing, Upcoming events. Quote the computed numbers "
        "exactly. Do not suggest solutions or actions.\n\n"
        + json.dumps(payload, indent=2, ensure_ascii=False)
    )


def analyze_store_llm(client, model: str, store: dict, meta: dict) -> str:
    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(store, meta)},
        ],
    )
    return response.choices[0].message.content.strip()


# --------------------------------------------------------------------------
# Offline analyst (no API needed - used with --offline or as a fallback)
# --------------------------------------------------------------------------
def analyze_store_offline(store: dict, meta: dict) -> str:
    cur = meta.get("currency", "")
    lines = [f"### {store['store_name']} ({store['store_id']})"]

    sales, stock, comp = [], [], []
    for p in store["products"]:
        ch = p["sales_change_pct"]
        sales.append(
            f"- {p['name']}: {p['sales_last_week']} -> {p['sales_this_week']} units "
            f"({ch:+.1f}%)" + (" [significant]" if any(f.startswith("SALES_") for f in p["flags"]) else "")
        )
        note = ""
        if "LOW_STOCK" in p["flags"]:
            note = " [low stock]"
        elif "HIGH_STOCK" in p["flags"]:
            note = " [high stock]"
        stock.append(
            f"- {p['name']}: {p['stock_level']} units, about {p['days_of_stock_cover']} days of cover{note}"
        )
        gap = p["price_gap_vs_competitor_pct"]
        comp.append(
            f"- {p['name']}: ours {cur} {p['our_price']} vs competitor {cur} "
            f"{p['competitor_price']} ({gap:+.1f}%)"
        )

    lines += ["**Sales**"] + sales
    lines += ["**Stock**"] + stock
    lines += ["**Competitor pricing**"] + comp
    if store.get("festival_in_3_days"):
        lines += ["**Upcoming events**", f"- {store.get('festival_name') or 'A festival'} in 3 days"]
    else:
        lines += ["**Upcoming events**", "- No festival in the next 3 days"]
    return "\n".join(lines)


# --------------------------------------------------------------------------
# Saving (after every store, so nothing is lost if credit runs out)
# --------------------------------------------------------------------------
def save_progress(run_dir: Path, results: dict, meta: dict, mode: str) -> None:
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "summaries.json").write_text(
        json.dumps({"meta": meta, "mode": mode, "summaries": results}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    md = [f"# Data Analyst Report - {meta.get('chain_name')} ({meta.get('week_label')})", ""]
    for sid, item in results.items():
        md += [item["summary"], f"\n_source: {item['source']}_\n"]
    (run_dir / "report.md").write_text("\n".join(md), encoding="utf-8")


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
def make_client():
    try:
        from dotenv import load_dotenv
        load_dotenv(BASE_DIR / ".env")
    except ImportError:
        pass
    if not os.getenv("OPENAI_API_KEY"):
        return None
    from openai import OpenAI
    kwargs = {}
    if os.getenv("OPENAI_BASE_URL"):
        kwargs["base_url"] = os.getenv("OPENAI_BASE_URL")
    return OpenAI(**kwargs)


def main() -> int:
    parser = argparse.ArgumentParser(description="Core Data Analyst AI")
    parser.add_argument("--offline", action="store_true", help="skip the LLM, use rule-based summaries")
    parser.add_argument("--store", help="analyze only this store_id (e.g. S1)")
    parser.add_argument("--model", help="LLM model name (default: env OPENAI_MODEL or gpt-4o-mini)")
    parser.add_argument("--data", default=str(DATA_FILE), help="path to the JSON data file")
    args = parser.parse_args()

    data = load_data(Path(args.data))
    meta = {k: v for k, v in data.items() if k != "stores"}
    stores = [enrich_store(s) for s in data["stores"]]
    if args.store:
        stores = [s for s in stores if s["store_id"] == args.store]
        if not stores:
            print(f"No store with id {args.store}")
            return 1

    client = None if args.offline else make_client()
    if not args.offline and client is None:
        print("OPENAI_API_KEY not set - running in offline mode.\n")
    model = args.model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    mode = "llm" if client else "offline"

    run_dir = REPORT_DIR / datetime.now().strftime("run_%Y%m%d_%H%M%S")
    results = {}

    for store in stores:
        print(f"Analyzing {store['store_name']} ...")
        if client:
            try:
                summary = analyze_store_llm(client, model, store, meta)
                source = f"llm:{model}"
            except Exception as exc:  # credit finished, network error, bad key...
                print(f"  LLM call failed ({type(exc).__name__}: {exc}). Using offline summary.")
                summary = analyze_store_offline(store, meta)
                source = "offline-fallback"
        else:
            summary = analyze_store_offline(store, meta)
            source = "offline"

        results[store["store_id"]] = {"store_name": store["store_name"], "summary": summary, "source": source}
        save_progress(run_dir, results, meta, mode)  # saved after every store
        print(summary + "\n")

    print(f"Saved to: {run_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
