import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50'
              : toast.type === 'error'
              ? 'bg-red-950/90 text-red-100 border-red-700/50'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 text-amber-100 border-amber-700/50'
              : 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50'
          }`}
        >
          <div className="mr-3 mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-emerald-400" />}
          </div>

          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-white">{toast.title}</h4>
            <p className="mt-0.5 opacity-90 leading-tight">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
