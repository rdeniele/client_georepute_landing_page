import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/services/profiles";

/**
 * Every Server Action that mutates content calls this first. Server Actions
 * are reachable by a direct POST from anywhere, not just this app's own
 * forms (see Next.js's data-security guidance), so `proxy.ts` redirecting
 * unauthenticated browser navigation away from /admin is not enough on its
 * own — each action re-checks admin status itself, on top of RLS doing the
 * same check again at the database.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    throw new Error("You must be signed in as an admin to do that.");
  }

  return { supabase, profile };
}
