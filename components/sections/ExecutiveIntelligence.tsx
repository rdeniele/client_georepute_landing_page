"use client";

import { useEffect, useRef } from "react";
import { executive as base } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { ProductShot } from "@/components/ui/ProductShot";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 09 — Executive intelligence.
 *
 * Ten measures resolving into one position, presented as product UI rather
 * than as decorative charts. Counters and meters are driven by rAF writing
 * directly to the DOM once the panel enters view — no state updates, no
 * re-renders, and the whole thing settles to its final value and stops.
 */

const DURATION = 900;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Counts every [data-count] up to its target once the panel is in view. */
function useDashboardReveal() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const counters = Array.from(
      el.querySelectorAll<HTMLElement>("[data-count]"),
    );
    const meters = Array.from(el.querySelectorAll<HTMLElement>("[data-meter]"));
    const dial = el.querySelector<SVGCircleElement>("[data-dial]");

    const settle = () => {
      counters.forEach((n) => (n.textContent = String(n.dataset.count)));
      meters.forEach((m) => {
        m.style.transform = `scaleX(${Number(m.dataset.meter) / 100})`;
      });
      if (dial) dial.style.strokeDashoffset = String(dial.dataset.offset);
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

          counters.forEach((n) => {
            n.textContent = String(Math.round(Number(n.dataset.count) * e));
          });
          meters.forEach((m) => {
            m.style.transform = `scaleX(${(Number(m.dataset.meter) / 100) * e})`;
          });
          if (dial) {
            const target = Number(dial.dataset.offset);
            const full = Number(dial.dataset.full);
            dial.style.strokeDashoffset = String(full - (full - target) * e);
          }

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

function band(v: number) {
  if (v < 50) return "is-gap";
  if (v < 70) return "is-mid";
  return "is-strong";
}

const DIAL_R = 78;
const DIAL_C = 2 * Math.PI * DIAL_R;

export function ExecutiveIntelligence({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).executive;
  const root = useDashboardReveal();
  const dialTarget = DIAL_C - (DIAL_C * base.position.value) / 100;

  return (
    <section
      id="executive"
      className="section band band--paper"
      data-section
    >
      <Band tone="paper" edge="feather" />

      <div className="shell">
        <SectionHeader
          index={base.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <div className="exec glass" ref={root} data-reveal>
          <div className="exec__bar">
            <span className="t-label">{c.label}</span>
            <span className="exec__sample">{c.sampleNote}</span>
          </div>

          <div className="exec__body">
            <div className="exec__position">
              <svg className="exec__dial" viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r={DIAL_R} className="exec__dial-track" />
                <circle
                  cx="100"
                  cy="100"
                  r={DIAL_R}
                  className="exec__dial-value"
                  strokeDasharray={DIAL_C}
                  strokeDashoffset={DIAL_C}
                  data-dial
                  data-offset={dialTarget}
                  data-full={DIAL_C}
                />
              </svg>
              <div className="exec__position-text">
                <span className="t-metric exec__position-value">
                  <span data-count={base.position.value}>0</span>
                </span>
                <span className="t-label exec__position-label">
                  {c.positionLabel}
                </span>
                <span className="exec__position-state">{c.positionState}</span>
              </div>
            </div>

            <ol className="exec__measures">
              {base.measures.map((m, i) => (
                <li key={m.name} className={`measure ${band(m.value)}`}>
                  <span className="measure__name">{c.measureNames[i]}</span>
                  <span className="measure__track" aria-hidden="true">
                    <span className="measure__fill" data-meter={m.value} />
                  </span>
                  <span className="measure__value">
                    <span data-count={m.value}>0</span>
                    <span className="sr-only"> {c.outOf100}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ProductShot
          src="/screenshots/UI1.png"
          alt="GeoRepute's Brand Intelligence Dashboard: overall score, AI visibility, decision presence, narrative ownership, and the six-measure score breakdown behind the position."
          url="app.georepute.ai/mission-control"
          ratio="3 / 2"
          size="wide"
          className="exec__shot"
        />
      </div>
    </section>
  );
}
