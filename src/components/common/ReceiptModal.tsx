import React from 'react';
import { X, Printer, Download, CheckCircle2, Compass, ShieldCheck, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Ride } from '../../types';

interface ReceiptModalProps {
  ride: Ride | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ ride, isOpen, onClose }) => {
  if (!isOpen || !ride) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `ET-INV-${ride.id.replace('ride-', '').substring(0, 8)}`;
  const dateFormatted = new Date(ride.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">EASY TRIP TAX INVOICE</h3>
              <p className="text-[10px] text-slate-500 font-mono">Invoice #{invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              PAID
            </span>
          </div>
        </div>

        {/* Trip Meta */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Passenger</span>
            <strong className="text-slate-900">{ride.customerName}</strong>
            <p className="text-slate-500 text-[11px]">{ride.customerPhone}</p>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Partner</span>
            <strong className="text-slate-900">{ride.driverName || 'EASY TRIP Partner'}</strong>
            <p className="text-slate-500 text-[11px]">{ride.vehicleBrand} {ride.vehicleModel} • {ride.vehicleNumber}</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup Location</span>
              <p className="font-medium text-slate-800 leading-snug">{ride.pickup.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0 ring-4 ring-rose-100" />
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Drop-off Destination</span>
              <p className="font-medium text-slate-800 leading-snug">{ride.destination.address}</p>
            </div>
          </div>
        </div>

        {/* Fare Summary Breakdown */}
        <div className="py-4 border-b border-slate-200 text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Base Fare ({ride.vehicleType.toUpperCase()})</span>
            <span>₹{ride.fareBreakdown?.baseFare || 40}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Distance Fare ({ride.distanceKm} km)</span>
            <span>₹{ride.fareBreakdown?.distanceFare || (ride.finalFare - 50)}</span>
          </div>
          {ride.fareBreakdown?.surgeMultiplier && ride.fareBreakdown.surgeMultiplier > 1 && (
            <div className="flex justify-between text-amber-700 font-medium">
              <span>Demand Surge ({ride.fareBreakdown.surgeMultiplier}x)</span>
              <span>Applied</span>
            </div>
          )}
          {ride.discount && ride.discount > 0 ? (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Promo Discount ({ride.couponCode})</span>
              <span>- ₹{ride.discount}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-slate-600">
            <span>GST & Platform Safety Fee (5%)</span>
            <span>₹{ride.fareBreakdown?.tax || Math.round(ride.finalFare * 0.05)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
            <span>Total Amount Paid</span>
            <span className="text-blue-600">₹{ride.finalFare}</span>
          </div>
        </div>

        {/* Payment info */}
        <div className="py-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Paid via <strong className="uppercase text-slate-900">{ride.paymentMethod}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Txn: {ride.transactionId || 'TXN-98421'}</span>
        </div>

        {/* Print / Download CTA buttons */}
        <div className="mt-4 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
