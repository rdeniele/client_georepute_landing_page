"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabaseEnv } from "./env";

/**
 * Browser-side Supabase client. Uses the public anon key only; every
 * privileged read/write it makes is still gated by Postgres RLS.
 *
 * Create one per component/hook call site (cheap — it doesn't open a
 * connection) rather than sharing a module-level singleton across the app.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
