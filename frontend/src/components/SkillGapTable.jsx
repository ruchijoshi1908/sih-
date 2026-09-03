import React, { useState } from 'react';
import { CheckCircle, XCircle, Zap, CircleDashed, FileSearch, Search, Filter } from 'lucide-react';
import { api } from '../api/client';
import EvidenceModal from './EvidenceModal';

export default function SkillGapTable({ gaps = [], domain = 'Data Science', onOpenEvidence }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const handleInspectEvidence = async (skillName) => {
    try {
      setLoadingEvidence(true);
      const ev = await api.getEvidence(skillName, domain);
      setSelectedEvidence(ev);
      setIsEvidenceOpen(true);
    } catch (err) {
      console.error('Failed to load evidence for', skillName, err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const filteredGaps = gaps.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch = item.skill.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <CheckCircle className="w-3.5 h-3.5" />
            Matched
          </span>
        );
      case 'MISSING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            Missing (High Demand)
          </span>
        );
      case 'EMERGING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Zap className="w-3.5 h-3.5" />
            Emerging
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 w-fit">
            <CircleDashed className="w-3.5 h-3.5" />
            Low Demand
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
      {/* Table Controls */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skill or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'MISSING', 'MATCHED', 'EMERGING', 'LOW DEMAND'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                filter === statusKey
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Skill Name</th>
              <th className="px-5 py-3.5">Domain Category</th>
              <th className="px-5 py-3.5">Industry Demand</th>
              <th className="px-5 py-3.5 text-center">Taught in Syllabus</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredGaps.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 italic">
                  No skills match the selected filter.
                </td>
              </tr>
            ) : (
              filteredGaps.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-white text-sm">
                    {item.skill}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {item.category}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5 max-w-[160px]">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.industry_demand_percentage >= 60
                              ? 'bg-rose-500'
                              : item.industry_demand_percentage >= 35
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${item.industry_demand_percentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-300 w-9 text-right">
                        {item.industry_demand_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {item.taught_in_curriculum ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                        ✕
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleInspectEvidence(item.skill)}
                      disabled={loadingEvidence}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700/80 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Evidence</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
      />
    </div>
  );
}
