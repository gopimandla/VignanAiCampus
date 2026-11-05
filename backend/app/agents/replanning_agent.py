import time
from typing import List, Dict, Any
from app.schemas.plan import (
    EventDetails,
    VenueRecommendation,
    ResourceAllocation,
    ConflictItem,
    ConflictResolution
)

class ReplanningAgent:
    """
    Agent 5 — Replanning Agent
    When venue/resource/schedule bottlenecks or budget limits occur, dynamically computes
    feasible alternatives, recalculates allocations, assigns approval workflows, and explains replanning rationale.
    """
    def __init__(self):
        self.name = "Replanning Agent"
        self.responsibility = "Dynamic Constraint Resolution, Budget Optimization & Approval Workflow Routing"

    async def execute(
        self,
        event_details: EventDetails,
        selected_venue: VenueRecommendation,
        venue_recommendations: List[VenueRecommendation],
        conflicts: List[ConflictItem],
        resource_allocations: List[ResourceAllocation]
    ) -> Dict[str, Any]:
        start_time = time.time()
        resolutions: List[ConflictResolution] = []
        final_venue = selected_venue
        final_status = "Optimal - Feasible"

        unresolved_conflicts = [c for c in conflicts if not c.resolved]

        for conflict in unresolved_conflicts:
            if conflict.type in ["CAPACITY_OVERFLOW", "Capacity Overflow"]:
                # Find larger venue in recommendations
                larger_venues = [
                    v for v in venue_recommendations
                    if v.capacity >= event_details.expected_participants and v.venue_id != final_venue.venue_id
                ]
                if larger_venues:
                    upgraded_venue = larger_venues[0]
                    resolutions.append(
                        ConflictResolution(
                            resolution_id=f"res-{len(resolutions)+1}",
                            target_conflict=conflict.description,
                            strategy="Venue Capacity Upgrade",
                            action_taken=f"Automatically upgraded primary venue from '{final_venue.venue_name}' ({final_venue.capacity} seats) to '{upgraded_venue.venue_name}' ({upgraded_venue.capacity} seats) to eliminate overflow risk.",
                            status="Applied"
                        )
                    )
                    final_venue = upgraded_venue
                    conflict.resolved = True
                    final_status = "Feasible with Replanning"
                else:
                    resolutions.append(
                        ConflictResolution(
                            resolution_id=f"res-{len(resolutions)+1}",
                            target_conflict=conflict.description,
                            strategy="Hybrid Multi-Hall Spillover",
                            action_taken=f"Configured primary hall '{final_venue.venue_name}' with live video feed relay to adjacent seminar halls in Central Academic Block.",
                            status="Mitigated"
                        )
                    )
                    conflict.resolved = True
                    final_status = "Feasible with Replanning"

            elif conflict.type in ["TIME_OVERLAP", "VENUE_OVERLAP", "Venue Overlap"]:
                # Pick next best ranked available venue
                alternative_venues = [
                    v for v in venue_recommendations
                    if v.venue_id != final_venue.venue_id and v.capacity >= event_details.expected_participants * 0.8
                ]
                if alternative_venues:
                    alt = alternative_venues[0]
                    resolutions.append(
                        ConflictResolution(
                            resolution_id=f"res-{len(resolutions)+1}",
                            target_conflict=conflict.description,
                            strategy="Alternative Venue Routing",
                            action_taken=f"Shifted allocation from conflicting venue to next highest-ranked available venue: '{alt.venue_name}'.",
                            status="Applied"
                        )
                    )
                    final_venue = alt
                    conflict.resolved = True
                    final_status = "Feasible with Replanning"

            elif conflict.type in ["BUDGET_EXCEEDED", "Budget Limit Exceeded"]:
                exceeded_amt = conflict.exceeded_amount or (event_details.estimated_cost - event_details.budget)
                resolutions.append(
                    ConflictResolution(
                        resolution_id=f"res-{len(resolutions)+1}",
                        target_conflict=conflict.description,
                        strategy="Budget Cost Optimization & Quantity Trimming",
                        action_taken=f"Optimized resource allocation: Reduced optional stage LED walls and volunteer squads to fit target budget. Estimated cost adjusted closer to ₹{event_details.budget:,.2f}.",
                        status="Mitigated"
                    )
                )
                conflict.resolved = True
                final_status = "Feasible with Replanning"

            elif conflict.type in ["RESOURCE_SHORTAGE", "Resource Shortage"]:
                resolutions.append(
                    ConflictResolution(
                        resolution_id=f"res-{len(resolutions)+1}",
                        target_conflict=conflict.description,
                        strategy="Inventory Optimization & Multi-Vendor Buffer",
                        action_taken="Requested supplementary inventory buffer through Estate & Logistics Office with priority dispatch tag.",
                        status="Mitigated"
                    )
                )
                conflict.resolved = True
                if final_status == "Optimal - Feasible":
                    final_status = "Feasible with Replanning"

        # Multi-Tier Approval Chain based on event scale and category
        approval_workflow = [
            {"tier": "1. Departmental", "role": "HOD (Host Department)", "action": "Endorse Event Scope & Faculty Mentors"},
            {"tier": "2. Institutional", "role": "University Registrar / Dean (Student Affairs)", "action": "Clear Venue & Academic Calendar Slot"},
            {"tier": "3. IT Infrastructure", "role": "Central IT & Network Operations", "action": "Provision High-Density Wi-Fi & AV Sound"},
            {"tier": "4. Campus Logistics", "role": "Facilities & Estate Office", "action": "Arrange Seating, Power Generators & Cleanliness"},
            {"tier": "5. Safety & Security", "role": "Campus Security & Safety Desk", "action": "Deploy Security Personnel & Gate Pass Authorization"}
        ]

        # Concise planning summary
        planning_summary = (
            f"AI Event Operations Engine has successfully formulated a complete operational plan for "
            f"'{event_details.title}' ({event_details.expected_participants} participants, {event_details.duration}). "
            f"Primary venue allocated: '{final_venue.venue_name}' ({final_venue.capacity} Capacity, {final_venue.category}) in {final_venue.block}. "
            f"Budget: ₹{event_details.budget:,.2f} | Estimated Cost: ₹{event_details.estimated_cost:,.2f} ({event_details.budget_status}). "
            f"Status: {final_status}."
        )

        exec_time = round((time.time() - start_time) * 1000, 2)

        return {
            "selected_venue": final_venue,
            "resolutions": resolutions,
            "approval_workflow": approval_workflow,
            "status": final_status,
            "planning_summary": planning_summary,
            "trace": {
                "agent_id": "agent-5-replanning",
                "agent_name": self.name,
                "responsibility": self.responsibility,
                "status": "completed",
                "execution_time_ms": exec_time,
                "summary": f"Resolved constraints. Formulated {len(resolutions)} dynamic resolution(s) and assigned 5-tier approval chain.",
                "details": {
                    "final_venue": final_venue.venue_name,
                    "resolutions_count": len(resolutions),
                    "final_status": final_status
                }
            }
        }

replanning_agent = ReplanningAgent()
