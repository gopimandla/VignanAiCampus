// ---------------------------------------------
// ONLY 4 Supported Roles in the System
// ---------------------------------------------
export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOD'
  | 'EVENT_ORGANIZER'
  | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface Venue {
  id: string;
  name: string;
  category: string;
  block: string;
  capacity: number;
  ac: boolean;
  av_equipped: boolean;
  suitable_for: string[];
  status: 'available' | 'booked' | 'maintenance';
  description: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
  available_quantity: number;
  unit: string;
  unit_cost?: number;
  editable: boolean;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  qualifications?: string;
  department: string;
  user_provided: boolean;
  editable: boolean;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  qualifications?: string;
  status: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  hod: string;
  faculty_count: number;
}

export interface BlockInfo {
  block_id: string;
  name: string;
  total_floors: number;
  known_patterns: string[];
  description: string;
  known_rooms_count: number;
}

export interface HealthResponse {
  status: string;
  project: string;
  version: string;
  campus: {
    name: string;
    location: string;
  };
  database: {
    status: string;
    name: string;
    connected: boolean;
  };
  ai_engine: {
    provider: string;
    model: string;
    api_key_configured: boolean;
  };
  uptime_seconds: number;
}

// ---------------------------------------------
// Campus Event & Operations Types
// ---------------------------------------------

export interface CampusEvent {
  id: string;
  title: string;
  category: string;
  event_type: string;
  venue_id: string;
  venue_name: string;
  date: string;
  dates_label?: string;
  start_time: string;
  end_time: string;
  expected_participants: number;
  organizer: string;
  organizer_email: string;
  host_department: string;
  budget?: number;
  estimated_cost?: number;
  remaining_budget?: number;
  budget_status?: string;
  status: 'Approved' | 'Pending Approval' | 'Under Review' | 'Rejected' | 'Draft' | string;
  approval_tier: string;
  conflict_status: string;
  description: string;
  registered_students_count: number;
  is_published: boolean;
  created_by_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VenueTimeSlot {
  slot: string;
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'CONFLICT';
  event_title?: string | null;
}

export interface VenueAvailability {
  venue_id: string;
  venue_name: string;
  category: string;
  capacity: number;
  block: string;
  date: string;
  overall_status: 'AVAILABLE' | 'PARTIAL_BOOKED' | 'FULLY_BOOKED';
  time_slots: VenueTimeSlot[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

// ---------------------------------------------
// AI Event Plan Types
// ---------------------------------------------

export interface EventDetails {
  title: string;
  category: string;
  event_type: string;
  expected_participants: number;
  duration: string;
  duration_days: number;
  duration_hours_per_day: number;
  target_audience: string;
  host_department: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  budget?: number;
  estimated_cost?: number;
  remaining_budget?: number;
  budget_status?: string;
  key_objectives: string[];
  special_requirements: string[];
}

export interface VenueRecommendation {
  venue_id: string;
  venue_name: string;
  category: string;
  block: string;
  capacity: number;
  capacity_match: string;
  utilization_percentage: number;
  ac: boolean;
  av_equipped: boolean;
  suitability_score: number;
  suitability_reason: string;
  is_primary: boolean;
}

export interface ResourceAllocation {
  resource_id: string;
  name: string;
  category: string;
  required_quantity: number;
  available_quantity: number;
  allocated_quantity: number;
  unit: string;
  unit_cost?: number;
  total_cost?: number;
  status: 'Optimal' | 'Sufficient' | 'Shortage' | 'Partial' | string;
  notes?: string;
}

export interface ConflictItem {
  conflict_id: string;
  type: 'TIME_OVERLAP' | 'VENUE_OVERLAP' | 'RESOURCE_SHORTAGE' | 'CAPACITY_OVERFLOW' | 'BUDGET_EXCEEDED' | 'LOGISTICAL' | 'WEATHER' | string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'RESOLVED' | 'High' | 'Medium' | 'Low' | 'Resolved' | string;
  title?: string;
  date?: string;
  venue_id?: string;
  venue_name?: string;
  requested_start?: string;
  requested_end?: string;
  existing_event_id?: string;
  existing_event_title?: string;
  existing_start?: string;
  existing_end?: string;
  exceeded_amount?: number;
  description: string;
  impact: string;
  suggested_resolution?: string;
  resolved: boolean;
}

export interface ConflictResolution {
  resolution_id: string;
  target_conflict: string;
  strategy: string;
  action_taken: string;
  status: string;
}

export interface ScheduleItem {
  day: number;
  time_slot: string;
  stage_name: string;
  activity: string;
  venue_allocated: string;
  responsible_team: string;
  notes?: string;
}

export interface AgentTrace {
  agent_id: string;
  agent_name: string;
  responsibility: string;
  status: 'completed' | 'executing' | 'error' | 'waiting';
  execution_time_ms: number;
  summary: string;
  details?: Record<string, any>;
}

export interface EventPlanResponse {
  event: EventDetails;
  assumptions: string[];
  venue_recommendations: VenueRecommendation[];
  selected_venue: VenueRecommendation;
  secondary_venues: VenueRecommendation[];
  resources: ResourceAllocation[];
  conflicts: ConflictItem[];
  resolutions: ConflictResolution[];
  schedule: ScheduleItem[];
  recommendations: string[];
  approval_workflow: Array<{ tier: string; role: string; action: string }>;
  status: string;
  planning_summary: string;
  ai_engine_used: string;
  orchestration_time_ms: number;
  agent_trace: AgentTrace[];
}

export interface PlanRevalidateResponse {
  is_valid: boolean;
  status: string;
  venue_check: {
    venue_name: string;
    capacity: number;
    demanded: number;
    status: string;
    deficit: number;
  };
  resource_check: {
    status: string;
    details: string[];
  };
  conflict_check: {
    conflicts: string[];
    count: number;
  };
  budget_check?: {
    budget: number;
    estimated_cost: number;
    remaining_budget: number;
    budget_status: string;
    utilization_percentage: number;
  };
  structured_conflicts?: ConflictItem[];
  message: string;
}
