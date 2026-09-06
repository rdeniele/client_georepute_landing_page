"use client";

import { useEffect } from "react";

/**
 * Drives the page's shared entrance vocabulary.
 *
 * Every `[data-reveal]` / `[data-draw]` element is flipped to
 * `data-revealed="true"` once when it enters the viewport. IntersectionObserver
 * rather than a scroll handler, and elements are unobserved after firing, so
 * a long page costs nothing to scroll back through.
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(
            () => el.setAttribute("data-revealed", "true"),
            delay,
          );
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}
