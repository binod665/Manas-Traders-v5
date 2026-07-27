import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { getTranslation } from '../translations';
import { Flame, Clock, Sparkles } from 'lucide-react';

export function DealsSection() {
  const { language, products } = useApp();

  // Ticking countdown timer logic (e.g. 14 hours 28 mins 45 secs remaining)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 }; // reset daily
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter((p) => p.isFlashSale || (p.originalPrice && p.originalPrice > p.price));

  if (dealProducts.length === 0) return null;

  return (
    <section className="my-10 p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-amber-500/5 rounded-3xl border border-amber-200/90 shadow-sm relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Title and Live Timer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" /> TODAY'S SPECIAL
            </span>
            <span className="text-xs font-semibold text-amber-900/80">Nepal Fresh Harvest Deals</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-600 animate-pulse" />
            <span>{getTranslation(language, 'todayDeals')}</span>
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {getTranslation(language, 'todayDealsSubtitle')}
          </p>
        </div>

        {/* Live Timer Clock */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-amber-300 shadow-xs self-start md:self-auto">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
            <Clock className="w-4 h-4 text-red-600 animate-spin-slow" />
            <span>{getTranslation(language, 'endsIn')}:</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-gray-900 text-amber-400 font-mono font-black text-sm px-2.5 py-1 rounded-xl shadow-xs">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="font-bold text-gray-900">:</span>
            <div className="bg-gray-900 text-amber-400 font-mono font-black text-sm px-2.5 py-1 rounded-xl shadow-xs">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="font-bold text-gray-900">:</span>
            <div className="bg-gray-900 text-amber-400 font-mono font-black text-sm px-2.5 py-1 rounded-xl shadow-xs">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Flash Sale Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {dealProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
