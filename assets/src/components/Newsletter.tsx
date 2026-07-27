import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { Mail, BellRing, CheckCircle, Sparkles } from 'lucide-react';

export function Newsletter() {
  const { language, addToast } = useApp();
  const [inputVal, setInputVal] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsSubscribed(true);
    addToast({
      type: 'success',
      title: language === 'ne' ? 'सब्सक्राइब गरियो!' : 'Subscribed Successfully!',
      message:
        language === 'ne'
          ? 'तपाईंलाई दैनिक किराना बजार दर र अफरहरू पठाइनेछ।'
          : 'You will now receive daily grocery rates and exclusive flash sale updates.',
    });
    setInputVal('');
  };

  return (
    <section className="my-10 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Text */}
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY MARKET RATE ALERT</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {getTranslation(language, 'newsletterTitle')}
          </h3>

          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-lg">
            {getTranslation(language, 'newsletterSubtitle')}
          </p>
        </div>

        {/* Right Input Form */}
        <div className="w-full md:w-auto min-w-[320px]">
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl text-emerald-300 font-bold text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>
                {language === 'ne'
                  ? 'धन्यवाद! तपाईंको इमेल दर्ता भयो।'
                  : 'Thank you! You are subscribed to rate alerts.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={getTranslation(language, 'emailPlaceholder')}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
              >
                <BellRing className="w-4 h-4" />
                <span>{getTranslation(language, 'subscribe')}</span>
              </button>
            </form>
          )}

          <p className="text-[10px] text-emerald-200/60 text-center md:text-left mt-2">
            * Zero spam. Unsubscribe anytime with 1-click.
          </p>
        </div>
      </div>
    </section>
  );
}
