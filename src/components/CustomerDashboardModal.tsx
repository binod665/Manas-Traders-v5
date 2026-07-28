import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { nepalDistricts } from '../data/products';
import {
  X,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Lock,
  Camera,
  LogOut,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  ShieldCheck,
  Building2,
  Home,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Sparkles,
  KeyRound,
  ExternalLink,
  Tag,
  Truck,
} from 'lucide-react';
import { SavedAddress } from '../types';
import { OrderTrackingView } from './OrderTrackingModal';
import { OrderHistory } from './OrderHistory';

type DashboardTab = 'profile' | 'orders' | 'tracking' | 'wishlist' | 'addresses' | 'password' | 'avatar';

export const CustomerDashboardModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    language,
    orders,
    wishlist,
    products,
    addToCart,
    toggleWishlist,
    addToast,
  } = useApp();

  const {
    user,
    logout,
    updateProfile,
    changePassword,
    updateAvatar,
    savedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    resendVerificationEmail,
    isSupabaseConnected,
  } = useAuth();

  const isOpen = activeModal === 'auth' && !!user;

  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Kailali');
  const [address, setAddress] = useState(user?.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState(user?.fullName || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrDistrict, setAddrDistrict] = useState(user?.district || 'Kailali');
  const [addrText, setAddrText] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Avatar Upload State
  const [avatarInput, setAvatarInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Resend Email Verification state
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  if (!isOpen || !user) return null;

  // Filter wishlisted products
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  // 1. Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const res = await updateProfile({
      fullName,
      phone,
      district,
      address,
    });

    setIsUpdatingProfile(false);
    if (res.error) {
      addToast('Profile Update Error', res.error, 'error');
    } else {
      addToast('Profile Saved', 'Your account profile has been updated.', 'success');
    }
  };

  // 2. Change Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password Error', 'Password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Password Mismatch', 'Passwords do not match.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(false);

    const res = await changePassword(newPassword);
    setIsUpdatingPassword(false);

    if (res.error) {
      addToast('Password Reset Failed', res.error, 'error');
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password Changed', 'Your password has been updated securely.', 'success');
    }
  };

  // 3. Address Submit
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrText) {
      addToast('Missing Fields', 'Please fill in name, phone, and address details.', 'warning');
      return;
    }

    if (editingAddrId) {
      await updateAddress(editingAddrId, {
        label: addrLabel,
        fullName: addrName,
        phone: addrPhone,
        district: addrDistrict,
        address: addrText,
        isDefault: addrIsDefault,
      });
      addToast('Address Updated', 'Saved delivery address updated.', 'success');
    } else {
      await addAddress({
        label: addrLabel,
        fullName: addrName,
        phone: addrPhone,
        district: addrDistrict,
        address: addrText,
        isDefault: addrIsDefault || savedAddresses.length === 0,
      });
      addToast('Address Added', 'New delivery address saved.', 'success');
    }

    setShowAddressForm(false);
    setEditingAddrId(null);
    setAddrText('');
  };

  // 4. Avatar Upload Submit
  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarInput) return;

    setIsUploadingAvatar(true);
    const res = await updateAvatar(avatarInput);
    setIsUploadingAvatar(false);

    if (res.avatarUrl) {
      addToast('Avatar Updated', 'Your profile picture was updated.', 'success');
      setAvatarInput('');
    } else {
      addToast('Avatar Error', res.error || 'Failed to set avatar', 'error');
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const res = await updateAvatar(file);
    setIsUploadingAvatar(false);

    if (res.avatarUrl) {
      addToast('Avatar Uploaded', 'New profile image uploaded successfully.', 'success');
    } else {
      addToast('Upload Error', res.error || 'Failed to upload image.', 'error');
    }
  };

  // Preset Avatar Icons
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-6 flex flex-col md:flex-row min-h-[580px] max-h-[90vh]">
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-64 bg-emerald-950 text-white p-5 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-emerald-900">
          <div>
            {/* Header User Identity */}
            <div className="flex items-center gap-3 pb-5 border-b border-emerald-900/80 mb-5">
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-800 border-2 border-emerald-500 overflow-hidden flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.fullName.charAt(0) || 'U'}</span>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('avatar')}
                  className="absolute -bottom-1 -right-1 p-1 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-full shadow-xs cursor-pointer"
                  title="Change Profile Picture"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                  <span className="truncate">{user.fullName}</span>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-gray-950 text-[9px] font-black uppercase shrink-0">
                      ADMIN
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-emerald-300/80 truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-200 font-medium">
                    {isSupabaseConnected ? 'Supabase Synced' : 'Local Auth'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Tab Buttons */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'मेरो प्रोफाइल' : 'My Profile'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'मेरो अर्डरहरू' : 'My Orders'}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-full text-[10px] font-bold">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tracking'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'अर्डर ट्र्याकिङ' : 'Track Order Status'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'विसलिस्ट' : 'Wishlist'}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-full text-[10px] font-bold">
                  {wishlist.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'ठेगाना प्रबन्धन' : 'Saved Addresses'}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-full text-[10px] font-bold">
                  {savedAddresses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'पासवर्ड फेर्नुहोस्' : 'Change Password'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('avatar')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'avatar'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ne' ? 'प्रोफाइल फोटो' : 'Profile Picture'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </nav>
          </div>

          {/* Bottom Signout */}
          <div className="pt-4 border-t border-emerald-900/80 mt-4">
            <button
              onClick={async () => {
                await logout();
                setActiveModal(null);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-900/50 hover:bg-red-800 text-red-200 hover:text-white rounded-xl text-xs font-bold border border-red-800/60 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'ne' ? 'लगआउट गर्नुहोस्' : 'Sign Out Account'}</span>
            </button>
          </div>
        </div>

        {/* Right Main Content Panel */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 relative">
          {/* Close Modal Button */}
          <button
            onClick={() => setActiveModal(null)}
            className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>

          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Customer Profile Details</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage your personal contact information and delivery preferences.
                </p>
              </div>

              {/* Email Verification Status Banner */}
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  user.emailVerified
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      user.emailVerified
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {user.emailVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold block">
                      {user.emailVerified ? 'Email Address Verified' : 'Email Unverified'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {user.emailVerified
                        ? 'Your Supabase email authentication is active & secure.'
                        : 'Please verify your email inbox to receive order updates.'}
                    </span>
                  </div>
                </div>

                {!user.emailVerified && (
                  <button
                    onClick={async () => {
                      setIsResendingEmail(true);
                      const res = await resendVerificationEmail(user.email);
                      setIsResendingEmail(false);
                      if (res.error) {
                        addToast('Resend Failed', res.error, 'error');
                      } else {
                        addToast('Verification Sent', 'Please check your email inbox.', 'success');
                      }
                    }}
                    disabled={isResendingEmail}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isResendingEmail ? 'Sending...' : 'Resend Email'}
                  </button>
                )}
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address (Read-Only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 9800000000"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      District (Nepal)
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
                    >
                      {nepalDistricts.map((d) => (
                        <option key={d.id} value={d.nameEn}>
                          {d.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Default Delivery Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Tikapur Ward #1, Kailali, Sudurpashchim"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <span>{language === 'ne' ? 'मेरा किराना अर्डरहरू' : 'My Grocery Orders History'}</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'ne'
                      ? 'तपाईंका पुराना अर्डरहरू र वर्तमान स्थिति ट्र्याक गर्नुहोस्।'
                      : 'Track live status, search past purchases, or reorder organic groceries.'}
                  </p>
                </div>
              </div>

              <OrderHistory
                onTrackOrder={(orderId) => {
                  setTrackingOrderId(orderId);
                  setActiveTab('tracking');
                }}
              />
            </div>
          )}

          {/* TAB: TRACK ORDER STATUS */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>{language === 'ne' ? 'अर्डर डेलिभरी ट्र्याकिङ' : 'Live Order Delivery Tracker'}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {language === 'ne'
                    ? 'तपाईंको अर्डर आईडी राखेर सामानको स्थिति र डेलिभरी प्रगती हेर्नुहोस्।'
                    : 'Enter an order ID or select a demo order to track real-time delivery status.'}
                </p>
              </div>

              <OrderTrackingView embedded={true} initialOrderId={trackingOrderId} />
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                  <span>My Wishlisted Items ({wishlistedProducts.length})</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Your saved favorite grocery items from Tikapur & Nepal producers.
                </p>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                  <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Wishlist is Empty</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    Click the heart icon on any product to save it to your personal wishlist!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlistedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 shadow-2xs"
                    >
                      <img
                        src={product.image}
                        alt={product.nameEn}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                          {language === 'ne' ? product.nameNe : product.nameEn}
                        </h5>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
                          Rs. {product.price.toLocaleString()} / {product.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <span>Saved Delivery Addresses ({savedAddresses.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Save multiple locations for fast checkout across Kailali, Kathmandu, or Nepal.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingAddrId(null);
                    setAddrLabel('Home');
                    setAddrName(user.fullName);
                    setAddrPhone(user.phone);
                    setAddrDistrict(user.district || 'Kailali');
                    setAddrText('');
                    setAddrIsDefault(savedAddresses.length === 0);
                    setShowAddressForm(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Form Modal / Inline Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddressSubmit}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-emerald-500 shadow-md space-y-3"
                >
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">
                    {editingAddrId ? 'Edit Saved Address' : 'Add New Delivery Address'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Address Label
                      </label>
                      <select
                        value={addrLabel}
                        onChange={(e) => setAddrLabel(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office / Work</option>
                        <option value="Kirana Store">Kirana Shop</option>
                        <option value="Family / Relatives">Family Home</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        District
                      </label>
                      <select
                        value={addrDistrict}
                        onChange={(e) => setAddrDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      >
                        {nepalDistricts.map((d) => (
                          <option key={d.id} value={d.nameEn}>
                            {d.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Detailed Address / House / Landmark
                      </label>
                      <input
                        type="text"
                        required
                        value={addrText}
                        onChange={(e) => setAddrText(e.target.value)}
                        placeholder="e.g. Ward #1, Main Chowk, Tikapur, Kailali"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefaultAddr"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                      <label htmlFor="isDefaultAddr" className="text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                        Set as Default Delivery Address
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-3.5 py-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white dark:bg-gray-800 p-4 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? 'border-emerald-500 dark:border-emerald-500 shadow-sm'
                        : 'border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        {addr.label === 'Home' ? (
                          <Home className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{addr.label}</span>
                      </span>

                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-md">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{addr.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{addr.phone}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                      {addr.address}, {addr.district}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-3 text-xs">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline text-[11px]"
                        >
                          Make Default
                        </button>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => {
                            setEditingAddrId(addr.id);
                            setAddrLabel(addr.label);
                            setAddrName(addr.fullName);
                            setAddrPhone(addr.phone);
                            setAddrDistrict(addr.district);
                            setAddrText(addr.address);
                            setAddrIsDefault(addr.isDefault);
                            setShowAddressForm(true);
                          }}
                          className="p-1 text-gray-500 hover:text-emerald-700 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Security & Change Password</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your Supabase authentication password securely.
                </p>
              </div>

              {passwordSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">Password updated successfully!</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: PROFILE PICTURE */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Profile Picture & Avatar</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Upload a photo or select an avatar preset to represent your account.
                </p>
              </div>

              {/* Current Preview */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-emerald-800 overflow-hidden border-2 border-emerald-500 flex items-center justify-center text-white font-black text-2xl shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.fullName.charAt(0) || 'U'}</span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{user.fullName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.avatarUrl ? 'Custom photo set' : 'Default initial avatar'}
                  </p>

                  <label className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Or Choose Avatar Preset:
                </h4>
                <div className="flex flex-wrap gap-3">
                  {avatarPresets.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateAvatar(url)}
                      className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-all cursor-pointer hover:scale-105"
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Image URL input */}
              <form onSubmit={handleAvatarSubmit} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Paste Custom Avatar URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={isUploadingAvatar}
                    className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Set URL
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
