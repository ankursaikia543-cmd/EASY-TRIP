import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Flag, 
  Car, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Info
} from 'lucide-react';
import { LocationPoint, VehicleType } from '../../types';

interface InteractiveMapProps {
  pickup?: LocationPoint;
  destination?: LocationPoint;
  driverLocation?: { lat: number; lng: number; bearing?: number };
  vehicleType?: VehicleType;
  status?: string;
  heightClass?: string;
  interactive?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  destination,
  driverLocation,
  vehicleType = 'cab',
  status,
  heightClass = 'h-72 sm:h-96',
  interactive = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'vector' | 'satellite'>('vector');
  const [showKeyInfo, setShowKeyInfo] = useState<boolean>(false);

  // Safe defaults if coordinates missing: Bokakhat (Main Office) & Golaghat Town
  const pLat = pickup?.lat || 26.5925;
  const pLng = pickup?.lng || 93.5937;
  const dLat = destination?.lat || 26.5186;
  const dLng = destination?.lng || 93.9688;

  const drvLat = driverLocation?.lat || (pLat - 0.006);
  const drvLng = driverLocation?.lng || (pLng - 0.005);

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-emerald-200/80 shadow-inner bg-slate-900 select-none group`}>
      
      {/* Map Background Canvas */}
      <div 
        className={`absolute inset-0 transition-transform duration-300 ${
          mapStyle === 'satellite' 
            ? 'bg-slate-950' 
            : 'bg-[#f0fdf4]'
        }`}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* SVG Street Grid & Golaghat District Assam Route Network */}
        <svg className="w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="streetGridAssam" width="90" height="90" patternUnits="userSpaceOnUse">
              <rect width="90" height="90" fill={mapStyle === 'satellite' ? '#0f172a' : '#f0fdf4'} />
              <rect x="0" y="0" width="86" height="86" fill={mapStyle === 'satellite' ? '#1e293b' : '#ffffff'} rx="8" />
              {/* Road line network */}
              <line x1="0" y1="45" x2="90" y2="45" stroke={mapStyle === 'satellite' ? '#334155' : '#dcfce7'} strokeWidth="5" />
              <line x1="45" y1="0" x2="45" y2="90" stroke={mapStyle === 'satellite' ? '#334155' : '#dcfce7'} strokeWidth="5" />
            </pattern>
            <linearGradient id="routeGradientGreenOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <filter id="glowGreenOrange" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#22c55e" floodOpacity="0.5" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#streetGridAssam)" />

          {/* NH-37 Arterial Highway (Kaziranga - Bokakhat - Numaligarh - Dergaon Corridor) */}
          <path
            d="M 0 160 Q 220 70, 480 180 T 960 220"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#475569' : '#bbf7d0'}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text x="30" y="145" fill="#15803d" fontSize="10" fontWeight="bold" opacity="0.8">NH-37 (Kohora ↔ Bokakhat ↔ Dergaon)</text>

          {/* NH-39 Link (Numaligarh Junction to Golaghat Town & Bokajan) */}
          <path
            d="M 480 180 Q 560 300, 700 420"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#475569' : '#fed7aa'}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <text x="560" y="320" fill="#c2410c" fontSize="10" fontWeight="bold" opacity="0.8">NH-39 (Numaligarh ↔ Golaghat Town ↔ Bokajan)</text>

          {/* Active Navigation Route Path */}
          {destination && (
            <>
              {/* Route shadow */}
              <path
                d="M 160 210 C 240 160, 320 180, 420 130 S 560 170, 680 110"
                fill="none"
                stroke="#15803d"
                strokeWidth="10"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />
              {/* Active Route line in Light Green & Orange */}
              <path
                d="M 160 210 C 240 160, 320 180, 420 130 S 560 170, 680 110"
                fill="none"
                stroke="url(#routeGradientGreenOrange)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowGreenOrange)"
              />
              {/* Animated pulse trail */}
              <path
                d="M 160 210 C 240 160, 320 180, 420 130 S 560 170, 680 110"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="8,12"
                strokeLinecap="round"
                className="animate-dash"
              />
            </>
          )}
        </svg>

        {/* 1. Pickup Point Marker (Light Green) */}
        <div className="absolute top-[52%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/pin z-20">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
            <div className="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
          </div>
          <div className="mt-1 px-2.5 py-1 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-md whitespace-nowrap border border-emerald-500/50">
            Pickup: {pickup?.address ? pickup.address.split(',')[0] : 'Bokakhat Chariali'}
          </div>
        </div>

        {/* 2. Destination Marker (Warm Orange Flag) */}
        {destination && (
          <div className="absolute top-[28%] left-[76%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-orange-400 opacity-60"></span>
              <div className="relative w-8 h-8 rounded-full bg-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <Flag className="w-4 h-4 fill-white" />
              </div>
            </div>
            <div className="mt-1 px-2.5 py-1 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-md whitespace-nowrap border border-orange-500/50">
              Drop: {destination.address ? destination.address.split(',')[0] : 'Golaghat Court Field'}
            </div>
          </div>
        )}

        {/* 3. Driver Live Vehicle Marker (Moving with bearing) */}
        {(status === 'driver_assigned' || status === 'arrived' || status === 'in_progress') && (
          <div 
            className="absolute top-[44%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 z-30"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-75"></span>
              <div className="w-10 h-10 rounded-full bg-emerald-600 border-3 border-white shadow-xl flex items-center justify-center text-white rotate-12 transition-transform">
                {vehicleType === 'bike' ? (
                  <Navigation className="w-5 h-5 fill-white rotate-45" />
                ) : (
                  <Car className="w-5 h-5 fill-white" />
                )}
              </div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-orange-600 text-white text-[10px] font-extrabold rounded-md shadow-md uppercase tracking-wider">
              {vehicleType} • Live Golaghat GPS
            </div>
          </div>
        )}
      </div>

      {/* Floating Map Overlays */}
      
      {/* Top Left Live Status Pill */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-200 shadow-md text-xs font-black text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Golaghat District Live GPS</span>
        </div>
      </div>

      {/* Top Right Controls (Zoom & Layer Toggle) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapStyle(prev => (prev === 'vector' ? 'satellite' : 'vector'))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Toggle map style"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowKeyInfo(!showKeyInfo)}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-orange-200 shadow-md flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
          title="District Hub Info"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info banner for Golaghat District Hubs */}
      {showKeyInfo && (
        <div className="absolute inset-x-3 bottom-3 z-40 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs border border-emerald-500/40 shadow-xl flex items-start justify-between gap-3 animate-in fade-in">
          <div>
            <p className="font-extrabold text-emerald-400">Golaghat District Transit Hubs</p>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              Serving: <strong>Bokakhat (Main Office)</strong>, <strong>Kohora (Kaziranga)</strong>, <strong>Numaligarh (NRL)</strong>, <strong>Dergaon</strong>, <strong>Golaghat Town</strong>, and <strong>Bokajan</strong>.
            </p>
          </div>
          <button 
            onClick={() => setShowKeyInfo(false)}
            className="text-slate-400 hover:text-white text-sm font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Center Route Stats Badge */}
      {destination && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 shadow-lg text-xs font-extrabold text-slate-900 flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-700">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>NH-37 / NH-39 Corridor</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200" />
          <span className="text-orange-600 font-bold">Fastest District Route</span>
        </div>
      )}
    </div>
  );
};
