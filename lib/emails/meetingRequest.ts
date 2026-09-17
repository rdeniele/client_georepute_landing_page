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

/**
 * Table-based layout with every style inlined — the only markup approach
 * that renders consistently across email clients (Gmail, Outlook, Apple
 * Mail strip <style> blocks and don't support flexbox/grid).
 * Colors match the site's light-mode brand palette (app/globals.css).
 */
export function buildMeetingRequestEmailHtml(request: MeetingRequest): string {
  const hasLogo = getLogoBase64() !== null;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 4px 0; font: 600 12px/1.4 -apple-system, Segoe UI, Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.04em; color: #5d6288; width: 110px; vertical-align: top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 4px 0; font: 400 15px/1.5 -apple-system, Segoe UI, Arial, sans-serif; color: #0c1134;">
        ${escapeHtml(value)}
      </td>
    </tr>`;

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
                <span style="font: 600 18px/1.3 -apple-system, Segoe UI, Arial, sans-serif; color: #f6f4ff;">GeoRepute</span>
                <div style="font: 400 12px/1.4 -apple-system, Segoe UI, Arial, sans-serif; color: #a9aed0; margin-top: 2px;">New meeting request</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("Name", request.name)}
                  ${row("Email", request.email)}
                  ${request.company ? row("Company", request.company) : ""}
                </table>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(12, 17, 52, 0.1);">
                  <div style="font: 600 12px/1.4 -apple-system, Segoe UI, Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.04em; color: #5d6288; margin-bottom: 8px;">
                    Message
                  </div>
                  <div style="font: 400 15px/1.6 -apple-system, Segoe UI, Arial, sans-serif; color: #0c1134; white-space: pre-wrap;">${escapeHtml(request.message)}</div>
                </div>
                <div style="margin-top: 24px;">
                  <a href="mailto:${encodeURIComponent(request.email)}" style="display: inline-block; padding: 11px 20px; border-radius: 8px; background: #6b34e8; color: #ffffff; font: 600 14px/1 -apple-system, Segoe UI, Arial, sans-serif; text-decoration: none;">
                    Reply to ${escapeHtml(request.name.split(" ")[0] || request.name)}
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px; background: #f6f4ff; font: 400 12px/1.4 -apple-system, Segoe UI, Arial, sans-serif; color: #5d6288;">
                Sent from the "Schedule a Meeting" form on the GeoRepute website.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
