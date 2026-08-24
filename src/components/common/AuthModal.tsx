import React, { useState } from 'react';
import { 
  X, 
  User, 
  Car, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, VehicleType } from '../../types';
import { CONTACT_INFO } from '../../utils/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
  onSuccess,
}) => {
  const { user, loginAs, switchDemoUser, allUsers, allDrivers } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Customer Form State
  const [customerPhone, setCustomerPhone] = useState('8638803320');
  const [customerName, setCustomerName] = useState('Ankur Saikia');
  const [customerEmail, setCustomerEmail] = useState('ankursaikia543@gmail.com');
  const [otpCode, setOtpCode] = useState('5432');
  const [otpSent, setOtpSent] = useState(false);

  // Driver Form State
  const [driverPhone, setDriverPhone] = useState('7002754262');
  const [driverName, setDriverName] = useState('Pranjal Bora');
  const [driverVehicle, setDriverVehicle] = useState<VehicleType>('cab');
  const [driverVehicleNo, setDriverVehicleNo] = useState('AS 05 C 4421');
  const [driverTown, setDriverTown] = useState('Bokakhat');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('bijaysaikia543@gmail.com');
  const [adminPin, setAdminPin] = useState('54321');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!otpSent) {
        setOtpSent(true);
        setSuccessMessage('OTP sent to +91 ' + customerPhone + ' (Use 5432 for instant demo)');
        setIsLoading(false);
        return;
      }

      await loginAs('customer', customerEmail || `${customerPhone}@easytrip.in`, customerName || 'Passenger');
      setSuccessMessage('Welcome back, ' + (customerName || 'Passenger') + '!');
      setTimeout(() => {
        onSuccess?.('customer');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginAs('driver', `${driverPhone}@driver.easytrip.in`, driverName || 'Driver Partner');
      setSuccessMessage('Driver Console Activated for ' + (driverName || 'Driver Partner') + ' (' + driverTown + ')');
      setTimeout(() => {
        onSuccess?.('driver');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Driver sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (adminPin !== '54321' && adminPin !== 'admin123') {
        throw new Error('Invalid Security PIN. Enter 54321 or admin123');
      }
      await loginAs('admin', adminEmail, 'Bijay Saikia (Super Admin)');
      setSuccessMessage('Admin Console Authenticated: Bokakhat HQ Control');
      setTimeout(() => {
        onSuccess?.('admin');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSelect = (role: UserRole) => {
    switchDemoUser(role);
    setSuccessMessage(`Switched to ${role.toUpperCase()} Mode!`);
    setTimeout(() => {
      onSuccess?.(role);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 border-emerald-500/20 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header Ribbon in Light Green & Orange */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-orange-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-display font-black uppercase tracking-wider">
              Golaghat District, Assam
            </span>
            <span className="text-[10px] text-emerald-100 font-display font-black uppercase">
              Main Office: Bokakhat
            </span>
          </div>

          <h2 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <span>EASY TRIP LOGIN</span>
          </h2>
          <p className="text-xs text-emerald-50 font-medium mt-1">
            Sign in as Passenger (Customer) or Driver Partner across Golaghat District.
          </p>
        </div>

        {/* 2 Role Selection Tabs for Public Access */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl">
            
            {/* Customer Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('customer');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'customer'
                  ? 'bg-white text-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Customer</span>
            </button>

            {/* Driver Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('driver');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'driver'
                  ? 'bg-white text-orange-800 shadow-md ring-2 ring-orange-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4 text-orange-600" />
              <span>Driver Partner</span>
            </button>

          </div>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. CUSTOMER LOGIN TAB */}
          {selectedRole === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  Passenger Sign In (Golaghat / Bokakhat)
                </span>
                <span className="text-[11px] font-bold text-orange-600">
                  ⚡ Instant OTP
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <span>+91</span>
                    <div className="w-[1px] h-3.5 bg-slate-300 ml-1"></div>
                  </div>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Enter 10-digit number"
                    required
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Ankur Saikia"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-medium text-slate-900 focus:outline-hidden transition-all"
                />
              </div>

              {otpSent && (
                <div className="space-y-1 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 4-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="5432"
                    className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-300 focus:bg-white focus:border-emerald-500 rounded-2xl text-center text-lg font-black tracking-widest text-emerald-900 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-700 font-semibold">Demo PIN prefilled as 5432</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{otpSent ? 'VERIFY OTP & ENTER EASY TRIP' : 'GET LOGIN OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('customer')}
                  className="text-xs font-display font-black uppercase tracking-wider text-orange-600 hover:text-orange-700 underline cursor-pointer"
                >
                  ⚡ Instant Demo Login (Ankur Saikia)
                </button>
              </div>
            </form>
          )}

          {/* 2. DRIVER PARTNER LOGIN TAB */}
          {selectedRole === 'driver' && (
            <form onSubmit={handleDriverLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700">
                  Driver Partner Sign In (Assam Fleet)
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  15% Low Commission
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Driver Phone
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <span>+91</span>
                    <div className="w-[1px] h-3.5 bg-slate-300 ml-1"></div>
                  </div>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    placeholder="Enter 10-digit number"
                    required
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    placeholder="Pranjal Bora"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Town
                  </label>
                  <select
                    value={driverTown}
                    onChange={e => setDriverTown(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden"
                  >
                    <option value="Bokakhat">Bokakhat (HQ)</option>
                    <option value="Kohora">Kohora (Kaziranga)</option>
                    <option value="Numaligarh">Numaligarh</option>
                    <option value="Dergaon">Dergaon</option>
                    <option value="Golaghat Town">Golaghat Town</option>
                    <option value="Bokajan">Bokajan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Category & Number
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { type: 'bike', label: '🏍️ Bike', name: 'Bike' },
                    { type: 'auto', label: '🛺 Auto', name: 'Auto' },
                    { type: 'cab', label: '🚗 Cab', name: 'Cab' },
                  ].map(v => (
                    <button
                      key={v.type}
                      type="button"
                      onClick={() => setDriverVehicle(v.type as VehicleType)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        driverVehicle === v.type
                          ? 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-400/40'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={driverVehicleNo}
                  onChange={e => setDriverVehicleNo(e.target.value.toUpperCase())}
                  placeholder="e.g. AS 05 C 4421"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>OPEN DRIVER CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('driver')}
                  className="text-xs font-display font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  ⚡ Instant Driver Login (Pranjal Bora - Bokakhat)
                </button>
              </div>
            </form>
          )}

          {/* 3. ADMIN PORTAL LOGIN TAB */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-display font-black uppercase tracking-wider text-slate-900">
                  Super Admin Management Portal
                </span>
                <span className="text-[10px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-white">
                  Bokakhat Central Control
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="bijaysaikia543@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Security Passcode / Master PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    placeholder="Enter security PIN"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-2xl text-xs font-mono-num font-black tracking-widest text-slate-900 focus:outline-hidden transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Default Demo Admin PIN: <strong>54321</strong></p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-950 hover:bg-black active:scale-98 text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-xl shadow-slate-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>ENTER ADMIN CONTROL CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('admin')}
                  className="text-xs font-display font-black uppercase tracking-wider text-orange-600 hover:text-orange-700 underline cursor-pointer"
                >
                  ⚡ Instant Admin Login (Bijay Saikia)
                </button>
              </div>
            </form>
          )}

          {/* Quick Helpline Support Footer */}
          <div className="pt-4 border-t border-slate-200 bg-slate-50/80 -mx-6 -mb-6 p-4 rounded-b-[2.5rem] space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-display font-black text-slate-900 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Need Help? Golaghat District Helplines:</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-[11px] font-display font-black text-emerald-800 flex-wrap">
              <a href="tel:8638803320" className="hover:underline">📞 8638803320</a>
              <span>•</span>
              <a href="tel:7002754262" className="hover:underline">📞 7002754262</a>
              <span>•</span>
              <a href="tel:9101876404" className="hover:underline">📞 9101876404</a>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              Mail: <a href="mailto:bijaysaikia543@gmail.com" className="text-orange-600 font-bold hover:underline">bijaysaikia543@gmail.com</a> • Main Office: Bokakhat, Assam
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
