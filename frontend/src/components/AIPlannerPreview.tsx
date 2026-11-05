import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Building2,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Users,
  FileText,
  ShieldCheck,
  Check,
  AlertCircle,
  ArrowRight,
  Edit3,
  X,
  FileCheck2,
  Cpu,
  DollarSign,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Venue, EventPlanResponse, AgentTrace, PlanRevalidateResponse, ConflictItem } from '../types';
import { generateEventPlan, revalidatePlan, createCampusEvent } from '../services/api';

interface AIPlannerPreviewProps {
  venues?: Venue[];
  onPlanCreatedAndSaved?: () => void;
}

export const AIPlannerPreview: React.FC<AIPlannerPreviewProps> = ({
  venues = [],
  onPlanCreatedAndSaved
}) => {
  const [promptInput, setPromptInput] = useState('Plan a 2-day hackathon for 500 students on Aug 28 from 09:00 AM to 06:00 PM with a budget of ₹1,00,000.');
  const [eventDate, setEventDate] = useState('2026-08-28');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [expectedAttendees, setExpectedAttendees] = useState(500);
  const [budgetInput, setBudgetInput] = useState(100000);
  const [preferredVenue, setPreferredVenue] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<EventPlanResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'venues' | 'resources' | 'conflicts' | 'schedule' | 'approvals'>('overview');

  // Edit Plan State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    venue_name: '',
    expected_participants: 500,
    date: '2026-08-28',
    start_time: '09:00 AM',
    end_time: '06:00 PM',
    budget: 100000,
    description: ''
  });
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [revalidationResult, setRevalidationResult] = useState<PlanRevalidateResponse | null>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Agent progress animation states
  const [agentProgressState, setAgentProgressState] = useState<Array<{
    id: string;
    name: string;
    role: string;
    status: 'idle' | 'executing' | 'completed' | 'error';
    summary: string;
    timeMs?: number;
  }>>([
    { id: '1', name: 'Planning Agent', role: 'NLP Requirements & Scope', status: 'idle', summary: 'Ready to extract event parameters & budget' },
    { id: '2', name: 'Venue Agent', role: 'Campus Capacity & Facilities', status: 'idle', summary: 'Ready to query MongoDB venues & calculate fit' },
    { id: '3', name: 'Resource Agent', role: 'AV, Network & Unit Costing', status: 'idle', summary: 'Ready to calculate estimated event cost' },
    { id: '4', name: 'Conflict / Schedule Agent', role: 'Interval Overlap & Budget Check', status: 'idle', summary: 'Ready to check overlaps & budget limits' },
    { id: '5', name: 'Replanning Agent', role: 'Constraint Resolution & Routing', status: 'idle', summary: 'Ready to optimize alternatives & approval chain' }
  ]);

  const samplePrompts = [
    'Plan a 2-day hackathon for 500 students on Aug 28 from 09:00 AM to 06:00 PM with a budget of ₹1,00,000.',
    'Organize a cultural evening for 800 students on Sep 02 with a budget of ₹75,000.',
    'Conduct a technical seminar for 300 students on Aug 28 from 10 AM to 4 PM with a budget of ₹50,000.',
    'Organize an NSS orientation for 250 volunteers with a budget of ₹30,000.',
    'Plan an event for 50 students with a budget of ₹15,000.',
    'Organize a large event for 1500 students with a budget of ₹2,50,000.'
  ];

  // Auto-generate initial plan on mount
  useEffect(() => {
    handleGeneratePlan(promptInput);
  }, []);

  const handleGeneratePlan = async (queryText?: string) => {
    const textToRun = queryText || promptInput;
    if (!textToRun.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSubmissionSuccess(null);
    setRevalidationResult(null);

    setAgentProgressState([
      { id: '1', name: 'Planning Agent', role: 'NLP Requirements & Scope', status: 'executing', summary: 'Analyzing prompt, extracting duration & budget...' },
      { id: '2', name: 'Venue Agent', role: 'Campus Capacity & Facilities', status: 'idle', summary: 'Waiting for requirement parameters...' },
      { id: '3', name: 'Resource Agent', role: 'AV, Network & Unit Costing', status: 'idle', summary: 'Waiting for participant load...' },
      { id: '4', name: 'Conflict / Schedule Agent', role: 'Interval Overlap & Budget Check', status: 'idle', summary: 'Waiting for venue allocation...' },
      { id: '5', name: 'Replanning Agent', role: 'Constraint Resolution & Routing', status: 'idle', summary: 'Waiting for conflict analysis...' }
    ]);

    const timer1 = setTimeout(() => {
      setAgentProgressState(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'completed' } : i === 1 ? { ...a, status: 'executing', summary: 'Querying MongoDB campus venues & checking seat capacities...' } : a));
    }, 250);

    const timer2 = setTimeout(() => {
      setAgentProgressState(prev => prev.map((a, i) => i <= 1 ? { ...a, status: 'completed' } : i === 2 ? { ...a, status: 'executing', summary: 'Calculating unit costs & total estimated event budget...' } : a));
    }, 550);

    const timer3 = setTimeout(() => {
      setAgentProgressState(prev => prev.map((a, i) => i <= 2 ? { ...a, status: 'completed' } : i === 3 ? { ...a, status: 'executing', summary: 'Evaluating time interval overlaps & budget limits...' } : a));
    }, 850);

    try {
      const result = await generateEventPlan(textToRun, {
        preferred_venue: preferredVenue || undefined,
        expected_attendees: expectedAttendees,
        date: eventDate,
        start_time: startTime,
        end_time: endTime,
        budget: budgetInput
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setPlanResult(result);
      setEditFormData({
        title: result.event.title,
        venue_name: result.selected_venue.venue_name,
        expected_participants: result.event.expected_participants,
        date: result.event.date || eventDate,
        start_time: result.event.start_time || startTime,
        end_time: result.event.end_time || endTime,
        budget: result.event.budget || budgetInput,
        description: `${result.event.title} organized by ${result.event.host_department}.`
      });

      if (result.agent_trace && result.agent_trace.length === 5) {
        setAgentProgressState(result.agent_trace.map((trace: AgentTrace, idx: number) => ({
          id: String(idx + 1),
          name: trace.agent_name,
          role: trace.responsibility,
          status: 'completed',
          summary: trace.summary,
          timeMs: trace.execution_time_ms
        })));
      } else {
        setAgentProgressState(prev => prev.map(a => ({ ...a, status: 'completed' })));
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMessage(err.message || 'Campus database or AI service is unavailable. Please check the backend connection.');
      setAgentProgressState(prev => prev.map(a => a.status === 'executing' ? { ...a, status: 'error', summary: 'Failed to complete execution' } : a));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevalidateEditedPlan = async () => {
    setIsRevalidating(true);
    try {
      const res = await revalidatePlan({
        title: editFormData.title,
        venue_name: editFormData.venue_name,
        expected_participants: editFormData.expected_participants,
        date: editFormData.date,
        start_time: editFormData.start_time,
        end_time: editFormData.end_time,
        budget: editFormData.budget
      });
      setRevalidationResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleSubmitEvent = async () => {
    if (!planResult) return;
    setIsSubmittingEvent(true);
    try {
      await createCampusEvent({
        title: editFormData.title || planResult.event.title,
        category: planResult.event.category,
        event_type: planResult.event.event_type,
        venue_id: planResult.selected_venue.venue_id,
        venue_name: editFormData.venue_name || planResult.selected_venue.venue_name,
        date: editFormData.date,
        start_time: editFormData.start_time,
        end_time: editFormData.end_time,
        expected_participants: editFormData.expected_participants,
        host_department: planResult.event.host_department,
        budget: editFormData.budget,
        estimated_cost: planResult.event.estimated_cost,
        description: editFormData.description || planResult.planning_summary
      });
      setSubmissionSuccess(`Event "${editFormData.title || planResult.event.title}" submitted successfully into MongoDB Atlas for HOD & Dean approval!`);
      setIsEditModalOpen(false);
      if (onPlanCreatedAndSaved) onPlanCreatedAndSaved();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blush-100 text-blush-900 dark:bg-blush-950 dark:text-blush-200 border border-blush-200 dark:border-blush-800 mb-2">
          <Bot className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
          <span>Real-Time Multi-Agent Operations Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-warm-950 dark:text-warm-50 tracking-tight">
          AI Event Planner & Conflict Resolution Command Center
        </h2>
        <p className="text-sm text-warm-600 dark:text-warm-400 mt-1 max-w-3xl leading-relaxed">
          Enter any campus event requirement. The 5-Agent swarm dynamically parses the prompt, queries real MongoDB campus venues (Sangamam, OATs, Halls), checks resource inventory, evaluates time interval overlaps & budget limits, and produces a customized operational blueprint.
        </p>
      </div>

      {/* Visual Agent Command Center Architecture Topology */}
      <div className="mb-8 p-5 rounded-3xl bg-warm-900 text-warm-50 border border-warm-800 shadow-warm-lg overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blush-400" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-warm-200">
              AGENT PIPELINE ARCHITECTURE TOPOLOGY
            </span>
          </div>
          <span className="text-[10px] font-mono text-sage-400 font-bold">5 SPECIALIZED AGENTS ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs relative">
          <div className="p-3 rounded-2xl bg-warm-850 border border-warm-700/80 shadow-warm-sm flex flex-col items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-blush-500/20 text-blush-300 font-mono font-bold text-[10px] flex items-center justify-center mb-1">
              01
            </span>
            <p className="font-bold text-warm-100 text-[11px]">PLANNING AGENT</p>
            <p className="text-[10px] text-warm-400 mt-0.5">NLP & Budget Scope</p>
          </div>

          <div className="p-3 rounded-2xl bg-warm-850 border border-warm-700/80 shadow-warm-sm flex flex-col items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-blush-500/20 text-blush-300 font-mono font-bold text-[10px] flex items-center justify-center mb-1">
              02
            </span>
            <p className="font-bold text-warm-100 text-[11px]">VENUE AGENT</p>
            <p className="text-[10px] text-warm-400 mt-0.5">MongoDB Venue Match</p>
          </div>

          <div className="p-3 rounded-2xl bg-warm-850 border border-warm-700/80 shadow-warm-sm flex flex-col items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-blush-500/20 text-blush-300 font-mono font-bold text-[10px] flex items-center justify-center mb-1">
              03
            </span>
            <p className="font-bold text-warm-100 text-[11px]">RESOURCE AGENT</p>
            <p className="text-[10px] text-warm-400 mt-0.5">Unit Costing & Inventory</p>
          </div>

          <div className="p-3 rounded-2xl bg-warm-850 border border-warm-700/80 shadow-warm-sm flex flex-col items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-blush-500/20 text-blush-300 font-mono font-bold text-[10px] flex items-center justify-center mb-1">
              04
            </span>
            <p className="font-bold text-warm-100 text-[11px]">CONFLICT AGENT</p>
            <p className="text-[10px] text-warm-400 mt-0.5">Interval Overlaps & Budget</p>
          </div>

          <div className="p-3 rounded-2xl bg-warm-850 border border-warm-700/80 shadow-warm-sm flex flex-col items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-blush-500/20 text-blush-300 font-mono font-bold text-[10px] flex items-center justify-center mb-1">
              05
            </span>
            <p className="font-bold text-warm-100 text-[11px]">REPLANNING AGENT</p>
            <p className="text-[10px] text-warm-400 mt-0.5">Dynamic Upgrades & Routing</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls & Telemetry */}
        <div className="lg:col-span-1 space-y-4">
          {/* Requirement Input Form Card */}
          <div className="bg-white dark:bg-warm-900 rounded-3xl p-5 border border-warm-200 dark:border-warm-800 shadow-warm-sm space-y-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-warm-700 dark:text-warm-300">
              Natural Language Event Requirement
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs rounded-2xl border border-warm-200 dark:border-warm-750 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400 resize-none font-sans"
              placeholder="e.g. Plan a technical seminar for 300 students on Aug 28 from 10 AM to 4 PM with a budget of ₹50,000..."
            />

            {/* Date & Time Parameters */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-warm-500 mb-1">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-warm-200 dark:border-warm-750 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-warm-500 mb-1">Start Time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-warm-200 dark:border-warm-750 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 text-[11px]"
                  placeholder="09:00 AM"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-warm-500 mb-1">End Time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-warm-200 dark:border-warm-750 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 text-[11px]"
                  placeholder="05:00 PM"
                />
              </div>
            </div>

            {/* Attendees & Budget Parameters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-warm-500 mb-1">Attendees</label>
                <input
                  type="number"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-warm-200 dark:border-warm-750 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-warm-500 mb-1">Budget (₹)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 rounded-xl border border-warm-200 dark:border-warm-750 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleGeneratePlan(promptInput)}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 disabled:opacity-50 text-warm-50 font-bold text-xs transition flex items-center justify-center gap-2 shadow-warm-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blush-300" />
                  <span>Executing 5 AI Agents on Campus DB...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-blush-300" />
                  <span>Process with Campus AI Agents</span>
                </>
              )}
            </button>

            {/* Prompt presets */}
            <div className="pt-3 border-t border-warm-100 dark:border-warm-800">
              <p className="text-[11px] font-bold text-warm-600 dark:text-warm-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blush-500" /> Test Diverse Event Scenarios:
              </p>
              <div className="space-y-1.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(p);
                      handleGeneratePlan(p);
                    }}
                    className="w-full text-left text-[11px] p-2 rounded-xl bg-warm-50 hover:bg-blush-50 dark:bg-warm-800/60 dark:hover:bg-blush-950/40 text-warm-800 dark:text-warm-200 hover:text-blush-700 dark:hover:text-blush-300 transition truncate border border-warm-200/80 dark:border-warm-800 font-medium"
                  >
                    &ldquo;{p}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5-Agent Telemetry */}
          <div className="bg-white dark:bg-warm-900 rounded-3xl p-5 border border-warm-200 dark:border-warm-800 shadow-warm-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-warm-100 dark:border-warm-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blush-500" />
                5-Agent Swarm Telemetry
              </h4>
              <span className="text-[10px] font-bold text-warm-500">
                {isLoading ? 'Agents Active...' : 'Ready'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {agentProgressState.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    agent.status === 'executing'
                      ? 'bg-blush-50/80 dark:bg-blush-950/50 border-blush-300 dark:border-blush-800 shadow-warm-sm'
                      : agent.status === 'completed'
                      ? 'bg-warm-50/70 dark:bg-warm-850 border-warm-200 dark:border-warm-800'
                      : agent.status === 'error'
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900'
                      : 'bg-warm-50/40 dark:bg-warm-900/40 border-warm-100 dark:border-warm-850 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-warm-200 dark:bg-warm-800 text-[10px] font-bold text-warm-800 dark:text-warm-200 shrink-0">
                        {agent.id}
                      </div>
                      <div>
                        <p className="font-bold text-warm-900 dark:text-warm-100 text-[11px] leading-tight">
                          {agent.name}
                        </p>
                        <p className="text-[10px] text-warm-500 dark:text-warm-400">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {agent.status === 'executing' && (
                        <RefreshCw className="w-3.5 h-3.5 text-blush-500 animate-spin" />
                      )}
                      {agent.status === 'completed' && (
                        <div className="flex items-center gap-1 text-sage-600 dark:text-sage-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {agent.timeMs && (
                            <span className="text-[9px] font-mono">{agent.timeMs}ms</span>
                          )}
                        </div>
                      )}
                      {agent.status === 'error' && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      {agent.status === 'idle' && (
                        <span className="w-2 h-2 rounded-full bg-warm-300 dark:bg-warm-700 block" />
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-warm-600 dark:text-warm-400 mt-1.5 pl-7 leading-relaxed">
                    {agent.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Output Blueprint */}
        <div className="lg:col-span-2 space-y-4">
          {/* Submission Success Banner */}
          {submissionSuccess && (
            <div className="p-4 rounded-3xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs font-bold flex items-center justify-between shadow-warm-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600" />
                <span>{submissionSuccess}</span>
              </div>
              <button onClick={() => setSubmissionSuccess(null)} className="text-warm-400 hover:text-warm-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-3xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Execution Error</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Main Blueprint Output Card */}
          {planResult && (
            <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-warm-100 dark:border-warm-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 border border-blush-200 dark:border-blush-800">
                      {planResult.event.category}
                    </span>
                    <span className="text-[11px] text-warm-500">
                      {planResult.ai_engine_used} ({planResult.orchestration_time_ms}ms)
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-warm-950 dark:text-warm-50 mt-1">
                    {editFormData.title || planResult.event.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-warm-100 hover:bg-blush-100 dark:bg-warm-800 dark:hover:bg-blush-950/60 text-warm-800 hover:text-blush-800 dark:text-warm-200 dark:hover:text-blush-200 transition border border-warm-200 dark:border-warm-700 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blush-600" />
                    <span>Edit Plan</span>
                  </button>

                  <button
                    onClick={handleSubmitEvent}
                    disabled={isSubmittingEvent}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 shadow-warm-sm transition flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blush-300" />
                    <span>{isSubmittingEvent ? 'Submitting...' : 'Submit to Atlas'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs for Plan Subsections */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b border-warm-100 dark:border-warm-800 custom-scrollbar text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
                  }`}
                >
                  Overview & Budget
                </button>
                <button
                  onClick={() => setActiveTab('venues')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    activeTab === 'venues'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
                  }`}
                >
                  Venues ({planResult.venue_recommendations.length})
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    activeTab === 'resources'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
                  }`}
                >
                  Resources ({planResult.resources.length})
                </button>
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'conflicts'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
                  }`}
                >
                  Conflicts
                  {planResult.conflicts.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blush-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {planResult.conflicts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    activeTab === 'schedule'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
                  }`}
                >
                  Timeline ({planResult.schedule.length} Stages)
                </button>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    activeTab === 'approvals'
                      ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 shadow-warm-sm'
                      : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
                  }`}
                >
                  Approval Chain
                </button>
              </div>

              {/* Tab 1: Overview & Budget Summary Card */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  {/* Budget Summary Card */}
                  {planResult.event.budget !== undefined && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-warm-900 via-warm-850 to-warm-800 text-warm-50 border border-warm-750 shadow-warm-md">
                      <div className="flex items-center justify-between mb-3 border-b border-warm-700/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          <h4 className="font-extrabold text-sm text-warm-100">Financial Budget Summary</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          planResult.event.budget_status === 'BUDGET_EXCEEDED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                            : planResult.event.budget_status === 'NEAR_LIMIT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        }`}>
                          {planResult.event.budget_status || 'WITHIN_BUDGET'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-xs">
                        <div>
                          <span className="text-[10px] text-warm-400 block uppercase font-bold">Target Budget</span>
                          <span className="font-extrabold text-base text-warm-50">₹{planResult.event.budget.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-warm-400 block uppercase font-bold">Estimated Cost</span>
                          <span className="font-extrabold text-base text-blush-300">₹{(planResult.event.estimated_cost || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-warm-400 block uppercase font-bold">Remaining</span>
                          <span className={`font-extrabold text-base ${(planResult.event.remaining_budget || 0) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            ₹{(planResult.event.remaining_budget || 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-warm-400 block uppercase font-bold">Utilization</span>
                          <span className="font-extrabold text-base text-amber-300">
                            {planResult.event.budget > 0 ? Math.round(((planResult.event.estimated_cost || 0) / planResult.event.budget) * 100) : 100}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-warm-950/80 rounded-full h-2 overflow-hidden border border-warm-700">
                        <div
                          className={`h-full transition-all duration-500 ${
                            (planResult.event.remaining_budget || 0) < 0
                              ? 'bg-red-500'
                              : (planResult.event.estimated_cost || 0) >= planResult.event.budget * 0.85
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              planResult.event.budget > 0
                                ? ((planResult.event.estimated_cost || 0) / planResult.event.budget) * 100
                                : 100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800">
                    <div>
                      <span className="text-[10px] text-warm-500 font-bold uppercase">Expected Turnout</span>
                      <p className="font-extrabold text-sm text-warm-900 dark:text-warm-100 mt-0.5">
                        {editFormData.expected_participants} Attendees
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-warm-500 font-bold uppercase">Date & Timing</span>
                      <p className="font-extrabold text-xs text-warm-900 dark:text-warm-100 mt-0.5">
                        {editFormData.date} ({editFormData.start_time} - {editFormData.end_time})
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-warm-500 font-bold uppercase">Host Department</span>
                      <p className="font-bold text-xs text-warm-900 dark:text-warm-100 mt-0.5 truncate">
                        {planResult.event.host_department}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-warm-500 font-bold uppercase">Target Audience</span>
                      <p className="font-bold text-xs text-warm-900 dark:text-warm-100 mt-0.5 truncate">
                        {planResult.event.target_audience}
                      </p>
                    </div>
                  </div>

                  {/* Primary Selected Venue Card */}
                  <div className="p-4 rounded-2xl border border-blush-200 dark:border-blush-900 bg-blush-50/40 dark:bg-blush-950/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blush-600 dark:text-blush-400 shrink-0" />
                        <h4 className="font-bold text-sm text-warm-900 dark:text-warm-100">
                          Primary Venue: {editFormData.venue_name || planResult.selected_venue.venue_name}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blush-100 text-blush-800 dark:bg-blush-900 dark:text-blush-200">
                        {planResult.selected_venue.capacity} Capacity • {planResult.selected_venue.capacity_match}
                      </span>
                    </div>
                    <p className="text-[11px] text-warm-700 dark:text-warm-300 leading-relaxed">
                      {planResult.selected_venue.suitability_reason} Located in {planResult.selected_venue.block}. Equipped with {planResult.selected_venue.ac ? 'Central AC' : 'Natural Ventilation'} and {planResult.selected_venue.av_equipped ? 'Full AV Sound System' : 'Standard Audio'}.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Venues */}
              {activeTab === 'venues' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400 text-[11px]">
                    The Venue Agent queried 10 campus venues in the VFSTR master dataset. Venues are ranked below based on seat capacity, event suitability, and facility match.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {planResult.venue_recommendations.map((v) => (
                      <div
                        key={v.venue_id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between ${
                          v.venue_id === planResult.selected_venue.venue_id
                            ? 'bg-blush-50/50 dark:bg-blush-950/30 border-blush-400 dark:border-blush-800 shadow-warm-sm'
                            : 'bg-white dark:bg-warm-950 border-warm-200 dark:border-warm-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <h4 className="font-bold text-sm text-warm-900 dark:text-warm-100">
                                {v.venue_name}
                              </h4>
                              <p className="text-[10px] text-warm-500">{v.block} • {v.category}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200">
                              {v.capacity} Seats
                            </span>
                          </div>

                          <p className="text-[11px] text-warm-600 dark:text-warm-400 my-2">
                            {v.suitability_reason}
                          </p>
                        </div>

                        {v.venue_id === planResult.selected_venue.venue_id && (
                          <div className="mt-3 pt-2 border-t border-blush-200 dark:border-blush-800 text-[10px] font-bold text-blush-700 dark:text-blush-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selected Primary Venue
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {planResult.resources.map((res) => (
                      <div
                        key={res.resource_id}
                        className="p-3.5 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-warm-500">
                              {res.category}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                res.status === 'Optimal' || res.status === 'Sufficient'
                                  ? 'bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-300'
                                  : 'bg-amberwarm-100 text-amberwarm-800 dark:bg-amberwarm-950 dark:text-amberwarm-300'
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-warm-900 dark:text-warm-100">{res.name}</h4>
                          <div className="mt-2 flex items-baseline justify-between">
                            <div>
                              <span className="text-lg font-extrabold text-warm-900 dark:text-warm-100">
                                {res.allocated_quantity}
                              </span>
                              <span className="text-[10px] text-warm-500">
                                / {res.available_quantity} {res.unit}
                              </span>
                            </div>
                            {res.unit_cost !== undefined && (
                              <span className="text-[10px] font-bold text-warm-500">
                                ₹{res.unit_cost}/unit
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Conflicts & Replanning Panel */}
              {activeTab === 'conflicts' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-warm-900 dark:text-warm-100 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Multi-Dimensional Conflict Analysis ({planResult.conflicts.length})
                    </h4>
                    {planResult.conflicts.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sage-600" />
                        <span>Zero conflicts detected. Venue capacity, time slots, and budget limits are fully optimal.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {planResult.conflicts.map((conf) => {
                          const isHigh = conf.severity === 'HIGH' || conf.severity === 'High';
                          const isTimeOverlap = conf.type === 'TIME_OVERLAP' || conf.type === 'Venue Overlap';
                          const isBudgetExceeded = conf.type === 'BUDGET_EXCEEDED' || conf.type === 'Budget Limit Exceeded';

                          return (
                            <div
                              key={conf.conflict_id}
                              className={`p-4 rounded-2xl border ${
                                isHigh
                                  ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-900'
                                  : 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                    isHigh ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                                  }`}>
                                    {conf.type}
                                  </span>
                                  <span className="text-[10px] font-extrabold text-warm-600 dark:text-warm-400">
                                    Severity: {conf.severity}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  conf.resolved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                }`}>
                                  {conf.resolved ? 'Resolved by Agent 5' : 'Active Conflict'}
                                </span>
                              </div>

                              <h5 className="font-extrabold text-xs text-warm-950 dark:text-warm-50 mb-1">
                                {conf.title || conf.description}
                              </h5>

                              {/* Time Overlap Details Panel */}
                              {isTimeOverlap && (conf.existing_event_title || conf.requested_start) && (
                                <div className="my-2.5 p-3 rounded-xl bg-white/80 dark:bg-warm-900/80 border border-warm-200 dark:border-warm-800 space-y-1 text-[11px]">
                                  <p className="font-bold text-warm-900 dark:text-warm-100">
                                    Requested Slot: {conf.date || editFormData.date} ({conf.requested_start || editFormData.start_time} - {conf.requested_end || editFormData.end_time})
                                  </p>
                                  {conf.existing_event_title && (
                                    <p className="text-red-700 dark:text-red-300 font-medium">
                                      Existing Booking: &ldquo;{conf.existing_event_title}&rdquo; ({conf.existing_start} - {conf.existing_end})
                                    </p>
                                  )}
                                  <p className="text-warm-600 dark:text-warm-400 text-[10px]">
                                    Venue: {conf.venue_name || editFormData.venue_name}
                                  </p>
                                </div>
                              )}

                              {/* Budget Exceeded Details Panel */}
                              {isBudgetExceeded && conf.exceeded_amount !== undefined && (
                                <div className="my-2.5 p-3 rounded-xl bg-white/80 dark:bg-warm-900/80 border border-warm-200 dark:border-warm-800 space-y-1 text-[11px]">
                                  <p className="font-bold text-red-700 dark:text-red-300">
                                    Budget Limit Exceeded by ₹{conf.exceeded_amount.toLocaleString()}
                                  </p>
                                </div>
                              )}

                              <p className="text-[11px] text-warm-700 dark:text-warm-300 leading-relaxed mb-2">
                                <span className="font-bold">Impact: </span>{conf.impact}
                              </p>

                              {conf.suggested_resolution && (
                                <div className="pt-2 border-t border-warm-200/60 dark:border-warm-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>Suggested Action: {conf.suggested_resolution}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Dynamic Timeline Schedule */}
              {activeTab === 'schedule' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-2.5">
                    {planResult.schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-warm-50 dark:bg-warm-950 border-l-4 border-l-blush-500 border border-warm-200/80 dark:border-warm-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warm-200 dark:bg-warm-800 text-warm-800 dark:text-warm-200">
                              DAY {item.day}
                            </span>
                            <span className="font-mono text-[11px] text-blush-700 dark:text-blush-300 font-bold">
                              {item.time_slot}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-warm-950 dark:text-warm-50">
                            {item.stage_name}
                          </h4>
                          <p className="text-[11px] text-warm-600 dark:text-warm-400">
                            {item.activity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-bold text-warm-800 dark:text-warm-200 block">
                            {item.venue_allocated}
                          </span>
                          <span className="text-[10px] text-warm-500">
                            Lead: {item.responsible_team}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Approvals */}
              {activeTab === 'approvals' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800">
                    <h4 className="font-bold text-warm-900 dark:text-warm-100 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blush-600" />
                      5-Tier Multi-Role University Governance Chain
                    </h4>
                    <div className="space-y-2">
                      {planResult.approval_workflow.map((tier, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-warm-100 dark:bg-warm-800 text-[10px] font-bold flex items-center justify-center text-warm-700 dark:text-warm-300">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-warm-900 dark:text-warm-100 text-xs">{tier.role}</p>
                              <p className="text-[10px] text-warm-500">{tier.action}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-50 text-sage-700 dark:bg-sage-950 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                            Auto-Dispatched
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- INTERACTIVE EDIT PLAN MODAL ----------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-warm-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-warm-200 dark:border-warm-800 shadow-warm-xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-100 dark:border-warm-800">
              <div>
                <h3 className="text-lg font-extrabold text-warm-950 dark:text-warm-50">
                  Edit AI Generated Plan
                </h3>
                <p className="text-xs text-warm-500">Modify parameters and revalidate against campus capacity, time slots & budget</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-warm-400 hover:text-warm-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Event Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Assigned Venue</label>
                  <input
                    type="text"
                    value={editFormData.venue_name}
                    onChange={(e) => setEditFormData({ ...editFormData, venue_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Expected Attendees</label>
                  <input
                    type="number"
                    value={editFormData.expected_participants}
                    onChange={(e) => setEditFormData({ ...editFormData, expected_participants: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editFormData.start_time}
                    onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                    placeholder="09:00 AM"
                  />
                </div>
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">End Time</label>
                  <input
                    type="text"
                    value={editFormData.end_time}
                    onChange={(e) => setEditFormData({ ...editFormData, end_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                    placeholder="06:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Target Budget (₹)</label>
                <input
                  type="number"
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                />
              </div>

              {/* Revalidation Status Box */}
              {revalidationResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    revalidationResult.is_valid
                      ? 'bg-sage-50 dark:bg-sage-950/60 border-sage-200 dark:border-sage-800 text-sage-900 dark:text-sage-200'
                      : 'bg-amberwarm-50 dark:bg-amberwarm-950/60 border-amberwarm-200 dark:border-amberwarm-800 text-amberwarm-900 dark:text-amberwarm-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-sage-600" />
                    <span>{revalidationResult.status}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{revalidationResult.message}</p>

                  {/* Structured Conflicts Summary in Modal */}
                  {revalidationResult.structured_conflicts && revalidationResult.structured_conflicts.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-warm-200/60 dark:border-warm-800 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block">
                        Conflicts Detected ({revalidationResult.structured_conflicts.length}):
                      </span>
                      {revalidationResult.structured_conflicts.map((c, i) => (
                        <div key={i} className="text-[10px] text-red-800 dark:text-red-300 font-semibold flex items-center gap-1">
                          <span>•</span>
                          <span>{c.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleRevalidateEditedPlan}
                  disabled={isRevalidating}
                  className="flex-1 py-3 rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRevalidating ? 'animate-spin' : ''}`} />
                  <span>{isRevalidating ? 'Checking DB...' : 'Revalidate Plan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitEvent}
                  disabled={isSubmittingEvent}
                  className="flex-1 py-3 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold shadow-warm-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingEvent ? 'Submitting...' : 'Confirm & Submit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
