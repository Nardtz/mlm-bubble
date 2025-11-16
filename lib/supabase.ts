import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'https://placeholder.supabase.co' && 
           supabaseAnonKey !== 'placeholder-key');
}

// Create browser client that syncs to cookies (for server-side access)
// createBrowserClient automatically handles cookie syncing for SSR
// During build time, env vars might not be available, so we create a client with placeholder values
// The actual error will be thrown when the client is used, not at module load time
// Note: NEXT_PUBLIC_* variables are embedded at BUILD TIME, so if you add them in Vercel,
// you MUST redeploy for them to be available
export const supabase = supabaseUrl && supabaseAnonKey && 
                        supabaseUrl !== 'https://placeholder.supabase.co' &&
                        supabaseAnonKey !== 'placeholder-key'
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');

// Service role client for admin operations (server-side only)
// Note: This should only be used in server-side code, never in the browser
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey && supabaseUrl
  ? createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

