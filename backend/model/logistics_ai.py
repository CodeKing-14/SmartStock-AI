"""
Logistics AI
============
Solves stockout: move stock between stores. Show cost/ROI.
"""

import math

def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def solve_transfers(retail_data: dict, inventory_results: dict, logistics_data: dict, pricing_results: dict) -> dict:
    """
    inventory_results: { store_id: { sku: { risk: "stockout", demanded_volume: 140, current_inventory: 80, ... } } }
    pricing_results: { store_id: { sku: { expected_weekly_profit: ..., new_price: ..., percentage: ... } } }
    """
    stores_info = {s["store_id"]: s for s in logistics_data["stores"]}
    cost_model = logistics_data["transport_cost_model"]
    
    transfers = []
    total_cost = 0
    total_roi = 0

    # 1. Identify all deficits and surpluses across the network
    deficits = []  # {store_id, sku, qty_needed, profit_margin_per_unit}
    surpluses = [] # {store_id, sku, qty_available}

    for store in retail_data["stores"]:
        store_id = store["store_id"]
        for product in store["products"]:
            sku = product["product_id"]
            
            # Safely get the inventory result for this store & sku
            store_inv = inventory_results.get(store_id, {})
            inv = store_inv.get(sku)
            if not inv: continue
            
            store_price = pricing_results.get(store_id, {})
            price = store_price.get(sku)
            if not price: continue

            if inv["risk"] == "stockout":
                qty_needed = max(0, inv["demanded_volume"] - inv["current_inventory"])
                if qty_needed > 0:
                    profit_per_unit = price["expected_weekly_profit"] / inv["demanded_volume"] if inv["demanded_volume"] > 0 else 0
                    deficits.append({
                        "store_id": store_id,
                        "sku": sku,
                        "qty_needed": qty_needed,
                        "profit_per_unit": profit_per_unit
                    })
            elif inv["risk"] == "overstock" or inv["risk"] == "none":
                # If they have more than they demand, it's surplus
                surplus_qty = max(0, inv["current_inventory"] - inv["demanded_volume"])
                if surplus_qty > 0:
                    surpluses.append({
                        "store_id": store_id,
                        "sku": sku,
                        "qty_available": surplus_qty
                    })

    # 2. Match deficits to nearest/best surplus
    for deficit in deficits:
        sku = deficit["sku"]
        needed = deficit["qty_needed"]
        target_store_id = deficit["store_id"]
        target_loc = stores_info[target_store_id]
        
        # Find surpluses for this SKU
        valid_surpluses = [s for s in surpluses if s["sku"] == sku and s["qty_available"] > 0]
        
        for surplus in valid_surpluses:
            if needed <= 0: break
            
            source_store_id = surplus["store_id"]
            source_loc = stores_info[source_store_id]
            
            dist_km = haversine_km(target_loc["lat"], target_loc["lon"], source_loc["lat"], source_loc["lon"])
            
            transfer_qty = min(needed, surplus["qty_available"])
            
            # Calculate cost (simplified: base + unit*km)
            cost = cost_model["base_handling_fee_inr"] + (transfer_qty * dist_km * cost_model["per_unit_per_km_inr"])
            cost = round(cost)
            
            profit_saved = round(transfer_qty * deficit["profit_per_unit"])
            
            if profit_saved > cost:
                roi = round(((profit_saved - cost) / cost) * 100) if cost > 0 else 9999
                transfers.append({
                    "from_store": source_store_id,
                    "to_store": target_store_id,
                    "sku": sku,
                    "qty": round(transfer_qty),
                    "distance_km": round(dist_km, 1),
                    "transfer_cost": cost,
                    "profit_saved": profit_saved,
                    "roi_percent": roi
                })
                
                total_cost += cost
                total_roi += (profit_saved - cost)
                
                needed -= transfer_qty
                surplus["qty_available"] -= transfer_qty

    return {
        "transfers": transfers,
        "total_cost": total_cost,
        "total_roi": total_roi
    }

if __name__ == "__main__":
    import json
    from pathlib import Path
    from pricing_ai import propose_for_store
    from inventory_ai import review_store
    
    base_dir = Path(__file__).resolve().parent.parent
    with open(base_dir / "data" / "retail_data.json", "r") as f:
        data = json.load(f)
    with open(base_dir / "data" / "pricing_config.json", "r") as f:
        cfg = json.load(f)
    with open(base_dir / "data" / "logistics_data.json", "r") as f:
        logistics = json.load(f)
        
    inv_results = {}
    price_results = {}
    for s in data["stores"]:
        price_results[s["store_id"]] = propose_for_store(s, cfg)
        inv_results[s["store_id"]] = review_store(s, price_results[s["store_id"]])
        
    results = solve_transfers(data, inv_results, logistics, price_results)
    
    print("==================================================")
    print(f"LOGISTICS AI: SIMPLE SUMMARY")
    print("==================================================\n")
    
    transfers = results.get("transfers", [])
    if not transfers:
        print("[+] No profitable transfers found.")
    else:
        for t in transfers:
            # Need product name from data
            p_name = t["sku"]
            for s in data["stores"]:
                for p in s["products"]:
                    if p["product_id"] == t["sku"]:
                        p_name = p["name"]
                        break
                        
            print(f"[+] Transfer {t['qty']} units of {p_name} ({t['sku']})")
            print(f"    -> Route: Store {t['from_store']} to Store {t['to_store']} ({t['distance_km']} km)")
            print(f"    -> Logistics Cost: INR {t['transfer_cost']}")
            print(f"    -> Profit Saved: INR {t['profit_saved']}")
            print(f"    -> ROI: {t['roi_percent']}%\n")
            
    print("--------------------------------------------------")
    print(f"Total Transfers: {len(transfers)}")
    print(f"Total Logistics Cost: INR {results.get('total_cost', 0)}")
    print(f"Total Network ROI: INR {results.get('total_roi', 0)}")
    print("==================================================\n")
