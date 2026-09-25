"""
Basket AI (Cross-Product Interaction)
=====================================
Analyzes cannibalization and complementary effects.
"""

def analyze_basket(store: dict, pricing_proposals: dict, cfg: dict) -> dict:
    results = {}
    
    # Group products by category
    categories = {}
    for p in store["products"]:
        sku = p["product_id"]
        cat = cfg["products"][sku]["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(p)
        
    for p in store["products"]:
        sku = p["product_id"]
        cat = cfg["products"][sku]["category"]
        prop = pricing_proposals.get(sku, {})
        
        flag = False
        risk = "none"
        recommendation = ""
        
        # Check if we dropped price on THIS item
        if prop.get("action") == "decrease":
            # Will it cannibalize others in the same category?
            siblings = [s for s in categories[cat] if s["product_id"] != sku]
            for sibling in siblings:
                sib_sku = sibling["product_id"]
                sib_prop = pricing_proposals.get(sib_sku, {})
                
                # If we dropped price of SKU, but kept sibling high, sibling volume might crash
                if sib_prop.get("action") != "decrease":
                    flag = True
                    risk = "cannibalization"
                    recommendation = f"Dropping price on {sku} may cannibalize sales of {sib_sku} ({cat}). Recommend aligning prices or capping the discount."
                    break

        results[sku] = {
            "flag": flag,
            "risk": risk,
            "recommendation": recommendation
        }
        
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
        
    store = data["stores"][2] # Salem Bazaar (S3) has a cannibalization example
    
    pricing = propose_for_store(store, cfg)
    results = analyze_basket(store, pricing, cfg)
    
    print("==================================================")
    print(f"BASKET AI: SIMPLE SUMMARY")
    print(f"Store: {store['store_name']}")
    print("==================================================\n")
    
    for sku, p_data in results.items():
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        
        status = f"WARNING: CANNIBALIZATION RISK" if p_data["flag"] else "SAFE: No Cross-Product Risks"
        print(f"[+] {product_name}: {status}")
        if p_data["flag"]:
            print(f"    -> Recommendation: {p_data['recommendation']}\n")
        else:
            print("")
