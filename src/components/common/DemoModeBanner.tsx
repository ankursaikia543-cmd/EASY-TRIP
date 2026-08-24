import React from 'react';
import { Sparkles, Users, Car, Shield, RotateCcw, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { useNotifications } from '../../context/NotificationContext';

export const DemoModeBanner: React.FC = () => {
  const { user, loginAsRole } = useAuth();
  const { resetAllDemoData } = useRide();
  const { addNotification } = useNotifications();

  return (
    <aside aria-label="Demo Mode Controls" className="bg-slate-900 border-b border-emerald-950 text-slate-300 text-xs py-2 px-4 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left Indicator with Golaghat Assam badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Golaghat District, Assam
          </span>
          <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">
            Active Hubs: Bokakhat • Kohora • Numaligarh • Dergaon • Golaghat Town • Bokajan
          </span>
        </div>

        {/* Quick Role Switch Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">Role:</span>
          
          <button
            onClick={() => {
              loginAsRole('customer');
              addNotification('Switched to Customer', 'Viewing platform as Passenger Ankur Saikia (Bokakhat).', 'system');
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              user?.role === 'customer'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Customer (Ankur)</span>
          </button>

          <button
            onClick={() => {
              loginAsRole('driver');
              addNotification('Switched to Driver', 'Viewing platform as Driver Partner Pranjal Bora (Cab).', 'system');
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              user?.role === 'driver'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Driver (Pranjal)</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Reset Demo button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo rides and balances to Golaghat District Assam defaults?')) {
                resetAllDemoData();
                addNotification('Demo Data Reset', 'Refreshed all rides & balances to Bokakhat defaults.', 'system');
              }
            }}
            title="Reset simulation data to defaults"
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
