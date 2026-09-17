import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Profile } from "@/types/posts";

type Client = SupabaseClient<Database>;

/**
 * Resolves the signed-in user's admin profile, or `null` if they aren't
 * signed in or have no row in `profiles` (i.e. an authenticated Supabase
 * user who is not an admin — see SUPABASE_SETUP.md Step 4). Never trust a
 * client-supplied "isAdmin" flag; this is the one source of truth, and it's
 * itself backed by an RLS policy that only lets a user read their own row.
 */
export async function getCurrentProfile(supabase: Client): Promise<Profile | null> {
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .maybeSingle();

  if (error) return null;
  return profile;
}
