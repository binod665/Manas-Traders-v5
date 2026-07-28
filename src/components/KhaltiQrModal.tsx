import React from 'react';
import { useApp } from '../context/AppContext';
import { X, QrCode, Check, Copy, ShieldCheck, PhoneCall } from 'lucide-react';

export const KhaltiQrModal: React.FC = () => {
  const { activeModal, setActiveModal, addToast } = useApp();
  const [copiedPhone, setCopiedPhone] = React.useState(false);

  if (activeModal !== 'khaltiQr') return null;

  const khaltiNumber = '9848500665';
  const merchantName = 'Manas Traders';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(khaltiNumber);
    setCopiedPhone(true);
    addToast('Khalti Number Copied', `${khaltiNumber} copied to clipboard.`, 'success');
    setTimeout(() => setCopiedPhone(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white text-gray-900 rounded-3xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden border border-purple-100 transition-colors my-auto relative">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-purple-800 via-purple-900 to-slate-950 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-3.5 right-3.5 p-2 text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3 h-3 text-purple-300" />
              <span>Khalti QR Code</span>
            </span>
            <span className="bg-purple-400 text-purple-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
              Original QR
            </span>
          </div>

          <h2 className="text-xl font-black text-white mt-1.5 font-serif">
            MANAS TRADERS
          </h2>
          <p className="text-xs text-purple-200 font-medium">
            Khalti Number: {khaltiNumber} • Tikapur MC
          </p>
        </div>

        {/* Modal Body: Display clean Khalti details without image */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-center">
          {/* Main Khalti ID Card */}
          <div className="bg-gradient-to-b from-purple-900/90 to-slate-900 p-5 rounded-2xl border border-purple-500/30 space-y-3 shadow-lg text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Verified Khalti Merchant</span>
            </div>

            <div>
              <span className="text-xs text-purple-200/70 font-semibold uppercase block">Account Holder Name</span>
              <h3 className="text-lg font-black text-white tracking-wide">{merchantName}</h3>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-purple-400 font-bold uppercase block">
                  Khalti ID / Phone Number
                </span>
                <span className="font-mono font-black text-purple-300 text-lg tracking-wider">
                  {khaltiNumber}
                </span>
              </div>

              <button
                onClick={handleCopyPhone}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 shadow-md"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Khalti ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Merchant Contact & Support Info */}
          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 bg-purple-50/80 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-950 dark:text-purple-200 font-medium">
              Transfer funds directly using Khalti App by entering the <strong>Khalti ID: {khaltiNumber}</strong>.
            </p>
            <div className="pt-2 border-t border-purple-200 dark:border-purple-800 flex items-center justify-center gap-3 text-xs font-semibold text-purple-800 dark:text-purple-300">
              <a href="tel:+9779848500665" className="hover:underline flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>9848500665</span>
              </a>
              <span>•</span>
              <a href="tel:+9779824600477" className="hover:underline">
                9824600477
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Khalti Merchant Details
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
