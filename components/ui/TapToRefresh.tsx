"use client";

import { useEffect, useState } from "react";
import { debugLog } from "@/lib/debugLog";

/**
 * A last-resort, one-tap recovery affordance for the "page looks broken
 * after switching tabs and back" reports on mobile: diagnostic logging (see
 * DebugHUD) showed our own React/WebGL/scroll state was correct every time
 * this was checked, yet the page still looked wrong, and a full reload was
 * the one thing that reliably fixed it. There is no way to detect the
 * failure itself from inside the page (nothing throws), so this shows a
 * small, plain, low-effort-to-paint button a few seconds after the tab
 * becomes visible again, instead of silently reloading for every visitor on
 * every tab switch. Deliberately styled as simply as DebugHUD (a flat,
 * solid element, no blur/blend/animation) so it has the best chance of
 * actually being usable even if something about the surrounding page isn't.
 */
const SHOW_AFTER_MS = 2200;
const AUTO_HIDE_MS = 12000;

export function TapToRefresh() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    const clear = () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };

    const onVisible = () => {
      if (document.hidden) return;
      clear();
      showTimer = window.setTimeout(() => {
        setShow(true);
        debugLog("tapToRefresh: shown");
        hideTimer = window.setTimeout(() => {
          setShow(false);
          debugLog("tapToRefresh: auto-hidden");
        }, AUTO_HIDE_MS);
      }, SHOW_AFTER_MS);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clear();
    };
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => {
        debugLog("tapToRefresh: tapped, reloading");
        window.location.reload();
      }}
      style={{
        position: "fixed",
        bottom: 16,
        insetInlineStart: "50%",
        transform: "translateX(-50%)",
        zIndex: 999998,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 999,
        border: "none",
        background: "#171433",
        color: "#F4F2FF",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      }}
    >
      <span aria-hidden="true">↻</span>
      Looking blank? Tap to refresh
    </button>
  );
}
