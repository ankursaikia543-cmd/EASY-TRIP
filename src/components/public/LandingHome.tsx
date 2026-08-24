import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  IndianRupee, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  Car, 
  Users, 
  Navigation,
  KeyRound,
  ShieldAlert,
  Star,
  MapPin,
  PhoneCall,
  Mail,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CONTACT_INFO, GOLAGHAT_TOWNS } from '../../utils/initialData';

interface LandingHomeProps {
  onBookNow: () => void;
  onDriveWithUs: () => void;
}

export const LandingHome: React.FC<LandingHomeProps> = ({ onBookNow, onDriveWithUs }) => {
  const { user, loginAsRole } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-16 py-8 animate-in fade-in">
      
      {/* 1. Hero Section with Bold Typography & Light Green & Orange Branding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Copy with Bold Typography */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-black tracking-wide shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-display font-extrabold uppercase tracking-eyebrow text-[10px]">GOLAGHAT DISTRICT • ASSAM LOCAL RIDE NETWORK</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-slate-950 tracking-tightest leading-[0.96]">
              EVERY RIDE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-orange-500">
                FAIR, FAST & LOCAL.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
              The dedicated high-frequency transit network connecting <strong className="text-slate-950 font-black">Bokakhat</strong>, <strong className="text-slate-950 font-black">Kohora (Kaziranga)</strong>, <strong className="text-slate-950 font-black">Numaligarh</strong>, <strong className="text-slate-950 font-black">Dergaon</strong>, <strong className="text-slate-950 font-black">Golaghat Town</strong>, and <strong className="text-slate-950 font-black">Bokajan</strong>.
            </p>

            {/* Bold Numeric Stats Strip */}
            <div className="grid grid-cols-3 gap-3 py-2 max-w-lg">
              <div className="p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
                <div className="font-display font-black text-2xl sm:text-3xl text-emerald-700 font-mono-num tracking-tightest">₹9<span className="text-xs font-bold text-slate-500">/km</span></div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5">Bike Fare Starting</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-orange-200/80 shadow-2xs">
                <div className="font-display font-black text-2xl sm:text-3xl text-orange-600 font-mono-num tracking-tightest">3 <span className="text-xs font-bold text-slate-500">MIN</span></div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5">Average ETA</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
                <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 font-mono-num tracking-tightest">0%</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5">Surge Guarantee</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={onBookNow}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white font-display font-black text-sm tracking-wider uppercase shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <span>BOOK A LOCAL RIDE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onDriveWithUs}
                className="px-6 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-slate-900 border-2 border-emerald-200 font-display font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Car className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>PARTNER WITH US</span>
              </button>
            </div>

            {/* Trust highlights with bold typography */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-800 font-extrabold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Zero Hidden Rates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Assam Verified KYC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-600 stroke-[2.5]" />
                <span>Bokakhat HQ Support</span>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive Showcase Card (Golaghat Transit Hubs) */}
          <div className="lg:col-span-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-900 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-orange-400 font-extrabold uppercase tracking-wider">Golaghat District</span>
                <h3 className="text-xl font-black text-white">Live Transit Hubs</h3>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Assam State
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Bike Pill */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-xl">🏍️</div>
                  <div>
                    <div className="font-extrabold text-sm">EASY Bike Taxi</div>
                    <p className="text-[11px] text-slate-300">Kaziranga & Town Express • ₹9/km</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-emerald-400">2 min ETA</span>
              </div>

              {/* Auto Pill */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-orange-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-xl">🛺</div>
                  <div>
                    <div className="font-extrabold text-sm">EASY Auto (3-Seater)</div>
                    <p className="text-[11px] text-slate-300">Local Town Commute • ₹13/km</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-orange-400">3 min ETA</span>
              </div>

              {/* Cab Pill */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-xl">🚗</div>
                  <div>
                    <div className="font-extrabold text-sm">EASY Cab / Prime (AC)</div>
                    <p className="text-[11px] text-slate-300">Inter-Town Highway Sedan • ₹17/km</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-emerald-400">4 min ETA</span>
              </div>
            </div>

            {/* Quick Contact snippet */}
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span>🏢 Bokakhat Main HQ</span>
                <span className="text-orange-400 font-mono">8638803320</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Helplines: 7002754262 • 9101876404 | bijaysaikia543@gmail.com
              </p>
            </div>

            <button
              onClick={onBookNow}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600 text-white font-black text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              Start Instant Booking (Golaghat)
            </button>
          </div>

        </div>
      </section>

      {/* 2. 6 Golaghat District Active Hubs Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-950 text-xs font-black uppercase tracking-eyebrow">
            <MapPin className="w-3.5 h-3.5 stroke-[2.5]" /> GOLAGHAT DISTRICT COVERAGE
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-950 tracking-tight">
            CONNECTING ALL 6 TRANSIT HUBS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
            High-availability point-to-point transit across all key sub-divisions, tea estates, refineries, and Kaziranga gates.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {GOLAGHAT_TOWNS.map((town, idx) => (
            <div 
              key={idx}
              onClick={onBookNow}
              className="p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-lg font-bold">
                📍
              </div>
              <h3 className="font-display font-black text-base text-slate-900 mt-2.5 group-hover:text-emerald-800 transition-colors tracking-tight">
                {town.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{town.landmark}</p>
              <span className="text-[9px] mt-2.5 inline-block px-2 py-0.5 rounded-md bg-orange-100 text-orange-950 font-display font-black tracking-wider uppercase">
                {town.name === 'Bokakhat' ? 'MAIN HQ' : 'ACTIVE HUB'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 3 Vehicle Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black uppercase tracking-eyebrow">
            TRANSPARENT TARIFF MATRIX
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-950 tracking-tight">
            TAILORED FOR EVERY ASSAM ROUTE
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            From swift solo trips along NH-37 to family travel between Bokakhat, Kohora, and Golaghat Town.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Bike */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200/80 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-3xl font-black">
              🏍️
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xl text-slate-950 tracking-tight">EASY BIKE TAXI</h3>
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                  FASTEST ETA
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Ideal for quick solo trips across Bokakhat market, Kohora gates, or Dergaon junction. Standard sanitized helmet provided.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">BASE + DISTANCE</span>
                <span className="font-display font-black text-xl text-slate-950 font-mono-num">₹25 + ₹9<span className="text-xs font-bold text-slate-600">/km</span></span>
              </div>
              <span className="text-emerald-800 font-display font-black text-xs uppercase px-2 py-1 rounded bg-emerald-50 border border-emerald-200">Solo Rider</span>
            </div>
          </div>

          {/* Card 2: Auto */}
          <div className="bg-white rounded-3xl p-6 border-2 border-orange-200/80 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-900 flex items-center justify-center text-3xl font-black">
              🛺
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xl text-slate-950 tracking-tight">EASY AUTO</h3>
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-orange-950 bg-orange-100 px-2.5 py-1 rounded-md border border-orange-300">
                  MOST POPULAR
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                The trusted 3-seater for local market runs, colleges, and medical emergencies across Golaghat district. Guaranteed digital fare.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">BASE + DISTANCE</span>
                <span className="font-display font-black text-xl text-slate-950 font-mono-num">₹35 + ₹13<span className="text-xs font-bold text-slate-600">/km</span></span>
              </div>
              <span className="text-orange-900 font-display font-black text-xs uppercase px-2 py-1 rounded bg-orange-50 border border-orange-200">Up to 3 Riders</span>
            </div>
          </div>

          {/* Card 3: Cab */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200/80 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-3xl font-black">
              🚗
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xl text-slate-950 tracking-tight">EASY CAB PRIME</h3>
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                  AC COMFORT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Spacious air-conditioned sedans & hatchbacks for Numaligarh NRL visits, Kaziranga safaris, or long distance highway trips.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">BASE + DISTANCE</span>
                <span className="font-display font-black text-xl text-slate-950 font-mono-num">₹60 + ₹17<span className="text-xs font-bold text-slate-600">/km</span></span>
              </div>
              <span className="text-emerald-800 font-display font-black text-xs uppercase px-2 py-1 rounded bg-emerald-50 border border-emerald-200">Up to 4 Riders</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Safety & Office Contact Section */}
      <section className="bg-slate-950 text-white py-16 rounded-[2.5rem] mx-4 sm:mx-6 lg:mx-8 border border-emerald-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-display font-black uppercase tracking-eyebrow text-emerald-400">GOLAGHAT DISTRICT HEADQUARTERS</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              MAIN OFFICE: BOKAKHAT, ASSAM
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Emergency support desk, verified driver onboarding, and 24/7 dedicated helpline network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-900/90 p-6 rounded-3xl border-2 border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <PhoneCall className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-lg text-white">24/7 DISTRICT HELPLINES</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Direct hotline assistance: <strong className="text-orange-400 font-mono-num font-black">8638803320</strong>, <strong className="text-emerald-400 font-mono-num font-black">7002754262</strong>, and <strong className="text-white font-mono-num font-black">9101876404</strong>.
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-3xl border-2 border-orange-500/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Mail className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-lg text-white">OFFICIAL DESK EMAIL</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Direct inquiries to: <a href="mailto:bijaysaikia543@gmail.com" className="text-emerald-300 font-mono font-bold hover:underline">bijaysaikia543@gmail.com</a>
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-3xl border-2 border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-lg text-white">VERIFIED ASSAM KYC</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Every driver across Bokakhat, Kohora, and Golaghat holds a verified DL, police verification, and valid commercial permit.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Drive With Us Partner Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-orange-700 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-display font-black uppercase tracking-eyebrow text-orange-200">DRIVER PARTNER PROGRAM (ASSAM)</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight">
              EARN UP TO ₹35,000 / MONTH IN GOLAGHAT
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Drive your Bike, Auto, or Cab in Bokakhat, Numaligarh, Kohora, Dergaon, Golaghat, or Bokajan with low 12% commission and instant daily UPI payouts.
            </p>
          </div>

          <button
            onClick={onDriveWithUs}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-xl flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            <span>JOIN AS DRIVER PARTNER</span>
            <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[3]" />
          </button>
        </div>
      </section>

    </div>
  );
};
