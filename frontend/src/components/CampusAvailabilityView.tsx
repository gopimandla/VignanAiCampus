import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles,
  RefreshCw,
  MapPin,
  Users
} from 'lucide-react';
import { VenueAvailability } from '../types';
import { fetchCampusAvailability } from '../services/api';

interface CampusAvailabilityViewProps {
  onSelectSlotForPlanning?: (venueName: string, date: string) => void;
}

export const CampusAvailabilityView: React.FC<CampusAvailabilityViewProps> = ({
  onSelectSlotForPlanning
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-28');
  const [availabilityList, setAvailabilityList] = useState<VenueAvailability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const availableDates = [
    { label: 'Today (Aug 28)', value: '2026-08-28' },
    { label: 'Tomorrow (Aug 29)', value: '2026-08-29' },
    { label: 'Sep 02, 2026', value: '2026-09-02' },
    { label: 'Sep 05, 2026', value: '2026-09-05' },
    { label: 'Sep 10, 2026', value: '2026-09-10' }
  ];

  const loadAvailability = async (date: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCampusAvailability(date);
      setAvailabilityList(data);
    } catch (e) {
      console.warn('Availability load error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate]);

  const filteredVenues = availabilityList.filter((v) => {
    if (statusFilter === 'AVAILABLE') return v.overall_status === 'AVAILABLE';
    if (statusFilter === 'BOOKED') return v.overall_status === 'PARTIAL_BOOKED' || v.overall_status === 'FULLY_BOOKED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b border-warm-200 dark:border-warm-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warm-200/70 text-warm-800 dark:bg-warm-800 dark:text-warm-200 mb-2 border border-warm-300 dark:border-warm-700">
            <Building2 className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
            <span>Campus Real-Time Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-950 dark:text-warm-50 tracking-tight">
            Venue Availability & Timeline Schedule
          </h1>
          <p className="text-xs sm:text-sm text-warm-600 dark:text-warm-400 mt-1 max-w-2xl">
            Inspect real-time booking status across all 10 seminar halls, open air theatres, and grand auditoriums before submitting event requests.
          </p>
        </div>

        {/* Date Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {availableDates.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDate === d.value
                  ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
                  : 'bg-white dark:bg-warm-900 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 border border-warm-200 dark:border-warm-800'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              statusFilter === 'ALL'
                ? 'bg-warm-800 text-warm-50 dark:bg-warm-700'
                : 'text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800'
            }`}
          >
            All Venues ({availabilityList.length})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              statusFilter === 'AVAILABLE'
                ? 'bg-warm-800 text-warm-50 dark:bg-warm-700'
                : 'text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800'
            }`}
          >
            100% Available
          </button>
          <button
            onClick={() => setStatusFilter('BOOKED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              statusFilter === 'BOOKED'
                ? 'bg-warm-800 text-warm-50 dark:bg-warm-700'
                : 'text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800'
            }`}
          >
            Active Bookings
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-warm-600 dark:text-warm-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amberwarm-500" />
            <span>Booked Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warm-400" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Venue Availability Timeline Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center bg-white dark:bg-warm-900 rounded-3xl border border-warm-200 dark:border-warm-800">
            <RefreshCw className="w-6 h-6 animate-spin text-blush-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-warm-600">Querying campus booking registry for {selectedDate}...</p>
          </div>
        ) : (
          filteredVenues.map((v) => (
            <div
              key={v.venue_id}
              className="p-5 rounded-3xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 shadow-warm-sm hover:shadow-warm-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300">
                      {v.category}
                    </span>
                    <span className="text-xs text-warm-500 font-semibold">{v.block}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-warm-950 dark:text-warm-50 mt-1">
                    {v.venue_name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-warm-800 dark:text-warm-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blush-500" />
                      {v.capacity} Seats
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        v.overall_status === 'AVAILABLE'
                          ? 'text-sage-600 dark:text-sage-400'
                          : 'text-amberwarm-600 dark:text-amberwarm-400'
                      }`}
                    >
                      {v.overall_status === 'AVAILABLE' ? 'All Day Available' : 'Partially Booked'}
                    </span>
                  </div>

                  {onSelectSlotForPlanning && (
                    <button
                      onClick={() => onSelectSlotForPlanning(v.venue_name, selectedDate)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-warm-100 hover:bg-blush-100 dark:bg-warm-800 dark:hover:bg-blush-950/60 text-warm-800 hover:text-blush-800 dark:text-warm-200 dark:hover:text-blush-200 transition border border-warm-200 dark:border-warm-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blush-500" />
                      <span>Plan Event Here</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Time Slots Visualization Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-warm-100 dark:border-warm-800 text-xs">
                {v.time_slots.map((ts, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex flex-col justify-between ${
                      ts.status === 'AVAILABLE'
                        ? 'bg-sage-50/60 dark:bg-sage-950/30 border-sage-200 dark:border-sage-900/60'
                        : ts.status === 'BOOKED'
                        ? 'bg-amberwarm-50/70 dark:bg-amberwarm-950/40 border-amberwarm-200 dark:border-amberwarm-900/60'
                        : 'bg-warm-100/70 dark:bg-warm-850 border-warm-200 dark:border-warm-750'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                        <span className="text-warm-700 dark:text-warm-300">{ts.slot}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-sans text-[9px] font-bold ${
                            ts.status === 'AVAILABLE'
                              ? 'text-sage-700 dark:text-sage-300'
                              : 'text-amberwarm-800 dark:text-amberwarm-200'
                          }`}
                        >
                          {ts.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-warm-900 dark:text-warm-100 truncate">
                        {ts.event_title || 'Free for Booking'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
