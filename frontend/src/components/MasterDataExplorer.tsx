import React, { useState } from 'react';
import {
  Database,
  Building,
  GraduationCap,
  PackageCheck,
  Tag,
  Edit3,
  Info
} from 'lucide-react';
import { LeadershipMember, ResourceItem, BlockInfo } from '../types';

interface MasterDataExplorerProps {
  leadership: LeadershipMember[];
  resources: ResourceItem[];
  blocks: BlockInfo[];
}

export const MasterDataExplorer: React.FC<MasterDataExplorerProps> = ({
  leadership,
  resources,
  blocks
}) => {
  const [activeTab, setActiveTab] = useState<'leadership' | 'blocks' | 'resources' | 'categories'>('leadership');

  const categories = {
    "Technical": ["Srujanankura", "Vastrotsav", "Fudo Festino", "Spark Tank", "Project Expo", "Poster Presentations", "Ideathons", "Hackathons"],
    "Cultural / Major": ["Vignan Mahotsav", "Bala Mahotsav", "Sankranthi Sambaralu"],
    "NSS / Social": ["Swachh Campus Abhiyan", "Emergency Relief & Drives", "Health / Medical Camps", "Rural Outreach"],
    "SAC / Student Activities": ["Beat The Street", "Symphony", "Frames of Vignan", "Leadership & Youth Forums"]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warm-200/70 text-warm-800 dark:bg-warm-800 dark:text-warm-200 mb-2 border border-warm-300 dark:border-warm-700">
          <Database className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
          <span>Campus Master Data Catalog</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-950 dark:text-warm-50 tracking-tight">
          University Infrastructure & Directory
        </h2>
        <p className="text-sm text-warm-600 dark:text-warm-400 mt-1 max-w-3xl">
          User-provided seed data for VFSTR Vadlamudi. All records are maintained in MongoDB collections and can be updated by authorized University Admins.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amberwarm-50 dark:bg-amberwarm-950/40 border border-amberwarm-200 dark:border-amberwarm-900/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-amberwarm-600 dark:text-amberwarm-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amberwarm-900 dark:text-amberwarm-200">
          <span className="font-bold">Campus Data Policy: </span>
          All leadership, room patterns, and resource quantities are user-provided initial seed structures. Exact missing room numbers are never fabricated; instead, the platform provides full admin CRUD capabilities to refine inventory dynamically.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-warm-200 dark:border-warm-800 pb-3 mb-6 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('leadership')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'leadership'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-blush-400" />
          Leadership & HODs ({leadership.length})
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'blocks'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-blush-400" />
          Campus Blocks & Floors ({blocks.length})
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'resources'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-blush-400" />
          Resource Catalog ({resources.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-blush-400" />
          Event Categories
        </button>
      </div>

      {/* Tab 1: Leadership */}
      {activeTab === 'leadership' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leadership.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 shadow-warm-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blush-50 dark:bg-blush-950 text-blush-800 dark:text-blush-200 border border-blush-200 dark:border-blush-800">
                    {member.role}
                  </span>
                  <span className="text-[10px] text-warm-400 flex items-center gap-1">
                    <Edit3 className="w-3 h-3 text-warm-400" /> Admin Editable
                  </span>
                </div>
                <h3 className="font-bold text-sm text-warm-900 dark:text-warm-100">
                  {member.name}
                </h3>
                {member.qualifications && (
                  <p className="text-[11px] text-blush-700 dark:text-blush-300 font-semibold">
                    {member.qualifications}
                  </p>
                )}
                <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
                  {member.department}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-warm-100 dark:border-warm-800 flex items-center justify-between text-[10px] text-warm-400">
                <span>VFSTR Vadlamudi</span>
                <span className="text-sage-600 dark:text-sage-400 font-bold">User Seed Record</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Campus Blocks */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blocks.map((b) => (
            <div
              key={b.block_id}
              className="p-5 rounded-2xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 shadow-warm-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-warm-900 dark:text-warm-100">{b.name}</h3>
                    <p className="text-xs text-warm-500">{b.total_floors} Floors Configured</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-warm-600 dark:text-warm-300 mb-4 leading-relaxed">
                {b.description}
              </p>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-warm-400 mb-2">
                  Known Structure Patterns:
                </h4>
                <div className="space-y-1">
                  {b.known_patterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 rounded-lg bg-warm-50 dark:bg-warm-850 border border-warm-200 dark:border-warm-800 font-mono text-warm-800 dark:text-warm-200"
                    >
                      {pat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Resources */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-2xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 shadow-warm-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300">
                  {res.category}
                </span>
                <h4 className="font-bold text-sm text-warm-900 dark:text-warm-100 mt-1.5">
                  {res.name}
                </h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-warm-900 dark:text-warm-100">
                    {res.available_quantity}
                  </span>
                  <span className="text-xs text-warm-400 font-medium">
                    / {res.total_quantity} {res.unit}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-warm-100 dark:border-warm-800 flex items-center justify-between text-[10px] text-warm-400">
                <span>Status: Optimal</span>
                <span className="text-blush-700 dark:text-blush-300 font-bold">Editable Inventory</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([catName, events]) => (
            <div
              key={catName}
              className="p-5 rounded-2xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 shadow-warm-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-blush-600 dark:text-blush-400" />
                <h3 className="font-bold text-base text-warm-900 dark:text-warm-100">{catName}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {events.map((ev, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 border border-warm-200 dark:border-warm-700"
                  >
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
