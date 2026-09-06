"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reconstruction as c } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 04 — Watch a decision form.
 *
 * The page's main cinematic sequence. The section is a tall scroll container
 * with a viewport-locked stage pinned inside it: nothing here flows, so no
 * element can ever scroll out of frame.
 *
 * This drives only the DOM — captions, ticks and the progress rail. The
 * matching camera and node choreography are six beats inside
 * `lib/sectionBeats.ts`, positioned across this same scroll range, so both
 * halves are read from scroll position and stay in step without either one
 * having to notify the other.
 */

export function DecisionReconstruction() {
  const wrap = useRef<HTMLElement>(null);
  const captions = useRef<(HTMLLIElement | null)[]>([]);
  const ticks = useRef<(HTMLLIElement | null)[]>([]);
  const railFill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const count = c.stages.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * Progress is derived from live geometry rather than ScrollTrigger's
     * cached start/end. Anything that changes the viewport without a resize
     * event — mobile URL-bar collapse, orientation change, layout shifting
     * above this section — leaves those caches stale and silently compresses
     * the sequence into part of its range. Reading the rect each update costs
     * nothing here and is always correct.
     */
    const render = () => {
      const r = el.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      const progress =
        range <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / range));

      // Position along the beat list, 0 → count-1
      const pos = progress * (count - 1);

      captions.current.forEach((node, i) => {
        if (!node) return;
        const d = Math.abs(pos - i);
        // Triangular window: fully lit on its beat, gone by the next one
        const o = Math.max(0, 1 - d * 1.45);
        node.style.opacity = String(o);
        node.style.transform = reduced
          ? "none"
          : `translate3d(0, ${(pos - i) * -22}px, 0)`;
      });

      ticks.current.forEach((node, i) => {
        if (!node) return;
        node.dataset.state =
          i <= Math.round(pos) ? (i === Math.round(pos) ? "active" : "done") : "ahead";
      });

      if (railFill.current) {
        railFill.current.style.transform = `scaleX(${progress})`;
      }
    };

    // A generous range so updates keep firing while the section is anywhere
    // near the viewport; the exact progress is computed inside `render`.
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: render,
      onRefresh: render,
    });

    render();
    window.addEventListener("resize", render, { passive: true });

    return () => {
      st.kill();
      window.removeEventListener("resize", render);
    };
  }, []);

  return (
    <section
      id="reconstruct"
      className="section recon"
      data-section
      ref={wrap}
      style={{ "--beats": c.stages.length } as React.CSSProperties}
    >
      <div className="recon__stage">
        {/* Top-left: what this section is, and the question being traced */}
        <div className="recon__head">
          <div className="sec-head__meta recon__meta">
            <span className="sec-head__index">{c.index}</span>
            <span className="t-label">{c.label}</span>
          </div>
          <h2 className="t-h3 recon__headline">{c.headline}</h2>

          <div className="recon__query glass">
            <span className="t-label">Commercial question</span>
            <p className="recon__query-text">{c.query}</p>
          </div>
        </div>

        {/* Lower third: the step rail and the caption for the current beat */}
        <div className="recon__lower">
          <ol className="recon__ticks">
            {c.stages.map((s, i) => (
              <li
                key={s.key}
                className="recon__tick"
                data-state={i === 0 ? "active" : "ahead"}
                ref={(n) => {
                  ticks.current[i] = n;
                }}
              >
                <span className="recon__tick-dot" aria-hidden="true" />
                <span className="recon__tick-label">{s.label}</span>
              </li>
            ))}
          </ol>

          <span className="recon__rail" aria-hidden="true">
            <span ref={railFill} className="recon__rail-fill" />
          </span>

          <ol className="recon__captions">
            {c.stages.map((s, i) => (
              <li
                key={s.key}
                className="recon__caption"
                ref={(n) => {
                  captions.current[i] = n;
                }}
              >
                <span className="t-eyebrow">{s.label}</span>
                <h3 className="recon__caption-title">{s.title}</h3>
                <p className="recon__caption-detail">{s.detail}</p>
              </li>
            ))}
          </ol>

          <p className="recon__sample">{c.sampleNote}</p>
        </div>
      </div>
    </section>
  );
}
