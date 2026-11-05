import React, { useState, useEffect } from 'react';
import {
  Shield,
  Bot,
  Building2,
  PackageCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Check,
  X,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { User, Venue, ResourceItem, CampusEvent } from '../types';
import { fetchEvents, approveCampusEvent, rejectCampusEvent } from '../services/api';

interface DashboardShellProps {
  currentUser: User;
  venues: Venue[];
  resources: ResourceItem[];
  onLaunchPlanner: () => void;
  onViewVenues: () => void;
  onViewMasterData: () => void;
  onViewAvailability: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  currentUser,
  venues,
  resources,
  onLaunchPlanner,
  onViewVenues,
  onViewMasterData,
  onViewAvailability
}) => {
  const [eventsList, setEventsList] = useState<CampusEvent[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isHOD = currentUser.role === 'HOD';
  const isOrganizer = currentUser.role === 'EVENT_ORGANIZER';

  const loadEvents = async () => {
    const data = await fetchEvents();
    if (data && data.length > 0) {
      setEventsList(data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async (eventId: string, title: string) => {
    try {
      await approveCampusEvent(eventId);
      setActionNotice(`Event "${title}" has been approved and published.`);
      loadEvents();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReject = async (eventId: string, title: string) => {
    try {
      await rejectCampusEvent(eventId);
      setActionNotice(`Event "${title}" has been rejected.`);
      loadEvents();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const pendingEvents = eventsList.filter(e => e.status === 'Pending Approval' || e.status === 'Under Review');
  const approvedEvents = eventsList.filter(e => e.status === 'Approved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Identity Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-warm-200 dark:border-warm-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blush-100 text-blush-900 dark:bg-blush-950 dark:text-blush-200 border border-blush-200 dark:border-blush-800 mb-2">
            <Shield className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
            <span>
              {isSuperAdmin
                ? 'Super Admin Operations Command Center'
                : isHOD
                ? 'Department Event Operations Desk'
                : 'Event Manager Workspace'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-950 dark:text-warm-50 tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-warm-600 dark:text-warm-400 mt-1">
            {currentUser.department || 'VFSTR Vadlamudi'} • Role: <strong className="text-warm-900 dark:text-warm-100">{currentUser.role}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onLaunchPlanner}
            className="px-4 py-2.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 font-bold text-xs shadow-warm-sm transition flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-blush-300" />
            <span>Launch AI Planner</span>
          </button>

          <button
            onClick={onViewAvailability}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-warm-900 hover:bg-warm-100 dark:hover:bg-warm-850 text-warm-800 dark:text-warm-200 font-bold text-xs border border-warm-200 dark:border-warm-800 transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-blush-500" />
            <span>Venue Schedule</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={onViewMasterData}
              className="px-4 py-2.5 rounded-xl bg-blush-100 dark:bg-blush-950 text-blush-900 dark:text-blush-200 hover:bg-blush-200 dark:hover:bg-blush-900 font-bold text-xs border border-blush-200 dark:border-blush-800 transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blush-600" />
              <span>Master Data Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs font-bold flex items-center gap-2 shadow-warm-sm">
          <CheckCircle2 className="w-4 h-4 text-sage-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-2 font-bold uppercase tracking-wider text-[10px]">
            <span>Active Venues</span>
            <Building2 className="w-4 h-4 text-blush-500" />
          </div>
          <p className="text-2xl font-black text-warm-950 dark:text-warm-50">{venues.length}</p>
          <p className="text-[11px] text-sage-600 dark:text-sage-400 font-semibold mt-1">100% Operational</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-2 font-bold uppercase tracking-wider text-[10px]">
            <span>Approved Events</span>
            <CheckCircle2 className="w-4 h-4 text-sage-500" />
          </div>
          <p className="text-2xl font-black text-warm-950 dark:text-warm-50">{approvedEvents.length}</p>
          <p className="text-[11px] text-warm-500 mt-1">Published to Campus</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-2 font-bold uppercase tracking-wider text-[10px]">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amberwarm-500" />
          </div>
          <p className="text-2xl font-black text-amberwarm-600 dark:text-amberwarm-400">{pendingEvents.length}</p>
          <p className="text-[11px] text-warm-500 mt-1">Awaiting Review</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-2 font-bold uppercase tracking-wider text-[10px]">
            <span>Resource Streams</span>
            <PackageCheck className="w-4 h-4 text-blush-500" />
          </div>
          <p className="text-2xl font-black text-warm-950 dark:text-warm-50">{resources.length}</p>
          <p className="text-[11px] text-warm-500 mt-1">Stock Monitored</p>
        </div>
      </div>

      {/* Pending Approvals Section (For HOD & Super Admin) */}
      {(isSuperAdmin || isHOD) && pendingEvents.length > 0 && (
        <div className="mb-8 bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-100 dark:border-warm-800">
            <div>
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blush-500" />
                Pending Event Approvals ({pendingEvents.length})
              </h3>
              <p className="text-xs text-warm-500">Review and authorize submitted campus event blueprints</p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amberwarm-100 text-amberwarm-800 dark:bg-amberwarm-950 dark:text-amberwarm-300">
                      {ev.category}
                    </span>
                    <span className="text-[11px] text-warm-500">{ev.host_department}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-warm-950 dark:text-warm-50 mt-1">{ev.title}</h4>
                  <p className="text-[11px] text-warm-600 dark:text-warm-400 mt-0.5">
                    {ev.venue_name} • {ev.dates_label || ev.date} ({ev.start_time} - {ev.end_time}) • {ev.expected_participants} Attendees
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(ev.id, ev.title)}
                    className="px-3 py-1.5 rounded-xl bg-warm-200/80 hover:bg-red-100 dark:bg-warm-800 text-warm-800 hover:text-red-700 dark:text-warm-200 font-bold transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(ev.id, ev.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold shadow-warm-sm transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-sage-300" /> Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Operations Feed */}
      <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-100 dark:border-warm-800">
          <div>
            <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">
              Active Campus Events & Blueprints
            </h3>
            <p className="text-xs text-warm-500">Live registry of scheduled seminars, cultural meets, and hackathons</p>
          </div>
        </div>

        <div className="space-y-3">
          {eventsList.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-warm-50/60 dark:bg-warm-950 border border-warm-200/80 dark:border-warm-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-warm-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-warm-200 dark:bg-warm-800 text-warm-800 dark:text-warm-200">
                    {ev.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.status === 'Approved'
                        ? 'bg-sage-50 text-sage-700 dark:bg-sage-950 dark:text-sage-300 border border-sage-200 dark:border-sage-800'
                        : 'bg-amberwarm-50 text-amberwarm-700 dark:bg-amberwarm-950 dark:text-amberwarm-300 border border-amberwarm-200 dark:border-amberwarm-800'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-warm-950 dark:text-warm-50 mt-1">{ev.title}</h4>
                <p className="text-[11px] text-warm-600 dark:text-warm-400 mt-0.5">
                  {ev.venue_name} • {ev.dates_label || ev.date} • {ev.expected_participants} Students • Organizer: {ev.organizer}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-warm-800 dark:text-warm-200 block">
                  {ev.registered_students_count} Registered
                </span>
                <span className="text-[10px] text-warm-500 font-mono">
                  {ev.conflict_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
