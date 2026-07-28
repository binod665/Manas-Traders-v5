import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { PaymentMethod, Order } from '../types';
import { nepalDistricts, nepalProvinces } from '../data/products';
import {
  X,
  CheckCircle2,
  Phone,
  MapPin,
  User,
  CreditCard,
  QrCode,
  Download,
  ShoppingBag,
  Truck,
  ArrowRight,
  Building2,
  Compass,
  Landmark,
  ShieldCheck,
  Database,
  Banknote,
  Check,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    language,
    cart,
    selectedDistrict,
    setSelectedDistrict,
    placeOrder,
    activeModal,
    setActiveModal,
    user,
    appliedCoupon,
    isSupabaseConnected,
  } = useApp();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [province, setProvince] = useState(user?.province || 'Sudurpashchim Province');
  const [district, setDistrict] = useState(user?.district || selectedDistrict.nameEn);
  const [municipality, setMunicipality] = useState(user?.municipality || 'Tikapur Municipality');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName);
      if (!phone) setPhone(user.phone);
      if (!province) setProvince(user.province || 'Sudurpashchim Province');
      if (!district) setDistrict(user.district || selectedDistrict.nameEn);
      if (!municipality) setMunicipality(user.municipality || 'Tikapur Municipality');
      if (!address) setAddress(user.address);
    }
  }, [user]);

  if (activeModal !== 'checkout') return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  let isFreeDelivery = subtotal >= selectedDistrict.freeDeliveryThreshold;
  if (appliedCoupon?.discountType === 'free_shipping') {
    isFreeDelivery = true;
  }
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : selectedDistrict.deliveryFee;

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleClose = () => {
    setCompletedOrder(null);
    setActiveModal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim() || !municipality.trim()) {
      alert('Please fill in all required shipping details (Name, Phone, Municipality, Address).');
      return;
    }

    if (!/^(98|97|96)\d{8}$/.test(phone.trim())) {
      if (!confirm('Phone number does not match standard 10-digit Nepal format (e.g. 9801234567). Continue anyway?')) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        nameEn: item.product.nameEn,
        nameNe: item.product.nameNe,
        quantity: item.quantity,
        price: item.product.price,
        unit: item.selectedUnit || item.product.unit,
      }));

      const order = await placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        province: province,
        district: district,
        municipality: municipality.trim(),
        address: address.trim(),
        paymentMethod,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      });

      setCompletedOrder(order);
    } catch (err) {
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 my-8"
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {completedOrder
                  ? getTranslation(language, 'orderSuccessTitle')
                  : getTranslation(language, 'checkoutTitle')}
              </h3>
              <p className="text-xs text-emerald-200 flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>
                  {isSupabaseConnected
                    ? 'Orders will be saved directly to Supabase DB'
                    : 'Saved to Local Storage Engine'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Completion View / Receipt */}
        {completedOrder ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                Order ID: {completedOrder.id}
              </span>
              <h2 className="text-xl font-black text-gray-900 mt-2.5">
                {getTranslation(language, 'orderSuccessTitle')}
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                {getTranslation(language, 'orderSuccessMsg')}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{completedOrder.customerName} ({completedOrder.phone})</span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2.5">
                <div>
                  <span className="text-gray-500 block font-medium">Province:</span>
                  <span className="font-bold text-gray-800">{completedOrder.province || 'Bagmati Province'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block font-medium">District & Municipality:</span>
                  <span className="font-bold text-gray-800">{completedOrder.district} - {completedOrder.municipality}</span>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 block font-medium">Delivery Address:</span>
                <span className="font-bold text-gray-900">{completedOrder.address}</span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 font-medium">Payment Method:</span>
                <span className="font-extrabold uppercase text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-md">
                  {completedOrder.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : completedOrder.paymentMethod === 'bank_transfer'
                    ? 'Bank Transfer'
                    : completedOrder.paymentMethod.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-gray-500 font-bold block mb-1">Ordered Items ({completedOrder.items.length}):</span>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>
                      {item.quantity}x {item.nameEn} ({item.unit})
                    </span>
                    <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString('ne-NP')}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-sm text-emerald-900 pt-3 border-t border-gray-300">
                <span>Total Amount Payable:</span>
                <span className="text-base text-emerald-800">Rs. {completedOrder.total.toLocaleString('ne-NP')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={printReceipt}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-300 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Receipt</span>
              </button>

              <button
                onClick={handleClose}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                {getTranslation(language, 'close')}
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 1. Customer Shipping & Location Fields */}
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>1. Customer & Delivery Address Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Binod Bhandari"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9801234567"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Province Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {nepalProvinces.map((p) => (
                        <option key={p.id} value={p.nameEn}>
                          {language === 'ne' ? p.nameNe : p.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* District Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={selectedDistrict.id}
                      onChange={(e) => {
                        const d = nepalDistricts.find((item) => item.id === e.target.value);
                        if (d) {
                          setSelectedDistrict(d);
                          setDistrict(d.nameEn);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {nepalDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {language === 'ne' ? d.nameNe : d.nameEn} (Delivery: Rs. {d.deliveryFee})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Municipality & Street Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Municipality Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Municipality / Nagarpalika <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="e.g. Kathmandu Metropolitan City / Pokhara Metro"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Delivery Address / Tole / Ward No */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Address / Ward No / Tole <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Tikapur-1, Kailali, Near Bus Park"
                    className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Options */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>2. Select Payment Method</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-50/90 border-amber-600 ring-2 ring-amber-500/30'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                      💵
                    </div>
                    {paymentMethod === 'cod' && <Check className="w-4 h-4 text-amber-700" />}
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-gray-900">Cash on Delivery</span>
                    <span className="text-[10px] text-gray-500">Pay on Receipt</span>
                  </div>
                </button>

                {/* eSewa */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('esewa')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'esewa'
                      ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                      e
                    </div>
                    {paymentMethod === 'esewa' && <Check className="w-4 h-4 text-emerald-700" />}
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-gray-900">eSewa</span>
                    <span className="text-[10px] text-gray-500">Mobile Wallet</span>
                  </div>
                </button>

                {/* Khalti */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khalti')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'khalti'
                      ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-500/30'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                      K
                    </div>
                    {paymentMethod === 'khalti' && <Check className="w-4 h-4 text-purple-700" />}
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-gray-900">Khalti</span>
                    <span className="text-[10px] text-gray-500">Digital Wallet</span>
                  </div>
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/30'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                      🏦
                    </div>
                    {paymentMethod === 'bank_transfer' && <Check className="w-4 h-4 text-blue-700" />}
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-gray-900">Bank Transfer</span>
                    <span className="text-[10px] text-gray-500">Direct / Fonepay</span>
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Details Display Box */}
              {paymentMethod === 'cod' && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Banknote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Cash on Delivery Info</span>
                    <span>
                      Please keep exact cash ready (<strong>Rs. {total.toLocaleString('ne-NP')}</strong>) when our delivery rider arrives at your address.
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'esewa' && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="text-xs space-y-1">
                    <span className="font-extrabold text-emerald-950 dark:text-emerald-200 block">
                      Pay via eSewa App
                    </span>
                    <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                      Merchant Name: <strong className="font-bold">MANAS TRADERS</strong>
                    </p>
                    <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                      eSewa ID / Mobile: <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400">9848500665</strong>
                    </p>
                    <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                      Total Payable: <strong className="font-extrabold text-emerald-900 dark:text-emerald-100">Rs. {total.toLocaleString('ne-NP')}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal('esewaQr')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    View eSewa Info
                  </button>
                </div>
              )}

              {paymentMethod === 'khalti' && (
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="text-xs space-y-1">
                    <span className="font-extrabold text-purple-950 dark:text-purple-200 block">
                      Pay via Khalti App
                    </span>
                    <p className="text-purple-800 dark:text-purple-300 text-[11px]">
                      Merchant Name: <strong className="font-bold">Manas Traders</strong>
                    </p>
                    <p className="text-purple-800 dark:text-purple-300 text-[11px]">
                      Khalti ID / Mobile: <strong className="font-mono font-bold text-purple-700 dark:text-purple-400">9848500665</strong>
                    </p>
                    <p className="text-purple-800 dark:text-purple-300 text-[11px]">
                      Total Payable: <strong className="font-extrabold text-purple-900 dark:text-purple-100">Rs. {total.toLocaleString('ne-NP')}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal('khaltiQr')}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    View Khalti Info
                  </button>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-blue-700" />
                      <span>Manas Traders Bank Account Details</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                      NEPAL SBI BANK
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-blue-600 block">Bank Name:</span>
                      <span className="font-bold text-blue-900">Nepal SBI Bank Ltd.</span>
                    </div>
                    <div>
                      <span className="text-blue-600 block">Account Name:</span>
                      <span className="font-bold text-blue-900">Manas Traders Pvt. Ltd.</span>
                    </div>
                    <div>
                      <span className="text-blue-600 block">Account Number:</span>
                      <span className="font-mono font-bold text-blue-900">22025240200255</span>
                    </div>
                    <div>
                      <span className="text-blue-600 block">Branch:</span>
                      <span className="font-bold text-blue-900">Tikapur, Kailali</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Price & Order Summary */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal ({cart.length} items)</span>
                <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString('ne-NP')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- Rs. {discountAmount.toLocaleString('ne-NP')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>
                  Delivery Fee ({selectedDistrict.nameEn})
                </span>
                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `Rs. ${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between font-black text-sm text-emerald-950 pt-2 border-t border-gray-200">
                <span>Total Amount Payable</span>
                <span className="text-emerald-800 text-base">
                  Rs. {total.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] disabled:bg-gray-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving Order to Supabase...</span>
              ) : (
                <>
                  <span>Confirm & Place Order (Rs. {total.toLocaleString('ne-NP')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
