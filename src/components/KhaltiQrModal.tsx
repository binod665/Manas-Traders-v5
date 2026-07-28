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

        {/* Modal Body: Display exact uploaded Khalti QR image */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-center">
          <div className="relative max-w-sm mx-auto bg-white p-2 rounded-2xl shadow-xl border border-purple-100">
            <img
              src="/khalti_qr.jpg"
              alt="MANAS TRADERS Original Khalti QR Code"
              referrerPolicy="no-referrer"
              className="w-full h-auto rounded-xl object-contain max-h-[480px] mx-auto select-none"
            />
          </div>

          {/* Copy Number Bar */}
          <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-200 flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">
                Khalti ID / Number
              </span>
              <span className="font-mono font-extrabold text-purple-950 text-sm">
                {khaltiNumber}
              </span>
            </div>

            <button
              onClick={handleCopyPhone}
              className="px-3.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-purple-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Number</span>
                </>
              )}
            </button>
          </div>

          {/* Merchant Contact Info */}
          <div className="text-xs text-gray-600 space-y-1 bg-purple-50/60 p-3 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-center gap-1.5 font-bold text-purple-950">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Khalti Merchant • {merchantName}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Scan with Khalti or Mobile Banking app to complete payment.
            </p>
            <div className="pt-1 flex items-center justify-center gap-3 text-[11px] font-semibold text-purple-800">
              <a href="tel:+9779848500665" className="hover:underline flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
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
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            Original Khalti Merchant QR
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
