import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const authKey = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAuth = createClient(SUPABASE_URL, authKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
