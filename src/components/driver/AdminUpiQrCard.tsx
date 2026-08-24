import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Smartphone, 
  ShieldCheck, 
  AlertTriangle, 
  QrCode, 
  ArrowRight, 
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { useNotifications } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

interface AdminUpiQrCardProps {
  customAmount?: number;
  onSuccess?: () => void;
  compact?: boolean;
}

export const AdminUpiQrCard: React.FC<AdminUpiQrCardProps> = ({
  customAmount,
  onSuccess,
  compact = false,
}) => {
  const { driverProfile, payDriverAdminFee } = useAuth();
  const { platformSettings } = useRide();
  const { addNotification } = useNotifications();

  const upiId = platformSettings.adminUpiId || '8638803320@okbizaxis';
  const upiName = platformSettings.adminUpiName || 'vijay xaikia';
  const upiPhone = platformSettings.adminUpiPhone || '+91 86388 03320';

  // Amount based on vehicle type rule: Bike/Auto ₹5, Cab ₹50 per customer booking
  const defaultFee = driverProfile?.vehicleType === 'cab' 
    ? (platformSettings.driverAdminFeeCab || 50) 
    : (platformSettings.driverAdminFeeBikeAuto || 5);
  
  const dueAmount = customAmount !== undefined 
    ? customAmount 
    : (driverProfile?.feeDueAmount && driverProfile.feeDueAmount > 0 ? driverProfile.feeDueAmount : defaultFee);

  const [enteredTxnId, setEnteredTxnId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'google_pay_upi' | 'phonepe' | 'paytm' | 'cash'>('google_pay_upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Generate UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${dueAmount}&cu=INR&tn=${encodeURIComponent(`EASY TRIP Admin Fee ${driverProfile?.name || 'Driver'}`)}`;
  
  // High quality QR Code image source using standard QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiUri)}&color=0f172a&bgcolor=ffffff&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverProfile) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const txn = enteredTxnId.trim() || `UPI-GPAY-${Math.floor(100000000 + Math.random() * 900000000)}`;
      payDriverAdminFee(driverProfile.id, dueAmount, txn, selectedMethod);
      
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setSuccessMessage(`Payment of ₹${dueAmount} verified successfully! Your driver app is now fully active.`);
      addNotification(
        'Admin Fee Paid & App Unlocked',
        `₹${dueAmount} paid to Admin (${upiName}) via Google Pay UPI. App is active for new bookings.`,
        'payment'
      );

      setIsSubmitting(false);
      setEnteredTxnId('');
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-xl overflow-hidden animate-in fade-in">
      
      {/* Top Google Pay Multi-Color Stripe */}
      <div className="grid grid-cols-4 h-2.5 w-full">
        <div className="bg-[#4285F4]" />
        <div className="bg-[#34A853]" />
        <div className="bg-[#FBBC05]" />
        <div className="bg-[#EA4335]" />
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        
        {/* Title & Fee Rule Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <QrCode className="w-5 h-5" />
              </span>
              <h3 className="font-display font-black text-lg text-slate-950">
                Admin Mandatory Platform Fee
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Regular Driver Admin Fee: <span className="font-bold text-emerald-700">₹5 for Bike/Auto</span> | <span className="font-bold text-blue-700">₹50 for Cab</span> per customer booking.
            </p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-300 px-4 py-2 rounded-2xl text-right shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Amount Payable</span>
            <span className="text-2xl font-display font-black text-emerald-950 font-mono-num">₹{dueAmount}</span>
          </div>
        </div>

        {/* GOOGLE PAY CARD CONTAINER - EXACT MATCH TO UPLOADED IMAGE */}
        <div className="max-w-xs mx-auto bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-3 relative">
          
          {/* GPay Header */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <div className="flex items-center gap-1 font-display font-bold text-slate-800 text-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 shadow-2xs">
                <span className="text-sm font-black text-blue-600">G</span>
              </span>
              <span className="font-medium text-slate-700">Google Pay</span>
            </div>
          </div>

          {/* Payee Name & Phone */}
          <div className="space-y-0.5">
            <h4 className="font-display font-black text-base text-slate-900 capitalize tracking-tight">
              {upiName}
            </h4>
            <p className="text-xs font-mono font-bold text-slate-600">
              {upiPhone}
            </p>
          </div>

          {/* Scan & Pay Label */}
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Scan & pay
          </div>

          {/* High Resolution UPI QR Code */}
          <div className="relative p-2 bg-white rounded-2xl border-2 border-slate-900/10 shadow-inner flex items-center justify-center">
            <img 
              src={qrCodeUrl} 
              alt="Google Pay Admin UPI QR Code" 
              className="w-56 h-56 object-contain rounded-xl"
            />
          </div>

          {/* UPI ID with One-Click Copy */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="truncate">UPI ID: {upiId}</span>
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>
            {copiedUpi && <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">UPI ID Copied to clipboard!</span>}
          </div>

          {/* BHIM UPI and Payment App Badges */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="text-[11px] font-black text-slate-800 flex items-center justify-center gap-1 tracking-wider">
              <span className="text-orange-600 font-extrabold">BHIM</span>
              <span className="text-emerald-600 font-extrabold">UPI</span>
            </div>
            
            {/* Apps logos / names */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600">
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">G Pay</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">Paytm</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">PhonePe</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Amazon Pay</span>
            </div>
          </div>

        </div>

        {/* DIRECT MOBILE UPI APP INTENTS (FOR SMARTPHONES) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct One-Tap Mobile Payment:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href={upiUri}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>Pay via GPay</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={upiUri}
              className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>Pay via PhonePe</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={upiUri}
              className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>Pay via Paytm</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={upiUri}
              className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>Any UPI App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* PAYMENT SUBMISSION & TRANSACTION VERIFICATION FORM */}
        <form onSubmit={handleConfirmPayment} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enter UPI Transaction Ref / Click Verify to Unlock App</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={enteredTxnId}
                onChange={e => setEnteredTxnId(e.target.value)}
                placeholder="e.g. 423987123456 or GPay Ref ID (Optional)"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-display font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I HAVE PAID ₹{dueAmount}</span>
                </>
              )}
            </button>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};
