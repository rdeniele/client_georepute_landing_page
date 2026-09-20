"use server";

import { MEETING_SUBJECTS } from "@/lib/contact";
import { sendMeetingRequest } from "@/lib/services/mailer";

export type MeetingRequestState = { status: "idle" | "success" | "error"; error: string | null };

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
  // Only the listed choices: it ends up in an email subject line.
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

  try {
    await sendMeetingRequest({ name, email, company, phone, subject, message });
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to send your message. Please try again shortly.",
    };
  }

  return { status: "success", error: null };
}
