import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocationPickerMap } from './LocationPickerMap';
import {
  getCurrentGpsPosition,
  reverseGeocodeOsm,
  DEFAULT_NEPAL_COORDS,
  LocationData,
} from '../utils/geolocation';
import { nepalProvinces } from '../data/products';
import {
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Lock,
  Building2,
  Home,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface RegisterPageProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { registerWithLocationDetails } = useAuth();

  // User details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address details
  const [province, setProvince] = useState('Sudurpashchim Province');
  const [district, setDistrict] = useState('Kailali');
  const [municipality, setMunicipality] = useState('Tikapur Municipality');
  const [wardNumber, setWardNumber] = useState('1');
  const [city, setCity] = useState('Tikapur');
  const [areaLocality, setAreaLocality] = useState('Bangaun / Bazar Area');
  const [street, setStreet] = useState('Main Market Road');
  const [postalCode, setPostalCode] = useState('10908');
  const [fullDeliveryAddress, setFullDeliveryAddress] = useState(
    'Ward #1, Main Market Road, Tikapur Municipality, Kailali, Sudurpashchim Province'
  );

  // GPS coordinates
  const [latitude, setLatitude] = useState<number>(DEFAULT_NEPAL_COORDS.lat);
  const [longitude, setLongitude] = useState<number>(DEFAULT_NEPAL_COORDS.lng);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);

  // UI States
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // 📍 Handle "Share Live Location" button click
  const handleShareLiveLocation = async () => {
    setDetectingLocation(true);
    setLocationStatusMessage(null);
    setFormError(null);

    try {
      // 1. Request GPS position via HTML5 Geolocation API
      const position = await getCurrentGpsPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      setLatitude(lat);
      setLongitude(lng);
      setGpsAccuracy(accuracy);

      // 2. Convert GPS coordinates into readable address using OpenStreetMap Nominatim
      const locData: LocationData = await reverseGeocodeOsm(lat, lng, accuracy);

      // 3. Auto-fill form fields
      if (locData.province) setProvince(locData.province);
      if (locData.district) setDistrict(locData.district);
      if (locData.municipality) setMunicipality(locData.municipality);
      if (locData.wardNumber) setWardNumber(locData.wardNumber);
      if (locData.city) setCity(locData.city);
      if (locData.area) setAreaLocality(locData.area);
      if (locData.street) setStreet(locData.street);
      if (locData.postalCode) setPostalCode(locData.postalCode);
      if (locData.fullAddress) setFullDeliveryAddress(locData.fullAddress);

      setLocationDetected(true);
      setLocationStatusMessage({
        type: 'success',
        text: 'Your current location has been detected successfully.',
      });
    } catch (err: any) {
      console.warn('Location detection failed:', err);
      setLocationDetected(false);
      let errorMsg =
        'Location permission was denied. Please enter your delivery address manually.';

      if (err?.code === 2) {
        errorMsg = 'GPS position unavailable. Please enter address manually.';
      } else if (err?.code === 3) {
        errorMsg = 'GPS detection timed out. Please enter address manually.';
      }

      setLocationStatusMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setDetectingLocation(false);
    }
  };

  // Callback when marker on Leaflet map is dragged to new position
  const handleMapMarkerDrag = async (newLat: number, newLng: number) => {
    setLatitude(newLat);
    setLongitude(newLng);

    try {
      const locData = await reverseGeocodeOsm(newLat, newLng);
      if (locData.province) setProvince(locData.province);
      if (locData.district) setDistrict(locData.district);
      if (locData.municipality) setMunicipality(locData.municipality);
      if (locData.wardNumber) setWardNumber(locData.wardNumber);
      if (locData.city) setCity(locData.city);
      if (locData.area) setAreaLocality(locData.area);
      if (locData.street) setStreet(locData.street);
      if (locData.postalCode) setPostalCode(locData.postalCode);
      if (locData.fullAddress) setFullDeliveryAddress(locData.fullAddress);

      setLocationDetected(true);
      setLocationStatusMessage({
        type: 'success',
        text: 'Address updated based on selected map location pin.',
      });
    } catch (e) {
      /* ignore */
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Please enter both First Name and Last Name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('Please enter a valid Nepalese Mobile Number (e.g., 9848500665).');
      return;
    }

    if (!password) {
      setFormError('Please enter a secure password.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Password and Confirm Password do not match.');
      return;
    }

    if (!fullDeliveryAddress.trim()) {
      setFormError('Please enter your complete delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const regDate = new Date().toISOString();

      const result = await registerWithLocationDetails({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        phone: phone.trim(),
        email: email.trim(),
        password,
        province,
        district,
        municipality,
        wardNumber,
        areaLocality,
        street,
        postalCode,
        fullDeliveryAddress: fullDeliveryAddress.trim(),
        latitude,
        longitude,
        gpsAccuracy,
        registrationDate: regDate,
        preferredLanguage: localStorage.getItem('manas_traders_lang') || 'ne',
        themePreference: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });

      if (result.error) {
        setFormError(result.error);
      } else {
        setRegistrationSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1200);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="max-w-xl mx-auto p-8 my-8 bg-white dark:bg-gray-900 rounded-3xl border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          Welcome to <strong className="text-emerald-700 dark:text-emerald-400">Manas Traders</strong>! Your account and GPS delivery location have been registered and saved.
        </p>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 text-left text-xs space-y-2 text-emerald-900 dark:text-emerald-200">
          <div className="font-bold border-b border-emerald-200 dark:border-emerald-800 pb-1">
            Registered Profile Summary:
          </div>
          <div>👤 <strong>Name:</strong> {firstName} {lastName}</div>
          <div>📞 <strong>Phone:</strong> {phone}</div>
          <div>📍 <strong>Default Delivery Address:</strong> {fullDeliveryAddress}</div>
          <div>🛰️ <strong>GPS Verified:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}</div>
        </div>
        <button
          onClick={() => {
            if (onSuccess) onSuccess();
            else window.location.reload();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95"
        >
          Continue Shopping Grocery Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 sm:px-6">
      {/* Registration Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-500/30 mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Manas Traders Kirana Store, Tikapur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Create New Account
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Join Manas Traders for fast doorstep grocery delivery with smart GPS address detection.
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8 space-y-8"
      >
        {/* Error Banner */}
        {formError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{formError}</div>
          </div>
        )}

        {/* 1. PERSONAL INFORMATION SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Binod"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhandari"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9848500665"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Used for order status updates & delivery boy contact.
              </p>
            </div>

            {/* Email Address (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. DELIVERY ADDRESS & LIVE LOCATION DETECTOR SECTION */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Delivery Address & GPS Pinpoint
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Auto-Detection Enabled
            </span>
          </div>

          {/* 📍 SHARE LIVE LOCATION BUTTON (PROMINENT) */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-900/40 border-2 border-emerald-500/40 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Smart One-Tap Address Auto-Fill</span>
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Detect your Province, District, Municipality, Ward & Street automatically via browser GPS.
                </p>
              </div>

              {/* Share Live Location Button */}
              <button
                type="button"
                onClick={handleShareLiveLocation}
                disabled={detectingLocation}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
                  detectingLocation
                    ? 'bg-emerald-700 cursor-not-allowed opacity-90'
                    : locationDetected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 ring-2 ring-emerald-400 ring-offset-2'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25'
                }`}
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Detecting location...</span>
                  </>
                ) : locationDetected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>📍 Location Detected (Re-detect)</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 animate-bounce-short" />
                    <span>📍 Share Live Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {locationStatusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  locationStatusMessage.type === 'success'
                    ? 'bg-emerald-100/80 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                    : 'bg-amber-100/80 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
                }`}
              >
                {locationStatusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{locationStatusMessage.text}</span>
              </div>
            )}
          </div>

          {/* ADDRESS FIELDS GRID (AUTO-FILLED & EDITABLE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Province */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Province <span className="text-rose-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {nepalProvinces.map((p) => (
                  <option key={p.id} value={p.nameEn}>
                    {p.nameEn} ({p.nameNe})
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                District <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kailali"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Municipality / Rural Municipality */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Municipality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tikapur Municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Ward Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Ward Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* City / Town */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                City / Town <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tikapur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Area / Locality */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Area / Locality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bangaun / Khadga Chowk"
                value={areaLocality}
                onChange={(e) => setAreaLocality(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Street */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Street / Tole / Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Janaki Marga, Near Bus Park Chowk"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Postal Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 10908"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* FULL DELIVERY ADDRESS */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Full Delivery Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={fullDeliveryAddress}
              onChange={(e) => setFullDeliveryAddress(e.target.value)}
              placeholder="Full detailed address for grocery delivery driver"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* READ-ONLY / HIDDEN GPS COORDINATES BADGE */}
          <div className="flex flex-wrap items-center justify-between bg-gray-50 dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300 font-mono gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> GPS Lat/Long:
              </span>
              <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
            </div>
            {gpsAccuracy && (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                Accuracy: ~{Math.round(gpsAccuracy)}m
              </span>
            )}
          </div>

          {/* INTERACTIVE LEAFLET MAP PREVIEW WITH DRAGGABLE PIN */}
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            accuracy={gpsAccuracy}
            onLocationSelect={handleMapMarkerDrag}
          />
        </div>

        {/* 3. CREATE ACCOUNT BUTTON */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Your Account & Saving Location...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {onSwitchToLogin && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
