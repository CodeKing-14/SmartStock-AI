"""
Pricing AI
==========
Decides: price up, down, or hold. Maximizes profit.
"""

import json
import math
from pathlib import Path

def _competitor_factor(price: float, comp: float, tol: float, k: float) -> float:
    gap = (price - comp) / comp
    return max(0.2, 1 - k * max(0.0, gap - tol))

def forecast_demand(price: float, p0: float, base: float, comp: float, elasticity: float, g: dict) -> float:
    own = (price / p0) ** elasticity if p0 > 0 else 1.0
    tol = g["competitor_tolerance_pct"] / 100
    k = g["competitor_sensitivity"]
    comp_ratio = _competitor_factor(price, comp, tol, k) / _competitor_factor(p0, comp, tol, k)
    return base * own * comp_ratio

def evaluate_price(price: float, p0: float, cost: float, base: float, comp: float, e: float, g: dict):
    demand = forecast_demand(price, p0, base, comp, e, g)
    profit = (price - cost) * demand
    return demand, profit

def price_product(product: dict, store: dict, cfg: dict) -> dict:
    g = cfg["global"]
    pc = cfg["products"][product["product_id"]]
    p0, comp, cost = product["our_price"], product["competitor_price"], pc["cost_price"]
    
    uplift = pc["festival_uplift"] if store.get("festival_in_3_days") else 1.0
    base = product["sales_this_week"] * uplift
    e = pc["elasticity"]

    margin_floor = math.ceil(cost * (1 + g["min_margin_pct"] / 100))
    lo = max(margin_floor, math.ceil(p0 * (1 - g["max_weekly_change_pct"] / 100)))
    hi = max(math.floor(p0 * (1 + g["max_weekly_change_pct"] / 100)), lo)

    best_price = p0
    best_profit = -float('inf')
    best_demand = 0

    for price in range(lo, hi + 1):
        demand, profit = evaluate_price(price, p0, cost, base, comp, e, g)
        if profit > best_profit:
            best_profit = profit
            best_price = price
            best_demand = demand

    # Construct the exact output format required
    if best_price > p0:
        action = "increase"
    elif best_price < p0:
        action = "decrease"
    else:
        action = "hold"

    percentage = round(((best_price - p0) / p0) * 100, 1) if p0 > 0 else 0
    
    reasons = []
    if uplift > 1.0:
        reasons.append("Festival demand spike absorbs price changes")
    if best_price < comp and p0 >= comp:
        reasons.append("Undercutting competitor to gain volume")
    if action == "hold":
        reasons.append("Current price already maximizes expected profit")

    reasoning = ". ".join(reasons) if reasons else "Calculated maximum profit point based on elasticity"
    
    confidence = 0.85 if uplift == 1.0 else 0.72  # Lower confidence if forecasting festival spike
    risk = "If festival is weaker than expected, demand may not hit projections" if uplift > 1.0 else "Competitor may react to price changes"

    return {
        "action": action,
        "percentage": percentage,
        "new_price": best_price,
        "expected_volume": round(best_demand),
        "expected_weekly_profit": round(best_profit),
        "reasoning": reasoning,
        "confidence": confidence,
        "risk": risk
    }

def propose_for_store(store: dict, cfg: dict) -> dict:
    results = {}
    for product in store["products"]:
        results[product["product_id"]] = price_product(product, store, cfg)
    return results

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    data_file = base_dir / "data" / "retail_data.json"
    cfg_file = base_dir / "data" / "pricing_config.json"
    
    with open(data_file, "r") as f:
        data = json.load(f)
    with open(cfg_file, "r") as f:
        cfg = json.load(f)
        
    store = data["stores"][0]
    print(json.dumps(propose_for_store(store, cfg), indent=2))
