"""
Logistics AI
============

Reads logistics_data.json (store network + per-SKU deficit/surplus positions,
produced upstream by Inventory AI's STOCKOUT_RISK / OVERSTOCK objections) and
recommends inter-store transfers.

For each SKU with both a deficit store (needs units) and a surplus store
(units at risk of markdown/spoilage), it:
  1. Computes the real store-to-store distance (haversine, km).
  2. Prices the transfer: base handling fee + per-unit-per-km transport cost.
  3. Values the waste avoided at the source: units moved * unit cost *
     probability those units go unsold/unsellable if left in place.
  4. Only recommends the transfer if savings clear a minimum net-benefit
     ratio over cost (default 1.3x) — this is the "accuracy" guardrail:
     it won't propose a transfer that looks good only on paper.
  5. Caps the transferred quantity at min(need, available surplus) so it
     never ships more than the deficit store actually needs, and never
     recommends moving MORE than the source's surplus (which would just
     create a new deficit there).

Output format matches:
  "Fix available: transfer {qty} units {name} Store {src} -> Store {dst}
   {eta}. Cost Rs.{cost}, saves ~Rs.{savings} in waste at Store {src}."
"""

import json
import math
from dataclasses import dataclass
from typing import Optional


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def eta_for_distance(distance_km: float, eta_rules: list) -> str:
    for rule in eta_rules:
        if distance_km <= rule["max_km"]:
            return rule["eta"]
    return eta_rules[-1]["eta"]


@dataclass
class TransferRecommendation:
    sku_id: str
    name: str
    from_store_id: str
    from_store_name: str
    to_store_id: str
    to_store_name: str
    qty: int
    distance_km: float
    cost_inr: int
    savings_inr: int
    eta: str

    def message(self) -> str:
        return (
            f"Fix available: transfer {self.qty} units {self.name} "
            f"Store {self.from_store_id} -> Store {self.to_store_id} {self.eta}. "
            f"Cost \u20b9{self.cost_inr}, saves ~\u20b9{self.savings_inr} in waste at Store {self.from_store_id}."
        )


@dataclass
class NoFixFound:
    sku_id: str
    name: str
    store_id: str
    store_name: str
    reason: str

    def message(self) -> str:
        return (
            f"No cost-effective transfer for {self.name} at Store {self.store_id}: {self.reason} "
            f"Recommend liquidation/markdown via Pricing AI instead."
        )


class LogisticsAI:
    def __init__(self, data: dict):
        self.stores = {s["store_id"]: s for s in data["stores"]}
        self.positions = data["sku_positions"]
        self.cost_model = data["transport_cost_model"]
        self.eta_rules = data["eta_rules_km"]
        self.min_net_benefit_ratio = data.get("min_net_benefit_ratio", 1.3)

    def _distance(self, store_id_a: str, store_id_b: str) -> float:
        a, b = self.stores[store_id_a], self.stores[store_id_b]
        return round(haversine_km(a["lat"], a["lon"], b["lat"], b["lon"]), 1)

    def _transport_cost(self, qty: int, distance_km: float) -> int:
        cost = self.cost_model["base_handling_fee_inr"] + qty * distance_km * self.cost_model["per_unit_per_km_inr"]
        return round(cost)

    def recommend(self):
        """Returns a list of TransferRecommendation / NoFixFound objects."""
        by_sku = {}
        for row in self.positions:
            by_sku.setdefault(row["sku_id"], []).append(row)

        results = []
        for sku_id, rows in by_sku.items():
            deficits = [r for r in rows if r["type"] == "DEFICIT"]
            surpluses = [r for r in rows if r["type"] == "SURPLUS"]
            name = rows[0]["name"]

            for deficit in deficits:
                if not surpluses:
                    results.append(NoFixFound(
                        sku_id=sku_id, name=name,
                        store_id=deficit["store_id"], store_name=self.stores[deficit["store_id"]]["name"],
                        reason="no surplus source found in the network.",
                    ))
                    continue

                # pick the surplus source with the best net benefit for this deficit
                best = None
                for surplus in surpluses:
                    qty = min(deficit["units"], surplus["units"])
                    if qty <= 0:
                        continue
                    distance_km = self._distance(surplus["store_id"], deficit["store_id"])
                    cost = self._transport_cost(qty, distance_km)
                    savings = round(qty * surplus["unit_cost_inr"] * surplus["spoilage_risk_pct"])
                    net_benefit = savings - cost
                    candidate = (net_benefit, savings, cost, qty, distance_km, surplus)
                    if best is None or net_benefit > best[0]:
                        best = candidate

                net_benefit, savings, cost, qty, distance_km, surplus = best
                if cost <= 0 or savings < cost * self.min_net_benefit_ratio:
                    results.append(NoFixFound(
                        sku_id=sku_id, name=name,
                        store_id=deficit["store_id"], store_name=self.stores[deficit["store_id"]]["name"],
                        reason=(
                            f"best available transfer (from Store {surplus['store_id']}) "
                            f"costs \u20b9{cost} against only ~\u20b9{savings} in avoided waste."
                        ),
                    ))
                    continue

                results.append(TransferRecommendation(
                    sku_id=sku_id, name=name,
                    from_store_id=surplus["store_id"], from_store_name=self.stores[surplus["store_id"]]["name"],
                    to_store_id=deficit["store_id"], to_store_name=self.stores[deficit["store_id"]]["name"],
                    qty=qty, distance_km=distance_km, cost_inr=cost, savings_inr=savings,
                    eta=eta_for_distance(distance_km, self.eta_rules),
                ))

        return results


if __name__ == "__main__":
    with open(
        "./data/logistics_data.json"
    ) as f:
        data = json.load(f)

    engine = LogisticsAI(data)
    recommendations = engine.recommend()

    for rec in recommendations:
        print("\U0001F69A Logistics AI:", rec.message())
        if isinstance(rec, TransferRecommendation):
            print(f"   (distance {rec.distance_km} km, "
                  f"cost model: base fee + units x km x rate, "
                  f"net benefit \u20b9{rec.savings_inr - rec.cost_inr})")
        print()
