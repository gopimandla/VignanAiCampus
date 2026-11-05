import React from 'react';
import { Sparkles, Shield, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-warm-200 dark:border-warm-800/80 bg-warm-100/50 dark:bg-warm-950 text-warm-600 dark:text-warm-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-warm-900 dark:bg-warm-700 flex items-center justify-center text-warm-50 font-bold text-base border border-warm-700">
                V
              </div>
              <span className="font-bold text-warm-950 dark:text-warm-50 text-base">
                Vignan AI Campus EventOps
              </span>
            </div>
            <p className="text-xs leading-relaxed text-warm-600 dark:text-warm-400 max-w-md">
              AI-orchestrated campus event management, real-time venue optimization, and operations platform for Vignan&apos;s Foundation for Science, Technology and Research (VFSTR), Vadlamudi.
            </p>
            <div className="flex items-center gap-2 text-xs text-warm-500">
              <MapPin className="w-3.5 h-3.5 text-blush-500 shrink-0" />
              <span>Vadlamudi, Guntur, Andhra Pradesh - 522213</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warm-900 dark:text-warm-100 mb-3">
              Campus Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-blush-500" /> Event Planning Agent</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-blush-500" /> Venue Capacity Agent</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-blush-500" /> Resource Optimizer</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-blush-500" /> Schedule Conflict Detector</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-blush-500" /> Dynamic Replanner</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warm-900 dark:text-warm-100 mb-3">
              Governance & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-sage-600 dark:text-sage-400" /> 11 Campus Roles RBAC</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-sage-600 dark:text-sage-400" /> Multi-Tier Approval Chain</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-sage-600 dark:text-sage-400" /> MongoDB Atlas Master Data</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-sage-600 dark:text-sage-400" /> JWT Bearer Security</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-warm-200 dark:border-warm-850 flex flex-col sm:flex-row items-center justify-between text-[11px] text-warm-500 gap-4">
          <p>© 2026 Vignan University EventOps. Hackathon Edition.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">FastAPI Backend</span>
            <span>•</span>
            <span className="flex items-center gap-1">Anthropic Claude AI</span>
            <span>•</span>
            <span className="flex items-center gap-1">React + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
