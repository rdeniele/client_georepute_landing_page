import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends the visitor-facing confirmation email through Gmail's own SMTP
 * (an app password on an existing Gmail mailbox) instead of Resend.
 *
 * Resend (and every transactional email API) refuses to send to a third
 * party until a sending domain is verified in its dashboard, that needs
 * someone with DNS access for the domain, which this project doesn't have.
 * Gmail already owns its own deliverability for georepute@gmail.com, so it
 * can send to any recipient today with no domain or DNS step at all. Kept
 * as a separate, optional path (see isGmailSmtpConfigured) rather than
 * replacing Resend outright, so the internal team notification (which
 * already works over Resend) is untouched.
 */

function getGmailUser(): string | undefined {
  return process.env.GMAIL_SMTP_USER;
}

function getGmailAppPassword(): string | undefined {
  return process.env.GMAIL_SMTP_APP_PASSWORD;
}

export function isGmailSmtpConfigured(): boolean {
  return Boolean(getGmailUser() && getGmailAppPassword());
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const user = getGmailUser();
  const pass = getGmailAppPassword();
  if (!user || !pass) {
    throw new Error(
      "Gmail SMTP is not configured. Set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD (see .env.example).",
    );
  }
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransporter;
}

export type GmailAttachment = { filename: string; content: string; contentType: string; contentId?: string };

export type GmailMail = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: GmailAttachment[];
};

export async function sendGmailMail(mail: GmailMail): Promise<void> {
  const transporter = getTransporter();
  const user = getGmailUser()!;
  await transporter.sendMail({
    from: `GeoRepute <${user}>`,
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    attachments: mail.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      encoding: "base64" as const,
      contentType: a.contentType,
      cid: a.contentId,
    })),
  });
}
