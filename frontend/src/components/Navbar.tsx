import React from 'react';
import {
  Sparkles,
  Bot,
  Building2,
  Database,
  Calendar,
  Layers,
  Shield,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Activity,
  Compass,
  FileCheck2
} from 'lucide-react';
import { User, HealthResponse } from '../types';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: any) => void;
  health: HealthResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  activeView,
  setActiveView,
  health
}) => {
  const isStudent = currentUser?.role === 'STUDENT';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isHOD = currentUser?.role === 'HOD';
  const isOrganizer = currentUser?.role === 'EVENT_ORGANIZER';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-warm-200/80 dark:border-warm-850 bg-warm-50/90 dark:bg-warm-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Campus Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('landing')}>
            <div className="h-10 w-10 rounded-2xl bg-warm-900 dark:bg-warm-700 flex items-center justify-center text-warm-50 font-black text-lg shadow-warm-sm border border-warm-750">
              V
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-warm-950 dark:text-warm-50">
                  Vignan <span className="text-blush-700 dark:text-blush-400">EventOps</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blush-100 dark:bg-blush-950 text-blush-800 dark:text-blush-200 border border-blush-200 dark:border-blush-800">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-warm-500 font-medium">
                {currentUser?.role === 'SUPER_ADMIN'
                  ? 'Command Center • Super Admin'
                  : currentUser?.role === 'HOD'
                  ? 'Department Operations • HOD'
                  : currentUser?.role === 'EVENT_ORGANIZER'
                  ? 'Event Manager • SAC'
                  : currentUser?.role === 'STUDENT'
                  ? 'Campus Events Portal'
                  : 'VFSTR Vadlamudi Campus'}
              </p>
            </div>
          </div>

          {/* Navigation Links (Role Filtered) */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-bold">
            {/* Student ONLY Navigation */}
            {isStudent ? (
              <>
                <button
                  onClick={() => setActiveView('student-events')}
                  className={`px-3.5 py-2 rounded-xl transition ${
                    activeView === 'student-events' || activeView === 'landing'
                      ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  Campus Events
                </button>
                <button
                  onClick={() => setActiveView('availability')}
                  className={`px-3.5 py-2 rounded-xl transition ${
                    activeView === 'availability'
                      ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  Venue Schedule
                </button>
              </>
            ) : (
              /* Admin, HOD, Organizer & Public Navigation */
              <>
                <button
                  onClick={() => setActiveView('landing')}
                  className={`px-3.5 py-2 rounded-xl transition ${
                    activeView === 'landing'
                      ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  Home
                </button>

                <button
                  onClick={() => setActiveView('planner')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                    activeView === 'planner'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-blush-400" />
                  <span>AI Event Planner</span>
                </button>

                <button
                  onClick={() => setActiveView('student-events')}
                  className={`px-3.5 py-2 rounded-xl transition ${
                    activeView === 'student-events'
                      ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  Events Feed
                </button>

                <button
                  onClick={() => setActiveView('availability')}
                  className={`px-3.5 py-2 rounded-xl transition ${
                    activeView === 'availability'
                      ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  Availability
                </button>

                <button
                  onClick={() => setActiveView('venues')}
                  className={`px-3.5 py-2 rounded-xl transition ${
                    activeView === 'venues'
                      ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                      : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                  }`}
                >
                  Venues (10)
                </button>

                {/* STRICTLY Super Admin Master Data */}
                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveView('master-data')}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                      activeView === 'master-data'
                        ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                        : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-blush-500" />
                    <span>Master Data Console</span>
                  </button>
                )}

                {currentUser && !isStudent && (
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-3.5 py-2 rounded-xl transition ${
                      activeView === 'dashboard'
                        ? 'bg-warm-200/80 dark:bg-warm-800 text-warm-950 dark:text-warm-50'
                        : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-850'
                    }`}
                  >
                    Operations Desk
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-3">
            {/* Live Backend Telemetry Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warm-100 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 text-[10px] text-warm-600 dark:text-warm-400 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${health?.database.connected ? 'bg-sage-500 animate-pulse' : 'bg-blush-500'}`} />
              <span>{health?.database.connected ? 'MongoDB Atlas' : 'Campus DB'}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-warm-200" /> : <Moon className="w-4 h-4 text-warm-700" />}
            </button>

            {/* User State / Login Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-extrabold text-warm-900 dark:text-warm-100 leading-tight">
                    {currentUser.name}
                  </p>
                  <span className="text-[10px] font-bold text-blush-700 dark:text-blush-400 font-mono">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-warm-800 dark:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 shadow-warm-sm transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
