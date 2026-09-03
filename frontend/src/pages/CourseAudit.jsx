import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import DriftScoreGauge from '../components/DriftScoreGauge';
import SkillGapTable from '../components/SkillGapTable';
import SyllabusUploader from '../components/SyllabusUploader';

export default function CourseAudit({ setActiveTab }) {
  const { courses, selectedCourseId, setSelectedCourseId, selectedCourse, loadCourses, showToast } = useApp();

  const [courseDetail, setCourseDetail] = useState(null);
  const [driftData, setDriftData] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const loadAuditData = async () => {
    if (!selectedCourseId) return;
    try {
      setIsLoading(true);
      const [detailRes, driftRes, gapRes] = await Promise.all([
        api.getCourseDetail(selectedCourseId).catch(() => null),
        api.getDriftScore(selectedCourseId).catch(() => null),
        api.getSkillGaps(selectedCourseId).catch(() => null),
      ]);
      setCourseDetail(detailRes);
      setDriftData(driftRes);
      setGapData(gapRes);
    } catch (err) {
      console.error('Error loading audit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [selectedCourseId]);

  const handleExecuteAudit = async () => {
    try {
      setIsRunningAudit(true);
      showToast('Extracting skills, parsing live job market, and computing Drift Score...', 'info');
      const res = await api.runAudit(selectedCourseId);
      setDriftData(res);
      await loadAuditData();
      await loadCourses();
      showToast(`Audit completed! Drift Score: ${res.score}% (${res.status})`, 'success');
    } catch (err) {
      showToast(err.message || 'Audit failed to execute', 'error');
    } finally {
      setIsRunningAudit(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Course Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Core Module
            </span>
            <span className="text-xs text-slate-400 font-medium">Domain: {selectedCourse?.domain}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Curriculum Audit & Gap Analysis
          </h1>
          <p className="text-xs text-slate-400">
            Compare active syllabus skills against current industry job market demand
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>{showUploader ? 'Hide Uploader' : 'Upload Syllabus'}</span>
          </button>

          <button
            onClick={handleExecuteAudit}
            disabled={isRunningAudit}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningAudit ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing Live Market...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Curriculum Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Syllabus Uploader Panel (Toggled or shown if needed) */}
      {showUploader && (
        <SyllabusUploader
          courseId={selectedCourseId}
          onUploadSuccess={() => {
            setShowUploader(false);
            loadAuditData();
          }}
        />
      )}

      {/* Main Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Drift Score Gauge & Course Info */}
        <div className="space-y-6">
          <DriftScoreGauge
            score={driftData?.score || 0}
            status={driftData?.status || 'Healthy'}
            formulaBreakdown={driftData?.formula_breakdown}
            metrics={driftData?.metrics}
          />

          {/* Active Syllabus Info Card */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Active Syllabus Overview
            </h3>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Course Code:</span>
                <span className="font-mono text-white font-semibold">{courseDetail?.code || selectedCourse?.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Target Industry Role:</span>
                <span className="text-indigo-300 font-semibold">{selectedCourse?.target_role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Curriculum Version:</span>
                <span className="font-mono font-bold text-white">v{selectedCourse?.current_version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Taught Skills Detected:</span>
                <span className="font-semibold text-emerald-400">
                  {courseDetail?.latest_skills?.length || 0} skills
                </span>
              </div>
            </div>

            {/* Skills Pills */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-medium">Extracted Course Skills:</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(courseDetail?.latest_skills || []).map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800 text-[11px] font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Proceed to Recommendations Button */}
            <div className="pt-3">
              <button
                onClick={() => setActiveTab('recommendations')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-semibold text-xs border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>View AI Recommendations & v2.0</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Skill Gap Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Industry Skill Gap Matrix</h2>
              <p className="text-xs text-slate-400">
                Direct comparison of required market skills vs skills taught in this curriculum
              </p>
            </div>
          </div>

          <SkillGapTable
            gaps={gapData?.gaps || []}
            domain={selectedCourse?.domain || 'Data Science'}
          />
        </div>
      </div>
    </div>
  );
}
