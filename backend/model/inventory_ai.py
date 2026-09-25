"""
Inventory AI
============

Consumes:
  - Data Analyst AI output: per-SKU stock + demand data, per store
  - Pricing AI output: per-SKU proposed price changes, per store

Produces:
  - A list of objections (STOCKOUT_RISK / OVERSTOCK / MONITOR)
  - A human-readable message + "why" explanation, in the exact
    format used for store review output.

--------------------------------------------------------------------
INTEGRATION CONTRACT (adjust field names here if your two AIs differ)
--------------------------------------------------------------------

Data Analyst AI is expected to provide, per store, a list of dicts:

    {
        "sku_id": "SKU001",
        "name": "Basmati Rice 5kg",
        "current_stock": 70,
        "incoming_transfer_units": 0,          # optional, default 0
        "baseline_daily_demand": 10,           # normal sell-rate, no promo
        "demand_forecast_units": 152,          # forecast over review_horizon_days,
                                                # ALREADY net of Pricing AI's proposed
                                                # price change (elasticity applied upstream)
        "review_horizon_days": 14,
        "risk_level": "HIGH",                  # optional: LOW / MEDIUM / HIGH
    }

Pricing AI is expected to provide, per store, a list of dicts:

    {
        "sku_id": "SKU001",
        "proposed_price_change_pct": -8.0,     # negative = discount
    }

Only SKUs that appear in Pricing AI's proposal list are evaluated —
Inventory AI's job is to object to (or clear) Pricing AI's proposals,
not to audit every SKU in the store.
"""

from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Thresholds — tune these to match your business rules. These defaults were
# chosen so that:
#   - any SKU with projected unmet demand is always a STOCKOUT_RISK
#   - very high days-cover with no unmet demand is an OVERSTOCK
#   - low-but-not-yet-critical cover with no unmet demand is a MONITOR
# ---------------------------------------------------------------------------
OVERSTOCK_DAYS_COVER_THRESHOLD = 45.0
MONITOR_DAYS_COVER_THRESHOLD = 8.0
HIGH_RISK_LEVELS = {"HIGH"}


@dataclass
class SkuEvaluation:
    sku_id: str
    name: str
    days_cover: float
    unmet_units: int
    risk_level: Optional[str] = None


def _safe_div(a: float, b: float) -> float:
    if not b:
        return float("inf")
    return a / b


def evaluate_sku(data_analyst_record: dict) -> SkuEvaluation:
    """Compute days_cover and unmet_units for one SKU from Data Analyst AI's record."""
    current_stock = data_analyst_record["current_stock"]
    incoming = data_analyst_record.get("incoming_transfer_units", 0)
    baseline_daily_demand = data_analyst_record["baseline_daily_demand"]
    forecast_units = data_analyst_record["demand_forecast_units"]

    days_cover_raw = round(_safe_div(current_stock, baseline_daily_demand), 1)
    days_cover = int(days_cover_raw) if days_cover_raw == int(days_cover_raw) else days_cover_raw
    available = current_stock + incoming
    unmet_units = max(0, round(forecast_units - available))

    return SkuEvaluation(
        sku_id=data_analyst_record["sku_id"],
        name=data_analyst_record["name"],
        days_cover=days_cover,
        unmet_units=unmet_units,
        risk_level=data_analyst_record.get("risk_level"),
    )


def classify_sku(ev: SkuEvaluation) -> Optional[dict]:
    """Turn one SKU evaluation into an objection dict, or None if it's clear."""
    if ev.unmet_units > 0 or ev.risk_level in HIGH_RISK_LEVELS:
        return {
            "type": "STOCKOUT_RISK",
            "sku_id": ev.sku_id,
            "name": ev.name,
            "days_cover": ev.days_cover,
            "unmet_units": ev.unmet_units,
        }
    if ev.days_cover >= OVERSTOCK_DAYS_COVER_THRESHOLD:
        return {
            "type": "OVERSTOCK",
            "sku_id": ev.sku_id,
            "name": ev.name,
            "days_cover": ev.days_cover,
        }
    if ev.days_cover < MONITOR_DAYS_COVER_THRESHOLD:
        return {
            "type": "MONITOR",
            "sku_id": ev.sku_id,
            "name": ev.name,
            "days_cover": ev.days_cover,
        }
    return None


def generate_objections(data_analyst_records: list, pricing_proposals: list):
    """
    Merge Data Analyst AI's records with Pricing AI's proposed SKUs, evaluate each,
    and return (objections, total_skus_checked, all_days_cover).
    """
    proposed_sku_ids = {p["sku_id"] for p in pricing_proposals}
    in_scope = [r for r in data_analyst_records if r["sku_id"] in proposed_sku_ids]

    objections = []
    all_days_cover = []

    for record in in_scope:
        ev = evaluate_sku(record)
        all_days_cover.append(ev.days_cover)
        objection = classify_sku(ev)
        if objection:
            objections.append(objection)

    return objections, len(in_scope), all_days_cover


def offline_message(store_id, store_name, objections, total_skus_checked, all_days_cover=None):
    """Deterministic, no-LLM message builder. Matches the required output format."""
    label = f"{store_id} {store_name}"

    if not objections:
        cover_min = min(all_days_cover)
        cover_max = max(all_days_cover)
        return {
            "message": f"{label}: No objection. Pricing AI's proposals are executable with current stock.",
            "why": f"No SKU is stock-constrained or at HIGH risk. All cover is between {cover_min} and {cover_max} days.",
            "objections": [],
        }

    stockouts = [o for o in objections if o["type"] == "STOCKOUT_RISK"]
    overstocks = [o for o in objections if o["type"] == "OVERSTOCK"]
    monitors = [o for o in objections if o["type"] == "MONITOR"]

    parts = []
    for o in stockouts:
        parts.append(
            f"Objection on {o['name']}: only {o['days_cover']} days cover, "
            f"{o['unmet_units']} units of unmet demand. HOLD price, transfer in."
        )
    for o in overstocks:
        parts.append(
            f"{o['name']} is overstocked at {o['days_cover']} days cover. "
            f"Liquidate or transfer out."
        )
    for o in monitors:
        parts.append(f"{o['name']}: watch stock, {o['days_cover']} days cover.")

    msg = f"{label}: " + " | ".join(parts)
    why = (
        f"Checked {total_skus_checked} SKUs. "
        f"{len(stockouts)} stockout risks, {len(overstocks)} overstock, {len(monitors)} to monitor."
    )
    return {"message": msg, "why": why, "objections": objections}


class InventoryAI:
    """Top-level entry point to wire into your project alongside Data Analyst AI and Pricing AI."""

    def review_store(self, store_id: str, store_name: str,
                      data_analyst_records: list, pricing_proposals: list) -> dict:
        objections, total_checked, all_days_cover = generate_objections(
            data_analyst_records, pricing_proposals
        )
        return offline_message(store_id, store_name, objections, total_checked, all_days_cover)


# ---------------------------------------------------------------------------
# Demo / self-test — reproduces the required S1 and S2 output from raw
# Data Analyst AI + Pricing AI records, not hand-typed objections.
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    inventory_ai = InventoryAI()

    s1_data_analyst = [
        {"sku_id": "SKU001", "name": "Basmati Rice 5kg", "current_stock": 70,
         "baseline_daily_demand": 10, "demand_forecast_units": 152, "review_horizon_days": 14},
        {"sku_id": "SKU002", "name": "Festive Sweet Box 500g", "current_stock": 120,
         "baseline_daily_demand": 25, "demand_forecast_units": 138, "review_horizon_days": 14},
        {"sku_id": "SKU003", "name": "LED String Lights", "current_stock": 30,
         "baseline_daily_demand": 12, "demand_forecast_units": 74, "review_horizon_days": 14},
        {"sku_id": "SKU004", "name": "Diwali Diyas Pack", "current_stock": 200,
         "baseline_daily_demand": 10, "demand_forecast_units": 190, "review_horizon_days": 14},
    ]
    s1_pricing = [
        {"sku_id": "SKU001", "proposed_price_change_pct": -8.0},
        {"sku_id": "SKU002", "proposed_price_change_pct": -10.0},
        {"sku_id": "SKU003", "proposed_price_change_pct": -15.0},
        {"sku_id": "SKU004", "proposed_price_change_pct": -5.0},
    ]

    result_s1 = inventory_ai.review_store("S1", "Coimbatore Central", s1_data_analyst, s1_pricing)
    print("🗨️ Inventory AI:", result_s1["message"])
    print("   Why:", result_s1["why"])
    print()

    s2_data_analyst = [
        {"sku_id": "SKU101", "name": "Steel Water Bottle", "current_stock": 99,
         "baseline_daily_demand": 10, "demand_forecast_units": 90, "review_horizon_days": 9},
        {"sku_id": "SKU102", "name": "Kids Backpack", "current_stock": 124,
         "baseline_daily_demand": 10, "demand_forecast_units": 100, "review_horizon_days": 10},
        {"sku_id": "SKU103", "name": "Ceramic Dinner Set", "current_stock": 211,
         "baseline_daily_demand": 10, "demand_forecast_units": 180, "review_horizon_days": 10},
        {"sku_id": "SKU104", "name": "Cotton Bedsheet Set", "current_stock": 150,
         "baseline_daily_demand": 10, "demand_forecast_units": 140, "review_horizon_days": 10},
    ]
    s2_pricing = [
        {"sku_id": "SKU101", "proposed_price_change_pct": -5.0},
        {"sku_id": "SKU102", "proposed_price_change_pct": -5.0},
        {"sku_id": "SKU103", "proposed_price_change_pct": -5.0},
        {"sku_id": "SKU104", "proposed_price_change_pct": -5.0},
    ]

    result_s2 = inventory_ai.review_store("S2", "Tiruppur Mall", s2_data_analyst, s2_pricing)
    print("🗨️ Inventory AI:", result_s2["message"])
    print("   Why:", result_s2["why"])
