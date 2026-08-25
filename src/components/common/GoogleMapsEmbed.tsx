import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Compass,
  Search,
  Building
} from 'lucide-react';
import { LocationPoint } from '../../types';
import { ALL_ASSAM_LOCATIONS, LocationItem } from '../../utils/locationDatabase';

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
  const [activeRegionTab, setActiveRegionTab] = useState<'all' | 'golaghat' | 'jorhat' | 'guwahati' | 'dibrugarh' | 'outstation'>('golaghat');
  const [activePinPrompt, setActivePinPrompt] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
    tag?: string;
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

  const displayedLocations = ALL_ASSAM_LOCATIONS.filter(item => {
    if (activeRegionTab === 'all') return true;
    if (activeRegionTab === 'golaghat') return item.region === 'golaghat';
    if (activeRegionTab === 'jorhat') return item.region === 'jorhat';
    if (activeRegionTab === 'guwahati') return item.region === 'guwahati';
    if (activeRegionTab === 'dibrugarh') return item.region === 'dibrugarh';
    if (activeRegionTab === 'outstation') return item.region !== 'golaghat';
    return true;
  });

  const handleQuickSelect = (loc: LocationItem) => {
    setSelectedQuickLoc(loc.name);
    setActivePinPrompt({
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
      tag: loc.tag,
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
            {pickup && destination ? `${pickup.city || 'Pickup'} ➔ ${destination.city || 'Drop'}` : pickup ? `Pickup: ${pickup.city || pickup.address.split(',')[0]}` : 'Assam Live Google Map'}
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
        title="Assam Google Map"
        src={embedUrl}
        className="w-full h-full border-0 grayscale-[5%] contrast-[105%]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Bottom Quick-Select Chips Bar for Micro-Areas & Cities */}
      <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-700 shadow-xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
            <div className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-orange-400" />
              <span>Map Locations (Golaghat, Jorhat, Guwahati, Dibrugarh & Outstation):</span>
            </div>
            <span className="text-slate-300 font-normal hidden sm:inline">Tap any point to set Pickup or Drop</span>
          </div>

          {/* Region Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: 'golaghat', label: '📍 Golaghat & Villages' },
              { key: 'jorhat', label: '🚗 Jorhat Hubs' },
              { key: 'guwahati', label: '✈️ Guwahati Hubs' },
              { key: 'dibrugarh', label: '🏥 Dibrugarh Hubs' },
              { key: 'outstation', label: '🛣️ All Outstations' },
              { key: 'all', label: '🌟 All (100+)' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveRegionTab(tab.key as any)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeRegionTab === tab.key
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Horizontal scrollable Location Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5">
            {displayedLocations.map(loc => (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleQuickSelect(loc)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  selectedQuickLoc === loc.name
                    ? 'bg-emerald-500 text-slate-950 shadow-xs scale-105'
                    : 'bg-white/10 hover:bg-white/25 text-white border border-white/10'
                }`}
              >
                <span>{loc.category === 'airport' ? '✈️' : loc.category === 'railway' ? '🚆' : loc.category === 'hospital' ? '🏥' : '📍'}</span>
                <span>{loc.name}</span>
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
              {activePinPrompt.tag && (
                <span className="inline-block mt-1 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                  {activePinPrompt.tag}
                </span>
              )}
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

