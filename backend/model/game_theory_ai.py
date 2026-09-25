"""
Game Theory AI (Competitor Retaliation)
=======================================
Simulates whether a competitor will retaliate to our price drops.
"""

def check_competitor(product: dict, pricing_proposal: dict, cfg: dict) -> dict:
    sku = product["product_id"]
    p_cfg = cfg["products"][sku]
    
    comp_price = product.get("competitor_price", 0)
    new_price = pricing_proposal.get("new_price", 0)
    retaliation_prob = p_cfg.get("competitor_retaliation_prob", 0)
    
    flag = False
    risk = "none"
    recommendation = ""
    
    # If we dropped below the competitor and they have a high retaliation probability
    if new_price < comp_price and retaliation_prob > 0.5:
        flag = True
        risk = "price_war"
        recommendation = f"Competitor has a {retaliation_prob*100}% chance of matching this price drop within 24 hours. Projected volume gains are unlikely to materialize long-term. Recommend HOLD."
        
    return {
        "flag": flag,
        "risk": risk,
        "recommendation": recommendation
    }

def review_store_competition(store: dict, pricing_proposals: dict, cfg: dict) -> dict:
    results = {}
    for product in store["products"]:
        sku = product["product_id"]
        results[sku] = check_competitor(product, pricing_proposals.get(sku, {}), cfg)
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
        
    store = data["stores"][1] # Tiruppur Mall (S2) has a good fire sale example
    
    # We need pricing proposals to feed into game theory AI
    pricing = propose_for_store(store, cfg)
    
    # We will fake a pricing drop for P2 to trigger retaliation
    pricing["P2"]["new_price"] = 150 # Drop below competitor
    pricing["P2"]["action"] = "decrease"
    
    results = review_store_competition(store, pricing, cfg)
    
    print("==================================================")
    print(f"GAME THEORY AI: SIMPLE SUMMARY")
    print(f"Store: {store['store_name']}")
    print("==================================================\n")
    
    for sku, p_data in results.items():
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        
        status = f"WARNING: PRICE WAR RISK" if p_data["flag"] else "SAFE: Low Retaliation Risk"
        print(f"[+] {product_name}: {status}")
        if p_data["flag"]:
            print(f"    -> Recommendation: {p_data['recommendation']}\n")
        else:
            print("")
