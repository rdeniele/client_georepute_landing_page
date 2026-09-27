import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * The one place the service-role key is read. It exists for a single reason: the background scheduler
 * (app/api/cron/blog-automation) has no signed-in admin, so it cannot pass Row Level Security the way
 * every other operation in this app does. The key bypasses RLS entirely, so:
 *
 *  - it is server-only (the build fails if a client component imports this file);
 *  - it is only ever used by the cron route, which first proves the caller knows CRON_SECRET;
 *  - it is never sent to the browser and never given a NEXT_PUBLIC_ name.
 *
 * Everything an admin does from the CMS still runs through their own session and RLS.
 */
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("The scheduler needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).");
  }
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function isServiceClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
