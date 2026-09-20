"use client";

import { useActionState, useState } from "react";
import { submitMeetingRequestAction, type MeetingRequestState } from "@/lib/actions/meeting";
import { MEETING_SUBJECTS } from "@/lib/contact";
import { Clock, VideoCamera } from "@phosphor-icons/react/ssr";
import { CalendlyEmbed } from "@/components/forms/CalendlyEmbed";

const initialState: MeetingRequestState = { status: "idle", error: null };

/**
 * The message form on /briefing: it only sends an email. `calendlyUrl` adds a
 * "Book a time" tab with the Calendly scheduler, which handles all booking.
 */
export function MeetingRequestForm({ calendlyUrl = null }: { calendlyUrl?: string | null }) {
  const [state, formAction, pending] = useActionState(submitMeetingRequestAction, initialState);
  const [mode, setMode] = useState<"book" | "message">("book");

  if (state.status === "success") {
    return (
      <div className="briefing-card">
        <div className="kit-form-success" role="status">
          <p className="t-h4">Thanks — your message is in.</p>
          <p className="t-body">We&apos;ll reply from georepute@gmail.com shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="briefing-card">
      {calendlyUrl ? (
        <div className="briefing-tabs" role="tablist" aria-label="How you would like to reach us">
          <button type="button" role="tab" aria-selected={mode === "book"} onClick={() => setMode("book")}>
            Book a time
          </button>
          <button type="button" role="tab" aria-selected={mode === "message"} onClick={() => setMode("message")}>
            Send a message
          </button>
        </div>
      ) : null}

      {calendlyUrl && mode === "book" ? (
        <>
          <h2 className="briefing-card__title">Book a meeting</h2>
          <p className="briefing-card__hint">Pick a time that suits you. We&apos;ll email you a Google Meet link.</p>
          <ul className="briefing-facts">
            <li>
              <Clock size={16} weight="duotone" aria-hidden="true" />
              30 minutes
            </li>
            <li>
              <VideoCamera size={16} weight="duotone" aria-hidden="true" />
              Google Meet
            </li>
          </ul>
          <CalendlyEmbed url={calendlyUrl} />
        </>
      ) : (
        <>
          <h2 className="briefing-card__title">Send us a message</h2>
          <p className="briefing-card__hint">Fields marked with an asterisk (*) are mandatory.</p>
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
                <label htmlFor="name">
                  Full name <span className="kit-req" aria-hidden="true">*</span>
                </label>
                <input id="name" name="name" type="text" required autoComplete="name" placeholder="John Doe" />
              </div>
              <div className="kit-field">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" autoComplete="organization" placeholder="Your company" />
              </div>
            </div>

            <div className="kit-field-row">
              <div className="kit-field">
                <label htmlFor="email">
                  Email address <span className="kit-req" aria-hidden="true">*</span>
                </label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
              </div>
              <div className="kit-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={30}
                  pattern="\+?[\d\s\(\)\.\-]{7,30}"
                  title="A phone number, e.g. +1 555 123 4567"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div className="kit-field">
              <label htmlFor="subject">
                Subject <span className="kit-req" aria-hidden="true">*</span>
              </label>
              <select id="subject" name="subject" required defaultValue="">
                <option value="" disabled>
                  Select a subject
                </option>
                {MEETING_SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="kit-field">
              <label htmlFor="message">
                Message <span className="kit-req" aria-hidden="true">*</span>
              </label>
              <textarea id="message" name="message" rows={4} required placeholder="How can we help you reach your goals?" />
            </div>

            <button type="submit" className="briefing-submit" disabled={pending}>
              {pending ? "Sending…" : "Send message"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
