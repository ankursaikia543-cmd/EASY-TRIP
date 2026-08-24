import React, { useState } from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Star, 
  QrCode, 
  Printer, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod } from '../../types';
import { PaymentService } from '../../services/paymentService';
import { ReceiptModal } from '../common/ReceiptModal';

export const PaymentRatingModal: React.FC = () => {
  const { activeRide, submitRidePayment, submitRideRating } = useRide();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Polite Driver', 'Clean Vehicle']);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [upiQrVisible, setUpiQrVisible] = useState(false);

  if (!activeRide) return null;

  const fareAmount = activeRide.finalFare;
  const upiIntentUrl = PaymentService.generateUpiPaymentLink(fareAmount, activeRide.id, activeRide.driverName);

  const availableTags = [
    'Polite Driver',
    'Clean Vehicle',
    'Safe Driving',
    'Fast Route',
    'Good AC',
    'Smooth Ride'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await submitRidePayment(activeRide.id, paymentMethod);
      if (res.success) {
        setPaymentDone(true);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitFeedback = async () => {
    const fullReview = `${selectedTags.join(', ')}. ${review}`.trim();
    await submitRideRating(activeRide.id, rating, fullReview);
    setRatingSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5 animate-in fade-in">
      
      {/* Header */}
      <div className="text-center pb-2">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Trip Completed!</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Hope you had a safe and comfortable ride with EASY TRIP.
        </p>
      </div>

      {/* Step 1: Payment Settlement */}
      {!paymentDone && activeRide.paymentStatus !== 'paid' ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Payable Fare</span>
              <div className="text-2xl font-black">₹{fareAmount}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-400 font-bold">Includes GST & Fees</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700">Choose Payment Method</span>

            {/* UPI Option */}
            <div
              onClick={() => { setPaymentMethod('upi'); setUpiQrVisible(true); }}
              className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-between ${
                paymentMethod === 'upi' ? 'bg-blue-50 border-blue-600 shadow-xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  UPI
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Instant UPI / QR Code</div>
                  <p className="text-[11px] text-slate-500">GPay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">Scan & Pay</span>
            </div>

            {/* Simulated UPI QR Box */}
            {paymentMethod === 'upi' && upiQrVisible && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
                <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center">
                  {/* SVG UPI QR representation */}
                  <div className="w-full h-full bg-slate-900 p-1 flex items-center justify-center rounded text-white font-mono text-[10px] text-center">
                    <div>
                      <QrCode className="w-16 h-16 mx-auto text-white mb-1" />
                      <span className="text-[8px] text-slate-300">easytrip.rides@icici</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  <span>Pay exact <strong>₹{fareAmount}</strong> to driver via UPI</span>
                </div>
                <a
                  href={upiIntentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <span>Open UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Wallet Option */}
            <div
              onClick={() => { setPaymentMethod('wallet'); setUpiQrVisible(false); }}
              className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-between ${
                paymentMethod === 'wallet' ? 'bg-blue-50 border-blue-600 shadow-xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">EASY TRIP Wallet</div>
                  <p className="text-[11px] text-slate-500">Current Balance: ₹{user?.walletBalance || 0}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700">1-Click</span>
            </div>

            {/* Cash Option */}
            <div
              onClick={() => { setPaymentMethod('cash'); setUpiQrVisible(false); }}
              className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-between ${
                paymentMethod === 'cash' ? 'bg-blue-50 border-blue-600 shadow-xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Cash to Driver</div>
                  <p className="text-[11px] text-slate-500">Pay directly in cash to driver</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">Cash</span>
            </div>
          </div>

          <button
            onClick={handleProcessPayment}
            disabled={isProcessingPayment}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessingPayment ? (
              <span>Confirming Payment...</span>
            ) : (
              <>
                <span>CONFIRM ₹{fareAmount} PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : !ratingSubmitted ? (
        /* Step 2: Rating & Feedback */
        <div className="space-y-4 animate-in fade-in">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Payment of ₹{fareAmount} Confirmed</span>
          </div>

          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-slate-700">Rate your driver partner</span>
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Compliment Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Text Review */}
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Share additional feedback (optional)..."
            rows={2}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowReceipt(true)}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Receipt
            </button>
            <button
              onClick={handleSubmitFeedback}
              className="flex-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
            >
              Submit Rating & Finish
            </button>
          </div>
        </div>
      ) : (
        /* Completed Thank You Card */
        <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Thank you for rating!</h4>
            <p className="text-xs text-slate-500 mt-1">Your review helps maintain top service standards.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowReceipt(true)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Download Invoice
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
            >
              Done / Book Next
            </button>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      <ReceiptModal
        ride={activeRide}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
};
