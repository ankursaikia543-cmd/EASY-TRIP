import React, { useState, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Car, 
  Compass, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Zap, 
  RotateCcw, 
  Building2, 
  PhoneCall, 
  Search,
  CheckCircle2,
  Filter,
  X,
  Plane,
  Train,
  Hospital,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { useLanguage } from '../../context/LanguageContext';
import { LocationPoint, VehicleType } from '../../types';
import { CONTACT_INFO } from '../../utils/initialData';
import { 
  ALL_ASSAM_LOCATIONS, 
  LocationItem, 
  searchLocations, 
  findLocationByQuery 
} from '../../utils/locationDatabase';
import { InteractiveMap } from '../common/InteractiveMap';
import { GoogleMapsEmbed } from '../common/GoogleMapsEmbed';
import { GaonPanchayatSelector } from '../common/GaonPanchayatSelector';
import { LocationSearchInput } from '../common/LocationSearchInput';
import { ActiveRideTracker } from './ActiveRideTracker';
import { FareService } from '../../services/fareService';

export const CustomerHome: React.FC = () => {
  const { user } = useAuth();
  const { activeRide, requestRide, platformSettings } = useRide();
  const { t } = useLanguage();
  const [mapEngine, setMapEngine] = useState<'google' | 'district'>('google');

  // Default Locations: Bokakhat (Main Office) & Golaghat Town Court Field
  const [pickup, setPickup] = useState<LocationPoint>({
    address: 'Bokakhat Main Chariali, NRL Gate, NH-37, Golaghat, Assam',
    lat: 26.5925,
    lng: 93.5937,
    city: 'Bokakhat',
  });

  const [destination, setDestination] = useState<LocationPoint>({
    address: 'Golaghat Town Court Field & DC Office, Assam',
    lat: 26.5186,
    lng: 93.9688,
    city: 'Golaghat Town',
  });

  const [pickupInput, setPickupInput] = useState(pickup.address);
  const [destInput, setDestInput] = useState(destination.address);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('auto');
  const [isBooking, setIsBooking] = useState(false);
  const [isGPModalOpen, setIsGPModalOpen] = useState<boolean>(false);

  const destInputRef = useRef<HTMLInputElement>(null);

  // If there's an ongoing active ride for this user, show the live tracking interface
  if (activeRide && (activeRide.status === 'searching' || activeRide.status === 'driver_assigned' || activeRide.status === 'arrived' || activeRide.status === 'in_progress' || activeRide.status === 'completed')) {
    return <ActiveRideTracker />;
  }

  // Calculate live estimates
  const distanceKm = FareService.calculateDistanceKm(pickup, destination);
  const durationMin = FareService.estimateDurationMin(distanceKm, selectedVehicle);
  const currentFareBreakdown = FareService.calculateFare(selectedVehicle, distanceKm, durationMin, platformSettings);

  const bikeFare = FareService.calculateFare('bike', distanceKm, FareService.estimateDurationMin(distanceKm, 'bike'), platformSettings);
  const autoFare = FareService.calculateFare('auto', distanceKm, FareService.estimateDurationMin(distanceKm, 'auto'), platformSettings);
  const cabFare = FareService.calculateFare('cab', distanceKm, FareService.estimateDurationMin(distanceKm, 'cab'), platformSettings);

  const handlePickupChange = (value: string, locationItem?: LocationItem) => {
    setPickupInput(value);
    if (locationItem) {
      setPickup({
        address: locationItem.address,
        lat: locationItem.lat,
        lng: locationItem.lng,
        city: locationItem.city
      });
    } else {
      const coords = findLocationByQuery(value);
      if (coords) {
        setPickup({ address: value, lat: coords.lat, lng: coords.lng, city: coords.city });
      } else {
        setPickup(prev => ({ ...prev, address: value }));
      }
    }
  };

  const handleDestChange = (value: string, locationItem?: LocationItem) => {
    setDestInput(value);
    if (locationItem) {
      setDestination({
        address: locationItem.address,
        lat: locationItem.lat,
        lng: locationItem.lng,
        city: locationItem.city
      });
    } else {
      const coords = findLocationByQuery(value);
      if (coords) {
        setDestination({ address: value, lat: coords.lat, lng: coords.lng, city: coords.city });
      } else {
        setDestination(prev => ({ ...prev, address: value }));
      }
    }
  };

  const handleSelectTownPair = (pTown: string, dTown: string) => {
    const pObj = findLocationByQuery(pTown) || ALL_ASSAM_LOCATIONS[0];
    const dObj = findLocationByQuery(dTown) || ALL_ASSAM_LOCATIONS[4];

    setPickup({
      address: pObj.address,
      lat: pObj.lat,
      lng: pObj.lng,
      city: pObj.city,
    });
    setPickupInput(pObj.address);

    setDestination({
      address: dObj.address,
      lat: dObj.lat,
      lng: dObj.lng,
      city: dObj.city,
    });
    setDestInput(dObj.address);
  };

  const handleBookRide = async () => {
    if (!pickup || !destination) return;
    setIsBooking(true);
    try {
      await requestRide(pickup, destination, selectedVehicle);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Top Bento Greeting Bar with Bold Typography & Light Green & Orange accents */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 bg-gradient-to-r from-emerald-50 via-white to-orange-50 rounded-[2rem] border-2 border-emerald-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-orange-500 text-white rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-md shadow-emerald-500/20">
            📍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-950 tracking-tight">
                {t.greeting}, <span className="text-emerald-700">{user?.name || 'Passenger'}</span>
              </h1>
              <span className="text-[10px] uppercase font-display font-black tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-300">
                ASSAM NETWORK
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Live transit across <strong className="text-slate-950 font-bold">Bokakhat</strong>, <strong className="text-slate-950 font-bold">Kohora</strong>, <strong className="text-slate-950 font-bold">Numaligarh</strong>, <strong className="text-slate-950 font-bold">Dergaon</strong>, <strong className="text-slate-950 font-bold">Golaghat</strong> & <strong className="text-slate-950 font-bold">Bokajan</strong>
            </p>
          </div>
        </div>

        {/* Wallet & Golaghat Transit Bento Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-display font-black flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>WALLET: <strong className="font-mono-num text-sm text-emerald-900 font-black">₹{user?.walletBalance || 0}</strong></span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-display font-black tracking-wide uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>GOLAGHAT DISTRICT RIDES</span>
          </div>
        </div>
      </div>

      {/* Quick Town Corridor Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">Direct Hub Drops:</span>
        {[
          { from: 'Bokakhat', to: 'Golaghat Town', label: '📍 Bokakhat ↔ Golaghat' },
          { from: 'Bokakhat', to: 'Jorhat ISBT', label: '🚗 Jorhat ISBT & City' },
          { from: 'Golaghat Town', to: 'Guwahati Airport', label: '✈️ Guwahati Airport (GAU)' },
          { from: 'Golaghat Town', to: 'Dibrugarh AMCH', label: '🏥 AMCH Dibrugarh Hospital' },
          { from: 'Bokakhat', to: 'Kohora', label: '🦏 Kohora (Kaziranga)' },
          { from: 'Dergaon', to: 'Numaligarh NRL', label: '🏭 Numaligarh (NRL)' },
          { from: 'Golaghat Town', to: 'Furkating Junction', label: '🚆 Furkating Junction' },
          { from: 'Golaghat Town', to: 'Sivasagar ASTC', label: '🏛️ Sivasagar Heritage' },
          { from: 'Sarupathar', to: 'Dimapur Station', label: '🚉 Dimapur Hub' },
        ].map((r, i) => (
          <button
            key={i}
            onClick={() => handleSelectTownPair(r.from, r.to)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-bold whitespace-nowrap shadow-2xs transition-all cursor-pointer text-[11px]"
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Main Bento Grid: Left Booking Column (5 Cols) & Right Interactive Map Bento (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Bento Ride Booking Tile */}
        <section className="lg:col-span-5 bg-white rounded-[2.5rem] shadow-xl border border-emerald-100 overflow-hidden flex flex-col relative">
          
          {/* Bento Header in Light Green & Orange */}
          <div className="p-6 bg-gradient-to-r from-emerald-700 via-emerald-600 to-orange-600 text-white pb-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-emerald-100">Golaghat District Instant Booking</p>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                Upfront Rates
              </span>
            </div>
            <h2 className="text-xl font-black">Where are you traveling today?</h2>
          </div>

          {/* Floating Route Card */}
          <div className="px-4 -mt-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-emerald-100 flex flex-col gap-3">
              
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Golaghat Corridor Route
                </span>
                <button 
                  type="button"
                  onClick={() => {
                    const tempP = pickup;
                    const tempPI = pickupInput;
                    setPickup(destination);
                    setPickupInput(destInput);
                    setDestination(tempP);
                    setDestInput(tempPI);
                  }}
                  className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-black cursor-pointer"
                  title="Swap Pickup & Destination"
                >
                  <RotateCcw className="w-3 h-3" /> Swap
                </button>
              </div>

              {/* Pickup Input with Instant Autocomplete Search & Select */}
              <LocationSearchInput
                label="Pickup Location (Golaghat / Assam)"
                value={pickupInput}
                onChange={handlePickupChange}
                placeholder="Search pickup town, village, hospital, station..."
                type="pickup"
                onSelectCallback={() => {
                  setTimeout(() => {
                    destInputRef.current?.focus();
                  }, 100);
                }}
              />

              {/* Destination Input with Instant Autocomplete Search & Select */}
              <LocationSearchInput
                inputRef={destInputRef}
                label="Drop Destination (Local or Jorhat, Guwahati, Dibrugarh...)"
                value={destInput}
                onChange={handleDestChange}
                placeholder="Search drop point in Assam..."
                type="destination"
              />

              {/* Map Selection Helper Tip & Gaon Panchayat Quick Action */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsGPModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-700 to-orange-600 hover:from-emerald-800 hover:to-orange-700 active:scale-98 text-white rounded-xl font-display font-black text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-200" />
                    <span>Select Gaon Panchayat (GP) & Village</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-sans font-bold">
                    32+ GPs
                  </span>
                </button>

                <div className="bg-emerald-50/80 rounded-xl p-2 border border-emerald-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tip: Type karte hi dropdown se 1-click select karein ya map par tap karein!</span>
                  </div>
                </div>
              </div>

              {/* Route Metric Bento Tag */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-black text-slate-700">
                <div className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>{distanceKm} km (Live Distance)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-600" />
                  <span>~{durationMin} mins</span>
                </div>
              </div>

            </div>
          </div>

          {/* Vehicle Selection Bento Tiles */}
          <div className="p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1 mt-1">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">
                Vehicle Rates for {distanceKm} km
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Auto-calculated
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Bike Option */}
              {(() => {
                 const isSelected = selectedVehicle === 'bike';
                 return (
                   <div
                     onClick={() => setSelectedVehicle('bike')}
                     className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${
                       isSelected
                         ? 'bg-emerald-50/90 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                         : 'border-slate-200 hover:border-slate-300 bg-white'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-2xl font-black">🏍️</div>
                       <div>
                         <p className="font-display font-black text-sm text-slate-950 tracking-tight">EASY BIKE (KAZIRANGA EXPRESS)</p>
                         <p className="text-[11px] text-slate-600 font-medium">Solo Ride • ₹9/km (Base ₹25)</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-display font-black text-lg text-emerald-800 font-mono-num">₹{bikeFare.totalFare}</p>
                       <span className="text-[10px] text-slate-400 font-medium">{distanceKm} km</span>
                     </div>
                   </div>
                 );
               })()}

              {/* Auto Option */}
              {(() => {
                 const isSelected = selectedVehicle === 'auto';
                 return (
                   <div
                     onClick={() => setSelectedVehicle('auto')}
                     className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${
                       isSelected
                         ? 'bg-orange-50/90 border-orange-600 shadow-sm ring-2 ring-orange-500/20'
                         : 'border-slate-200 hover:border-slate-300 bg-white'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center text-2xl font-black">🛺</div>
                       <div>
                         <p className="font-display font-black text-sm text-slate-950 tracking-tight">EASY AUTO (3-SEATER)</p>
                         <p className="text-[11px] text-slate-600 font-medium">Local Market & Town • ₹13/km (Base ₹35)</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-display font-black text-lg text-orange-700 font-mono-num">₹{autoFare.totalFare}</p>
                       <span className="text-[10px] text-slate-400 font-medium">{distanceKm} km</span>
                     </div>
                   </div>
                 );
               })()}

              {/* Cab Option */}
              {(() => {
                 const isSelected = selectedVehicle === 'cab';
                 return (
                   <div
                     onClick={() => setSelectedVehicle('cab')}
                     className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${
                       isSelected
                         ? 'bg-emerald-50/90 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                         : 'border-slate-200 hover:border-slate-300 bg-white'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-2xl font-black">🚗</div>
                       <div>
                         <p className="font-display font-black text-sm text-slate-950 tracking-tight">EASY CAB PRIME (AC)</p>
                         <p className="text-[11px] text-slate-600 font-medium">4-Seater AC Sedan • ₹17/km (Base ₹65)</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-display font-black text-lg text-emerald-800 font-mono-num">₹{cabFare.totalFare}</p>
                       <span className="text-[10px] text-slate-400 font-medium">{distanceKm} km</span>
                     </div>
                   </div>
                 );
               })()}
            </div>

            {/* Book Button in Vibrant Green/Orange with Bold Typography */}
            <button
              onClick={handleBookRide}
              disabled={isBooking}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-orange-500 hover:from-emerald-700 hover:to-orange-600 active:scale-98 text-white rounded-2xl font-display font-black text-sm uppercase tracking-wider mt-1 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isBooking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Golaghat Drivers...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM & BOOK {selectedVehicle.toUpperCase()} • ₹{currentFareBreakdown.totalFare}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </section>

        {/* Right Column: Bento Interactive Map & Bento Pulse Modules (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          
          {/* Map Bento Box with Live Google Maps / District Interactive Map */}
          <div className="bg-white rounded-[2.5rem] border border-emerald-200/80 p-2 shadow-xl overflow-hidden relative">
            {/* Top Map Engine Switcher: Google Map (Full) vs District GP Map */}
            <div className="flex items-center justify-between p-2 mb-1 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 px-2 text-xs font-display font-black text-slate-800">
                <span>🗺️ MAP ENGINE:</span>
              </div>
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMapEngine('google')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    mapEngine === 'google'
                      ? 'bg-emerald-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌐 Google Maps (Full Live)
                </button>
                <button
                  type="button"
                  onClick={() => setMapEngine('district')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    mapEngine === 'district'
                      ? 'bg-emerald-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📍 Golaghat District / GP
                </button>
              </div>
            </div>

            {mapEngine === 'google' ? (
              <GoogleMapsEmbed
                pickup={pickup}
                destination={destination}
                onSelectPickup={point => {
                  setPickup(point);
                  setPickupInput(point.address);
                }}
                onSelectDestination={point => {
                  setDestination(point);
                  setDestInput(point.address);
                }}
                heightClass="h-[420px] sm:h-[500px]"
              />
            ) : (
              <InteractiveMap
                pickup={pickup}
                destination={destination}
                onSelectPickup={point => {
                  setPickup(point);
                  setPickupInput(point.address);
                }}
                onSelectDestination={point => {
                  setDestination(point);
                  setDestInput(point.address);
                }}
                vehicleType={selectedVehicle}
                heightClass="h-[420px] sm:h-[500px]"
              />
            )}
            
            <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black text-slate-800 shadow-md border border-emerald-200 flex items-center gap-2 pointer-events-none z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{distanceKm} km • ~{durationMin} mins (NH-37 / NH-39 Corridor)</span>
            </div>
          </div>

          {/* Bento Sub-Grid: 3 Bento Security & Contact Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-[1.5rem] p-4 border border-emerald-100 shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                🏢
              </div>
              <h4 className="text-xs font-black text-slate-900">Bokakhat Head Office</h4>
              <p className="text-[10px] text-slate-500 leading-snug">Main HQ & Driver Dispatch Station, PIN 785612</p>
            </div>

            <div className="bg-white rounded-[1.5rem] p-4 border border-orange-100 shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm">
                📞
              </div>
              <h4 className="text-xs font-black text-slate-900">District Helplines</h4>
              <p className="text-[10px] text-slate-600 font-bold leading-snug">8638803320 • 7002754262 • 9101876404</p>
            </div>

            <div className="bg-slate-900 text-white rounded-[1.5rem] p-4 shadow-md space-y-1">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm">
                ✉️
              </div>
              <h4 className="text-xs font-bold text-white">Official Mail Support</h4>
              <p className="text-[10px] text-emerald-300 font-mono leading-snug truncate">bijaysaikia543@gmail.com</p>
            </div>
          </div>

        </div>

      </div>

      {/* Gaon Panchayat (GP) & Village Selection Drawer/Modal */}
      <GaonPanchayatSelector
        isOpen={isGPModalOpen}
        onClose={() => setIsGPModalOpen(false)}
        onSelectAsPickup={point => {
          setPickup(point);
          setPickupInput(point.address);
        }}
        onSelectAsDestination={point => {
          setDestination(point);
          setDestInput(point.address);
        }}
        currentPickup={pickup}
        currentDestination={destination}
      />

    </div>
  );
};
