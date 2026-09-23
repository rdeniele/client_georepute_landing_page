"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="admin-shell">
      <div className="admin-login">
        <div className="admin-login__card">
          <h1>Something went wrong</h1>
          <p>The admin dashboard couldn&apos;t load. This usually means Supabase isn&apos;t configured yet. Check your environment variables and try again.</p>
          <button type="button" className="admin-btn admin-btn--primary" style={{ width: "100%" }} onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
