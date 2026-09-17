"use server";

import { sendMeetingRequest } from "@/lib/services/mailer";

export type MeetingRequestState = { status: "idle" | "success" | "error"; error: string | null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", error: "Name, email and a short message are required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", error: "Enter a valid email address." };
  }

  try {
    await sendMeetingRequest({ name, email, company, message });
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to send your request. Please try again shortly.",
    };
  }

  return { status: "success", error: null };
}
