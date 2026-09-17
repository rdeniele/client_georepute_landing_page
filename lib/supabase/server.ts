import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabaseEnv } from "./env";

/**
 * Server-side Supabase client for Server Components, Server Actions and
 * Route Handlers. Reads/writes the session through Next's cookie jar so the
 * signed-in admin's own JWT is what RLS evaluates — there is no
 * service-role bypass anywhere in this codebase.
 *
 * Create a new client per request (never module-level/shared); that's what
 * lets `setAll` below write refreshed session cookies onto the response.
 *
 * In a Server Component, `cookies().set()` is a no-op (components can't set
 * response headers) — that's expected and safe as long as `proxy.ts` is
 * refreshing the session on every request, which it does.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render — proxy.ts already
          // refreshes the session for this request, so this is safe to drop.
        }
      },
    },
  });
}
