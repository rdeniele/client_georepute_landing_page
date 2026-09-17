import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * NOTE: this file is intentionally named `proxy.ts`, not `middleware.ts`.
 * Next.js 16 renamed the middleware file convention to `proxy.ts` (same
 * behavior, new file/export name) — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 *
 * Two jobs, both required for Supabase SSR auth to work:
 *
 * 1. Refresh the Supabase session cookie on every request. Server
 *    Components can't write response cookies, so if this doesn't run, a
 *    session nearing expiry is never refreshed and admins get silently
 *    signed out mid-session.
 * 2. Gate `/admin/*` (other than `/admin/login`) behind a signed-in
 *    session. This is a cheap "is anyone logged in" check — whether that
 *    user is actually an admin is verified again in
 *    app/admin/(dashboard)/layout.tsx via the `profiles` table, and again
 *    by Postgres RLS on every query. None of these three checks trusts the
 *    others; that's deliberate defense in depth.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase isn't configured yet — let requests through untouched instead
  // of throwing on every page load. `/admin` will simply be unreachable
  // until the env vars are set (see .env.example).
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touches the session so an expiring access token gets refreshed and the
  // new cookies are attached to `response` above via `setAll`.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !claims) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and Next's internals, so the
     * session cookie stays fresh across the whole app, not just /admin.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|glb|hdr)$).*)",
  ],
};
