import "server-only";
import { Resend } from "resend";
import {
  buildMeetingConfirmationEmailHtml,
  buildMeetingRequestEmailHtml,
  buildRequestReceivedEmailHtml,
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
 * The visitor always gets a confirmation email back too — a copy of what
 * they sent, and the Meet link when one exists — so they have something in
 * their own inbox to check the booking against, not just a page they might
 * navigate away from. That second send is best-effort: the request itself
 * has already been delivered, so a failure there is reported through the
 * return value rather than thrown.
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
      ? `Meeting: ${request.meet.slotLabel}, ${
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

  const hasLink = Boolean(request.meet?.link);
  const confirmation = await resend.emails
    .send(
      hasLink
        ? {
            from,
            to: request.email,
            replyTo: getRecipient(),
            subject: "Your GeoRepute meeting is scheduled",
            text: [
              `Hi ${request.name}, thanks for getting in touch. We've set up a Google Meet call for you.`,
              "",
              `When: ${request.meet!.slotLabel}`,
              `Join: ${request.meet!.link}`,
              "",
              "Reply to this email if you need to change the time.",
            ].join("\n"),
            html: buildMeetingConfirmationEmailHtml(request, request.meet!.link!, request.meet!.slotLabel),
            attachments,
          }
        : {
            from,
            to: request.email,
            replyTo: getRecipient(),
            subject: request.meet ? "We received your meeting request" : "We received your message",
            text: [
              `Hi ${request.name}, thanks for getting in touch. Here's a copy of what you sent us for your records.`,
              "",
              `Subject: ${request.subject}`,
              request.meet ? `Requested time: ${request.meet.slotLabel} (we'll reply to confirm and send a Meet link)` : null,
              "",
              request.message,
            ]
              .filter((line) => line !== null)
              .join("\n"),
            html: buildRequestReceivedEmailHtml(request),
            attachments,
          },
    )
    .catch(() => ({ error: true }));

  return { confirmationSent: !confirmation.error };
}
