import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Star, 
  Calendar, 
  IndianRupee, 
  MessageSquareQuote,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';

export const DriverRides: React.FC = () => {
  const { allRides } = useRide();
  const { driverProfile } = useAuth();

  const driverTrips = allRides.filter(r => 
    !driverProfile || r.driverId === driverProfile.id || r.driverId === 'drv-1'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Driver Trip Logs & Reviews</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review customer ratings, compliments, and trip payout history.
        </p>
      </div>

      {driverTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <Navigation className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No trips completed yet</h3>
          <p className="text-xs text-slate-500">Go Online on the dashboard to start receiving booking requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {driverTrips.map(trip => {
            const dateStr = new Date(trip.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {trip.vehicleType === 'bike' ? '🏍️' : trip.vehicleType === 'auto' ? '🛺' : '🚕'}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {trip.customerName} • {trip.distanceKm} km
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">{dateStr}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">₹{trip.finalFare}</div>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Paid via {trip.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup</span>
                      <p className="font-medium text-slate-800 line-clamp-1">{trip.pickup.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Drop-off</span>
                      <p className="font-medium text-slate-800 line-clamp-1">{trip.destination.address}</p>
                    </div>
                  </div>
                </div>

                {/* Rating & feedback from customer */}
                {trip.rating && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-600 font-bold shrink-0 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{trip.rating}.0</span>
                    </div>
                    {trip.review && (
                      <p className="text-amber-900 font-medium italic">
                        "{trip.review}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
