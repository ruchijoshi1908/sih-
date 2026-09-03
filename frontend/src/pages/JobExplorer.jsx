import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  PlusCircle, 
  Building2, 
  MapPin, 
  Calendar, 
  Sparkles,
  Layers,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function JobExplorer() {
  const { showToast } = useApp();
  const [jobs, setJobs] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Bengaluru, Karnataka');
  const [newCategory, setNewCategory] = useState('Data Science');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getJobs(roleFilter === 'All' ? '' : roleFilter, search);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadJobs();
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        title: newTitle,
        company: newCompany,
        location: newLocation,
        role_category: newCategory,
        description: newDescription,
        source: 'Manual Submission',
      };

      const res = await api.createJob(payload);
      showToast(`Job '${res.title}' added & skills extracted!`, 'success');
      setShowAddModal(false);
      setNewTitle('');
      setNewCompany('');
      setNewDescription('');
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Failed to add job', 'error');
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
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Labour Market DB
            </span>
            <span className="text-xs text-slate-400 font-medium">{jobs.length} Postings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Job Market Intelligence Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Real-time industry hiring signals, job descriptions, and normalized skill requirements
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Job Posting</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search job title, company, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {['All', 'Data Science', 'Web Development', 'Cloud & DevOps'].map((cat) => (
            <button
              key={cat}
              onClick={() => setRoleFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                roleFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700/80 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {job.role_category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-3">
                {job.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] text-slate-500 font-medium">Required Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {(job.skills || []).map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-mono"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add Industry Job Description</h3>
                <p className="text-xs text-slate-400">AI will automatically extract and normalize skills</p>
              </div>
            </div>

            <form onSubmit={handleAddJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Generative AI Engineer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme AI Labs"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Role Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Data Science">Data Science</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Job Description & Responsibilities</label>
                <textarea
                  rows={5}
                  placeholder="Paste job posting text mentioning required skills and technologies..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
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
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Save Job Posting</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
