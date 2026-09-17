import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in | GeoRepute Admin" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1>GeoRepute Admin</h1>
        <p>Sign in with your admin account to manage blog content.</p>
        <LoginForm next={next && next.startsWith("/admin") ? next : "/admin/blogs"} />
      </div>
    </div>
  );
}
