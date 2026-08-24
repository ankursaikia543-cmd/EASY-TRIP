import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Bot,
  PhoneCall,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ComplaintTicket } from '../../types';
import { CONTACT_INFO } from '../../utils/initialData';

export const CustomerSupport: React.FC = () => {
  const { complaints, submitComplaint } = useRide();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // AI Assistant Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; poweredBy?: string }>>([
    {
      sender: 'ai',
      text: language === 'hi'
        ? 'নমস্কাৰ / नमस्ते! मैं ईज़ी ट्रिप गोलाघाट डिस्ट्रिक्ट (असम) का 24/7 AI सपोर्ट असिस्टेंट हूँ। आप बोकाखात, कोहोरा, नूमलीगढ़, देरगांव, गोलाघाट टाउन और बोकाजान के राइड, किराए और हेल्पलाइन के बारे में पूछ सकते हैं।'
        : 'Hello! I am your EASY TRIP 24/7 Golaghat District AI Support Specialist. How can I assist you with your rides across Bokakhat, Kohora, Numaligarh, Dergaon, Golaghat Town, or Bokajan today?',
      poweredBy: 'EASY TRIP Golaghat Policy Engine',
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Grievance Ticket Form State
  const [category, setCategory] = useState<ComplaintTicket['category']>('fare_dispute');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const quickQuestions = [
    t.q1,
    t.q2,
    'What is Bokakhat Main Office phone number?',
    'What are the Golaghat district fare rates?',
  ];

  const handleSendAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = queryText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputQuery('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          userRole: user?.role || 'customer',
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply, poweredBy: data.poweredBy }]);
      } else {
        throw new Error('Support network error');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you for reaching out to EASY TRIP Golaghat District Desk. Our Main Office is located in Bokakhat, Assam. For urgent assistance, please call our 24/7 Helplines: ${CONTACT_INFO.helplineNumbers.join(', ')} or email ${CONTACT_INFO.email}.`,
          poweredBy: 'EASY TRIP Policy Engine',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    await submitComplaint(category, subject, description);
    setTicketSubmitted(true);
    setSubject('');
    setDescription('');
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  const myTickets = complaints.filter(c => !user || c.userId === user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in">
      
      {/* Header with Light Green & Orange theme */}
      <div className="p-6 bg-gradient-to-r from-emerald-50 via-white to-orange-50 rounded-[2rem] border border-emerald-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              EASY TRIP Golaghat Support Desk
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Assam 24/7
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Official helpline, ticket grievance escalation & Gemini AI policy assistant for Golaghat District.
          </p>
        </div>

        {/* Official Contact Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <a href="tel:8638803320" className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>8638803320</span>
          </a>
          <a href="mailto:bijaysaikia543@gmail.com" className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors">
            <Mail className="w-3.5 h-3.5" />
            <span>bijaysaikia543@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Official Office Details Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Main Office</p>
            <p className="text-xs font-black text-slate-900">Bokakhat, Golaghat District</p>
            <p className="text-[10px] text-slate-500">State: Assam • PIN: 785612</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-orange-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Direct Helplines</p>
            <p className="text-xs font-black text-orange-600">8638803320 • 7002754262</p>
            <p className="text-[10px] text-slate-600 font-bold">Line 3: 9101876404</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Admin Email</p>
            <a href="mailto:bijaysaikia543@gmail.com" className="text-xs font-black text-emerald-700 hover:underline">
              bijaysaikia543@gmail.com
            </a>
            <p className="text-[10px] text-slate-500">Fast 24-hr Response</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive AI Support Assistant (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-[560px] overflow-hidden">
          
          {/* AI Header in Light Green */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">EASY TRIP Golaghat AI Assistant</h3>
                <span className="text-[10px] text-emerald-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online • Powered by Gemini & Golaghat Policies
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-emerald-50/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-emerald-100 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                {m.poweredBy && (
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                    🤖 {m.poweredBy}
                  </span>
                )}
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Consulting EASY TRIP policy knowledgebase...</span>
              </div>
            )}
          </div>

          {/* Quick Questions Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">FAQ:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendAiQuery(q)}
                className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-emerald-200 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendAiQuery(inputQuery);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask about Bokakhat drivers, fare refunds, trip safety..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isAiLoading}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Raise Formal Support Ticket Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Raise Official Grievance (Bokakhat Office)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Disputed fares, lost items, or driver conduct are escalated directly to Admin Bijay Saikia.
            </p>

            <form onSubmit={handleTicketSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="fare_dispute">Fare Dispute / Overcharge</option>
                  <option value="driver_behavior">Driver Behavior / Refusal</option>
                  <option value="lost_item">Lost Item in Vehicle</option>
                  <option value="cancellation_fee">Cancellation Fee Dispute</option>
                  <option value="safety">Safety / Vehicle Quality Concern</option>
                  <option value="app_issue">Technical / App Bug</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Route taken between Bokakhat & Golaghat"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Details & Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the issue with trip location or vehicle number..."
                  rows={3}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                SUBMIT GRIEVANCE TICKET
              </button>
            </form>

            {ticketSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ticket registered! Bokakhat office will review within 2 hours.</span>
              </div>
            )}
          </div>

          {/* My Tickets Log */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
              Your Support Tickets ({myTickets.length})
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              {myTickets.map(t => (
                <div key={t.id} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{t.subject}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                  {t.adminResponse && (
                    <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg text-[11px] mt-1 border border-emerald-200">
                      <strong>Admin Resolution:</strong> {t.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
