import React, { useState } from 'react';
import { User, Phone, Mail, ShieldAlert, CheckCircle2, MapPin, Globe, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';

export const CustomerProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { addNotification } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '+91 98111 22334');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      email,
      emergencyContact,
    });
    setIsSaved(true);
    addNotification('Profile Updated', 'Your profile details and emergency SOS contacts have been saved.', 'system');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage contact credentials and emergency safety contacts.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
        
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Personal Information</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (For Driver Calls)</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Phone className="w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (For Tax Invoices)</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Safety & SOS Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="font-extrabold text-sm text-slate-900">Emergency SOS Contact</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            When you trigger the red SOS button, your live location and trip route will be sent to this number automatically.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone Number</label>
            <div className="flex items-center gap-2 bg-rose-50/50 border border-rose-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-rose-500 transition-all">
              <Phone className="w-4 h-4 text-rose-500" />
              <input
                type="tel"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                placeholder="+91 Emergency Contact"
                className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Language Preference */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900">Language Preference</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                language === 'en' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span>English (Default)</span>
              {language === 'en' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                language === 'hi' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span>हिन्दी (Hindi)</span>
              {language === 'hi' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>SAVE PROFILE SETTINGS</span>
        </button>

        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully updated!</span>
          </div>
        )}
      </form>

    </div>
  );
};
