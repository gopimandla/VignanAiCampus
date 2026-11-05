import {
  HealthResponse,
  Venue,
  ResourceItem,
  LeadershipMember,
  FacultyMember,
  DepartmentItem,
  BlockInfo,
  EventPlanResponse,
  PlanRevalidateResponse,
  CampusEvent,
  VenueAvailability,
  AuditLogItem,
  User
} from '../types';

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export function getAuthToken(): string | null {
  return localStorage.getItem('vignan_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('vignan_auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('vignan_auth_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// -------------------------------------------------------------
// Health Diagnostics
// -------------------------------------------------------------
export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    return {
      status: 'offline',
      project: 'Vignan AI Campus EventOps',
      version: '1.0.0',
      campus: {
        name: "Vignan's Foundation for Science, Technology and Research",
        location: "Vadlamudi, Guntur, Andhra Pradesh",
      },
      database: {
        status: 'disconnected',
        name: 'vignan_eventops',
        connected: false
      },
      ai_engine: {
        provider: 'Anthropic Claude',
        model: 'claude-3-5-sonnet-20241022',
        api_key_configured: false
      },
      uptime_seconds: 0
    };
  }
}

// -------------------------------------------------------------
// Authentication & RBAC
// -------------------------------------------------------------
export async function loginUser(email: string, password: string, roleHint?: string): Promise<{ access_token: string; user: User }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: roleHint })
    });
  } catch (err) {
    throw new Error('Unable to reach the EventOps server. Please check the backend deployment.');
  }

  if (!res.ok) {
    let detail = 'Authentication failed';
    try {
      const err = await res.json();
      if (err && err.detail) detail = err.detail;
    } catch {
      if (res.status === 401) detail = 'Invalid email or password credentials.';
      else if (res.status === 503) detail = 'Database is temporarily unavailable. Please try again.';
      else if (res.status >= 500) detail = 'Server/database error. Please try again.';
      else detail = `Login failed (HTTP ${res.status})`;
    }
    throw new Error(detail);
  }

  const data = await res.json();
  setAuthToken(data.access_token);
  return data;
}

export async function registerUser(data: { name: string; email: string; password: string; role: string; department?: string }): Promise<{ access_token: string; user: User }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    throw new Error('Unable to reach the EventOps server. Please check the backend deployment.');
  }

  if (!res.ok) {
    let detail = 'Registration failed';
    try {
      const err = await res.json();
      if (err && err.detail) detail = err.detail;
    } catch {
      if (res.status === 400) detail = 'An account with this email address already exists.';
      else if (res.status === 403) detail = 'Public registration is only permitted for Student and Event Organizer roles.';
      else if (res.status === 503) detail = 'Database is temporarily unavailable. Please try again.';
      else if (res.status >= 500) detail = 'Server/database error. Please try again.';
      else detail = `Registration failed (HTTP ${res.status})`;
    }
    throw new Error(detail);
  }

  const result = await res.json();
  setAuthToken(result.access_token);
  return result;
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to restore user session');
  }
  const data = await res.json();
  return data.user;
}

// -------------------------------------------------------------
// AI 5-Agent Event Planning & Revalidation
// -------------------------------------------------------------
export async function generateEventPlan(
  prompt: string,
  options?: {
    preferred_venue?: string;
    expected_attendees?: number;
    date?: string;
    start_time?: string;
    end_time?: string;
    budget?: number;
  }
): Promise<EventPlanResponse> {
  const payload = {
    prompt,
    preferred_venue: options?.preferred_venue,
    expected_attendees: options?.expected_attendees,
    date: options?.date,
    start_time: options?.start_time,
    end_time: options?.end_time,
    budget: options?.budget
  };

  const res = await fetch(`${API_BASE_URL}/events/plan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(errData.detail || `Server responded with ${res.status}`);
  }

  return await res.json();
}

export async function revalidatePlan(payload: {
  title: string;
  venue_name: string;
  expected_participants: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  budget?: number;
  required_resources?: Record<string, number>;
}): Promise<PlanRevalidateResponse> {
  const res = await fetch(`${API_BASE_URL}/events/revalidate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Revalidation check failed' }));
    throw new Error(err.detail || 'Revalidation failed');
  }
  return await res.json();
}

// Alias helper functions
export async function checkEventConflicts(payload: any): Promise<PlanRevalidateResponse> {
  return revalidatePlan(payload);
}

export async function calculateBudget(payload: any): Promise<PlanRevalidateResponse> {
  return revalidatePlan(payload);
}

// -------------------------------------------------------------
// Campus Events Operations
// -------------------------------------------------------------
export async function fetchEvents(category?: string, statusFilter?: string): Promise<CampusEvent[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (statusFilter) params.append('status_filter', statusFilter);

    const res = await fetch(`${API_BASE_URL}/events?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.events || [];
    }
  } catch (e) {
    console.warn('Failed to fetch events from API', e);
  }
  return [];
}

export async function createCampusEvent(eventData: any): Promise<CampusEvent> {
  const res = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Event creation failed' }));
    throw new Error(err.detail || 'Event creation failed');
  }
  const data = await res.json();
  return data.event;
}

export async function approveCampusEvent(eventId: string): Promise<CampusEvent> {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Approval action failed' }));
    throw new Error(err.detail || 'Approval failed');
  }
  const data = await res.json();
  return data.event;
}

export async function rejectCampusEvent(eventId: string): Promise<CampusEvent> {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Rejection action failed' }));
    throw new Error(err.detail || 'Rejection failed');
  }
  const data = await res.json();
  return data.event;
}

export async function registerStudentForEvent(eventId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return await res.json();
}

export async function fetchCampusAvailability(date: string = '2026-08-28', venueId?: string): Promise<VenueAvailability[]> {
  try {
    let url = `${API_BASE_URL}/events/availability?date=${encodeURIComponent(date)}`;
    if (venueId) url += `&venue_id=${encodeURIComponent(venueId)}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.venues_availability || [];
    }
  } catch (e) {
    console.warn('Availability feed failed', e);
  }
  return [];
}

// -------------------------------------------------------------
// Super Admin Master Data CRUD (Strictly RBAC Protected)
// -------------------------------------------------------------
export async function fetchAdminVenues(): Promise<Venue[]> {
  const res = await fetch(`${API_BASE_URL}/admin/venues`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} - Admin privilege required.`);
  const data = await res.json();
  return data.venues || [];
}

export async function createAdminVenue(venue: any): Promise<Venue> {
  const res = await fetch(`${API_BASE_URL}/admin/venues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(venue)
  });
  if (!res.ok) throw new Error(`Failed to create venue (HTTP ${res.status})`);
  const data = await res.json();
  return data.venue;
}

export async function updateAdminVenue(id: string, venue: any): Promise<Venue> {
  const res = await fetch(`${API_BASE_URL}/admin/venues/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(venue)
  });
  if (!res.ok) throw new Error(`Failed to update venue (HTTP ${res.status})`);
  const data = await res.json();
  return data.venue;
}

export async function deleteAdminVenue(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/venues/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to delete venue (HTTP ${res.status})`);
}

export async function fetchAdminResources(): Promise<ResourceItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/resources`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} - Admin privilege required.`);
  const data = await res.json();
  return data.resources || [];
}

export async function createAdminResource(resource: any): Promise<ResourceItem> {
  const res = await fetch(`${API_BASE_URL}/admin/resources`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resource)
  });
  if (!res.ok) throw new Error(`Failed to create resource (HTTP ${res.status})`);
  const data = await res.json();
  return data.resource;
}

export async function updateAdminResource(id: string, resource: any): Promise<ResourceItem> {
  const res = await fetch(`${API_BASE_URL}/admin/resources/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(resource)
  });
  if (!res.ok) throw new Error(`Failed to update resource (HTTP ${res.status})`);
  const data = await res.json();
  return data.resource;
}

export async function deleteAdminResource(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/resources/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to delete resource (HTTP ${res.status})`);
}

export async function fetchAdminFaculty(): Promise<FacultyMember[]> {
  const res = await fetch(`${API_BASE_URL}/admin/faculty`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} - Admin privilege required.`);
  const data = await res.json();
  return data.faculty || [];
}

export async function createAdminFaculty(faculty: any): Promise<FacultyMember> {
  const res = await fetch(`${API_BASE_URL}/admin/faculty`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(faculty)
  });
  if (!res.ok) throw new Error(`Failed to add faculty (HTTP ${res.status})`);
  const data = await res.json();
  return data.faculty;
}

export async function updateAdminFaculty(id: string, faculty: any): Promise<FacultyMember> {
  const res = await fetch(`${API_BASE_URL}/admin/faculty/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(faculty)
  });
  if (!res.ok) throw new Error(`Failed to update faculty (HTTP ${res.status})`);
  const data = await res.json();
  return data.faculty;
}

export async function deleteAdminFaculty(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/faculty/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to delete faculty (HTTP ${res.status})`);
}

export async function fetchAdminDepartments(): Promise<DepartmentItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/departments`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} - Admin privilege required.`);
  const data = await res.json();
  return data.departments || [];
}

export async function createAdminDepartment(dept: any): Promise<DepartmentItem> {
  const res = await fetch(`${API_BASE_URL}/admin/departments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dept)
  });
  if (!res.ok) throw new Error(`Failed to create department (HTTP ${res.status})`);
  const data = await res.json();
  return data.department;
}

export async function fetchAdminAuditLogs(): Promise<AuditLogItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} - Admin privilege required.`);
  const data = await res.json();
  return data.audit_logs || [];
}

export async function fetchSeedVenues(): Promise<Venue[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/campus/venues`);
    if (res.ok) {
      const data = await res.json();
      return data.venues || [];
    }
  } catch (e) {
    console.warn('Using local fallback for venues', e);
  }
  return [];
}

export async function fetchSeedResources(): Promise<ResourceItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/campus/resources`);
    if (res.ok) {
      const data = await res.json();
      return data.resources || [];
    }
  } catch (e) {
    console.warn('Using local fallback for resources', e);
  }
  return [];
}

export async function fetchSeedLeadership(): Promise<LeadershipMember[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/campus/leadership`);
    if (res.ok) {
      const data = await res.json();
      return data.leadership || [];
    }
  } catch (e) {
    console.warn('Using local fallback for leadership', e);
  }
  return [];
}

export async function fetchSeedBlocks(): Promise<BlockInfo[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/campus/blocks`);
    if (res.ok) {
      const data = await res.json();
      return data.blocks || [];
    }
  } catch (e) {
    console.warn('Using local fallback for blocks', e);
  }
  return [];
}
