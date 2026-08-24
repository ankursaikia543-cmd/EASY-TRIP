import React from 'react';
import { ShieldCheck, ShieldAlert, PhoneCall, KeyRound, Lock, Eye, AlertTriangle } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12 animate-in fade-in">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Safety First Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Your Safety Is Non-Negotiable
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          From verified driver background vetting to live GPS trip telemetry and instantaneous SOS police dispatch, discover our multi-layered safety standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feature 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">National Police 112 SOS Command</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In any uncomfortable or emergency scenario, pressing the in-app SOS button instantly transmits vehicle telemetry, driver license details, and exact GPS coordinates to local police and your emergency contacts.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Cryptographic 4-Digit Ride PIN (OTP)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every booking generates a dynamic 4-digit security PIN. The driver cannot initiate the trip on their terminal without entering your PIN, guaranteeing you board the right vehicle every time.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">100% Verified Driver KYC</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All driver partners undergo strict government document validation: Driving License, Commercial/Private RC Book, and Vehicle Insurance before being authorized to accept trips.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">In-App Masked Audio & Encrypted Chat</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your personal phone number is never exposed to drivers during coordination calls. All in-app chat logs are encrypted and retained strictly during active trips for safety monitoring.
          </p>
        </div>

      </div>

      {/* Emergency Contact Strip */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h4 className="text-lg font-extrabold">Have a safety question or concern?</h4>
          <p className="text-xs text-slate-400 mt-1">Our dedicated 24/7 Safety Command Center is always ready to assist.</p>
        </div>
        <a
          href="tel:112"
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Safety Helpline 112</span>
        </a>
      </div>

    </div>
  );
};
