"""
Spoilage AI
===========
Checks batch expiry dates (mocked via inventory turnover).
Forces fire-sales on perishables if stock outlasts expiry.
"""

def check_spoilage(product: dict, pricing_proposal: dict, cfg: dict) -> dict:
    sku = product["product_id"]
    p_cfg = cfg["products"][sku]
    
    expiry_days = p_cfg["expiry_days_avg"]
    stock = product.get("stock_level", 0)
    demanded_volume = pricing_proposal.get("expected_volume", 0)
    
    daily_demand = demanded_volume / 7 if demanded_volume > 0 else 0
    days_to_sell_out = stock / daily_demand if daily_demand > 0 else 999
    
    if days_to_sell_out > expiry_days:
        # We will spoil! Force a fire sale.
        units_to_spoil = stock - (daily_demand * expiry_days)
        return {
            "flag": True,
            "risk": "spoilage",
            "units_at_risk": round(units_to_spoil),
            "recommendation": f"FIRE SALE REQUIRED. {round(units_to_spoil)} units will expire before sold at current velocity.",
            "constraint": {"max_price": p_cfg["cost_price"]} # force selling at cost to liquidate
        }
    
    return {
        "flag": False,
        "risk": "none"
    }

def review_store_spoilage(store: dict, pricing_proposals: dict, cfg: dict) -> dict:
    results = {}
    for product in store["products"]:
        sku = product["product_id"]
        results[sku] = check_spoilage(product, pricing_proposals.get(sku, {}), cfg)
    return results

if __name__ == "__main__":
    import json
    from pathlib import Path
    from pricing_ai import propose_for_store
    
    base_dir = Path(__file__).resolve().parent.parent
    with open(base_dir / "data" / "retail_data.json", "r") as f:
        data = json.load(f)
    with open(base_dir / "data" / "pricing_config.json", "r") as f:
        cfg = json.load(f)
        
    store = data["stores"][1] # Tiruppur Mall (S2) has a spoilage example
    
    pricing = propose_for_store(store, cfg)
    results = review_store_spoilage(store, pricing, cfg)
    
    print("==================================================")
    print(f"SPOILAGE AI: SIMPLE SUMMARY")
    print(f"Store: {store['store_name']}")
    print("==================================================\n")
    
    for sku, p_data in results.items():
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        
        status = f"CRITICAL: SPOILAGE RISK" if p_data["flag"] else "SAFE: No Expiry Risk"
        print(f"[+] {product_name}: {status}")
        if p_data["flag"]:
            print(f"    -> Issue: {p_data['units_at_risk']} units at risk of expiring")
            print(f"    -> Recommendation: {p_data['recommendation']}\n")
        else:
            print("")
