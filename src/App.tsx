import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RideProvider, useRide } from './context/RideContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { AuthModal } from './components/common/AuthModal';

// Public Components
import { LandingHome } from './components/public/LandingHome';
import { HowItWorks } from './components/public/HowItWorks';
import { SafetyPage } from './components/public/SafetyPage';
import { DriveWithUs } from './components/public/DriveWithUs';

// Customer Components
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerTrips } from './components/customer/CustomerTrips';
import { CustomerWallet } from './components/customer/CustomerWallet';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { CustomerSupport } from './components/customer/CustomerSupport';

// Driver Components
import { DriverHome } from './components/driver/DriverHome';
import { DriverEarnings } from './components/driver/DriverEarnings';
import { DriverProfileKYC } from './components/driver/DriverProfileKYC';
import { DriverRides } from './components/driver/DriverRides';
import { DriverWelfare } from './components/driver/DriverWelfare';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CONTACT_INFO, GOLAGHAT_TOWNS } from './utils/initialData';
import { MapPin, PhoneCall, Mail, Building2, ShieldCheck, Heart } from 'lucide-react';

// Toast Notification Renderer
const NotificationToasts: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`p-4 rounded-2xl shadow-xl pointer-events-auto border flex items-start justify-between gap-3 text-xs animate-in slide-in-from-bottom-5 ${
            n.type === 'emergency' ? 'bg-red-600 text-white border-red-700' :
            n.type === 'ride' ? 'bg-slate-900 text-white border-slate-800' :
            n.type === 'payment' ? 'bg-emerald-900 text-white border-emerald-800' :
            'bg-white text-slate-900 border-slate-200'
          }`}
        >
          <div>
            <h5 className="font-extrabold text-sm">{n.title}</h5>
            <p className={`mt-0.5 text-xs ${n.type === 'emergency' || n.type === 'ride' || n.type === 'payment' ? 'text-slate-200' : 'text-slate-600'}`}>
              {n.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-xs opacity-70 hover:opacity-100 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// Main App Container
const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Role-based view resolver
  const renderCurrentView = () => {
    // If Admin role is selected, view Admin panel by default unless specific tab selected
    if (user?.role === 'admin' && (currentView === 'home' || currentView === 'admin' || currentView === 'admin-dashboard')) {
      return <AdminDashboard />;
    }

    // If Driver role is selected
    if (user?.role === 'driver') {
      if (currentView === 'home' || currentView === 'driver' || currentView === 'driver-home') return <DriverHome />;
      if (currentView === 'earnings' || currentView === 'driver-earnings') return <DriverEarnings />;
      if (currentView === 'welfare' || currentView === 'driver-welfare' || currentView === 'epfo-esic') return <DriverWelfare />;
      if (currentView === 'profile' || currentView === 'kyc' || currentView === 'driver-kyc') return <DriverProfileKYC />;
      if (currentView === 'rides') return <DriverRides />;
      if (currentView === 'support') return <CustomerSupport />;
    }

    // Public / Customer Views
    switch (currentView) {
      case 'home':
      case 'customer-home':
        return <CustomerHome />;
      case 'trips':
      case 'customer-trips':
        return <CustomerTrips onRebook={() => setCurrentView('customer-home')} />;
      case 'wallet':
      case 'customer-wallet':
        return <CustomerWallet />;
      case 'profile':
      case 'customer-profile':
        return <CustomerProfile />;
      case 'support':
      case 'customer-support':
        return <CustomerSupport />;
      case 'how-it-works':
        return <HowItWorks onBookNow={() => setCurrentView('customer-home')} />;
      case 'safety':
        return <SafetyPage />;
      case 'drive':
        return <DriveWithUs onRegistered={() => setCurrentView('driver-home')} />;
      case 'landing':
        return <LandingHome onBookNow={() => setCurrentView('customer-home')} onDriveWithUs={() => setCurrentView('drive')} />;
      default:
        return <CustomerHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      
      {/* 1. Demo Mode Simulation Switcher Banner with Golaghat Assam Theme */}
      <DemoModeBanner />

      {/* 2. Top Navigation Bar with Light Green & Orange branding */}
      <Navbar 
        currentView={currentView} 
        onNavigate={(v) => setCurrentView(v)} 
        onOpenAuth={() => setIsAuthOpen(true)} 
      />

      {/* 3. Main Viewport */}
      <main className="flex-1 pb-16">
        {renderCurrentView()}
      </main>

      {/* 4. Global Toast Notifications */}
      <NotificationToasts />

      {/* 5. Role Login Modal (Driver, Admin, Customer) */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(role) => {
          if (role === 'customer') setCurrentView('customer-home');
          else if (role === 'driver') setCurrentView('driver-home');
          else if (role === 'admin') setCurrentView('admin-dashboard');
        }}
      />

      {/* 6. Production Footer with Golaghat District Assam Office Details */}
      <footer className="bg-slate-950 text-slate-300 text-xs py-12 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1 & 2: Brand & Official Office */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-orange-500 flex items-center justify-center font-black text-white text-base shadow-md">
                  ET
                </div>
                <div>
                  <span className="font-black text-lg text-white tracking-tight">EASY TRIP</span>
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Golaghat District, Assam</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Dedicated local transport & ride-booking system exclusively serving Golaghat District. Bikes, Autos, and Cabs at honest upfront rates with zero surge pricing.
              </p>

              {/* Official Office Info Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Main Office:</strong> Bokakhat, Golaghat District, Assam, PIN 785612
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  <div>
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:bijaysaikia543@gmail.com" className="text-emerald-400 hover:underline font-mono">
                      bijaysaikia543@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Helplines:</strong>{' '}
                    <span className="text-orange-400 font-black font-mono">8638803320</span>,{' '}
                    <span className="text-emerald-400 font-black font-mono">7002754262</span>,{' '}
                    <span className="text-white font-black font-mono">9101876404</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3: Golaghat Active Hubs */}
            <div>
              <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-3.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active District Hubs</span>
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                {GOLAGHAT_TOWNS.map((town, idx) => (
                  <li key={idx} className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{town.name}</span>
                    <span className="text-[10px] text-slate-600">({town.landmark})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Quick Portals & Login */}
            <div>
              <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-3.5">
                Portal Access
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <button onClick={() => setIsAuthOpen(true)} className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                    <span>🔑 Role Login Portal</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('customer-home')} className="hover:text-white transition-colors">
                    Passenger Booking
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('driver-home')} className="hover:text-white transition-colors">
                    Driver Partner Console
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('admin-dashboard')} className="hover:text-white transition-colors">
                    Bokakhat Admin Console
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('customer-support')} className="hover:text-white transition-colors">
                    24/7 Grievance Desk
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Vehicle Categories & Help */}
            <div>
              <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-3.5">
                Fare Categories
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>🏍️ <strong>EASY Bike Taxi:</strong> ₹25 + ₹9/km</li>
                <li>🛺 <strong>EASY Auto:</strong> ₹35 + ₹13/km</li>
                <li>🚗 <strong>EASY Cab (AC):</strong> ₹60 + ₹17/km</li>
                <li className="pt-2 text-emerald-400 font-mono text-[11px]">
                  ● Golaghat Network Active 🟢
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} EASY TRIP • Bokakhat, Golaghat District, Assam. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Helplines: 8638803320 / 7002754262 / 9101876404</span>
              <span>•</span>
              <span>bijaysaikia543@gmail.com</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <RideProvider>
            <MainContent />
          </RideProvider>
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}
