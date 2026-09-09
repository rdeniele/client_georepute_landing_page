"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { platformFlow as base } from "@/lib/content";
import { getLocaleCopy } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

/**
 * The platform flow: Research → Intelligence → Opportunity → Decision →
 * Strategy → Work Plan → Execution → Measurement → Improvement.
 *
 * No pinning, no scroll-jacking — the section scrolls at the visitor's own
 * pace. Each chip gets its own ScrollTrigger and lights up (plus a short
 * rise) the moment it individually crosses into view, in order, left to
 * right / top to bottom — a per-element reveal rather than one fragile
 * scrubbed range, so it stays correct regardless of how the row wraps at
 * a given viewport width. A single scrubbed trigger on the row as a whole
 * drives the connecting rail fill underneath, purely decorative.
 */
export function PlatformFlowSection({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).platformFlow;
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const row = rowRef.current;
    const fill = fillRef.current;
    if (!root || !row || !fill) return;

    const steps = Array.from(row.querySelectorAll<HTMLElement>("[data-flow-step]"));
    if (!steps.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      steps.forEach((s) => s.setAttribute("data-active", "true"));
      fill.style.transform = "scaleX(1)";
      return;
    }

    gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });

    const stepTriggers = steps.map((step, i) =>
      ScrollTrigger.create({
        trigger: step,
        start: "top 88%",
        once: true,
        onEnter: () => {
          window.setTimeout(() => step.setAttribute("data-active", "true"), i * 60);
        },
      }),
    );

    const railTrigger = ScrollTrigger.create({
      trigger: row,
      start: "top 85%",
      end: "bottom 65%",
      scrub: 0.4,
      onUpdate: (self) => {
        fill.style.transform = `scaleX(${self.progress})`;
      },
    });

    return () => {
      stepTriggers.forEach((t) => t.kill());
      railTrigger.kill();
    };
  }, []);

  return (
    <section id="platform-flow" className="section flow" data-section>
      <div className="shell flow__inner" ref={rootRef}>
        <p className="t-eyebrow flow__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="flow__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>

        <div className="flow__rail" aria-hidden="true">
          <span className="flow__rail-fill" ref={fillRef} />
        </div>

        <ol className="flow__row" ref={rowRef}>
          {base.steps.map((_, i) => (
            <li
              key={c.steps[i]}
              className="flow__step"
              data-flow-step
              data-active="false"
            >
              <span className="flow__step-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="flow__step-label">{c.steps[i]}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
