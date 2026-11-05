import time
from typing import Dict, Any
from app.services.campus_data_service import CampusDataService
from app.agents.event_planning_agent import event_planning_agent
from app.agents.venue_agent import venue_agent
from app.agents.resource_agent import resource_agent
from app.agents.conflict_schedule_agent import conflict_schedule_agent
from app.agents.replanning_agent import replanning_agent
from app.schemas.plan import EventPlanRequest, EventPlanResponse, AgentTrace

class AgentOrchestrator:
    """
    Master 5-Agent Event Operations Pipeline Orchestrator.
    Sequentially coordinates the 5 specialized campus agents against MongoDB Atlas master data.
    """
    async def orchestrate_plan(self, request: EventPlanRequest) -> EventPlanResponse:
        total_start = time.time()
        agent_traces = []

        # 0. Fetch factual campus master data from MongoDB Atlas / Seed
        venues_catalog = await CampusDataService.get_venues()
        resources_catalog = await CampusDataService.get_resources()
        existing_bookings = await CampusDataService.get_existing_bookings()

        # Step 1: Agent 1 — Event Planning Agent
        plan_res = await event_planning_agent.execute(
            prompt=request.prompt,
            venues_catalog=venues_catalog,
            resources_catalog=resources_catalog,
            date_hint=request.date or "2026-08-28",
            start_time_hint=request.start_time or "09:00 AM",
            end_time_hint=request.end_time or "05:00 PM",
            budget_hint=request.budget or 50000.0
        )
        agent_traces.append(AgentTrace(**plan_res["trace"]))
        event_details = plan_res["event_details"]
        assumptions = plan_res["assumptions"]
        resource_demands = plan_res["resource_demands"]
        schedule_outline = plan_res["schedule_outline"]
        ai_recommendations = plan_res["recommendations"]
        ai_engine_used = plan_res["ai_engine_used"]

        # Override with explicit user preferences if provided
        if request.expected_attendees and request.expected_attendees > 0:
            event_details.expected_participants = request.expected_attendees
        if request.budget and request.budget > 0:
            event_details.budget = request.budget
        if request.date:
            event_details.date = request.date
        if request.start_time:
            event_details.start_time = request.start_time
        if request.end_time:
            event_details.end_time = request.end_time

        # Step 2: Agent 2 — Venue Agent
        venue_res = await venue_agent.execute(
            event_details=event_details,
            venues_catalog=venues_catalog,
            existing_bookings=existing_bookings,
            user_preferred_venue=request.preferred_venue
        )
        agent_traces.append(AgentTrace(**venue_res["trace"]))
        venue_recommendations = venue_res["venue_recommendations"]
        selected_venue = venue_res["selected_venue"]
        secondary_venues = venue_res["secondary_venues"]

        # Step 3: Agent 3 — Resource Agent
        resource_res = await resource_agent.execute(
            event_details=event_details,
            selected_venue=selected_venue,
            resources_catalog=resources_catalog,
            demands=resource_demands
        )
        agent_traces.append(AgentTrace(**resource_res["trace"]))
        resource_allocations = resource_res["resource_allocations"]
        shortages = resource_res["shortages"]

        # Step 4: Agent 4 — Conflict & Schedule Agent
        conflict_res = await conflict_schedule_agent.execute(
            event_details=event_details,
            selected_venue=selected_venue,
            resource_allocations=resource_allocations,
            shortages=shortages,
            schedule_outline=schedule_outline,
            existing_bookings=existing_bookings
        )
        agent_traces.append(AgentTrace(**conflict_res["trace"]))
        conflicts = conflict_res["conflicts"]
        schedule = conflict_res["schedule"]

        # Step 5: Agent 5 — Replanning Agent
        replan_res = await replanning_agent.execute(
            event_details=event_details,
            selected_venue=selected_venue,
            venue_recommendations=venue_recommendations,
            conflicts=conflicts,
            resource_allocations=resource_allocations
        )
        agent_traces.append(AgentTrace(**replan_res["trace"]))
        final_venue = replan_res["selected_venue"]
        resolutions = replan_res["resolutions"]
        approval_workflow = replan_res["approval_workflow"]
        final_status = replan_res["status"]
        planning_summary = replan_res["planning_summary"]

        total_exec_ms = round((time.time() - total_start) * 1000, 2)

        return EventPlanResponse(
            event=event_details,
            assumptions=assumptions,
            venue_recommendations=venue_recommendations,
            selected_venue=final_venue,
            secondary_venues=secondary_venues,
            resources=resource_allocations,
            conflicts=conflicts,
            resolutions=resolutions,
            schedule=schedule,
            recommendations=ai_recommendations,
            approval_workflow=approval_workflow,
            status=final_status,
            planning_summary=planning_summary,
            ai_engine_used=ai_engine_used,
            orchestration_time_ms=total_exec_ms,
            agent_trace=agent_traces
        )

orchestrator = AgentOrchestrator()
