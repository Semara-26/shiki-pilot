import { createClient } from '@supabase/supabase-js';

// SECURITY: No NEXT_PUBLIC_ prefix — these are server-only vars and must never be inlined into the client bundle.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
