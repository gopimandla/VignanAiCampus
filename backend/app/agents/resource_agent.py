import time
from typing import List, Dict, Any
from app.config import settings
from app.schemas.plan import EventDetails, ResourceAllocation, VenueRecommendation

class ResourceAgent:
    """
    Agent 3 — Resource Agent
    Validates resource requirements against MongoDB campus resource inventory.
    Calculates item unit costs, total estimated event cost, and detects equipment shortages.
    """
    def __init__(self):
        self.name = "Resource Agent"
        self.responsibility = "Campus Resource Inventory Matching, Unit Costing & Bottleneck Detection"

    async def execute(
        self,
        event_details: EventDetails,
        selected_venue: VenueRecommendation,
        resources_catalog: List[Dict[str, Any]],
        demands: Dict[str, int]
    ) -> Dict[str, Any]:
        start_time = time.time()
        participants = event_details.expected_participants
        event_type = event_details.event_type.lower()
        allocations: List[ResourceAllocation] = []
        shortages_found = []
        pricing_catalog = settings.RESOURCE_PRICING

        # Canonical mapping of demand keys to resource items
        demand_mapping = {
            "res-projectors": demands.get("projectors", max(1, participants // 200)),
            "res-microphones": demands.get("microphones", 4 if "cultural" in event_type else 2),
            "res-speakers": demands.get("speakers", 4 if "cultural" in event_type else 2),
            "res-led-screens": demands.get("led_screens", 2 if "cultural" in event_type else 1),
            "res-chairs": demands.get("chairs", participants),
            "res-tables": demands.get("tables", max(15, participants // 4 if "hackathon" in event_type else participants // 20)),
            "res-laptops": demands.get("laptops", max(4, participants // 50) if "hackathon" in event_type else 2),
            "res-wifi-support": demands.get("wifi_access_points", max(4, participants // 40)),
            "res-security": demands.get("security_guards", max(4, participants // 60)),
            "res-volunteers": demands.get("volunteers", max(10, participants // 20)),
            "res-cameras": demands.get("cameras", 2 if "cultural" in event_type or "fest" in event_type else 1),
            "res-generators": 1 if participants > 400 or "hackathon" in event_type else 0,
            "res-buses": demands.get("buses", max(2, participants // 50) if "nss" in event_type else 0)
        }

        total_resource_cost = 0.0

        for res in resources_catalog:
            r_id = res.get("id", "")
            r_name = res.get("name", "")
            r_cat = res.get("category", "")
            r_unit = res.get("unit", "units")
            r_avail = res.get("available_quantity", res.get("total_quantity", 0))

            needed = demand_mapping.get(r_id, 0)
            if needed == 0 and r_id not in ["res-projectors", "res-microphones", "res-chairs", "res-wifi-support", "res-volunteers"]:
                continue

            if needed == 0:
                needed = 1

            if r_avail >= needed:
                allocated = needed
                status = "Optimal" if needed < r_avail * 0.7 else "Sufficient"
                notes = f"Full allocation confirmed ({allocated} {r_unit})."
            else:
                allocated = r_avail
                status = "Shortage"
                deficit = needed - r_avail
                shortages_found.append(f"{r_name}: Demanded {needed} {r_unit}, but only {r_avail} available in campus inventory.")
                notes = f"Inventory constraint: Allocated max available ({allocated} {r_unit}). Shortage of {deficit} units."

            unit_cost = float(pricing_catalog.get(r_id, res.get("unit_cost", 100.0)))
            item_total_cost = allocated * unit_cost
            total_resource_cost += item_total_cost

            allocations.append(
                ResourceAllocation(
                    resource_id=r_id,
                    name=r_name,
                    category=r_cat,
                    required_quantity=needed,
                    available_quantity=r_avail,
                    allocated_quantity=allocated,
                    unit=r_unit,
                    unit_cost=unit_cost,
                    total_cost=item_total_cost,
                    status=status,
                    notes=notes
                )
            )

        # Include basic logistics & venue setup overhead
        logistics_overhead = float(pricing_catalog.get("logistics_overhead", 5000.0))
        estimated_total_cost = total_resource_cost + logistics_overhead

        # Calculate budget compliance
        event_details.estimated_cost = round(estimated_total_cost, 2)
        event_details.remaining_budget = round(event_details.budget - estimated_total_cost, 2)

        if event_details.budget > 0:
            if estimated_total_cost > event_details.budget:
                event_details.budget_status = "BUDGET_EXCEEDED"
            elif estimated_total_cost >= event_details.budget * 0.85:
                event_details.budget_status = "NEAR_LIMIT"
            else:
                event_details.budget_status = "WITHIN_BUDGET"

        exec_time = round((time.time() - start_time) * 1000, 2)

        return {
            "resource_allocations": allocations,
            "shortages": shortages_found,
            "estimated_cost": estimated_total_cost,
            "trace": {
                "agent_id": "agent-3-resource",
                "agent_name": self.name,
                "responsibility": self.responsibility,
                "status": "completed",
                "execution_time_ms": exec_time,
                "summary": f"Allocated {len(allocations)} resource streams from MongoDB (Estimated Cost: ₹{estimated_total_cost:,.2f}, Budget Status: {event_details.budget_status}).",
                "details": {
                    "allocated_categories": len(allocations),
                    "shortages_count": len(shortages_found),
                    "estimated_cost": estimated_total_cost
                }
            }
        }

resource_agent = ResourceAgent()
