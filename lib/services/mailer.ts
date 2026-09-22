import "server-only";
import { Resend } from "resend";
import {
  buildMeetingConfirmationEmailHtml,
  buildMeetingRequestEmailHtml,
  getLogoAttachment,
} from "@/lib/emails/meetingRequest";

const DEFAULT_MEETING_REQUEST_RECIPIENT = "georepute@gmail.com";

/** Where requests are delivered. `MEETING_REQUEST_RECIPIENT` redirects them while testing, see .env.example. */
function getRecipient(): string {
  return process.env.MEETING_REQUEST_RECIPIENT || DEFAULT_MEETING_REQUEST_RECIPIENT;
}

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
  phone: string;
  subject: string;
  message: string;
  /**
   * Present when the visitor asked for a Google Meet. `link` is `null` when
   * none exists yet: `automatic` is true if Google was asked and failed, false
   * if it isn't configured and the team confirms the time by reply.
   */
  meet?: { slotLabel: string; link: string | null; automatic: boolean };
};

/**
 * Sends a meeting request to the GeoRepute mailbox, with the visitor's address set as reply-to so replying goes straight to them.
 *
 * When a Google Meet was scheduled, the visitor also gets a confirmation
 * email carrying the link. That second send is best-effort: the request
 * itself has already been delivered, so a failure there is reported through
 * the return value rather than thrown.
 */
export async function sendMeetingRequest(request: MeetingRequest): Promise<{ confirmationSent: boolean }> {
  const { resend, from } = getClient();

  const lines = [
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    request.phone ? `Phone Number: ${request.phone}` : null,
    request.company ? `Company: ${request.company}` : null,
    `Subject: ${request.subject}`,
    request.meet
      ? `Meeting: ${request.meet.slotLabel} — ${
          request.meet.link ??
          (request.meet.automatic
            ? "Meet link could not be created, please reply to arrange one"
            : "requested time, please reply to confirm it and send a Meet link")
        }`
      : null,
    "",
    request.message,
  ].filter((line) => line !== null);

  const logoAttachment = getLogoAttachment();
  const attachments = logoAttachment ? [logoAttachment] : undefined;

  const { error } = await resend.emails.send({
    from,
    to: getRecipient(),
    replyTo: request.email,
    subject: `Meeting request: ${request.subject} (${request.name})`,
    text: lines.join("\n"),
    html: buildMeetingRequestEmailHtml(request),
    attachments,
  });

  if (error) throw new Error(`Failed to send your request: ${error.message}`);

  if (!request.meet?.link) return { confirmationSent: false };

  const { slotLabel, link } = request.meet;
  const confirmation = await resend.emails
    .send({
      from,
      to: request.email,
      replyTo: getRecipient(),
      subject: "Your GeoRepute meeting is scheduled",
      text: [
        `Hi ${request.name}, thanks for getting in touch — we've set up a Google Meet call for you.`,
        "",
        `When: ${slotLabel}`,
        `Join: ${link}`,
        "",
        "Reply to this email if you need to change the time.",
      ].join("\n"),
      html: buildMeetingConfirmationEmailHtml(request, link, slotLabel),
      attachments,
    })
    .catch(() => ({ error: true }));

  return { confirmationSent: !confirmation.error };
}
