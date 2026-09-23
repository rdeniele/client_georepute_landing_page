"use client";

import { useActionState, useState } from "react";
import { submitMeetingRequestAction, type MeetingRequestState } from "@/lib/actions/meeting";
import { MEETING_SUBJECTS } from "@/lib/contact";
import { getBriefingCopy } from "@/lib/subpages/briefing";

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
export function MeetingRequestForm({ locale = "en" }: { locale?: string }) {
  const c = getBriefingCopy(locale).form;
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
    const { meet, confirmationSent } = state;
    return (
      <div className="briefing-card">
        <div className="kit-form-success" role="status">
          <p className="t-h4">{c.successTitle}</p>
          {meet?.link ? (
            <>
              <p className="t-body">{c.successWithMeet(meet.slotLabel)}</p>
              <p className="t-body">
                <a href={meet.link} target="_blank" rel="noopener noreferrer">
                  {meet.link}
                </a>
              </p>
              <p className="t-body">{confirmationSent ? c.successConfirmationSent : c.successConfirmationNotSent}</p>
            </>
          ) : (
            <>
              <p className="t-body">
                {!meet
                  ? c.successNoMeet
                  : meet.automatic
                    ? c.successMeetPendingAutomatic(meet.slotLabel)
                    : c.successMeetPendingManual(meet.slotLabel)}
              </p>
              <p className="t-body">{confirmationSent ? c.successConfirmationSentGeneral : c.successConfirmationNotSentGeneral}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="briefing-card">
      <h2 className="briefing-card__title">{c.title}</h2>
      <p className="briefing-card__hint">{c.hint}</p>
      <form action={formAction} className="kit-form">
        {state.status === "error" ? (
          <div className="kit-form__banner" role="alert">
            {state.error}
          </div>
        ) : null}

        {/* Honeypot: hidden from real visitors via CSS, invisible to screen readers, but a bot's form-filler will still find and fill it. */}
        <div className="kit-form__honeypot" aria-hidden="true">
          <label htmlFor="website">{c.honeypotLabel}</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="kit-field-row">
          <div className="kit-field">
            <label htmlFor="name">
              {c.nameLabel} <span className="kit-req" aria-hidden="true">*</span>
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" placeholder={c.namePlaceholder} />
          </div>
          <div className="kit-field">
            <label htmlFor="company">{c.companyLabel}</label>
            <input id="company" name="company" type="text" autoComplete="organization" placeholder={c.companyPlaceholder} />
          </div>
        </div>

        <div className="kit-field-row">
          <div className="kit-field">
            <label htmlFor="email">
              {c.emailLabel} <span className="kit-req" aria-hidden="true">*</span>
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder={c.emailPlaceholder} />
          </div>
          <div className="kit-field">
            <label htmlFor="phone">{c.phoneLabel}</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={30}
              pattern="\+?[\d\s\(\)\.\-]{7,30}"
              title="A phone number, e.g. +1 555 123 4567"
              placeholder={c.phonePlaceholder}
            />
          </div>
        </div>

        <div className="kit-field">
          <label htmlFor="subject">
            {c.subjectLabel} <span className="kit-req" aria-hidden="true">*</span>
          </label>
          <select id="subject" name="subject" required defaultValue="">
            <option value="" disabled>
              {c.subjectPlaceholder}
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
            {c.messageLabel} <span className="kit-req" aria-hidden="true">*</span>
          </label>
          <textarea id="message" name="message" rows={4} required placeholder={c.messagePlaceholder} />
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
              {c.meetLabel}
              <small>{c.meetHint}</small>
            </span>
          </label>
          {scheduleMeet ? (
            <div className="kit-field">
              <label htmlFor="meetingStart">{c.meetStartLabel}</label>
              <input id="meetingStart" name="meetingStart" type="datetime-local" required min={minStart} />
              <input type="hidden" name="timezone" value={timeZone} />
              <p className="kit-field__hint">{c.meetStartHint(timeZone)}</p>
            </div>
          ) : null}
        </div>

        <button type="submit" className="briefing-submit" disabled={pending}>
          {pending ? c.sending : c.submit}
        </button>
      </form>
    </div>
  );
}
