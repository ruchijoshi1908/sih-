import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  FlaskConical, 
  Quote, 
  MessageSquare,
  Building,
  UserCheck
} from 'lucide-react';

export default function RecommendationCard({ 
  recommendation, 
  onValidate, 
  canValidate = false,
  isReadOnly = false 
}) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [employerName, setEmployerName] = useState('Senior Tech Lead');
  const [employerCompany, setEmployerCompany] = useState('Industry Partner Inc.');

  const handleAction = (decision) => {
    if (onValidate) {
      onValidate(recommendation.id, {
        decision,
        comments: comment,
        employer_name: employerName,
        employer_company: employerCompany,
      });
      setShowCommentBox(false);
      setComment('');
    }
  };

  const statusBadge = () => {
    switch (recommendation.status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Employer
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'partial':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Partially Approved
          </span>
        );
      case 'applied':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Applied to Version 2.0
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            Pending Employer Validation
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all shadow-lg">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{recommendation.skill_name}</h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {recommendation.market_demand_percentage}% Demand
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300">
                {recommendation.priority} Priority
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{recommendation.proposed_module}</p>
          </div>
        </div>

        <div>{statusBadge()}</div>
      </div>

      {/* Topics & Content */}
      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Recommended Syllabus Topic:</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{recommendation.recommendation_text}</p>
          </div>
        </div>

        {recommendation.suggested_practical_activity && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <FlaskConical className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Hands-on Lab / Practical Project:</span>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{recommendation.suggested_practical_activity}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
          <Quote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-300">Market Evidence & Rationale:</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{recommendation.rationale_evidence}</p>
          </div>
        </div>
      </div>

      {/* Employer Validation Feedback Log */}
      {recommendation.validations && recommendation.validations.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Employer Feedback Log:</span>
          </div>
          {recommendation.validations.map((v, i) => (
            <div key={i} className="text-slate-400 pl-5">
              <span className="text-slate-200 font-medium">{v.employer_name}</span> ({v.employer_company}):{' '}
              <span className="italic">"{v.comments || v.decision}"</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons (For Employer Validator) */}
      {canValidate && (
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Industry Validation Decision:</span>
            <button
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {showCommentBox ? 'Hide Comment' : 'Add Note / Change Profile'}
            </button>
          </div>

          {showCommentBox && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name / Role"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={employerCompany}
                  onChange={(e) => setEmployerCompany(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <textarea
                placeholder="Optional feedback or suggestions for the curriculum committee..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('approved')}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleAction('partial')}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Partial</span>
            </button>
            <button
              onClick={() => handleAction('rejected')}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
