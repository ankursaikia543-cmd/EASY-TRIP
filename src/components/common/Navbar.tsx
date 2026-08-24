import React, { useState } from 'react';
import { 
  Compass, 
  Car, 
  ShieldCheck, 
  Globe, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  LogIn,
  MapPin,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { CONTACT_INFO } from '../../utils/initialData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, currentRole, logout, switchDemoUser, driverProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showHelplineMenu, setShowHelplineMenu] = useState(false);

  const handleRoleSelect = (role: UserRole | 'landing') => {
    setShowRoleMenu(false);
    if (role === 'landing') {
      onNavigate('landing');
    } else {
      switchDemoUser(role);
      if (role === 'customer') onNavigate('customer-home');
      else if (role === 'driver') onNavigate('driver-home');
      else if (role === 'admin') onNavigate('admin-dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo Bento Tile with Light Green & Orange Accents */}
          <div 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              ET
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                  EASY TRIP
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Assam
                </span>
              </div>
              <p className="text-[10px] text-orange-600 font-bold hidden sm:flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Bokakhat • Golaghat District
              </p>
            </div>
          </div>

          {/* Center Navigation Bento Pills (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-emerald-50/60 rounded-full border border-emerald-200/80">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                currentView === 'landing' 
                  ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Overview
            </button>

            {user?.role === 'customer' && (
              <>
                <button
                  onClick={() => onNavigate('customer-home')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'customer-home' 
                      ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Book Ride
                </button>
                <button
                  onClick={() => onNavigate('customer-trips')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'customer-trips' 
                      ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  My Trips
                </button>
                <button
                  onClick={() => onNavigate('customer-wallet')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'customer-wallet' 
                      ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Wallet (₹{user.walletBalance || 0})
                </button>
                <button
                  onClick={() => onNavigate('customer-support')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'customer-support' 
                      ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  AI Support
                </button>
              </>
            )}

            {user?.role === 'driver' && (
              <>
                <button
                  onClick={() => onNavigate('driver-home')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'driver-home' 
                      ? 'bg-white text-orange-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Console
                </button>
                <button
                  onClick={() => onNavigate('driver-earnings')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'driver-earnings' 
                      ? 'bg-white text-orange-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Earnings (₹{driverProfile?.todayEarnings || 0})
                </button>
                <button
                  onClick={() => onNavigate('driver-welfare')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                    currentView === 'driver-welfare' 
                      ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                      : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold'
                  }`}
                  title="EPFO & ESIC Government Welfare and Medical Insurance"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>EPFO & ESIC Welfare</span>
                </button>
                <button
                  onClick={() => onNavigate('driver-kyc')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentView === 'driver-kyc' 
                      ? 'bg-white text-orange-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  KYC & Vehicle
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  currentView === 'admin-dashboard' 
                    ? 'bg-white text-slate-900 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Bokakhat Admin Console
              </button>
            )}

            {/* Android APK Download Button in Navbar */}
            <a
              href="/easytrip.apk"
              download
              className="px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-white hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-2xs"
              title="Download Android APK"
            >
              <span>📱 Download APK</span>
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Quick Helplines Popover Button */}
            <div className="relative">
              <button
                onClick={() => setShowHelplineMenu(!showHelplineMenu)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors shadow-2xs cursor-pointer"
                title="Golaghat District Helplines"
              >
                <PhoneCall className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span>Helplines</span>
                <ChevronDown className="w-3 h-3 text-orange-500" />
              </button>

              {showHelplineMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-orange-200 p-3.5 z-50 animate-in fade-in space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Golaghat District Helpline Desk
                    </span>
                    <button onClick={() => setShowHelplineMenu(false)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold">
                    <a href="tel:8638803320" className="flex items-center justify-between p-2 rounded-xl bg-orange-50/70 hover:bg-orange-100 text-orange-900 transition-colors">
                      <span>📞 Primary Helpline</span>
                      <span className="font-mono font-black">8638803320</span>
                    </a>
                    <a href="tel:7002754262" className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 transition-colors">
                      <span>📞 Support Line 2</span>
                      <span className="font-mono font-black">7002754262</span>
                    </a>
                    <a href="tel:9101876404" className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors">
                      <span>📞 Support Line 3</span>
                      <span className="font-mono font-black">9101876404</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <p className="flex items-center gap-1 font-medium text-slate-700">
                      <Mail className="w-3 h-3 text-orange-600 shrink-0" />
                      <a href="mailto:bijaysaikia543@gmail.com" className="hover:underline text-orange-600 font-bold truncate">bijaysaikia543@gmail.com</a>
                    </p>
                    <p className="mt-1 text-slate-400">Office: Bokakhat, Golaghat District, Assam</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Role Switcher Dropdown (Customer & Driver) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all shadow-2xs"
                title="Switch between Customer & Driver roles"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Portal:</span>
                <strong className="text-emerald-700 capitalize font-black">{currentRole}</strong>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-1">
                    Select Portal View (Assam)
                  </div>
                  <button
                    onClick={() => handleRoleSelect('customer')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${user?.role === 'customer' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>👤 Customer {user?.role === 'customer' ? `(${user.name})` : 'Portal'}</span>
                    {user?.role === 'customer' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleRoleSelect('driver')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${user?.role === 'driver' ? 'bg-orange-50 text-orange-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>🚗 Driver {user?.role === 'driver' ? `(${user.name})` : 'Partner Portal'}</span>
                    {user?.role === 'driver' && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors bg-slate-100 text-slate-900 font-bold"
                    >
                      <span>🛡️ Admin Panel Active</span>
                      <CheckCircle2 className="w-4 h-4 text-slate-900" />
                    </button>
                  )}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => handleRoleSelect('landing')}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>🌐 Public Website</span>
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'অসমীয়া/हिन्दी' : 'English'}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3 text-xs rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-emerald-50/50' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile OR Prominent Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div 
                  onClick={() => onNavigate(user.role === 'customer' ? 'customer-profile' : user.role === 'driver' ? 'driver-kyc' : 'admin-dashboard')}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {((user.role === 'driver' && driverProfile?.name) ? driverProfile.name : user.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                      {(user.role === 'driver' && driverProfile?.name) ? driverProfile.name : user.name}
                    </div>
                    <div className="text-[10px] text-orange-600 font-semibold capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Sign In</span>
              </button>
            )}

            {/* Dedicated Login Option Trigger Button when already logged in */}
            {user && (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Open Login Modal for Driver, Admin & Customer"
              >
                <LogIn className="w-3 h-3" />
                <span>Switch / Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-emerald-100 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2">
          
          {/* Mobile Login / Role Quick Switch */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-emerald-900">EASY TRIP Golaghat</p>
              <p className="text-[10px] text-orange-600 font-bold">Office: Bokakhat, Assam</p>
            </div>
            <button
              onClick={() => { onOpenAuth(); setShowMobileMenu(false); }}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Login Portal</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold pt-1">
            <a href="tel:8638803320" className="p-2 rounded-xl bg-orange-100 text-orange-900">📞 8638803320</a>
            <a href="tel:7002754262" className="p-2 rounded-xl bg-emerald-100 text-emerald-900">📞 7002754262</a>
            <a href="tel:9101876404" className="p-2 rounded-xl bg-slate-100 text-slate-900">📞 9101876404</a>
          </div>

          <button
            onClick={() => { onNavigate('landing'); setShowMobileMenu(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Public Website
          </button>
          {user?.role === 'customer' && (
            <>
              <button
                onClick={() => { onNavigate('customer-home'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50"
              >
                Book Ride
              </button>
              <button
                onClick={() => { onNavigate('customer-trips'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                My Trips
              </button>
              <button
                onClick={() => { onNavigate('customer-wallet'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Wallet (₹{user.walletBalance})
              </button>
              <button
                onClick={() => { onNavigate('customer-support'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                AI Support Desk
              </button>
            </>
          )}
          {user?.role === 'driver' && (
            <>
              <button
                onClick={() => { onNavigate('driver-home'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-orange-700 bg-orange-50"
              >
                Driver Console
              </button>
              <button
                onClick={() => { onNavigate('driver-earnings'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Earnings
              </button>
              <button
                onClick={() => { onNavigate('driver-welfare'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between"
              >
                <span>🛡️ EPFO & ESIC Welfare</span>
                <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded-full font-black text-emerald-950">PROFIT & HEALTH</span>
              </button>
              <button
                onClick={() => { onNavigate('driver-kyc'); setShowMobileMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                KYC Documents
              </button>
            </>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => { onNavigate('admin-dashboard'); setShowMobileMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-900 bg-slate-100"
            >
              Admin Dashboard (Bokakhat)
            </button>
          )}
        </div>
      )}
    </header>
  );
};
