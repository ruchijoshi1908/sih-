import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckCircle, Flame, Calculator, ChevronRight } from 'lucide-react';

export default function DriftScoreGauge({ score = 0, status = 'Healthy', formulaBreakdown = '', metrics = {} }) {
  const [showFormula, setShowFormula] = useState(false);

  // Status Colors & Badges
  const isHealthy = score <= 30;
  const isNeedsUpdate = score > 30 && score <= 60;
  const isOutdated = score > 60;

  const strokeColor = isHealthy ? '#10b981' : isNeedsUpdate ? '#f59e0b' : '#f43f5e';
  const badgeBg = isHealthy 
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : isNeedsUpdate
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const StatusIcon = isHealthy ? CheckCircle : isNeedsUpdate ? AlertTriangle : Flame;

  // SVG circular arc calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Drift Score</span>
          <p className="text-xs text-slate-500">Industry gap misalignment index (0–100)</p>
        </div>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 transition-colors flex items-center gap-1 text-xs"
          title="View Mathematical Formula Breakdown"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">Formula</span>
        </button>
      </div>

      {/* Main Gauge Graphic */}
      <div className="my-6 flex items-center justify-center relative">
        <svg className="w-44 h-44 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="#1e293b"
            strokeWidth="14"
            fill="transparent"
          />
          {/* Active progress arc */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke={strokeColor}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">{Math.round(score)}</span>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">/ 100 Score</span>
        </div>
      </div>

      {/* Status Badge & Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badgeBg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">
            {metrics?.missing_skills ? `${metrics.missing_skills.length} gaps detected` : 'Audited'}
          </span>
        </div>
      </div>

      {/* Formula Breakdown Modal / Drawer */}
      {showFormula && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/95 border border-indigo-500/30 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-semibold text-indigo-300">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              Mathematical Formula (0–100)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Deterministic / No ML Hallucinations</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 font-mono text-[11px] text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed">
            {formulaBreakdown || 'Drift Score = (Sum of Missing Industry Demand Weights / Total Industry Demand Weights) × 100'}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
            <div className="p-1.5 rounded bg-slate-950/50 border border-emerald-500/20 text-emerald-300">
              0–30: 🟢 Healthy
            </div>
            <div className="p-1.5 rounded bg-slate-950/50 border border-amber-500/20 text-amber-300">
              31–60: 🟡 Needs Update
            </div>
            <div className="p-1.5 rounded bg-slate-950/50 border border-rose-500/20 text-rose-300">
              61–100: 🔴 Outdated
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
