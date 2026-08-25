import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Car, 
  MapPin, 
  Flag, 
  Navigation, 
  PhoneCall, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  KeyRound, 
  ShieldCheck, 
  RotateCcw,
  IndianRupee,
  Volume2,
  Lock,
  QrCode,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { GoogleMapsEmbed } from '../common/GoogleMapsEmbed';
import { ChatModal } from '../common/ChatModal';
import { AdminUpiQrCard } from './AdminUpiQrCard';
import { DriverFeeModal } from './DriverFeeModal';

export const DriverHome: React.FC = () => {
  const { driverProfile, updateDriverProfile } = useAuth();
  const { 
    activeRide, 
    incomingDriverRequest, 
    driverAcceptRide, 
    driverRejectRide,
    driverArrivedAtPickup,
    driverStartRideWithOtp,
    driverCompleteRide,
    platformSettings
  } = useRide();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  const [mapEngine, setMapEngine] = useState<'google' | 'district'>('google');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(25);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showQrCard, setShowQrCard] = useState(true);

  const isOnline = driverProfile?.onlineStatus === 'online';
  const isApproved = driverProfile?.approvalStatus === 'approved';

  // Fee Rules: ₹5 for Bike/Auto, ₹50 for Cab per customer booking
  const feeRate = driverProfile?.vehicleType === 'cab' 
    ? (platformSettings.driverAdminFeeCab || 50) 
    : (platformSettings.driverAdminFeeBikeAuto || 5);
  
  const dueAmount = driverProfile?.feeDueAmount !== undefined 
    ? driverProfile.feeDueAmount 
    : 0;

  // App is locked if driver has unpaid fee dues or is explicitly flagged unpaid
  const isFeeLocked = dueAmount > 0 || (driverProfile?.isFeePaid === false && (driverProfile?.totalRides || 0) > 0);

  // Toggle Driver Online / Offline with Mandatory Fee Enforcement
  const toggleOnline = () => {
    if (!driverProfile) return;
    if (!isApproved) {
      addNotification('KYC Verification Pending', 'Your account must be approved by admin before going online.', 'system');
      return;
    }

    if (isFeeLocked) {
      setShowFeeModal(true);
      addNotification(
        'Driver App Locked - Fee Pending',
        `Mandatory Admin platform fee of ₹${dueAmount || feeRate} is pending. Please pay via Admin Google Pay QR Code to unlock your app.`,
        'payment'
      );
      return;
    }

    const nextStatus = isOnline ? 'offline' : 'online';
    updateDriverProfile({ onlineStatus: nextStatus });
    addNotification(
      nextStatus === 'online' ? 'You are now Online' : 'You are now Offline',
      nextStatus === 'online' ? 'You will now receive incoming ride requests.' : 'Duty ended. No new ride requests.',
      'system'
    );
  };

  // Auto take driver offline if fee gets locked
  useEffect(() => {
    if (isFeeLocked && isOnline) {
      updateDriverProfile({ onlineStatus: 'offline' });
      addNotification('Duty Suspended', `Please pay pending admin fee of ₹${dueAmount || feeRate} to resume duty.`, 'payment');
    }
  }, [isFeeLocked]);

  // Incoming Request Countdown Timer
  useEffect(() => {
    if (!incomingDriverRequest) {
      setCountdownSeconds(25);
      return;
    }

    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          driverRejectRide(incomingDriverRequest.id);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingDriverRequest]);

  const handleStartTripWithOtp = async () => {
    if (!activeRide || !otpInput.trim()) return;
    setOtpError(null);
    const res = await driverStartRideWithOtp(activeRide.id, otpInput.trim());
    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Top Driver Info & Online Switch Banner */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Profile Details */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={driverProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={driverProfile?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-xl text-slate-950 tracking-tight">{driverProfile?.name}</h2>
              <span className="text-[10px] font-display font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-300">
                {driverProfile?.vehicleType} PARTNER
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
              <span className="font-mono-num font-bold text-slate-900">{driverProfile?.vehicleNumber}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-orange-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
                <span className="font-mono-num">{driverProfile?.rating || 4.88} ({driverProfile?.totalRides || 180} trips)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Online / Offline Toggle Button & Pay Admin Fee */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Quick Pay Admin Fee Button */}
          <button
            onClick={() => setShowFeeModal(true)}
            className={`px-4 py-3 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer border ${
              isFeeLocked
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 animate-bounce'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <QrCode className="w-4 h-4 text-orange-500" />
            <span>PAY ADMIN FEE ({driverProfile?.vehicleType === 'cab' ? '₹50' : '₹5'})</span>
            {isFeeLocked && <span className="bg-white text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">DUE</span>}
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-display font-black text-slate-950">
              {isOnline ? 'ACTIVE ON DUTY' : 'CURRENTLY OFFLINE'}
            </div>
            <span className="text-[11px] text-slate-500">
              {isOnline ? 'Ready to accept Golaghat bookings' : 'Go online to receive bookings'}
            </span>
          </div>

          <button
            onClick={toggleOnline}
            className={`px-6 py-3 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
              isFeeLocked
                ? 'bg-slate-400 hover:bg-slate-500 text-white opacity-90 cursor-not-allowed'
                : isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-orange-500 to-emerald-600 hover:from-orange-600 hover:to-emerald-700 text-white shadow-orange-500/25'
            }`}
          >
            {isFeeLocked ? <Lock className="w-4 h-4" /> : <Power className="w-4 h-4" />}
            <span>{isFeeLocked ? 'APP LOCKED' : isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
          </button>
        </div>
      </div>

      {/* MANDATORY ADMIN FEE LOCK BANNER */}
      {isFeeLocked && (
        <div className="p-5 bg-gradient-to-r from-rose-500 via-rose-600 to-orange-600 text-white rounded-3xl shadow-lg border-2 border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-rose-700 font-display">
                  SERVICE SUSPENDED
                </span>
                <h3 className="font-display font-black text-base">Mandatory Platform Fee Pending</h3>
              </div>
              <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                As per platform policy, {driverProfile?.vehicleType === 'cab' ? 'cab drivers must pay ₹50 per booking' : 'bike and auto drivers must pay ₹5 regular fee'} to Admin. Your driver app cannot receive rides until cleared.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFeeModal(true)}
            className="px-6 py-3 bg-white hover:bg-rose-50 text-rose-700 font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-orange-600" />
            <span>SCAN ADMIN QR & UNLOCK</span>
          </button>
        </div>
      )}

      {/* KYC & Admin Activation Warning if pending or inactive */}
      {!isApproved && (
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-950 shadow-md animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-display font-black uppercase tracking-wider">
                  DRIVER APP LOCKED
                </span>
                <h4 className="font-display font-black text-sm text-amber-950">Awaiting Admin Portal Activation</h4>
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                As per safety and licensing regulations, <strong>no driver can use this app until the Super Admin presses the Activate button</strong> in the Admin Portal. Once verified, your status will turn active automatically.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-stretch sm:self-center">
            <span className="px-4 py-2 rounded-xl bg-white border border-amber-300 font-display font-black text-xs text-amber-900 uppercase">
              Status: {driverProfile?.approvalStatus?.toUpperCase() || 'PENDING'}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Active Ride / Incoming Modal / Route View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Duty Status & Active Ride Management */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Active Assigned Ride Controls */}
          {activeRide && (activeRide.status === 'driver_assigned' || activeRide.status === 'arrived' || activeRide.status === 'in_progress') ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-5">
              
              {/* Passenger Card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-display font-black uppercase tracking-wider">Passenger</span>
                  <h3 className="font-display font-black text-lg text-slate-950">{activeRide.customerName}</h3>
                  <span className="text-xs text-slate-600 font-mono-num">{activeRide.customerPhone}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-display font-black uppercase tracking-wider">Fare to Collect</span>
                  <div className="text-2xl font-display font-black text-emerald-700 font-mono-num">₹{activeRide.finalFare}</div>
                </div>
              </div>

              {/* Call / Chat */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${activeRide.customerPhone}`}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-900 text-xs font-display font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Passenger</span>
                </a>
                <button
                  onClick={() => setShowChat(true)}
                  className="py-2.5 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-950 text-xs font-display font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors border border-orange-200 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                  <span>In-App Chat</span>
                </button>
              </div>

              {/* Route checkpoints */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-2 ring-emerald-200" />
                  <div>
                    <span className="text-[10px] text-emerald-900 font-display font-black uppercase tracking-wider">Pickup Location</span>
                    <p className="font-bold text-slate-900 leading-snug">{activeRide.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0 ring-2 ring-orange-200" />
                  <div>
                    <span className="text-[10px] text-orange-900 font-display font-black uppercase tracking-wider">Destination</span>
                    <p className="font-bold text-slate-900 leading-snug">{activeRide.destination.address}</p>
                  </div>
                </div>
              </div>

              {/* Step 1: Arrived at Pickup */}
              {activeRide.status === 'driver_assigned' && (
                <button
                  onClick={() => driverArrivedAtPickup(activeRide.id)}
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>I HAVE ARRIVED AT PICKUP</span>
                </button>
              )}

              {/* Step 2: Enter 4-Digit Customer OTP & Start Trip */}
              {activeRide.status === 'arrived' && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-orange-50 border-2 border-emerald-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-display font-black text-slate-950 uppercase tracking-wide">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Enter Passenger 4-Digit PIN to Start</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    placeholder="Enter 4-Digit PIN"
                    className="w-full p-3 bg-white border-2 border-emerald-300 rounded-xl text-center text-2xl font-mono-num font-black tracking-widest text-slate-950 focus:outline-hidden"
                  />
                  {otpError && (
                    <p className="text-xs text-rose-600 font-bold text-center">{otpError}</p>
                  )}
                  <button
                    onClick={handleStartTripWithOtp}
                    disabled={otpInput.length !== 4}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    VERIFY PIN & START RIDE
                  </button>
                </div>
              )}

              {/* Step 3: Complete Trip */}
              {activeRide.status === 'in_progress' && (
                <button
                  onClick={() => driverCompleteRide(activeRide.id)}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>COMPLETE TRIP & COLLECT ₹{activeRide.finalFare}</span>
                </button>
              )}

            </div>
          ) : (
            /* Standby Card when no active trip */
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-2xs space-y-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <Navigation className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-slate-950">
                  {isOnline ? 'Online & Searching for Golaghat Bookings' : 'Driver Partner Standby'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {isOnline 
                    ? 'Stay in active zones (Bokakhat Chariali, Kohora Kaziranga Gate, Numaligarh Refinery, Dergaon) for instant booking alerts.'
                    : 'Toggle Online at the top when you are ready to accept passenger trips.'}
                </p>
              </div>

              {/* Today Summary Snapshot */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase font-display font-black tracking-wider">Today Payout</span>
                  <div className="text-xl font-display font-black text-emerald-900 font-mono-num">₹{driverProfile?.todayEarnings || 0}</div>
                </div>
                <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-200">
                  <span className="text-[10px] text-orange-800 uppercase font-display font-black tracking-wider">Trips Done</span>
                  <div className="text-xl font-display font-black text-orange-950 font-mono-num">{driverProfile?.totalRides || 0}</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Navigation Map with Engine Switcher */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-3 border-2 border-emerald-100 shadow-xs space-y-3">
          
          {/* Map Engine Switcher Header */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-2 text-xs font-display font-black text-slate-800">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>DRIVER GPS ROUTE:</span>
            </div>
            <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapEngine('google')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  mapEngine === 'google'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌐 Google Maps (Live Route)
              </button>
              <button
                type="button"
                onClick={() => setMapEngine('district')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  mapEngine === 'district'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📍 Golaghat District / GP
              </button>
            </div>
          </div>

          {mapEngine === 'google' ? (
            <GoogleMapsEmbed
              pickup={activeRide?.pickup}
              destination={activeRide?.destination}
              heightClass="h-[460px] sm:h-[520px]"
            />
          ) : (
            <InteractiveMap
              pickup={activeRide?.pickup}
              destination={activeRide?.destination}
              driverLocation={activeRide?.driverLocation}
              vehicleType={driverProfile?.vehicleType || 'cab'}
              status={activeRide?.status}
              heightClass="h-[460px] sm:h-[520px]"
            />
          )}
        </div>

      </div>

      {/* PERMANENT FIXED ADMIN GOOGLE PAY UPI QR CODE SECTION FOR REGULAR DRIVERS */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-950 tracking-tight flex items-center gap-2">
              <span className="p-1 rounded-lg bg-orange-100 text-orange-600">
                <QrCode className="w-5 h-5" />
              </span>
              <span>Admin Platform Fee Counter & Google Pay QR</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Permanent QR code for driver partner mandatory payments (₹5 for Bike/Auto, ₹50 for Cab).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider ${
              isFeeLocked 
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {isFeeLocked ? `DUE: ₹${dueAmount || feeRate}` : 'FEE CLEARED (ACTIVE)'}
            </span>
          </div>
        </div>

        <AdminUpiQrCard customAmount={dueAmount > 0 ? dueAmount : feeRate} />
      </div>

      {/* INCOMING RIDE REQUEST POP-UP MODAL (25s Audio-Visual Alert) */}
      {incomingDriverRequest && !isFeeLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-500 space-y-5 relative overflow-hidden">
            
            {/* Top countdown progress bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-slate-100">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${(countdownSeconds / 25) * 100}%` }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-600 animate-ping" />
                <span className="text-xs font-display font-black text-orange-600 uppercase tracking-wider">
                  GOLAGHAT RIDE ALERT ({countdownSeconds}S)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-black text-emerald-800 font-mono-num">₹{incomingDriverRequest.finalFare}</span>
                <span className="text-[10px] text-slate-500 block font-display font-black uppercase">Est. Payout</span>
              </div>
            </div>

            {/* Customer & Route info */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/80">
                <span className="font-display font-black text-slate-950 text-sm">{incomingDriverRequest.customerName}</span>
                <span className="font-display font-black text-orange-600 uppercase tracking-wider font-mono-num">{incomingDriverRequest.distanceKm} km route</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-2 ring-emerald-200" />
                  <div>
                    <span className="text-[10px] text-emerald-900 font-display font-black uppercase tracking-wider">Pickup</span>
                    <p className="font-bold text-slate-900 leading-snug">{incomingDriverRequest.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0 ring-2 ring-orange-200" />
                  <div>
                    <span className="text-[10px] text-orange-900 font-display font-black uppercase tracking-wider">Destination</span>
                    <p className="font-bold text-slate-900 leading-snug">{incomingDriverRequest.destination.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accept / Decline Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => driverRejectRide(incomingDriverRequest.id)}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-display font-black uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
              >
                DECLINE
              </button>
              <button
                onClick={() => driverAcceptRide(incomingDriverRequest.id)}
                className="py-3.5 bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white text-xs font-display font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition-transform active:scale-95 cursor-pointer"
              >
                ACCEPT RIDE ({countdownSeconds}S)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Chat Modal */}
      <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />

      {/* Mandatory Driver Admin Fee Modal */}
      <DriverFeeModal 
        isOpen={showFeeModal} 
        onClose={() => setShowFeeModal(false)} 
        reason={isFeeLocked ? `Duty is locked due to pending mandatory platform fee of ₹${dueAmount || feeRate}. Scan Admin QR Code to resume service.` : undefined}
      />

    </div>
  );
};
