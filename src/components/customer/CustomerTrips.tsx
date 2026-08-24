import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Flag, 
  Calendar, 
  Printer, 
  Star, 
  AlertCircle, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { Ride } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

interface CustomerTripsProps {
  onRebook?: () => void;
  onRaiseDispute?: (rideId: string) => void;
}

export const CustomerTrips: React.FC<CustomerTripsProps> = ({ onRebook, onRaiseDispute }) => {
  const { allRides } = useRide();
  const { user } = useAuth();
  const [selectedRideForReceipt, setSelectedRideForReceipt] = useState<Ride | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');

  const myRides = allRides.filter(r => 
    !user || r.customerId === user.id || r.customerId === 'user-cust-1'
  );

  const filteredRides = myRides.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return r.status === 'completed';
    if (filterStatus === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Ride History</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View receipts, rate past drivers, or raise fare queries.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({myRides.length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'cancelled' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Trips List */}
      {filteredRides.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <Navigation className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No rides found in this category</h3>
          <p className="text-xs text-slate-500">Book your first ride across bikes, autos, and cabs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRides.map(ride => {
            const dateStr = new Date(ride.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ride.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {ride.vehicleType === 'bike' ? '🏍️' : ride.vehicleType === 'auto' ? '🛺' : '🚕'}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                        EASY {ride.vehicleType} • {ride.distanceKm} km
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">₹{ride.finalFare}</div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      ride.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ride.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {ride.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {ride.status === 'cancelled' && <XCircle className="w-3 h-3 text-rose-600" />}
                      <span className="capitalize">{ride.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                {/* Pickup & Destination Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup</span>
                      <p className="font-medium text-slate-800 line-clamp-1">{ride.pickup.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Destination</span>
                      <p className="font-medium text-slate-800 line-clamp-1">{ride.destination.address}</p>
                    </div>
                  </div>
                </div>

                {/* Driver & Rating bar */}
                {ride.driverName && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={ride.driverPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={ride.driverName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <span className="font-bold text-slate-900">{ride.driverName}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5 font-mono">{ride.vehicleNumber}</span>
                      </div>
                    </div>

                    {ride.rating ? (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{ride.rating}.0</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not rated</span>
                    )}
                  </div>
                )}

                {/* Action CTA Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {ride.status === 'completed' && (
                    <button
                      onClick={() => setSelectedRideForReceipt(ride)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Invoice
                    </button>
                  )}
                  {onRaiseDispute && (
                    <button
                      onClick={() => onRaiseDispute(ride.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Report Issue
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Receipt Modal */}
      <ReceiptModal
        ride={selectedRideForReceipt}
        isOpen={Boolean(selectedRideForReceipt)}
        onClose={() => setSelectedRideForReceipt(null)}
      />
    </div>
  );
};
