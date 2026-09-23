"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Cookie / local-storage notice.
 *
 * Mirrors the `georepute-theme` localStorage-key convention set up in
 * app/layout.tsx and lib/theme.ts, but this bar needs no pre-hydration
 * script: unlike the theme class (which must be right for the very first
 * paint or it flashes), a slide-up notice simply isn't shown until the
 * effect below decides it should be, so there's nothing to flash.
 *
 * This is honest about what it's disclosing: the site has no third-party
 * analytics or ad tracking (see AGENTS.md / the grep that confirmed that
 * before this was written). What's stored is functional — theme, locale
 * hints, the "seen the intro" flag, the Try-it preview state, and this
 * banner's own choice. "Necessary only" and "Accept" therefore both leave
 * the site working identically; the choice is recorded for transparency
 * and future-proofing rather than to gate any tracking that doesn't exist.
 */

const STORAGE_KEY = "georepute-cookie-consent";
/** A beat after mount, so the bar never competes with first paint or the intro modal's own opening (see IntroModal's OPEN_DELAY_MS). */
const OPEN_DELAY_MS = 900;

export type CookieChoice = "all" | "necessary";

function readChoice(): CookieChoice | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "all" || v === "necessary" ? v : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: CookieChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage unavailable, the banner simply shows again next visit */
  }
}

/**
 * A quiet, bottom-fixed bar — deliberately not a dialog. Nothing on the page
 * is inert while it's up, so unlike components/intro/IntroModal.tsx and
 * components/try/TryModal.tsx it carries no role="dialog"/aria-modal, traps
 * no focus and locks no scroll; it's announced as a landmark region instead
 * so screen-reader users still get to it, on their terms, without it
 * intercepting Tab order the moment it appears.
 */
export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    setMounted(true);
    // Set by the inline locale-detection script in app/layout.tsx before
    // first paint; falls back to "en" if it somehow hasn't run yet.
    setLocale(document.documentElement.dataset.locale || "en");

    if (readChoice()) return;
    const t = window.setTimeout(() => setVisible(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const decide = useCallback((choice: CookieChoice) => {
    writeChoice(choice);
    setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="cookiebar" role="region" aria-label="Cookie notice">
      <p className="cookiebar__body">
        This site uses necessary and preference cookies / local storage, things like your theme, language and this
        choice. There&apos;s no third-party analytics or ad tracking.{" "}
        <a href={`/${locale}/privacy`}>Read the privacy &amp; cookie policy</a>.
      </p>
      <div className="cookiebar__actions">
        <button type="button" className="btn btn--ghost cookiebar__btn" onClick={() => decide("necessary")}>
          Necessary only
        </button>
        <button type="button" className="btn btn--primary cookiebar__btn" onClick={() => decide("all")}>
          Accept
        </button>
      </div>
    </div>,
    document.body,
  );
}
