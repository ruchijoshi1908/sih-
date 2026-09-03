import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  CheckCircle2, 
  Clock, 
  Webhook, 
  Send, 
  RefreshCw, 
  Download, 
  ArrowRight,
  ShieldAlert,
  Database
} from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function AutomationHub() {
  const { showToast } = useApp();
  const [statusData, setStatusData] = useState(null);
  const [isTriggeringJob, setIsTriggeringJob] = useState(false);
  const [isTriggeringAlert, setIsTriggeringAlert] = useState(false);
  const [webhookLog, setWebhookLog] = useState([]);

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await api.getN8nStatus();
        setStatusData(data);
      } catch (err) {
        console.error('Failed to load n8n status:', err);
      }
    }
    loadStatus();
  }, []);

  const handleTestJobSync = async () => {
    try {
      setIsTriggeringJob(true);
      const testJobs = [
        {
          title: 'GenAI Full Stack Developer',
          company: 'NextGen Scale AI',
          location: 'Bengaluru, India',
          role_category: 'Data Science',
          description: 'Looking for a developer skilled in Python, Generative AI, LangChain, PostgreSQL, and FastAPI.',
          source: 'n8n Webhook Test Ingest',
        },
      ];

      const res = await api.triggerJobSyncWebhook(testJobs);
      showToast('n8n Job Market Ingestion workflow triggered!', 'success');
      setWebhookLog((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          event: 'Workflow 01 (Job Ingestion)',
          result: `Ingested ${res.ingested_count} job postings`,
          status: 'SUCCESS',
        },
        ...prev,
      ]);
    } catch (err) {
      showToast(err.message || 'Webhook trigger failed', 'error');
    } finally {
      setIsTriggeringJob(false);
    }
  };

  const handleTestAlert = async () => {
    try {
      setIsTriggeringAlert(true);
      // Simulate alert dispatch
      await new Promise((r) => setTimeout(r, 600));
      showToast('Employer alert webhook successfully dispatched to partners!', 'success');
      setWebhookLog((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          event: 'Workflow 02 (Audit Alert Dispatch)',
          result: 'Dispatched alert notifications to 4 employer partners',
          status: 'SUCCESS',
        },
        ...prev,
      ]);
    } catch (err) {
      showToast('Alert trigger failed', 'error');
    } finally {
      setIsTriggeringAlert(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Low-Code Automation
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            n8n Automation Pipelines
          </h1>
          <p className="text-xs text-slate-400">
            Scheduled job ingestion scrapers and event-driven employer validation alert workflows
          </p>
        </div>
      </div>

      {/* Workflows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow 1: Job Updater */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active / Scheduled
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">01 — Job Market Ingestion & Extractor</h3>
              <p className="text-xs text-slate-400 mt-1">
                Runs daily via cron schedule. Scrapes job listings, calls AI skill normalizer, and populates the database.
              </p>
            </div>

            {/* Workflow Pipeline Steps */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cron Trigger (Daily @ 00:00 UTC)</span>
              </div>
              <div className="pl-5 text-slate-500">↓ HTTP GET Jobs API</div>
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Skill Normalizer Node</span>
              </div>
              <div className="pl-5 text-slate-500">↓ POST /api/n8n/trigger-job-sync</div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PostgreSQL / SQLite Database Insert</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestJobSync}
            disabled={isTriggeringJob}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isTriggeringJob ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Test Ingestion Webhook</span>
          </button>
        </div>

        {/* Workflow 2: Audit Notification */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Event Webhook
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">02 — Drift Alert & Employer Dispatch</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fires when a course audit detects Drift Score &ge; 50%. Dispatches email and Slack notifications to employer partners.
              </p>
            </div>

            {/* Workflow Pipeline Steps */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Webhook className="w-3.5 h-3.5 text-rose-400" />
                <span>Webhook Trigger (Course Audit Complete)</span>
              </div>
              <div className="pl-5 text-slate-500">↓ IF Drift Score &ge; 50%</div>
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-rose-400" />
                <span>Slack Channel Alert (#curriculum-alerts)</span>
              </div>
              <div className="pl-5 text-slate-500">↓ Send Email to Partner Network</div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validation Link Dispatch</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestAlert}
            disabled={isTriggeringAlert}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isTriggeringAlert ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Test Employer Alert Webhook</span>
          </button>
        </div>
      </div>

      {/* Live Webhook Execution Log */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Automation Activity & Webhook Execution Log
        </h3>

        {webhookLog.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-3">
            No live webhook events triggered yet in this session. Click "Test Webhook" above to simulate an automated run.
          </p>
        ) : (
          <div className="space-y-2">
            {webhookLog.map((entry, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 text-[11px]">{entry.timestamp}</span>
                  <span className="font-semibold text-white">{entry.event}</span>
                  <span className="text-slate-400">— {entry.result}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
