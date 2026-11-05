import time
from typing import List, Dict, Any
from app.utils.time_utils import check_time_interval_overlap, parse_time_to_minutes
from app.schemas.plan import (
    EventDetails,
    VenueRecommendation,
    ResourceAllocation,
    ConflictItem,
    ScheduleItem
)

class ConflictScheduleAgent:
    """
    Agent 4 — Schedule / Conflict Agent
    Performs real multi-dimensional conflict detection:
    - Date & Start/End Time Interval Venue Overlaps
    - Venue Capacity Overflows
    - Resource Inventory Shortages
    - Budget Limit Exceeded
    - Environmental & Logistical Constraints
    and synthesizes a day-by-day chronological agenda.
    """
    def __init__(self):
        self.name = "Conflict / Schedule Agent"
        self.responsibility = "Multi-Factor Interval Overlap, Budget & Schedule Conflict Detection"

    async def execute(
        self,
        event_details: EventDetails,
        selected_venue: VenueRecommendation,
        resource_allocations: List[ResourceAllocation],
        shortages: List[str],
        schedule_outline: List[Dict[str, Any]],
        existing_bookings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        start_time = time.time()
        conflicts: List[ConflictItem] = []

        # 1. Real Date + Start Time + End Time Interval Overlap Conflict Check
        for booking in existing_bookings:
            b_venue_id = booking.get("venue_id")
            b_date = booking.get("date")
            b_status = booking.get("status", "Approved")

            # Check if booking is on same venue and same date
            if b_venue_id == selected_venue.venue_id and (b_date == event_details.date or not b_date):
                b_start = booking.get("start_time", "09:00 AM")
                b_end = booking.get("end_time", "05:00 PM")

                # Interval overlap check: existing_start < requested_end AND existing_end > requested_start
                is_overlap = check_time_interval_overlap(
                    start1_str=b_start,
                    end1_str=b_end,
                    start2_str=event_details.start_time,
                    end2_str=event_details.end_time
                )

                if is_overlap:
                    severity = "HIGH" if b_status in ["Approved", "Confirmed"] else "MEDIUM"
                    conflicts.append(
                        ConflictItem(
                            conflict_id=f"conf-bk-{booking.get('id', booking.get('event_id', '01'))}",
                            type="TIME_OVERLAP",
                            severity=severity,
                            title=f"Time Overlap with '{booking.get('title')}'",
                            date=event_details.date,
                            venue_id=selected_venue.venue_id,
                            venue_name=selected_venue.venue_name,
                            requested_start=event_details.start_time,
                            requested_end=event_details.end_time,
                            existing_event_id=booking.get("id", booking.get("event_id")),
                            existing_event_title=booking.get("title"),
                            existing_start=b_start,
                            existing_end=b_end,
                            description=f"Venue '{selected_venue.venue_name}' is already booked on {event_details.date} from {b_start} to {b_end} for '{booking.get('title')}'. Requested slot ({event_details.start_time} - {event_details.end_time}) overlaps.",
                            impact="The requested event cannot be scheduled in this venue during the selected time.",
                            suggested_resolution="Choose another venue, choose another start/end time, or choose another date.",
                            resolved=False
                        )
                    )

        # 2. Capacity Overflow Check
        if selected_venue.capacity < event_details.expected_participants:
            deficit = event_details.expected_participants - selected_venue.capacity
            conflicts.append(
                ConflictItem(
                    conflict_id="conf-cap-01",
                    type="CAPACITY_OVERFLOW",
                    severity="HIGH",
                    title="Venue Capacity Overflow",
                    venue_id=selected_venue.venue_id,
                    venue_name=selected_venue.venue_name,
                    description=f"Selected venue '{selected_venue.venue_name}' capacity ({selected_venue.capacity} seats) is smaller than requested attendee volume ({event_details.expected_participants}).",
                    impact=f"Potential overflow of {deficit} students.",
                    suggested_resolution="Select a larger hall (e.g. Convocation Hall / Sa Re Ga Ma) or configure multi-hall spillover.",
                    resolved=False
                )
            )

        # 3. Budget Exceeded Conflict Check
        if event_details.budget > 0 and event_details.estimated_cost > event_details.budget:
            exceeded_amt = event_details.estimated_cost - event_details.budget
            conflicts.append(
                ConflictItem(
                    conflict_id="conf-budget-01",
                    type="BUDGET_EXCEEDED",
                    severity="HIGH",
                    title="Budget Limit Exceeded",
                    exceeded_amount=exceeded_amt,
                    description=f"Estimated event cost (₹{event_details.estimated_cost:,.2f}) exceeds specified budget (₹{event_details.budget:,.2f}) by ₹{exceeded_amt:,.2f}.",
                    impact="Event financial requirement exceeds approved department budget limit.",
                    suggested_resolution="Reduce resource quantities, select lower-cost AV options, or request a budget increase.",
                    resolved=False
                )
            )

        # 4. Resource Shortage Conflicts
        for idx, shortage_text in enumerate(shortages):
            conflicts.append(
                ConflictItem(
                    conflict_id=f"conf-res-{idx+1}",
                    type="RESOURCE_SHORTAGE",
                    severity="MEDIUM",
                    title="Campus Resource Deficit",
                    description=shortage_text,
                    impact="Equipment deficit requires inventory scaling or backup substitution.",
                    suggested_resolution="Request supplementary buffer through Estate & Logistics Office or scale down quantity.",
                    resolved=False
                )
            )

        # 5. Logistical & Environmental Constraints
        if event_details.duration_days > 1 and "hackathon" in event_details.event_type.lower():
            conflicts.append(
                ConflictItem(
                    conflict_id="conf-ops-01",
                    type="LOGISTICAL",
                    severity="LOW",
                    title="Continuous Overnight Logistics",
                    description="Continuous multi-day / overnight hackathon demands 24x7 security, backup generators, and canteen coordination.",
                    impact="Shift schedules required for security & facility teams.",
                    suggested_resolution="Deploy night shift SAC volunteers & campus security desk authorization.",
                    resolved=True
                )
            )

        if "oat" in selected_venue.venue_id.lower():
            conflicts.append(
                ConflictItem(
                    conflict_id="conf-env-01",
                    type="WEATHER",
                    severity="LOW",
                    title="Outdoor Environmental Conditions",
                    description="Open Air Theatre is subject to outdoor weather conditions and requires stage lighting after sunset.",
                    impact="Contingency indoor backup hall recommended.",
                    suggested_resolution="Hold contingency indoor venue slot in Central Academic Block.",
                    resolved=True
                )
            )

        # 6. Build Dynamic Schedule
        schedule: List[ScheduleItem] = self._build_dynamic_schedule(
            event_details, selected_venue, schedule_outline
        )

        exec_time = round((time.time() - start_time) * 1000, 2)

        return {
            "conflicts": conflicts,
            "schedule": schedule,
            "trace": {
                "agent_id": "agent-4-conflict",
                "agent_name": self.name,
                "responsibility": self.responsibility,
                "status": "completed",
                "execution_time_ms": exec_time,
                "summary": f"Evaluated interval overlaps & budget. Detected {len(conflicts)} conflict(s) ({len([c for c in conflicts if not c.resolved])} active) and generated {len(schedule)} schedule milestone(s).",
                "details": {
                    "total_conflicts": len(conflicts),
                    "active_conflicts": len([c for c in conflicts if not c.resolved]),
                    "schedule_stages_count": len(schedule)
                }
            }
        }

    def _build_dynamic_schedule(
        self,
        event_details: EventDetails,
        venue: VenueRecommendation,
        outline: List[Dict[str, Any]]
    ) -> List[ScheduleItem]:
        """Synthesizes structured timeline tailored to event type and days."""
        items: List[ScheduleItem] = []
        days = event_details.duration_days
        event_type = event_details.event_type.lower()
        dept = event_details.host_department

        if outline and len(outline) > 0:
            for item in outline:
                items.append(
                    ScheduleItem(
                        day=item.get("day", 1),
                        time_slot=item.get("time_slot", f"{event_details.start_time} - {event_details.end_time}"),
                        stage_name=item.get("stage_name", "Event Session"),
                        activity=item.get("activity", "Scheduled session activity"),
                        venue_allocated=venue.venue_name,
                        responsible_team=item.get("responsible_team", dept),
                        notes=item.get("notes", "Confirmed slot")
                    )
                )
            return items

        # Tailored schedule generation based on taxonomy
        if "hackathon" in event_type or "ideathon" in event_type:
            if days >= 2:
                items.append(ScheduleItem(
                    day=1,
                    time_slot="08:30 AM - 10:00 AM",
                    stage_name="Delegate Check-In & Team Kit Distribution",
                    activity="Registration verification, Wi-Fi credential issuance, and table seating allocation.",
                    venue_allocated=f"{venue.venue_name} - Reception Foyer",
                    responsible_team="SAC Volunteers & IT Desk"
                ))
                items.append(ScheduleItem(
                    day=1,
                    time_slot="10:00 AM - 11:30 AM",
                    stage_name="Grand Inauguration & Problem Statements Release",
                    activity="Welcome address by HOD / Dignitaries, rules briefing, and release of hack tracks.",
                    venue_allocated=venue.venue_name,
                    responsible_team=dept
                ))
                items.append(ScheduleItem(
                    day=1,
                    time_slot="11:30 AM - 07:00 PM",
                    stage_name="Phase 1: Architecture & Prototyping Sprint",
                    activity="Continuous coding sprint, technical mentorship check-in round 1, and architecture validation.",
                    venue_allocated=f"{venue.venue_name} & Lab Wings",
                    responsible_team="Technical Committee & Mentors"
                ))
                items.append(ScheduleItem(
                    day=1,
                    time_slot="07:00 PM - OVERNIGHT",
                    stage_name="Phase 2: Overnight Deep Build & Mid-Evaluation",
                    activity="Midnight evaluation checkpoint, refreshment rounds, and continuous hackathon development.",
                    venue_allocated=venue.venue_name,
                    responsible_team="Night Shift Coordinators & Security"
                ))
                items.append(ScheduleItem(
                    day=2,
                    time_slot="08:00 AM - 01:00 PM",
                    stage_name="Phase 3: Integration, Polish & Code Freeze",
                    activity="Final software testing, repository submissions, PPT upload, and hard code freeze.",
                    venue_allocated=venue.venue_name,
                    responsible_team="Jury Support Team"
                ))
                items.append(ScheduleItem(
                    day=2,
                    time_slot="02:00 PM - 05:30 PM",
                    stage_name="Grand Jury Pitching & Award Ceremony",
                    activity="Top 10 finalist stage demos, jury scoring, prize distribution, and valedictory ceremony.",
                    venue_allocated=venue.venue_name,
                    responsible_team="SAC Leadership & Department HOD"
                ))
            else:
                items.append(ScheduleItem(
                    day=1,
                    time_slot="09:00 AM - 10:30 AM",
                    stage_name="Inauguration & Track Briefing",
                    activity="Hackathon commencement, team kit distribution, and track briefing.",
                    venue_allocated=venue.venue_name,
                    responsible_team=dept
                ))
                items.append(ScheduleItem(
                    day=1,
                    time_slot="10:30 AM - 04:00 PM",
                    stage_name="Rapid Development Hack Sprint",
                    activity="Sprint coding, live mentor rounds, and prototype development.",
                    venue_allocated=venue.venue_name,
                    responsible_team="Technical Coordinators"
                ))
                items.append(ScheduleItem(
                    day=1,
                    time_slot="04:30 PM - 06:00 PM",
                    stage_name="Jury Evaluation & Prize Distribution",
                    activity="Live project demos, evaluation, certificate and cash prize distribution.",
                    venue_allocated=venue.venue_name,
                    responsible_team="Organizing Committee"
                ))

        elif "cultural" in event_type or "fest" in event_type:
            items.append(ScheduleItem(
                day=1,
                time_slot="04:00 PM - 05:30 PM",
                stage_name="Sound Check & Stage Logistics Setup",
                activity="Audio level balancing, mic sound checks, green room allocation, and lighting presets.",
                venue_allocated=venue.venue_name,
                responsible_team="Facilities & AV Sound Team"
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="05:30 PM - 07:00 PM",
                stage_name="Classical & Traditional Arts Showcase",
                activity="Inaugural lamp lighting, classical dance performances, and instrumental orchestra.",
                venue_allocated=venue.venue_name,
                responsible_team="Cultural Club Leads"
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="07:00 PM - 09:30 PM",
                stage_name="Live Band & Celebrity Performance",
                activity="Student rock band performance, thematic dance acts, and guest artist stage show.",
                venue_allocated=venue.venue_name,
                responsible_team="SAC & Campus Security"
            ))

        elif "nss" in event_type or "social" in event_type:
            items.append(ScheduleItem(
                day=1,
                time_slot="08:00 AM - 09:30 AM",
                stage_name="Volunteer Assembly & Briefing",
                activity="Roll call, squad kit distribution (gloves, badges, first aid), and mission briefing.",
                venue_allocated=venue.venue_name,
                responsible_team="NSS Coordinators"
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="09:30 AM - 01:00 PM",
                stage_name="Field Activity & Community Outreach",
                activity="Execution of cleanliness drive, tree plantation, and rural awareness campaign.",
                venue_allocated="Campus Grounds & Surrounding Zones",
                responsible_team="Field Supervisors & Security"
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="02:00 PM - 03:30 PM",
                stage_name="Debriefing & Appreciation Session",
                activity="Activity reflection, photo session, and distribution of participation certificates.",
                venue_allocated=venue.venue_name,
                responsible_team="NSS Cell Leadership"
            ))

        elif "seminar" in event_type or "academic" in event_type or "conference" in event_type:
            items.append(ScheduleItem(
                day=1,
                time_slot="09:30 AM - 10:30 AM",
                stage_name="Keynote Address & Research Presentation",
                activity="Opening ceremony, keynote address by guest speaker, and research overview.",
                venue_allocated=venue.venue_name,
                responsible_team=dept
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="11:00 AM - 01:00 PM",
                stage_name="Technical Session 1: Papers & Innovations",
                activity="Domain paper presentations, live Q&A, and peer academic reviews.",
                venue_allocated=venue.venue_name,
                responsible_team="Faculty Coordinators"
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="02:00 PM - 04:00 PM",
                stage_name="Panel Discussion & Interactive Colloquium",
                activity="Industry-academia panel discussion, emerging tech exchange, and student interaction.",
                venue_allocated=venue.venue_name,
                responsible_team="Session Chairs"
            ))
            items.append(ScheduleItem(
                day=1,
                time_slot="04:00 PM - 05:00 PM",
                stage_name="Valedictory & Networking High Tea",
                activity="Certificate distribution, formal vote of thanks, and networking high tea.",
                venue_allocated=venue.venue_name,
                responsible_team="Hospitality & SAC"
            ))

        else:
            items.append(ScheduleItem(
                day=1,
                time_slot=f"{event_details.start_time} - {event_details.end_time}",
                stage_name="Main Event Execution",
                activity="Scheduled program activities and interactive sessions.",
                venue_allocated=venue.venue_name,
                responsible_team=dept
            ))

        return items

conflict_schedule_agent = ConflictScheduleAgent()
