import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  Globe,
  Github,
  CreditCard,
  QrCode,
  DollarSign,
  Landmark,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setActiveModal, addToast } = useApp();

  return (
    <footer className="bg-emerald-950 text-white pt-12 pb-8 border-t border-emerald-900 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-emerald-900/80">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold font-serif text-lg">
                M
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {getTranslation(language, 'brandName')}
                </h3>
                <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider block">
                  manastraders.com.np
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed">
              {getTranslation(language, 'brandTagline')}
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-800">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Tikapur Municipality Delivery</span>
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider text-amber-400">
                {getTranslation(language, 'contactUs')}
              </h4>
              <button
                onClick={() => setActiveModal('contact')}
                className="text-[11px] bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold px-2.5 py-1 rounded-lg border border-emerald-700 transition-all cursor-pointer"
              >
                Open Page
              </button>
            </div>

            <div className="space-y-2 text-emerald-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{getTranslation(language, 'storeLocation')}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+9779848500665" className="hover:text-white transition-colors font-medium">
                  +977 9848500665 / 9824600477
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:info@manastraders.com.np" className="hover:text-white transition-colors">
                  info@manastraders.com.np
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sun - Fri: 7:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Delivery & Coverage */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider text-amber-400">
              Delivery Coverage
            </h4>

            <p className="text-emerald-200 leading-relaxed">
              {getTranslation(language, 'deliveryArea')}
            </p>

            <button
              onClick={() => setActiveModal('orderTracking')}
              className="mt-2 w-full py-2 px-3 bg-teal-800/80 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl border border-teal-600 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Truck className="w-4 h-4 text-teal-300" />
              <span>{language === 'ne' ? 'अर्डर ट्र्याकिङ हेर्नुहोस्' : 'Track Order Status'}</span>
            </button>
          </div>

          {/* Payment Badges */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider text-amber-400">
                Payment Partners
              </h4>
              <button
                onClick={() => setActiveModal('esewaQr')}
                className="text-[10px] bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold px-2 py-0.5 rounded-lg border border-emerald-700 transition-all cursor-pointer flex items-center gap-1"
              >
                <QrCode className="w-3 h-3 text-amber-400" />
                <span>View QR</span>
              </button>
            </div>

            <p className="text-emerald-200 text-xs">
              Instant mobile payment & cash on delivery accepted across Tikapur. Click eSewa or Khalti to view QR code.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setActiveModal('esewaQr')}
                className="bg-emerald-900/80 hover:bg-emerald-800/90 border border-emerald-800 hover:border-emerald-600 p-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-left active:scale-95 group"
                title="Click to view eSewa QR Code"
              >
                <span className="w-6 h-6 rounded bg-emerald-600 font-black text-white text-[10px] flex items-center justify-center shrink-0">e</span>
                <span className="text-[11px] font-bold text-white group-hover:text-emerald-300">eSewa Wallet</span>
              </button>

              <button
                onClick={() => setActiveModal('khaltiQr')}
                className="bg-purple-950/80 hover:bg-purple-900/90 border border-purple-800 hover:border-purple-600 p-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-left active:scale-95 group"
                title="Click to view Khalti Pay QR Code"
              >
                <span className="w-6 h-6 rounded bg-purple-700 font-black text-white text-[10px] flex items-center justify-center shrink-0">K</span>
                <span className="text-[11px] font-bold text-white group-hover:text-purple-300">Khalti Pay</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText('22025240200255');
                  addToast('Bank Account Copied', 'Nepal SBI Bank Ltd.: 22025240200255 (Manas Traders Pvt. Ltd.)', 'info');
                }}
                className="bg-blue-950/80 hover:bg-blue-900/90 border border-blue-800 hover:border-blue-600 p-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-left active:scale-95 group"
                title="Click to copy Nepal SBI Bank Account number"
              >
                <Landmark className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] font-bold text-white group-hover:text-blue-300">Bank Account</span>
              </button>

              <div
                className="bg-amber-950/80 border border-amber-800/80 p-2 rounded-xl flex items-center gap-2 text-left select-none opacity-90"
              >
                <span className="text-sm">💵</span>
                <span className="text-[11px] font-bold text-white">Cash (COD)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex items-center justify-center text-center text-xs text-emerald-400 gap-3">
          <p>© 2026 Manas Traders (manastraders.com.np). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
