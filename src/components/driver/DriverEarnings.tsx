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
  Sparkles,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  MapPin,
  Navigation,
  Landmark,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { useNotifications } from '../../context/NotificationContext';
import { AdminUpiQrCard } from './AdminUpiQrCard';

export const DriverEarnings: React.FC = () => {
  const { driverProfile } = useAuth();
  const { allRides, platformSettings } = useRide();
  const { addNotification } = useNotifications();

  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');

  const completedTrips = allRides.filter(r => r.status === 'completed');
  
  // Calculate earnings metrics
  const grossEarnings = completedTrips.reduce((acc, r) => acc + (r.finalFare || 0), 0);
  const commissionRate = (platformSettings.commissionRatePercent || 15) / 100;
  const platformFee = Math.round(grossEarnings * commissionRate);
  const netEarnings = grossEarnings - platformFee;
  const availablePayout = netEarnings;

  const isCab = driverProfile?.vehicleType === 'cab';
  const mandatoryFeePerBooking = isCab 
    ? (platformSettings.driverAdminFeeCab || 50) 
    : (platformSettings.driverAdminFeeBikeAuto || 5);

  const totalFeePaidToAdmin = driverProfile?.totalFeePaidToAdmin || 0;
  const feeDueAmount = driverProfile?.feeDueAmount || 0;

  // Location-wise earnings aggregation
  const locationStatsMap = completedTrips.reduce((acc, trip) => {
    const pickupTown = trip.pickup.city || trip.pickup.address.split(',')[0].trim() || 'Golaghat';
    const dropTown = trip.destination.city || trip.destination.address.split(',')[0].trim() || 'Assam';
    const routeKey = `${pickupTown} → ${dropTown}`;

    const gross = trip.finalFare || 0;
    const fee = Math.round(gross * commissionRate);
    const net = gross - fee;

    if (!acc[routeKey]) {
      acc[routeKey] = {
        route: routeKey,
        pickup: pickupTown,
        drop: dropTown,
        tripsCount: 0,
        totalGross: 0,
        totalNetDriver: 0,
        totalAdminFee: 0,
        totalDistanceKm: 0,
      };
    }

    acc[routeKey].tripsCount += 1;
    acc[routeKey].totalGross += gross;
    acc[routeKey].totalNetDriver += net;
    acc[routeKey].totalAdminFee += fee;
    acc[routeKey].totalDistanceKm += trip.distanceKm || 0;

    return acc;
  }, {} as Record<string, { route: string; pickup: string; drop: string; tripsCount: number; totalGross: number; totalNetDriver: number; totalAdminFee: number; totalDistanceKm: number }>);

  const locationStatsList = Object.values(locationStatsMap);

  const filteredTrips = completedTrips.filter(t => {
    if (selectedLocationFilter === 'all') return true;
    const routeKey = `${t.pickup.city || t.pickup.address.split(',')[0].trim()} → ${t.destination.city || t.destination.address.split(',')[0].trim()}`;
    return routeKey === selectedLocationFilter || t.pickup.address.includes(selectedLocationFilter) || t.destination.address.includes(selectedLocationFilter);
  });

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
            Transparent daily earnings, platform mandatory fees (₹5 Bike/Auto, ₹50 Cab), and instant bank payouts.
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Gross Revenue</span>
            <IndianRupee className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-num">₹{grossEarnings}</div>
          <span className="text-[10px] text-slate-400 font-bold block">{completedTrips.length} trips</span>
        </div>

        {/* Mandatory Admin Fee Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Admin Rate</span>
            <Receipt className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-600 font-mono-num">₹{mandatoryFeePerBooking}</div>
          <span className="text-[10px] text-slate-500 font-bold block">{isCab ? 'Per Cab Booking' : 'Per Bike/Auto'}</span>
        </div>

        {/* Total Admin Fee Paid */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Paid to Admin</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono-num">₹{totalFeePaidToAdmin}</div>
          <span className="text-[10px] text-emerald-600 font-bold block">Verified via GPay</span>
        </div>

        {/* Due Status */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Fee Dues</span>
            <AlertTriangle className={`w-4 h-4 ${feeDueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-black font-mono-num ${feeDueAmount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            ₹{feeDueAmount}
          </div>
          <span className={`text-[10px] font-bold block ${feeDueAmount > 0 ? 'text-rose-600 font-black animate-pulse' : 'text-slate-400'}`}>
            {feeDueAmount > 0 ? 'Pay to unlock app' : 'All cleared'}
          </span>
        </div>

      </div>

      {/* EMBEDDED GOOGLE PAY ADMIN QR PAYMENT COMPONENT */}
      <div className="space-y-3">
        <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-orange-600" />
          <span>Pay Mandatory Platform Fee to Admin (Google Pay QR)</span>
        </h3>
        <AdminUpiQrCard />
      </div>

      {/* Admin Fee Payment History Ledger */}
      {driverProfile?.feePaymentHistory && driverProfile.feePaymentHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
            <span>Admin Fee Payment Receipts</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              {driverProfile.feePaymentHistory.length} receipts
            </span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {driverProfile.feePaymentHistory.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase">
                      ₹{rec.amount} Paid ({rec.vehicleType})
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Ref: {rec.upiTransactionId} • {new Date(rec.paymentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right font-display font-black text-emerald-700 text-sm font-mono-num">
                  ₹{rec.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOCATION-WISE EARNINGS & TRIP REVENUE BREAKDOWN */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-display font-black uppercase tracking-wider">
                LOCATION REVENUE ANALYTICS
              </span>
            </div>
            <h3 className="font-display font-black text-lg text-slate-950 mt-1">
              Location-Wise Earnings Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Amount received by location and major routes across Golaghat District.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedLocationFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedLocationFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Routes ({completedTrips.length})
            </button>
            {locationStatsList.map(stat => (
              <button
                key={stat.route}
                onClick={() => setSelectedLocationFilter(stat.route)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedLocationFilter === stat.route
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {stat.pickup.split(' ')[0]} → {stat.drop.split(' ')[0]} (₹{stat.totalNetDriver})
              </button>
            ))}
          </div>
        </div>

        {/* Route Cards Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {locationStatsList.map(stat => (
            <div
              key={stat.route}
              onClick={() => setSelectedLocationFilter(stat.route)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedLocationFilter === stat.route
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 truncate">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{stat.route}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {stat.tripsCount} {stat.tripsCount === 1 ? 'trip' : 'trips'}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Driver Net Payout</div>
                  <div className="text-lg font-display font-black text-emerald-700 font-mono-num">
                    ₹{stat.totalNetDriver}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Gross Collected</div>
                  <div className="text-xs font-mono font-bold text-slate-600">
                    ₹{stat.totalGross}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                <span>Avg Distance: {(stat.totalDistanceKm / stat.tripsCount).toFixed(1)} km</span>
                <span className="text-orange-600 font-bold">Admin Fee: ₹{stat.totalAdminFee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trip-by-Trip Payout Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            {selectedLocationFilter === 'all' ? 'All Trip Statements' : `Trips for ${selectedLocationFilter}`}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {filteredTrips.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No trips found for this location filter.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredTrips.map(trip => {
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
                <div key={trip.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase">
                        {trip.vehicleType} • {trip.distanceKm} km
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{dateStr}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {trip.paymentMethod?.toUpperCase() || 'UPI/CASH'}
                      </span>
                    </div>
                    
                    {/* Location detail */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <span className="text-emerald-700 font-bold">{trip.pickup.city || trip.pickup.address.split(',')[0]}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-orange-700 font-bold">{trip.destination.city || trip.destination.address.split(',')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{trip.pickup.address} to {trip.destination.address}</p>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                    <div className="font-extrabold text-base text-emerald-600 font-mono-num">+ ₹{tripNet}</div>
                    <span className="text-[10px] text-slate-400">
                      Gross: ₹{tripGross} • Admin Cut: ₹{tripFee}
                    </span>
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
