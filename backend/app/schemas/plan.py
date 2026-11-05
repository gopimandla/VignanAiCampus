from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EventPlanRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="User's natural language event requirement")
    preferred_venue: Optional[str] = None
    expected_attendees: Optional[int] = None
    date: Optional[str] = "2026-08-28"
    start_time: Optional[str] = "09:00 AM"
    end_time: Optional[str] = "05:00 PM"
    budget: Optional[float] = 50000.0

class EventDetails(BaseModel):
    title: str
    category: str
    event_type: str
    expected_participants: int
    duration: str
    duration_days: int
    duration_hours_per_day: int
    target_audience: str
    host_department: str
    date: str = "2026-08-28"
    start_time: str = "09:00 AM"
    end_time: str = "05:00 PM"
    budget: float = 50000.0
    estimated_cost: float = 0.0
    remaining_budget: float = 0.0
    budget_status: str = "WITHIN_BUDGET"  # 'WITHIN_BUDGET', 'NEAR_LIMIT', 'BUDGET_EXCEEDED'
    key_objectives: List[str]
    special_requirements: List[str]

class VenueRecommendation(BaseModel):
    venue_id: str
    venue_name: str
    category: str
    block: str
    capacity: int
    capacity_match: str  # 'Perfect', 'Sufficient', 'Overflow Risk', 'Exceeds Demand'
    utilization_percentage: float
    ac: bool
    av_equipped: bool
    suitability_score: int  # 0 - 100
    suitability_reason: str
    is_primary: bool = False

class ResourceAllocation(BaseModel):
    resource_id: str
    name: str
    category: str
    required_quantity: int
    available_quantity: int
    allocated_quantity: int
    unit: str
    unit_cost: float = 0.0
    total_cost: float = 0.0
    status: str  # 'Sufficient', 'Partial', 'Shortage', 'Optimal'
    notes: Optional[str] = None

class ConflictItem(BaseModel):
    conflict_id: str
    type: str  # 'TIME_OVERLAP', 'VENUE_OVERLAP', 'RESOURCE_SHORTAGE', 'CAPACITY_OVERFLOW', 'BUDGET_EXCEEDED', 'LOGISTICAL'
    severity: str  # 'HIGH', 'MEDIUM', 'LOW', 'RESOLVED'
    title: Optional[str] = None
    date: Optional[str] = None
    venue_id: Optional[str] = None
    venue_name: Optional[str] = None
    requested_start: Optional[str] = None
    requested_end: Optional[str] = None
    existing_event_id: Optional[str] = None
    existing_event_title: Optional[str] = None
    existing_start: Optional[str] = None
    existing_end: Optional[str] = None
    exceeded_amount: Optional[float] = None
    description: str
    impact: str
    suggested_resolution: Optional[str] = None
    resolved: bool = False

class ConflictResolution(BaseModel):
    resolution_id: str
    target_conflict: str
    strategy: str
    action_taken: str
    status: str  # 'Applied', 'Alternative Selected', 'Mitigated'

class ScheduleItem(BaseModel):
    day: int
    time_slot: str
    stage_name: str
    activity: str
    venue_allocated: str
    responsible_team: str
    notes: Optional[str] = None

class AgentTrace(BaseModel):
    agent_id: str
    agent_name: str
    responsibility: str
    status: str  # 'completed', 'executing', 'error'
    execution_time_ms: float
    summary: str
    details: Optional[Dict[str, Any]] = None

class EventPlanResponse(BaseModel):
    event: EventDetails
    assumptions: List[str]
    venue_recommendations: List[VenueRecommendation]
    selected_venue: VenueRecommendation
    secondary_venues: List[VenueRecommendation] = []
    resources: List[ResourceAllocation]
    conflicts: List[ConflictItem]
    resolutions: List[ConflictResolution]
    schedule: List[ScheduleItem]
    recommendations: List[str]
    approval_workflow: List[Dict[str, str]]
    status: str  # 'Optimal - Feasible', 'Feasible with Replanning', 'Requires Review'
    planning_summary: str
    ai_engine_used: str
    orchestration_time_ms: float
    agent_trace: List[AgentTrace]
