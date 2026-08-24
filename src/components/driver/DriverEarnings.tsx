import React, { useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Wallet, 
  ArrowDownLeft, 
  CheckCircle2, 
  Download, 
  Calendar,
  Percent,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { useNotifications } from '../../context/NotificationContext';

export const DriverEarnings: React.FC = () => {
  const { driverProfile } = useAuth();
  const { allRides, platformSettings } = useRide();
  const { addNotification } = useNotifications();

  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const completedTrips = allRides.filter(r => r.status === 'completed');
  
  // Calculate earnings metrics
  const grossEarnings = completedTrips.reduce((acc, r) => acc + (r.finalFare || 0), 0);
  const commissionRate = (platformSettings.commissionRatePercent || 15) / 100;
  const platformFee = Math.round(grossEarnings * commissionRate);
  const netEarnings = grossEarnings - platformFee;
  const availablePayout = netEarnings;

  const handleWithdrawPayout = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setPayoutSuccess(true);
      addNotification('Instant Payout Transferred', `₹${availablePayout} transferred to your bank account via IMPS/UPI.`, 'payment');
      setTimeout(() => setPayoutSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Driver Partner Earnings</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Transparent daily earnings, platform commission rates, and instant bank payouts.
          </p>
        </div>

        {/* Bank Account Linked Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-800 text-xs font-bold self-start">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>HDFC Bank •••• 4921 Verified</span>
        </div>
      </div>

      {/* Primary Balance & Instant Payout Card */}
      <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Withdrawable Balance</span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">₹{availablePayout}</div>
            <p className="text-xs text-slate-400 mt-1">Net earnings ready for instant 24/7 IMPS transfer</p>
          </div>

          <button
            onClick={handleWithdrawPayout}
            disabled={isWithdrawing || availablePayout <= 0}
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{isWithdrawing ? 'Transferring via IMPS...' : 'TRANSFER TO BANK (INSTANT)'}</span>
          </button>
        </div>

        {payoutSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Success! ₹{availablePayout} sent to your linked bank account. Reference: UTR-{Math.floor(100000000 + Math.random() * 900000000)}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Gross Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Gross Fares</span>
            <IndianRupee className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{grossEarnings}</div>
          <span className="text-[10px] text-slate-400 font-bold block">{completedTrips.length} completed trips</span>
        </div>

        {/* Platform Commission (15%) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Platform Fee ({platformSettings.commissionRatePercent || 15}%)</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{platformFee}</div>
          <span className="text-[10px] text-purple-600 font-bold block">Lowest industry fee</span>
        </div>

        {/* Driver Net Income (85%) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Net Take-Home</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{netEarnings}</div>
          <span className="text-[10px] text-emerald-700 font-bold block">85% of every fare</span>
        </div>

      </div>

      {/* Trip-by-Trip Payout Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Trip Earnings Breakdown</h3>

        {completedTrips.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Complete trips to see itemized payout statements.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {completedTrips.map(trip => {
              const tripGross = trip.finalFare;
              const tripFee = Math.round(tripGross * commissionRate);
              const tripNet = tripGross - tripFee;
              const dateStr = new Date(trip.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={trip.id} className="py-3.5 first:pt-0 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase">
                        {trip.vehicleType} • {trip.distanceKm} km
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{dateStr}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{trip.pickup.address.split(',')[0]} → {trip.destination.address.split(',')[0]}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-emerald-600">+ ₹{tripNet}</div>
                    <span className="text-[10px] text-slate-400">Fare: ₹{tripGross} (Fee: ₹{tripFee})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
