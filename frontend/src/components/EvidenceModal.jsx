import React from 'react';
import { X, Building2, MapPin, Calendar, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EvidenceModal({ evidence, isOpen, onClose }) {
  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl glass-card border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{evidence.skill}</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {evidence.demand_percentage}% Market Demand
                </span>
              </div>
              <p className="text-xs text-slate-400">Target Role: {evidence.role_category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
            <div className="font-semibold text-indigo-300">Labour Market Evidence Summary</div>
            <p className="text-slate-300 leading-relaxed">{evidence.evidence_summary}</p>
          </div>

          {/* Supporting Job Postings */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Supporting Live Job Postings ({evidence.supporting_postings?.length || 0})
            </h4>

            {(!evidence.supporting_postings || evidence.supporting_postings.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No direct job excerpts found.</p>
            ) : (
              <div className="space-y-3">
                {evidence.supporting_postings.map((job, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-sm font-semibold text-white">{job.title}</h5>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {job.location}
                          </span>
                          {job.date_posted && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {job.date_posted}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {job.source}
                      </span>
                    </div>

                    {/* Excerpt */}
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 italic">
                      "{job.snippet}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Source: Real-time Labour Market Intelligence Database</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            Close Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
