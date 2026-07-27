import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Lock, ShieldAlert, LogIn, Sparkles, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
  customTitle?: string;
  customMessage?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  customTitle = 'Authentication Required',
  customMessage = 'Please sign in or create an account to access your customer dashboard, orders, wishlist, and saved addresses.',
}) => {
  const { user, loading } = useAuth();
  const { setActiveModal, language } = useApp();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 my-6">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Verifying Supabase Security & Session...
        </p>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          {customTitle}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          {customMessage}
        </p>

        <button
          onClick={() => setActiveModal('auth')}
          className="w-full py-3 px-6 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{language === 'ne' ? 'साइन इन / दर्ता गर्नुहोस्' : 'Sign In or Register Now'}</span>
        </button>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Secured with Supabase Authentication</span>
        </p>
      </div>
    );
  }

  // Role Mismatch (e.g. requires 'admin' but user is 'customer')
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-amber-200 dark:border-amber-900 shadow-sm text-center max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          Access Restricted
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          This section requires <span className="font-bold text-amber-800 dark:text-amber-300">{requiredRole.toUpperCase()}</span> permissions. You are currently signed in as <span className="font-bold">{user.fullName} ({user.role})</span>.
        </p>

        <button
          onClick={() => setActiveModal('auth')}
          className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          Switch Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
