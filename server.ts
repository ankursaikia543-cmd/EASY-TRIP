import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Google Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 1. Health API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EASY TRIP Backend Core',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// 2. Gemini AI Support Assistant Endpoint
app.post('/api/ai/support', async (req, res) => {
  try {
    const { question, userRole, currentRide, language } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiClient();

    const systemPolicyPrompt = `
You are the official 24/7 AI Support Specialist for "EASY TRIP" (Local Ride Booking Platform in India).
Your tone is empathetic, clear, professional, helpful, and concise.

EASY TRIP Official Policies & Context:
1. VEHICLE OPTIONS:
   - Bike: ₹30 base + ₹10/km (fastest for 1 person).
   - Auto: ₹40 base + ₹14/km (3 seats).
   - Cab: ₹70 base + ₹18/km (4 seats AC sedan/hatchback).
2. SAFETY & OTP:
   - Every trip requires a unique 4-digit Ride PIN/OTP shown on passenger screen and verified by driver before trip starts.
   - 24/7 Emergency SOS button instantly dials 112 and alerts EASY TRIP safety control room with live GPS.
3. DRIVER DELAYS:
   - If driver has not arrived within 5 minutes of ETA, passenger can call/chat or cancel without fee.
4. CANCELLATION & REFUNDS:
   - Free cancellation within 3 minutes of driver accepting.
   - If passenger cancels after 3 minutes while driver is already near pickup, a small ₹20 inconvenience fee may apply to compensate the driver's fuel.
   - If driver cancels, passenger pays zero fee.
5. LOST & FOUND:
   - Report immediately through "My Trips" or Support. Our dispatch team contacts the driver to safely return items.
6. PAYMENTS:
   - Supports Cash, instant UPI (QR code / PhonePe / GPay / Paytm), and EASY TRIP Wallet.
7. COMPLAINTS:
   - Fare disputes, driver behavior, route deviation tickets are reviewed by Admin within 2 hours.

CRITICAL SECURITY CONSTRAINT:
- You CANNOT directly execute monetary refunds or alter database records yourself. If a user requests a refund or payment adjustment, provide policy details, calculate the eligible adjustment amount conceptually, and instruct them that their ticket is flagged for immediate Admin review.

User Language: ${language === 'hi' ? 'Hindi (हिंदी) with clear Devanagari or Hinglish where natural' : 'English'}
User Role: ${userRole || 'customer'}
Ride Details: ${currentRide ? JSON.stringify(currentRide) : 'None provided'}
`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPolicyPrompt}\n\nCustomer/Driver Question: ${question}` }] }
        ],
      });

      const replyText = response.text || 'I am here to help you with your EASY TRIP ride. Please contact our 24/7 helpline if urgent.';
      return res.json({ reply: replyText, poweredBy: 'Gemini 2.5' });
    }

    // Smart Fallback when GEMINI_API_KEY is not yet injected
    const qLower = question.toLowerCase();
    let fallbackReply = "Thank you for contacting EASY TRIP Support. Our team is available 24/7. You can check your ride details in 'My Trips' or raise a ticket.";

    if (qLower.includes('late') || qLower.includes('taking too long') || qLower.includes('delay')) {
      fallbackReply = "If your driver is delayed beyond the estimated arrival time, you can tap the 'Call' or 'Chat' button directly in your ride screen. If you choose to cancel after a 5+ minute delay, zero cancellation fee will be charged.";
    } else if (qLower.includes('cancel') || qLower.includes('cancellation fee')) {
      fallbackReply = "EASY TRIP allows 100% free cancellation within 3 minutes of driver assignment. After 3 minutes, if the driver has already covered significant distance towards pickup, a minimal ₹20 partner compensation fee may apply.";
    } else if (qLower.includes('charge') || qLower.includes('fare') || qLower.includes('overcharge') || qLower.includes('extra')) {
      fallbackReply = "EASY TRIP calculates fares transparently based on Base Fare + Distance (₹10/km for Bike, ₹14/km for Auto, ₹18/km for Cab) plus taxes. If your driver took an unapproved longer route, submit a 'Fare Dispute' in Support and our Admin team will refund the difference to your Wallet within 2 hours.";
    } else if (qLower.includes('lost') || qLower.includes('umbrella') || qLower.includes('phone') || qLower.includes('bag')) {
      fallbackReply = "Don't worry! Please go to 'My Trips' > select your recent ride > tap 'Report Lost Item'. Our 24/7 safety team will immediately contact your driver to coordinate a safe return.";
    } else if (qLower.includes('emergency') || qLower.includes('police') || qLower.includes('sos')) {
      fallbackReply = "In case of any emergency or safety concern, immediately tap the red 'SOS Emergency' button in the app or call National Emergency Helpline 112.";
    }

    if (language === 'hi') {
      fallbackReply += " (ईज़ी ट्रिप 24/7 सहायता हर समय उपलब्ध है।)";
    }

    return res.json({ reply: fallbackReply, poweredBy: 'EASY TRIP Policy Engine (Demo Mode)' });
  } catch (error: any) {
    console.error('Error in /api/ai/support:', error);
    res.status(500).json({
      reply: 'EASY TRIP Support is currently assisting high volume of queries. Please select a quick question or call +91 1800-419-3279.',
      error: error.message,
    });
  }
});

// 3. Admin Gemini Complaint Summarizer & Dispute Recommendation
app.post('/api/ai/summarize-complaint', async (req, res) => {
  try {
    const { complaint, rideDetails } = req.body;
    if (!complaint) {
      return res.status(400).json({ error: 'Complaint data required' });
    }

    const ai = getGeminiClient();

    const prompt = `
You are the AI Risk & Grievance Analyst for the EASY TRIP platform admin team.
Analyze the following user complaint and produce a concise 3-sentence summary and recommendation:
1. Core Issue: What went wrong?
2. Impact: Estimated financial or safety implication.
3. Recommended Admin Action: (e.g., "Refund ₹45 to customer wallet", "Issue warning to Driver", "Dismiss grievance", "Contact passenger for clarification").

Complaint Details:
- User: ${complaint.userName} (${complaint.userRole})
- Category: ${complaint.category}
- Subject: ${complaint.subject}
- Description: ${complaint.description}
- Associated Ride: ${rideDetails ? JSON.stringify(rideDetails) : 'N/A'}
`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return res.json({ summary: response.text });
    }

    // Deterministic fallback
    const fallbackSummary = `Grievance category: ${complaint.category.replace('_', ' ').toUpperCase()}. Issue reported by ${complaint.userName}: "${complaint.subject}". Recommended Action: Verify GPS route log, contact driver for verification, and credit ₹50 wallet compensation if deviation or delay is confirmed.`;
    return res.json({ summary: fallbackSummary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EASY TRIP] Server is running on http://localhost:${PORT}`);
  });
}

startServer();
