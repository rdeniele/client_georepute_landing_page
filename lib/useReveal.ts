"use client";

import { useEffect } from "react";

/**
 * Drives the page's shared entrance vocabulary.
 *
 * Every `[data-reveal]` / `[data-draw]` element is flipped to
 * `data-revealed="true"` once when it enters the viewport. IntersectionObserver
 * rather than a scroll handler, and elements are unobserved after firing, so
 * a long page costs nothing to scroll back through.
 *
 * The reveal itself is staged behind `window.setTimeout(..., delay)`, and a
 * backgrounded tab does not reliably run pending timers: a browser can freeze
 * a hidden tab's whole task queue (the Page Lifecycle "frozen" state) between
 * the observer firing and that timeout actually running, and does not
 * guarantee replaying it on the way back. Content that entered the viewport
 * right before the tab was backgrounded can then stay at `opacity: 0`
 * forever, which reads as "the page is blank" even though everything else on
 * it loaded fine, exactly the case reported after switching tabs and back
 * (reloading "fixes" it only because the observer runs again from scratch on
 * a foreground page). `visibilitychange` back to visible re-checks every
 * element still waiting on its reveal and, if it is already sitting in the
 * viewport, sets `data-revealed` immediately instead of trusting a timer that
 * may never have run.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-draw]",
    );
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.setAttribute("data-revealed", "true"));
      return;
    }

    const pending = new Set<HTMLElement>(nodes);
    const reveal = (el: HTMLElement) => {
      pending.delete(el);
      el.setAttribute("data-revealed", "true");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(() => {
            if (pending.has(el)) reveal(el);
          }, delay);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    nodes.forEach((n) => io.observe(n));

    const onVisible = () => {
      if (document.hidden || !pending.size) return;
      for (const el of [...pending]) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) reveal(el);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
