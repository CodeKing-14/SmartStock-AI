"""
Inventory AI
============
Checks Pricing AI. Flags stockout/overstock risk.
"""

import json

def check_inventory(product: dict, pricing_proposal: dict) -> dict:
    current_inventory = product.get("stock_level", 0)
    demanded_volume = pricing_proposal.get("expected_volume", 0)
    
    # Assume 1 week horizon for the demanded volume since pricing AI outputs weekly volume
    daily_demand = demanded_volume / 7 if demanded_volume > 0 else 0
    
    # Mock lead time for demonstration (e.g., 7 days)
    lead_time = 7
    
    days_until_issue = round(current_inventory / daily_demand) if daily_demand > 0 else 999
    
    flag = False
    risk = "none"
    recommendation = "Inventory levels are sufficient for proposed pricing"
    confidence = 0.95
    
    if days_until_issue < lead_time:
        flag = True
        risk = "stockout"
        recommendation = "Don't implement price change until restock arrives or transfer is completed"
        confidence = 0.94
    elif days_until_issue > 30: # Overstock
        flag = True
        risk = "overstock"
        recommendation = "Consider further price reductions to liquidate excess inventory"
        confidence = 0.88

    return {
        "risk": risk,
        "flag": flag,
        "days_until_issue": days_until_issue,
        "current_inventory": current_inventory,
        "demanded_volume": demanded_volume,
        "lead_time": lead_time,
        "recommendation": recommendation,
        "confidence": confidence
    }

def review_store(store: dict, pricing_proposals: dict) -> dict:
    results = {}
    for product in store["products"]:
        sku = product["product_id"]
        pricing_prop = pricing_proposals.get(sku, {})
        results[sku] = check_inventory(product, pricing_prop)
    return results
