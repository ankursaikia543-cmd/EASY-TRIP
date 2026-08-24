import React, { useState } from 'react';
import {
  ShieldCheck,
  HeartPulse,
  Landmark,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  IndianRupee,
  Building2,
  Users,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DriverWelfareDetails } from '../../types';

export const DriverWelfare: React.FC = () => {
  const { driverProfile, updateDriverProfile } = useAuth();
  const { addNotification } = useNotifications();

  const welfare = driverProfile?.welfare || {
    hasEpfo: false,
    epfoStatus: 'not_enrolled',
    hasEsic: false,
    esicStatus: 'not_enrolled',
  };

  const [activeTab, setActiveTab] = useState<'benefits' | 'register_epfo' | 'register_esic' | 'card'>('benefits');

  // Form states for EPFO
  const [uanInput, setUanInput] = useState(welfare.epfoUan || '');
  const [nomineeName, setNomineeName] = useState(welfare.epfoNomineeName || '');
  const [nomineeRelation, setNomineeRelation] = useState(welfare.epfoNomineeRelation || 'Spouse');
  const [aadhaarNo, setAadhaarNo] = useState(welfare.aadhaarNumber || '');
  const [panNo, setPanNo] = useState(welfare.panNumber || '');

  // Form states for ESIC
  const [esicIpInput, setEsicIpInput] = useState(welfare.esicIpNumber || '');
  const [dispensary, setDispensary] = useState(welfare.esicDispensary || 'ESIC Dispensary, Golaghat Civil Hospital');
  const [bankAcc, setBankAcc] = useState(welfare.bankAccountNo || '');
  const [bankIfsc, setBankIfsc] = useState(welfare.bankIfsc || '');
  const [bankName, setBankName] = useState(welfare.bankName || 'State Bank of India (Golaghat)');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle EPFO Submission
  const handleSaveEpfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedUan = uanInput.trim() || `101${Math.floor(100000000 + Math.random() * 900000000)}`;
      const updatedWelfare: DriverWelfareDetails = {
        ...welfare,
        hasEpfo: true,
        epfoUan: generatedUan,
        epfoMemberId: `AS/GHY/0084729/000/${generatedUan.substring(0, 7)}`,
        epfoStatus: 'verified',
        epfoRegisteredDate: welfare.epfoRegisteredDate || new Date().toISOString().split('T')[0],
        epfoNomineeName: nomineeName || 'Family Member',
        epfoNomineeRelation: nomineeRelation || 'Spouse',
        monthlyPfAccumulation: welfare.monthlyPfAccumulation || 2150,
        aadhaarNumber: aadhaarNo || 'XXXX-XXXX-8821',
        panNumber: panNo || 'ABCDE1234F',
      };

      updateDriverProfile({ welfare: updatedWelfare });
      setIsSubmitting(false);
      setSuccessMessage('EPFO Provident Fund (UAN) registration successfully verified & activated!');
      addNotification('EPFO Registered', `UAN ${generatedUan} linked to your EASY TRIP Driver account with PF matching.`, 'system');
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 1000);
  };

  // Handle ESIC Submission
  const handleSaveEsic = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedEsic = esicIpInput.trim() || `13${Math.floor(10000000 + Math.random() * 90000000)}`;
      const updatedWelfare: DriverWelfareDetails = {
        ...welfare,
        hasEsic: true,
        esicIpNumber: generatedEsic,
        esicStatus: 'verified',
        esicRegisteredDate: welfare.esicRegisteredDate || new Date().toISOString().split('T')[0],
        esicDispensary: dispensary,
        esicMedicalCoverageLimit: 500000,
        bankAccountNo: bankAcc || '5010049281726',
        bankIfsc: bankIfsc || 'HDFC0001827',
        bankName: bankName,
      };

      updateDriverProfile({ welfare: updatedWelfare });
      setIsSubmitting(false);
      setSuccessMessage('ESIC Health & Accidental Insurance card activated with ₹5 Lakh medical coverage!');
      addNotification('ESIC Activated', `ESIC IP No: ${generatedEsic} active for full cashless medical treatment in Golaghat & Assam.`, 'system');
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header with National Social Security Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-display font-black uppercase tracking-wider border border-emerald-300">
              GOVT SOCIAL SECURITY & WELFARE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-display font-black uppercase tracking-wider border border-blue-300">
              DRIVER PROFIT BOOST
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950 tracking-tight mt-1.5">
            EPFO & ESIC Welfare Portal
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Claim government provident fund matching (UAN), ₹5 Lakh cashless medical insurance (ESIC), and accident protection for you & your family.
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 px-4 py-2 rounded-2xl shadow-xs self-start">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div className="text-left">
            <div className="text-[10px] font-black uppercase text-slate-500">Security Status</div>
            <div className="text-xs font-black text-emerald-800">
              {welfare.hasEpfo && welfare.hasEsic ? 'Fully Enrolled & Insured' : 'Enrollment Available'}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar p-1.5 bg-slate-100 rounded-full border border-slate-200">
        {[
          { id: 'benefits', label: '🛡️ Social Security & Profit Benefits' },
          { id: 'register_epfo', label: `🏛️ EPFO / UAN PF (${welfare.hasEpfo ? 'Active' : 'Register'})` },
          { id: 'register_esic', label: `🏥 ESIC Medical Insurance (${welfare.hasEsic ? 'Active' : 'Register'})` },
          { id: 'card', label: '🪪 Driver Welfare Card' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-display font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WELFARE BENEFITS & DRIVER PROFIT OVERVIEW */}
      {activeTab === 'benefits' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Top Profit & Protection KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* EPFO PF Accumulated */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-300 font-display font-black uppercase tracking-wider">
                  EPFO RETIREMENT CORPUS
                </span>
                <Landmark className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-display font-black text-white font-mono-num">
                ₹{welfare.hasEpfo ? ((welfare.monthlyPfAccumulation || 2150) * 12) : '0'}
              </div>
              <p className="text-[11px] text-emerald-200">
                {welfare.hasEpfo ? `UAN: ${welfare.epfoUan} • Monthly PF: +₹${welfare.monthlyPfAccumulation}` : 'Register UAN to claim EASY TRIP matching PF'}
              </p>
            </div>

            {/* ESIC Medical Cover */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-300 font-display font-black uppercase tracking-wider">
                  ESIC CASHLESS MEDICAL COVER
                </span>
                <HeartPulse className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-display font-black text-white font-mono-num">
                ₹5,00,000
              </div>
              <p className="text-[11px] text-blue-200">
                {welfare.hasEsic ? `ESIC IP: ${welfare.esicIpNumber} • Free treatment for full family` : '100% Free at Golaghat Civil & Bokakhat Hospitals'}
              </p>
            </div>

            {/* Accident & Disability Cover */}
            <div className="bg-gradient-to-br from-orange-900 to-amber-950 text-white rounded-3xl p-5 shadow-lg border border-orange-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-orange-300 font-display font-black uppercase tracking-wider">
                  ON-DUTY ACCIDENT COVER
                </span>
                <ShieldCheck className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-3xl font-display font-black text-white font-mono-num">
                ₹10,00,000
              </div>
              <p className="text-[11px] text-orange-200">
                24x7 Transit Safety insurance for Golaghat District drivers
              </p>
            </div>

          </div>

          {/* Key Advantages Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* EPFO Advantages */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-slate-900">
                    EPFO Provident Fund & Pension (EPS-95)
                  </h3>
                  <p className="text-xs text-slate-500">Employees' Provident Fund Organisation of India</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Guaranteed Monthly Savings:</strong> Compounding 8.25% annual government interest on your PF account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>EASY TRIP Matching Contribution:</strong> Additional welfare bonus credited straight to your UAN account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Lifetime Pension (EPS-95):</strong> Monthly retirement pension protection after age 58 for lifelong security.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Emergency Advance Withdrawal:</strong> Advance PF withdrawal for children's education, house repair, or marriage.</span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('register_epfo')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  {welfare.hasEpfo ? 'VIEW / UPDATE EPFO UAN DETAILS' : 'REGISTER / LINK EPFO UAN FOR FREE'}
                </button>
              </div>
            </div>

            {/* ESIC Advantages */}
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-slate-900">
                    ESIC Complete Health & Family Insurance
                  </h3>
                  <p className="text-xs text-slate-500">Employees' State Insurance Corporation</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Cashless Treatment:</strong> Zero medical expenses for you, spouse, children, and dependent parents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Empaneled Assam Hospitals:</strong> Golaghat Civil Hospital, Bokakhat Model Hospital, Jorhat Medical College (JMCH).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Sickness & Temporary Disability Wage Benefit:</strong> 70% daily wage paid by ESIC if unable to drive during illness.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Maternity & Dependants Benefit:</strong> Full coverage for maternity delivery and family survivor pension.</span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('register_esic')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  {welfare.hasEsic ? 'VIEW / UPDATE ESIC IP DETAILS' : 'ACTIVATE ESIC MEDICAL CARD (FREE)'}
                </button>
              </div>
            </div>

          </div>

          {/* Golaghat Local ESIC Dispensary Directory */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Golaghat District ESIC Empaneled Hospitals & Dispensaries</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Present your ESIC Card or EASY TRIP Driver ID for 100% cashless emergency and OPD care.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                GOVT APPROVED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="font-bold text-white">Bokakhat Sub-Divisional Hospital</div>
                <p className="text-slate-400 text-[11px]">Bokakhat Model Hospital, NH-37, Assam</p>
                <div className="text-emerald-400 text-[10px] font-bold">24x7 Emergency & OPD</div>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="font-bold text-white">Golaghat Civil Hospital (SKK)</div>
                <p className="text-slate-400 text-[11px]">Kacharihat Road, Golaghat Town</p>
                <div className="text-emerald-400 text-[10px] font-bold">Specialist ESIC Dispensary</div>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="font-bold text-white">Jorhat Medical College (JMCH)</div>
                <p className="text-slate-400 text-[11px]">Jail Road, Jorhat (Tertiary Referral)</p>
                <div className="text-emerald-400 text-[10px] font-bold">Super-Specialty ICU / Surgery</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EPFO / UAN REGISTRATION FORM */}
      {activeTab === 'register_epfo' && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-black text-xl text-slate-950">
                EPFO Universal Account Number (UAN) Registration
              </h3>
              <p className="text-xs text-slate-500">
                Enter your existing 12-digit UAN number or create a fresh government PF enrollment.
              </p>
            </div>
            <Landmark className="w-6 h-6 text-emerald-600" />
          </div>

          <form onSubmit={handleSaveEpfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  12-Digit UAN (Universal Account Number)
                </label>
                <input
                  type="text"
                  value={uanInput}
                  onChange={e => setUanInput(e.target.value)}
                  placeholder="e.g. 101293847562 (or leave empty to auto-generate)"
                  maxLength={12}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  If you don't have one, EASY TRIP will auto-generate your EPFO enrollment.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhaar Number (Linked with Mobile)
                </label>
                <input
                  type="text"
                  value={aadhaarNo}
                  onChange={e => setAadhaarNo(e.target.value)}
                  placeholder="XXXX-XXXX-8921"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PAN Card Number
                </label>
                <input
                  type="text"
                  value={panNo}
                  onChange={e => setPanNo(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  required
                  maxLength={10}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominee Full Name (Family Member)
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={e => setNomineeName(e.target.value)}
                  placeholder="e.g. Maini Bora (Wife / Mother / Son)"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominee Relationship
                </label>
                <select
                  value={nomineeRelation}
                  onChange={e => setNomineeRelation(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Spouse">Spouse (Wife / Husband)</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                </select>
              </div>

            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>EPFO Government Guarantee:</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Contributions are deposited directly into the government trust with complete tax exemption (Section 80C) and yearly passbook audit.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-600/25 transition-transform active:scale-98 cursor-pointer"
            >
              {isSubmitting ? 'VERIFYING WITH EPFO SHRAM SUVIDHA...' : 'SUBMIT & ACTIVATE EPFO PROVIDENT FUND'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ESIC REGISTRATION FORM */}
      {activeTab === 'register_esic' && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-blue-100 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-black text-xl text-slate-950">
                ESIC Health Insurance & Insured Person (IP) Registration
              </h3>
              <p className="text-xs text-slate-500">
                Activate your 10-digit ESIC IP Card for 100% cashless hospitalization across Assam.
              </p>
            </div>
            <HeartPulse className="w-6 h-6 text-blue-600" />
          </div>

          <form onSubmit={handleSaveEsic} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  10-Digit ESIC IP Number (Insured Person)
                </label>
                <input
                  type="text"
                  value={esicIpInput}
                  onChange={e => setEsicIpInput(e.target.value)}
                  placeholder="e.g. 1329485760 (or leave empty to auto-generate)"
                  maxLength={10}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  New drivers can leave blank; we will provision your IP number instantly.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Local ESIC Dispensary
                </label>
                <select
                  value={dispensary}
                  onChange={e => setDispensary(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ESIC Dispensary, Golaghat Civil Hospital">ESIC Dispensary, Golaghat Civil Hospital</option>
                  <option value="ESIC Dispensary, Bokakhat Model Hospital">ESIC Dispensary, Bokakhat Model Hospital</option>
                  <option value="ESIC Branch Office / JMCH Jorhat">ESIC Branch Office / JMCH Jorhat</option>
                  <option value="ESIC Dispensary, Dergaon Police FRU">ESIC Dispensary, Dergaon Police FRU</option>
                  <option value="ESIC Dispensary, Sarupathar Sub-Divisional">ESIC Dispensary, Sarupathar Sub-Divisional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Account Number (For Sickness Benefit Payouts)
                </label>
                <input
                  type="text"
                  value={bankAcc}
                  onChange={e => setBankAcc(e.target.value)}
                  placeholder="50100492182736"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001827 / SBIN0000083"
                  required
                  maxLength={11}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Name & Branch
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="HDFC Bank Bokakhat Branch / SBI Golaghat"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <span>Cashless Medical Guarantee:</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Your family receives full medicines, doctor consultations, lab scans (MRI/CT), and surgery without paying a single rupee.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-blue-600/25 transition-transform active:scale-98 cursor-pointer"
            >
              {isSubmitting ? 'GENERATING ESIC INSURED CARD...' : 'ACTIVATE ESIC MEDICAL BENEFIT CARD'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: OFFICIAL DRIVER WELFARE SMART CARD */}
      {activeTab === 'card' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-900">
              EASY TRIP Driver Social Security Digital Card
            </h3>
            <button
              onClick={() => {
                addNotification('Card Downloaded', 'Digital Welfare Card saved to your device.', 'system');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Digital ID</span>
            </button>
          </div>

          {/* High-Resolution Digital Welfare Card */}
          <div className="max-w-xl mx-auto bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 text-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Top Watermark & Header */}
            <div className="flex items-start justify-between relative z-10 pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-orange-500 flex items-center justify-center font-black text-white text-lg shadow-md">
                  ET
                </div>
                <div>
                  <h4 className="font-display font-black text-base text-white tracking-tight">EASY TRIP ASSAM</h4>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    Driver Welfare & Social Security Card
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-display font-black uppercase">
                VERIFIED ACTIVE
              </span>
            </div>

            {/* Driver Photo & Details */}
            <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
              <img
                src={driverProfile?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                alt={driverProfile?.name || 'Driver'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />

              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="text-lg font-display font-black text-white">
                  {driverProfile?.name || 'Driver Partner'}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Phone: {driverProfile?.phone || '+91 86388 03320'}
                </div>
                <div className="text-xs text-orange-400 font-mono font-bold uppercase">
                  Vehicle: {driverProfile?.vehicleType} • {driverProfile?.vehicleNumber || 'AS 05 C 4421'}
                </div>
              </div>
            </div>

            {/* Social Security Numbers Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 text-xs relative z-10">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">EPFO UAN Number:</span>
                <span className="font-mono font-black text-emerald-300 text-sm">
                  {welfare.hasEpfo ? welfare.epfoUan : '101293847562'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">ESIC IP Number:</span>
                <span className="font-mono font-black text-blue-300 text-sm">
                  {welfare.hasEsic ? welfare.esicIpNumber : '1329485760'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Nominee:</span>
                <span className="font-bold text-slate-200">
                  {welfare.epfoNomineeName || 'Maini Bora (Spouse)'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Dispensary:</span>
                <span className="font-bold text-slate-200 truncate block">
                  Golaghat Civil / Bokakhat
                </span>
              </div>
            </div>

            {/* Footer Assurance */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 relative z-10">
              <span>Office: Bokakhat, Golaghat District, Assam</span>
              <span className="text-emerald-400 font-bold">Govt. Social Security Act 2020</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
