import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  const { activeRide } = useRide();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [sosTriggered, setSosTriggered] = useState(false);

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    setSosTriggered(true);
    addNotification(
      '🚨 EMERGENCY SOS DISPATCHED',
      `Live GPS coordinates (${activeRide?.pickup.lat.toFixed(4)}, ${activeRide?.pickup.lng.toFixed(4)}) transmitted to Police (112) & EASY TRIP 24/7 Safety Command Center.`,
      'emergency',
      activeRide?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 relative overflow-hidden">
        
        {/* Red accent glow top banner */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-red-600 to-rose-600" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-2">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            Emergency SOS Safety Assist
          </h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Your safety is our highest priority. Press below if you feel unsafe or in case of an accident.
          </p>
        </div>

        {sosTriggered ? (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Safety Protocol Active</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1.5 leading-relaxed">
              1. Local Police Station notified via Police Helpline 112.<br />
              2. Live vehicle tracking shared with your emergency contact: <strong>{user?.emergencyContact || '+91 98111 22334'}</strong>.<br />
              3. EASY TRIP Safety Executive is calling your registered phone now.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="tel:112"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20"
              >
                <PhoneCall className="w-4 h-4" />
                Call Police 112 Directly
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleTriggerSOS}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-xl shadow-red-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <AlertTriangle className="w-5 h-5" />
              PRESS FOR EMERGENCY SOS
            </button>

            <a
              href="tel:112"
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-red-600" />
              National Emergency Call (112)
            </a>

            <p className="text-[11px] text-slate-400 text-center">
              Misuse of SOS trigger is subject to verification. Live GPS telemetry is attached to this trip.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
