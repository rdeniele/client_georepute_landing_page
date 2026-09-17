import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/services/profiles";
import { SignOutButton } from "@/components/admin/SignOutButton";

/**
 * Route-group layout (`(dashboard)`) so this auth check applies to every
 * `/admin/*` page except `/admin/login`, without login itself living behind
 * the guard it's meant to redirect to. `proxy.ts` already redirected
 * anonymous visitors before this ever runs; this second check additionally
 * confirms the session belongs to an admin (a `profiles` row), which the
 * proxy's cheap session check does not do.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/admin/login");
  }

  return (
    <>
      <header className="admin-topbar">
        <a className="admin-topbar__brand" href="/admin">
          GeoRepute <small>Admin</small>
        </a>
        <nav className="admin-topbar__nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/blogs">Posts</a>
          <a href="/admin/blogs/new">New Post</a>
        </nav>
        <SignOutButton />
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
