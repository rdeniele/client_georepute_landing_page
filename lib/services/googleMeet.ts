import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Creates Google Calendar events with a Google Meet link, straight against the
 * Calendar REST API (no SDK — two fetch calls). Auth is an OAuth refresh token
 * for the GeoRepute Google account, so events land on that account's calendar
 * and the Meet link is hosted by it. See .env.example for the one-time setup.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars";
const MEETING_MINUTES = 30;

/** A wall-clock time in the visitor's own timezone, as sent by the form. */
export type MeetingSlot = {
  /** `YYYY-MM-DDTHH:mm` (the value of an `<input type="datetime-local">`). */
  start: string;
  /** IANA timezone name, e.g. `Europe/Berlin`. */
  timeZone: string;
};

export type MeetEvent = { eventId: string; meetLink: string };

export function isGoogleMeetConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN,
  );
}

const SLOT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Validates a slot from the form; returns `null` when it is malformed or not in the future. */
export function parseMeetingSlot(start: string, timeZone: string): MeetingSlot | null {
  if (!SLOT_RE.test(start) || Number.isNaN(Date.parse(`${start}:00Z`))) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
  } catch {
    return null;
  }
  return wallClockToUtcMs({ start, timeZone }) > Date.now() ? { start, timeZone } : null;
}

/** The instant a wall-clock time falls on in the given timezone. */
function wallClockToUtcMs({ start, timeZone }: MeetingSlot): number {
  const asUtc = Date.parse(`${start}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(asUtc));
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const shownAsUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return asUtc - (shownAsUtc - asUtc);
}

/** Human-readable slot for emails, e.g. "Friday, September 25, 2026 at 2:00 PM (Europe/Berlin)". */
export function formatMeetingSlot(slot: MeetingSlot): string {
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: slot.timeZone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(wallClockToUtcMs(slot)));
  return `${label} (${slot.timeZone})`;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
    error?: string;
  };
  if (!response.ok || !data.access_token) {
    throw new Error(`Google auth failed: ${data.error_description ?? data.error ?? response.status}`);
  }

  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

type CalendarEvent = {
  id: string;
  hangoutLink?: string;
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
};

function meetLinkOf(event: CalendarEvent): string | null {
  return (
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ??
    null
  );
}

async function calendarRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");
  return fetch(`${CALENDAR_API}/${calendarId}/events${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      "Content-Type": "application/json",
    },
  });
}

export type CreateMeetEventInput = {
  slot: MeetingSlot;
  summary: string;
  description: string;
  attendee: { email: string; name: string };
};

/**
 * Creates the calendar event with a Meet room attached and returns its link.
 * The visitor is added as an attendee but Google sends no invite of its own
 * (`sendUpdates=none`) — the confirmation email carrying the link is the one
 * message they get.
 */
export async function createMeetEvent(input: CreateMeetEventInput): Promise<MeetEvent> {
  const { slot } = input;
  // Wall-clock arithmetic in UTC, then printed without an offset, so the end
  // stays in the same timezone as the start without any conversion.
  const end = new Date(Date.parse(`${slot.start}:00Z`) + MEETING_MINUTES * 60_000).toISOString().slice(0, 16);

  const response = await calendarRequest("?conferenceDataVersion=1&sendUpdates=none", {
    method: "POST",
    body: JSON.stringify({
      summary: input.summary,
      description: input.description,
      start: { dateTime: `${slot.start}:00`, timeZone: slot.timeZone },
      end: { dateTime: `${end}:00`, timeZone: slot.timeZone },
      attendees: [{ email: input.attendee.email, displayName: input.attendee.name }],
      conferenceData: {
        createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
      },
    }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`Google Calendar error: ${body.error?.message ?? response.status}`);
  }

  let event = (await response.json()) as CalendarEvent;
  // Meet rooms are occasionally still "pending" on the insert response.
  for (let attempt = 0; attempt < 3 && !meetLinkOf(event); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const retry = await calendarRequest(`/${encodeURIComponent(event.id)}?conferenceDataVersion=1`);
    if (retry.ok) event = (await retry.json()) as CalendarEvent;
  }

  const meetLink = meetLinkOf(event);
  if (!meetLink) {
    await deleteMeetEvent(event.id);
    throw new Error("Google Calendar did not return a Meet link.");
  }
  return { eventId: event.id, meetLink };
}

/** Best-effort cleanup so a request that ends up failing doesn't leave an orphan event on the calendar. */
export async function deleteMeetEvent(eventId: string): Promise<void> {
  try {
    await calendarRequest(`/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: "DELETE" });
  } catch {
    // Nothing useful to do — the event is harmless if it lingers.
  }
}
