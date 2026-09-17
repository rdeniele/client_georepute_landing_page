/**
 * Centralized, fail-fast env access. Every Supabase client factory reads
 * through here so a missing/misnamed env var throws one clear error at the
 * call site instead of a confusing "Invalid URL" deep inside the SDK.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example) and restart the dev server.",
    );
  }

  return { url, anonKey };
}
