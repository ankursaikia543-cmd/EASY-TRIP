import React, { useState } from 'react';
import { 
  Compass, 
  PhoneCall, 
  MessageSquare, 
  ShieldAlert, 
  MapPin, 
  Flag, 
  Star, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  RotateCcw,
  Navigation,
  KeyRound
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { ChatModal } from '../common/ChatModal';
import { SOSModal } from '../common/SOSModal';
import { PaymentRatingModal } from './PaymentRatingModal';

export const ActiveRideTracker: React.FC = () => {
  const { activeRide, cancelRide } = useRide();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [showChat, setShowChat] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  if (!activeRide) return null;

  const handleConfirmCancel = async () => {
    await cancelRide(activeRide.id, cancelReason);
    setShowCancelModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Top Status Progress Bar Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Trip #{activeRide.id.replace('ride-', '').substring(0, 8)}
            </span>
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
              activeRide.status === 'searching' ? 'bg-amber-100 text-amber-800 animate-pulse' :
              activeRide.status === 'driver_assigned' ? 'bg-blue-100 text-blue-800' :
              activeRide.status === 'arrived' ? 'bg-purple-100 text-purple-800' :
              activeRide.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
              activeRide.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {activeRide.status === 'searching' && '🔍 Finding Driver'}
              {activeRide.status === 'driver_assigned' && '🚗 Driver En Route'}
              {activeRide.status === 'arrived' && '📍 Driver Arrived at Pickup'}
              {activeRide.status === 'in_progress' && '🚀 Ride in Progress'}
              {activeRide.status === 'completed' && '✅ Trip Completed'}
              {activeRide.status === 'cancelled' && '❌ Cancelled'}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            {activeRide.status === 'searching' && 'Matching your ride with top nearby drivers...'}
            {activeRide.status === 'driver_assigned' && `${activeRide.driverName} is heading to your pickup`}
            {activeRide.status === 'arrived' && 'Your driver is waiting outside!'}
            {activeRide.status === 'in_progress' && `Heading towards ${activeRide.destination.address.split(',')[0]}`}
            {activeRide.status === 'completed' && 'You have reached your destination!'}
            {activeRide.status === 'cancelled' && 'This ride was cancelled'}
          </h2>
        </div>

        {/* SOS Emergency Button */}
        {(activeRide.status === 'driver_assigned' || activeRide.status === 'arrived' || activeRide.status === 'in_progress') && (
          <button
            onClick={() => setShowSOS(true)}
            className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>24/7 EMERGENCY SOS</span>
          </button>
        )}
      </div>

      {/* Main Layout: Left Status Card & Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Driver / Ride Details Box */}
        <div className="lg:col-span-5 space-y-5">

          {/* 1. Searching Sonar Animation Card */}
          {activeRide.status === 'searching' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-6">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/40">
                  <Compass className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">Broadcasting Request</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Contacting verified {activeRide.vehicleType.toUpperCase()} drivers within 3 km of your pickup point.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle Type:</span>
                  <span className="font-bold text-slate-800 uppercase">{activeRide.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Fare:</span>
                  <span className="font-extrabold text-blue-600">₹{activeRide.finalFare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance:</span>
                  <span className="font-bold text-slate-800">{activeRide.distanceKm} km</span>
                </div>
              </div>

              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel Request
              </button>
            </div>
          )}

          {/* 2. Driver Assigned / Arrived / In-Progress Card */}
          {(activeRide.status === 'driver_assigned' || activeRide.status === 'arrived' || activeRide.status === 'in_progress') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              
              {/* Driver Profile Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={activeRide.driverPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={activeRide.driverName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-600 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{activeRide.driverName}</h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{activeRide.driverRating || 4.88} (180+ rides)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeRide.vehicleBrand} {activeRide.vehicleModel} • {activeRide.vehicleColor}
                    </p>
                  </div>
                </div>

                {/* Vehicle Plate Number Badge */}
                <div className="text-right">
                  <div className="px-3 py-1.5 bg-yellow-300 border-2 border-slate-900 rounded-lg font-mono font-black text-xs text-slate-950 shadow-xs">
                    {activeRide.vehicleNumber || 'DL 01 AB 7890'}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 block">Verified Plate</span>
                </div>
              </div>

              {/* 4-Digit Ride PIN/OTP Display Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center justify-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Your 4-Digit Ride Start PIN (OTP)
                </span>
                <div className="text-3xl font-black tracking-widest text-blue-700 font-mono py-1">
                  {activeRide.otp}
                </div>
                <p className="text-[11px] text-slate-500">
                  Share this PIN with your driver upon entering to start your trip safely.
                </p>
              </div>

              {/* Action Buttons: Call, Chat */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${activeRide.driverPhone || '+919988776655'}`}
                  className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>Call Driver</span>
                </a>
                <button
                  onClick={() => setShowChat(true)}
                  className="py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-blue-200"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Live Chat</span>
                </button>
              </div>

              {/* Route Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup Point</span>
                    <p className="font-medium text-slate-800 leading-snug">{activeRide.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Drop-off Destination</span>
                    <p className="font-medium text-slate-800 leading-snug">{activeRide.destination.address}</p>
                  </div>
                </div>
              </div>

              {/* Fare & Cancel Bar */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Upfront Fare</span>
                  <div className="text-xl font-extrabold text-slate-900">₹{activeRide.finalFare}</div>
                </div>
                {activeRide.status !== 'in_progress' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Ride
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. Completed State Banner */}
          {activeRide.status === 'completed' && (
            <PaymentRatingModal />
          )}

          {/* 4. Cancelled State Banner */}
          {activeRide.status === 'cancelled' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Ride Cancelled</h3>
              <p className="text-xs text-slate-500">
                Reason: {activeRide.cancellationReason || 'Cancelled by user.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Book Another Ride
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Map with Moving Driver Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <InteractiveMap
            pickup={activeRide.pickup}
            destination={activeRide.destination}
            driverLocation={activeRide.driverLocation}
            vehicleType={activeRide.vehicleType}
            status={activeRide.status}
            heightClass="h-[460px] sm:h-[560px]"
          />
        </div>

      </div>

      {/* Modals */}
      <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />
      <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} />

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900">Cancel this Ride?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Drivers commit time and fuel when heading for pickup. Please choose a reason:
              </p>
            </div>

            <div className="space-y-2">
              {[
                'Change of plans / booked by mistake',
                'Driver is taking too long to arrive',
                'Driver asked me to cancel',
                'Entered incorrect pickup address',
              ].map((r, idx) => (
                <label
                  key={idx}
                  className={`block p-2.5 rounded-xl border text-xs cursor-pointer font-medium transition-all ${
                    cancelReason === r ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={cancelReason === r}
                    onChange={e => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  {r}
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Keep Ride
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
