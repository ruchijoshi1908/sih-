import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  TrendingUp, 
  Database, 
  Bot, 
  RefreshCw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentRole, setCurrentRole, courses, selectedCourseId, setSelectedCourseId, loadCourses, showToast } = useApp();

  const handleResetDemo = async () => {
    try {
      await api.resetSeedData();
      await loadCourses();
      showToast('Demo data successfully re-seeded!');
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass, roles: ['admin', 'employer', 'student'] },
    { id: 'audit', label: 'Curriculum Audit', icon: ShieldCheck, roles: ['admin'] },
    { id: 'recommendations', label: 'Recommendations & v2', icon: Sparkles, roles: ['admin'] },
    { id: 'employer', label: 'Employer Validation', icon: Briefcase, roles: ['admin', 'employer'] },
    { id: 'placements', label: 'Placement Loop', icon: TrendingUp, roles: ['admin'] },
    { id: 'jobs', label: 'Job Intelligence', icon: Database, roles: ['admin', 'employer', 'student'] },
    { id: 'student', label: 'Student Resume Audit', icon: GraduationCap, roles: ['admin', 'student'] },
    { id: 'automation', label: 'n8n Automation', icon: Bot, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-lg">
      {/* Top Banner & Demo Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/60">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-lg ring-1 ring-white/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">AlignAI</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  SIH PS 134
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal hidden sm:block">
                Labour Market Intelligence & Curriculum Alignment Platform
              </p>
            </div>
          </div>

          {/* Role Switcher & Course Selector */}
          <div className="flex items-center gap-3">
            {/* Quick Course Selector */}
            {courses.length > 0 && (
              <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400">Course:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.code} — {c.name} (v{c.current_version})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Role Switcher Bar */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  showToast('Switched to Government / Training Admin view', 'info');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('employer');
                  setActiveTab('employer');
                  showToast('Switched to Industry Employer Validator view', 'info');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  currentRole === 'employer'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Employer</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('student');
                  setActiveTab('student');
                  showToast('Switched to Student Resume Audit view', 'info');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  currentRole === 'student'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>

            {/* Demo Reset Button */}
            <button
              onClick={handleResetDemo}
              title="Reset sample course and job dataset"
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
