import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  Users,
  CheckCircle2,
  Bot,
  Calendar,
  Layers,
  Cpu,
  Radio,
  Check,
  Compass,
  Play,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  Database,
  FileCheck2,
  Activity
} from 'lucide-react';
import { HealthResponse } from '../types';

interface LandingHeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreVenues: () => void;
  onTryPlanner: () => void;
  onNavigateView?: (view: any) => void;
  health: HealthResponse | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenAuth,
  onExploreVenues,
  onTryPlanner,
  onNavigateView,
  health
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      title: '01. AI Event Planner',
      subtitle: 'Natural Language Prompt & 5-Agent Swarm',
      description: 'Describe any campus event in plain text (e.g. "Plan a 2-day hackathon for 500 students"). Our 5 autonomous AI agents analyze requirements, query campus data, check equipment stock, and build a full operational schedule.',
      icon: Bot,
      actionText: 'Try AI Planner',
      action: () => { setTourOpen(false); onTryPlanner(); }
    },
    {
      title: '02. Campus Venues & Capacity Matching',
      subtitle: 'Verified Campus Master Data',
      description: 'Explore 10 verified Vignan University venues (Sangamithra Hall, A Block OAT, Sa Re Ga Ma, Convocation Hall). The Venue Agent calculates exact seat utilization % and AV compatibility without hallucinating availability.',
      icon: Building2,
      actionText: 'Explore Venues',
      action: () => { setTourOpen(false); onExploreVenues(); }
    },
    {
      title: '03. Student Events Feed & Registration',
      subtitle: 'Campus Life & Event Discovery',
      description: 'Students log in to a dedicated Campus Events portal to discover upcoming technical hackathons, cultural fests, NSS orientation drives, and reserve attendee seats instantly.',
      icon: Users,
      actionText: 'View Events Feed',
      action: () => { setTourOpen(false); if (onNavigateView) onNavigateView('student-events'); }
    },
    {
      title: '04. Real-Time Venue Schedule & Availability',
      subtitle: 'Time-Slot Telemetry',
      description: 'Inspect live venue booking timelines across morning, afternoon, and evening slots. Easily identify free windows before submitting official event blueprints.',
      icon: Calendar,
      actionText: 'Check Availability',
      action: () => { setTourOpen(false); if (onNavigateView) onNavigateView('availability'); }
    },
    {
      title: '05. Operations Desk & Multi-Tier Approvals',
      subtitle: 'HOD & Dean Clearance Workflow',
      description: 'HODs and Event Organizers manage submitted event plans, review conflict alerts, and route blueprints through the 5-tier university governance approval chain.',
      icon: FileCheck2,
      actionText: 'Open Operations Desk',
      action: () => { setTourOpen(false); onOpenAuth('login'); }
    },
    {
      title: '06. Master Data Console (Super Admin)',
      subtitle: 'Full Infrastructure Governance',
      description: 'Super Admins possess complete CRUD authority over campus venues, equipment inventory, faculty coordinator directories, and security audit logs.',
      icon: Database,
      actionText: 'Access Admin Console',
      action: () => { setTourOpen(false); onOpenAuth('login'); }
    }
  ];

  return (
    <section className="relative overflow-hidden pt-6 pb-14 md:pt-10 md:pb-20">
      {/* Soft Radial Gradient Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-blush-300/20 via-peach-200/15 to-warm-200/20 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT COLUMN: Hero Pitch & Core Vision */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Pill & Tour Trigger */}
            <div className="flex flex-wrap items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blush-100 dark:bg-blush-950/70 text-blush-900 dark:text-blush-200 border border-blush-200 dark:border-blush-800/80 shadow-warm-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
                <span>Campus Event Operations Command Center</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blush-500" />
                <span className="text-warm-600 dark:text-warm-400">VFSTR Vadlamudi</span>
              </motion.div>

              {/* Take a Tour Pill Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                onClick={() => { setTourStep(0); setTourOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warm-900 text-warm-50 dark:bg-warm-800 hover:bg-warm-800 transition-all shadow-warm-sm border border-warm-750 group cursor-pointer"
              >
                <Play className="w-3 h-3 text-blush-300 fill-blush-300 group-hover:scale-110 transition-transform" />
                <span>Meet your AI EventOps • Take a 30-sec tour →</span>
              </motion.button>
            </div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-warm-950 dark:text-warm-50 tracking-tight leading-[1.1]">
                Plan. <span className="text-blush-700 dark:text-blush-400">Orchestrate.</span> Execute.
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-warm-800 dark:text-warm-200 tracking-tight">
                Your campus event manager powered by intelligent AI agents.
              </p>
            </motion.div>

            {/* Explanation Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-warm-700 dark:text-warm-300 max-w-xl leading-relaxed"
            >
              Describe your event in natural language. Our AI agent swarm plans venues, resources, schedules, conflicts and approvals using verified campus data from Vignan University.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <button
                onClick={onTryPlanner}
                className="px-6 py-3.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 font-bold text-sm shadow-warm-lg transition-all flex items-center gap-2 group border border-warm-800"
              >
                <Bot className="w-4 h-4 text-blush-300 group-hover:rotate-12 transition-transform" />
                <span>Launch AI Event Planner</span>
                <ArrowRight className="w-4 h-4 text-blush-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreVenues}
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-warm-900 hover:bg-warm-100 dark:hover:bg-warm-850 text-warm-800 dark:text-warm-100 font-bold text-sm border border-warm-200 dark:border-warm-750 shadow-warm-sm transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-warm-600 dark:text-warm-300" />
                <span>Campus Venues</span>
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-3.5 rounded-xl bg-warm-200/70 hover:bg-warm-200 dark:bg-warm-850 dark:hover:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold text-xs transition-all flex items-center gap-2 border border-warm-300/60 dark:border-warm-700"
              >
                <Shield className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <span>Sign In (4 Roles)</span>
              </button>
            </motion.div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-warm-200/80 dark:border-warm-800 max-w-lg">
              <div>
                <p className="text-xl font-extrabold text-warm-900 dark:text-warm-100">10 Venues</p>
                <p className="text-[11px] text-warm-500">Sangamam, OATs, Halls</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-blush-700 dark:text-blush-400">5 Agents</p>
                <p className="text-[11px] text-warm-500">Swarm Intelligence</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-sage-700 dark:text-sage-400">100% Real</p>
                <p className="text-[11px] text-warm-500">MongoDB Campus Source</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Premium Interactive AI Robot Visual (Transparent Composition) */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[440px]">
            
            {/* Hoverable Interactive Visual Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full max-w-lg flex flex-col items-center justify-center p-4 cursor-pointer select-none group"
            >

              {/* Background Concentric Holographic Orbital Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-blush-400/25 dark:border-blush-400/15 animate-spin" style={{ animationDuration: '30s' }} />
                <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-dashed border-warm-400/20 dark:border-warm-500/15 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
                <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-blush-300/15 via-peach-200/15 to-transparent blur-2xl" />
              </div>

              {/* Top Floating Badge Label */}
              <div className="relative z-10 mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-warm-900/90 border border-warm-200 dark:border-warm-800 shadow-warm-sm text-[11px] font-mono font-bold text-warm-900 dark:text-warm-100 transition-transform group-hover:scale-105">
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-ping" />
                <span className="text-blush-700 dark:text-blush-400">VIGNAN AI EVENTOPS</span>
                <span className="text-warm-400 font-normal">•</span>
                <span className="text-warm-600 dark:text-warm-300">Autonomous Campus Intelligence</span>
              </div>

              {/* CENTRAL FUTURISTIC HUMANOID AI ROBOT VECTOR ILLUSTRATION */}
              <motion.div
                animate={{
                  y: isHovered ? [0, -8, 0] : [0, -4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="relative z-20 my-2 flex flex-col items-center justify-center"
              >
                {/* Vector Robot SVG Graphic */}
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                  
                  {/* Glowing Core Aura behind Head */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-blush-400/30 via-peach-300/20 to-warm-400/20 blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-100 scale-110' : 'opacity-70'}`} />

                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full drop-shadow-xl"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Metallic Robot Shoulder / Base */}
                    <path
                      d="M45 160C45 145 65 135 100 135C135 135 155 145 155 160V175C155 180 150 185 145 185H55C50 185 45 180 45 175V160Z"
                      fill="url(#bodyGrad)"
                      stroke="#8C745E"
                      strokeWidth="2"
                    />

                    {/* Robot Neck */}
                    <rect x="88" y="115" width="24" height="22" rx="4" fill="#382B21" stroke="#5D4A3C" strokeWidth="2" />
                    <line x1="92" y1="122" x2="108" y2="122" stroke="#D5949B" strokeWidth="2" strokeDasharray="2 2" />

                    {/* Metallic Head Helmet */}
                    <path
                      d="M50 80C50 50 70 30 100 30C130 30 150 50 150 80C150 105 132 120 100 120C68 120 50 105 50 80Z"
                      fill="url(#headGrad)"
                      stroke="#4F3D2F"
                      strokeWidth="2.5"
                    />

                    {/* Side Audio/Sensor Ear Pods */}
                    <circle cx="48" cy="80" r="10" fill="#382B21" stroke="#BF6F77" strokeWidth="2" />
                    <circle cx="48" cy="80" r="4" fill="#5D8B66" className="animate-pulse" />
                    <circle cx="152" cy="80" r="10" fill="#382B21" stroke="#BF6F77" strokeWidth="2" />
                    <circle cx="152" cy="80" r="4" fill="#5D8B66" className="animate-pulse" />

                    {/* Sleek Digital Visor Display */}
                    <path
                      d="M62 68C62 60 74 54 100 54C126 54 138 60 138 68C138 88 126 94 100 94C74 94 62 88 62 68Z"
                      fill="#1E1510"
                      stroke="#BF6F77"
                      strokeWidth="2"
                    />

                    {/* Expressive Glowing AI Eye Dots */}
                    <circle cx="82" cy="74" r="6" fill="#D5949B" className="animate-pulse" />
                    <circle cx="82" cy="74" r="2.5" fill="#FFFFFF" />
                    <circle cx="118" cy="74" r="6" fill="#D5949B" className="animate-pulse" />
                    <circle cx="118" cy="74" r="2.5" fill="#FFFFFF" />

                    {/* Digital Visor Scanline */}
                    <line x1="66" y1="74" x2="134" y2="74" stroke="#BF6F77" strokeWidth="0.8" opacity="0.4" />
                    <path d="M85 86Q100 90 115 86" stroke="#D5949B" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Chest Core AI Reactor (Pulsing Diamond) */}
                    <polygon points="100,143 110,155 100,167 90,155" fill="#BF6F77" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="100" cy="155" r="3" fill="#FFFFFF" className="animate-ping" />

                    {/* SVG Gradients Definition */}
                    <defs>
                      <linearGradient id="headGrad" x1="50" y1="30" x2="150" y2="120" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FAF7F2" />
                        <stop offset="0.5" stopColor="#EAE1D7" />
                        <stop offset="1" stopColor="#DDD0C2" />
                      </linearGradient>
                      <linearGradient id="bodyGrad" x1="45" y1="135" x2="155" y2="185" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#382B21" />
                        <stop offset="1" stopColor="#231A14" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>

              {/* 5 FLOATING HOLOGRAPHIC TELEMETRY NODES AROUND THE ROBOT */}
              
              {/* Node 1: Top Left - Venue Intelligence */}
              <motion.div
                animate={{ y: isHovered ? -4 : 0 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute top-2 left-0 sm:left-2 z-30 p-2.5 rounded-2xl bg-white/95 dark:bg-warm-900/95 border border-warm-200 dark:border-warm-750 shadow-warm-md text-xs backdrop-blur-md max-w-[170px]"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-blush-700 dark:text-blush-300 mb-0.5">
                  <Building2 className="w-3.5 h-3.5 text-blush-600" />
                  <span>Venue Intelligence</span>
                </div>
                <p className="font-bold text-[11px] text-warm-900 dark:text-warm-100 truncate">
                  ✓ Sangamithra 500 Cap
                </p>
              </motion.div>

              {/* Node 2: Top Right - Conflict Detection */}
              <motion.div
                animate={{ y: isHovered ? -5 : 0 }}
                transition={{ duration: 2.4, repeat: Infinity, repeatType: 'reverse', delay: 0.3 }}
                className="absolute top-2 right-0 sm:right-2 z-30 p-2.5 rounded-2xl bg-white/95 dark:bg-warm-900/95 border border-warm-200 dark:border-warm-750 shadow-warm-md text-xs backdrop-blur-md max-w-[170px]"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sage-700 dark:text-sage-300 mb-0.5">
                  <Shield className="w-3.5 h-3.5 text-sage-600" />
                  <span>Conflict Detection</span>
                </div>
                <p className="font-bold text-[11px] text-warm-900 dark:text-warm-100 truncate">
                  ✓ 0 Overlaps Found
                </p>
              </motion.div>

              {/* Node 3: Middle Left - Resource Planning */}
              <motion.div
                animate={{ y: isHovered ? -4 : 0 }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 left-[-10px] sm:left-[-15px] z-30 p-2.5 rounded-2xl bg-white/95 dark:bg-warm-900/95 border border-warm-200 dark:border-warm-750 shadow-warm-md text-xs backdrop-blur-md max-w-[170px]"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-warm-700 dark:text-warm-300 mb-0.5">
                  <Layers className="w-3.5 h-3.5 text-amberwarm-600" />
                  <span>Resource Planning</span>
                </div>
                <p className="font-bold text-[11px] text-warm-900 dark:text-warm-100 truncate">
                  ✓ 500 Chairs • 4 Mics
                </p>
              </motion.div>

              {/* Node 4: Middle Right - Smart Scheduling */}
              <motion.div
                animate={{ y: isHovered ? -5 : 0 }}
                transition={{ duration: 2.6, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
                className="absolute top-1/2 -translate-y-1/2 right-[-10px] sm:right-[-15px] z-30 p-2.5 rounded-2xl bg-white/95 dark:bg-warm-900/95 border border-warm-200 dark:border-warm-750 shadow-warm-md text-xs backdrop-blur-md max-w-[170px]"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-blush-700 dark:text-blush-300 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-blush-600" />
                  <span>Smart Scheduling</span>
                </div>
                <p className="font-bold text-[11px] text-warm-900 dark:text-warm-100 truncate">
                  ✓ 6 Stages Optimized
                </p>
              </motion.div>

              {/* Node 5: Bottom Center - Approval Routing */}
              <motion.div
                animate={{ y: isHovered ? -3 : 0 }}
                transition={{ duration: 2.1, repeat: Infinity, repeatType: 'reverse', delay: 0.4 }}
                className="relative z-30 mt-2 p-2.5 rounded-2xl bg-white/95 dark:bg-warm-900/95 border border-warm-200 dark:border-warm-750 shadow-warm-md text-xs backdrop-blur-md inline-flex items-center gap-3"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-warm-900 dark:text-warm-100">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  <span>Approval Routing: 5-Tier Auto Governance</span>
                </div>
              </motion.div>

              {/* Bottom Operational Flow Indicator */}
              <div className="relative z-20 mt-4 flex items-center justify-center gap-2 text-[11px] font-mono font-bold text-warm-700 dark:text-warm-300 bg-warm-100/80 dark:bg-warm-900/80 px-4 py-1.5 rounded-full border border-warm-200 dark:border-warm-800">
                <span>PLAN</span>
                <span className="text-blush-500">→</span>
                <span>ORCHESTRATE</span>
                <span className="text-blush-500">→</span>
                <span>EXECUTE</span>
              </div>

              {/* Interactive Status Indicator Box on Hover */}
              <div className={`mt-3 px-3 py-1 rounded-full bg-warm-900 dark:bg-warm-800 text-warm-50 text-[10px] font-mono flex items-center gap-2 transition-all ${isHovered ? 'opacity-100 scale-105' : 'opacity-80'}`}>
                <Radio className="w-3 h-3 text-blush-400 animate-pulse" />
                <span>AI EventOps Assistant • 5 Agents Active • Campus Intelligence Online</span>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* ELEGANT 30-SEC PRODUCT TOUR MODAL */}
      <AnimatePresence>
        {tourOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-warm-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-warm-200 dark:border-warm-800 shadow-warm-xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-warm-100 dark:border-warm-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blush-100 dark:bg-blush-950 text-blush-700 dark:text-blush-300">
                    {React.createElement(tourSteps[tourStep].icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blush-600 dark:text-blush-400">
                      Vignan EventOps Guided Demo ({tourStep + 1} / {tourSteps.length})
                    </span>
                    <h3 className="text-lg font-extrabold text-warm-950 dark:text-warm-50">
                      {tourSteps[tourStep].title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setTourOpen(false)}
                  className="p-2 rounded-xl text-warm-400 hover:text-warm-700 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-4 text-xs mb-6">
                <div className="p-3 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800">
                  <p className="font-bold text-warm-900 dark:text-warm-100 text-xs">
                    {tourSteps[tourStep].subtitle}
                  </p>
                </div>

                <p className="text-xs text-warm-700 dark:text-warm-300 leading-relaxed text-sm">
                  {tourSteps[tourStep].description}
                </p>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5 pt-2">
                  {tourSteps.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setTourStep(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === tourStep
                          ? 'w-8 bg-blush-600 dark:bg-blush-400'
                          : 'w-3 bg-warm-200 dark:bg-warm-800 hover:bg-warm-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-warm-100 dark:border-warm-800 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    disabled={tourStep === 0}
                    onClick={() => setTourStep(prev => prev - 1)}
                    className="p-2 rounded-xl border border-warm-200 dark:border-warm-800 disabled:opacity-30 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={tourStep === tourSteps.length - 1}
                    onClick={() => setTourStep(prev => prev + 1)}
                    className="p-2 rounded-xl border border-warm-200 dark:border-warm-800 disabled:opacity-30 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTourOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                  >
                    Skip Tour
                  </button>

                  <button
                    onClick={tourSteps[tourStep].action}
                    className="px-5 py-2.5 rounded-xl font-bold bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-50 shadow-warm-sm transition flex items-center gap-1.5"
                  >
                    <span>{tourSteps[tourStep].actionText}</span>
                    <ArrowRight className="w-4 h-4 text-blush-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
