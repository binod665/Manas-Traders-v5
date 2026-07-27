import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Check,
  Tag,
  Ticket,
  Database,
  CloudCheck,
  Sparkles,
  AlertCircle,
  Percent,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    language,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    selectedDistrict,
    user,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setActiveModal,
    isSupabaseConnected,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  // Subtotal Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Delivery Calculation
  let isFreeDelivery = subtotal >= selectedDistrict.freeDeliveryThreshold;
  if (appliedCoupon?.discountType === 'free_shipping') {
    isFreeDelivery = true;
  }
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : selectedDistrict.deliveryFee;

  // Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  // Final Total
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((subtotal / selectedDistrict.freeDeliveryThreshold) * 100)
  );

  const handleApplyCouponForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const handleQuickCouponClick = (code: string) => {
    const res = applyCoupon(code);
    if (res.success) {
      setCouponMsg({ text: res.message, isError: false });
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-emerald-900 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">
                    {getTranslation(language, 'cart')} ({cart.reduce((a, b) => a + b.quantity, 0)})
                  </h3>
                  {/* Supabase Sync Status Indicator */}
                  <span className="text-[11px] text-emerald-200 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    {user ? (
                      <span className="font-semibold text-emerald-300">Synced with Supabase User</span>
                    ) : (
                      <span>Saved locally in LocalStorage</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery threshold progress bar */}
          <div className="bg-emerald-50/80 p-3 border-b border-emerald-100/80 px-5">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                {isFreeDelivery ? (
                  <span className="text-emerald-800 font-bold">🎉 Free Delivery Unlocked!</span>
                ) : (
                  <span>
                    Add Rs. {(selectedDistrict.freeDeliveryThreshold - subtotal).toLocaleString()} for Free Delivery
                  </span>
                )}
              </span>
              <span className="font-bold text-emerald-800">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-700 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800 mb-1">
                  {getTranslation(language, 'emptyCart')}
                </h4>
                <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                  Your cart is empty. Explore our authentic Nepal organic groceries and start adding items!
                </p>
                <button
                  onClick={onClose}
                  className="bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  {getTranslation(language, 'startShopping')}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const title = language === 'ne' ? item.product.nameNe : item.product.nameEn;
                const unit = item.selectedUnit || item.product.unit;

                return (
                  <div
                    key={`${item.product.id}-${unit}`}
                    className="flex gap-3 p-3 bg-gray-50/90 rounded-2xl border border-gray-100 relative group transition-all hover:bg-white hover:border-emerald-200 shadow-2xs"
                  >
                    <img
                      src={item.product.image}
                      alt={title}
                      className="w-16 h-16 object-cover rounded-xl shrink-0 border border-gray-200"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{title}</h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">Unit: {unit}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-emerald-800 text-sm">
                          Rs. {(item.product.price * item.quantity).toLocaleString('ne-NP')}
                        </span>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-black text-gray-800 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Coupon Code Section */}
            {cart.length > 0 && (
              <div className="pt-2 border-t border-gray-100 mt-4">
                <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-emerald-700" />
                      <span>Have a Promo / Coupon Code?</span>
                    </span>
                    {appliedCoupon && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        APPLIED
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-700" />
                        <div>
                          <span className="font-extrabold text-emerald-900 block">{appliedCoupon.code}</span>
                          <span className="text-[11px] text-emerald-700">
                            {language === 'ne' ? appliedCoupon.descriptionNe : appliedCoupon.descriptionEn}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 text-red-500 hover:text-red-700 font-bold hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCouponForm} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponMsg(null);
                        }}
                        placeholder="e.g. MANAS10, WELCOME50"
                        className="flex-1 uppercase px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponMsg && !appliedCoupon && (
                    <p className={`text-[11px] font-medium ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                      {couponMsg.text}
                    </p>
                  )}

                  {/* Available coupon chip suggestions */}
                  {!appliedCoupon && (
                    <div className="pt-1 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
                      <span className="text-gray-400 font-bold shrink-0">Try:</span>
                      {['MANAS10', 'WELCOME50', 'FREESHIP', 'SUPERNEPAL'].map((code) => (
                        <button
                          key={code}
                          onClick={() => handleQuickCouponClick(code)}
                          className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-mono font-bold hover:bg-emerald-50 cursor-pointer shrink-0 transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer: Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/90 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>{getTranslation(language, 'subtotal')}</span>
                  <span className="font-bold text-gray-900">
                    Rs. {subtotal.toLocaleString('ne-NP')}
                  </span>
                </div>

                {/* Discount Row */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>- Rs. {discountAmount.toLocaleString('ne-NP')}</span>
                  </div>
                )}

                {/* Delivery Fee Row */}
                <div className="flex justify-between">
                  <span>
                    {getTranslation(language, 'deliveryFee')} ({language === 'ne' ? selectedDistrict.nameNe : selectedDistrict.nameEn})
                  </span>
                  <span className="font-bold text-gray-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-extrabold">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>

                {/* Final Net Total */}
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>{getTranslation(language, 'total')}</span>
                  <span className="text-emerald-800">
                    Rs. {total.toLocaleString('ne-NP')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  setActiveModal('checkout');
                }}
                className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>🔒 Secure Checkout</span>
                <button
                  onClick={clearCart}
                  className="text-gray-500 hover:text-red-500 underline font-semibold transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

