"use client";

import { useEffect, useRef } from "react";
import { results as base } from "@/lib/content";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Results — measured outcomes published on the live GeoRepute platform
 * (georepute.ai), placed as a compact trust strip ahead of the final CTA.
 * Not one of the numbered signature sections; it exists purely to back the
 * close with evidence a visitor can check against the main site themselves.
 *
 * Counters settle to their target once the strip enters view, same rAF
 * pattern as the executive dashboard — no state, no re-renders.
 */

const DURATION = 900;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));

    const settle = () => {
      nodes.forEach((n) => {
        const target = Number(n.dataset.count);
        const decimals = Number(n.dataset.decimals ?? 0);
        n.textContent = target.toFixed(decimals);
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          const e = easeOut(t);
          nodes.forEach((n) => {
            const target = Number(n.dataset.count);
            const decimals = Number(n.dataset.decimals ?? 0);
            n.textContent = (target * e).toFixed(decimals);
          });
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return root;
}

export function Results({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).results;
  const root = useCountUp();

  return (
    <section id="results" className="section results" data-section>
      <div className="shell">
        <p className="t-eyebrow results__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="results__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>

        <div className="results__grid" ref={root}>
          {base.stats.map((stat, i) => (
            <div
              key={i}
              className="results__stat"
              data-reveal
              data-reveal-delay={120 + i * 60}
            >
              <span className="t-metric results__value">
                {stat.prefix}
                <span data-count={stat.value} data-decimals={stat.decimals}>
                  0
                </span>
                {stat.suffix}
              </span>
              <span className="results__label">{c.stats[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
