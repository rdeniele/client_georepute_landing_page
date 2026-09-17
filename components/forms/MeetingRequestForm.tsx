"use client";

import { useActionState } from "react";
import { submitMeetingRequestAction, type MeetingRequestState } from "@/lib/actions/meeting";

const initialState: MeetingRequestState = { status: "idle", error: null };

export function MeetingRequestForm() {
  const [state, formAction, pending] = useActionState(submitMeetingRequestAction, initialState);

  if (state.status === "success") {
    return (
      <div className="kit-form-success" role="status">
        <p className="t-h4">Thanks — your request is in.</p>
        <p className="t-body">We&apos;ll reply from georepute@gmail.com shortly to find a time.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="kit-form">
      {state.status === "error" ? (
        <div className="kit-form__banner" role="alert">
          {state.error}
        </div>
      ) : null}

      {/* Honeypot: hidden from real visitors via CSS, invisible to screen readers, but a bot's form-filler will still find and fill it. */}
      <div className="kit-form__honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="kit-field-row">
        <div className="kit-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="kit-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="kit-field">
        <label htmlFor="company">Company (optional)</label>
        <input id="company" name="company" type="text" autoComplete="organization" />
      </div>

      <div className="kit-field">
        <label htmlFor="message">What would you like to discuss?</label>
        <textarea id="message" name="message" rows={4} required />
      </div>

      <button type="submit" className="btn btn--conversion" disabled={pending}>
        {pending ? "Sending…" : "Request a meeting"}
      </button>
    </form>
  );
}
