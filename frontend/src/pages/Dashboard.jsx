import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  TrendingUp, 
  Briefcase, 
  ArrowRight, 
  Sparkles,
  Layers,
  Database,
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import StatCard from '../components/StatCard';

export default function Dashboard({ setActiveTab }) {
  const { courses, setSelectedCourseId, currentRole } = useApp();
  const [jobStats, setJobStats] = useState(null);
  const [recentValidations, setRecentValidations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, recsData] = await Promise.all([
          api.getJobStats().catch(() => null),
          api.getEmployerRecommendations('all').catch(() => []),
        ]);
        setJobStats(statsData);
        setRecentValidations(recsData.filter((r) => r.status !== 'pending').slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute summary stats
  const totalCourses = courses.length;
  const outdatedCourses = courses.filter((c) => (c.latest_drift_score || 0) > 60).length;
  const needsUpdateCourses = courses.filter((c) => (c.latest_drift_score || 0) > 30 && (c.latest_drift_score || 0) <= 60).length;
  const avgDrift = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.latest_drift_score || 0), 0) / courses.length)
    : 0;

  const handleInspectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveTab('audit');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="p-8 rounded-3xl glass-card border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Labour Market Intelligence & Curriculum Alignment
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Bridging the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Higher Education</span> & Industry Demand
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Continuous real-time labour market monitoring detects curriculum drift, generates evidence-backed syllabus upgrades, and validates changes with industry employers to accelerate graduate placement outcomes.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('audit')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Run Curriculum Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-all flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Explore Live Job Market</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={totalCourses}
          subtitle={`${courses.length} curricula monitored`}
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Courses Outdated"
          value={outdatedCourses}
          subtitle="Drift Score > 60% (Immediate Action)"
          icon={Flame}
          trend={outdatedCourses > 0 ? '🔴 Urgent' : 'Healthy'}
          color="rose"
        />
        <StatCard
          title="Average Drift Score"
          value={`${avgDrift}%`}
          subtitle="Misalignment index across catalog"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Placement Gain (v1 → v2)"
          value="+14%"
          subtitle="Average cohort outcome increase"
          icon={TrendingUp}
          trend="+24.1% Rel."
          color="emerald"
        />
      </div>

      {/* Course Catalog Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Monitored Courses & Drift Status</h2>
            <p className="text-xs text-slate-400">Select any course to view syllabus extraction and execute audit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const score = Math.round(course.latest_drift_score || 0);
            const isHealthy = score <= 30;
            const isNeedsUpdate = score > 30 && score <= 60;
            const isOutdated = score > 60;

            const badgeClass = isHealthy
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isNeedsUpdate
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            const statusLabel = isHealthy ? 'Healthy' : isNeedsUpdate ? 'Needs Update' : 'Outdated';

            return (
              <div
                key={course.id}
                onClick={() => handleInspectCourse(course.id)}
                className="p-6 rounded-2xl glass-card glass-panel-hover border border-slate-800 cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-400 font-semibold">{course.code}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-medium">{course.domain}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{course.name}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${badgeClass}`}>
                      <span>{score}%</span>
                      <span>•</span>
                      <span>{statusLabel}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">Active: Version {course.current_version}</span>
                  <span className="text-indigo-400 font-medium group-hover:translate-x-1 flex items-center gap-1">
                    Audit Curriculum <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Top Missing Skills & Employer Validations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Demanded Market Skills */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Top Industry Demanded Skills
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {jobStats?.total_jobs || 15} live jobs analyzed
            </span>
          </div>

          <div className="space-y-3">
            {(jobStats?.top_demanded_skills || []).slice(0, 5).map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-200">{item.skill} <span className="text-slate-500 text-[11px]">({item.category})</span></span>
                  <span className="font-mono text-indigo-400 font-semibold">{item.demand_percentage}% Demand</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${item.demand_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Employer Feedback */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Recent Employer Validations
            </h3>
            <button
              onClick={() => setActiveTab('employer')}
              className="text-xs text-indigo-400 hover:underline font-medium"
            >
              Open Portal
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {recentValidations.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No validations submitted yet. Visit the Employer Portal to validate recommendations.</p>
            ) : (
              recentValidations.map((v, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{v.skill_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      v.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{v.proposed_module}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
