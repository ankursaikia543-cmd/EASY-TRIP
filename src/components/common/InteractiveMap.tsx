import React, { useState, useMemo } from 'react';
import { 
  Navigation, 
  MapPin, 
  Flag, 
  Car, 
  Maximize2, 
  Minimize2, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Info,
  Compass,
  Search,
  CheckCircle2,
  Crosshair,
  Sparkles,
  Map as MapIcon,
  Building2,
  X
} from 'lucide-react';
import { LocationPoint, VehicleType } from '../../types';
import { GOLAGHAT_TOWNS, POPULAR_LOCATIONS, GOLAGHAT_GAON_PANCHAYATS, GaonPanchayat } from '../../utils/initialData';

interface InteractiveMapProps {
  pickup?: LocationPoint;
  destination?: LocationPoint;
  onSelectPickup?: (point: LocationPoint) => void;
  onSelectDestination?: (point: LocationPoint) => void;
  driverLocation?: { lat: number; lng: number; bearing?: number };
  vehicleType?: VehicleType;
  status?: string;
  heightClass?: string;
  interactive?: boolean;
}

// Golaghat District Bounding Box for GPS Normalization
// North: ~26.78 (Negheriting / Brahmaputra border), South: ~25.95 (Bokajan border)
// West: ~93.30 (Bagori / Kaziranga), East: ~94.05 (Dergaon / Kakodonga river)
const GOLAGHAT_BOUNDS = {
  minLat: 25.98,
  maxLat: 26.75,
  minLng: 93.32,
  maxLng: 94.02,
};

function latLngToPercent(lat: number, lng: number): { x: number; y: number } {
  // Clamp coordinates inside district boundary
  const clampedLat = Math.max(GOLAGHAT_BOUNDS.minLat, Math.min(GOLAGHAT_BOUNDS.maxLat, lat));
  const clampedLng = Math.max(GOLAGHAT_BOUNDS.minLng, Math.min(GOLAGHAT_BOUNDS.maxLng, lng));

  // Latitude: higher lat is North (top, y=0%)
  const y = ((GOLAGHAT_BOUNDS.maxLat - clampedLat) / (GOLAGHAT_BOUNDS.maxLat - GOLAGHAT_BOUNDS.minLat)) * 82 + 9;
  // Longitude: higher lng is East (right, x=100%)
  const x = ((clampedLng - GOLAGHAT_BOUNDS.minLng) / (GOLAGHAT_BOUNDS.maxLng - GOLAGHAT_BOUNDS.minLng)) * 84 + 8;

  return { x, y };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  destination,
  onSelectPickup,
  onSelectDestination,
  driverLocation,
  vehicleType = 'cab',
  status,
  heightClass = 'h-80 sm:h-96',
  interactive = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'vector' | 'satellite' | 'terrain'>('vector');
  const [showKeyInfo, setShowKeyInfo] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'all' | 'towns' | 'panchayats'>('all');
  const [selectedSubDiv, setSelectedSubDiv] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePinPopup, setActivePinPopup] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    landmark?: string;
    category?: string;
    villages?: string[];
    isGP?: boolean;
    x: number;
    y: number;
  } | null>(null);

  // Safe defaults if coordinates missing: Bokakhat (Main Office) & Golaghat Town
  const pLat = pickup?.lat || 26.5925;
  const pLng = pickup?.lng || 93.5937;
  const dLat = destination?.lat || 26.5186;
  const dLng = destination?.lng || 93.9688;

  const pickupPos = useMemo(() => latLngToPercent(pLat, pLng), [pLat, pLng]);
  const destPos = useMemo(() => (destination ? latLngToPercent(dLat, dLng) : null), [destination, dLat, dLng]);

  // Driver Location marker
  const drvLat = driverLocation?.lat || (pLat - 0.005);
  const drvLng = driverLocation?.lng || (pLng - 0.005);
  const driverPos = useMemo(() => latLngToPercent(drvLat, drvLng), [drvLat, drvLng]);

  // Filtered Towns & Hubs for map display
  const filteredTowns = useMemo(() => {
    if (viewMode === 'panchayats') return [];
    return GOLAGHAT_TOWNS.filter(town => {
      if (selectedSubDiv === 'all') return true;
      if (selectedSubDiv === 'bokakhat') return town.subDivision === 'Bokakhat';
      if (selectedSubDiv === 'golaghat') return town.subDivision === 'Golaghat Sadar';
      if (selectedSubDiv === 'dergaon') return town.subDivision === 'Dergaon';
      if (selectedSubDiv === 'dhansiri') return town.subDivision === 'Dhansiri';
      return true;
    });
  }, [selectedSubDiv, viewMode]);

  // Filtered Gaon Panchayats for map display
  const filteredGPs = useMemo(() => {
    if (viewMode === 'towns') return [];
    return GOLAGHAT_GAON_PANCHAYATS.filter(gp => {
      if (selectedSubDiv === 'all') return true;
      if (selectedSubDiv === 'bokakhat') return gp.block === 'bokakhat';
      if (selectedSubDiv === 'golaghat') return gp.block === 'golaghat_central';
      if (selectedSubDiv === 'dergaon') return gp.block === 'dergaon';
      if (selectedSubDiv === 'dhansiri') return gp.block === 'sarupathar' || gp.block === 'gomariguri';
      return true;
    });
  }, [selectedSubDiv, viewMode]);

  // Search Results for quick select
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { locMatches: [], gpMatches: [] };
    const q = searchQuery.toLowerCase();
    
    // Check popular locations and all Assam places
    const locMatches = POPULAR_LOCATIONS.filter(l => 
      l.address.toLowerCase().includes(q) || 
      (l.tag && l.tag.toLowerCase().includes(q))
    ).slice(0, 4);

    // Check Gaon Panchayats & Villages
    const gpMatches = GOLAGHAT_GAON_PANCHAYATS.filter(gp =>
      gp.name.toLowerCase().includes(q) ||
      gp.headquarter.toLowerCase().includes(q) ||
      gp.villages.some(v => v.toLowerCase().includes(q))
    ).slice(0, 4);

    return { locMatches, gpMatches };
  }, [searchQuery]);

  const handleTownClick = (town: typeof GOLAGHAT_TOWNS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = latLngToPercent(town.lat, town.lng);
    setActivePinPopup({
      name: town.name,
      address: `${town.name}, Golaghat District, Assam`,
      lat: town.lat,
      lng: town.lng,
      landmark: town.landmark,
      x: pos.x,
      y: pos.y,
    });
  };

  const handleGPClick = (gp: GaonPanchayat, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = latLngToPercent(gp.lat, gp.lng);
    setActivePinPopup({
      name: gp.name,
      address: `${gp.headquarter} (${gp.name}), ${gp.blockName}, Golaghat District`,
      lat: gp.lat,
      lng: gp.lng,
      landmark: `HQ: ${gp.headquarter} • ${gp.keyLandmarks}`,
      villages: gp.villages,
      isGP: true,
      x: pos.x,
      y: pos.y,
    });
  };

  const handleSetPickupFromPin = () => {
    if (!activePinPopup) return;
    if (onSelectPickup) {
      onSelectPickup({
        address: activePinPopup.address,
        lat: activePinPopup.lat,
        lng: activePinPopup.lng,
        city: activePinPopup.name,
      });
    }
    setActivePinPopup(null);
  };

  const handleSetDestinationFromPin = () => {
    if (!activePinPopup) return;
    if (onSelectDestination) {
      onSelectDestination({
        address: activePinPopup.address,
        lat: activePinPopup.lat,
        lng: activePinPopup.lng,
        city: activePinPopup.name,
      });
    }
    setActivePinPopup(null);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (onSelectPickup) {
            onSelectPickup({
              address: 'My Current Location (GPS Live)',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              city: 'Golaghat District',
            });
          }
        },
        () => {
          // Fallback to Bokakhat
          if (onSelectPickup) {
            onSelectPickup({
              address: 'Bokakhat Main Chariali (Near NRL Gate)',
              lat: 26.5925,
              lng: 93.5937,
              city: 'Bokakhat',
            });
          }
        }
      );
    }
  };

  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const percentX = Math.max(5, Math.min(95, clickX * 100));
    const percentY = Math.max(5, Math.min(95, clickY * 100));

    const normalizedLng = (percentX - 8) / 84;
    const normalizedLat = (percentY - 9) / 82;

    const calculatedLng = GOLAGHAT_BOUNDS.minLng + normalizedLng * (GOLAGHAT_BOUNDS.maxLng - GOLAGHAT_BOUNDS.minLng);
    const calculatedLat = GOLAGHAT_BOUNDS.maxLat - normalizedLat * (GOLAGHAT_BOUNDS.maxLat - GOLAGHAT_BOUNDS.minLat);

    // Find nearest landmark or town
    let nearest = GOLAGHAT_TOWNS[0];
    let minD = 9999;
    GOLAGHAT_TOWNS.forEach(t => {
      const d = Math.hypot(t.lat - calculatedLat, t.lng - calculatedLng);
      if (d < minD) {
        minD = d;
        nearest = t;
      }
    });

    const labelName = minD < 0.05 ? `Near ${nearest.name}` : `Location (${calculatedLat.toFixed(3)}°N, ${calculatedLng.toFixed(3)}°E)`;

    setActivePinPopup({
      name: labelName,
      address: `${labelName}, Golaghat District, Assam`,
      lat: Number(calculatedLat.toFixed(4)),
      lng: Number(calculatedLng.toFixed(4)),
      landmark: minD < 0.05 ? `Close to ${nearest.landmark}` : `Directly pinned on map (${calculatedLat.toFixed(3)}° N, ${calculatedLng.toFixed(3)}° E)`,
      x: percentX,
      y: percentY,
    });
  };

  return (
    <div 
      className={`relative w-full ${isFullScreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-slate-950 p-2 sm:p-4' : `${heightClass} rounded-3xl`} overflow-hidden border border-emerald-200 shadow-inner bg-slate-900 select-none group transition-all duration-300`}
    >
      
      {/* Top Search & Filter Bar (Shows on Interactive/Expanded Map) */}
      <div className="absolute top-3 left-3 right-14 z-30 flex flex-col gap-2">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* District Status Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md text-xs font-black text-slate-900 flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Golaghat District Map</span>
          </div>

          {/* View Mode Toggle: All / Towns / GPs */}
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl p-0.5 border border-emerald-200 shadow-md text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'all' ? 'bg-emerald-700 text-white font-black' : 'text-slate-700 hover:text-emerald-800'
              }`}
            >
              All Pins
            </button>
            <button
              type="button"
              onClick={() => setViewMode('towns')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'towns' ? 'bg-emerald-700 text-white font-black' : 'text-slate-700 hover:text-emerald-800'
              }`}
            >
              Towns ({filteredTowns.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('panchayats')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'panchayats' ? 'bg-orange-600 text-white font-black' : 'text-slate-700 hover:text-orange-800'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>GPs ({filteredGPs.length})</span>
            </button>
          </div>

          {/* Live Search Input for Golaghat Towns & Gaon Panchayats */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search GP, village, town, Kaziranga, NRL..."
                className="w-full pl-8 pr-7 py-1.5 text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete dropdown for search */}
            {(searchResults.locMatches.length > 0 || searchResults.gpMatches.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 max-h-64 overflow-y-auto animate-in fade-in space-y-1">
                {searchResults.locMatches.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 px-2 py-0.5">Towns & Hubs:</p>
                    {searchResults.locMatches.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const pos = latLngToPercent(loc.lat, loc.lng);
                          setActivePinPopup({
                            name: loc.tag || loc.address.split(',')[0],
                            address: loc.address,
                            lat: loc.lat,
                            lng: loc.lng,
                            category: loc.category,
                            x: pos.x,
                            y: pos.y,
                          });
                          setSearchQuery('');
                        }}
                        className="p-1.5 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center justify-between text-xs text-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold truncate">{loc.address}</span>
                        </div>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 shrink-0">
                          {loc.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.gpMatches.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 px-2 py-0.5">Gaon Panchayats (GP):</p>
                    {searchResults.gpMatches.map((gp, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const pos = latLngToPercent(gp.lat, gp.lng);
                          setActivePinPopup({
                            name: gp.name,
                            address: `${gp.headquarter} (${gp.name}), ${gp.blockName}`,
                            lat: gp.lat,
                            lng: gp.lng,
                            landmark: `HQ: ${gp.headquarter} • ${gp.keyLandmarks}`,
                            villages: gp.villages,
                            isGP: true,
                            x: pos.x,
                            y: pos.y,
                          });
                          setSearchQuery('');
                        }}
                        className="p-1.5 hover:bg-orange-50 rounded-lg cursor-pointer flex items-center justify-between text-xs text-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span className="font-bold truncate">{gp.name} ({gp.blockName})</span>
                        </div>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
                          GP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sub-division Filter Pills (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm text-[11px] font-bold">
          {[
            { id: 'all', label: 'All District' },
            { id: 'bokakhat', label: 'Bokakhat / Kaziranga' },
            { id: 'golaghat', label: 'Golaghat Sadar' },
            { id: 'dergaon', label: 'Dergaon' },
            { id: 'dhansiri', label: 'Sarupathar' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubDiv(tab.id)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSubDiv === tab.id
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Top Right Floating Map Controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-emerald-50 transition-colors cursor-pointer"
          title={isFullScreen ? 'Exit Fullscreen Map' : 'Expand Full Golaghat Map'}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4 text-orange-600" /> : <Maximize2 className="w-4 h-4 text-emerald-700" />}
        </button>

        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => setMapStyle(prev => (prev === 'vector' ? 'satellite' : prev === 'satellite' ? 'terrain' : 'vector'))}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title={`Style: ${mapStyle.toUpperCase()}`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
        </button>

        <button
          onClick={handleUseCurrentLocation}
          className="w-9 h-9 rounded-xl bg-emerald-50 backdrop-blur-md border border-emerald-300 shadow-md flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          title="Snap to my current GPS location"
        >
          <Crosshair className="w-4 h-4 animate-spin-slow" />
        </button>

        <button
          onClick={() => setShowKeyInfo(!showKeyInfo)}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-orange-200 shadow-md flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
          title="Golaghat Highway Network Guide"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Vector Canvas */}
      <div 
        onClick={handleMapCanvasClick}
        className={`absolute inset-0 transition-transform duration-300 cursor-crosshair ${
          mapStyle === 'satellite' 
            ? 'bg-slate-950' 
            : mapStyle === 'terrain'
            ? 'bg-[#ecfccb]'
            : 'bg-[#f0fdf4]'
        }`}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* SVG Route Geometry, Arterial Highways & River Network */}
        <svg className="w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="streetGridAssam" width="90" height="90" patternUnits="userSpaceOnUse">
              <rect width="90" height="90" fill={mapStyle === 'satellite' ? '#0f172a' : '#f0fdf4'} />
              <rect x="0" y="0" width="86" height="86" fill={mapStyle === 'satellite' ? '#1e293b' : '#ffffff'} rx="10" />
              <line x1="0" y1="45" x2="90" y2="45" stroke={mapStyle === 'satellite' ? '#334155' : '#dcfce7'} strokeWidth="4" />
              <line x1="45" y1="0" x2="45" y2="90" stroke={mapStyle === 'satellite' ? '#334155' : '#dcfce7'} strokeWidth="4" />
            </pattern>

            <linearGradient id="routeGradientLive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            <filter id="glowGreenOrange" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#10b981" floodOpacity="0.6" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#streetGridAssam)" />

          {/* Brahmaputra Northern Boundary & Dhansiri River curve */}
          <path
            d="M 0 40 Q 250 15, 600 35 T 1200 20"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#1e3a8a' : '#bae6fd'}
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.8"
          />
          <text x="30" y="32" fill="#0284c7" fontSize="9" fontWeight="bold">Brahmaputra River Corridor (North Golaghat Border)</text>

          {/* Dhansiri River Path */}
          <path
            d="M 620 35 Q 680 250, 780 480 T 820 800"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#1e3a8a' : '#bae6fd'}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.6"
          />
          <text x="700" y="290" fill="#0284c7" fontSize="8" fontWeight="bold">Dhansiri River</text>

          {/* NH-37 Arterial Highway (Kohora ↔ Bokakhat ↔ Numaligarh ↔ Dergaon) */}
          <path
            d="M 0 210 Q 250 150, 520 200 T 980 140"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#475569' : '#86efac'}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text x="40" y="195" fill="#166534" fontSize="10" fontWeight="900">NH-37 (Kohora ↔ Bokakhat ↔ Dergaon Corridor)</text>

          {/* NH-39 Highway (Numaligarh Junction ↔ Golaghat Town ↔ Sarupathar ↔ Bokajan) */}
          <path
            d="M 520 200 Q 640 340, 750 520 T 780 820"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#475569' : '#fed7aa'}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <text x="590" y="330" fill="#c2410c" fontSize="10" fontWeight="900">NH-39 (Numaligarh ↔ Golaghat ↔ Bokajan)</text>

          {/* State Highway Links (Dergaon ↔ Golaghat Town & Kamargaon Links) */}
          <path
            d="M 980 140 Q 860 260, 750 440"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#334155' : '#cbd5e1'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="6,6"
          />
          <text x="830" y="240" fill="#64748b" fontSize="8" fontWeight="bold">Dergaon-Golaghat Link</text>

          {/* Driver to Pickup Route Path when Driver is Assigned */}
          {driverLocation && (
            <line
              x1={`${driverPos.x}%`}
              y1={`${driverPos.y}%`}
              x2={`${pickupPos.x}%`}
              y2={`${pickupPos.y}%`}
              stroke="#0284c7"
              strokeWidth="4"
              strokeDasharray="6,6"
              strokeLinecap="round"
              className="animate-dash"
            />
          )}

          {/* Active Navigation Route Path Connecting Selected Pickup & Destination */}
          {destination && (
            <>
              {/* Route shadow line */}
              <line
                x1={`${pickupPos.x}%`}
                y1={`${pickupPos.y}%`}
                x2={`${destPos?.x}%`}
                y2={`${destPos?.y}%`}
                stroke="#065f46"
                strokeWidth="12"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />
              {/* Vibrant Dynamic Route Line in Emerald & Orange */}
              <line
                x1={`${pickupPos.x}%`}
                y1={`${pickupPos.y}%`}
                x2={`${destPos?.x}%`}
                y2={`${destPos?.y}%`}
                stroke="url(#routeGradientLive)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowGreenOrange)"
              />
              {/* Animated Directional Dash Trail */}
              <line
                x1={`${pickupPos.x}%`}
                y1={`${pickupPos.y}%`}
                x2={`${destPos?.x}%`}
                y2={`${destPos?.y}%`}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8,10"
                strokeLinecap="round"
                className="animate-dash"
              />
            </>
          )}
        </svg>

        {/* Town & Hub Interactive Pins across Golaghat District */}
        {filteredTowns.map(town => {
          const pos = latLngToPercent(town.lat, town.lng);
          const isCurrentPickup = pickup && Math.abs(pickup.lat - town.lat) < 0.01 && Math.abs(pickup.lng - town.lng) < 0.01;
          const isCurrentDest = destination && Math.abs(destination.lat - town.lat) < 0.01 && Math.abs(destination.lng - town.lng) < 0.01;

          return (
            <div
              key={town.id}
              onClick={e => handleTownClick(town, e)}
              style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/town cursor-pointer z-10 hover:z-30 transition-transform hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                {isCurrentPickup ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 ring-4 ring-emerald-300 ring-offset-2 shadow-lg flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                ) : isCurrentDest ? (
                  <div className="w-5 h-5 rounded-full bg-orange-600 ring-4 ring-orange-300 ring-offset-2 shadow-lg flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border-2 border-white shadow-md group-hover/town:bg-emerald-600 group-hover/town:ring-4 group-hover/town:ring-emerald-200 transition-all" />
                )}
              </div>

              {/* Town Name Label */}
              <div className={`mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-black whitespace-nowrap shadow-xs border transition-all ${
                isCurrentPickup
                  ? 'bg-emerald-950 text-emerald-200 border-emerald-400 font-extrabold scale-105'
                  : isCurrentDest
                  ? 'bg-orange-950 text-orange-200 border-orange-400 font-extrabold scale-105'
                  : 'bg-white/95 text-slate-800 border-slate-200 group-hover/town:border-emerald-500 group-hover/town:text-emerald-900 group-hover/town:shadow-md'
              }`}>
                {town.name}
              </div>
            </div>
          );
        })}

        {/* Gaon Panchayat (GP) Interactive Pins across Golaghat District */}
        {filteredGPs.map(gp => {
          const pos = latLngToPercent(gp.lat, gp.lng);
          const isCurrentPickup = pickup && Math.abs(pickup.lat - gp.lat) < 0.01 && Math.abs(pickup.lng - gp.lng) < 0.01;
          const isCurrentDest = destination && Math.abs(destination.lat - gp.lat) < 0.01 && Math.abs(destination.lng - gp.lng) < 0.01;

          return (
            <div
              key={gp.id}
              onClick={e => handleGPClick(gp, e)}
              style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/gp cursor-pointer z-10 hover:z-30 transition-transform hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                {isCurrentPickup ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 ring-4 ring-emerald-300 ring-offset-2 shadow-lg flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                ) : isCurrentDest ? (
                  <div className="w-5 h-5 rounded-full bg-orange-600 ring-4 ring-orange-300 ring-offset-2 shadow-lg flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-orange-600 border-2 border-white shadow-md group-hover/gp:bg-orange-500 group-hover/gp:ring-4 group-hover/gp:ring-orange-200 transition-all" />
                )}
              </div>

              {/* GP Name Label */}
              <div className={`mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black whitespace-nowrap shadow-xs border transition-all ${
                isCurrentPickup
                  ? 'bg-emerald-950 text-emerald-200 border-emerald-400 font-extrabold scale-105'
                  : isCurrentDest
                  ? 'bg-orange-950 text-orange-200 border-orange-400 font-extrabold scale-105'
                  : 'bg-white/95 text-orange-950 border-orange-200 group-hover/gp:border-orange-500 group-hover/gp:text-orange-900 group-hover/gp:shadow-md'
              }`}>
                🏛️ {gp.name}
              </div>
            </div>
          );
        })}

        {/* 1. Dedicated Pickup Marker (High Visibility Light Green Pin with Order Origin Label) */}
        <div 
          style={{ top: `${pickupPos.y}%`, left: `${pickupPos.x}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-75"></span>
            <div className="relative w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
              <MapPin className="w-5 h-5 fill-white" />
            </div>
          </div>
          <div className="mt-1 px-3 py-1 bg-emerald-950/95 text-white text-[11px] font-black rounded-xl shadow-lg whitespace-nowrap border border-emerald-400 flex items-center gap-1.5 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>📍 PICKUP (ORDER ORIGIN): {pickup?.address ? pickup.address.split(',')[0] : 'Bokakhat'}</span>
          </div>
        </div>

        {/* 2. Dedicated Destination Marker (Warm Orange Flag with Drop Label) */}
        {destination && destPos && (
          <div 
            style={{ top: `${destPos.y}%`, left: `${destPos.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-orange-400 opacity-75"></span>
              <div className="relative w-10 h-10 rounded-full bg-orange-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
                <Flag className="w-5 h-5 fill-white" />
              </div>
            </div>
            <div className="mt-1 px-3 py-1 bg-orange-950/95 text-white text-[11px] font-black rounded-xl shadow-lg whitespace-nowrap border border-orange-400 flex items-center gap-1.5 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <span>🎯 DROP (DESTINATION): {destination.address ? destination.address.split(',')[0] : 'Golaghat Town'}</span>
            </div>
          </div>
        )}

        {/* 3. Driver Live Vehicle Marker */}
        {(status === 'driver_assigned' || status === 'arrived' || status === 'in_progress') && (
          <div 
            style={{ top: `${driverPos.y}%`, left: `${driverPos.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 z-30"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-11 w-11 rounded-full bg-emerald-400 opacity-75"></span>
              <div className="w-10 h-10 rounded-full bg-emerald-600 border-3 border-white shadow-2xl flex items-center justify-center text-white rotate-12 transition-transform">
                {vehicleType === 'bike' ? (
                  <Navigation className="w-5 h-5 fill-white rotate-45" />
                ) : (
                  <Car className="w-5 h-5 fill-white" />
                )}
              </div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-orange-600 text-white text-[10px] font-black rounded-md shadow-md uppercase tracking-wider">
              {vehicleType} • Live Driver GPS
            </div>
          </div>
        )}

        {/* Interactive Click Popup Card on Selected Town/Pin */}
        {activePinPopup && (
          <div
            style={{ top: `${Math.min(activePinPopup.y, 75)}%`, left: `${Math.min(Math.max(activePinPopup.x, 25), 75)}%` }}
            onClick={e => e.stopPropagation()}
            className="absolute -translate-x-1/2 -translate-y-full mb-3 w-72 bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-3.5 z-40 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Golaghat District Location
                </span>
                <h4 className="font-display font-black text-sm text-slate-900 mt-1">
                  {activePinPopup.name}
                </h4>
                {activePinPopup.landmark && (
                  <p className="text-[10px] text-slate-500 font-medium">{activePinPopup.landmark}</p>
                )}
              </div>
              <button 
                onClick={() => setActivePinPopup(null)}
                className="text-slate-400 hover:text-slate-700 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={handleSetPickupFromPin}
                className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-black rounded-xl shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Set Pickup</span>
              </button>

              <button
                type="button"
                onClick={handleSetDestinationFromPin}
                className="py-2 px-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-[11px] font-black rounded-xl shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Set Drop</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Info banner for Golaghat Highway Network */}
      {showKeyInfo && (
        <div className="absolute inset-x-3 bottom-3 z-40 p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-md text-white text-xs border border-emerald-500/40 shadow-2xl flex items-start justify-between gap-3 animate-in fade-in">
          <div>
            <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
              <MapIcon className="w-4 h-4" />
              <span>Golaghat District Transit Corridors & Sub-Divisions</span>
            </p>
            <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
              Covering: <strong>Bokakhat</strong> (Head Office), <strong>Kohora & Bagori</strong> (Kaziranga), <strong>Numaligarh</strong> (NRL Refinery), <strong>Dergaon</strong> (Police Academy), <strong>Golaghat Sadar & Bengnakhowa</strong>, <strong>Furkating Junction</strong>, <strong>Khumtai</strong>, <strong>Sarupathar & Barpathar</strong> (Dhansiri), and <strong>Bokajan</strong>.
            </p>
          </div>
          <button 
            onClick={() => setShowKeyInfo(false)}
            className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Center Route Stats Bar */}
      {destination && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 shadow-xl text-xs font-black text-slate-900 flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-700">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>NH-37 / NH-39 Expressway</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200" />
          <span className="text-orange-600 font-bold">Fastest Golaghat Route Active</span>
        </div>
      )}

    </div>
  );
};
