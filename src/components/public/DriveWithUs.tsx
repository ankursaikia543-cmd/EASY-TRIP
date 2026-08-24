import React, { useState } from 'react';
import { 
  Car, 
  CheckCircle2, 
  IndianRupee, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VehicleType } from '../../types';

interface DriveWithUsProps {
  onRegistered: () => void;
}

export const DriveWithUs: React.FC<DriveWithUsProps> = ({ onRegistered }) => {
  const { loginAsRole, updateDriverProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('auto');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Switch user to Driver role and register info
      loginAsRole('driver');
      updateDriverProfile({
        name: name.trim() || 'New Driver Partner',
        phone: phone.trim() || '+91 99887 76655',
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase() || 'DL 01 AB 7890',
        licenseNumber: licenseNumber.trim().toUpperCase() || 'DL-042019001234',
        approvalStatus: 'approved', // Auto-approved for frictionless demo testing
        onlineStatus: 'online',
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onRegistered();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Partner Program
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Drive with EASY TRIP & Earn Daily
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Lowest 15% platform commission in the industry. Earn up to ₹35,000/month with flexible hours and instant 24/7 bank withdrawals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Driver Onboarding Registration (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900">Sign Up as Driver Partner</h3>
            <p className="text-xs text-slate-500 mt-0.5">Fill out your basic details to start receiving trips.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (For Trip Alerts)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Vehicle Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bike', 'auto', 'cab'] as VehicleType[]).map(vt => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setVehicleType(vt)}
                    className={`p-2.5 rounded-xl border text-xs font-black uppercase flex flex-col items-center gap-1 transition-all ${
                      vehicleType === vt
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">
                      {vt === 'bike' ? '🏍️' : vt === 'auto' ? '🛺' : '🚕'}
                    </span>
                    <span>{vt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Plate Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="DL 01 AB 7890"
                  required
                  className="w-full p-2.5 bg-yellow-50 border border-yellow-300 rounded-xl text-xs font-mono font-black text-slate-900 uppercase focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                  placeholder="DL-042019001234"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Registering Driver Profile...</span>
              ) : (
                <>
                  <span>REGISTER AS DRIVER PARTNER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {submitted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Registration approved! Launching Driver Duty Terminal...</span>
            </div>
          )}
        </div>

        {/* Right Benefits & Earnings Table (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-black">Why Drive with EASY TRIP?</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Lowest 15% Platform Commission</h4>
                  <p className="text-slate-400 mt-0.5">Keep 85% of all trip fares. Other aggregator apps charge 25–30%.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Instant 24/7 Bank Payouts</h4>
                  <p className="text-slate-400 mt-0.5">Transfer your earnings to your bank account anytime with 1 click via IMPS/UPI.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">High Demand & Transparent Dispatch</h4>
                  <p className="text-slate-400 mt-0.5">Direct fair round-robin dispatch with upfront drop-off location before accepting.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <div className="text-2xl font-black text-slate-900">₹35,000+</div>
              <span className="text-[11px] text-slate-500 font-medium">Avg. Monthly Partner Earnings</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <div className="text-2xl font-black text-slate-900">10,000+</div>
              <span className="text-[11px] text-slate-500 font-medium">Daily Rides Completed</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
