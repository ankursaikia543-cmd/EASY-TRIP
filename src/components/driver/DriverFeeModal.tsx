import React from 'react';
import { X, AlertOctagon, ShieldAlert, Sparkles, IndianRupee } from 'lucide-react';
import { AdminUpiQrCard } from './AdminUpiQrCard';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';

interface DriverFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const DriverFeeModal: React.FC<DriverFeeModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const { driverProfile } = useAuth();
  const { platformSettings } = useRide();

  if (!isOpen) return null;

  const isCab = driverProfile?.vehicleType === 'cab';
  const feeAmount = isCab 
    ? (platformSettings.driverAdminFeeCab || 50) 
    : (platformSettings.driverAdminFeeBikeAuto || 5);
  
  const due = driverProfile?.feeDueAmount && driverProfile.feeDueAmount > 0 
    ? driverProfile.feeDueAmount 
    : feeAmount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full my-8 shadow-2xl border-2 border-orange-500 overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-orange-600 to-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-black text-base uppercase tracking-wider">
                Mandatory Admin Platform Fee
              </h3>
              <p className="text-[11px] text-orange-100 font-medium">
                {isCab ? 'EASY Cab Partner (₹50 / booking)' : 'EASY Bike & Auto Partner (₹5 / booking)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Info */}
        <div className="p-6 space-y-5">
          
          <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 text-rose-950">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold">
                {reason || 'Driver App Service Locked Until Fee Payment'}
              </h4>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                As per EASY TRIP platform policy, every driver partner must pay the mandatory platform fee to the Admin:
                <strong className="block mt-0.5 font-black text-rose-950">
                  • EASY Bike & EASY Auto: ₹5 per booking / regular fee<br />
                  • EASY Cab: ₹50 per customer booking
                </strong>
                If this fee is unpaid, the driver app is restricted from going online or receiving new passenger bookings. Scan the official Google Pay QR below to unlock duty immediately.
              </p>
            </div>
          </div>

          {/* Embedded GPay Card */}
          <AdminUpiQrCard 
            customAmount={due} 
            onSuccess={() => {
              setTimeout(onClose, 800);
            }} 
          />

        </div>

      </div>
    </div>
  );
};
