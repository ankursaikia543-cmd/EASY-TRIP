import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Building2, 
  Info,
  CheckCircle2,
  Sparkles,
  Map as MapIcon,
  Compass
} from 'lucide-react';
import { LocationPoint } from '../../types';
import { GOLAGHAT_TOWNS, POPULAR_LOCATIONS, GOLAGHAT_GAON_PANCHAYATS } from '../../utils/initialData';

interface GoogleMapsProps {
  pickup?: LocationPoint;
  destination?: LocationPoint;
  onSelectPickup?: (point: LocationPoint) => void;
  onSelectDestination?: (point: LocationPoint) => void;
  heightClass?: string;
  className?: string;
}

export const GoogleMapsEmbed: React.FC<GoogleMapsProps> = ({
  pickup,
  destination,
  onSelectPickup,
  onSelectDestination,
  heightClass = 'h-80 sm:h-96',
  className = '',
}) => {
  const [mapType, setMapType] = useState<'m' | 'k' | 'p'>('m'); // m: roadmap, k: satellite, p: terrain
  const [zoom, setZoom] = useState<number>(12);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [selectedQuickLoc, setSelectedQuickLoc] = useState<string | null>(null);
  const [activePinPrompt, setActivePinPrompt] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Center coordinates calculation
  const centerLat = pickup ? pickup.lat : destination ? destination.lat : 26.5925; // Default Bokakhat
  const centerLng = pickup ? pickup.lng : destination ? destination.lng : 93.5937;

  // Generate Google Maps live embed query
  const mapQuery = destination && pickup
    ? `${encodeURIComponent(pickup.address || 'Bokakhat, Assam')} to ${encodeURIComponent(destination.address || 'Golaghat, Assam')}`
    : pickup
    ? encodeURIComponent(pickup.address || `${centerLat},${centerLng}`)
    : destination
    ? encodeURIComponent(destination.address || `${centerLat},${centerLng}`)
    : encodeURIComponent('Golaghat District, Assam');

  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = destination && pickup
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup.address || `${pickup.lat},${pickup.lng}`)}&destination=${encodeURIComponent(destination.address || `${destination.lat},${destination.lng}`)}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickup?.address || destination?.address || 'Golaghat, Assam')}`;

  const handleQuickSelect = (loc: { name: string; lat: number; lng: number; landmark: string }) => {
    setSelectedQuickLoc(loc.name);
    setActivePinPrompt({
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      address: `${loc.name}, ${loc.landmark}, Golaghat District, Assam`,
    });
  };

  const setAsPickup = () => {
    if (!activePinPrompt || !onSelectPickup) return;
    onSelectPickup({
      address: activePinPrompt.address,
      lat: activePinPrompt.lat,
      lng: activePinPrompt.lng,
      city: activePinPrompt.name,
    });
    setActivePinPrompt(null);
  };

  const setAsDestination = () => {
    if (!activePinPrompt || !onSelectDestination) return;
    onSelectDestination({
      address: activePinPrompt.address,
      lat: activePinPrompt.lat,
      lng: activePinPrompt.lng,
      city: activePinPrompt.name,
    });
    setActivePinPrompt(null);
  };

  return (
    <div className={`relative w-full ${isFullScreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-slate-950 p-2 sm:p-4' : `${heightClass} rounded-3xl`} overflow-hidden border border-emerald-200 shadow-md bg-slate-900 flex flex-col ${className}`}>
      
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* District & Location Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md text-xs font-black text-slate-900">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[200px]">
            {pickup ? `Pickup: ${pickup.address.split(',')[0]}` : 'Golaghat Live Google Map'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md text-xs font-bold">
          
          {/* Map Layer Switcher */}
          <button
            type="button"
            onClick={() => setMapType(mapType === 'm' ? 'k' : mapType === 'k' ? 'p' : 'm')}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
            title="Switch Map Type: Road / Satellite / Terrain"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize">{mapType === 'm' ? 'Road' : mapType === 'k' ? 'Satellite' : 'Terrain'}</span>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(prev - 1, 7))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
            title={isFullScreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5 text-orange-600" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          {/* Open in Google Maps App */}
          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 cursor-pointer flex items-center"
            title="Open in Google Maps Application"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>
      </div>

      {/* Embedded Live Google Maps Iframe */}
      <iframe
        title="Golaghat District Google Map"
        src={embedUrl}
        className="w-full h-full border-0 grayscale-[10%] contrast-[105%]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Bottom Quick-Select Chips Bar for Short Distance Precision */}
      <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md rounded-2xl p-2 border border-slate-700 shadow-xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
            <div className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-orange-400" />
              <span>Golaghat District Short Distance Hubs & Landmarks:</span>
            </div>
            <span className="text-slate-400 font-normal">Tap point to set Pickup or Drop</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {GOLAGHAT_TOWNS.map(town => (
              <button
                key={town.id}
                type="button"
                onClick={() => handleQuickSelect(town)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedQuickLoc === town.name
                    ? 'bg-emerald-500 text-slate-950 shadow-xs scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                📍 {town.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Selected Action Modal / Pin Popup */}
      {activePinPrompt && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-300 max-w-xs w-full animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h4 className="font-display font-black text-xs text-slate-950">{activePinPrompt.name}</h4>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{activePinPrompt.address}</p>
            </div>
            <button
              type="button"
              onClick={() => setActivePinPrompt(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              type="button"
              onClick={setAsPickup}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Set Pickup</span>
            </button>

            <button
              type="button"
              onClick={setAsDestination}
              className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Set Drop</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
