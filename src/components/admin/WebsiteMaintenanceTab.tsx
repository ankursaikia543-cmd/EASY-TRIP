import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Globe, 
  Phone, 
  Mail, 
  Sliders, 
  Percent, 
  ShieldAlert,
  Search,
  Building2,
  Car,
  Compass,
  Bike,
  HelpCircle,
  QrCode,
  IndianRupee,
  Lock,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useNotifications } from '../../context/NotificationContext';
import { CustomLocationItem, VehicleType } from '../../types';
import { GOLAGHAT_TOWNS } from '../../utils/initialData';

export const WebsiteMaintenanceTab: React.FC = () => {
  const { platformSettings, updatePlatformSettings, allRides } = useRide();
  const { addNotification } = useNotifications();

  // Emergency & Support State
  const [appName, setAppName] = useState(platformSettings.appName || 'EASY TRIP Golaghat');
  const [supportPhone, setSupportPhone] = useState(platformSettings.supportPhone || '+91 8638803320');
  const [supportEmail, setSupportEmail] = useState(platformSettings.supportEmail || 'bijaysaikia543@gmail.com');
  const [emergencySosNumber, setEmergencySosNumber] = useState(platformSettings.emergencySosNumber || '112');
  const [commissionRate, setCommissionRate] = useState(platformSettings.commissionRatePercent || 15);
  const [surgeEnabled, setSurgeEnabled] = useState(platformSettings.surgePricingEnabled ?? true);
  const [surgeMultiplier, setSurgeMultiplier] = useState(platformSettings.surgeMultiplier || 1.0);
  const [nightChargeMultiplier, setNightChargeMultiplier] = useState(platformSettings.nightChargeMultiplier || 1.2);
  const [waitingChargePerMin, setWaitingChargePerMin] = useState(platformSettings.waitingChargePerMin || 2);
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings.maintenanceMode ?? false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    platformSettings.maintenanceMessage || 'EASY TRIP is currently undergoing scheduled platform optimization. We will be back online shortly!'
  );

  // Admin UPI & Mandatory Driver Fee State
  const [adminUpiId, setAdminUpiId] = useState(platformSettings.adminUpiId || '8638803320@okbizaxis');
  const [adminUpiName, setAdminUpiName] = useState(platformSettings.adminUpiName || 'vijay xaikia');
  const [adminUpiPhone, setAdminUpiPhone] = useState(platformSettings.adminUpiPhone || '+91 8638803320');
  const [adminUpiQrImageUrl, setAdminUpiQrImageUrl] = useState(platformSettings.adminUpiQrImageUrl || '');
  const [driverAdminFeeBikeAuto, setDriverAdminFeeBikeAuto] = useState(platformSettings.driverAdminFeeBikeAuto || 5);
  const [driverAdminFeeCab, setDriverAdminFeeCab] = useState(platformSettings.driverAdminFeeCab || 50);

  // Vehicle Fares State
  const [faresState, setFaresState] = useState(platformSettings.fares);

  // Location Management State
  const [locationSearch, setLocationSearch] = useState('');
  const [customLocations, setCustomLocations] = useState<CustomLocationItem[]>(() => {
    if (platformSettings.customLocations && platformSettings.customLocations.length > 0) {
      return platformSettings.customLocations;
    }
    // Initialize from GOLAGHAT_TOWNS
    return GOLAGHAT_TOWNS.map(t => ({
      id: t.id,
      name: t.name,
      subDivision: t.subDivision,
      role: t.role,
      lat: t.lat,
      lng: t.lng,
      landmark: t.landmark,
      active: true,
    }));
  });

  // Modal / Form state for Add/Edit location
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locSubDivision, setLocSubDivision] = useState('Bokakhat');
  const [locRole, setLocRole] = useState('Local Town Hub');
  const [locLat, setLocLat] = useState('26.5925');
  const [locLng, setLocLng] = useState('93.5937');
  const [locLandmark, setLocLandmark] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleSaveGeneralDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      appName,
      supportPhone,
      supportEmail,
      emergencySosNumber,
      commissionRatePercent: Number(commissionRate),
      surgePricingEnabled: surgeEnabled,
      surgeMultiplier: Number(surgeMultiplier),
      nightChargeMultiplier: Number(nightChargeMultiplier),
      waitingChargePerMin: Number(waitingChargePerMin),
      maintenanceMode,
      maintenanceMessage,
      adminUpiId,
      adminUpiName,
      adminUpiPhone,
      adminUpiQrImageUrl,
      driverAdminFeeBikeAuto: Number(driverAdminFeeBikeAuto),
      driverAdminFeeCab: Number(driverAdminFeeCab),
      fares: faresState,
      customLocations,
    });
    setSaveFeedback('Website settings & maintenance configuration updated successfully!');
    addNotification('Platform Updated', 'Website details, admin UPI settings, fees and locations saved.', 'system');
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const handleUpdateVehicleFare = (
    type: VehicleType,
    field: 'baseFare' | 'pricePerKm' | 'minimumFare' | 'perMinuteRate',
    value: number
  ) => {
    setFaresState(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleOpenAddLocation = () => {
    setEditingLocationId(null);
    setLocName('');
    setLocSubDivision('Bokakhat');
    setLocRole('Local Hub / GP');
    setLocLat('26.5925');
    setLocLng('93.5937');
    setLocLandmark('');
    setShowLocationModal(true);
  };

  const handleOpenEditLocation = (loc: CustomLocationItem) => {
    setEditingLocationId(loc.id);
    setLocName(loc.name);
    setLocSubDivision(loc.subDivision);
    setLocRole(loc.role);
    setLocLat(loc.lat.toString());
    setLocLng(loc.lng.toString());
    setLocLandmark(loc.landmark);
    setShowLocationModal(true);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    if (editingLocationId) {
      // Edit
      const updated = customLocations.map(l => {
        if (l.id === editingLocationId) {
          return {
            ...l,
            name: locName.trim(),
            subDivision: locSubDivision,
            role: locRole.trim(),
            lat: parseFloat(locLat) || 26.5925,
            lng: parseFloat(locLng) || 93.5937,
            landmark: locLandmark.trim(),
          };
        }
        return l;
      });
      setCustomLocations(updated);
      updatePlatformSettings({ customLocations: updated });
      addNotification('Location Updated', `${locName} details updated.`, 'system');
    } else {
      // Add
      const newLoc: CustomLocationItem = {
        id: `loc-${Date.now()}`,
        name: locName.trim(),
        subDivision: locSubDivision,
        role: locRole.trim() || 'Town Hub',
        lat: parseFloat(locLat) || 26.5925,
        lng: parseFloat(locLng) || 93.5937,
        landmark: locLandmark.trim() || `${locName} Center`,
        active: true,
      };
      const updated = [newLoc, ...customLocations];
      setCustomLocations(updated);
      updatePlatformSettings({ customLocations: updated });
      addNotification('Location Added', `Added ${newLoc.name} to pickup/drop directory.`, 'system');
    }

    setShowLocationModal(false);
  };

  const handleDeleteLocation = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the active location list?`)) {
      const updated = customLocations.filter(l => l.id !== id);
      setCustomLocations(updated);
      updatePlatformSettings({ customLocations: updated });
      addNotification('Location Removed', `${name} removed from directory.`, 'system');
    }
  };

  const handleToggleLocationActive = (id: string) => {
    const updated = customLocations.map(l => (l.id === id ? { ...l, active: !l.active } : l));
    setCustomLocations(updated);
    updatePlatformSettings({ customLocations: updated });
  };

  const filteredLocations = customLocations.filter(l => {
    if (!locationSearch.trim()) return true;
    const q = locationSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.subDivision.toLowerCase().includes(q) ||
      l.role.toLowerCase().includes(q) ||
      l.landmark.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wrench className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-display font-black tracking-tight">
              Website Maintenance & Master Control
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
              Full Access
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Control all website operational parameters: Live maintenance mode toggle, amount & fare editing, helpline & support credentials, and Golaghat custom pickup/drop location routes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSaveGeneralDetails}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* SECTION 1: MAINTENANCE MODE TOGGLE */}
      <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${maintenanceMode ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-display font-black text-slate-900">
                Platform Maintenance Mode Switch
              </h3>
              <p className="text-xs text-slate-500">
                When enabled, passenger app will display an official maintenance notice while allowing admin access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-5 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              maintenanceMode
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {maintenanceMode ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
            <span>{maintenanceMode ? 'MAINTENANCE ACTIVE (ON)' : 'NORMAL OPERATION (OFF)'}</span>
          </button>
        </div>

        {maintenanceMode && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 animate-in fade-in">
            <label className="block text-xs font-bold text-amber-900">
              Maintenance Notice Message (Displayed to Customers)
            </label>
            <input
              type="text"
              value={maintenanceMessage}
              onChange={e => setMaintenanceMessage(e.target.value)}
              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              placeholder="Enter message for passengers..."
            />
          </div>
        )}
      </div>

      {/* SECTION 2: AMOUNT & FARE EDITING (ALL CATEGORIES) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-display font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Amount & Fare Configuration (Base Fare, Per-KM, Min Fare)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Directly edit and control the ride booking amounts across Golaghat district.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bike Rates */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  <Bike className="w-4 h-4" />
                </span>
                <span className="font-display font-black text-xs text-emerald-950">EASY Bike</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">1 Rider</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Starting Fare (₹)</label>
                <input
                  type="number"
                  value={faresState.bike.baseFare}
                  onChange={e => handleUpdateVehicleFare('bike', 'baseFare', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Price Per KM (₹/km)</label>
                <input
                  type="number"
                  value={faresState.bike.pricePerKm}
                  onChange={e => handleUpdateVehicleFare('bike', 'pricePerKm', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Minimum Booking Fare (₹)</label>
                <input
                  type="number"
                  value={faresState.bike.minimumFare}
                  onChange={e => handleUpdateVehicleFare('bike', 'minimumFare', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Auto Rates */}
          <div className="p-5 rounded-2xl bg-orange-50/50 border-2 border-orange-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs">
                  <Compass className="w-4 h-4" />
                </span>
                <span className="font-display font-black text-xs text-orange-950">EASY Auto</span>
              </div>
              <span className="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-bold">3 Riders</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Starting Fare (₹)</label>
                <input
                  type="number"
                  value={faresState.auto.baseFare}
                  onChange={e => handleUpdateVehicleFare('auto', 'baseFare', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-orange-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Price Per KM (₹/km)</label>
                <input
                  type="number"
                  value={faresState.auto.pricePerKm}
                  onChange={e => handleUpdateVehicleFare('auto', 'pricePerKm', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-orange-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Minimum Booking Fare (₹)</label>
                <input
                  type="number"
                  value={faresState.auto.minimumFare}
                  onChange={e => handleUpdateVehicleFare('auto', 'minimumFare', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-orange-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Cab Rates */}
          <div className="p-5 rounded-2xl bg-blue-50/50 border-2 border-blue-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs">
                  <Car className="w-4 h-4" />
                </span>
                <span className="font-display font-black text-xs text-blue-950">EASY Cab</span>
              </div>
              <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">4 Riders</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Starting Fare (₹)</label>
                <input
                  type="number"
                  value={faresState.cab.baseFare}
                  onChange={e => handleUpdateVehicleFare('cab', 'baseFare', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Price Per KM (₹/km)</label>
                <input
                  type="number"
                  value={faresState.cab.pricePerKm}
                  onChange={e => handleUpdateVehicleFare('cab', 'pricePerKm', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Minimum Booking Fare (₹)</label>
                <input
                  type="number"
                  value={faresState.cab.minimumFare}
                  onChange={e => handleUpdateVehicleFare('cab', 'minimumFare', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Commission & Surge Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform Commission Rate (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={30}
                value={commissionRate}
                onChange={e => setCommissionRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Surge Multiplier</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={0.1}
                min={1.0}
                max={3.0}
                value={surgeMultiplier}
                onChange={e => setSurgeMultiplier(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden"
              />
              <span className="text-xs font-bold text-slate-500">x</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Night Multiplier (10 PM - 5 AM)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={0.1}
                min={1.0}
                max={2.0}
                value={nightChargeMultiplier}
                onChange={e => setNightChargeMultiplier(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden"
              />
              <span className="text-xs font-bold text-slate-500">x</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: MANDATORY DRIVER ADMIN FEE & GOOGLE PAY QR SETTINGS */}
      <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-orange-100">
          <div>
            <h3 className="text-sm font-display font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              <span>Mandatory Regular Driver Platform Fee & Admin Google Pay UPI QR</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce mandatory payment policy for drivers (₹5 for Bike/Auto, ₹50 per Cab booking). Driver apps are automatically restricted until paid.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-display font-black uppercase bg-orange-100 text-orange-800 border border-orange-300">
              MANDATORY ENFORCEMENT ACTIVE
            </span>
          </div>
        </div>

        {/* Fee Rate Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-orange-600" />
                <span>Bike & Auto Regular Driver Fee</span>
              </label>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-200/70 px-2 py-0.5 rounded-full">Standard: ₹5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-700">₹</span>
              <input
                type="number"
                min={0}
                value={driverAdminFeeBikeAuto}
                onChange={e => setDriverAdminFeeBikeAuto(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-orange-300 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Regular fee amount required from Bike and Auto rickshaw drivers to keep their app active.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" />
                <span>Cab Partner Fee (Per Customer Booking)</span>
              </label>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-200/70 px-2 py-0.5 rounded-full">Standard: ₹50</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-700">₹</span>
              <input
                type="number"
                min={0}
                value={driverAdminFeeCab}
                onChange={e => setDriverAdminFeeCab(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-blue-300 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Mandatory platform fee charged per completed customer trip for 4-wheeler cab operators.
            </p>
          </div>
        </div>

        {/* Admin UPI & QR Code Settings */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-display font-black text-slate-900 mb-3">Admin Google Pay / PhonePe / UPI Receiving Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin UPI ID (VPA)</label>
              <input
                type="text"
                value={adminUpiId}
                onChange={e => setAdminUpiId(e.target.value)}
                placeholder="8638803320@okbizaxis"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Payee Name</label>
              <input
                type="text"
                value={adminUpiName}
                onChange={e => setAdminUpiName(e.target.value)}
                placeholder="vijay xaikia"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Linked Mobile Number</label>
              <input
                type="text"
                value={adminUpiPhone}
                onChange={e => setAdminUpiPhone(e.target.value)}
                placeholder="+91 8638803320"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Live Admin QR Code Preview */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-2 bg-white rounded-xl border border-slate-300 shrink-0">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(adminUpiName)}&cu=INR`)}`}
              alt="Admin UPI QR"
              className="w-20 h-20"
            />
          </div>
          <div className="text-xs space-y-1">
            <span className="font-display font-black text-slate-900 block">Live Driver Portal QR Preview</span>
            <p className="text-slate-600 text-[11px]">
              This official Google Pay QR code is permanently embedded in the Driver App portal. When drivers scan, it instantly routes payments to <span className="font-mono font-bold text-orange-700">{adminUpiId}</span> ({adminUpiName}).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: LOCATION & TOWN DIRECTORY MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-display font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Golaghat District Location & Route Directory ({customLocations.length} Locations)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Add, edit, or remove towns, Gaon Panchayats, and landmarks for passenger booking suggestions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddLocation}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Location</span>
            </button>
          </div>
        </div>

        {/* Location Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            placeholder="Search town, sub-division, landmark, or coordinates..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Locations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredLocations.map(loc => (
            <div
              key={loc.id}
              className={`p-4 rounded-2xl border transition-all ${
                loc.active !== false
                  ? 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <h4 className="font-display font-black text-xs text-slate-900">{loc.name}</h4>
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold mt-0.5">
                    Sub-Div: {loc.subDivision} • {loc.role}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditLocation(loc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Edit Location"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 font-medium truncate">
                {loc.landmark}
              </p>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                <span>Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}</span>
                <button
                  type="button"
                  onClick={() => handleToggleLocationActive(loc.id)}
                  className={`px-2 py-0.5 rounded font-bold uppercase ${
                    loc.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {loc.active !== false ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: WEBSITE GENERAL & CONTACT CREDENTIALS */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-4">
        <h3 className="text-sm font-display font-black text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Website Branding & Helpline Numbers</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Name</label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Support Helpline</label>
            <input
              type="text"
              value={supportPhone}
              onChange={e => setSupportPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin / Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={e => setSupportEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency SOS Number</label>
            <input
              type="text"
              value={emergencySosNumber}
              onChange={e => setEmergencySosNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT LOCATION */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-emerald-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>{editingLocationId ? 'Edit Location Details' : 'Add New Golaghat Location'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Town / Village / GP Name</label>
                <input
                  type="text"
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  placeholder="e.g. Kohora Chariali, Dergaon Tiniali, Kamargaon..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Division</label>
                  <select
                    value={locSubDivision}
                    onChange={e => setLocSubDivision(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                  >
                    <option value="Bokakhat">Bokakhat</option>
                    <option value="Golaghat Sadar">Golaghat Sadar</option>
                    <option value="Dergaon">Dergaon</option>
                    <option value="Dhansiri">Dhansiri (Sarupathar)</option>
                    <option value="Morangi">Morangi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Role</label>
                  <input
                    type="text"
                    value={locRole}
                    onChange={e => setLocRole(e.target.value)}
                    placeholder="e.g. Tourism Hub, Gaon Panchayat, Highway"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude (GPS)</label>
                  <input
                    type="text"
                    value={locLat}
                    onChange={e => setLocLat(e.target.value)}
                    placeholder="26.5925"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude (GPS)</label>
                  <input
                    type="text"
                    value={locLng}
                    onChange={e => setLocLng(e.target.value)}
                    placeholder="93.5937"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Landmark / Road Address</label>
                <input
                  type="text"
                  value={locLandmark}
                  onChange={e => setLocLandmark(e.target.value)}
                  placeholder="e.g. Near NRL Main Gate, NH-37, Assam"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white font-display font-black text-xs uppercase tracking-wider shadow-xs transition-all"
                >
                  {editingLocationId ? 'Update Location' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
