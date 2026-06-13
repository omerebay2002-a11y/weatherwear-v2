import { createClient } from "@supabase/supabase-js";

// Baked-in project defaults so deploys work without Vercel env vars.
// The anon key is public by design (it ships in the client bundle);
// data access is protected by Row Level Security.
const DEFAULT_URL = "https://goiuzsqdmmjjdxtjbnzv.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaXV6c3FkbW1qamR4dGpibnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjI2NTAsImV4cCI6MjA4MDc5ODY1MH0.52H_YdOTCiA4tXZceGs6OdgiGjarYDjb5k5oAa15yLY";

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : null;
