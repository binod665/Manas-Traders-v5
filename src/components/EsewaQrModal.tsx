import React from 'react';
import { useApp } from '../context/AppContext';
import { X, QrCode, Check, Copy, ShieldCheck, PhoneCall } from 'lucide-react';

export const EsewaQrModal: React.FC = () => {
  const { activeModal, setActiveModal, addToast } = useApp();
  const [copiedPhone, setCopiedPhone] = React.useState(false);

  if (activeModal !== 'esewaQr') return null;

  const esewaNumber = '9848500665';
  const merchantName = 'Manas Traders';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(esewaNumber);
    setCopiedPhone(true);
    addToast('eSewa Number Copied', `${esewaNumber} copied to clipboard.`, 'success');
    setTimeout(() => setCopiedPhone(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#111822] text-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden border border-emerald-900/50 transition-colors my-auto relative">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 p-4 sm:p-5 relative shrink-0 border-b border-emerald-900/40">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-3.5 right-3.5 p-2 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3 h-3 text-emerald-400" />
              <span>eSewa QR Code</span>
            </span>
            <span className="bg-emerald-400 text-emerald-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
              Original QR
            </span>
          </div>

          <h2 className="text-xl font-black text-white mt-1.5 font-serif">
            MANAS TRADERS
          </h2>
          <p className="text-xs text-emerald-200 font-medium">
            eSewa Mobile: {esewaNumber} • Tikapur MC
          </p>
        </div>

        {/* Modal Body: Display clean eSewa details without image */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-center">
          {/* Main eSewa ID Card */}
          <div className="bg-gradient-to-b from-emerald-900/60 to-slate-900/90 p-5 rounded-2xl border border-emerald-500/30 space-y-3 shadow-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified eSewa Merchant</span>
            </div>

            <div>
              <span className="text-xs text-emerald-200/70 font-semibold uppercase block">Account Holder Name</span>
              <h3 className="text-lg font-black text-white tracking-wide">{merchantName}</h3>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                  eSewa ID / Phone Number
                </span>
                <span className="font-mono font-black text-emerald-300 text-lg tracking-wider">
                  {esewaNumber}
                </span>
              </div>

              <button
                onClick={handleCopyPhone}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 shadow-md"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy eSewa ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Merchant Contact & Support Info */}
          <div className="text-xs text-slate-300 space-y-2 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-300 font-medium">
              Transfer funds directly using eSewa App by entering the <strong>eSewa ID: {esewaNumber}</strong>.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-3 text-xs font-semibold text-emerald-400">
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
        <div className="bg-slate-900/90 px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            eSewa Merchant Details
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
