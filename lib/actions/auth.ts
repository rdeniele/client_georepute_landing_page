"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/services/profiles";

export type SignInState = { error: string | null };

/**
 * Signs in via the server client so the session cookie is written on this
 * response (see lib/supabase/server.ts). After a successful password check,
 * it re-checks `profiles` before letting the session stand — an
 * authenticated-but-not-admin Supabase user (should one ever exist) gets
 * signed back out immediately rather than reaching /admin.
 */
export async function signInAction(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  let profile;
  try {
    const supabase = await createSupabaseServerClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      return { error: "Incorrect email or password." };
    }

    profile = await getCurrentProfile(supabase);
    if (!profile) {
      await supabase.auth.signOut();
      return { error: "This account is not authorized for the admin dashboard." };
    }
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
