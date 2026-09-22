import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MeetingRequest } from "@/lib/services/mailer";

/**
 * Sent as a real inline attachment (Content-ID / `cid:` reference), not a
 * base64 `data:` URI — Gmail strips `data:` image sources from HTML email
 * entirely, so that approach never renders there even though it previews
 * fine in a browser. A `cid:` attachment is the approach every major
 * client, Gmail included, actually supports for inline images.
 */
export const LOGO_CONTENT_ID = "georepute-logo";

let cachedLogoBase64: string | null | undefined;
function getLogoBase64(): string | null {
  if (cachedLogoBase64 !== undefined) return cachedLogoBase64;
  try {
    const bytes = readFileSync(join(process.cwd(), "public/brand/logo-g-mark.png"));
    cachedLogoBase64 = bytes.toString("base64");
  } catch {
    cachedLogoBase64 = null;
  }
  return cachedLogoBase64;
}

/** The logo as a Resend inline attachment, or `null` if the file can't be read — pass this in `attachments` alongside the HTML from `buildMeetingRequestEmailHtml`. */
export function getLogoAttachment(): { filename: string; content: string; contentType: string; contentId: string } | null {
  const content = getLogoBase64();
  if (!content) return null;
  return { filename: "logo.png", content, contentType: "image/png", contentId: LOGO_CONTENT_ID };
}

/** Escapes user-supplied text before it's interpolated into the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT = "-apple-system, Segoe UI, Arial, sans-serif";

const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 4px 0; font: 600 12px/1.4 ${FONT}; text-transform: uppercase; letter-spacing: 0.04em; color: #5d6288; width: 110px; vertical-align: top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 4px 0; font: 400 15px/1.5 ${FONT}; color: #0c1134;">
        ${escapeHtml(value)}
      </td>
    </tr>`;

const button = (href: string, label: string) => `
    <a href="${escapeHtml(href)}" style="display: inline-block; padding: 11px 20px; border-radius: 8px; background: #6b34e8; color: #ffffff; font: 600 14px/1 ${FONT}; text-decoration: none;">
      ${escapeHtml(label)}
    </a>`;

/**
 * Table-based layout with every style inlined — the only markup approach
 * that renders consistently across email clients (Gmail, Outlook, Apple
 * Mail strip <style> blocks and don't support flexbox/grid).
 * Colors match the site's light-mode brand palette (app/globals.css).
 */
function emailShell({ subtitle, body, footer }: { subtitle: string; body: string; footer: string }): string {
  const hasLogo = getLogoBase64() !== null;

  return `<!DOCTYPE html>
<html>
  <body style="margin: 0; padding: 0; background: #f6f4ff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f6f4ff; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(12, 17, 52, 0.1);">
            <tr>
              <td style="background: #0c1134; padding: 28px 32px;">
                ${hasLogo ? `<img src="cid:${LOGO_CONTENT_ID}" alt="GeoRepute" width="32" height="32" style="display: block; margin-bottom: 12px;" />` : ""}
                <span style="font: 600 18px/1.3 ${FONT}; color: #f6f4ff;">GeoRepute</span>
                <div style="font: 400 12px/1.4 ${FONT}; color: #a9aed0; margin-top: 2px;">${escapeHtml(subtitle)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px; background: #f6f4ff; font: 400 12px/1.4 ${FONT}; color: #5d6288;">
                ${escapeHtml(footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** The internal notification sent to the GeoRepute mailbox. */
export function buildMeetingRequestEmailHtml(request: MeetingRequest): string {
  const { meet } = request;

  const meetBlock = meet
    ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(12, 17, 52, 0.1);">
                  <div style="font: 600 12px/1.4 ${FONT}; text-transform: uppercase; letter-spacing: 0.04em; color: #5d6288; margin-bottom: 8px;">
                    Requested meeting
                  </div>
                  <div style="font: 400 15px/1.6 ${FONT}; color: #0c1134; margin-bottom: 12px;">
                    ${escapeHtml(meet.slotLabel)}
                  </div>
                  ${
                    meet.link
                      ? button(meet.link, "Join Google Meet")
                      : `<div style="font: 400 14px/1.5 ${FONT}; color: #92400e;">${
                          meet.automatic
                            ? "The Meet link could not be created automatically — please reply to arrange one at this time."
                            : "The visitor asked to meet at this time — please reply to confirm it and send a Meet link."
                        }</div>`
                  }
                </div>`
    : "";

  return emailShell({
    subtitle: "New meeting request",
    footer: 'Sent from the "Schedule a Meeting" form on the GeoRepute website.',
    body: `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("Name", request.name)}
                  ${row("Email", request.email)}
                  ${request.phone ? row("Phone Number", request.phone) : ""}
                  ${request.company ? row("Company", request.company) : ""}
                  ${row("Subject", request.subject)}
                </table>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(12, 17, 52, 0.1);">
                  <div style="font: 600 12px/1.4 ${FONT}; text-transform: uppercase; letter-spacing: 0.04em; color: #5d6288; margin-bottom: 8px;">
                    Message
                  </div>
                  <div style="font: 400 15px/1.6 ${FONT}; color: #0c1134; white-space: pre-wrap;">${escapeHtml(request.message)}</div>
                </div>${meetBlock}
                <div style="margin-top: 24px;">
                  <a href="mailto:${encodeURIComponent(request.email)}" style="display: inline-block; padding: 11px 20px; border-radius: 8px; background: #6b34e8; color: #ffffff; font: 600 14px/1 ${FONT}; text-decoration: none;">
                    Reply to ${escapeHtml(request.name.split(" ")[0] || request.name)}
                  </a>
                </div>`,
  });
}

/** The confirmation sent to the visitor once their Google Meet has been created. */
export function buildMeetingConfirmationEmailHtml(request: MeetingRequest, meetLink: string, slotLabel: string): string {
  return emailShell({
    subtitle: "Your meeting is scheduled",
    footer: "You are receiving this because you requested a meeting on the GeoRepute website. Reply to this email if you need to change the time.",
    body: `
                <div style="font: 400 15px/1.6 ${FONT}; color: #0c1134; margin-bottom: 20px;">
                  Hi ${escapeHtml(request.name.split(" ")[0] || request.name)}, thanks for getting in touch — we've set up a Google Meet call for you.
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("Topic", request.subject)}
                  ${row("When", slotLabel)}
                  ${row("Meet link", meetLink)}
                  ${request.phone ? row("Phone Number", request.phone) : ""}
                </table>
                <div style="margin-top: 24px;">
                  ${button(meetLink, "Join Google Meet")}
                </div>`,
  });
}
