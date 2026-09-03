import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, XCircle, AlertCircle, Filter, Sparkles, Building, UserCheck } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import RecommendationCard from '../components/RecommendationCard';

export default function EmployerPortal() {
  const { showToast } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEmployerRecommendations(filterStatus);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load employer recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [filterStatus]);

  const handleValidate = async (recId, payload) => {
    try {
      await api.validateRecommendation(recId, payload);
      showToast(`Recommendation successfully marked as ${payload.decision.toUpperCase()}!`, 'success');
      loadQueue();
    } catch (err) {
      showToast(err.message || 'Validation submission failed', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Industry Validation Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">Employer Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Industry Skill Validation Queue
          </h1>
          <p className="text-xs text-slate-400">
            Review proposed curriculum updates, confirm hiring requirements, and provide direct feedback
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {['all', 'pending', 'approved', 'partial', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recommendations Awaiting Validation</h2>
          <span className="text-xs text-slate-400 font-mono">
            {recommendations.length} items in queue
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 space-y-2">
            <UserCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Queue Cleared!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All curriculum recommendations for this filter have been validated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                canValidate={true}
                onValidate={handleValidate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
