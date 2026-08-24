import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  TrendingUp, 
  ShieldCheck, 
  Settings, 
  Tag, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Percent, 
  MapPin, 
  Plus, 
  Clock, 
  FileText,
  Filter,
  Check,
  Database,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Search,
  Download,
  Eye,
  Phone,
  Mail,
  Receipt,
  ArrowRight,
  Shield,
  KeyRound,
  X,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Coupon, VehicleType, ComplaintTicket, Ride, UserProfile } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';
import { WebsiteMaintenanceTab } from './WebsiteMaintenanceTab';
import { SupabaseService, SyncLog } from '../../supabase/supabaseService';
import { SUPABASE_PROJECT_ID, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../supabase/config';

export const AdminDashboard: React.FC = () => {
  const { 
    allRides, 
    allDrivers, 
    complaints, 
    platformSettings, 
    coupons, 
    updatePlatformSettings, 
    createCoupon, 
    toggleCoupon, 
    resolveComplaint 
  } = useRide();
  const { 
    allUsers, 
    adminApproveDriver, 
    adminRejectDriver, 
    adminToggleDriverFeeStatus,
    isAdminSlotClaimed, 
    masterAdminAccount 
  } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'maintenance' | 'bookings' | 'customers' | 'analytics' | 'drivers' | 'pricing' | 'coupons' | 'complaints' | 'supabase' | 'admin_slot'>('bookings');

  // Bookings Ledger Search & Filters State
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingVehicleFilter, setBookingVehicleFilter] = useState<string>('all');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState<string>('all');
  const [selectedInspectionRide, setSelectedInspectionRide] = useState<Ride | null>(null);

  // Customer Directory Search State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<UserProfile | null>(null);

  // Supabase State
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'auth_login' | 'ride_booking' | 'payment' | 'driver'>('all');

  useEffect(() => {
    const unsub = SupabaseService.subscribeToLogs((logs) => {
      setSyncLogs(logs);
    });
    return unsub;
  }, []);

  const handleTestSupabaseConnection = async () => {
    setTestingSupabase(true);
    setSupabaseStatusMsg(null);
    try {
      const result = await SupabaseService.testConnection();
      setSupabaseStatusMsg(result);
      addNotification(result.success ? 'Supabase Connected' : 'Supabase Test Notice', result.message, 'system');
    } catch (err: any) {
      setSupabaseStatusMsg({ success: false, message: err?.message || 'Connection test error' });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleCopySqlScript = () => {
    const sql = SupabaseService.getSqlSchemaScript();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    addNotification('SQL Script Copied!', 'Paste and execute this in your Supabase SQL Editor.', 'system');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Pricing Form State
  const [settingsForm, setSettingsForm] = useState(platformSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // New Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('50');
  const [couponType, setCouponType] = useState<'flat' | 'percentage'>('flat');
  const [couponMinFare, setCouponMinFare] = useState('100');

  // AI Complaint State
  const [summarizingTicketId, setSummarizingTicketId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, { summary: string; action: string }>>({});
  const [resolutionNote, setResolutionNote] = useState<Record<string, string>>({});

  // High-Level KPIs
  const completedRides = allRides.filter(r => r.status === 'completed');
  const totalGrossFares = completedRides.reduce((acc, r) => acc + (r.finalFare || 0), 0);
  const totalCommissionEarned = Math.round(totalGrossFares * (platformSettings.commissionRatePercent / 100));
  const activeOnlineDrivers = allDrivers.filter(d => d.onlineStatus === 'online').length;
  const pendingKYCDrivers = allDrivers.filter(d => d.approvalStatus === 'pending');
  const openComplaintsCount = complaints.filter(c => c.status !== 'resolved').length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings(settingsForm);
    setSettingsSaved(true);
    addNotification('Platform Pricing Updated', 'New base fares and commission rates are now live.', 'system');
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    createCoupon({
      code: couponCode.trim().toUpperCase(),
      description: `Special promotional discount coupon ${couponCode.trim().toUpperCase()}`,
      discountValue: parseInt(couponDiscount, 10) || 50,
      discountType: couponType,
      minimumFare: parseInt(couponMinFare, 10) || 100,
      maximumDiscount: couponType === 'percentage' ? 100 : parseInt(couponDiscount, 10) || 50,
      expiryDate: '2026-12-31',
      active: true,
    });

    setCouponCode('');
    addNotification('Coupon Created', `Promo ${couponCode.toUpperCase()} is now active for riders.`, 'system');
  };

  // Filtered Customer Accounts
  const customerUsers = allUsers.filter(u => u.role === 'customer');
  const filteredCustomers = customerUsers.filter(c => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.emergencyContact && c.emergencyContact.includes(q))
    );
  });

  // Filtered Bookings
  const filteredRides = allRides.filter(r => {
    // Status filter
    if (bookingStatusFilter !== 'all') {
      if (bookingStatusFilter === 'active' && (r.status === 'completed' || r.status === 'cancelled')) return false;
      if (bookingStatusFilter !== 'active' && r.status !== bookingStatusFilter) return false;
    }
    // Vehicle filter
    if (bookingVehicleFilter !== 'all' && r.vehicleType !== bookingVehicleFilter) return false;
    // Payment filter
    if (bookingPaymentFilter !== 'all' && r.paymentStatus !== bookingPaymentFilter) return false;
    // Search query
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchCustomer = r.customerName.toLowerCase().includes(q) || r.customerPhone.includes(q);
      const matchDriver = (r.driverName && r.driverName.toLowerCase().includes(q)) || (r.driverPhone && r.driverPhone.includes(q));
      const matchId = r.id.toLowerCase().includes(q) || r.otp.includes(q);
      const matchRoute = r.pickup.address.toLowerCase().includes(q) || r.destination.address.toLowerCase().includes(q);
      if (!matchCustomer && !matchDriver && !matchId && !matchRoute) return false;
    }
    return true;
  });

  // Export Bookings CSV
  const handleExportBookingsCsv = () => {
    const headers = [
      'Booking_ID',
      'Customer_Name',
      'Customer_Phone',
      'Vehicle_Type',
      'Pickup_Address',
      'Destination_Address',
      'Distance_KM',
      'Final_Fare_INR',
      'Payment_Method',
      'Payment_Status',
      'Trip_Status',
      'OTP_PIN',
      'Driver_Name',
      'Driver_Phone',
      'Created_At'
    ];

    const rows = filteredRides.map(r => [
      r.id,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.customerPhone}"`,
      r.vehicleType,
      `"${r.pickup.address.replace(/"/g, '""')}"`,
      `"${r.destination.address.replace(/"/g, '""')}"`,
      r.distanceKm,
      r.finalFare,
      r.paymentMethod,
      r.paymentStatus,
      r.status,
      r.otp,
      `"${(r.driverName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${r.driverPhone || 'N/A'}"`,
      `"${r.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EASY_TRIP_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Bookings Exported', 'CSV spreadsheet downloaded successfully.', 'system');
  };

  // Export Customers CSV
  const handleExportCustomersCsv = () => {
    const headers = [
      'Customer_ID',
      'Name',
      'Email',
      'Phone',
      'Wallet_Balance_INR',
      'Emergency_Contact',
      'Status',
      'Created_At'
    ];

    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      c.walletBalance || 0,
      `"${c.emergencyContact || 'N/A'}"`,
      c.status,
      `"${c.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EASY_TRIP_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Customers Exported', 'Customer directory CSV downloaded successfully.', 'system');
  };

  // AI Summarize & Resolution Generator for Complaints
  const handleAiSummarizeComplaint = async (ticket: ComplaintTicket) => {
    setSummarizingTicketId(ticket.id);
    try {
      const res = await fetch('/api/ai/summarize-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: ticket.category,
          subject: ticket.subject,
          description: ticket.description,
          userName: ticket.userName,
          userRole: ticket.userRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(prev => ({
          ...prev,
          [ticket.id]: {
            summary: data.summary,
            action: data.suggestedAction,
          },
        }));
        setResolutionNote(prev => ({
          ...prev,
          [ticket.id]: data.suggestedAction,
        }));
      }
    } catch {
      setAiSuggestions(prev => ({
        ...prev,
        [ticket.id]: {
          summary: `Dispute regarding ${ticket.subject}. Customer reported: ${ticket.description}`,
          action: 'Issue partial wallet refund of ₹50 and send policy reminder to driver.',
        },
      }));
    } finally {
      setSummarizingTicketId(null);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    const note = resolutionNote[ticketId] || 'Issue investigated and resolved per EASY TRIP terms.';
    await resolveComplaint(ticketId, note);
    addNotification('Complaint Ticket Resolved', `Ticket marked resolved with note sent to user.`, 'system');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Header Bento Tile with Bold Typography */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-white rounded-[2rem] border-2 border-emerald-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-display font-black uppercase tracking-wider">
              BOKAKHAT HQ COMMAND STATION
            </span>
            <span className="text-xs font-display font-black text-emerald-800 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              GOLAGHAT DISTRICT OPS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950 tracking-tight">
            EASY TRIP MANAGEMENT CONSOLE
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Real-time Golaghat District transit orchestration, fleet compliance & revenue tracking • Office: Bokakhat
          </p>
        </div>

        {/* Global Action KPI Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {pendingKYCDrivers.length > 0 && (
            <button
              onClick={() => setActiveTab('drivers')}
              className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-500/25 transition-transform active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{pendingKYCDrivers.length} KYC PENDING</span>
            </button>
          )}

          {openComplaintsCount > 0 && (
            <button
              onClick={() => setActiveTab('complaints')}
              className="px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 border border-orange-300 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-orange-700" />
              <span>{openComplaintsCount} GRIEVANCES</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Bento Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar p-1.5 bg-emerald-50/70 rounded-full border border-emerald-200">
        {[
          { id: 'maintenance', label: '🛠️ WEBSITE MAINTENANCE & CONTROL' },
          { id: 'bookings', label: `📋 ALL BOOKINGS (${allRides.length})` },
          { id: 'customers', label: `👥 CUSTOMERS (${customerUsers.length})` },
          { id: 'analytics', label: '📊 OVERVIEW & KPIS' },
          { id: 'drivers', label: `🚗 DRIVERS & KYC (${allDrivers.length})` },
          { id: 'pricing', label: '💰 PRICING & SURGE' },
          { id: 'coupons', label: `🎟️ COUPONS (${coupons.length})` },
          { id: 'complaints', label: `⚖️ AI GRIEVANCES (${complaints.length})` },
          { id: 'supabase', label: '⚡ SUPABASE DATABASE' },
          { id: 'admin_slot', label: '🔐 ADMIN SLOT (1/1)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-display font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: WEBSITE MAINTENANCE & MASTER CONTROL */}
      {activeTab === 'maintenance' && (
        <WebsiteMaintenanceTab />
      )}

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top KPI Cards Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-[2rem] p-5 border-2 border-emerald-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-800 font-display font-black uppercase tracking-wider">TOTAL GROSS GMV</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-display font-black text-sm">₹</span>
              </div>
              <div className="text-3xl font-display font-black text-slate-950 font-mono-num">₹{totalGrossFares}</div>
              <p className="text-[11px] text-slate-600 font-medium">Across {completedRides.length} completed rides</p>
            </div>

            <div className="bg-white rounded-[2rem] p-5 border-2 border-orange-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-orange-800 font-display font-black uppercase tracking-wider">PLATFORM REVENUE</span>
                <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-display font-black text-sm">📈</span>
              </div>
              <div className="text-3xl font-display font-black text-orange-700 font-mono-num">₹{totalCommissionEarned}</div>
              <p className="text-[11px] text-orange-700 font-medium">{platformSettings.commissionRatePercent}% platform commission</p>
            </div>

            <div className="bg-white rounded-[2rem] p-5 border-2 border-emerald-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-800 font-display font-black uppercase tracking-wider">ACTIVE ONLINE DRIVERS</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-display font-black text-sm">🟢</span>
              </div>
              <div className="text-3xl font-display font-black text-emerald-700 font-mono-num">{activeOnlineDrivers} / {allDrivers.length}</div>
              <p className="text-[11px] text-emerald-800 font-medium">Available for dispatch</p>
            </div>

            <div className="bg-white rounded-[2rem] p-5 border-2 border-orange-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-orange-800 font-display font-black uppercase tracking-wider">PENDING APPROVALS</span>
                <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-display font-black text-sm">⏳</span>
              </div>
              <div className="text-3xl font-display font-black text-orange-600 font-mono-num">{pendingKYCDrivers.length}</div>
              <p className="text-[11px] text-orange-800 font-medium">Require KYC inspection</p>
            </div>

          </div>

          {/* Quick Fleet Breakdown Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Fleet Category Distribution</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>🏍️ Bike Taxi (₹10/km)</span>
                    <span>{allDrivers.filter(d => d.vehicleType === 'bike').length} Drivers</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>🛺 Auto Rickshaw (₹14/km)</span>
                    <span>{allDrivers.filter(d => d.vehicleType === 'auto').length} Drivers</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>🚕 Cab / Sedan (₹18/km)</span>
                    <span>{allDrivers.filter(d => d.vehicleType === 'cab').length} Drivers</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Live Map Preview */}
            <div className="lg:col-span-2 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 px-1">Active City Fleet Telemetry</h3>
              <InteractiveMap heightClass="h-[300px]" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVER PARTNERS & KYC APPROVAL */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Driver Partner Fleet & KYC</h3>
              <p className="text-xs text-slate-500">Inspect vehicle licenses, approve new driver registrations, or suspend accounts.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Driver Partner</th>
                  <th className="pb-3">Vehicle & Plate</th>
                  <th className="pb-3">Driving License</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Mandatory Admin Fee</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3 text-right">Actions & Fee Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allDrivers.map(drv => {
                  const feeDue = drv.feeDueAmount || 0;
                  const isLocked = feeDue > 0 || (drv.isFeePaid === false && (drv.totalRides || 0) > 0);
                  const standardFee = drv.vehicleType === 'cab' ? 50 : 5;

                  return (
                    <tr key={drv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={drv.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={drv.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{drv.name}</div>
                            <span className="text-[11px] text-slate-500 font-mono">{drv.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-800 uppercase">
                          {drv.vehicleType} • {drv.vehicleBrand} {drv.vehicleModel}
                        </div>
                        <span className="font-mono text-[10px] font-black text-slate-700 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-300">
                          {drv.vehicleNumber}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono text-slate-700">
                        {drv.licenseNumber}
                      </td>

                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          drv.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          drv.approvalStatus === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {drv.approvalStatus === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {drv.approvalStatus === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span className="uppercase">{drv.approvalStatus}</span>
                        </span>
                      </td>

                      {/* Mandatory Admin Fee Status */}
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 font-display font-black px-2 py-0.5 rounded-md text-[10px] uppercase ${
                            isLocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {isLocked ? `₹${feeDue || standardFee} Due (App Locked)` : 'Paid / Active'}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Total Paid: ₹{drv.totalFeePaidToAdmin || 0}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-bold text-slate-800">
                        ⭐ {drv.rating || 4.88} ({drv.totalRides || 0})
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {drv.approvalStatus === 'pending' ? (
                            <>
                              <button
                                onClick={() => {
                                  adminApproveDriver(drv.id);
                                  addNotification('Driver Approved', `${drv.name} has been verified and authorized for duty.`, 'system');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  adminRejectDriver(drv.id);
                                  addNotification('Driver Rejected', `${drv.name}'s KYC was declined.`, 'system');
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              {isLocked ? (
                                <button
                                  onClick={() => {
                                    adminToggleDriverFeeStatus(drv.id, true, 0);
                                    addNotification('Fee Cleared', `Unlocked driver app for ${drv.name}. Fee marked cleared.`, 'system');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Mark fee paid and unlock driver application"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Unlock App
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    adminToggleDriverFeeStatus(drv.id, false, standardFee);
                                    addNotification('Fee Lock Imposed', `Imposed ₹${standardFee} mandatory fee on ${drv.name}.`, 'system');
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[11px] border border-rose-200 cursor-pointer"
                                  title="Impose fee due and lock driver application"
                                >
                                  Impose Fee (₹{standardFee})
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MASTER ALL BOOKINGS LEDGER (WITH CUSTOMER DETAILS) */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 shadow-xs space-y-6 animate-in fade-in">
          {/* Header and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider border border-emerald-300">
                  REAL-TIME WEBSITE BOOKING LEDGER
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {filteredRides.length} of {allRides.length} Bookings
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-slate-950 mt-1">
                Passenger Booking Records & Trip Details
              </h3>
              <p className="text-xs text-slate-500">
                Detailed ledger of all rides booked on the website with complete customer contact info, route, driver, and payment tracking.
              </p>
            </div>

            {/* Actions: Export CSV */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportBookingsCsv}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Bookings CSV</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                placeholder="Search Customer, Phone, Trip ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={bookingStatusFilter}
                onChange={e => setBookingStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Ride Statuses</option>
                <option value="completed">Completed Trips</option>
                <option value="active">In Progress / Active</option>
                <option value="searching">Searching Driver</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Vehicle Filter */}
            <div>
              <select
                value={bookingVehicleFilter}
                onChange={e => setBookingVehicleFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Vehicle Types</option>
                <option value="bike">🏍️ EASY Bike</option>
                <option value="auto">🛺 EASY Auto</option>
                <option value="cab">🚗 EASY Cab (AC)</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={bookingPaymentFilter}
                onChange={e => setBookingPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid Trips</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-display font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Trip ID / Time</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Route (Golaghat)</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Fare & Paid</th>
                  <th className="py-3.5 px-4">Status & OTP</th>
                  <th className="py-3.5 px-4">Assigned Driver</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRides.map(ride => (
                  <tr key={ride.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Trip ID & Time */}
                    <td className="py-3.5 px-4 align-top font-mono">
                      <div className="font-bold text-slate-900">{ride.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(ride.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })},{' '}
                        {new Date(ride.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{ride.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <a href={`tel:${ride.customerPhone}`} className="hover:text-emerald-700 hover:underline">
                          {ride.customerPhone}
                        </a>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="text-slate-800 font-medium truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <strong className="text-[11px]">{ride.pickup.address.split(',')[0]}</strong>
                      </div>
                      <div className="text-slate-600 font-medium truncate flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                        <span className="text-[11px]">{ride.destination.address.split(',')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {ride.distanceKm} km • ~{ride.estimatedDurationMin} mins
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4 align-top">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${
                        ride.vehicleType === 'bike' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        ride.vehicleType === 'auto' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {ride.vehicleType === 'bike' && '🏍️ BIKE'}
                        {ride.vehicleType === 'auto' && '🛺 AUTO'}
                        {ride.vehicleType === 'cab' && '🚗 CAB'}
                      </span>
                    </td>

                    {/* Fare & Payment */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-display font-black text-sm text-slate-900 font-mono-num">
                        ₹{ride.finalFare}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded ${
                          ride.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ride.paymentStatus}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          {ride.paymentMethod}
                        </span>
                      </div>
                    </td>

                    {/* Status & OTP */}
                    <td className="py-3.5 px-4 align-top">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        ride.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        ride.status === 'searching' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        ride.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ride.status.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        PIN: <strong className="text-slate-800 font-bold">{ride.otp}</strong>
                      </div>
                    </td>

                    {/* Assigned Driver */}
                    <td className="py-3.5 px-4 align-top">
                      {ride.driverName ? (
                        <div>
                          <div className="font-bold text-slate-900">{ride.driverName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{ride.driverPhone || 'Driver Partner'}</div>
                          {ride.vehicleNumber && (
                            <div className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {ride.vehicleNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <button
                        onClick={() => setSelectedInspectionRide(ride)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        title="View Full Booking Invoice & Customer Route Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredRides.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No bookings found matching your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CUSTOMER DIRECTORY & DETAILS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 shadow-xs space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider border border-emerald-300">
                  PASSENGER REGISTRATION DIRECTORY
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {filteredCustomers.length} Total Customers
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-slate-950 mt-1">
                Registered Customer Accounts & Balances
              </h3>
              <p className="text-xs text-slate-500">
                View all passenger accounts created on the website, wallet balances, total bookings, and safety emergency contacts.
              </p>
            </div>

            {/* Actions: Export Customers */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCustomersCsv}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Customers CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-display font-black uppercase tracking-wider text-slate-500">Total Registered Passengers</div>
              <div className="text-2xl font-display font-black text-slate-900 mt-1">{customerUsers.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] font-display font-black uppercase tracking-wider text-emerald-800">Total Customer Wallet Balance</div>
              <div className="text-2xl font-display font-black text-emerald-700 mt-1 font-mono-num">
                ₹{customerUsers.reduce((sum, c) => sum + (c.walletBalance || 0), 0)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
              <div className="text-[10px] font-display font-black uppercase tracking-wider text-orange-800">Total Platform Trips Booked</div>
              <div className="text-2xl font-display font-black text-orange-700 mt-1">{allRides.length}</div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              placeholder="Search customer by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Customers Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-display font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Customer Name & ID</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Wallet Balance</th>
                  <th className="py-3.5 px-4">Total Trips</th>
                  <th className="py-3.5 px-4">Emergency Contact</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCustomers.map(customer => {
                  const customerRides = allRides.filter(r => r.customerId === customer.id || r.customerPhone === customer.phone);
                  const totalSpent = customerRides.reduce((sum, r) => sum + (r.finalFare || 0), 0);

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                            {customer.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div>{customer.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{customer.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <a href={`tel:${customer.phone}`} className="hover:text-emerald-700 hover:underline">
                          {customer.phone}
                        </a>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {customer.email}
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3.5 px-4 font-display font-black text-emerald-700 font-mono-num">
                        ₹{customer.walletBalance || 0}
                      </td>

                      {/* Total Trips */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {customerRides.length} trips (₹{totalSpent})
                      </td>

                      {/* Emergency Contact */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {customer.emergencyContact ? (
                          <span className="text-orange-700 font-bold">{customer.emergencyContact}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          {customer.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setBookingSearch(customer.name);
                            setActiveTab('bookings');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Trips</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No customer accounts found matching "{customerSearch}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SINGLE MASTER ADMIN SLOT STATUS & SECURITY */}
      {activeTab === 'admin_slot' && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-display font-black uppercase tracking-wider">
                  MASTER SECURITY CONTROLS
                </span>
                <span className="text-xs text-emerald-700 font-display font-black uppercase">
                  Single Slot Architecture Active
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-slate-950 mt-1">
                Single Master Admin Slot Configuration
              </h3>
              <p className="text-xs text-slate-500">
                The platform enforces a strict single administrator model. Only one master admin account exists.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Slot Status Card */}
            <div className="p-6 rounded-[2rem] bg-slate-950 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-display font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SLOT STATUS: 1/1 OCCUPIED & LOCKED</span>
                </span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-xs text-slate-400 uppercase font-black">Authorized Master Administrator</div>
                <div className="text-2xl font-display font-black text-white">
                  {masterAdminAccount?.name || 'Bijay Saikia'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Admin Email:</span>
                  <span className="font-mono text-emerald-400 font-bold">{masterAdminAccount?.email || 'bijaysaikia543@gmail.com'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Office Helpline:</span>
                  <span className="font-mono text-orange-400 font-bold">{masterAdminAccount?.phone || '8638803320'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Security PIN:</span>
                  <span className="font-mono text-white font-bold">54321 / Configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Registration Access:</span>
                  <span className="text-rose-400 font-bold uppercase">Permanently Closed (1/1 Limit)</span>
                </div>
              </div>
            </div>

            {/* Security Guardrails Policy */}
            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <h4 className="font-display font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Single Slot Security Guardrails</span>
              </h4>

              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Public Sign-Ups:</strong> Public admin registration is disabled everywhere in the header and navigation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Footer-Only Entry Point:</strong> The admin login and single-slot setup is restricted exclusively to the Footer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Database Synchronization:</strong> Master admin records and booking ledger sync in real-time to your Supabase project.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: PRICING & SURGE MULTIPLIER CONFIGURATION */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Fare Calculation Engine & Surge Rates</h3>
            <p className="text-xs text-slate-500">Configure base fares, per-kilometer rates, platform commissions, and demand multipliers.</p>
          </div>

          {/* Vehicle Category Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bike */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span>🏍️ EASY Bike Rates</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Fare (₹)</label>
                <input
                  type="number"
                  value={settingsForm.baseFares.bike}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    baseFares: { ...settingsForm.baseFares, bike: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Per-KM Rate (₹/km)</label>
                <input
                  type="number"
                  value={settingsForm.perKmRates.bike}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    perKmRates: { ...settingsForm.perKmRates, bike: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Auto */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span>🛺 EASY Auto Rates</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Fare (₹)</label>
                <input
                  type="number"
                  value={settingsForm.baseFares.auto}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    baseFares: { ...settingsForm.baseFares, auto: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Per-KM Rate (₹/km)</label>
                <input
                  type="number"
                  value={settingsForm.perKmRates.auto}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    perKmRates: { ...settingsForm.perKmRates, auto: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Cab */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span>🚕 EASY Cab Rates</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Fare (₹)</label>
                <input
                  type="number"
                  value={settingsForm.baseFares.cab}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    baseFares: { ...settingsForm.baseFares, cab: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Per-KM Rate (₹/km)</label>
                <input
                  type="number"
                  value={settingsForm.perKmRates.cab}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    perKmRates: { ...settingsForm.perKmRates, cab: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

          </div>

          {/* Surge & Platform Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Commission (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={settingsForm.commissionPercentage}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    commissionPercentage: parseInt(e.target.value, 10) || 15
                  })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Demand Surge Multiplier</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={0.1}
                  min={1.0}
                  max={3.0}
                  value={settingsForm.surgeMultiplier}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    surgeMultiplier: parseFloat(e.target.value) || 1.0
                  })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-500">x</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            UPDATE PLATFORM PRICING MATRIX
          </button>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pricing matrix saved & live across passenger apps!</span>
            </div>
          )}
        </form>
      )}

      {/* TAB 5: PROMO COUPONS ENGINE */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Create Coupon Form (5 Cols) */}
          <form onSubmit={handleCreateCoupon} className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Create New Promo Coupon</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Promo Code</label>
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. MONSOON30"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Amount</label>
                <input
                  type="number"
                  value={couponDiscount}
                  onChange={e => setCouponDiscount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                <select
                  value={couponType}
                  onChange={e => setCouponType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                >
                  <option value="flat">Flat ₹ Off</option>
                  <option value="percentage">% Percentage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Ride Fare (₹)</label>
              <input
                type="number"
                value={couponMinFare}
                onChange={e => setCouponMinFare(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-extrabold rounded-2xl shadow-md transition-colors"
            >
              LAUNCH PROMO COUPON
            </button>
          </form>

          {/* Active Coupons List (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Active Campaign Coupons</h3>

            <div className="space-y-3">
              {coupons.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {c.discountType === 'flat' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Min fare: ₹{c.minimumFare} • Status: {c.active ? '🟢 Active' : '🔴 Inactive'}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleCoupon(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      c.active
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {c.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: GRIEVANCE TICKETS & GEMINI AI DISPUTE ASSISTANT */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">Grievance & Support Desk</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gemini AI Resolution Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Administer passenger disputes, lost items, and driver conduct with AI-assisted resolution summaries.
            </p>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No open complaints registered.</p>
            ) : (
              complaints.map(ticket => {
                const isSummarizing = summarizingTicketId === ticket.id;
                const aiData = aiSuggestions[ticket.id];

                return (
                  <div key={ticket.id} className="p-5 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">#{ticket.id.substring(0, 8)}</span>
                          <span className="font-bold text-xs text-slate-900">{ticket.subject}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Filed by: <strong>{ticket.userName}</strong> ({ticket.userRole}) • Category: {ticket.category}
                        </p>
                      </div>

                      {ticket.status !== 'resolved' && (
                        <button
                          onClick={() => handleAiSummarizeComplaint(ticket)}
                          disabled={isSummarizing}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs shrink-0 self-start"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isSummarizing ? 'AI Analyzing...' : 'Generate AI Resolution'}</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 leading-relaxed">
                      "{ticket.description}"
                    </p>

                    {/* AI Recommendation Box */}
                    {aiData && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs animate-in fade-in">
                        <div className="flex items-center gap-1 text-blue-900 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Gemini AI Policy Recommendation:</span>
                        </div>
                        <p className="text-blue-800 text-[11px] leading-relaxed">
                          <strong>Summary:</strong> {aiData.summary}
                        </p>
                        <p className="text-blue-900 text-[11px] font-semibold">
                          <strong>Recommended Action:</strong> {aiData.action}
                        </p>
                      </div>
                    )}

                    {/* Admin Resolution Input */}
                    {ticket.status !== 'resolved' ? (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={resolutionNote[ticket.id] || ''}
                          onChange={e => setResolutionNote({ ...resolutionNote, [ticket.id]: e.target.value })}
                          placeholder="Type or approve resolution note..."
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                        />
                        <button
                          onClick={() => handleResolveTicket(ticket.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Resolved</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                        <strong>Resolution:</strong> {ticket.adminResponse}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SUPABASE CLOUD DATABASE & BACKEND SYNC CONSOLE */}
      {activeTab === 'supabase' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Supabase Connection Bento Header */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                    <Database className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-950 tracking-tight">
                    SUPABASE POSTGRESQL BACKEND
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider border border-emerald-300">
                    CONNECTED & ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium max-w-2xl">
                  Live cloud database integration. Every customer & driver login, ride booking, fare payment, and grievance ticket is automatically synchronized in real-time to your Supabase project.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleTestSupabaseConnection}
                  disabled={testingSupabase}
                  className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-display font-black uppercase tracking-wider shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
                  <span>{testingSupabase ? 'TESTING...' : 'TEST LIVE CONNECTION'}</span>
                </button>

                <button
                  onClick={handleCopySqlScript}
                  className="px-4 py-2.5 rounded-full bg-slate-950 hover:bg-black active:scale-95 text-white text-xs font-display font-black uppercase tracking-wider shadow-md shadow-slate-950/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL SCRIPT COPIED!' : 'COPY SQL SETUP SCRIPT'}</span>
                </button>

                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>SUPABASE DASHBOARD</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Test Connection Result Alert */}
            {supabaseStatusMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 animate-in fade-in ${
                supabaseStatusMsg.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-orange-50 border-orange-200 text-orange-900'
              }`}>
                {supabaseStatusMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                )}
                <span>{supabaseStatusMsg.message}</span>
              </div>
            )}

            {/* Project Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-slate-500">
                  SUPABASE PROJECT ID
                </span>
                <p className="font-mono-num font-bold text-xs text-slate-900 break-all select-all">
                  {SUPABASE_PROJECT_ID}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">● Active Regional Cluster</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-slate-500">
                  REST / GRAPHQL ENDPOINT
                </span>
                <p className="font-mono-num font-bold text-xs text-slate-900 break-all select-all">
                  {SUPABASE_URL}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">● SSL Secured (HTTPS)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-display font-black uppercase tracking-wider text-slate-500">
                  PUBLISHABLE API KEY
                </span>
                <p className="font-mono-num font-bold text-xs text-slate-900 break-all select-all">
                  {SUPABASE_ANON_KEY.substring(0, 16)}...{SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 8)}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">● Client-Side RLS Auth Token</span>
              </div>
            </div>
          </div>

          {/* Database Tables & Schema Overview Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table Synchronization Counters */}
            <div className="bg-white rounded-[2rem] p-6 border-2 border-emerald-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>SYNCHRONIZED TABLES</span>
                </h3>
                <span className="text-[10px] font-display font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  5 RELATIONAL TABLES
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    table: 'public.users',
                    label: 'User Profiles & Logins',
                    count: allUsers.length,
                    desc: 'Synchronizes customer, driver & admin profiles, wallet balances, phones, and auth sessions.',
                    color: 'emerald',
                  },
                  {
                    table: 'public.rides',
                    label: 'Ride Bookings & Dispatches',
                    count: allRides.length,
                    desc: 'Captures all bookings, pickup/drop coordinates, OTP pins, status dispatches, and fares.',
                    color: 'orange',
                  },
                  {
                    table: 'public.payments',
                    label: 'Payment Transactions',
                    count: allRides.filter(r => r.paymentStatus === 'paid').length,
                    desc: 'Logs UPI transaction IDs, cash collections, customer/driver IDs, and timestamps.',
                    color: 'emerald',
                  },
                  {
                    table: 'public.drivers',
                    label: 'Driver KYC & Fleets',
                    count: allDrivers.length,
                    desc: 'Tracks driver verification status, license/RC KYC documents, vehicle details, and ratings.',
                    color: 'orange',
                  },
                  {
                    table: 'public.complaints',
                    label: 'Grievances & AI Support',
                    count: complaints.length,
                    desc: 'Stores tickets, AI policy recommendations, resolution notes, and passenger feedback.',
                    color: 'slate',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-black text-xs text-slate-900">{item.table}</span>
                        <span className="text-[11px] font-display font-bold text-slate-600">({item.label})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-mono-num font-black text-xs text-slate-900 shadow-2xs shrink-0">
                      {item.count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL Setup Script Preview & 1-Click Execution */}
            <div className="bg-white rounded-[2rem] p-6 border-2 border-emerald-100 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>SUPABASE SQL SCHEMA SCRIPT</span>
                  </h3>
                  <button
                    onClick={handleCopySqlScript}
                    className="px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'COPIED!' : 'COPY SQL'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Run this SQL in your Supabase SQL editor once to create the tables and Row-Level-Security (RLS) policies:
                </p>
                <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto border border-slate-800 space-y-1">
                  <p className="text-emerald-400">-- 1. Create users table</p>
                  <p>CREATE TABLE IF NOT EXISTS public.users (id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, role TEXT, wallet_balance NUMERIC, ...);</p>
                  <p className="text-emerald-400 mt-2">-- 2. Create rides table</p>
                  <p>CREATE TABLE IF NOT EXISTS public.rides (id TEXT PRIMARY KEY, customer_id TEXT, customer_name TEXT, driver_id TEXT, pickup_address TEXT, destination_address TEXT, distance_km NUMERIC, final_fare NUMERIC, status TEXT, ...);</p>
                  <p className="text-emerald-400 mt-2">-- 3. Create payments table</p>
                  <p>CREATE TABLE IF NOT EXISTS public.payments (id TEXT PRIMARY KEY, ride_id TEXT, amount NUMERIC, payment_method TEXT, status TEXT, transaction_id TEXT, ...);</p>
                  <p className="text-emerald-400 mt-2">-- 4. Create drivers & complaints</p>
                  <p>CREATE TABLE IF NOT EXISTS public.drivers (...);</p>
                  <p>CREATE TABLE IF NOT EXISTS public.complaints (...);</p>
                  <p className="text-emerald-400 mt-2">-- 5. Enable RLS Policies</p>
                  <p>CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true);</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-display font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>OPEN SUPABASE SQL EDITOR DIRECTLY</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Real-time Supabase Activity & Sync Stream */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>REAL-TIME SUPABASE SYNC LOG</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Live stream of all database operations executed towards Supabase project: {SUPABASE_PROJECT_ID}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'ALL LOGS' },
                  { id: 'auth_login', label: 'LOGINS' },
                  { id: 'ride_booking', label: 'BOOKINGS' },
                  { id: 'payment', label: 'PAYMENTS' },
                  { id: 'driver', label: 'DRIVERS' },
                ].map(flt => (
                  <button
                    key={flt.id}
                    onClick={() => setLogFilter(flt.id as any)}
                    className={`px-3 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                      logFilter === flt.id
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Stream List */}
            <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
              {syncLogs
                .filter(l => logFilter === 'all' || l.type === logFilter)
                .map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            log.type === 'auth_login'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : log.type === 'ride_booking'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : log.type === 'payment'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : log.type === 'driver'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {log.type.replace('_', ' ')}
                        </span>
                        <span className="font-display font-black text-xs text-slate-900">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {log.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {log.timestamp}
                      </span>
                      <span
                        className={`text-[10px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}

              {syncLogs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sync events logged yet. Perform a login, book a ride, or process a payment to see live stream.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL BOOKING INSPECTION & CUSTOMER AUDIT MODAL */}
      {selectedInspectionRide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div 
            className="bg-white rounded-[2.5rem] max-w-2xl w-full border-2 border-emerald-100 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider">
                    BOOKING INSPECTOR #{selectedInspectionRide.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase ${
                    selectedInspectionRide.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    selectedInspectionRide.status === 'searching' ? 'bg-amber-100 text-amber-800' :
                    selectedInspectionRide.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedInspectionRide.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-slate-950 mt-1.5">
                  Complete Trip & Customer Breakdown
                </h3>
              </div>
              
              <button
                onClick={() => setSelectedInspectionRide(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Driver Twin Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Customer Box */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="text-[10px] font-display font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Customer (Passenger)</span>
                </div>
                <div className="font-display font-black text-base text-slate-900">
                  {selectedInspectionRide.customerName}
                </div>
                <div className="space-y-1 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <a href={`tel:${selectedInspectionRide.customerPhone}`} className="font-mono text-emerald-700 font-bold hover:underline">
                      {selectedInspectionRide.customerPhone}
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedInspectionRide.customerId}
                  </div>
                </div>
              </div>

              {/* Driver Box */}
              <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
                <div className="text-[10px] font-display font-black uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Assigned Driver Partner</span>
                </div>
                <div className="font-display font-black text-base text-slate-900">
                  {selectedInspectionRide.driverName || 'Finding Driver Partner...'}
                </div>
                <div className="space-y-1 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-orange-800 font-bold">{selectedInspectionRide.driverPhone || 'N/A'}</span>
                  </div>
                  {selectedInspectionRide.vehicleNumber && (
                    <div className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-orange-200 inline-block font-bold text-orange-900">
                      Plate: {selectedInspectionRide.vehicleNumber}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Route & Geography */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-[10px] font-display font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trip Route & Coordinates (Golaghat District)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black">Pickup Location:</span>
                    <p className="font-bold text-slate-900">{selectedInspectionRide.pickup.address}</p>
                    {selectedInspectionRide.pickup.landmark && (
                      <span className="text-[11px] text-emerald-700 font-medium">Landmark: {selectedInspectionRide.pickup.landmark}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-orange-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black">Destination Drop:</span>
                    <p className="font-bold text-slate-900">{selectedInspectionRide.destination.address}</p>
                    {selectedInspectionRide.destination.landmark && (
                      <span className="text-[11px] text-orange-700 font-medium">Landmark: {selectedInspectionRide.destination.landmark}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 text-xs text-slate-600 border-t border-slate-200">
                <span>Distance: <strong className="text-slate-900 font-mono-num">{selectedInspectionRide.distanceKm} km</strong></span>
                <span>Est. Duration: <strong className="text-slate-900 font-mono-num">~{selectedInspectionRide.estimatedDurationMin} mins</strong></span>
                <span>Security PIN: <strong className="text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">{selectedInspectionRide.otp}</strong></span>
              </div>
            </div>

            {/* Financials & Payment Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-display font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payment & Fare Breakdown</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-display font-black uppercase ${
                  selectedInspectionRide.paymentStatus === 'paid' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
                }`}>
                  {selectedInspectionRide.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Base Fare</span>
                  <span className="font-mono text-slate-200">₹{selectedInspectionRide.baseFare}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Surge Multiplier</span>
                  <span className="font-mono text-orange-400">{selectedInspectionRide.surgeMultiplier}x</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Coupon Discount</span>
                  <span className="font-mono text-emerald-400">-₹{selectedInspectionRide.discountApplied || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Amount</span>
                  <span className="font-display font-black text-lg text-emerald-400">₹{selectedInspectionRide.finalFare}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Method: <strong className="text-white uppercase">{selectedInspectionRide.paymentMethod}</strong></span>
                {selectedInspectionRide.transactionId && (
                  <span className="font-mono text-[11px]">Txn ID: {selectedInspectionRide.transactionId}</span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInspectionRide(null)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
