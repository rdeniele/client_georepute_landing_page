"use client";

/**
 * Tiny opt-in diagnostic log for tracking down the "page goes blank after
 * switching tabs" reports that screenshots alone haven't been enough to
 * pin down. Off by default for every real visitor; a browser only sees
 * <DebugHUD /> (components/debug/DebugHUD.tsx) after visiting once with
 * `?debug=1`, which flips the localStorage flag this module checks.
 *
 * Entries persist to localStorage (not just React state), so if the page
 * genuinely never paints anything again the log written up to that point
 * survives a reload and can still be read back.
 */

const ENABLED_KEY = "georepute-debug";
const LOG_KEY = "georepute-debug-log";
const MAX_ENTRIES = 40;

export type DebugEntry = { t: number; msg: string };

export function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Reads `?debug=1` / `?debug=0` off the current URL and persists the flag. Safe to call on every page. */
export function syncDebugFlagFromUrl(): void {
  if (typeof window === "undefined") return;
  const value = new URLSearchParams(window.location.search).get("debug");
  if (value === null) return;
  try {
    if (value === "1") window.localStorage.setItem(ENABLED_KEY, "1");
    else window.localStorage.removeItem(ENABLED_KEY);
  } catch {
    /* no-op: localStorage unavailable */
  }
}

function read(): DebugEntry[] {
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as DebugEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: DebugEntry[]): void {
  try {
    window.localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    /* no-op: storage full or unavailable, the in-memory log still updates */
  }
}

export const DEBUG_LOG_EVENT = "georepute:debug-log";

/** No-ops entirely unless the flag is on, so this is safe to call from hot paths. */
export function debugLog(msg: string): void {
  if (typeof window === "undefined" || !isDebugEnabled()) return;
  const entries = [...read(), { t: Date.now(), msg }].slice(-MAX_ENTRIES);
  write(entries);
  window.dispatchEvent(new CustomEvent<DebugEntry[]>(DEBUG_LOG_EVENT, { detail: entries }));
}

export function readDebugLog(): DebugEntry[] {
  if (typeof window === "undefined") return [];
  return read();
}

export function clearDebugLog(): void {
  if (typeof window === "undefined") return;
  write([]);
  window.dispatchEvent(new CustomEvent<DebugEntry[]>(DEBUG_LOG_EVENT, { detail: [] }));
}
