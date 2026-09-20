import "server-only";

/**
 * The Calendly scheduling page embedded on /briefing, from `CALENDLY_URL`
 * (e.g. https://calendly.com/georepute/30min). Read at request time, so it
 * follows the deployment's environment. Returns `null` when unset or when the
 * value is anything other than an https calendly.com link, so the embed can't
 * point somewhere unexpected.
 */
export function getCalendlyUrl(): string | null {
  const raw = process.env.CALENDLY_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "calendly.com") return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
