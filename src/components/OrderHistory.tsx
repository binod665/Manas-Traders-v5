import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { DEMO_ORDERS } from './OrderTrackingModal';
import {
  ShoppingBag,
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Receipt,
  MapPin,
  CreditCard,
  ChevronDown,
  Filter,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface OrderHistoryProps {
  onTrackOrder?: (orderId: string) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onTrackOrder }) => {
  const { language, orders: contextOrders, addToCart, addToast } = useApp();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Combine user context orders with demo orders if user has no orders yet
  const allOrders: Order[] = React.useMemo(() => {
    if (contextOrders && contextOrders.length > 0) {
      return contextOrders;
    }
    return DEMO_ORDERS;
  }, [contextOrders]);

  // Filter and sort orders
  const filteredOrders = React.useMemo(() => {
    return allOrders
      .filter((order) => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchId = order.id.toLowerCase().includes(query);
          const matchDistrict = order.district?.toLowerCase().includes(query) || false;
          const matchItem = order.items.some(
            (item) =>
              item.nameEn.toLowerCase().includes(query) ||
              (item.nameNe && item.nameNe.includes(query))
          );
          return matchId || matchDistrict || matchItem;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        if (sortBy === 'newest') return dateB - dateA;
        if (sortBy === 'oldest') return dateA - dateB;
        if (sortBy === 'highest') return b.total - a.total;
        return 0;
      });
  }, [allOrders, statusFilter, searchQuery, sortBy]);

  // Calculate Order Statistics
  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const completedOrders = allOrders.filter((o) => o.status === 'delivered').length;
  const activeOrders = allOrders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'out_for_delivery').length;

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleReorder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    let reorderedCount = 0;

    order.items.forEach((item) => {
      // Find matching product format for cart
      addToCart(
        {
          id: item.productId,
          nameEn: item.nameEn,
          nameNe: item.nameNe || item.nameEn,
          category: 'organic_staples',
          price: item.price,
          unit: item.unit,
          descriptionEn: 'Organic grocery item from Manas Traders',
          descriptionNe: 'मनास ट्रेडर्स अर्गानिक खाद्यान्न',
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
          originEn: 'Nepal',
          originNe: 'नेपाल',
          inStock: true,
          isFeatured: false,
          isOrganic: true,
        },
        item.quantity
      );
      reorderedCount += item.quantity;
    });

    addToast(
      language === 'ne'
        ? `${reorderedCount} वटा खाद्यान्न सामान झोलामा थपियो!`
        : `${reorderedCount} item(s) re-added to your grocery cart!`,
      'success'
    );
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: language === 'ne' ? 'प्रक्रियामा छ' : 'Placed',
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
          icon: Clock,
        };
      case 'processing':
        return {
          label: language === 'ne' ? 'प्याकिङ हुँदैछ' : 'Packing',
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300',
          icon: Package,
        };
      case 'out_for_delivery':
        return {
          label: language === 'ne' ? 'डेलिभरीमा छ' : 'In Transit',
          bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300',
          icon: Truck,
        };
      case 'delivered':
        return {
          label: language === 'ne' ? 'डेलिभर भयो' : 'Delivered',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          label: language === 'ne' ? 'रद्द गरियो' : 'Cancelled',
          bg: 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300',
          icon: XCircle,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {language === 'ne' ? 'जम्मा अर्डर' : 'Total Orders'}
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
            {totalOrders}
          </p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 p-3.5 rounded-2xl border border-teal-100 dark:border-teal-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              {language === 'ne' ? 'कुल खर्च' : 'Total Spent'}
            </span>
            <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-xl font-black text-teal-950 dark:text-teal-100 mt-1">
            Rs. {totalSpent.toLocaleString('ne-NP')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {language === 'ne' ? 'बाटोमा रहेका' : 'Active Delivery'}
            </span>
            <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-950 dark:text-amber-100 mt-1">
            {activeOrders}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              {language === 'ne' ? 'पुगेका अर्डर' : 'Delivered'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-black text-blue-950 dark:text-blue-100 mt-1">
            {completedOrders}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-gray-50 dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ne'
                ? 'अर्डर आईडी, जिल्ला वा सामानको नाम खोज्नुहोस्...'
                : 'Search by Order ID, item name, district...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer pr-8"
            >
              <option value="all">{language === 'ne' ? 'सबै अर्डर' : 'All Statuses'}</option>
              <option value="pending">{language === 'ne' ? 'अर्डर प्राप्त' : 'Placed'}</option>
              <option value="processing">{language === 'ne' ? 'प्याकिङ' : 'Packing'}</option>
              <option value="out_for_delivery">{language === 'ne' ? 'डेलिभरीमा छ' : 'In Transit'}</option>
              <option value="delivered">{language === 'ne' ? 'डेलिभर भयो' : 'Delivered'}</option>
              <option value="cancelled">{language === 'ne' ? 'रद्द' : 'Cancelled'}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative flex-1 sm:w-32">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer pr-8"
            >
              <option value="newest">{language === 'ne' ? 'नयाँ पहिले' : 'Newest First'}</option>
              <option value="oldest">{language === 'ne' ? 'पुराना पहिले' : 'Oldest First'}</option>
              <option value="highest">{language === 'ne' ? 'महंगो पहिले' : 'Highest Total'}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <div>
            <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
              {language === 'ne' ? 'कुनै अर्डर भेटिएन' : 'No Orders Found'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? language === 'ne'
                  ? 'तपाईंको खोजी अनुसार कुनै अर्डर भेटिएन। खोजी शब्द वा फिल्टर परिवर्तन गरी हेर्नुहोस्।'
                  : 'No orders match your filter criteria. Try clearing search or status filters.'
                : language === 'ne'
                ? 'तपाईंले अहिलेसम्म कुनै अर्डर गर्नुभएको छैन। टीकापुर, मुस्ताङ र इलामका अर्गानिक उत्पादनहरू हेर्नुहोस्!'
                : "You haven't placed any organic grocery orders yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const StatusIcon = badge.icon;
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Banner */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 bg-gray-50/70 dark:bg-gray-800/90 border-b border-gray-100 dark:border-gray-700 cursor-pointer flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-xl text-emerald-800 dark:text-emerald-300">
                      <ShoppingBag className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-900 dark:text-emerald-300 text-sm">
                          {order.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(order.id, e)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 transition-colors"
                          title="Copy ID"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {order.district}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status & Toggle Right */}
                  <div className="flex items-center gap-2.5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black ${badge.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>

                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-[10px] font-bold uppercase font-mono">
                      {order.paymentMethod}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3.5">
                  {/* Items List */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                      {language === 'ne' ? 'अर्डर गरिएका सामग्री' : 'Ordered Grocery Items'} ({order.items.length})
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between text-xs text-gray-800 dark:text-gray-200 ${idx > 0 ? 'pt-2' : ''}`}>
                          <div className="space-y-0.5">
                            <p className="font-bold">
                              {language === 'ne' ? item.nameNe || item.nameEn : item.nameEn}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Unit: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.unit}</span> | Qty:{' '}
                              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{item.quantity}</span>
                            </p>
                          </div>
                          <span className="font-extrabold text-gray-900 dark:text-gray-100 shrink-0">
                            Rs. {(item.price * item.quantity).toLocaleString('ne-NP')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 bg-gray-50/50 dark:bg-gray-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{order.customerName}</span> ({order.phone})
                      <p className="text-gray-500 text-[11px]">
                        {order.address}, {order.municipality ? `${order.municipality}, ` : ''}{order.district}
                      </p>
                    </div>
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 text-[11px] block">
                        {language === 'ne' ? 'जम्मा भुक्तानी रकम:' : 'Total Amount Paid:'}
                      </span>
                      <span className="text-base font-black text-emerald-800 dark:text-emerald-300">
                        Rs. {order.total.toLocaleString('ne-NP')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reorder Button */}
                      <button
                        type="button"
                        onClick={(e) => handleReorder(order, e)}
                        className="px-3.5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Re-add items to cart"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'ne' ? 'पुन: अर्डर गर्नुहोस्' : 'Buy Again'}</span>
                      </button>

                      {/* Track Delivery Button */}
                      {onTrackOrder && (
                        <button
                          type="button"
                          onClick={() => onTrackOrder(order.id)}
                          className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Truck className="w-3.5 h-3.5 text-teal-300" />
                          <span>{language === 'ne' ? 'डेलिभरी ट्र्याकिङ' : 'Track Status'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
