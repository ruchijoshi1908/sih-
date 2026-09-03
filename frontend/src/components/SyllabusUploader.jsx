import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function SyllabusUploader({ courseId, onUploadSuccess }) {
  const { showToast } = useApp();
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [activeMode, setActiveMode] = useState('sample'); // 'sample' | 'file' | 'text'
  const [isUploading, setIsUploading] = useState(false);

  const sampleLegacySyllabi = {
    ds: `COURSE SYLLABUS: APPLIED DATA SCIENCE & ANALYTICS (DS-201)
Curriculum Version: 1.0
Module 1: Introduction to Programming with Python
- Python syntax, variables, lists, dictionaries, functions, and NumPy arrays.
Module 2: Legacy Computing & Systems (C Programming)
- Pointers, memory allocation, and basic linked lists in C language.
Module 3: Mathematics and Statistics for Data Science
- Mean, variance, standard deviation, normal distributions, and hypothesis testing.
Module 4: Machine Learning Fundamentals
- Linear Regression, Logistic Regression, Decision Trees, and Scikit-Learn.
Module 5: Exploratory Data Analysis
- Pandas DataFrames, Matplotlib static charts, and data cleaning.
Lab Practicals:
- Lab 1: Python data structures.
- Lab 2: C programming memory exercises.
- Lab 3: Boston Housing price prediction with Scikit-Learn.`,
    
    web: `COURSE SYLLABUS: WEB APPLICATION DEVELOPMENT (WEB-101)
Curriculum Version: 1.0
Module 1: HTML & CSS Fundamentals
- HTML5 markup, CSS box model, floats, styling, and basic media queries.
Module 2: Client-side Scripting
- JavaScript ES5 syntax, DOM manipulation, events, and jQuery introduction.
Module 3: Server-side PHP & MySQL
- PHP scripts, GET/POST forms, sessions, MySQL database queries, and phpMyAdmin.
Lab Practicals:
- Lab 1: HTML/CSS portfolio site.
- Lab 2: PHP & MySQL student CRUD application.`,
  };

  const handleLoadSample = (key) => {
    setRawText(sampleLegacySyllabi[key]);
    setActiveMode('text');
    showToast('Loaded sample legacy syllabus into editor!');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file && !rawText.trim()) {
      showToast('Please select a file or enter syllabus text', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('raw_text', rawText);
      }

      const res = await api.uploadSyllabus(courseId, formData);
      showToast(res.message || 'Syllabus uploaded & parsed successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload syllabus', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Upload / Input Course Syllabus
          </h3>
          <p className="text-xs text-slate-400">PDF, TXT, or direct text parsing for skill extraction</p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('sample')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === 'sample' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Samples
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('file')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload PDF/File
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Sample Picker Mode */}
        {activeMode === 'sample' && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Legacy Sample Syllabi (For Quick Judge Demos)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoadSample('ds')}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-400">
                  Data Science (Legacy v1.0)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Teaches Python & C, but lacks SQL, GenAI, and Power BI.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('web')}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-400">
                  Web Development (Legacy v1.0)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Teaches PHP & jQuery, but lacks React, Next.js, and TypeScript.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* File Dropzone Mode */}
        {activeMode === 'file' && (
          <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-6 text-center transition-all bg-slate-900/30 flex flex-col items-center justify-center gap-2">
            <UploadCloud className="w-10 h-10 text-indigo-400" />
            <div className="text-xs text-slate-300">
              <label className="text-indigo-400 font-semibold cursor-pointer hover:underline">
                <span>Click to browse</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>{' '}
              or drag & drop syllabus document
            </div>
            <p className="text-[11px] text-slate-500">Supports PDF and TXT syllabus files</p>
            {file && (
              <div className="mt-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-mono">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        )}

        {/* Text Input Mode */}
        {activeMode === 'text' && (
          <div>
            <textarea
              rows={7}
              placeholder="Paste course modules, curriculum units, and learning outcomes here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <span>Extracting Skills...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Syllabus & Extract Skills</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
