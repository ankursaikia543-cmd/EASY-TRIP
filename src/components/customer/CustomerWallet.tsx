import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const CustomerWallet: React.FC = () => {
  const { user, topUpWallet } = useAuth();
  const { addNotification } = useNotifications();

  const [amountInput, setAmountInput] = useState<string>('250');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const predefinedAmounts = [100, 250, 500, 1000];

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amountInput, 10);
    if (!num || num <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      topUpWallet(num);
      setIsProcessing(false);
      setSuccessNotice(`₹${num} added to your EASY TRIP Wallet via UPI!`);
      addNotification('Wallet Top-Up Successful', `₹${num} credited to your EASY TRIP balance.`, 'payment');
      setTimeout(() => setSuccessNotice(null), 4000);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EASY TRIP Wallet</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Enjoy 1-click seamless cashless checkouts and instant cashback refunds.
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Available Balance</span>
              <div className="text-3xl font-black text-white">₹{user?.walletBalance || 0}</div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Safe Escrow
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>Active for 1-Click Ride Auto-Debit</span>
          <span className="text-blue-400 font-semibold">Zero transaction surcharge</span>
        </div>
      </div>

      {/* Add Money Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add Money to Wallet</span>
        </h3>

        {/* Quick Amount Chips */}
        <div className="flex gap-2">
          {predefinedAmounts.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmountInput(amt.toString())}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                amountInput === amt.toString()
                  ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              + ₹{amt}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddMoney} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
            <input
              type="number"
              value={amountInput}
              onChange={e => setAmountInput(e.target.value)}
              placeholder="Enter amount (₹)"
              min={10}
              max={10000}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Processing UPI Mandate...</span>
            ) : (
              <span>PROCEED TO RECHARGE ₹{amountInput}</span>
            )}
          </button>
        </form>

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}
      </div>

      {/* Simulated Transaction Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Recent Wallet Activity</h3>
        
        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">UPI Top-Up</p>
                <span className="text-[10px] text-slate-400">Today, Instant</span>
              </div>
            </div>
            <span className="font-extrabold text-emerald-600">+ ₹{amountInput}</span>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Ride Payment (Auto - Karol Bagh)</p>
                <span className="text-[10px] text-slate-400">Yesterday</span>
              </div>
            </div>
            <span className="font-extrabold text-slate-900">- ₹121</span>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Welcome Cashback (Promo EASY50)</p>
                <span className="text-[10px] text-slate-400">3 days ago</span>
              </div>
            </div>
            <span className="font-extrabold text-emerald-600">+ ₹50</span>
          </div>
        </div>
      </div>

    </div>
  );
};
