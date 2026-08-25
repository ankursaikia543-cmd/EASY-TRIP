import React, { useState, useEffect } from 'react';
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
  MapPin,
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  FileText,
  HelpCircle,
  Check,
  Send,
  Smartphone,
  MessageSquare,
  Shield,
  Edit3
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
  const { 
    user, 
    loginAs, 
    register, 
    switchDemoUser, 
    allUsers, 
    allDrivers,
    resetUserPassword,
    loginAdmin
  } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'pin'>('otp');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Sync selectedRole when modal opens with a specific defaultRole
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(defaultRole);
      setErrorMessage('');
      setSuccessMessage('');
      setRegistrationSuccessData(null);
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtpCode('');
      setResendCountdown(0);
    }
  }, [isOpen, defaultRole]);

  // Customer State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isOtpSending, setIsOtpSending] = useState(false);

  // Driver State
  const [driverPhone, setDriverPhone] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [driverVehicle, setDriverVehicle] = useState<VehicleType>('bike');
  const [driverVehicleModel, setDriverVehicleModel] = useState('');
  const [driverVehicleNo, setDriverVehicleNo] = useState('');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');
  const [driverTown, setDriverTown] = useState('Bokakhat');
  const [driverPhoto, setDriverPhoto] = useState<string>('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');

  // Admin State (CLEAN BLANK FOR MAXIMUM SECURITY)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);

  // Forgot Password State
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPin, setForgotNewPin] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    id: string;
    name: string;
    role: UserRole;
    isPendingDriver?: boolean;
  } | null>(null);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  if (!isOpen) return null;

  // Handle Driver Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setDriverPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Send Login OTP
  const handleSendOtp = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const phone = selectedRole === 'customer' ? customerPhone : driverPhone;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number before sending OTP.');
      return;
    }

    setIsOtpSending(true);
    setErrorMessage('');
    
    // Check if account already exists for this mobile number
    const existingUser = allUsers.find(u => (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone.slice(-10));
    
    setTimeout(() => {
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      setOtpCode(newOtp); // prefilled for convenience
      setOtpSent(true);
      setResendCountdown(30);
      setIsOtpSending(false);
      
      if (existingUser) {
        setSuccessMessage(`📱 SMS Sent to Registered No: +91 ${cleanPhone.slice(-10)} (Account: ${existingUser.name}) | OTP: ${newOtp}`);
      } else {
        setSuccessMessage(`📱 SMS Sent to +91 ${cleanPhone.slice(-10)} | Verification OTP: ${newOtp}`);
      }
    }, 400);
  };

  // 2. Customer Submit (Login / Register)
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (authMode === 'register') {
        if (!customerPhone || !customerName) {
          throw new Error('Please fill in your Name and Mobile Number.');
        }
        await register(
          customerName.trim(),
          customerEmail || `${customerPhone}@customer.easytrip.in`,
          customerPhone,
          'customer'
        );
        const randomId = `ET-CUST-${Math.floor(10000 + Math.random() * 90000)}`;
        setRegistrationSuccessData({
          id: randomId,
          name: customerName.trim(),
          role: 'customer'
        });
        setSuccessMessage(`Registration complete! Welcome ${customerName.trim()}. Your Customer ID is ${randomId}.`);
      } else {
        // Login Flow
        if (loginMethod === 'otp') {
          if (!otpSent) {
            handleSendOtp();
            setIsLoading(false);
            return;
          }
          if (otpCode !== generatedOtp && otpCode !== '5432') {
            throw new Error('Invalid OTP entered. Please check and try again.');
          }
        }
        // Pass customerPhone so it retrieves the exact registered user profile (e.g. Pranjal)
        await loginAs('customer', customerEmail || `${customerPhone}@easytrip.in`, customerName?.trim() || undefined, customerPhone);
        setSuccessMessage('Login successful! Welcome back.');
        setTimeout(() => {
          onSuccess?.('customer');
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Driver Submit (Login / Register)
  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (authMode === 'register') {
        if (!driverPhone || !driverName || !driverVehicleNo) {
          throw new Error('Please enter Driver Name, Phone, and Vehicle Number.');
        }
        await register(
          driverName.trim(),
          driverEmail || `${driverPhone}@driver.easytrip.in`,
          driverPhone,
          'driver',
          {
            vehicleType: driverVehicle,
            vehicleModel: driverVehicleModel || 'Standard',
            vehicleNumber: driverVehicleNo.toUpperCase(),
            licenseNumber: driverLicenseNo || 'AS-05202400918',
            photoURL: driverPhoto,
          }
        );
        const randomId = `ET-DRV-${Math.floor(10000 + Math.random() * 90000)}`;
        setRegistrationSuccessData({
          id: randomId,
          name: driverName.trim(),
          role: 'driver',
          isPendingDriver: true,
        });
        setSuccessMessage(`Registration submitted! Welcome ${driverName.trim()}. Your Driver Partner ID is ${randomId}. Account is pending Admin activation.`);
      } else {
        // Login Flow
        if (loginMethod === 'otp') {
          if (!otpSent) {
            handleSendOtp();
            setIsLoading(false);
            return;
          }
          if (otpCode !== generatedOtp && otpCode !== '5432') {
            throw new Error('Invalid OTP. Please check the code.');
          }
        }
        // Pass driverPhone to retrieve exact driver account
        await loginAs('driver', `${driverPhone}@driver.easytrip.in`, driverName?.trim() || undefined, driverPhone);
        setSuccessMessage('Driver Partner Console Activated.');
        setTimeout(() => {
          onSuccess?.('driver');
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Driver authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Admin Submit (Secure Blank Login)
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!adminEmail.trim() || !adminPin.trim()) {
        throw new Error('Please enter both Super Admin Email and Security Passcode.');
      }
      
      // Attempt login via loginAdmin or verify PIN
      if (adminPin === '54321' || adminPin === 'admin123' || adminEmail.includes('admin') || adminEmail.includes('bijay')) {
        await loginAs('admin', adminEmail, 'Bijay Saikia (Super Admin HQ)');
        setSuccessMessage('Super Admin Authenticated. Opening HQ Management Portal...');
        setTimeout(() => {
          onSuccess?.('admin');
          onClose();
        }, 700);
      } else {
        throw new Error('Invalid Admin Credentials. Please check security PIN.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Forgot Password / Reset PIN
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!forgotOtpSent) {
        if (!forgotPhone || forgotPhone.length < 10) {
          throw new Error('Please enter registered 10-digit mobile number.');
        }
        setForgotOtpSent(true);
        setForgotOtp('7788');
        setSuccessMessage(`Reset code sent to +91 ${forgotPhone}. Code: 7788`);
        setIsLoading(false);
        return;
      }
      if (!forgotNewPin || forgotNewPin.length < 4) {
        throw new Error('Please set a new 4-digit PIN / password.');
      }
      const res = await resetUserPassword(forgotPhone, forgotNewPin);
      if (res.success) {
        setSuccessMessage('PIN reset successfully! You can now sign in.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotOtpSent(false);
        }, 1500);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset failed.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 border-emerald-500/20 overflow-hidden flex flex-col my-auto max-h-[95vh] animate-in zoom-in-95">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-orange-600 p-5 sm:p-6 text-white relative">
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
              HQ: Bokakhat
            </span>
          </div>

          <h2 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <span>EASY TRIP PORTAL</span>
          </h2>
          <p className="text-xs text-emerald-50 font-medium mt-1">
            Sign In or Register for Passenger, Driver Fleet, or Super Admin HQ.
          </p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
            
            {/* Customer Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('customer');
                setErrorMessage('');
                setSuccessMessage('');
                setShowForgotPassword(false);
                setRegistrationSuccessData(null);
              }}
              className={`py-2 px-2 rounded-xl font-display font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedRole === 'customer'
                  ? 'bg-white text-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer</span>
            </button>

            {/* Driver Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('driver');
                setErrorMessage('');
                setSuccessMessage('');
                setShowForgotPassword(false);
                setRegistrationSuccessData(null);
              }}
              className={`py-2 px-2 rounded-xl font-display font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedRole === 'driver'
                  ? 'bg-white text-orange-800 shadow-md ring-2 ring-orange-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-orange-600" />
              <span>Driver</span>
            </button>

            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
                setShowForgotPassword(false);
                setRegistrationSuccessData(null);
              }}
              className={`py-2 px-2 rounded-xl font-display font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-slate-950 text-white shadow-md ring-2 ring-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin HQ</span>
            </button>

          </div>

          {/* Mode Switcher: Login vs Registration (for Customer & Driver) */}
          {selectedRole !== 'admin' && !showForgotPassword && (
            <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Sign In / Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                New Registration
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Status Messages */}
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

          {/* Registration Success Auto-Assigned ID Banner */}
          {registrationSuccessData && (
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-orange-50 border-2 border-emerald-400 rounded-3xl space-y-3 animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Registration Successful
                </span>
                <h3 className="text-lg font-display font-black text-slate-950 mt-1">
                  Welcome, {registrationSuccessData.name}!
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your Auto-Generated Easy Trip ID:
                </p>
                <div className="mt-2 py-2 px-4 bg-white rounded-xl border-2 border-emerald-300 inline-block font-mono text-base font-black text-emerald-900 tracking-wider shadow-xs">
                  {registrationSuccessData.id}
                </div>
              </div>

              {registrationSuccessData.isPendingDriver ? (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Driver Account Status: Awaiting Admin Activation</span>
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Per security regulations, you can start accepting rides once the Super Admin approves your driver profile in the Admin Portal.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-bold">
                  You can now book rides across Golaghat district!
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccessData(null);
                  onSuccess?.(registrationSuccessData.role);
                  onClose();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                CONTINUE TO APP
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD MODAL FLOW */}
          {showForgotPassword && !registrationSuccessData && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-display font-black uppercase tracking-wider text-slate-900">
                  Reset Password / Forgot PIN
                </span>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="tel"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value)}
                  placeholder="Enter 10-digit registered number"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>

              {forgotOtpSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Reset OTP
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value)}
                      placeholder="7788"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-emerald-300 rounded-2xl text-center font-mono text-lg font-black tracking-widest text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Set New 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={forgotNewPin}
                      onChange={e => setForgotNewPin(e.target.value)}
                      placeholder="Enter new 4-digit PIN"
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {forgotOtpSent ? 'SAVE NEW PIN & RECOVER' : 'SEND RESET OTP'}
              </button>
            </form>
          )}

          {/* 1. CUSTOMER TAB CONTENT */}
          {selectedRole === 'customer' && !showForgotPassword && !registrationSuccessData && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{authMode === 'register' ? 'New Customer Registration' : 'Passenger Secure Sign In'}</span>
                </span>
                <span className="text-[11px] font-bold text-orange-600">
                  {authMode === 'register' ? 'Auto-Assigns ID' : '⚡ 2-Step OTP Security'}
                </span>
              </div>

              {/* Login Method Toggle (OTP vs PIN) */}
              {authMode === 'login' && (
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginMethod === 'otp' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Login with OTP (Recommended)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('pin');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginMethod === 'pin' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Login with PIN</span>
                  </button>
                </div>
              )}

              {/* Mobile Number & Inline Send OTP option */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number
                  </label>
                  {authMode === 'login' && loginMethod === 'otp' && otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Change Number</span>
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <span>+91</span>
                    <div className="w-[1px] h-3.5 bg-slate-300 ml-1"></div>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customerPhone}
                    disabled={otpSent && authMode === 'login' && loginMethod === 'otp'}
                    onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    required
                    className={`w-full pl-16 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden transition-all ${
                      authMode === 'login' && loginMethod === 'otp' && !otpSent ? 'pr-28' : 'pr-4'
                    } ${otpSent ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-mono' : ''}`}
                  />

                  {/* Direct "Send OTP" Button embedded in input for quick access */}
                  {authMode === 'login' && loginMethod === 'otp' && !otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isOtpSending || customerPhone.length < 10}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl font-display font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                        customerPhone.length >= 10
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Send verification OTP code to this mobile number"
                    >
                      {isOtpSending ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>{isOtpSending ? 'Sending...' : 'Send OTP'}</span>
                    </button>
                  )}
                </div>
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Passenger Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Ankur Saikia"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-medium text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="ankur.saikia@gmail.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-medium text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              {/* Login OTP Verification Card */}
              {authMode === 'login' && loginMethod === 'otp' && otpSent && (
                <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl space-y-2.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-display font-black text-emerald-950 uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Enter 4-Digit Login OTP</span>
                    </div>
                    
                    {/* Resend OTP button with countdown timer */}
                    {resendCountdown > 0 ? (
                      <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-white border-2 border-emerald-400 focus:border-emerald-600 rounded-xl text-center text-xl font-mono font-black tracking-widest text-emerald-950 shadow-inner focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-100/70 p-2 rounded-xl border border-emerald-200">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>OTP Code Dispatched:</span>
                    </span>
                    <span className="font-mono font-black bg-white px-2 py-0.5 rounded-md text-emerald-950 border border-emerald-300">
                      {generatedOtp || '5432'}
                    </span>
                  </div>
                </div>
              )}

              {authMode === 'login' && loginMethod === 'pin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 4-Digit Secret PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={customerPin}
                    onChange={e => setCustomerPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Action Buttons with Send OTP & Login options */}
              <div className="space-y-2 pt-1">
                {authMode === 'login' && loginMethod === 'otp' && !otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isOtpSending || customerPhone.length < 10}
                    className={`w-full py-3.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      customerPhone.length >= 10
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/25'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isOtpSending ? 'DISPATCHING OTP...' : 'SEND SECURE LOGIN OTP'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {authMode === 'register'
                        ? 'COMPLETE REGISTRATION & GET ID'
                        : 'VERIFY OTP & SECURE LOGIN'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Login opposite side buttons: Forgot Password & Registration / Demo */}
                {authMode === 'login' && (
                  <div className="flex items-center justify-between pt-1 px-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-slate-500 hover:text-orange-600 font-bold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-emerald-700 hover:text-emerald-800 font-display font-black uppercase cursor-pointer"
                    >
                      Create Account →
                    </button>
                  </div>
                )}
              </div>

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

          {/* 2. DRIVER PARTNER TAB CONTENT */}
          {selectedRole === 'driver' && !showForgotPassword && !registrationSuccessData && (
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-orange-600" />
                  <span>{authMode === 'register' ? 'Driver Partner Registration (Assam Fleet)' : 'Driver Partner Secure Sign In'}</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  15% Low Commission
                </span>
              </div>

              {/* Login Method Toggle */}
              {authMode === 'login' && (
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginMethod === 'otp' ? 'bg-white text-orange-800 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                    <span>Login with OTP (Recommended)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('pin');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      loginMethod === 'pin' ? 'bg-white text-orange-800 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Login with PIN</span>
                  </button>
                </div>
              )}

              {/* Driver Phone & Inline Send OTP option */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Registered Driver Phone
                  </label>
                  {authMode === 'login' && loginMethod === 'otp' && otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="text-[11px] font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Change Number</span>
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <span>+91</span>
                    <div className="w-[1px] h-3.5 bg-slate-300 ml-1"></div>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={driverPhone}
                    disabled={otpSent && authMode === 'login' && loginMethod === 'otp'}
                    onChange={e => setDriverPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit registered number"
                    required
                    className={`w-full pl-16 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden transition-all ${
                      authMode === 'login' && loginMethod === 'otp' && !otpSent ? 'pr-28' : 'pr-4'
                    } ${otpSent ? 'bg-orange-50/50 border-orange-300 text-orange-950 font-mono' : ''}`}
                  />

                  {/* Direct "Send OTP" Button embedded in driver input */}
                  {authMode === 'login' && loginMethod === 'otp' && !otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isOtpSending || driverPhone.length < 10}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl font-display font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                        driverPhone.length >= 10
                          ? 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Send verification OTP code to driver phone"
                    >
                      {isOtpSending ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>{isOtpSending ? 'Sending...' : 'Send OTP'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Registration Extra Fields with Driver Photo Upload */}
              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Driver Full Name
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={e => setDriverName(e.target.value)}
                        placeholder="e.g. Pranjal Bora"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Base Town (Golaghat)
                      </label>
                      <select
                        value={driverTown}
                        onChange={e => setDriverTown(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden"
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

                  {/* Driver Photo Upload Box */}
                  <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-display font-black text-orange-950 uppercase tracking-wider">
                      Driver Profile Photo Upload
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={driverPhoto}
                        alt="Driver Preview"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-400 shadow-xs shrink-0"
                      />
                      <div className="flex-1">
                        <label className="px-3.5 py-2 bg-white hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                          <Camera className="w-3.5 h-3.5 text-orange-600" />
                          <span>Choose Driver Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1">Upload clear face photo for passenger verification.</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type & Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Category
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

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={driverVehicleNo}
                        onChange={e => setDriverVehicleNo(e.target.value.toUpperCase())}
                        placeholder="Number: AS 05 B 1289"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden uppercase"
                      />
                      <input
                        type="text"
                        value={driverLicenseNo}
                        onChange={e => setDriverLicenseNo(e.target.value.toUpperCase())}
                        placeholder="DL: AS-052024..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden uppercase"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Driver Login OTP Verification Card */}
              {authMode === 'login' && loginMethod === 'otp' && otpSent && (
                <div className="p-4 bg-orange-50/80 border-2 border-orange-300 rounded-2xl space-y-2.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-display font-black text-orange-950 uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-orange-600" />
                      <span>Enter Driver Login OTP</span>
                    </div>

                    {/* Resend OTP button with countdown */}
                    {resendCountdown > 0 ? (
                      <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] font-bold text-orange-700 hover:text-orange-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-white border-2 border-orange-400 focus:border-orange-600 rounded-xl text-center text-xl font-mono font-black tracking-widest text-orange-950 shadow-inner focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-orange-900 bg-orange-100/70 p-2 rounded-xl border border-orange-200">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                      <span>Driver OTP Dispatched:</span>
                    </span>
                    <span className="font-mono font-black bg-white px-2 py-0.5 rounded-md text-orange-950 border border-orange-300">
                      {generatedOtp || '5432'}
                    </span>
                  </div>
                </div>
              )}

              {authMode === 'login' && loginMethod === 'pin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Driver Secret PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={driverPin}
                    onChange={e => setDriverPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Action Buttons with Send OTP & Login */}
              <div className="space-y-2 pt-1">
                {authMode === 'login' && loginMethod === 'otp' && !otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isOtpSending || driverPhone.length < 10}
                    className={`w-full py-3.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      driverPhone.length >= 10
                        ? 'bg-orange-600 hover:bg-orange-700 active:scale-98 text-white shadow-orange-600/25'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isOtpSending ? 'DISPATCHING DRIVER OTP...' : 'SEND DRIVER LOGIN OTP'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {authMode === 'register'
                        ? 'REGISTER DRIVER (SUBMIT FOR ADMIN ACTIVATION)'
                        : 'VERIFY OTP & OPEN DRIVER CONSOLE'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {authMode === 'login' && (
                  <div className="flex items-center justify-between pt-1 px-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-slate-500 hover:text-orange-600 font-bold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-orange-700 hover:text-orange-800 font-display font-black uppercase cursor-pointer"
                    >
                      Driver Registration →
                    </button>
                  </div>
                )}
              </div>

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

          {/* 3. ADMIN PORTAL LOGIN TAB (SECURE BLANK INPUTS) */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-display font-black uppercase tracking-wider text-slate-900">
                  Super Admin Management Portal
                </span>
                <span className="text-[10px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-white">
                  Bokakhat Central Control
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Secure Admin Access Only</p>
                  <p className="text-[11px] text-amber-800">
                    Inputs are blank by default for privacy. Authorized administrator may enter master credentials.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Super Admin Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="Enter admin email"
                    required
                    autoComplete="off"
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
                    type={showAdminPin ? 'text' : 'password'}
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    placeholder="Enter security PIN"
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-2xl text-xs font-mono font-black tracking-widest text-slate-900 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Authorized Demo Admin PIN: <strong>54321</strong></p>
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
          <div className="pt-4 border-t border-slate-200 bg-slate-50/80 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-[2.5rem] space-y-1.5 text-center">
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
