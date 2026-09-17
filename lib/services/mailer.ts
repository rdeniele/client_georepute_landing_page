import "server-only";
import { Resend } from "resend";
import { buildMeetingRequestEmailHtml } from "@/lib/emails/meetingRequest";

const MEETING_REQUEST_RECIPIENT = "georepute@gmail.com";

/**
 * Sends mail through Resend (a transactional email API) rather than a
 * personal Gmail account's own SMTP — no mailbox password involved, and
 * Resend's own dashboard gives delivery/bounce visibility.
 *
 * RESEND_FROM_EMAIL defaults to Resend's shared `onboarding@resend.dev`
 * sender, which works immediately with zero setup but is meant for testing.
 * For production, verify a real sending domain (e.g. georepute.ai) in the
 * Resend dashboard and set RESEND_FROM_EMAIL to an address on it (e.g.
 * "GeoRepute <noreply@georepute.ai>") — see .env.example.
 */
function getClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY (see .env.example) and restart the server.",
    );
  }

  const from = process.env.RESEND_FROM_EMAIL || "GeoRepute <onboarding@resend.dev>";
  return { resend: new Resend(apiKey), from };
}

export type MeetingRequest = {
  name: string;
  email: string;
  company: string;
  message: string;
};

/** Sends a meeting request to the GeoRepute mailbox, with the visitor's address set as reply-to so replying goes straight to them. */
export async function sendMeetingRequest(request: MeetingRequest): Promise<void> {
  const { resend, from } = getClient();

  const lines = [
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    request.company ? `Company: ${request.company}` : null,
    "",
    request.message,
  ].filter((line) => line !== null);

  const { error } = await resend.emails.send({
    from,
    to: MEETING_REQUEST_RECIPIENT,
    replyTo: request.email,
    subject: `Meeting request from ${request.name}`,
    text: lines.join("\n"),
    html: buildMeetingRequestEmailHtml(request),
  });

  if (error) throw new Error(`Failed to send your request: ${error.message}`);
}
