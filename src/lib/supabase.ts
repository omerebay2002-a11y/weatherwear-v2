import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(url && anonKey);

// Safe export — null when env vars missing, so the app falls back to offline mode.
export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Project ref (e.g. "abcd1234") parsed from the URL, used to build a console link.
export const supabaseProjectRef =
  url?.match(/https?:\/\/([^.]+)\.supabase\./)?.[1] ?? null;

// Storage bucket holding wardrobe item images.
export const WARDROBE_BUCKET = "wardrobe";
