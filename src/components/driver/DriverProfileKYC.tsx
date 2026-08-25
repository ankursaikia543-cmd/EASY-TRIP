import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Car, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  Save,
  Camera,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { VehicleType } from '../../types';

export const DriverProfileKYC: React.FC = () => {
  const { driverProfile, updateDriverProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [name, setName] = useState(driverProfile?.name || '');
  const [phone, setPhone] = useState(driverProfile?.phone || '');
  const [photoURL, setPhotoURL] = useState(driverProfile?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');
  const [vehicleType, setVehicleType] = useState<VehicleType>(driverProfile?.vehicleType || 'auto');
  const [vehicleBrand, setVehicleBrand] = useState(driverProfile?.vehicleBrand || 'Bajaj');
  const [vehicleModel, setVehicleModel] = useState(driverProfile?.vehicleModel || 'Compact 4S');
  const [vehicleNumber, setVehicleNumber] = useState(driverProfile?.vehicleNumber || 'AS 05 AB 7890');
  const [licenseNumber, setLicenseNumber] = useState(driverProfile?.licenseNumber || 'AS-052024001234');
  const [isSaved, setIsSaved] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriverProfile({
      name,
      phone,
      photoURL,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleNumber,
      licenseNumber,
    });
    setIsSaved(true);
    addNotification('Driver Profile Saved', 'Photo, vehicle, and contact credentials updated.', 'system');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = driverProfile?.approvalStatus || 'approved';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Driver Partner KYC & Vehicle</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified credentials for Government compliance and passenger safety in Golaghat.
          </p>
        </div>

        {/* Approval Status Badge */}
        <div className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
          status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
          'bg-rose-100 text-rose-800 border border-rose-300'
        }`}>
          {status === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {status === 'pending' && <Clock className="w-4 h-4 text-amber-600" />}
          {status === 'rejected' && <XCircle className="w-4 h-4 text-rose-600" />}
          <span>KYC {status}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Driver Photo & Personal Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-orange-600" />
            <span>Driver Identity & Photo</span>
          </h3>

          {/* Photo Upload Section */}
          <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <img
                src={photoURL}
                alt="Driver Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
              />
              <label className="absolute -bottom-2 -right-2 p-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-xs font-bold text-slate-900">Driver Profile Photo</h4>
              <p className="text-[11px] text-slate-600">
                A clear, front-facing passport-style picture will be displayed to customers when accepting booking requests.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-300 rounded-xl text-xs font-bold text-orange-800 hover:bg-orange-100 cursor-pointer shadow-2xs transition-colors mt-1">
                <Upload className="w-3.5 h-3.5 text-orange-600" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <span>Vehicle Specifications</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Category</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['bike', 'auto', 'cab'] as VehicleType[]).map(vt => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setVehicleType(vt)}
                    className={`p-3 rounded-2xl border text-xs font-black uppercase flex flex-col items-center gap-1 transition-all ${
                      vehicleType === vt
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">
                      {vt === 'bike' ? '🏍️' : vt === 'auto' ? '🛺' : '🚕'}
                    </span>
                    <span>{vt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Make</label>
                <input
                  type="text"
                  value={vehicleBrand}
                  onChange={e => setVehicleBrand(e.target.value)}
                  placeholder="e.g. Maruti / Honda"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  placeholder="e.g. Dzire / Splendor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number Plate</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="DL 01 AB 7890"
                  className="w-full p-2.5 bg-yellow-100 border border-yellow-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:bg-yellow-50 focus:border-blue-500 focus:outline-hidden uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KYC Compliance Documents Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Government Verified Documents</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Driving License (DL)</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified
                </span>
              </div>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                placeholder="DL-042019001234"
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Vehicle RC & Insurance</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono text-[11px] truncate">RC_REG_DL01AB7890.pdf</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>SAVE DRIVER KYC & VEHICLE DETAILS</span>
        </button>

        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Driver details updated successfully!</span>
          </div>
        )}

      </form>
    </div>
  );
};
