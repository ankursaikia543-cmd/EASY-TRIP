import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { 
    isAdminSlotClaimed, 
    masterAdminAccount, 
    claimSingleAdminSlot, 
    loginAdmin, 
    resetAdminSlot 
  } = useAuth();
  const { addNotification } = useNotifications();

  // Mode: 'login' or 'create_single_slot'
  const [viewMode, setViewMode] = useState<'login' | 'create_single_slot'>(
    isAdminSlotClaimed ? 'login' : 'create_single_slot'
  );

  // Setup Form State (Claim Single Slot)
  const [setupName, setSetupName] = useState('Bijay Saikia');
  const [setupEmail, setSetupEmail] = useState('bijaysaikia543@gmail.com');
  const [setupPhone, setSetupPhone] = useState('8638803320');
  const [setupPin, setSetupPin] = useState('54321');
  const [setupPinConfirm, setSetupPinConfirm] = useState('54321');

  // Login Form State
  const [loginIdent, setLoginIdent] = useState(masterAdminAccount?.email || 'bijaysaikia543@gmail.com');
  const [loginPin, setLoginPin] = useState('54321');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Handle Single Slot Master Admin Registration
  const handleClaimSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!setupName.trim()) throw new Error('Please enter your Admin Full Name.');
      if (!setupEmail.trim()) throw new Error('Please enter your Official Admin Email.');
      if (!setupPhone.trim()) throw new Error('Please enter your Admin Phone Number.');
      if (!setupPin.trim() || setupPin.length < 4) throw new Error('Security PIN must be at least 4 characters.');
      if (setupPin !== setupPinConfirm) throw new Error('Security PINs do not match. Please re-check.');

      await claimSingleAdminSlot(setupName, setupEmail, setupPhone, setupPin);
      
      setSuccessMessage('🎉 Master Admin Account Created & Single Slot Locked! Redirecting...');
      addNotification('Admin Slot Claimed', `Master Admin account ${setupName} is now initialized.`, 'system');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to claim admin slot.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Master Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!loginIdent.trim()) throw new Error('Please enter your Admin Email or Phone Number.');
      if (!loginPin.trim()) throw new Error('Please enter your Security PIN.');

      await loginAdmin(loginIdent, loginPin);

      setSuccessMessage('✓ Admin Access Verified: Bokakhat HQ Dashboard Authorized.');
      addNotification('Admin Logged In', `Authenticated as Master Admin (${loginIdent}).`, 'system');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSlotConfirm = () => {
    if (window.confirm('Are you sure you want to release the Master Admin slot? This will allow creating a new admin account.')) {
      resetAdminSlot();
      setViewMode('create_single_slot');
      setErrorMessage('');
      setSuccessMessage('Admin slot released. You can now configure the single master admin.');
      addNotification('Slot Released', 'Master admin slot is now open for configuration.', 'system');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 border-emerald-500/30 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header Ribbon with Luxury Dark Green & Gold Styling */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 p-6 text-white relative border-b border-emerald-500/30">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-display font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              EXCLUSIVE FOOTER ADMIN PORTAL
            </span>
            <span className="text-[10px] text-slate-300 font-display font-black uppercase">
              Bokakhat HQ, Assam
            </span>
          </div>

          <h2 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <span>MASTER ADMIN ACCESS</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Access all passenger bookings, customer profiles, live dispatches, and platform ledger.
          </p>
        </div>

        {/* Slot Status Banner */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAdminSlotClaimed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-bounce'}`} />
              <span className="font-display font-black text-white uppercase text-[11px] tracking-wider">
                {isAdminSlotClaimed ? '1/1 Master Admin Slot Claimed & Locked' : 'Single Admin Slot Available (1 Slot)'}
              </span>
            </div>

            {isAdminSlotClaimed ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-display font-black uppercase">
                🔒 REGISTRATION LOCKED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-display font-black uppercase">
                ⚡ UNCLAIMED
              </span>
            )}
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: CLAIM THE SINGLE ADMIN SLOT (If not claimed or in setup mode) */}
          {viewMode === 'create_single_slot' && !isAdminSlotClaimed && (
            <form onSubmit={handleClaimSlot} className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-display font-black text-xs text-amber-900 uppercase">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>ONE-TIME MASTER ADMIN REGISTRATION</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  You are creating the <strong>single official master administrator account</strong> for EASY TRIP. Once registered, this slot will be permanently locked and no other user can create an admin account.
                </p>
              </div>

              {/* Admin Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                  Admin Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={setupName}
                    onChange={e => setSetupName(e.target.value)}
                    placeholder="e.g. Bijay Saikia"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Official Email */}
              <div className="space-y-1">
                <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                  Official Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={e => setSetupEmail(e.target.value)}
                    placeholder="e.g. bijaysaikia543@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Official Phone */}
              <div className="space-y-1">
                <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                  Admin Phone (Bokakhat Office Helpline)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={setupPhone}
                    onChange={e => setSetupPhone(e.target.value)}
                    placeholder="e.g. 8638803320"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* PIN / Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                    Master PIN / Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={setupPin}
                      onChange={e => setSetupPin(e.target.value)}
                      placeholder="e.g. 54321"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                    Confirm PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={setupPinConfirm}
                      onChange={e => setSetupPinConfirm(e.target.value)}
                      placeholder="Re-enter PIN"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Claim Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'CREATING MASTER ACCOUNT...' : 'CLAIM SINGLE ADMIN SLOT & INITIALIZE'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* VIEW 2: LOGIN WITH THE CLAIMED ADMIN ACCOUNT (Slot is occupied) */}
          {(viewMode === 'login' || isAdminSlotClaimed) && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in">
              {/* Account Locked Notice */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-xs text-slate-900 uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MASTER ADMIN ACCOUNT (1/1 LOCKED)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Bokakhat Office HQ
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Configured Admin: <strong>{masterAdminAccount?.name || 'Bijay Saikia'}</strong> ({masterAdminAccount?.email || 'bijaysaikia543@gmail.com'})
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  * Public admin registration is closed. Only the master admin can log in.
                </p>
              </div>

              {/* Email / Phone */}
              <div className="space-y-1">
                <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                  Admin Email or Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdent}
                    onChange={e => setLoginIdent(e.target.value)}
                    placeholder="bijaysaikia543@gmail.com or 8638803320"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Security PIN */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700">
                    Security PIN / Password
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Default: 54321
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPin}
                    onChange={e => setLoginPin(e.target.value)}
                    placeholder="Enter Master PIN (54321)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-black active:scale-98 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'LOGIN TO ADMIN CONSOLE'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Admin Slot Reset / Reconfigure Control (Discreet) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Want to re-register the single admin slot?</span>
                <button
                  type="button"
                  onClick={handleResetSlotConfirm}
                  className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Release & Reclaim Slot</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
