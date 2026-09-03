import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Award, 
  Users, 
  DollarSign, 
  Sparkles, 
  RefreshCw,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import PlacementChart from '../components/PlacementChart';

export default function PlacementTracker() {
  const { selectedCourseId, selectedCourse, showToast } = useApp();

  const [comparisonData, setComparisonData] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [batchName, setBatchName] = useState('Batch 2025-2026 (v2.0)');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [studentsEnrolled, setStudentsEnrolled] = useState(100);
  const [studentsPlaced, setStudentsPlaced] = useState(72);
  const [avgSalaryLpa, setAvgSalaryLpa] = useState(7.2);
  const [topCompanies, setTopCompanies] = useState('Google, Microsoft, Amazon, Swiggy, Zomato');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPlacementData = async () => {
    if (!selectedCourseId) return;
    try {
      setIsLoading(true);
      const [compRes, detailRes] = await Promise.all([
        api.getPlacementComparison(selectedCourseId),
        api.getCourseDetail(selectedCourseId),
      ]);
      setComparisonData(compRes);
      setCourseDetail(detailRes);
      if (detailRes.versions && detailRes.versions.length > 0) {
        setSelectedVersionId(detailRes.versions[0].id);
      }
    } catch (err) {
      console.error('Failed to load placement data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlacementData();
  }, [selectedCourseId]);

  const handleSubmitPlacement = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        course_id: selectedCourseId,
        curriculum_version_id: Number(selectedVersionId),
        batch_name: batchName,
        students_enrolled: Number(studentsEnrolled),
        students_placed: Number(studentsPlaced),
        average_salary_lpa: Number(avgSalaryLpa),
        top_hiring_companies: topCompanies,
      };

      await api.recordPlacement(payload);
      showToast('Placement batch data successfully recorded!', 'success');
      setShowAddModal(false);
      loadPlacementData();
    } catch (err) {
      showToast(err.message || 'Failed to record placement data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Closed Feedback Loop
            </span>
            <span className="text-xs text-slate-400 font-medium">Course: {selectedCourse?.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Placement Outcomes & ROI Tracking
          </h1>
          <p className="text-xs text-slate-400">
            Measure whether curriculum updates and employer-validated skills improve student employment rates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Batch Placements</span>
        </button>
      </div>

      {/* Placement Chart and Comparison View */}
      <PlacementChart
        outcomesComparison={comparisonData}
        onOpenAddOutcome={() => setShowAddModal(true)}
      />

      {/* Add Outcome Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Record Batch Placement Data</h3>
                <p className="text-xs text-slate-400">{selectedCourse?.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPlacement} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Batch Label</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Curriculum Version</label>
                  <select
                    value={selectedVersionId}
                    onChange={(e) => setSelectedVersionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {(courseDetail?.versions || []).map((v) => (
                      <option key={v.id} value={v.id} className="bg-slate-900">
                        Version {v.version_number} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Students Enrolled</label>
                  <input
                    type="number"
                    value={studentsEnrolled}
                    onChange={(e) => setStudentsEnrolled(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Students Placed</label>
                  <input
                    type="number"
                    value={studentsPlaced}
                    onChange={(e) => setStudentsPlaced(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Avg Salary (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgSalaryLpa}
                    onChange={(e) => setAvgSalaryLpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Top Hiring Companies</label>
                <input
                  type="text"
                  placeholder="e.g. Infosys, TCS, Google, Amazon"
                  value={topCompanies}
                  onChange={(e) => setTopCompanies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px]">
                Computed Placement Rate:{' '}
                <span className="font-bold text-white">
                  {studentsEnrolled > 0 ? ((studentsPlaced / studentsEnrolled) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>Save Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
