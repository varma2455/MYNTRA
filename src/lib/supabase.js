import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://betvgxsoanhhfcwvrppn.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabasePublishableKey) {
  console.warn('[Supabase] VITE_SUPABASE_PUBLISHABLE_KEY is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'myntra_supabase_auth_token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
