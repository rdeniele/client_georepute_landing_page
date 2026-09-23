"use server";

import { MEETING_SUBJECTS } from "@/lib/contact";
import { sendMeetingRequest } from "@/lib/services/mailer";
import {
  createMeetEvent,
  deleteMeetEvent,
  formatMeetingSlot,
  isGoogleMeetConfigured,
  parseMeetingSlot,
} from "@/lib/services/googleMeet";

export type MeetingRequestState = {
  status: "idle" | "success" | "error";
  error: string | null;
  /** Set on success — whether the visitor's own confirmation email (a copy of their request, or the Meet link) actually went out. */
  confirmationSent?: boolean;
  /**
   * Set on success when the visitor asked for a Google Meet. `link` is `null`
   * when there is none yet: `automatic` says whether Google was asked to make
   * it (and failed) or is not configured, so the team confirms by email.
   */
  meet?: { slotLabel: string; link: string | null; automatic: boolean };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Digits plus the usual separators (+ ( ) - . space), 7–15 digits overall (E.164 maximum). */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[\d\s().-]+$/.test(value) && digits >= 7 && digits <= 15;
}

export async function submitMeetingRequestAction(
  _prevState: MeetingRequestState,
  formData: FormData,
): Promise<MeetingRequestState> {
  // Honeypot: a field real visitors never see or fill in (hidden via CSS in
  // the form), so a non-empty value here means a bot filled every field.
  if (String(formData.get("website") ?? "")) {
    return { status: "success", error: null };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  // Only the listed choices: it ends up in an email subject and a calendar title.
  const rawSubject = String(formData.get("subject") ?? "");
  const subject = MEETING_SUBJECTS.find((option) => option === rawSubject) ?? "";
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return { status: "error", error: "Name, email, subject and a short message are required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", error: "Enter a valid email address." };
  }

  if (phone && !isValidPhone(phone)) {
    return { status: "error", error: "Enter a valid phone number, e.g. +1 555 123 4567." };
  }

  // The picker is always offered. With Google configured the Meet link is
  // created on the spot; without it the preferred time is emailed to the team
  // to confirm by reply.
  const wantsMeet = formData.get("scheduleMeet") === "on";
  const automatic = isGoogleMeetConfigured();
  const slot = wantsMeet
    ? parseMeetingSlot(
        String(formData.get("meetingStart") ?? ""),
        String(formData.get("timezone") ?? "") || "UTC",
      )
    : null;
  if (wantsMeet && !slot) {
    return { status: "error", error: "Choose a date and time in the future for the Google Meet call." };
  }

  let meet: { slotLabel: string; link: string | null; automatic: boolean } | undefined;
  let eventId: string | null = null;
  if (slot) {
    const slotLabel = formatMeetingSlot(slot);
    if (!automatic) {
      meet = { slotLabel, link: null, automatic: false };
    } else {
      try {
        const event = await createMeetEvent({
          slot,
          summary: `${subject} — ${name}`,
          description: [
            `Name: ${name}`,
            `Email: ${email}`,
            phone ? `Phone Number: ${phone}` : null,
            company ? `Company: ${company}` : null,
            `Subject: ${subject}`,
            "",
            message,
          ]
            .filter((line) => line !== null)
            .join("\n"),
          attendee: { email, name },
        });
        eventId = event.eventId;
        meet = { slotLabel, link: event.meetLink, automatic: true };
      } catch (error) {
        // The request itself is still worth delivering; the team is told in the
        // email that no link exists so they can arrange one by reply.
        console.error("Google Meet creation failed:", error);
        meet = { slotLabel, link: null, automatic: true };
      }
    }
  }

  try {
    const { confirmationSent } = await sendMeetingRequest({ name, email, company, phone, subject, message, meet });
    return { status: "success", error: null, confirmationSent, meet };
  } catch (error) {
    if (eventId) await deleteMeetEvent(eventId);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to send your request. Please try again shortly.",
    };
  }
}
