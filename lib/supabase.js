// lib/supabase.js
// Supabase client setup.
//
// Two clients are exported:
//
//   supabase       — uses public env vars. Safe everywhere (client + server).
//   supabaseAdmin  — uses the service role key. SERVER ONLY. Never import
//                    this into a file marked "use client".
//
// Nothing in this file is called yet — it just makes the clients available
// so we can wire up real data later.

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// 1. PUBLIC CLIENT
// ---------------------------------------------------------------------------
// Uses NEXT_PUBLIC_* variables, which Next.js inlines into the browser
// bundle at build time. That's fine — these values are designed to be
// public. Row Level Security in Supabase is what actually protects data.
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Clear, early failure beats a cryptic error later.
  throw new Error(
    "Missing Supabase environment variables. " +
      "Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "are set in .env.local and restart the dev server."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No user accounts in this project yet, so we don't need session
    // persistence or token refresh running in the background.
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ---------------------------------------------------------------------------
// 2. ADMIN CLIENT (server-only)
// ---------------------------------------------------------------------------
// Uses SUPABASE_SERVICE_ROLE_KEY, which must NEVER be sent to the browser.
//
// Two safety measures:
//   a) If the key is missing, we export null instead of throwing — so the
//      app keeps running while the value is still empty in .env.local.
//   b) We do NOT re-export the raw key. Only the pre-configured client.
//
// Intended usage (in an API route, never in a client component):
//
//   import { supabaseAdmin } from "../../../lib/supabase";
//
//   if (!supabaseAdmin) {
//     return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
//   }
//
//   await supabaseAdmin.from("assets").insert({ ... });
// ---------------------------------------------------------------------------

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          // The service role client is stateless — no session to persist.
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;