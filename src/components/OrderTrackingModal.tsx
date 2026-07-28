import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchOrderById } from '../lib/supabase';
import { Order } from '../types';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  PhoneCall,
  Copy,
  Check,
  X,
  Receipt,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

// Demo orders for quick testing if user hasn't placed an order yet
export const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-842910',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customerName: 'Ram Bahadur Thapa',
    phone: '9848500665',
    district: 'Kailali',
    municipality: 'Tikapur Municipality-1',
    address: 'Bhadariya Chowk, Near Central Park',
    paymentMethod: 'esewa',
    items: [
      { productId: '1', nameEn: 'Organic Mustang Kalokalo Black Lentil (Dāl)', nameNe: 'मुस्ताङको कालो दाल', quantity: 2, price: 210, unit: '1 kg' },
      { productId: '2', nameEn: 'Authentic Ilam Organic Orthodox CTC Tea', nameNe: 'इलामको अर्गानिक सिटिसी चिया', quantity: 1, price: 380, unit: '500 g' },
    ],
    subtotal: 800,
    deliveryFee: 50,
    total: 850,
    status: 'out_for_delivery',
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-102948',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    customerName: 'Saraswati Khadka',
    phone: '9812345678',
    district: 'Kailali',
    municipality: 'Tikapur Municipality-3',
    address: 'Block No. 7, Near Hospital Line',
    paymentMethod: 'cod',
    items: [
      { productId: '3', nameEn: 'Jumla Organic Red Rice (Marsi Chāmal)', nameNe: 'जुम्ली मार्सी रातो चामल', quantity: 1, price: 1450, unit: '5 kg bag' },
    ],
    subtotal: 1450,
    deliveryFee: 0,
    total: 1450,
    status: 'processing',
    paymentStatus: 'unpaid',
  },
  {
    id: 'ORD-774021',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    customerName: 'Bikash Oli',
    phone: '9801122334',
    district: 'Kathmandu',
    address: 'New Road, Kathmandu',
    paymentMethod: 'khalti',
    items: [
      { productId: '4', nameEn: 'Pure Pure Ghee (A2 Cow Ghee)', nameNe: 'शुद्ध नौनी गाईको घिउ', quantity: 1, price: 1200, unit: '1 Litre' },
    ],
    subtotal: 1200,
    deliveryFee: 100,
    total: 1300,
    status: 'delivered',
    paymentStatus: 'paid',
  },
];

interface OrderTrackingViewProps {
  initialOrderId?: string;
  embedded?: boolean;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderId,
  embedded = false,
}) => {
  const { language, orders: localOrders } = useApp();

  const [inputOrderId, setInputOrderId] = useState(initialOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync initial order ID if provided or fallback to user's latest local order
  useEffect(() => {
    if (initialOrderId) {
      setInputOrderId(initialOrderId);
      findAndSetOrder(initialOrderId);
    } else if (localOrders && localOrders.length > 0) {
      setSearchedOrder(localOrders[0]);
      setInputOrderId(localOrders[0].id);
      setSearchAttempted(true);
    } else {
      setSearchedOrder(DEMO_ORDERS[0]);
      setInputOrderId(DEMO_ORDERS[0].id);
      setSearchAttempted(true);
    }
  }, [initialOrderId, localOrders]);

  const findAndSetOrder = async (queryId: string) => {
    const clean = queryId.trim();
    if (!clean) return;

    setIsSearching(true);
    setSearchAttempted(true);

    const foundLocal = localOrders.find((o) => o.id.toLowerCase() === clean.toLowerCase());
    if (foundLocal) {
      setSearchedOrder(foundLocal);
      setIsSearching(false);
      return;
    }

    const foundDemo = DEMO_ORDERS.find((o) => o.id.toLowerCase() === clean.toLowerCase());
    if (foundDemo) {
      setSearchedOrder(foundDemo);
      setIsSearching(false);
      return;
    }

    try {
      const remote = await fetchOrderById(clean);
      setSearchedOrder(remote);
    } catch (err) {
      setSearchedOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    findAndSetOrder(inputOrderId);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = searchedOrder ? getStatusStepIndex(searchedOrder.status) : 0;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: language === 'ne' ? 'अर्डर प्राप्त भयो (पुष्टि हुँदै)' : 'Order Placed (Awaiting Confirmation)',
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: Clock,
          eta: language === 'ne' ? 'अनुमानित डेलिभरी समय: ४ घण्टा भित्र' : 'Expected Delivery: Within 4 Hours',
        };
      case 'processing':
        return {
          label: language === 'ne' ? 'किराना सामान प्याकिङ हुँदैछ' : 'Packing Fresh Groceries',
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          icon: Package,
          eta: language === 'ne' ? 'अनुमानित डेलिभरी समय: २ घण्टा भित्र' : 'Expected Delivery: Within 2 Hours',
        };
      case 'out_for_delivery':
        return {
          label: language === 'ne' ? 'डेलिभरीका लागि हिँडिसक्यो (बाटोमा छ)' : 'Out for Delivery (In Transit)',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: Truck,
          eta: language === 'ne' ? 'अनुमानित डेलिभरी समय: १५-३० मिनेट भित्र' : 'Expected Delivery: Within 15-30 Mins',
        };
      case 'delivered':
        return {
          label: language === 'ne' ? 'अर्डर सफलतापूर्वक डेलिभर भयो' : 'Order Delivered Successfully',
          bg: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-600/30',
          icon: CheckCircle2,
          eta: language === 'ne' ? 'डेलिभरी सम्पन्न भयो' : 'Delivery Complete',
        };
      case 'cancelled':
        return {
          label: language === 'ne' ? 'अर्डर रद्द गरियो' : 'Order Cancelled',
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
          icon: XCircle,
          eta: language === 'ne' ? 'यो अर्डर रद्द भएको छ' : 'This order has been cancelled',
        };
    }
  };

  const steps = [
    {
      titleEn: 'Order Placed',
      titleNe: 'अर्डर प्राप्त',
      descEn: 'Logged in system',
      descNe: 'अर्डर दर्ता भयो',
      icon: Clock,
    },
    {
      titleEn: 'Packing Groceries',
      titleNe: 'सामान प्याकिङ',
      descEn: 'Packing at Tikapur Store',
      descNe: 'टीकापुर स्टोरमा प्याकिङ',
      icon: Package,
    },
    {
      titleEn: 'Out for Delivery',
      titleNe: 'डेलिभरीमा छ',
      descEn: 'In transit with rider',
      descNe: 'डेलिभरी बोई हिँडिसक्यो',
      icon: Truck,
    },
    {
      titleEn: 'Delivered',
      titleNe: 'डेलिभर भयो',
      descEn: 'Received & confirmed',
      descNe: 'सामान बुझिलियो',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className={`space-y-5 ${embedded ? '' : 'p-5 sm:p-6 overflow-y-auto'}`}>
      {/* Search Bar Input */}
      <form onSubmit={handleSearch} className="space-y-2">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
          {language === 'ne' ? 'अर्डर आईडी (Order ID) राख्नुहोस्:' : 'Enter Your Order ID:'}
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={inputOrderId}
              onChange={(e) => setInputOrderId(e.target.value)}
              placeholder="e.g. ORD-842910"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSearching ? (
              <span>{language === 'ne' ? 'खोज्दै...' : 'Searching...'}</span>
            ) : (
              <span>{language === 'ne' ? 'ट्र्याक गर्नुहोस्' : 'Track Order'}</span>
            )}
          </button>
        </div>
      </form>

      {/* Searched Order Content */}
      {searchedOrder ? (
        <div className="space-y-5 pt-2 border-t border-gray-100 dark:border-gray-800">
          {/* Top Order Overview Banner */}
          <div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Order ID:</span>
                <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300 text-base">
                  {searchedOrder.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(searchedOrder.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Status Badge */}
              {(() => {
                const badge = getStatusBadge(searchedOrder.status);
                const IconComp = badge.icon;
                return (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.bg}`}>
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-200/60 dark:border-gray-700/60 pt-2.5">
              <div>
                <span className="text-gray-400">Date: </span>
                <span className="font-semibold">
                  {new Date(searchedOrder.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{getStatusBadge(searchedOrder.status).eta}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline Step Tracker */}
          {searchedOrder.status !== 'cancelled' ? (
            <div className="p-4 sm:p-5 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ne' ? 'डेलिभरी प्रक्रिया प्रगती' : 'Delivery Progress Timeline'}</span>
              </h3>

              {/* Step Bar */}
              <div className="grid grid-cols-4 gap-2 relative pt-2">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const IconC = step.icon;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                        } ${isCurrent ? 'scale-110 shadow-lg ring-emerald-300 dark:ring-emerald-800 animate-pulse' : ''}`}
                      >
                        <IconC className="w-5 h-5" />
                      </div>

                      <span
                        className={`text-xs font-bold leading-tight ${
                          isDone ? 'text-emerald-950 dark:text-emerald-200' : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {language === 'ne' ? step.titleNe : step.titleEn}
                      </span>

                      <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
                        {language === 'ne' ? step.descNe : step.descEn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center gap-3 text-red-800 dark:text-red-300 text-xs font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>
                {language === 'ne'
                  ? 'यो अर्डर रद्द गरिएको छ। यदि कुनै प्रश्न भएमा मनास ट्रेडर्सको हेल्पलाइनमा फोन गर्नुहोस्।'
                  : 'This order has been cancelled. If you have any questions, please contact Manas Traders support.'}
              </span>
            </div>
          )}

          {/* Delivery Details & Items Breakdown */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {/* Shipping & Payment Box */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2.5">
              <h4 className="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ne' ? 'ग्राहक र डेलिभरी ठेगाना' : 'Delivery Address'}</span>
              </h4>

              <div className="space-y-1">
                <p className="font-bold text-gray-900 dark:text-gray-100">{searchedOrder.customerName}</p>
                <p className="text-gray-600 dark:text-gray-300 font-mono">{searchedOrder.phone}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchedOrder.address}, {searchedOrder.municipality ? `${searchedOrder.municipality}, ` : ''}{searchedOrder.district}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block text-[10px]">Payment Method</span>
                  <span className="font-bold uppercase text-gray-800 dark:text-gray-200">{searchedOrder.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px]">Payment Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                      searchedOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {searchedOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill Summary Box */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2.5">
              <h4 className="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 pb-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ne' ? 'भुक्तानी विवरण' : 'Payment Breakdown'}</span>
              </h4>

              <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-medium">Rs. {searchedOrder.subtotal.toLocaleString('ne-NP')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee ({searchedOrder.district}):</span>
                  <span className="font-medium">
                    {searchedOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${searchedOrder.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-800 dark:text-emerald-300 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Amount:</span>
                  <span>Rs. {searchedOrder.total.toLocaleString('ne-NP')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Grocery Items List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ne' ? 'अर्डर गरिएका किराना सामानहरू' : 'Ordered Grocery Items'} ({searchedOrder.items.length})
              </span>
            </h4>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden text-xs">
              {searchedOrder.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {language === 'ne' ? item.nameNe || item.nameEn : item.nameEn}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Unit: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.unit}</span> | Qty:{' '}
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.quantity}</span>
                    </p>
                  </div>
                  <span className="font-extrabold text-gray-900 dark:text-gray-100 shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString('ne-NP')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : searchAttempted ? (
        <div className="p-8 text-center space-y-3 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
            ?
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100">
              {language === 'ne' ? 'अर्डर आईडी भेटिएन' : 'Order Not Found'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              {language === 'ne'
                ? 'कृपया राखिएको अर्डर आईडी पुन: जाँच गर्नुहोस् वा माथिको नमूना अर्डर थिचेर हेर्नुहोस्।'
                : 'Please double-check your order ID or click one of the quick demo IDs above.'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Help Support Footer Banner */}
      <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-emerald-800">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-xs text-white">
              {language === 'ne' ? 'डेलिभरी सोधपुछ तथा मद्दत' : 'Delivery Help & Support'}
            </p>
            <p className="text-[11px] text-emerald-300/80">Manas Traders Tikapur Store Helpline</p>
          </div>
        </div>

        <a
          href="tel:+9779848500665"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>9848500665</span>
        </a>
      </div>
    </div>
  );
};

export const OrderTrackingModal: React.FC = () => {
  const { activeModal, setActiveModal, language } = useApp();
  const isOpen = activeModal === 'orderTracking';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Truck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {language === 'ne' ? 'अर्डर डेलिभरी ट्र्याकिङ' : 'Live Order Delivery Tracker'}
              </h2>
              <p className="text-xs text-emerald-100/80">
                {language === 'ne'
                  ? 'मनास ट्रेडर्स टीकापुर - सामानको स्थिति हेर्नुहोस्'
                  : 'Manas Traders Tikapur — Track your grocery status'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <OrderTrackingView embedded={false} />
      </div>
    </div>
  );
};
