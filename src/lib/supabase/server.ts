import { createClient } from "@supabase/supabase-js";

// SECURITY: No NEXT_PUBLIC_ prefix — these are server-only vars and must never be inlined into the client bundle.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAdmin() {
  if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key. Uploads may fail due to RLS.");
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
