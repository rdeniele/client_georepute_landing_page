/**
 * Log-safe error descriptions. Provider and SDK errors routinely echo the
 * request that failed, and here that request can contain a visitor's name,
 * email, phone number and message, or a credential. Anything written to server
 * logs (which are retained and widely readable) goes through these helpers, so
 * personal data and secrets are removed before they are stored.
 *
 * Pure and dependency free so it can be tested without Next.
 */

const SECRET_PREFIXES = /\b(?:sk-ant-|sk-|re_|ghp_|gho_|xox[bap]-|ya29\.|1\/\/)[A-Za-z0-9._\-/]{12,}/g;

/** Removes emails, credentials, JWTs, secret-looking query values and phone-like numbers from text. */
export function redact(text: string): string {
  return text
    .replace(SECRET_PREFIXES, "[secret]")
    .replace(/\bBearer\s+[A-Za-z0-9._\-~+/]+=*/gi, "Bearer [secret]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*/g, "[jwt]")
    .replace(/([?&](?:key|token|access_token|refresh_token|api_key|apikey|code|secret|password)=)[^&\s"']+/gi, "$1[secret]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "[number]" : m));
}

/** "ErrorName: redacted message", capped so one bad response cannot flood the logs. Never includes the stack or the raw object. */
export function describeError(error: unknown, max = 300): string {
  const name = error instanceof Error ? error.name : typeof error;
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const out = `${name}: ${redact(message)}`.trim();
  return out.length > max ? `${out.slice(0, max)}...` : out;
}
