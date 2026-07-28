import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { nepalDistricts } from '../data/products';
import { CustomerDashboardModal } from './CustomerDashboardModal';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal: React.FC = () => {
  const { activeModal, setActiveModal, language, addToast } = useApp();
  const {
    user,
    login,
    register,
    forgotPassword,
    changePassword,
    resendVerificationEmail,
    rememberMe,
    setRememberMe,
    isSupabaseConnected,
  } = useAuth();

  const isOpen = activeModal === 'auth';

  // If user is already logged in, render CustomerDashboardModal!
  if (user && isOpen) {
    return <CustomerDashboardModal />;
  }

  if (!isOpen) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Kailali');
  const [address, setAddress] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setNeedsEmailVerification(false);
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    resetForm();
  };

  // Demo auto-fill helper
  const handleQuickDemoFill = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@manastraders.com');
      setPassword('9956432661@GbYa');
      setFullName('Binod Bhandari (Admin)');
      setPhone('9848500665');
      setDistrict('Kailali');
    } else {
      setEmail('customer@gmail.com');
      setPassword('Customer123456!');
      setFullName('Aayush Shrestha');
      setPhone('9824600477');
      setDistrict('Kailali');
    }
  };

  // 1. LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    resetForm();

    const result = await login(email, password, rememberMe);

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.userProfile) {
      setSuccessMsg(`Welcome back, ${result.userProfile.fullName}!`);
      addToast('Welcome Back', `Signed in as ${result.userProfile.fullName}`, 'success');
    }
  };

  // 2. REGISTER HANDLER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Please fill in required fields (Name, Email, Password).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    resetForm();

    const result = await register(email, password, fullName, phone, district, address);

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      if (result.needsEmailVerification) {
        setNeedsEmailVerification(true);
        setSuccessMsg('Account created successfully! Please check your email inbox to confirm registration.');
      } else {
        setSuccessMsg('Account registered successfully! Welcome to Manas Traders.');
        addToast('Registration Successful', `Welcome ${fullName}!`, 'success');
      }
    }
  };

  // 3. FORGOT PASSWORD HANDLER
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    resetForm();

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg(`Password reset instructions sent to ${email}. Please check your inbox or spam folder.`);
    }
  };

  // Resend Email Verification
  const handleResendVerification = async () => {
    if (!email) return;
    setIsResending(true);
    const res = await resendVerificationEmail(email);
    setIsResending(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Verification email sent again. Check your inbox.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-emerald-900 text-white p-6 relative">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-300">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">
                {activeTab === 'login'
                  ? 'Sign In to Account'
                  : activeTab === 'register'
                  ? 'Create New Account'
                  : 'Reset Password'}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                {isSupabaseConnected
                  ? 'Powered by Supabase Auth Engine'
                  : 'Local Persistence Auth Mode'}
              </p>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-emerald-950/60 p-1 rounded-xl text-xs font-bold text-emerald-200 border border-emerald-800/50">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-800 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication Notice</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Success</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {needsEmailVerification && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>Email Verification Required</span>
              </div>
              <p>
                Supabase Auth requires email confirmation. Please check your email inbox and click the confirmation link before logging in.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                {isResending ? 'Resending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Password</label>
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span>Remember Me on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Auto-fill Helper */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <span className="text-xs font-medium text-gray-400 block mb-2">
                  ⚡ Quick Demo Login Presets
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('customer')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('admin')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto Admin
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Binod Bhandari"
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9848500665"
                      className="w-full pl-8 pr-2 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full py-2 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
                  >
                    {nepalDistricts.map((d) => (
                      <option key={d.id} value={d.nameEn}>
                        {d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Tikapur Ward #1, Kailali"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Enter your registered email address below. We will send a secure Supabase password reset link to your inbox.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
