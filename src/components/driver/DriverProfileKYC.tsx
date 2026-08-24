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
  Save 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { VehicleType } from '../../types';

export const DriverProfileKYC: React.FC = () => {
  const { driverProfile, updateDriverProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [name, setName] = useState(driverProfile?.name || '');
  const [phone, setPhone] = useState(driverProfile?.phone || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(driverProfile?.vehicleType || 'auto');
  const [vehicleBrand, setVehicleBrand] = useState(driverProfile?.vehicleBrand || 'Bajaj');
  const [vehicleModel, setVehicleModel] = useState(driverProfile?.vehicleModel || 'Compact 4S');
  const [vehicleNumber, setVehicleNumber] = useState(driverProfile?.vehicleNumber || 'DL 01 AB 7890');
  const [licenseNumber, setLicenseNumber] = useState(driverProfile?.licenseNumber || 'DL-042019001234');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriverProfile({
      name,
      phone,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleNumber,
      licenseNumber,
    });
    setIsSaved(true);
    addNotification('Driver Profile Saved', 'Vehicle and contact credentials updated.', 'system');
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
            Verified credentials for Government compliance and road safety.
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
        
        {/* Driver Personal & Contact Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Personal Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
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
