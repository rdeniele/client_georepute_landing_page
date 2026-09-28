"use client";

import { useEffect } from "react";
import { debugLog } from "./debugLog";

/**
 * Forces the browser to flush a real repaint when the tab becomes visible
 * again (or a page is restored from bfcache).
 *
 * Every other fix here addresses *our* state (React, the WebGL canvas, the
 * reveal timers, Lenis/ScrollTrigger's measurements). Diagnostic logging
 * (see DebugHUD) confirmed all of that is running correctly even when the
 * report still happens: the DOM has the real content, nothing threw, the
 * canvas re-rendered with the right state, yet the screen itself stayed
 * blank. That is not a state bug, it's a compositor bug: Chromium-based
 * browsers (this one included) occasionally fail to actually flush a new
 * composited frame to the display after a hidden tab (running heavy
 * GPU-accelerated content, like the persistent WebGL scene) becomes visible
 * again, especially under GPU/driver load. The standard mitigation is to
 * force a synchronous reflow, which makes the browser recompute layout and
 * repaint on its own rather than trusting whatever the compositor last had
 * queued.
 */
export function useForceRepaint() {
  useEffect(() => {
    const nudge = (reason: string) => {
      const el = document.documentElement;
      // Reading offsetHeight after a display toggle forces a synchronous
      // reflow; this is the well-known browser-compatible way to force one,
      // there is no dedicated API for "repaint now".
      const prevDisplay = el.style.display;
      el.style.display = "none";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.style.display = prevDisplay;
      debugLog(`repaint: forced (${reason})`);
    };

    const onVisibility = () => {
      if (!document.hidden) requestAnimationFrame(() => nudge("visibilitychange"));
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPageShow = () => requestAnimationFrame(() => nudge("pageshow"));
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
}
