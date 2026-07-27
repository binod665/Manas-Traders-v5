import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { nepalDistricts } from '../data/products';
import {
  signUpWithSupabase,
  signInWithSupabase,
  resetPasswordWithSupabase,
  updateUserProfileInDB,
} from '../lib/supabase';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Sparkles,
  Edit3,
  Save,
  Database,
  ArrowRight,
} from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot' | 'profile';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    language,
    user,
    setUser,
    logout,
    orders,
    addToast,
    isSupabaseConnected,
  } = useApp();

  const isOpen = activeModal === 'auth';

  // Active view tab inside modal
  const [activeTab, setActiveTab] = useState<AuthTab>(user ? 'profile' : 'login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Kathmandu');
  const [address, setAddress] = useState('');

  // Editing Profile fields
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'Kathmandu');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  if (!isOpen) return null;

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
      setEmail('admin@manastraders.com.np');
      setPassword('Admin123456!');
      setFullName('Manas Admin Manager');
      setPhone('+977 9801234567');
    } else {
      setEmail('customer@gmail.com');
      setPassword('Customer123456!');
      setFullName('Aayush Shrestha');
      setPhone('+977 9841234567');
    }
  };

  // 1. REGISTER HANDLER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Please fill in all required fields (Email, Password, Name).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    resetForm();

    const result = await signUpWithSupabase(email, password, fullName, phone, district, address);

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      if (result.needsEmailVerification) {
        setNeedsEmailVerification(true);
        setSuccessMsg('Account created successfully! Please check your email inbox to verify your account.');
      } else {
        setSuccessMsg('Account registered successfully! Welcome to Manas Traders.');
        if (result.userProfile) {
          setUser(result.userProfile);
          addToast('Welcome', `Logged in as ${result.userProfile.fullName}`, 'success');
        }
        setTimeout(() => {
          setActiveTab('profile');
        }, 1200);
      }
    }
  };

  // 2. LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    resetForm();

    const result = await signInWithSupabase(email, password);

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.userProfile) {
      setUser(result.userProfile);
      setSuccessMsg(`Welcome back, ${result.userProfile.fullName}!`);
      addToast('Welcome Back', `Logged in as ${result.userProfile.fullName}`, 'success');
      setTimeout(() => {
        setActiveTab('profile');
      }, 1000);
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

    const result = await resetPasswordWithSupabase(email);
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg(`Password reset instructions have been sent to ${email}. Please check your inbox or spam folder.`);
    }
  };

  // 4. UPDATE PROFILE HANDLER
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    resetForm();

    const result = await updateUserProfileInDB(user.id, {
      fullName: editName,
      phone: editPhone,
      district: editDistrict,
      address: editAddress,
    });

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.userProfile) {
      setUser(result.userProfile);
      setIsEditingProfile(false);
      setSuccessMsg('Profile updated successfully!');
      addToast('Profile Updated', 'Your contact details have been updated.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
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
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight text-white">
                  {user && activeTab === 'profile'
                    ? 'User Profile & Account'
                    : activeTab === 'login'
                    ? 'Sign In to Account'
                    : activeTab === 'register'
                    ? 'Create New Account'
                    : 'Reset Password'}
                </h3>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {isSupabaseConnected
                  ? 'Powered by Supabase Auth Engine'
                  : 'Local Storage Auth Mode'}
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-emerald-950/60 p-1 rounded-xl text-xs font-bold text-emerald-200 border border-emerald-800/50">
            {user ? (
              <button
                onClick={() => switchTab('profile')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'hover:text-white'
                }`}
              >
                My Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => switchTab('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'register'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'hover:text-white'
                  }`}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication Notice</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Success</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {needsEmailVerification && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>Email Verification Required</span>
              </div>
              <p>
                Supabase Auth requires email confirmation. Please check your email inbox and click the verification link before logging in.
              </p>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && !user && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
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
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs font-medium text-gray-400 block mb-2">
                  ⚡ Quick Demo Login Presets
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('customer')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('admin')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-amber-50 hover:text-amber-800 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto Admin
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && !user && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aayush Shrestha"
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 9841234567"
                      className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full py-2 px-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House #42, New Road, Kathmandu"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
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
                    <span>Registering User...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && !user && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter your registered email address below. We will send a secure Supabase password reset link to your email.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Email</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: USER PROFILE (PROTECTED VIEW) */}
          {user && (
            <div className="space-y-5">
              {/* User Identity Card */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-bold text-xl flex items-center justify-center uppercase shadow-xs">
                    {user.fullName.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span>{user.fullName}</span>
                      {user.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                          ADMIN
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-600 font-medium">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    setActiveModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Profile Details or Edit Form */}
              {!isEditingProfile ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-800">Account Details</span>
                    <button
                      onClick={() => {
                        setEditName(user.fullName);
                        setEditPhone(user.phone);
                        setEditDistrict(user.district);
                        setEditAddress(user.address);
                        setIsEditingProfile(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Phone Number</span>
                      <span className="font-bold text-gray-800">{user.phone || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">District</span>
                      <span className="font-bold text-gray-800">{user.district || 'Kathmandu'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 block font-medium">Default Delivery Address</span>
                      <span className="font-bold text-gray-800">{user.address || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-gray-800">Edit Profile Information</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-xs text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">District</label>
                      <select
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
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
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Profile Changes</span>
                  </button>
                </form>
              )}

              {/* Saved Orders Section (Protected) */}
              <div className="border-t border-gray-100 pt-4">
                <h5 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>My Recent Grocery Orders ({orders.length})</span>
                </h5>

                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl text-center">
                    No orders placed yet. Add items to cart and checkout!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-gray-800 block">{order.id}</span>
                          <span className="text-gray-400 text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-800 block">
                            Rs. {order.total.toLocaleString('ne-NP')}
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md uppercase">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
