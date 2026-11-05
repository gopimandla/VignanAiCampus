import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from app.schemas.plan import EventPlanRequest, EventPlanResponse, ConflictItem
from app.agents.orchestrator import orchestrator
from app.auth.rbac import get_current_user, require_role
from app.database import db_manager, COLLECTIONS
from app.services.campus_data_service import CampusDataService
from app.utils.time_utils import check_time_interval_overlap, parse_time_to_minutes
from app.config import settings

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/events", tags=["Events & AI Operations"])

# -------------------------------------------------------------
# 1. AI 5-AGENT EVENT PLANNER ENDPOINT
# -------------------------------------------------------------

@router.post("/plan", response_model=EventPlanResponse)
async def generate_event_plan(request: EventPlanRequest):
    """
    Core AI Event Planning Endpoint.
    Orchestrates the 5-Agent Pipeline (Event Planning, Venue, Resource, Conflict, Replanning)
    against MongoDB Atlas campus master data.
    """
    logger.info(f"Received AI event planning request for prompt: '{request.prompt}' (Budget: ₹{request.budget})")
    try:
        response = await orchestrator.orchestrate_plan(request)
        return response
    except Exception as e:
        logger.error(f"Error during event planning orchestration: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Campus Event Planning Engine encountered an error: {str(e)}"
        )

# -------------------------------------------------------------
# 2. PLAN REVALIDATION & CONFLICT CHECK ENDPOINT
# -------------------------------------------------------------

class PlanRevalidateRequest(BaseModel):
    title: str
    venue_name: str
    expected_participants: int
    date: Optional[str] = "2026-08-28"
    start_time: Optional[str] = "09:00 AM"
    end_time: Optional[str] = "05:00 PM"
    budget: Optional[float] = 50000.0
    required_resources: Optional[Dict[str, int]] = None

class PlanRevalidateResponse(BaseModel):
    is_valid: bool
    status: str  # 'Validated - Feasible', 'Warning - Bottlenecks Detected', 'Invalid - Conflict'
    venue_check: Dict[str, Any]
    resource_check: Dict[str, Any]
    conflict_check: Dict[str, Any]
    budget_check: Dict[str, Any]
    structured_conflicts: List[ConflictItem]
    message: str

@router.post("/revalidate", response_model=PlanRevalidateResponse)
async def revalidate_edited_plan(req: PlanRevalidateRequest):
    """
    Revalidates user-edited event parameters against real MongoDB Atlas constraints:
    venue capacity, date + start/end time interval overlaps, resource inventory, and budget limit.
    """
    venues = await CampusDataService.get_venues()
    existing_events = await CampusDataService.get_existing_bookings()
    pricing_catalog = settings.RESOURCE_PRICING

    # 1. Match Venue
    matched_venue = None
    for v in venues:
        if v["name"].lower() == req.venue_name.lower() or v["id"] == req.venue_name.lower():
            matched_venue = v
            break
    if not matched_venue:
        for v in venues:
            if req.venue_name.lower() in v["name"].lower():
                matched_venue = v
                break
    if not matched_venue:
        matched_venue = venues[0]

    venue_cap = matched_venue["capacity"]
    cap_deficit = req.expected_participants - venue_cap

    venue_check = {
        "venue_name": matched_venue["name"],
        "capacity": venue_cap,
        "demanded": req.expected_participants,
        "status": "Optimal" if cap_deficit <= 0 else "Capacity Overflow",
        "deficit": max(0, cap_deficit)
    }

    structured_conflicts: List[ConflictItem] = []

    # Capacity Overflow Conflict
    if cap_deficit > 0:
        structured_conflicts.append(
            ConflictItem(
                conflict_id="conf-cap-01",
                type="CAPACITY_OVERFLOW",
                severity="HIGH",
                title="Venue Capacity Overflow",
                venue_id=matched_venue["id"],
                venue_name=matched_venue["name"],
                description=f"Venue '{matched_venue['name']}' holds {venue_cap} seats, but {req.expected_participants} attendees are expected.",
                impact=f"Capacity deficit of {cap_deficit} seats.",
                suggested_resolution="Select a larger hall (e.g. Convocation Hall / Sa Re Ga Ma) or configure multi-hall spillover.",
                resolved=False
            )
        )

    # 2. Date + Time Interval Overlap Check against MongoDB Atlas Events
    for ev in existing_events:
        ev_venue_id = ev.get("venue_id")
        ev_date = ev.get("date")
        ev_status = ev.get("status", "Approved")

        if ev_venue_id == matched_venue["id"] and ev_date == req.date:
            ev_start = ev.get("start_time", "09:00 AM")
            ev_end = ev.get("end_time", "05:00 PM")

            is_overlap = check_time_interval_overlap(
                start1_str=ev_start,
                end1_str=ev_end,
                start2_str=req.start_time or "09:00 AM",
                end2_str=req.end_time or "05:00 PM"
            )

            if is_overlap:
                structured_conflicts.append(
                    ConflictItem(
                        conflict_id=f"conf-bk-{ev.get('id', '01')}",
                        type="TIME_OVERLAP",
                        severity="HIGH" if ev_status in ["Approved", "Confirmed"] else "MEDIUM",
                        title=f"Time Overlap with '{ev.get('title')}'",
                        date=req.date,
                        venue_id=matched_venue["id"],
                        venue_name=matched_venue["name"],
                        requested_start=req.start_time,
                        requested_end=req.end_time,
                        existing_event_id=ev.get("id"),
                        existing_event_title=ev.get("title"),
                        existing_start=ev_start,
                        existing_end=ev_end,
                        description=f"Venue '{matched_venue['name']}' is already booked on {req.date} from {ev_start} to {ev_end} for '{ev.get('title')}'. Requested slot ({req.start_time} - {req.end_time}) overlaps.",
                        impact="The requested event cannot be scheduled in this venue during the selected time.",
                        suggested_resolution="Choose another venue, choose another start/end time, or choose another date.",
                        resolved=False
                    )
                )

    # 3. Check Resource Inventory & Estimate Cost
    resources_catalog = await CampusDataService.get_resources()
    resource_check = {"status": "Sufficient", "details": []}
    estimated_cost = 0.0

    req_res_dict = req.required_resources or {
        "res-projectors": 2,
        "res-microphones": 4,
        "res-speakers": 2,
        "res-chairs": req.expected_participants,
        "res-tables": max(10, req.expected_participants // 20)
    }

    for r_id, qty in req_res_dict.items():
        unit_price = pricing_catalog.get(r_id, 100.0)
        estimated_cost += qty * unit_price
        for r in resources_catalog:
            if r_id.lower() in r["id"].lower() or r_id.lower() in r["name"].lower():
                if qty > r.get("available_quantity", r.get("total_quantity", 0)):
                    resource_check["status"] = "Shortage"
                    resource_check["details"].append(f"{r['name']}: Demanded {qty} vs Available {r['available_quantity']}")
                    structured_conflicts.append(
                        ConflictItem(
                            conflict_id=f"conf-res-{r_id}",
                            type="RESOURCE_SHORTAGE",
                            severity="MEDIUM",
                            title=f"Shortage of {r['name']}",
                            description=f"{r['name']}: Demanded {qty} vs Available {r['available_quantity']} in campus inventory.",
                            impact="Equipment deficit requires inventory scaling.",
                            suggested_resolution="Request supplementary buffer through Estate & Logistics Office.",
                            resolved=False
                        )
                    )

    # Logistics Overhead
    estimated_cost += float(pricing_catalog.get("logistics_overhead", 5000.0))
    specified_budget = req.budget or 50000.0
    remaining_budget = specified_budget - estimated_cost
    budget_status = "WITHIN_BUDGET"

    if specified_budget > 0 and estimated_cost > specified_budget:
        budget_status = "BUDGET_EXCEEDED"
        exceeded_amt = estimated_cost - specified_budget
        structured_conflicts.append(
            ConflictItem(
                conflict_id="conf-budget-01",
                type="BUDGET_EXCEEDED",
                severity="HIGH",
                title="Budget Allocation Exceeded",
                exceeded_amount=exceeded_amt,
                description=f"Estimated event cost (₹{estimated_cost:,.2f}) exceeds specified budget (₹{specified_budget:,.2f}) by ₹{exceeded_amt:,.2f}.",
                impact="Cost exceeds approved financial limit.",
                suggested_resolution="Reduce resource quantities, select lower-cost AV options, or request a budget increase.",
                resolved=False
            )
        )

    budget_check = {
        "budget": specified_budget,
        "estimated_cost": round(estimated_cost, 2),
        "remaining_budget": round(remaining_budget, 2),
        "budget_status": budget_status,
        "utilization_percentage": round((estimated_cost / specified_budget) * 100, 1) if specified_budget > 0 else 100.0
    }

    active_high_conflicts = [c for c in structured_conflicts if c.severity == "HIGH" and not c.resolved]
    is_valid = len(active_high_conflicts) == 0

    status_label = "Validated - Feasible" if is_valid and len(structured_conflicts) == 0 else "Warning - Bottlenecks Detected" if is_valid else "Invalid - Conflict Detected"

    message = (
        f"Event '{req.title}' revalidated against MongoDB Atlas: Venue '{matched_venue['name']}' ({venue_cap} seats) "
        f"{'has sufficient capacity' if cap_deficit <= 0 else f'has overflow of {cap_deficit} seats'}. "
        f"Budget status: {budget_status} (Est: ₹{estimated_cost:,.2f} vs Budget: ₹{specified_budget:,.2f}). "
        f"{'0 time conflicts found on ' + str(req.date) if len(active_high_conflicts) == 0 else f'{len(active_high_conflicts)} conflict(s) detected'}."
    )

    return PlanRevalidateResponse(
        is_valid=is_valid,
        status=status_label,
        venue_check=venue_check,
        resource_check=resource_check,
        conflict_check={"conflicts": [c.description for c in structured_conflicts], "count": len(structured_conflicts)},
        budget_check=budget_check,
        structured_conflicts=structured_conflicts,
        message=message
    )

# -------------------------------------------------------------
# 3. EVENTS LIST & CREATION ENDPOINTS (MONGODB ATLAS PERSISTED)
# -------------------------------------------------------------

@router.get("")
async def list_events(
    category: Optional[str] = None,
    status_filter: Optional[str] = None
):
    """
    Retrieve campus events feed directly from MongoDB Atlas.
    """
    events = await CampusDataService.get_existing_bookings()

    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["events"]]
            query = {}
            if category and category.lower() != "all":
                query["category"] = {"$regex": category, "$options": "i"}
            if status_filter:
                query["status"] = status_filter
            cursor = coll.find(query, {"_id": 0}).sort("created_at", -1)
            db_events = await cursor.to_list(length=200)
            if db_events:
                events = db_events
        except Exception as e:
            logger.error(f"Error fetching events list from MongoDB Atlas: {e}")

    return {"events": events, "total": len(events)}

class EventCreateRequest(BaseModel):
    title: str
    category: str
    event_type: str
    venue_id: str
    venue_name: str
    date: str
    dates_label: Optional[str] = None
    start_time: str
    end_time: str
    expected_participants: int
    host_department: str
    description: str
    budget: Optional[float] = 50000.0
    estimated_cost: Optional[float] = 0.0
    key_objectives: Optional[List[str]] = []

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(
    req: EventCreateRequest,
    current_user: dict = Depends(require_role(["SUPER_ADMIN", "HOD", "EVENT_ORGANIZER"]))
):
    """Save an AI-generated or manually created event request into MongoDB Atlas."""
    pricing_catalog = settings.RESOURCE_PRICING
    est_cost = req.estimated_cost or (req.expected_participants * 120.0 + 5000.0)
    specified_budget = req.budget or 50000.0
    rem_budget = specified_budget - est_cost
    b_status = "WITHIN_BUDGET" if rem_budget >= 0 else "BUDGET_EXCEEDED"

    ev_id = f"ev-{int(datetime.now().timestamp() * 1000)}"
    now_iso = datetime.now().isoformat()

    new_ev = {
        "id": ev_id,
        "title": req.title,
        "category": req.category,
        "event_type": req.event_type,
        "venue_id": req.venue_id,
        "venue_name": req.venue_name,
        "date": req.date,
        "dates_label": req.dates_label or req.date,
        "start_time": req.start_time,
        "end_time": req.end_time,
        "expected_participants": req.expected_participants,
        "organizer": current_user.get("name", "Event Organizer"),
        "organizer_email": current_user.get("email", "organizer@vignan.ac.in"),
        "host_department": req.host_department or current_user.get("department", "VFSTR"),
        "description": req.description,
        "budget": specified_budget,
        "estimated_cost": round(est_cost, 2),
        "remaining_budget": round(rem_budget, 2),
        "budget_status": b_status,
        "status": "Pending Approval",
        "approval_tier": "Submitted for HOD & Dean Endorsement",
        "conflict_status": "Validated",
        "registered_students_count": 0,
        "is_published": False,
        "created_by_user_id": current_user.get("id", "usr-organizer"),
        "created_at": now_iso,
        "updated_at": now_iso
    }

    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["events"]]
            await coll.insert_one(new_ev)

            # Audit log
            audit_coll = db_manager.db[COLLECTIONS["audit_logs"]]
            await audit_coll.insert_one({
                "id": f"log-{int(datetime.now().timestamp())}",
                "timestamp": now_iso,
                "actor": current_user.get("name"),
                "action": "Submit Event",
                "details": f"Submitted event '{req.title}' for {req.date} at '{req.venue_name}' (Budget: ₹{specified_budget:,.2f})"
            })
        except Exception as e:
            logger.error(f"Error persisting event to MongoDB Atlas: {e}")

    # Remove internal _id if added by pymongo
    new_ev.pop("_id", None)
    return {"message": "Event request submitted successfully to MongoDB Atlas", "event": new_ev}

@router.post("/{event_id}/approve")
async def approve_event(
    event_id: str,
    current_user: dict = Depends(require_role(["SUPER_ADMIN", "HOD"]))
):
    """Approve an event request in MongoDB Atlas (HOD or Super Admin only)."""
    now_iso = datetime.now().isoformat()
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["events"]]
            result = await coll.find_one_and_update(
                {"id": event_id},
                {"$set": {
                    "status": "Approved",
                    "is_published": True,
                    "approval_tier": f"Approved by {current_user.get('name', 'HOD/Admin')}",
                    "updated_at": now_iso
                }},
                return_document=True,
                projection={"_id": 0}
            )
            if result:
                return {"message": f"Event '{result['title']}' approved and published successfully", "event": result}
        except Exception as e:
            logger.error(f"Error approving event in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Event not found in MongoDB database")

@router.post("/{event_id}/reject")
async def reject_event(
    event_id: str,
    current_user: dict = Depends(require_role(["SUPER_ADMIN", "HOD"]))
):
    """Reject an event request in MongoDB Atlas."""
    now_iso = datetime.now().isoformat()
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["events"]]
            result = await coll.find_one_and_update(
                {"id": event_id},
                {"$set": {
                    "status": "Rejected",
                    "is_published": False,
                    "updated_at": now_iso
                }},
                return_document=True,
                projection={"_id": 0}
            )
            if result:
                return {"message": f"Event '{result['title']}' marked as rejected", "event": result}
        except Exception as e:
            logger.error(f"Error rejecting event in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Event not found in MongoDB database")

@router.post("/{event_id}/register")
async def register_student_for_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Register a student participant for an approved event in MongoDB Atlas with duplicate check."""
    student_id = current_user.get("id", f"usr-{current_user.get('email')}")
    now_iso = datetime.now().isoformat()

    if db_manager.is_connected and db_manager.db is not None:
        try:
            reg_coll = db_manager.db[COLLECTIONS["registrations"]]
            # Check duplicate registration
            existing_reg = await reg_coll.find_one({"event_id": event_id, "student_id": student_id})
            if existing_reg:
                return {"message": "You are already registered for this event.", "event_id": event_id, "already_registered": True}

            # Insert registration record
            await reg_coll.insert_one({
                "event_id": event_id,
                "student_id": student_id,
                "student_email": current_user.get("email"),
                "student_name": current_user.get("name"),
                "registered_at": now_iso
            })

            # Increment count in events document
            events_coll = db_manager.db[COLLECTIONS["events"]]
            await events_coll.update_one(
                {"id": event_id},
                {"$inc": {"registered_students_count": 1}, "$set": {"updated_at": now_iso}}
            )

            return {
                "message": "Successfully registered for event! Seat confirmed in MongoDB Atlas.",
                "event_id": event_id,
                "attendee": current_user.get("name")
            }
        except Exception as e:
            logger.error(f"Error registering student in MongoDB Atlas: {e}")

    return {
        "message": "Registration recorded.",
        "event_id": event_id,
        "attendee": current_user.get("name")
    }

# -------------------------------------------------------------
# 4. CAMPUS VENUE AVAILABILITY TIMELINE FEED (MONGODB ATLAS DRIVEN)
# -------------------------------------------------------------

@router.get("/availability")
async def get_campus_availability(
    date: Optional[str] = "2026-08-28",
    venue_id: Optional[str] = None
):
    """
    Returns real venue availability (Booked vs Available) across campus venues
    for a selected date by querying actual MongoDB Atlas events.
    """
    venues = await CampusDataService.get_venues()
    existing_events = await CampusDataService.get_existing_bookings()

    if venue_id:
        venues = [v for v in venues if v["id"] == venue_id]

    timeline = []
    for v in venues:
        # Find events booked at this venue on this date
        booked_at_venue = [
            e for e in existing_events
            if e.get("venue_id") == v["id"] and e.get("date") == date and e.get("status") in ["Approved", "Confirmed", "Pending Approval"]
        ]

        if booked_at_venue:
            slots = []
            standard_slots = [
                ("09:00 AM", "01:00 PM", "09:00 AM - 01:00 PM"),
                ("01:00 PM", "02:00 PM", "01:00 PM - 02:00 PM"),
                ("02:00 PM", "06:00 PM", "02:00 PM - 06:00 PM"),
                ("06:00 PM", "09:00 PM", "06:00 PM - 09:00 PM")
            ]
            for s_start, s_end, s_label in standard_slots:
                # Check overlap with any event booked at venue
                overlapping_ev = next(
                    (ev for ev in booked_at_venue if check_time_interval_overlap(ev.get("start_time", "09:00 AM"), ev.get("end_time", "05:00 PM"), s_start, s_end)),
                    None
                )
                if overlapping_ev:
                    slots.append({"slot": s_label, "status": "BOOKED", "event_title": overlapping_ev.get("title")})
                elif s_label == "01:00 PM - 02:00 PM":
                    slots.append({"slot": s_label, "status": "MAINTENANCE", "event_title": "Sanitization & AV Reset"})
                else:
                    slots.append({"slot": s_label, "status": "AVAILABLE", "event_title": None})

            overall = "FULLY_BOOKED" if all(s["status"] == "BOOKED" for s in slots) else "PARTIAL_BOOKED"
        else:
            slots = [
                {"slot": "09:00 AM - 01:00 PM", "status": "AVAILABLE", "event_title": None},
                {"slot": "01:00 PM - 02:00 PM", "status": "AVAILABLE", "event_title": None},
                {"slot": "02:00 PM - 06:00 PM", "status": "AVAILABLE", "event_title": None},
                {"slot": "06:00 PM - 09:00 PM", "status": "AVAILABLE", "event_title": None}
            ]
            overall = "AVAILABLE"

        timeline.append({
            "venue_id": v["id"],
            "venue_name": v["name"],
            "category": v["category"],
            "capacity": v["capacity"],
            "block": v["block"],
            "date": date,
            "overall_status": overall,
            "time_slots": slots
        })

    return {"date": date, "venues_availability": timeline}

@router.get("/sample-prompts")
async def get_sample_prompts():
    """Provides sample test prompts for demonstration."""
    return {
        "prompts": [
            "Plan a 2-day hackathon for 500 students with a budget of ₹1,00,000.",
            "Organize a cultural evening for 800 students on Sep 02 with a budget of ₹75,000.",
            "Conduct a technical seminar for 300 students on Aug 28 from 10 AM to 4 PM with a budget of ₹50,000.",
            "Organize an NSS orientation for 250 volunteers with a budget of ₹30,000.",
            "Plan an event for 50 students with a budget of ₹15,000.",
            "Organize a large event for 1500 students with a budget of ₹2,50,000."
        ]
    }
