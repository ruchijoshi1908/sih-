import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BookOpen, 
  Calendar, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function StudentAudit() {
  const { showToast } = useApp();
  const [targetRoles, setTargetRoles] = useState(['Data Science', 'Web Development', 'Cloud & DevOps']);
  const [selectedRole, setSelectedRole] = useState('Data Science');
  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [resumeText, setResumeText] = useState(
    `Aarav Sharma | Computer Science Student
Email: aarav.sharma@edu.in | GitHub: github.com/aaravs

Education: B.Tech Computer Science (Final Year)

Skills:
- Programming: Python, C++, Basic JavaScript, HTML5, CSS3
- Data Science: Pandas, NumPy, Scikit-Learn, Matplotlib
- Core: Data Structures, Algorithms, Linear Algebra, Statistics

Projects:
- House Price Prediction: Built regression model in Scikit-Learn with 85% R2 score.
- Student Portal: Basic web application using HTML, CSS, and JavaScript.`
  );
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const roles = await api.getTargetRoles();
        if (roles && roles.length > 0) setTargetRoles(roles);
      } catch (err) {
        console.error('Error fetching target roles:', err);
      }
    }
    loadRoles();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('full_name', studentName);
      formData.append('target_role', selectedRole);

      if (file) {
        formData.append('file', file);
      } else {
        formData.append('resume_text', resumeText);
      }

      const res = await api.analyzeResume(formData);
      setResult(res);
      showToast(`Resume audited! Career Readiness Score: ${res.readiness_score}%`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to analyze resume', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Student Career Hub
            </span>
            <span className="text-xs text-slate-400 font-medium">Personalized Gap Diagnostic</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Student Resume & Skill Gap Audit
          </h1>
          <p className="text-xs text-slate-400">
            Upload your resume, select a target role, discover missing industry skills, and get a structured roadmap
          </p>
        </div>
      </div>

      {/* Main Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Resume Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Candidate Profile & Target Role
            </h3>

            <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Industry Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  {targetRoles.map((r, i) => (
                    <option key={i} value={r} className="bg-slate-900">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Resume Text / PDF</label>
                  <label className="text-indigo-400 font-semibold cursor-pointer hover:underline">
                    <span>{file ? file.name : '+ Upload PDF file'}</span>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 font-mono text-[11px] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  placeholder="Paste resume content here..."
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Skills vs Target Role...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Resume Gap Audit</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Audit Results & 4-Week Roadmap */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Ready for Audit</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Run Resume Gap Audit" to extract your skills, compute your role readiness score, and receive a personalized 4-week learning pathway.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Readiness Score Card */}
              <div className="p-6 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Target Role Match</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{result.target_role}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {result.matched_skills.length} of {result.matched_skills.length + result.missing_skills.length} industry requirements met
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 shadow-inner text-center">
                  <span className="text-3xl font-black text-amber-400">{result.readiness_score}%</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Readiness</span>
                </div>
              </div>

              {/* Skills Matched vs Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-950/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skills You Have ({result.matched_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matched_skills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl glass-card border border-rose-500/20 bg-rose-950/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <XCircle className="w-4 h-4" />
                    <span>Missing Skills to Learn ({result.missing_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_skills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/30">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4-Week Roadmap */}
              <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Personalized 4-Week Fast-Track Learning Pathway
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Target: 100% Readiness</span>
                </div>

                <div className="space-y-3">
                  {(result.roadmap || []).map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold font-mono">
                            {step.week}
                          </span>
                          <h4 className="font-bold text-white text-sm">{step.focus_skill}</h4>
                        </div>
                        <span className="text-slate-400">{step.goal}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{step.topics}</p>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2 text-[11px]">
                        <span className="font-semibold text-emerald-400">Action Project:</span>
                        <span>{step.actionable_project}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
