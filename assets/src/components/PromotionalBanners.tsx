import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { Truck, ShoppingBag, ShieldCheck, Tag, ArrowRight } from 'lucide-react';

export function PromotionalBanners() {
  const { language, setSelectedCategory } = useApp();

  const handleExplore = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-800" />
            <span>{getTranslation(language, 'specialOffersTitle')}</span>
          </h3>
          <p className="text-xs text-gray-500">
            Exclusive discounts and bulk pricing for households & commercial buyers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Banner 1: Free Delivery */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white overflow-hidden shadow-md group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl group-hover:scale-125 transition-all" />
          <div className="relative z-10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                KATHMANDU VALLEY SPECIAL
              </span>
              <h4 className="text-lg font-bold text-white mt-1">
                {language === 'ne'
                  ? 'रु. २,००० भन्दा बढीमा नि:शुल्क होम डेलिभरी'
                  : 'Free Delivery on Orders Above Rs. 2,000'}
              </h4>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'ne'
                ? 'काठमाडौँ, ललितपुर र भक्तपुरमा २४ घण्टभित्र सोझै घरमा डेलिभरी।'
                : 'Express 24-hour delivery across Kathmandu, Bhaktapur & Lalitpur districts.'}
            </p>
            <button
              onClick={() => handleExplore('all')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 pt-2 cursor-pointer"
            >
              <span>{getTranslation(language, 'shopNow')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner 2: Wholesale & Bulk */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-white overflow-hidden shadow-md group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-400/20 rounded-full blur-xl group-hover:scale-125 transition-all" />
          <div className="relative z-10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                WHOLESALE & HOTELS
              </span>
              <h4 className="text-lg font-bold text-white mt-1">
                {language === 'ne'
                  ? 'होटल, क्यान्टिन र थोक खरिदमा विशेष छुट'
                  : 'Up to 20% Off on Bulk Rice & Oil Bags'}
              </h4>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {language === 'ne'
                ? '२५ केजी चामल, १० लिटर तोरीको तेल र ५ केजी दालको बोरामा विशेष थोक दर।'
                : 'Special bulk pricing on 25kg Basmati Rice, Mustard Oil tins, & Pulses sacks.'}
            </p>
            <button
              onClick={() => handleExplore('rice-grains')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 pt-2 cursor-pointer"
            >
              <span>{getTranslation(language, 'shopNow')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner 3: Genuine Farmer Guarantee */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white overflow-hidden shadow-md group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-teal-400/20 rounded-full blur-xl group-hover:scale-125 transition-all" />
          <div className="relative z-10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                LOCAL FARMER DIRECT
              </span>
              <h4 className="text-lg font-bold text-white mt-1">
                {language === 'ne'
                  ? 'मुस्ताङ र जुम्लाका अर्गानिक उत्पादनहरू'
                  : 'Mustang, Jumla & Ilam Direct Harvest'}
              </h4>
            </div>
            <p className="text-xs text-teal-100/80 leading-relaxed">
              {language === 'ne'
                ? 'स्थानीय नेपाली किसानहरूबाट सोझै संकलित विशुद्ध अग्रानिक जडीबुटी र खाद्यान्न।'
                : '100% natural, unpolished organic pulses, tea, and mountain herbs.'}
            </p>
            <button
              onClick={() => handleExplore('organic-specials')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 pt-2 cursor-pointer"
            >
              <span>{getTranslation(language, 'shopNow')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
