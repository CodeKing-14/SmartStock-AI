import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

MODEL_DIR = Path(__file__).resolve().parent / "model"
DATA_DIR = Path(__file__).resolve().parent / "data"
RESULTS_DIR = Path(__file__).resolve().parent / "results"

if str(MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(MODEL_DIR))

from data_analyst_ai import analyze_store
from pricing_ai import propose_for_store
from inventory_ai import review_store
from logistics_ai import solve_transfers
from spoilage_ai import review_store_spoilage
from basket_ai import analyze_basket
from game_theory_ai import review_store_competition

def boss_ai_offline(store: dict, analyst_output: dict, pricing_output: dict, 
                    inventory_output: dict, spoilage_output: dict, 
                    basket_output: dict, game_theory_output: dict, 
                    transfers: list, meta: dict, negotiation_history: list) -> str:
    """Synthesizes the 7 agents' outputs into a markdown report for a store."""
    lines = []
    lines.append(f"## 📊 FINAL RECOMMENDATION — {store['store_name']} ({store['store_id']})")
    lines.append("")

    if negotiation_history:
        lines.append("### BOSS AI (Negotiation Summary)")
        for h in negotiation_history:
            lines.append(f"- **{h['sku']}**: {h['reason']}")
        lines.append("")

    lines.append("### DATA ANALYST (Factual Summary)")
    for sku, data in analyst_output.items():
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        lines.append(f"**{product_name}**: {data['summary']} *(Confidence: {data['confidence']})*")
    lines.append("")

    lines.append("### PRICING AI (Recommendations)")
    for sku, data in pricing_output.items():
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        if data["action"] == "hold":
            lines.append(f"**{product_name}**: HOLD at ₹{data['new_price']}. {data['reasoning']}")
        else:
            direction = "INCREASE" if data["action"] == "increase" else "DECREASE"
            lines.append(f"**{product_name}**: {direction} by {data['percentage']}% to ₹{data['new_price']}. Expected Vol: {data['expected_volume']}. {data['reasoning']}")
    lines.append("")

    lines.append("### VALIDATION AGENTS (Risk Flags)")
    flags_found = False
    
    for sku in [p["product_id"] for p in store["products"]]:
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        
        # Inventory AI
        if inventory_output.get(sku, {}).get("flag"):
            flags_found = True
            risk = inventory_output[sku]["risk"].upper()
            lines.append(f"⚠️ **{product_name}** (Inventory AI): {risk} RISK (in {inventory_output[sku]['days_until_issue']} days). {inventory_output[sku]['recommendation']}")
            
        # Spoilage AI
        if spoilage_output.get(sku, {}).get("flag"):
            flags_found = True
            lines.append(f"☣️ **{product_name}** (Spoilage AI): SPOILAGE RISK. {spoilage_output[sku]['recommendation']}")

        # Basket AI
        if basket_output.get(sku, {}).get("flag"):
            flags_found = True
            lines.append(f"🛒 **{product_name}** (Basket AI): CANNIBALIZATION RISK. {basket_output[sku]['recommendation']}")

        # Game Theory AI
        if game_theory_output.get(sku, {}).get("flag"):
            flags_found = True
            lines.append(f"⚔️ **{product_name}** (Game Theory AI): RETALIATION RISK. {game_theory_output[sku]['recommendation']}")

    if not flags_found:
        lines.append("✅ No risks flagged by Validation Agents for proposed pricing.")
    lines.append("")

    lines.append("### LOGISTICS AI (Transfers)")
    store_transfers = [t for t in transfers if t["to_store"] == store["store_id"] or t["from_store"] == store["store_id"]]
    if not store_transfers:
        lines.append("No transfers relevant to this store.")
    else:
        for t in store_transfers:
            product_name = next(p["name"] for p in store["products"] if p["product_id"] == t["sku"])
            if t["to_store"] == store["store_id"]:
                lines.append(f"🚛 **INCOMING**: Receive {t['qty']} units of {product_name} from Store {t['from_store']}. Cost: ₹{t['transfer_cost']}, ROI: {t['roi_percent']}%")
            else:
                lines.append(f"🚛 **OUTGOING**: Send {t['qty']} units of {product_name} to Store {t['to_store']}.")
    lines.append("")
    
    return "\n".join(lines)


def run_pipeline(retail_data: dict,
                 pricing_config: Optional[dict] = None,
                 logistics_data: Optional[dict] = None,
                 use_llm: bool = False) -> dict:
                 
    if pricing_config is None:
        with open(DATA_DIR / "pricing_config.json", "r", encoding="utf-8", errors="replace") as f:
            pricing_config = json.load(f)

    if logistics_data is None:
        with open(DATA_DIR / "logistics_data.json", "r", encoding="utf-8", errors="replace") as f:
            logistics_data = json.load(f)

    meta = {k: v for k, v in retail_data.items() if k != "stores"}
    stores = retail_data["stores"]
    
    all_results = {}
    inventory_results_network = {}
    pricing_results_network = {}

    for store in stores:
        store_id = store["store_id"]
        
        # 1. Analyst runs once
        analyst_output = analyze_store(store, meta)
        
        # 2. Iterative Negotiation Loop (Boss AI coordinating)
        negotiation_history = []
        constraints_map = {}
        
        # Pass 1: Unconstrained Pricing
        pricing_output = propose_for_store(store, pricing_config, constraints_map)
        
        inventory_output = review_store(store, pricing_output)
        spoilage_output = review_store_spoilage(store, pricing_output, pricing_config)
        
        recalculate = False
        
        # Check if constraints need to be enforced by Boss AI
        for sku in [p["product_id"] for p in store["products"]]:
            inv = inventory_output.get(sku, {})
            spoil = spoilage_output.get(sku, {})
            
            sku_constraints = {}
            if inv.get("flag") and inv.get("risk") == "stockout":
                # Cap volume to what we can fulfill over lead time
                sku_constraints["volume_cap"] = inv["current_inventory"]
                negotiation_history.append({"sku": sku, "reason": f"Boss AI forced volume cap of {inv['current_inventory']} due to Stockout risk."})
                recalculate = True
                
            if spoil.get("flag"):
                # Force fire sale cap
                sku_constraints["max_price"] = spoil["constraint"]["max_price"]
                negotiation_history.append({"sku": sku, "reason": f"Boss AI forced max_price of ₹{spoil['constraint']['max_price']} due to Spoilage risk."})
                recalculate = True
                
            if sku_constraints:
                constraints_map[sku] = sku_constraints

        # Pass 2: Constrained Pricing (if needed)
        if recalculate:
            pricing_output = propose_for_store(store, pricing_config, constraints_map)
            # Re-run validations on new prices
            inventory_output = review_store(store, pricing_output)
            spoilage_output = review_store_spoilage(store, pricing_output, pricing_config)
            
        # 3. Final Checks (Basket & Game Theory - these flag warnings but don't force constraints mechanically yet)
        basket_output = analyze_basket(store, pricing_output, pricing_config)
        game_theory_output = review_store_competition(store, pricing_output, pricing_config)
        
        all_results[store_id] = {
            "store": store,
            "analyst": analyst_output,
            "pricing": pricing_output,
            "inventory": inventory_output,
            "spoilage": spoilage_output,
            "basket": basket_output,
            "game_theory": game_theory_output,
            "negotiation_history": negotiation_history
        }
        
        inventory_results_network[store_id] = inventory_output
        pricing_results_network[store_id] = pricing_output

    # Run Logistics on the whole network
    logistics_output = solve_transfers(retail_data, inventory_results_network, logistics_data, pricing_results_network)
    transfers = logistics_output.get("transfers", [])

    # Synthesize Final Reports
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    report_lines = [
        f"# SmartStock AI — Executive Summary",
        f"**Chain:** {meta.get('chain_name', 'N/A')}",
        f"**Generated:** {timestamp}",
        "", "---", ""
    ]

    for store_id, r in all_results.items():
        boss_md = boss_ai_offline(
            r["store"], r["analyst"], r["pricing"], r["inventory"], 
            r["spoilage"], r["basket"], r["game_theory"], transfers, meta, r["negotiation_history"]
        )
        r["boss_md"] = boss_md
        report_lines.append(boss_md)
        report_lines.append("---")
        report_lines.append("")

    # Global Logistics Summary
    report_lines.append("## 🚛 GLOBAL LOGISTICS SUMMARY")
    if transfers:
        report_lines.append(f"**Total Transfers:** {len(transfers)}")
        report_lines.append(f"**Total Cost:** ₹{logistics_output['total_cost']}")
        report_lines.append(f"**Total Profit Saved (ROI):** ₹{logistics_output['total_roi']}")
        for t in transfers:
             report_lines.append(f"- Move {t['qty']}x {t['sku']} from Store {t['from_store']} to Store {t['to_store']} (ROI: {t['roi_percent']}%)")
    else:
        report_lines.append("No profitable transfers found.")
    report_lines.append("")

    report_md = "\n".join(report_lines)

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    result_path = RESULTS_DIR / f"analysis_{run_id}.md"
    result_path.write_text(report_md, encoding="utf-8")

    json_path = RESULTS_DIR / f"analysis_{run_id}.json"
    json_path.write_text(
        json.dumps({
            "meta": meta,
            "timestamp": timestamp,
            "run_id": run_id,
            "stores": all_results,
            "logistics": logistics_output,
        }, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8"
    )

    return {
        "run_id": run_id,
        "timestamp": timestamp,
        "meta": meta,
        "stores": all_results,
        "logistics_global": logistics_output,
        "report_md": report_md,
        "report_markdown": report_md,
        "files": {
            "markdown": str(result_path),
            "json": str(json_path),
        },
    }
