import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Smartphone, Clock, ShieldCheck } from 'lucide-react';
import { formatRupees } from '../../domain/money/money';

interface GPayQRModalProps {
  amountPaise: number;
  onPaymentSuccess: (reference: string) => void;
  onClose: () => void;
}

export const GPayQRModal: React.FC<GPayQRModalProps> = ({
  amountPaise,
  onPaymentSuccess,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 min
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = () => {
    const min = Math.floor(secondsRemaining / 60);
    const sec = secondsRemaining % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setIsSimulating(true);

    // Audio chime simulation
    if (typeof Audio !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch {
        // audio might require user gesture
      }
    }

    setTimeout(() => {
      const ref = `UPI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      onPaymentSuccess(ref);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-sm leading-tight">Google Pay / UPI QR</h3>
              <p className="text-[10px] text-blue-100">Scan to Pay via any UPI App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Amount Payable
            </p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatRupees(amountPaise)}
            </h2>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Merchant: BIRYANI POS · biryanipos@upi
            </p>
          </div>

          {/* QR Code Container */}
          <div className="w-52 h-52 mx-auto bg-white p-3.5 rounded-2xl shadow-md border-2 border-slate-200 flex flex-col items-center justify-center relative group">
            {/* Realistic SVG QR Pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
              {/* Position markers */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
              <rect x="12" y="12" width="14" height="14" rx="2" fill="currentColor" />

              <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
              <rect x="74" y="12" width="14" height="14" rx="2" fill="currentColor" />

              <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
              <rect x="12" y="74" width="14" height="14" rx="2" fill="currentColor" />

              {/* Data blocks */}
              <rect x="38" y="10" width="8" height="8" fill="currentColor" />
              <rect x="50" y="10" width="8" height="8" fill="currentColor" />
              <rect x="42" y="22" width="16" height="8" fill="currentColor" />
              <rect x="10" y="42" width="8" height="8" fill="currentColor" />
              <rect x="22" y="42" width="12" height="16" fill="currentColor" />
              <rect x="40" y="40" width="20" height="20" rx="4" fill="#2563eb" />
              <rect x="68" y="42" width="8" height="12" fill="currentColor" />
              <rect x="80" y="42" width="10" height="8" fill="currentColor" />
              <rect x="68" y="58" width="12" height="8" fill="currentColor" />
              <rect x="84" y="58" width="8" height="14" fill="currentColor" />
              <rect x="38" y="68" width="8" height="12" fill="currentColor" />
              <rect x="50" y="68" width="8" height="8" fill="currentColor" />
              <rect x="42" y="82" width="18" height="8" fill="currentColor" />
              <rect x="68" y="78" width="10" height="14" fill="currentColor" />
              <rect x="82" y="78" width="10" height="10" fill="currentColor" />

              {/* Center GPay / UPI Mini Logo */}
              <circle cx="50" cy="50" r="9" fill="white" />
              <path d="M46 50 L49 53 L54 47" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <span className="text-[10px] text-slate-500 font-bold mt-1">BHIM UPI · GPay · PhonePe · Paytm</span>
          </div>

          {/* Expiry Timer & Security Badge */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono font-semibold">Expires in: {formatTimer()}</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NPCI Certified</span>
            </div>
          </div>

          {/* Quick Simulation Button for Demo Presentation */}
          <div className="pt-2">
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSimulating ? 'Processing Settlement...' : 'Simulate Customer Payment Received'}</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              [DEMO / SIMULATED] Cashier can click above to simulate immediate UPI settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
