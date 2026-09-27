/**
 * Scheduling maths. Pure functions of (settings, now, what is already planned), so the planner is
 * deterministic and testable: the same inputs always produce the same days, times and languages.
 *
 * Time zones are handled with Intl only (no library). A publish time of "09:00" in
 * "Asia/Jerusalem" means 09:00 on the wall clock there, whatever the server's own zone or DST.
 */
import { LOCALES } from "@/lib/i18n";
import { resolveLanguages, type AutomationSettings } from "./config";

/* ---------------------------------- time ---------------------------------- */

function offsetMs(utcMs: number, timeZone: string): number {
  const whole = Math.floor(utcMs / 1000) * 1000;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(whole));
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second")) - whole;
}

/** The instant at which the wall clock in `timeZone` reads `date` `time`. */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  let utc = wall - offsetMs(wall, timeZone);
  // Around a DST change the first guess can be an hour out; one correction settles it.
  const again = offsetMs(utc, timeZone);
  if (wall - again !== utc) utc = wall - again;
  return new Date(utc);
}

/** The calendar date (YYYY-MM-DD) it is right now in `timeZone`. */
export function dateInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const v = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Publish instants for one day: the first at `publishTime`, then every `step` minutes. The step
 * shrinks for large daily volumes so everything still lands within about 12 hours of the start.
 */
export function daySlots(date: string, s: Pick<AutomationSettings, "publishTime" | "timezone" | "articlesPerDay" | "spreadMinutes">): Date[] {
  const start = zonedTimeToUtc(date, s.publishTime, s.timezone).getTime();
  const step = Math.min(s.spreadMinutes, Math.floor(720 / Math.max(1, s.articlesPerDay)));
  return Array.from({ length: s.articlesPerDay }, (_, i) => new Date(start + i * step * 60_000));
}

/* --------------------------------- planning -------------------------------- */

export type PlanDay = { date: string; assigned: number; free: number };

/**
 * The days the planner may fill right now: from today (or the start date, if later) through the look-ahead,
 * skipping today when its publish time has already passed. `assigned` is what each date already holds.
 */
export function planWindow(now: Date, s: AutomationSettings, assignedByDate: Record<string, number>): PlanDay[] {
  const today = dateInZone(now, s.timezone);
  const first = s.startDate && s.startDate > today ? s.startDate : today;
  const last = addDays(today, s.lookaheadDays - 1);
  const days: PlanDay[] = [];
  for (let date = first; date <= last; date = addDays(date, 1)) {
    const assigned = assignedByDate[date] ?? 0;
    // A day whose first slot is already behind us is not topped up any more; the next one is.
    if (daySlots(date, s)[0].getTime() <= now.getTime()) continue;
    days.push({ date, assigned, free: Math.max(0, s.articlesPerDay - assigned) });
  }
  return days;
}

export type LocalePlan = { source: string; targets: string[] };

/**
 * Which languages one topic is published in.
 *  - all_languages: written once in the canonical language, then adapted into every other language.
 *  - rotate: written directly in ONE language, taking turns, so a day of 10 articles is 10 pieces.
 * `ordinal` is the topic's running number, which is what makes the rotation deterministic.
 */
export function planLocales(s: AutomationSettings, ordinal: number, supported: readonly string[] = LOCALES): LocalePlan {
  const languages = resolveLanguages(s, supported);
  if (s.languageMode === "rotate" && languages.length > 1) {
    return { source: languages[ordinal % languages.length], targets: [] };
  }
  const source = languages.includes(s.sourceLocale) ? s.sourceLocale : languages[0];
  return { source, targets: languages.filter((l) => l !== source) };
}

export type Assignment = {
  topicId: string;
  date: string;
  /** Position within the day, which decides the publish time. */
  slot: number;
  scheduledAt: Date;
  plan: LocalePlan;
};

/** Hands the next queued topics to the days that have room, earliest day first. */
export function assignTopics(
  topicIds: string[],
  days: PlanDay[],
  s: AutomationSettings,
  firstOrdinal: number,
  supported: readonly string[] = LOCALES,
): Assignment[] {
  const out: Assignment[] = [];
  let next = 0;
  for (const day of days) {
    const slots = daySlots(day.date, s);
    for (let i = 0; i < day.free && next < topicIds.length; i++) {
      const slot = day.assigned + i;
      out.push({
        topicId: topicIds[next],
        date: day.date,
        slot,
        scheduledAt: slots[Math.min(slot, slots.length - 1)],
        plan: planLocales(s, firstOrdinal + next, supported),
      });
      next++;
    }
  }
  return out;
}

/** "2026-10-01T09:30": an instant as a local date and time in `timeZone`, the format a datetime-local input uses. */
export function toDateTimeLocal(iso: string, timeZone: string): string {
  const d = new Date(iso);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return `${dateInZone(d, timeZone)}T${time}`;
}
