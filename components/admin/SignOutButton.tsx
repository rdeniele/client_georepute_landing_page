import { signOutAction } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="admin-btn admin-btn--ghost">
        Sign out
      </button>
    </form>
  );
}
