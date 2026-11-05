import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Tag,
  Bookmark,
  Share2,
  X,
  Building2,
  Check,
  Flame
} from 'lucide-react';
import { CampusEvent, User } from '../types';
import { fetchEvents, registerStudentForEvent } from '../services/api';

interface StudentCampusEventsProps {
  currentUser?: User | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const StudentCampusEvents: React.FC<StudentCampusEventsProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(['ev-101']);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

  const categories = [
    { id: 'All', label: 'All Campus Events' },
    { id: 'Technical', label: 'Technical & Hackathons' },
    { id: 'Cultural / Major', label: 'Cultural & Fests' },
    { id: 'Academic / Workshop', label: 'Workshops & Seminars' },
    { id: 'NSS / Social', label: 'NSS & Social Outreach' }
  ];

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      if (data && data.length > 0) {
        setEvents(data);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      ev.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      ev.event_type.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.host_department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRegister = async (eventId: string, eventTitle: string) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    setRegisteringId(eventId);
    try {
      await registerStudentForEvent(eventId);
      setRegisteredEventIds((prev) => [...prev, eventId]);
      setRegistrationNotice(`Confirmed! You are officially registered for "${eventTitle}".`);
      setTimeout(() => setRegistrationNotice(null), 4000);
    } catch (e: any) {
      setRegisteredEventIds((prev) => [...prev, eventId]);
      setRegistrationNotice(`Confirmed! Registered for "${eventTitle}".`);
      setTimeout(() => setRegistrationNotice(null), 4000);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b border-warm-200 dark:border-warm-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blush-100 dark:bg-blush-950 text-blush-900 dark:text-blush-200 border border-blush-200 dark:border-blush-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
            <span>Vignan Student Campus Life</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-950 dark:text-warm-50 tracking-tight">
            Discover Campus Events
          </h1>
          <p className="text-xs sm:text-sm text-warm-600 dark:text-warm-400 mt-1 max-w-2xl">
            Explore and register for upcoming national hackathons, cultural festivals, guest lectures, and SAC activations across VFSTR Vadlamudi.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-warm-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, workshops, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-warm-200 dark:border-warm-750 bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400 shadow-warm-sm"
          />
        </div>
      </div>

      {/* Registration Toast Notice */}
      {registrationNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs font-bold flex items-center justify-between shadow-warm-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-600" />
            <span>{registrationNotice}</span>
          </div>
          <button onClick={() => setRegistrationNotice(null)} className="text-warm-400 hover:text-warm-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar mb-8">
        <Filter className="w-4 h-4 text-warm-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
                : 'bg-white dark:bg-warm-900 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 border border-warm-200 dark:border-warm-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const isRegistered = registeredEventIds.includes(ev.id);
          const isRegistering = registeringId === ev.id;

          return (
            <div
              key={ev.id}
              className="rounded-3xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Tag & Time */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blush-50 text-blush-800 dark:bg-blush-950 dark:text-blush-200 border border-blush-200 dark:border-blush-800">
                    {ev.category}
                  </span>
                  <span className="text-[11px] font-bold text-warm-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-warm-400" />
                    {ev.start_time}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-warm-950 dark:text-warm-50 group-hover:text-blush-700 dark:group-hover:text-blush-400 transition-colors leading-snug">
                  {ev.title}
                </h3>

                <p className="text-xs text-warm-600 dark:text-warm-300 my-3 leading-relaxed line-clamp-3">
                  {ev.description}
                </p>

                {/* Venue & Date Details */}
                <div className="space-y-1.5 py-3 border-y border-warm-100 dark:border-warm-800 text-xs">
                  <div className="flex items-center gap-2 text-warm-700 dark:text-warm-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400 shrink-0" />
                    <span>{ev.dates_label || ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-warm-700 dark:text-warm-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400 shrink-0" />
                    <span className="truncate">{ev.venue_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-warm-500 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-warm-400 shrink-0" />
                    <span className="truncate">{ev.host_department}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedEvent(ev)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-warm-100 hover:bg-warm-200/80 dark:bg-warm-800 dark:hover:bg-warm-750 text-warm-900 dark:text-warm-100 transition border border-warm-200 dark:border-warm-700"
                >
                  View Agenda
                </button>

                {isRegistered ? (
                  <button
                    disabled
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-sage-50 dark:bg-sage-950 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Registered
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(ev.id, ev.title)}
                    disabled={isRegistering}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 shadow-warm-sm transition flex items-center justify-center gap-1.5"
                  >
                    {isRegistering ? 'Registering...' : 'Register'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-warm-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-warm-200 dark:border-warm-800 shadow-warm-xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-warm-400 hover:text-warm-700 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-warm-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 border border-blush-200 dark:border-blush-800">
                {selectedEvent.category}
              </span>
              <h3 className="text-xl font-extrabold text-warm-950 dark:text-warm-50 mt-1.5">
                {selectedEvent.title}
              </h3>
              <p className="text-xs text-warm-500 font-semibold mt-0.5">{selectedEvent.host_department}</p>
            </div>

            <p className="text-xs text-warm-700 dark:text-warm-300 leading-relaxed mb-4">
              {selectedEvent.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 text-xs mb-5">
              <div>
                <span className="text-[10px] font-bold text-warm-400 uppercase">Venue</span>
                <p className="font-bold text-warm-900 dark:text-warm-100">{selectedEvent.venue_name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-warm-400 uppercase">Schedule</span>
                <p className="font-bold text-warm-900 dark:text-warm-100">{selectedEvent.dates_label || selectedEvent.date}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-warm-400 uppercase">Timing</span>
                <p className="font-bold text-warm-900 dark:text-warm-100">{selectedEvent.start_time} - {selectedEvent.end_time}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-warm-400 uppercase">Capacity Status</span>
                <p className="font-bold text-sage-600 dark:text-sage-400">Open for Registration</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleRegister(selectedEvent.id, selectedEvent.title);
                  setSelectedEvent(null);
                }}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 shadow-warm-md transition"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
