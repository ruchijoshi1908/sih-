import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border glass-card transition-all duration-300 transform translate-y-0 opacity-100">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}

      <span className="text-sm font-medium text-slate-100">{toast.message}</span>

      <button
        onClick={onClose}
        className="ml-2 p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
