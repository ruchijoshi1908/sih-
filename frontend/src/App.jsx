import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import CourseAudit from './pages/CourseAudit';
import Recommendations from './pages/Recommendations';
import EmployerPortal from './pages/EmployerPortal';
import PlacementTracker from './pages/PlacementTracker';
import JobExplorer from './pages/JobExplorer';
import StudentAudit from './pages/StudentAudit';
import AutomationHub from './pages/AutomationHub';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'audit':
        return <CourseAudit setActiveTab={setActiveTab} />;
      case 'recommendations':
        return <Recommendations setActiveTab={setActiveTab} />;
      case 'employer':
        return <EmployerPortal />;
      case 'placements':
        return <PlacementTracker />;
      case 'jobs':
        return <JobExplorer />;
      case 'student':
        return <StudentAudit />;
      case 'automation':
        return <AutomationHub />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Global Toast */}
      <Toast toast={toast} onClose={() => {}} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AlignAI Platform</span>
            <span>•</span>
            <span>SIH PS 134 — Labour Market Intelligence & Curriculum Alignment</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>FastAPI + PostgreSQL / SQLite + React + n8n</span>
            <span>•</span>
            <span className="text-indigo-400 font-mono">Demo Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
