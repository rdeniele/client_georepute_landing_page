"use client";

import { useEffect, useRef, useState } from "react";
import { tryTool as base } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Try it — directly after the hero. The visitor types a business name and
 * watches a results panel resolve using the same measure vocabulary as the
 * executive dashboard, then the panel goes behind a blur with an unlock CTA
 * to the live platform. The values are fixed and illustrative — never a real
 * analysis — which is why the panel carries the same sample-note discipline
 * as the executive dashboard instead of pretending to be a live scan.
 */

const DURATION = 700;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Phase = "idle" | "analyzing" | "revealed";

export function TryTool({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).tryTool;
  const outOf100 = getLocaleCopy(locale).executive.outOf100;
  const [domain, setDomain] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "revealed") return;
    const el = panelRef.current;
    if (!el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => (n.textContent = String(n.dataset.count)));
      return;
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const e = easeOut(t);
      nodes.forEach((n) => {
        n.textContent = String(Math.round(Number(n.dataset.count) * e));
      });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || phase !== "idle") return;
    setPhase("analyzing");
    window.setTimeout(() => setPhase("revealed"), 1200);
  };

  const unlockHref = domain.trim()
    ? `${base.unlockHref}?domain=${encodeURIComponent(domain.trim())}`
    : base.unlockHref;

  return (
    <section id="try-it" className="section trytool" data-section>
      <div className="shell">
        <p className="t-eyebrow trytool__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="trytool__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>
        <p className="t-lead trytool__body" data-reveal data-reveal-delay="120">
          {c.body}
        </p>

        <form
          className="trytool__form"
          onSubmit={submit}
          data-reveal
          data-reveal-delay="180"
        >
          <input
            type="text"
            className="trytool__input"
            placeholder={c.placeholder}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={phase !== "idle"}
            aria-label={c.placeholder}
          />
          <button
            type="submit"
            className="btn btn--conversion trytool__submit"
            disabled={phase !== "idle" || !domain.trim()}
          >
            {phase === "analyzing" ? c.analyzing : c.submitCta}
          </button>
        </form>

        {phase !== "idle" && (
          <div className="trytool__panel-wrap">
            <div
              ref={panelRef}
              className={`trytool__panel glass ${phase === "revealed" ? "is-blurred" : ""}`}
              aria-live="polite"
            >
              <div className="trytool__panel-bar">
                <span className="t-label">
                  {c.resultsLabel} &ldquo;{domain.trim()}&rdquo;
                </span>
                <span className="trytool__sample">{c.sampleNote}</span>
              </div>
              <ol className="trytool__measures">
                {base.measures.map((m, i) => (
                  <li key={m.name} className="measure">
                    <span className="measure__name">{c.measureNames[i]}</span>
                    <span className="measure__track" aria-hidden="true">
                      <span
                        className="measure__fill"
                        style={{
                          transform:
                            phase === "revealed"
                              ? `scaleX(${m.value / 100})`
                              : "scaleX(0)",
                        }}
                      />
                    </span>
                    <span className="measure__value">
                      <span data-count={m.value}>0</span>
                      <span className="sr-only"> {outOf100}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {phase === "analyzing" && (
              <div className="trytool__scanline" aria-hidden="true" />
            )}

            {phase === "revealed" && (
              <div className="trytool__unlock glass">
                <span className="t-h4 trytool__unlock-headline">
                  {c.unlockHeadline}
                </span>
                <p className="t-body trytool__unlock-body">{c.unlockBody}</p>
                <Button href={unlockHref} variant="conversion">
                  {c.unlockCta}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
