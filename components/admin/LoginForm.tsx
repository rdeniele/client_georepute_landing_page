"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/lib/actions/auth";

const initialState: SignInState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next} />
      {state.error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {state.error}
        </div>
      ) : null}
      <div className="admin-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="admin-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="admin-btn admin-btn--primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
