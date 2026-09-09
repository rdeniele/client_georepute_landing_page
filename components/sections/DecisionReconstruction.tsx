"use client";

import { useRef } from "react";
import { reconstruction as base } from "@/lib/content";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 04 — Watch a decision form.
 *
 * All six stages stay visible in a calm framed grid. Scroll changes emphasis
 * only, so the process remains understandable without a pinned sequence.
 */

export function DecisionReconstruction({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).reconstruction;
  const cardsRef = useRef<HTMLOListElement>(null);

  const scrollCards = (direction: number) => {
    cardsRef.current?.scrollBy({
      left: direction * Math.max(280, cardsRef.current.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  return (
    <section
      id="reconstruct"
      className="section recon"
      data-section
    >
      <div className="shell recon__shell">
        <div className="recon__head">
          <div className="sec-head__meta recon__meta">
            <span className="sec-head__index">{base.index}</span>
            <span className="t-label">{c.label}</span>
          </div>
          <h2 className="t-h3 recon__headline">{c.headline}</h2>

          <div className="recon__query glass">
            <span className="t-label">{c.commercialQuestion}</span>
            <p className="recon__query-text">{c.query}</p>
          </div>
        </div>

        <div className="recon__carousel-controls" aria-label="Carousel controls">
          <button type="button" onClick={() => scrollCards(-1)} aria-label="Previous stage">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={() => scrollCards(1)} aria-label="Next stage">
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <ol ref={cardsRef} className="recon__cards" aria-label="Decision reconstruction stages">
          {base.stages.map((s, i) => (
            <li
              key={s.key}
              className="recon__card"
            >
              <div className="recon__card-top">
                <span className="recon__card-number">0{i + 1}</span>
              </div>
              <span className="t-eyebrow">{c.stages[i].label}</span>
              <h3>{c.stages[i].title}</h3>
              <p>{c.stages[i].detail}</p>
            </li>
          ))}
        </ol>

        <p className="recon__sample">{c.sampleNote}</p>
      </div>
    </section>
  );
}
