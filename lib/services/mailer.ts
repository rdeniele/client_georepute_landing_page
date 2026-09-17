import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends mail through the georepute@gmail.com mailbox's own Gmail SMTP (an
 * App Password, not the account password — see .env.example). No
 * third-party email service; this is the mailbox itself sending on its own
 * behalf, which is why the recipient and the sender are the same address.
 */
function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD (see .env.example) and restart the server.",
    );
  }

  return { transport: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }), user };
}

export type MeetingRequest = {
  name: string;
  email: string;
  company: string;
  message: string;
};

/** Sends a meeting request to the mailbox itself, with the visitor's address set as reply-to so replying goes straight to them. */
export async function sendMeetingRequest(request: MeetingRequest): Promise<void> {
  const { transport, user } = getTransport();

  const lines = [
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    request.company ? `Company: ${request.company}` : null,
    "",
    request.message,
  ].filter((line) => line !== null);

  await transport.sendMail({
    from: `"GeoRepute website" <${user}>`,
    to: user,
    replyTo: request.email,
    subject: `Meeting request from ${request.name}`,
    text: lines.join("\n"),
  });
}
