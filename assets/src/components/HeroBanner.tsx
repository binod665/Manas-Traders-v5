import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { ShoppingBag, Truck, ShieldCheck, Sparkles, MapPin, Award } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { language, setActiveModal } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 my-4 shadow-2xl border border-emerald-800/40">
      {/* Decorative SVG Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Text Content */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Manas Traders • manastraders.com.np</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            {getTranslation(language, 'heroTitle')}
          </h2>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
            {getTranslation(language, 'heroSubtitle')}
          </p>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div className="bg-emerald-900/60 border border-emerald-700/40 p-2.5 rounded-xl backdrop-blur-xs text-center">
              <span className="block text-amber-400 font-bold text-sm sm:text-base">100% Organic</span>
              <span className="text-[10px] text-emerald-200">Local Farms</span>
            </div>
            <div className="bg-emerald-900/60 border border-emerald-700/40 p-2.5 rounded-xl backdrop-blur-xs text-center">
              <span className="block text-amber-400 font-bold text-sm sm:text-base">Same Day</span>
              <span className="text-[10px] text-emerald-200">Kathmandu Delivery</span>
            </div>
            <div className="bg-emerald-900/60 border border-emerald-700/40 p-2.5 rounded-xl backdrop-blur-xs text-center">
              <span className="block text-amber-400 font-bold text-sm sm:text-base">eSewa / COD</span>
              <span className="text-[10px] text-emerald-200">Easy Payment</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <a
              href="#products-section"
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all flex items-center gap-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{getTranslation(language, 'shopNow')}</span>
            </a>

            <button
              onClick={() => setActiveModal('supabaseConfig')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2 text-sm"
            >
              <span>{getTranslation(language, 'configureSupabase')}</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Column */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Kathmandu & Valley Delivery</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">Free delivery on orders over Rs. 2,000</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Direct Sourced Produce</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">Mustang, Jumla, Pokhara & Ilam</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-400 text-emerald-950 flex items-center justify-center shrink-0 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Supabase & Local Sync</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">Guest cart saved in LocalStorage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
