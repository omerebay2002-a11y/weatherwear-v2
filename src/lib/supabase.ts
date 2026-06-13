import { createClient } from "@supabase/supabase-js";

// NOTE: the goiuzsqdmmjjdxtjbnzv project found in old .env files belongs to
// Lovable Cloud (style-smart's managed backend) — NOT to the user's own
// Supabase account. Do not bake it in. Until the user creates their own
// Supabase project and sets these env vars, the app runs in offline
// localStorage mode, which is fully functional.
const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : null;
