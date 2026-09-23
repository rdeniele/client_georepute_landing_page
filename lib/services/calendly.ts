import "server-only";

/** Falls back to the client's own scheduling page when CALENDLY_URL isn't set in the environment yet. */
const DEFAULT_CALENDLY_URL = "https://calendly.com/georepute/30min";

/**
 * The Calendly scheduling page embedded on /briefing, from `CALENDLY_URL`
 * (e.g. https://calendly.com/georepute/30min). Read at request time, so it
 * follows the deployment's environment. Returns `null` only when the value
 * (env var or the default above) isn't an https calendly.com link, so the
 * embed can't point somewhere unexpected.
 */
export function getCalendlyUrl(): string | null {
  const raw = process.env.CALENDLY_URL?.trim() || DEFAULT_CALENDLY_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "calendly.com") return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
