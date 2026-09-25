"""
SmartStock AI Pipeline Orchestrator
====================================
Wires all 5 AI agents in sequence:
  Data Analyst → Pricing → Inventory → Logistics → Boss AI

Accepts uploaded retail_data.json (and optional pricing_config / logistics_data),
runs the full pipeline, and returns structured results + saves a markdown report.
"""

import json
import os
import sys
import math
from datetime import datetime
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
MODEL_DIR = Path(__file__).resolve().parent / "model"
DATA_DIR = Path(__file__).resolve().parent / "data"
RESULTS_DIR = Path(__file__).resolve().parent / "results"

# Add model dir to sys.path so we can import the agent modules
if str(MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(MODEL_DIR))

from data_analyst_ai import enrich_store, SYSTEM_PROMPT as ANALYST_SYSTEM_PROMPT
from data_analyst_ai import analyze_store_offline, make_client
from pricing_ai import propose_for_store, load_config, offline_message as pricing_offline_message
from inventory_ai import InventoryAI
from logistics_ai import LogisticsAI


# ---------------------------------------------------------------------------
# Boss AI (Agent #5) — synthesizes all agent outputs into a final report
# ---------------------------------------------------------------------------
BOSS_SYSTEM_PROMPT = (
    "You are Boss AI — the chief decision-maker for a retail chain. "
    "You receive analysis from four specialized AI agents:\n"
    "1. Data Analyst AI: factual observations about sales, stock, competitor pricing.\n"
    "2. Pricing AI: recommended price changes with profit/demand projections.\n"
    "3. Inventory AI: stock risk objections (stockout, overstock, monitor).\n"
    "4. Logistics AI: inter-store transfer recommendations.\n\n"
    "Your job is to synthesize these into a FINAL RECOMMENDATION for each store. "
    "Structure your output with clear sections:\n"
    "- RECOMMENDATION (what to do)\n"
    "- WHY (key reasons, numbered)\n"
    "- INVENTORY ACTION (transfers, if any)\n"
    "- RISKS (what could go wrong)\n"
    "- CONFIDENCE (your confidence level as a percentage)\n\n"
    "Be decisive, concise, and quote exact numbers from the agent outputs. "
    "Do not invent or recalculate numbers."
)


def boss_ai_offline(analyst_output: str, pricing_output: dict,
                    inventory_output: dict, logistics_output: list,
                    store: dict, meta: dict) -> str:
    """Deterministic Boss AI summary when no LLM is available."""
    currency = meta.get("currency", "INR")
    lines = []
    lines.append(f"## 📊 FINAL RECOMMENDATION — {store['store_name']} ({store['store_id']})")
    lines.append("")

    # --- Recommendation from Pricing ---
    lines.append("### RECOMMENDATION")
    proposals = pricing_output.get("proposals", [])
    actionable = [p for p in proposals if p["action"] != "hold"]
    if actionable:
        for p in actionable:
            direction = "Reduce" if p["action"] == "cut" else "Increase"
            lines.append(
                f"- **{p['name']}**: {direction} price from ₹{p['current_price']} "
                f"→ ₹{p['proposed_price']} ({p['price_change_pct']:+.1f}%)"
            )
    else:
        lines.append("- Hold all current prices this week.")
    lines.append("")

    # --- Why ---
    lines.append("### WHY")
    reason_num = 1
    for p in proposals:
        if p.get("reason_codes"):
            for code in p["reason_codes"]:
                readable = code.replace("_", " ").title()
                lines.append(f"{reason_num}. {p['name']}: {readable}")
                reason_num += 1
    if reason_num == 1:
        lines.append("1. Current prices are optimal under margin and competitor constraints.")
    lines.append("")

    # --- Data Analyst summary ---
    lines.append("### DATA ANALYSIS")
    lines.append(analyst_output)
    lines.append("")

    # --- Pricing details ---
    lines.append("### PRICING DETAILS")
    for p in proposals:
        stock_flag = f" ⚠️ Stock risk: {p['stock_risk']}" if p.get("stock_risk") in ("MEDIUM", "HIGH") else ""
        constrained_flag = " 🚫 STOCK CONSTRAINED" if p.get("stock_constrained") else ""
        lines.append(
            f"- **{p['name']}**: ₹{p['current_price']} → ₹{p['proposed_price']} | "
            f"Units: {p['forecast_weekly_units_current_price']:.0f} → {p['forecast_weekly_units_proposed_price']:.0f} | "
            f"Profit Δ: {'+' if p['profit_change'] >= 0 else ''}₹{p['profit_change']:,} | "
            f"Margin: {p['margin_pct_at_proposed']}% | "
            f"Competitor: ₹{p['competitor_price']}"
            f"{stock_flag}{constrained_flag}"
        )
    lines.append("")

    # --- Inventory objections ---
    lines.append("### INVENTORY STATUS")
    if inventory_output.get("objections"):
        for obj in inventory_output["objections"]:
            if obj["type"] == "STOCKOUT_RISK":
                lines.append(
                    f"- ⚠️ **{obj['name']}**: STOCKOUT RISK — "
                    f"{obj['days_cover']} days cover, {obj['unmet_units']} units unmet demand"
                )
            elif obj["type"] == "OVERSTOCK":
                lines.append(
                    f"- 📦 **{obj['name']}**: OVERSTOCK — {obj['days_cover']} days cover"
                )
            elif obj["type"] == "MONITOR":
                lines.append(
                    f"- 👁️ **{obj['name']}**: MONITOR — {obj['days_cover']} days cover"
                )
    else:
        lines.append("- ✅ No stock objections. All pricing proposals are executable.")
    lines.append("")

    # --- Logistics ---
    lines.append("### LOGISTICS / TRANSFERS")
    if logistics_output:
        for rec in logistics_output:
            lines.append(f"- {rec}")
    else:
        lines.append("- No inter-store transfers recommended at this time.")
    lines.append("")

    # --- Risks ---
    lines.append("### RISKS")
    risks = []
    for p in proposals:
        if p.get("stock_constrained"):
            risks.append(f"- {p['name']}: Demand ({p['forecast_weekly_units_proposed_price']:.0f} units) exceeds stock ({p['stock_level']} units)")
        if p.get("stock_risk") == "HIGH":
            risks.append(f"- {p['name']}: HIGH stock risk — only {p.get('days_of_cover_at_proposed')} days cover")
        if p.get("stock_risk") == "MEDIUM":
            risks.append(f"- {p['name']}: MEDIUM stock risk — only {p.get('days_of_cover_at_proposed')} days cover")
    if store.get("festival_in_3_days"):
        risks.append(f"- Festival ({store.get('festival_name', 'upcoming')}) in 3 days may cause demand surge beyond predictions")
    if not risks:
        risks.append("- Low risk scenario. Monitor competitor responses.")
    lines.extend(risks)
    lines.append("")

    # --- Confidence ---
    high_risk_count = sum(1 for p in proposals if p.get("stock_risk") in ("MEDIUM", "HIGH"))
    constrained_count = sum(1 for p in proposals if p.get("stock_constrained"))
    confidence = max(55, 90 - high_risk_count * 10 - constrained_count * 8)
    lines.append(f"### CONFIDENCE: {confidence}%")
    lines.append("")

    return "\n".join(lines)


def boss_ai_llm(client, model: str, analyst_output: str, pricing_output: dict,
                inventory_output: dict, logistics_output: list,
                store: dict, meta: dict) -> str:
    """Use LLM to generate the Boss AI synthesis."""
    payload = {
        "store": f"{store['store_id']} {store['store_name']}",
        "festival_in_3_days": store.get("festival_in_3_days", False),
        "festival_name": store.get("festival_name"),
        "currency": meta.get("currency", "INR"),
        "data_analyst_summary": analyst_output,
        "pricing_proposals": pricing_output.get("proposals", []),
        "pricing_message": pricing_output.get("message", ""),
        "inventory_status": inventory_output,
        "logistics_recommendations": logistics_output,
    }
    resp = client.chat.completions.create(
        model=model,
        temperature=0.3,
        messages=[
            {"role": "system", "content": BOSS_SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False, default=str)},
        ],
    )
    return resp.choices[0].message.content.strip()


# ---------------------------------------------------------------------------
# Pipeline: bridges the different agent data formats
# ---------------------------------------------------------------------------
def _build_inventory_records(store: dict, pricing_proposals: list) -> tuple:
    """
    Bridge: convert the enriched store data + pricing proposals
    into the format that InventoryAI.review_store() expects.
    """
    data_analyst_records = []
    pricing_ai_proposals = []

    for product in store["products"]:
        daily_rate = product["sales_this_week"] / 7
        forecast_horizon = 14  # 2 weeks
        forecast_units = daily_rate * forecast_horizon

        # Find matching pricing proposal
        matching_proposal = None
        for p in pricing_proposals:
            if p["product_id"] == product["product_id"]:
                matching_proposal = p
                break

        # If pricing proposes a cut, demand may increase — apply a rough multiplier
        price_change_pct = matching_proposal["price_change_pct"] if matching_proposal else 0
        if price_change_pct < 0:
            # Negative price change → demand increase (rough estimate)
            demand_multiplier = 1 + abs(price_change_pct) / 100 * 2
            forecast_units *= demand_multiplier

        risk_level = "LOW"
        if matching_proposal and matching_proposal.get("stock_risk") == "HIGH":
            risk_level = "HIGH"
        elif matching_proposal and matching_proposal.get("stock_risk") == "MEDIUM":
            risk_level = "MEDIUM"

        data_analyst_records.append({
            "sku_id": product["product_id"],
            "name": product["name"],
            "current_stock": product["stock_level"],
            "incoming_transfer_units": 0,
            "baseline_daily_demand": round(daily_rate, 1),
            "demand_forecast_units": round(forecast_units, 1),
            "review_horizon_days": forecast_horizon,
            "risk_level": risk_level,
        })

        pricing_ai_proposals.append({
            "sku_id": product["product_id"],
            "proposed_price_change_pct": price_change_pct,
        })

    return data_analyst_records, pricing_ai_proposals


def run_pipeline(retail_data: dict,
                 pricing_config: Optional[dict] = None,
                 logistics_data: Optional[dict] = None,
                 use_llm: bool = False) -> dict:
    """
    Run the full SmartStock AI pipeline on the provided data.

    Returns a dict with per-store results and a combined report.
    """
    # Load defaults if not provided
    if pricing_config is None:
        with open(DATA_DIR / "pricing_config.json", "r", encoding="utf-8") as f:
            pricing_config = json.load(f)

    if logistics_data is None:
        with open(DATA_DIR / "logistics_data.json", "r", encoding="utf-8") as f:
            logistics_data = json.load(f)

    meta = {k: v for k, v in retail_data.items() if k != "stores"}
    stores = [enrich_store(s) for s in retail_data["stores"]]

    # Optionally create LLM client
    client = None
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if use_llm:
        client = make_client()
        if client is None:
            print("⚠️ OPENAI_API_KEY not set — running in offline mode.")

    # --- Run Logistics AI (uses its own data format) ---
    logistics_engine = LogisticsAI(logistics_data)
    logistics_results_raw = logistics_engine.recommend()
    logistics_messages = [rec.message() for rec in logistics_results_raw]

    # --- Per-store pipeline ---
    all_results = {}
    inventory_ai = InventoryAI()

    for store in stores:
        store_id = store["store_id"]
        store_name = store["store_name"]

        # 1. Data Analyst AI
        analyst_output = analyze_store_offline(store, meta)

        # 2. Pricing AI
        pricing_result = propose_for_store(store, pricing_config)
        pricing_text = pricing_offline_message(pricing_result)

        # 3. Inventory AI — bridge data formats
        inv_records, inv_pricing = _build_inventory_records(store, pricing_result["proposals"])
        inventory_result = inventory_ai.review_store(
            store_id, store_name, inv_records, inv_pricing
        )

        # 4. Filter logistics messages relevant to this store
        store_logistics = [
            msg for msg in logistics_messages
            if f"Store {store_id}" in msg
        ]

        # 5. Boss AI — synthesize everything
        if client:
            try:
                boss_output = boss_ai_llm(
                    client, model, analyst_output, pricing_result,
                    inventory_result, store_logistics, store, meta
                )
                boss_source = f"llm:{model}"
            except Exception as exc:
                print(f"  Boss AI LLM failed ({type(exc).__name__}: {exc}). Using offline.")
                boss_output = boss_ai_offline(
                    analyst_output, pricing_result,
                    inventory_result, store_logistics, store, meta
                )
                boss_source = "offline-fallback"
        else:
            boss_output = boss_ai_offline(
                analyst_output, pricing_result,
                inventory_result, store_logistics, store, meta
            )
            boss_source = "offline"

        all_results[store_id] = {
            "store_id": store_id,
            "store_name": store_name,
            "data_analyst": {
                "summary": analyst_output,
                "source": "offline",
            },
            "pricing": {
                "message": pricing_text["message"],
                "why": pricing_text["why"],
                "proposals": pricing_result["proposals"],
                "headline": pricing_result["headline"],
                "source": "engine",
            },
            "inventory": inventory_result,
            "logistics": store_logistics,
            "boss": {
                "recommendation": boss_output,
                "source": boss_source,
            },
        }

    # Build combined report
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    report_lines = [
        f"# SmartStock AI — Full Analysis Report",
        f"**Chain:** {meta.get('chain_name', 'N/A')}",
        f"**Period:** {meta.get('week_label', 'N/A')}",
        f"**Currency:** {meta.get('currency', 'INR')}",
        f"**Generated:** {timestamp}",
        "",
        "---",
        "",
    ]

    for store_id, result in all_results.items():
        report_lines.append(result["boss"]["recommendation"])
        report_lines.append("")
        report_lines.append("---")
        report_lines.append("")

    # Global logistics section
    report_lines.append("## 🚛 GLOBAL LOGISTICS RECOMMENDATIONS")
    report_lines.append("")
    if logistics_messages:
        for msg in logistics_messages:
            report_lines.append(f"- {msg}")
    else:
        report_lines.append("- No inter-store transfers recommended.")
    report_lines.append("")

    report_md = "\n".join(report_lines)

    # Save to results folder
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    result_filename = f"analysis_{run_id}.md"
    result_path = RESULTS_DIR / result_filename
    result_path.write_text(report_md, encoding="utf-8")

    # Also save the raw JSON
    json_filename = f"analysis_{run_id}.json"
    json_path = RESULTS_DIR / json_filename
    json_path.write_text(
        json.dumps({
            "meta": meta,
            "timestamp": timestamp,
            "run_id": run_id,
            "stores": all_results,
            "logistics_global": logistics_messages,
        }, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8"
    )

    return {
        "run_id": run_id,
        "timestamp": timestamp,
        "meta": meta,
        "stores": all_results,
        "logistics_global": logistics_messages,
        "report_md": report_md,
        "files": {
            "markdown": str(result_path),
            "json": str(json_path),
        },
    }
