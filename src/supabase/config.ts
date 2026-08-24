import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
export const SUPABASE_PROJECT_ID = 'qaisruhtregtxsedmgwd';
export const SUPABASE_URL = 
  (import.meta.env.VITE_SUPABASE_URL as string) || 
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY = 
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 
  'sb_publishable_2pt7-DflDP25W35RVdPAxw_HHYHCyQf';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
