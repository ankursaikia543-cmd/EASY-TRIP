import React from 'react';
import { MapPin, KeyRound, IndianRupee, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onBookNow: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBookNow }) => {
  const steps = [
    {
      step: '01',
      title: 'Choose Destination & Ride Type',
      desc: 'Type your pickup and destination in the app or choose a landmark shortcut. Review clear upfront estimates across Bike, Auto, and Cab options.',
      icon: '📍',
    },
    {
      step: '02',
      title: 'Match With Verified Nearby Driver',
      desc: 'Our real-time algorithm matches you with the nearest driver. Track their live GPS approach on the interactive map with exact arrival countdowns.',
      icon: '🚗',
    },
    {
      step: '03',
      title: 'Verify 4-Digit Ride PIN (OTP)',
      desc: 'Step into your assigned vehicle and share your unique 4-digit PIN with the driver. The trip will only begin once verified on the driver app.',
      icon: '🔒',
    },
    {
      step: '04',
      title: 'Seamless Digital Settlement & Rating',
      desc: 'Arrive smoothly at your destination. Pay effortlessly via UPI QR scan, Wallet, or direct Cash, and rate your driver with custom compliment tags.',
      icon: '✨',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12 animate-in fade-in">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          User Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How EASY TRIP Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Simple 4-step ride booking designed for simplicity, safety, and speed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map(s => (
          <div
            key={s.step}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{s.icon}</span>
              <span className="text-3xl font-black text-slate-100 font-mono">
                {s.step}
              </span>
            </div>

            <h3 className="font-extrabold text-base text-slate-900">{s.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <button
          onClick={onBookNow}
          className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xl shadow-blue-600/30 inline-flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>TRY BOOKING A RIDE NOW</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
