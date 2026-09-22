"use client";

import { useActionState, useState } from "react";
import { submitMeetingRequestAction, type MeetingRequestState } from "@/lib/actions/meeting";
import { MEETING_SUBJECTS } from "@/lib/contact";

const initialState: MeetingRequestState = { status: "idle", error: null };

/** `YYYY-MM-DDTHH:mm` for "now" in the browser's timezone — the format `datetime-local` expects for `min`. */
function localNowValue(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

/**
 * The form on /briefing. It always offers "Book a Google Meet call": with
 * Google Calendar configured, the link is created and emailed straight away;
 * otherwise the preferred time is emailed to the team, who confirm it by
 * reply and send the link themselves.
 */
export function MeetingRequestForm() {
  const [state, formAction, pending] = useActionState(submitMeetingRequestAction, initialState);
  const [scheduleMeet, setScheduleMeet] = useState(false);
  const [timeZone, setTimeZone] = useState("");
  const [minStart, setMinStart] = useState("");

  const toggleMeet = (checked: boolean) => {
    setScheduleMeet(checked);
    if (checked) {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      setMinStart(localNowValue());
    }
  };

  if (state.status === "success") {
    const { meet } = state;
    return (
      <div className="briefing-card">
        <div className="kit-form-success" role="status">
          <p className="t-h4">Thanks — your request is in.</p>
          {meet?.link ? (
            <>
              <p className="t-body">Your Google Meet is set for {meet.slotLabel}.</p>
              <p className="t-body">
                <a href={meet.link} target="_blank" rel="noopener noreferrer">
                  {meet.link}
                </a>
              </p>
              <p className="t-body">
                {meet.confirmationSent
                  ? "We've emailed you the link too."
                  : "Keep this link — we couldn't email it to you."}
              </p>
            </>
          ) : (
            <p className="t-body">
              {!meet
                ? "We'll reply from georepute@gmail.com shortly to find a time."
                : meet.automatic
                  ? `We couldn't create the Google Meet link automatically, so we'll reply from georepute@gmail.com to confirm ${meet.slotLabel}.`
                  : `We've noted ${meet.slotLabel} as your preferred time. We'll reply from georepute@gmail.com to confirm it and send your Google Meet link.`}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="briefing-card">
      <h2 className="briefing-card__title">Request a meeting</h2>
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

        <div className="kit-meet">
          <label className="kit-check">
            <input
              type="checkbox"
              name="scheduleMeet"
              checked={scheduleMeet}
              onChange={(event) => toggleMeet(event.target.checked)}
            />
            <span className="kit-check__text">
              Book a Google Meet call
              <small>Pick a time now and we&apos;ll email you the link.</small>
            </span>
          </label>
          {scheduleMeet ? (
            <div className="kit-field">
              <label htmlFor="meetingStart">Preferred date &amp; time</label>
              <input id="meetingStart" name="meetingStart" type="datetime-local" required min={minStart} />
              <input type="hidden" name="timezone" value={timeZone} />
              <p className="kit-field__hint">30 minutes · {timeZone}. We&apos;ll email you the Meet link.</p>
            </div>
          ) : null}
        </div>

        <button type="submit" className="briefing-submit" disabled={pending}>
          {pending ? "Sending…" : "Send request"}
        </button>
      </form>
    </div>
  );
}
