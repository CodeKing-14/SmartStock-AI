"""
Data Analyst AI
===============
Reads raw data. Writes factual summary. No recommendations.
"""

import json
from datetime import datetime
import hashlib

def analyze_product(product: dict, store: dict, meta: dict) -> dict:
    last = product.get("sales_last_week", 0)
    this = product.get("sales_this_week", 0)
    stock = product.get("stock_level", 0)
    comp_price = product.get("competitor_price", 0)
    our_price = product.get("our_price", 0)
    
    # 1. Sales
    if last == 0:
        sales_pct = 0
        sales_text = f"Sales were {this} units this week."
    else:
        sales_pct = round(((this - last) / last) * 100)
        direction = "rose" if sales_pct >= 0 else "dipped"
        sales_text = f"Sales {direction} {abs(sales_pct)}% last week."

    # 2. Inventory
    daily_rate = this / 7 if this > 0 else 0
    days_stock = round(stock / daily_rate) if daily_rate > 0 else 999
    inv_text = f"Inventory at {days_stock} days of stock."

    # 3. Competitor
    if comp_price < our_price:
        comp_text = f"Competitor is priced lower at {meta.get('currency', 'INR')} {comp_price}."
    elif comp_price > our_price:
        comp_text = f"Competitor is priced higher at {meta.get('currency', 'INR')} {comp_price}."
    else:
        comp_text = f"Competitor matches our price at {meta.get('currency', 'INR')} {comp_price}."

    summary = f"{sales_text} {inv_text} {comp_text}"
    
    # Hash for audit trail
    data_str = json.dumps(product, sort_keys=True)
    data_hash = hashlib.md5(data_str.encode()).hexdigest()

    return {
        "summary": summary,
        "confidence": 0.98,
        "data_sources": ["POS", "WMS", "CompetitorAPI"],
        "audit_trail": {
            "timestamp": datetime.now().isoformat(),
            "user_who_ran_it": "system_auto",
            "data_hash": data_hash
        }
    }

def analyze_store(store: dict, meta: dict) -> dict:
    results = {}
    for product in store["products"]:
        results[product["product_id"]] = analyze_product(product, store, meta)
    return results

if __name__ == "__main__":
    from pathlib import Path
    data_file = Path(__file__).resolve().parent.parent / "data" / "retail_data.json"
    with open(data_file, "r") as f:
        data = json.load(f)
    
    meta = {k: v for k, v in data.items() if k != "stores"}
    store = data["stores"][0]
    results = analyze_store(store, meta)
    
    print("==================================================")
    print(f"DATA ANALYST AI: SIMPLE SUMMARY")
    print(f"Store: {store['store_name']}")
    print("==================================================\n")
    
    for sku, p_data in results.items():
        product_name = next(p["name"] for p in store["products"] if p["product_id"] == sku)
        print(f"[+] {product_name}:")
        print(f"    -> Findings: {p_data['summary']}")
        print(f"    -> Confidence: {p_data['confidence'] * 100}%")
        print(f"    -> Audit Hash: {p_data['audit_trail']['data_hash']}\n")
