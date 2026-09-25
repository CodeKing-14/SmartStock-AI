"""
Pricing AI  (Agent #2 of the Smart AI debate system)
=====================================================
Two layers:

1. PRICING ENGINE (real logic, deterministic, works offline)
   For every product in every store it searches candidate prices and picks
   the one with the best score, using:
     - a constant-elasticity demand model
     - a competitor-gap penalty (customers leave when we are priced well above)
     - a festival demand uplift
     - guardrails: minimum margin over cost, maximum weekly price change
   Score = expected gross profit + a small value for each unit sold
           (customer retention), so the AI will cut price to win customers
           back when a competitor undercuts, instead of only maximizing margin.

   The proposal is intentionally driven by price/demand/competition. Stock is
   reported as a risk flag (days of cover at the new price) so the Inventory AI
   can object in the debate. A stock-limited fallback is included too.

2. CHAT LAYER (LLM, optional)
   Turns the engine's numbers into a short WhatsApp-style message plus a
   "why" explanation for the Meeting Room screen. The LLM may not invent
   numbers. Without an API key/credit it falls back to templates.

Usage:
    python pricing_ai.py                # LLM chat layer (needs OPENAI_API_KEY)
    python pricing_ai.py --offline      # engine + template messages, no API
    python pricing_ai.py --store S1

Integration for the next agents / orchestrator:
    from pricing_ai import run_pricing_agent
    messages = run_pricing_agent(store_ids=["S1"], offline=True)
    # -> list of {"agent": "Pricing AI", "store_id", "message", "why", "proposals", ...}
"""

import argparse
import json
import math
import os
import sys
from datetime import datetime
from pathlib import Path

from data_analyst_ai import BASE_DIR, REPORT_DIR, enrich_store, load_data, make_client

CONFIG_FILE = BASE_DIR / "data" / "pricing_config.json"

PRICING_SYSTEM_PROMPT = (
    "You are the Pricing AI in a team of retail AIs (Data Analyst, Pricing, "
    "Inventory, Logistics, Boss) that debate decisions for a retail chain. "
    "You receive the pricing engine's computed proposals for one store. "
    "Write your contribution to the team chat as a short, confident message "
    "(max 60 words) that states the price change, the expected effect on "
    "units and profit, and the reason. "
    "If stock_constrained is true OR stock_risk is HIGH, you must NOT present "
    "the price change as a clean recommendation — say you are flagging it for "
    "Inventory/Logistics and recommend holding price unless a transfer covers "
    "the shortfall. If stock_risk is MEDIUM, add a brief heads-up for the "
    "Inventory AI. A negative profit_change with higher units is only "
    "intentional when the item is NOT stock_constrained: it wins customers "
    "back from a cheaper competitor. Use ONLY the numbers provided; never "
    "invent or recalculate numbers. Also write a 'why' explanation (max 90 "
    "words) covering demand, competitor gap, festival effect, and guardrails "
    "that shaped the proposal. Return JSON only: "
    '{"message": "...", "why": "..."}'
)


# --------------------------------------------------------------------------
# Pricing engine
# --------------------------------------------------------------------------
def load_config(path: Path = CONFIG_FILE) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _competitor_factor(price: float, comp: float, tol: float, k: float) -> float:
    gap = (price - comp) / comp
    return max(0.2, 1 - k * max(0.0, gap - tol))


def forecast_demand(price: float, p0: float, base: float, comp: float, elasticity: float, g: dict) -> float:
    """Weekly units expected at `price`, given demand `base` at current price p0."""
    own = (price / p0) ** elasticity
    tol = g["competitor_tolerance_pct"] / 100
    k = g["competitor_sensitivity"]
    comp_ratio = _competitor_factor(price, comp, tol, k) / _competitor_factor(p0, comp, tol, k)
    return base * own * comp_ratio


def _score(price: float, units: float, cost: float, p0: float, g: dict):
    profit = (price - cost) * units
    return profit + g["volume_weight"] * price * units, profit


def _stock_risk(cover_days):
    if cover_days is None:
        return "LOW"
    if cover_days < 3:
        return "HIGH"
    if cover_days < 7:
        return "MEDIUM"
    return "LOW"


def price_product(product: dict, store: dict, cfg: dict) -> dict:
    g = cfg["global"]
    pc = cfg["products"][product["product_id"]]
    p0, comp, cost = product["our_price"], product["competitor_price"], pc["cost_price"]
    stock = product["stock_level"]
    uplift = pc["festival_uplift"] if store.get("festival_in_3_days") else 1.0
    base = product["sales_this_week"] * uplift
    e = pc["elasticity"]

    margin_floor = math.ceil(cost * (1 + g["min_margin_pct"] / 100))
    lo = max(margin_floor, math.ceil(p0 * (1 - g["max_weekly_change_pct"] / 100)))
    hi = max(math.floor(p0 * (1 + g["max_weekly_change_pct"] / 100)), lo)

    def evaluate(price, cap_stock=False):
        demand = forecast_demand(price, p0, base, comp, e, g)
        units = min(demand, stock) if cap_stock else demand
        score, profit = _score(price, units, cost, p0, g)
        return {
            "price": price,
            "units": units,
            "demand": demand,
            "score": score,
            "profit": profit,
        }

    # Stock-capped baseline and best: profit deltas are now realistic.
    current = evaluate(p0, cap_stock=True)

    def best_of(cap):
        best = None
        for price in range(lo, hi + 1):
            r = evaluate(price, cap_stock=cap)
            key = (round(r["score"], 6), -abs(price - p0))
            if best is None or key > best[0]:
                best = (key, r)
        return best[1]

    best = best_of(True)  # stock-capped winner
    unconstrained = best_of(False)  # reference: what we'd want if stock were infinite

    new_price = best["price"]
    daily = best["demand"] / 7 if best["demand"] > 0 else 0
    cover_days = round(stock / daily, 1) if daily else None
    risk = _stock_risk(cover_days)

    gap_pct = (p0 - comp) / comp * 100
    reasons = []
    if new_price < p0 and gap_pct > g["competitor_tolerance_pct"]:
        reasons.append("COMPETITOR_UNDERCUTTING")
    if new_price > p0 and gap_pct < 0:
        reasons.append("ROOM_BELOW_COMPETITOR")
    if uplift > 1:
        reasons.append("FESTIVAL_DEMAND_UPLIFT")
    if new_price == lo and lo == margin_floor and new_price != p0:
        reasons.append("MARGIN_FLOOR_BINDING")
    if new_price == hi and new_price != p0:
        reasons.append("MAX_WEEKLY_CHANGE_CAP")
    if risk in ("MEDIUM", "HIGH"):
        reasons.append("STOCK_RISK_" + risk)
    if best["demand"] > stock:
        reasons.append("STOCK_CONSTRAINED")

    action = "hold" if new_price == p0 else ("cut" if new_price < p0 else "raise")

    return {
        "product_id": product["product_id"],
        "name": product["name"],
        "action": action,
        "current_price": p0,
        "proposed_price": new_price,
        "price_change_pct": round((new_price - p0) / p0 * 100, 1),
        "competitor_price": comp,
        "cost_price": cost,
        "margin_pct_at_proposed": round((new_price - cost) / new_price * 100, 1),
        "forecast_weekly_units_current_price": round(current["demand"], 1),
        "forecast_weekly_units_proposed_price": round(best["demand"], 1),
        "sellable_units_current": round(current["units"], 1),
        "sellable_units_proposed": round(best["units"], 1),
        "expected_profit_current": round(current["profit"]),
        "expected_profit_proposed": round(best["profit"]),
        "profit_change": round(best["profit"] - current["profit"]),
        "value_gain": round(best["score"] - current["score"]),
        "stock_level": stock,
        "days_of_cover_at_proposed": cover_days,
        "stock_risk": risk,
        "stock_constrained": bool(best["demand"] > stock),
        "demand_unmet_at_proposed": round(max(0.0, best["demand"] - stock), 1),
        "unconstrained_best": {
            "price": unconstrained["price"],
            "profit_change_vs_holding": round(
                unconstrained["profit"] - current["profit"]
            ),
        },
        "reason_codes": reasons,
    }


def propose_for_store(store: dict, cfg: dict) -> dict:
    items = [price_product(p, store, cfg) for p in store["products"]]
    actionable = [i for i in items if i["action"] != "hold"]
    urgent = [i for i in items if i.get("stock_risk") == "HIGH" and i not in actionable]

    ranked = sorted(
        actionable,
        key=lambda i: (i.get("stock_constrained", False), i["value_gain"]),
        reverse=True,
    )[:2]
    headline = ranked + urgent
    return {
        "store_id": store["store_id"],
        "store_name": store["store_name"],
        "festival_in_3_days": store.get("festival_in_3_days", False),
        "proposals": items,
        "headline": headline,
    }


# --------------------------------------------------------------------------
# Chat layer (LLM + offline template)
# --------------------------------------------------------------------------
REASON_TEXT = {
    "COMPETITOR_UNDERCUTTING": "competitor is priced below us beyond the tolerated gap",
    "ROOM_BELOW_COMPETITOR": "we are priced below the competitor, leaving room to earn more per unit",
    "FESTIVAL_DEMAND_UPLIFT": "festival in 3 days lifts expected demand",
    "MARGIN_FLOOR_BINDING": "minimum margin floor limits how low we can go",
    "MAX_WEEKLY_CHANGE_CAP": "weekly price-change cap limits the move",
    "STOCK_RISK_MEDIUM": "stock cover is under 7 days at the new price",
    "STOCK_RISK_HIGH": "stock cover is under 3 days at the new price",
}


def offline_message(result: dict) -> dict:
    head = result["headline"]
    label = f"{result['store_id']} {result['store_name']}"
    if not head:
        return {
            "message": (
                f"{label}: hold all prices this week. No change beats the current "
                f"prices under our margin and competitor rules."
            ),
            "why": (
                "The engine tested every allowed price for each product and none "
                "scored better than the current price."
            ),
        }

    parts, whys, heads_up = [], [], []
    for h in head:
        stock_risk = h.get("stock_risk", "LOW")
        constrained = h.get("stock_constrained", False)
        cover = h.get("days_of_cover_at_proposed")

        # ---- CHANGED BLOCK: split constrained vs unconstrained wording ----
        if constrained:
            unmet = h.get("demand_unmet_at_proposed", 0)
            parts.append(
                f"{h['name']}: HOLD ₹{h['current_price']} "
                f"(stock-capped, {unmet:.0f} units of unmet demand)"
            )
        else:
            parts.append(
                f"{h['name']} ₹{h['current_price']} → ₹{h['proposed_price']} "
                f"({h['price_change_pct']:+.1f}%), units "
                f"{h['forecast_weekly_units_current_price']:.0f} → "
                f"{h['forecast_weekly_units_proposed_price']:.0f}, profit "
                f"{'+' if h['profit_change'] >= 0 else '-'}₹{abs(h['profit_change']):,}"
                + (" (margin traded for volume)" if h["profit_change"] < 0 else "")
            )
        # ---- END CHANGED BLOCK ----

        reason_codes = h.get("reason_codes", [])
        reasons = (
            "; ".join(
                REASON_TEXT[c]
                for c in reason_codes
                if c in REASON_TEXT and not c.startswith("STOCK")
            )
            or "best score among allowed prices"
        )

        whys.append(
            f"{h['name']}: {reasons}. Competitor at ₹{h['competitor_price']}, "
            f"margin at proposed price {h.get('margin_pct_at_proposed', '?')}%."
        )

        if constrained or stock_risk == "HIGH":
            heads_up.append(
                f"{h['name']}: HOLD price, stock covers only {cover} days at "
                f"current demand — needs transfer-in, not a discount"
            )
        elif stock_risk == "MEDIUM":
            heads_up.append(f"{h['name']}: monitor stock, {cover} days cover")

    msg = f"{label}: I propose " + " | ".join(parts) + "."
    if heads_up:
        msg += " ⚠️ Heads-up for Inventory AI: " + "; ".join(heads_up) + "."
    return {"message": msg, "why": " ".join(whys)}


def llm_message(client, model: str, result: dict, analyst_summary: str | None) -> dict:
    payload = {
        "store": f"{result['store_id']} {result['store_name']}",
        "festival_in_3_days": result["festival_in_3_days"],
        "headline_proposals": result["headline"],
        "analyst_summary": analyst_summary,
    }
    resp = client.chat.completions.create(
        model=model,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PRICING_SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
    )
    data = json.loads(resp.choices[0].message.content)
    if not data.get("message") or not data.get("why"):
        raise ValueError("LLM JSON missing message/why")
    return {"message": str(data["message"]).strip(), "why": str(data["why"]).strip()}


# --------------------------------------------------------------------------
# Orchestration helpers
# --------------------------------------------------------------------------
def latest_analyst_summaries() -> dict:
    """Load summaries from the most recent Data Analyst run, if any."""
    runs = sorted(REPORT_DIR.glob("run_*/summaries.json"))
    if not runs:
        return {}
    try:
        data = json.loads(runs[-1].read_text(encoding="utf-8"))
        return {sid: item["summary"] for sid, item in data.get("summaries", {}).items()}
    except Exception:
        return {}


def save_progress(run_dir: Path, messages: list) -> None:
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "pricing_messages.json").write_text(
        json.dumps(messages, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    md = ["# Pricing AI Report", ""]
    for m in messages:
        md += [f"**{m['agent']} → {m['store_id']}**", "", m["message"], "", f"_Why:_ {m['why']}", f"_source: {m['source']}_", ""]
    (run_dir / "pricing_report.md").write_text("\n".join(md), encoding="utf-8")


def run_pricing_agent(store_ids=None, offline=False, model=None, data_path=None,
                      save=True, verbose=False) -> list:
    """Run the Pricing AI. Returns a list of chat messages for the Meeting Room."""
    data = load_data(Path(data_path)) if data_path else load_data()
    meta = {k: v for k, v in data.items() if k != "stores"}
    stores = [enrich_store(s) for s in data["stores"]]
    if store_ids:
        stores = [s for s in stores if s["store_id"] in store_ids]
    cfg = load_config()
    summaries = latest_analyst_summaries()

    client = None if offline else make_client()
    model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    run_dir = REPORT_DIR / datetime.now().strftime("pricing_run_%Y%m%d_%H%M%S")
    messages = []

    for store in stores:
        result = propose_for_store(store, cfg)
        if client:
            try:
                text = llm_message(client, model, result, summaries.get(store["store_id"]))
                source = f"llm:{model}"
            except Exception as exc:
                if verbose:
                    print(f"  LLM failed ({type(exc).__name__}: {exc}). Using template message.")
                text, source = offline_message(result), "offline-fallback"
        else:
            text, source = offline_message(result), "offline"

        messages.append({
            "agent": "Pricing AI",
            "store_id": store["store_id"],
            "store_name": store["store_name"],
            "message": text["message"],
            "why": text["why"],
            "source": source,
            "proposals": result["proposals"],
            "headline": [h["product_id"] for h in result["headline"]],
            "currency": meta.get("currency"),
        })
        if save:
            save_progress(run_dir, messages)  # saved after every store
        if verbose:
            print(f"🗨️ Pricing AI: {text['message']}\n   Why: {text['why']}\n")

    if save and verbose:
        print(f"Saved to: {run_dir}")
    return messages


def main() -> int:
    parser = argparse.ArgumentParser(description="Pricing AI")
    parser.add_argument("--offline", action="store_true", help="skip the LLM, use template messages")
    parser.add_argument("--store", help="only this store_id (e.g. S1)")
    parser.add_argument("--model", help="LLM model name")
    parser.add_argument("--data", help="path to retail_data.json")
    parser.add_argument("--table", action="store_true", help="also print the full proposal table")
    args = parser.parse_args()

    if not args.offline and make_client() is None:
        print("OPENAI_API_KEY not set - running in offline mode.\n")
        args.offline = True

    msgs = run_pricing_agent(
        store_ids=[args.store] if args.store else None,
        offline=args.offline, model=args.model, data_path=args.data, verbose=True,
    )
    if args.table:
        for m in msgs:
            print(f"\n{m['store_id']} {m['store_name']}")
            print(
                f"{'Product':26}{'Now':>6}{'New':>6}{'Chg%':>7}"
                f"{'Units→':>14}{'Sellable→':>14}{'ΔProfit':>10}"
                f"{'Cover(d)':>10}{'Risk':>8}  Flag"
            )
            for p in m["proposals"]:
                constrained = p.get("stock_constrained", False)
                final_price = p["current_price"] if constrained else p["proposed_price"]
                chg = 0.0 if constrained else p["price_change_pct"]

                demand = (
                    f"{p['forecast_weekly_units_current_price']:.0f}→"
                    f"{p['forecast_weekly_units_proposed_price']:.0f}"
                )
                sellable = (
                    f"{p.get('sellable_units_current', 0):.0f}→"
                    f"{p.get('sellable_units_proposed', 0):.0f}"
                )

                if constrained:
                    flag = f"HOLD (unmet {p.get('demand_unmet_at_proposed', 0):.0f}u)"
                elif p["stock_risk"] == "HIGH":
                    flag = "URGENT STOCK"
                elif p["stock_risk"] == "MEDIUM":
                    flag = "watch stock"
                else:
                    flag = ""

                print(
                    f"{p['name']:26}{p['current_price']:>6}{final_price:>6}{chg:>7.1f}"
                    f"{demand:>14}{sellable:>14}{p['profit_change']:>10}"
                    f"{str(p['days_of_cover_at_proposed']):>10}{p['stock_risk']:>8}  {flag}"
                )
    return 0

if __name__ == "__main__":
    sys.exit(main())
