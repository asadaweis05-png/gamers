import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

// Normalize URL format safely
const supabaseUrl = rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')
  ? `https://${rawUrl}`
  : rawUrl;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
);

let clientInstance = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed initializing Supabase client, falling back smoothly:', err);
    clientInstance = null;
  }
}

export const supabase = clientInstance;
