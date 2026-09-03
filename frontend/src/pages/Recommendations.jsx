import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  PlusCircle,
  GitBranch,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import RecommendationCard from '../components/RecommendationCard';

export default function Recommendations({ setActiveTab }) {
  const { selectedCourseId, selectedCourse, loadCourses, showToast } = useApp();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNumber, setVersionNumber] = useState('2.0');
  const [changesSummary, setChangesSummary] = useState(
    'Incorporated employer-validated industry requirements: SQL analytics, Generative AI LLM architectures, and Power BI enterprise reporting.'
  );

  const loadRecommendations = async () => {
    if (!selectedCourseId) return;
    try {
      setIsLoading(true);
      const data = await api.getRecommendations(selectedCourseId);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedCourseId]);

  const approvedRecs = recommendations.filter((r) => r.status === 'approved');
  const pendingRecs = recommendations.filter((r) => r.status === 'pending');

  const handleApplyVersion = async (e) => {
    e.preventDefault();
    try {
      setIsApplying(true);
      const payload = {
        version_number: versionNumber,
        changes_summary: changesSummary,
        applied_recommendation_ids: recommendations.map((r) => r.id),
      };

      const res = await api.createUpdatedVersion(selectedCourseId, payload);
      showToast(res.message || `Successfully created Version ${versionNumber}!`, 'success');
      setShowVersionModal(false);
      await loadRecommendations();
      await loadCourses();
      // Navigate to placement loop
      setActiveTab('placements');
    } catch (err) {
      showToast(err.message || 'Failed to update curriculum version', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI Recommendation Agent
            </span>
            <span className="text-xs text-slate-400 font-medium">Course: {selectedCourse?.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Curriculum Enhancement Recommendations
          </h1>
          <p className="text-xs text-slate-400">
            Actionable syllabus modifications generated from industry job market evidence & employer feedback
          </p>
        </div>

        {/* Version 2.0 CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVersionModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            <span>Apply Changes → Create Version 2.0</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Recommendations</span>
            <div className="text-2xl font-bold text-white mt-1">{recommendations.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Approved by Employers</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{approvedRecs.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Validation</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{pendingRecs.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recommended Syllabus Modifications</h2>
          <span className="text-xs text-slate-400 font-mono">
            Targeting Version {selectedCourse?.current_version === '1.0' ? '2.0' : 'Next'}
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 space-y-3">
            <p>No recommendations currently pending for this course.</p>
            <button
              onClick={() => setActiveTab('audit')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Run Audit to Generate Recommendations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isReadOnly={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Version Upgrade Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Apply Changes & Create Version 2.0</h3>
                <p className="text-xs text-slate-400">Course: {selectedCourse?.name}</p>
              </div>
            </div>

            <form onSubmit={handleApplyVersion} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">New Version Number</label>
                <input
                  type="text"
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Summary of Curriculum Changes</label>
                <textarea
                  rows={4}
                  value={changesSummary}
                  onChange={(e) => setChangesSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                Applying will archive Version 1.0, publish Version 2.0 with all recommended modules, and recalculate the improved Drift Score.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  {isApplying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                  <span>Publish Version {versionNumber}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
