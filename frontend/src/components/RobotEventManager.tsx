import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  ShieldCheck,
  Building,
  DollarSign,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface RobotEventManagerProps {
  onNavigateView: (view: 'landing' | 'dashboard' | 'venues' | 'planner' | 'master-data' | 'student-events' | 'availability') => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Welcome to Vignan AI Campus EventOps 👋',
    tag: 'SYSTEM OVERVIEW',
    icon: Bot,
    color: 'from-amber-500 to-orange-600',
    description: 'I am your Autonomous Campus Event Manager! I coordinate 5 specialized AI agents to automate campus venue booking, schedule overlap checks, resource costing, and governance approvals.',
    highlights: ['5 Autonomous Campus AI Agents', 'MongoDB Atlas Real-Time Database', '4-Tier RBAC Permission Governance'],
    viewTarget: 'landing' as const
  },
  {
    step: 2,
    title: '2. Natural Language AI Event Planner 🤖',
    tag: 'AI PLANNER & PROMPT',
    icon: Sparkles,
    color: 'from-blush-500 to-rose-600',
    description: 'Describe your event in plain English (e.g. "Plan a 2-day hackathon for 500 students on Aug 28 with a budget of ₹1,00,000"). The Planning Agent automatically parses requirements, attendee count, dates, and budget.',
    highlights: ['Natural Language NLP Parser', 'Date, Start & End Time Controls', 'Financial Budget Input (₹)'],
    viewTarget: 'planner' as const
  },
  {
    step: 3,
    title: '3. Campus Venues & Smart Capacity Match 🏛️',
    tag: 'VENUE INTELLIGENCE',
    icon: Building,
    color: 'from-blue-500 to-indigo-600',
    description: 'The Venue Agent queries MongoDB Atlas venues (Sangamithra, Convocation Hall, OATs, Spoorthy) to evaluate seat capacity, AC, AV systems, and suitability scores (0-100%).',
    highlights: ['10 Campus Venues Indexed', 'Capacity Utilization Math', 'Indoor AC vs OAT Outdoor Specs'],
    viewTarget: 'venues' as const
  },
  {
    step: 4,
    title: '4. Resource Inventory & Pricing Catalog 📦',
    tag: 'RESOURCE ALLOCATION',
    icon: Layers,
    color: 'from-emerald-500 to-teal-600',
    description: 'The Resource Agent maps required AV equipment, stage PA speakers, high-lumen projectors, chairs, Wi-Fi nodes, and volunteers from campus inventory, applying unit costs.',
    highlights: ['13 Resource Categories', 'Itemized Unit Costing (INR ₹)', 'Inventory Deficit Detection'],
    viewTarget: 'planner' as const
  },
  {
    step: 5,
    title: '5. Date & Time Interval Overlap Conflict Engine ⚡',
    tag: 'REAL CONFLICT DETECTION',
    icon: ShieldCheck,
    color: 'from-red-500 to-pink-600',
    description: 'The Conflict Agent performs mathematical interval overlap checks: existing_start < requested_end AND existing_end > requested_start. Shows exact existing event title and conflicting time slots.',
    highlights: ['Time Interval Overlap Logic', 'Exact Conflicting Event Title', 'Capacity & Resource Overlaps'],
    viewTarget: 'planner' as const
  },
  {
    step: 6,
    title: '6. Budget Utilization & Cost Analysis 💰',
    tag: 'FINANCIAL MANAGEMENT',
    icon: DollarSign,
    color: 'from-yellow-500 to-amber-600',
    description: 'Calculates total estimated cost, remaining budget, and utilization percentage. If cost exceeds budget, a BUDGET_EXCEEDED conflict is generated, and the Replanning Agent scales down optional items.',
    highlights: ['Budget Progress Tracker', 'BUDGET_EXCEEDED Conflict Alerts', 'Replanning Rationale & Tradeoffs'],
    viewTarget: 'planner' as const
  },
  {
    step: 7,
    title: '7. Real-Time Venue Availability Feed 📅',
    tag: 'CALENDAR TIMELINE',
    icon: Calendar,
    color: 'from-purple-500 to-indigo-600',
    description: 'Inspect live booking time slots (09 AM - 01 PM, 02 PM - 06 PM, 06 PM - 09 PM) across campus venues to identify open slots before planning.',
    highlights: ['Real-Time Time-Slot Grid', 'BOOKED vs AVAILABLE Status', 'Direct Slot Planning Trigger'],
    viewTarget: 'availability' as const
  },
  {
    step: 8,
    title: '8. 5-Tier Governance Approval Workflow 📜',
    tag: 'GOVERNANCE & SUBMISSION',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-600',
    description: 'Submit your verified plan to MongoDB Atlas. Tracks 5-tier clearance: HOD → Registrar → Central IT → Campus Logistics → Safety Desk.',
    highlights: ['Persisted MongoDB Atlas Events', 'HOD & Super Admin Clearance', 'Student Registration Portal'],
    viewTarget: 'student-events' as const
  }
];

export const RobotEventManager: React.FC<RobotEventManagerProps> = ({
  onNavigateView,
  onOpenAuth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 2s
    const timer = setTimeout(() => setShowTooltip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartTour = () => {
    setIsTourActive(true);
    setCurrentTourStep(0);
    setIsOpen(false);
    onNavigateView(TOUR_STEPS[0].viewTarget);
  };

  const handleNextStep = () => {
    if (currentTourStep < TOUR_STEPS.length - 1) {
      const nextIdx = currentTourStep + 1;
      setCurrentTourStep(nextIdx);
      onNavigateView(TOUR_STEPS[nextIdx].viewTarget);
    } else {
      setIsTourActive(false);
      localStorage.setItem('vignan_robot_tour_completed', 'true');
    }
  };

  const handlePrevStep = () => {
    if (currentTourStep > 0) {
      const prevIdx = currentTourStep - 1;
      setCurrentTourStep(prevIdx);
      onNavigateView(TOUR_STEPS[prevIdx].viewTarget);
    }
  };

  const currentStepData = TOUR_STEPS[currentTourStep];
  const StepIcon = currentStepData.icon;

  return (
    <>
      {/* Floating Robot Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Hover Speech Bubble / Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && !isTourActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-warm-900 text-warm-50 dark:bg-warm-800 border border-warm-700 p-3 rounded-2xl shadow-warm-xl max-w-xs text-xs relative mb-1"
            >
              <div className="flex items-center justify-between gap-2 font-bold mb-1 text-blush-300">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blush-400" />
                  Vignan AI Event Manager
                </span>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="text-warm-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] leading-tight text-warm-300">
                Hi! I can guide your event operations, check venue conflicts & budget limits.
              </p>
              <button
                onClick={handleStartTour}
                className="mt-2 text-[10px] font-bold text-amber-300 hover:underline flex items-center gap-1"
              >
                <span>Take 30-sec Guided Tour</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-warm-900 dark:bg-warm-800 rotate-45 border-r border-b border-warm-700" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Robot Avatar Button */}
        <motion.button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-1.5 rounded-full bg-gradient-to-tr from-warm-950 via-warm-900 to-warm-800 border-2 border-blush-400/80 shadow-warm-xl flex items-center justify-center cursor-pointer"
        >
          {/* Pulsing AI Aura Halo */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blush-500 to-amber-500 opacity-40 blur group-hover:opacity-75 transition duration-500 animate-pulse" />

          {/* Cartoon Robot Manager Icon Composition */}
          <div className="relative w-12 h-12 rounded-full bg-warm-900 border border-warm-700 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Robot Head Frame */}
            <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none">
              {/* Antenna */}
              <line x1="50" y1="15" x2="50" y2="28" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="12" r="5" fill="#FB7185" className="animate-pulse" />
              {/* Ears */}
              <rect x="18" y="42" width="8" height="16" rx="4" fill="#64748B" />
              <rect x="74" y="42" width="8" height="16" rx="4" fill="#64748B" />
              {/* Helmet Head Dome */}
              <rect x="24" y="26" width="52" height="48" rx="14" fill="url(#botGrad)" stroke="#E2E8F0" strokeWidth="3" />
              {/* Visor Screen */}
              <rect x="30" y="36" width="40" height="24" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              {/* Glowing Eyes */}
              <circle cx="41" cy="48" r="4" fill="#38BDF8" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="41" cy="48" r="4" fill="#38BDF8" />
              <circle cx="59" cy="48" r="4" fill="#38BDF8" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="59" cy="48" r="4" fill="#38BDF8" />
              {/* Smiling Mouth Line */}
              <path d="M42 54 Q50 58 58 54" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Blazer Collar & Tie */}
              <path d="M30 74 L50 90 L70 74 V84 L50 98 L30 84 Z" fill="#991B1B" />
              <path d="M46 74 L50 82 L54 74 Z" fill="#F87171" />
              <defs>
                <linearGradient id="botGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
              </defs>
            </svg>
            {/* Online Status Pill Badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-warm-900" />
          </div>
        </motion.button>
      </div>

      {/* Robot Assistant Drawer / Quick Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-warm-900 rounded-3xl border border-warm-200 dark:border-warm-800 shadow-warm-2xl p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-warm-100 dark:border-warm-800 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-warm-900 dark:bg-warm-800 flex items-center justify-center border border-blush-400/50">
                  <Bot className="w-4 h-4 text-blush-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-warm-950 dark:text-warm-50 flex items-center gap-1.5">
                    Vignan AI Event Manager
                  </h4>
                  <span className="text-[10px] text-warm-500 dark:text-warm-400 block font-medium">
                    Campus EventOps Assistant • 5 Agents Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-warm-400 hover:text-warm-800 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-warm-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content & Quick Action Buttons */}
            <div className="space-y-2 text-xs">
              <p className="text-warm-600 dark:text-warm-300 leading-relaxed text-[11px] mb-2">
                "Welcome to Vignan University EventOps! Select a quick action below or launch the guided product tour."
              </p>

              {/* Action 1: Guided Tour */}
              <button
                onClick={handleStartTour}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-warm-900 to-warm-800 text-warm-50 dark:from-warm-800 dark:to-warm-700 hover:opacity-95 font-bold flex items-center justify-between shadow-warm-sm transition"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-blush-300 fill-blush-300" />
                  <span>Take 30-sec Guided Tour</span>
                </div>
                <ChevronRight className="w-4 h-4 text-warm-400" />
              </button>

              {/* Action 2: Check Availability */}
              <button
                onClick={() => {
                  onNavigateView('availability');
                  setIsOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 text-warm-800 dark:text-warm-200 hover:bg-warm-100 font-medium flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
                  <span>Check Venue & Time Slots</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-warm-400" />
              </button>

              {/* Action 3: AI Planner */}
              <button
                onClick={() => {
                  onNavigateView('planner');
                  setIsOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 text-warm-800 dark:text-warm-200 hover:bg-warm-100 font-medium flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Plan Event with AI Agents</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-warm-400" />
              </button>

              {/* Action 4: Master Data */}
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setIsOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 text-warm-800 dark:text-warm-200 hover:bg-warm-100 font-medium flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sign In (4 Campus Roles)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-warm-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Tour Modal Overlay */}
      <AnimatePresence>
        {isTourActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="bg-white dark:bg-warm-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-warm-200 dark:border-warm-800 shadow-warm-2xl relative overflow-hidden"
            >
              {/* Top Banner Bar */}
              <div className="flex items-center justify-between mb-4 border-b border-warm-100 dark:border-warm-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${currentStepData.color}`}>
                    {currentStepData.tag}
                  </span>
                  <span className="text-xs text-warm-500 dark:text-warm-400 font-medium">
                    Step {currentTourStep + 1} of {TOUR_STEPS.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsTourActive(false)}
                  className="text-warm-400 hover:text-warm-800 dark:hover:text-white p-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tour Slide Body */}
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentStepData.color} text-white shadow-warm-md shrink-0`}>
                    <StepIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-warm-950 dark:text-warm-50 leading-snug">
                      {currentStepData.title}
                    </h3>
                    <p className="text-xs text-warm-600 dark:text-warm-300 mt-1.5 leading-relaxed">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="bg-warm-50 dark:bg-warm-950/70 p-4 rounded-2xl border border-warm-200/80 dark:border-warm-800 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-warm-500 block mb-1">
                    Key Features Demonstrated:
                  </span>
                  {currentStepData.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-warm-800 dark:text-warm-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-warm-100 dark:bg-warm-800 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-blush-500 to-amber-500 h-full transition-all duration-300"
                  style={{ width: `${((currentTourStep + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsTourActive(false)}
                  className="px-4 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 text-xs font-bold transition"
                >
                  Skip Tour
                </button>

                <div className="flex items-center gap-2">
                  {currentTourStep > 0 && (
                    <button
                      onClick={handlePrevStep}
                      className="px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="px-5 py-2.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 text-xs font-bold flex items-center gap-1.5 shadow-warm-md transition"
                  >
                    <span>{currentTourStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
                    <ChevronRight className="w-4 h-4 text-blush-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
