"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { engines as base } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 06 — The intelligence engines.
 *
 * A graph rather than a card grid. Nodes are real buttons positioned over an
 * SVG edge layer, so the whole thing is keyboard-navigable and screen-readable
 * while still behaving like an interface: focus a node and only what it feeds
 * stays lit.
 */

const POS: Record<string, [number, number]> = {
  executive: [50, 31],
  recognition: [18, 13],
  visibility: [47, 9],
  competitor: [80, 14],
  authority: [11, 33],
  trust: [25, 52],
  context: [52, 52],
  narrative: [86, 34],
  action: [73, 50],
};

const HUB = "recognition";

export function IntelligenceEngines({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).engines;
  const [focus, setFocus] = useState<string | null>(null);
  const [assembled, setAssembled] = useState(false);
  const [active2, setActive2] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const edges = useMemo(
    () =>
      base.items.flatMap((e) =>
        e.feeds.map((to) => {
          const a = POS[e.id];
          const b = POS[to];
          const len = a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) * 3.2 : 140;
          return { from: e.id, to, key: `${e.id}-${to}`, len, primary: e.id === HUB };
        }),
      ),
    [],
  );

  const related = useMemo(() => {
    if (!focus) return null;
    const set = new Set<string>([focus]);
    for (const e of edges) {
      if (e.from === focus) set.add(e.to);
      if (e.to === focus) set.add(e.from);
    }
    return set;
  }, [focus, edges]);

  const activeIndex = focus ? base.items.findIndex((i) => i.id === focus) : -1;
  const active = activeIndex >= 0 ? { ...base.items[activeIndex], ...c.items[activeIndex] } : null;

  // The network assembles once, the first time it enters view: edges draw,
  // nodes settle in, then — a beat later — the ambient signal starts
  // flowing on the hub's paths. Three states, not one, so "drawn" and
  // "alive" can be styled differently instead of arriving in the same frame.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAssembled(true);
      setActive2(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setAssembled(true);
        window.setTimeout(() => setActive2(true), 1000);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A light perspective tilt toward the cursor — the network as a physical
  // instrument panel, not a flat diagram. Capped small and skipped for
  // reduced motion / touch, same discipline as the hero's browser stack.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        canvas.style.transform = `rotateX(${py * -3.5}deg) rotateY(${px * 4.5}deg)`;
        raf = 0;
      });
    };
    const onLeave = () => {
      canvas.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="engines"
      className="section band band--color"
      data-section
    >
      {/* No band network here — this section already draws its own graph,
          and two overlapping node fields fight each other. */}
      <Band tone="color" edge="feather" className="band__plate--engines" />

      <div className="shell">
        <SectionHeader
          index={base.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <div
          ref={rootRef}
          className="engines"
          data-focused={focus ? "true" : "false"}
          data-assembled={assembled ? "true" : "false"}
          data-active={active2 ? "true" : "false"}
          onPointerLeave={() => setFocus(null)}
        >
          <div className="engines__atmosphere" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div ref={canvasRef} className="engines__canvas-tilt">
            <svg
              className="engines__edges"
              viewBox="0 0 100 62"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {edges.map((e, i) => {
                const a = POS[e.from];
                const b = POS[e.to];
                if (!a || !b) return null;
                const lit = related ? related.has(e.from) && related.has(e.to) : false;
                const style = {
                  "--len": e.len,
                  "--d": `${i * 60}ms`,
                } as React.CSSProperties;
                return (
                  <line
                    key={e.key}
                    x1={a[0]}
                    y1={a[1]}
                    x2={b[0]}
                    y2={b[1]}
                    className={`engines__edge ${lit ? "is-lit" : ""} ${e.primary ? "is-primary" : ""}`}
                    vectorEffect="non-scaling-stroke"
                    style={style}
                  />
                );
              })}
              {edges
                .filter((e) => e.primary)
                .map((e, i) => {
                  const a = POS[e.from];
                  const b = POS[e.to];
                  if (!a || !b) return null;
                  return (
                    <line
                      key={`signal-${e.key}`}
                      x1={a[0]}
                      y1={a[1]}
                      x2={b[0]}
                      y2={b[1]}
                      className="engines__signal"
                      vectorEffect="non-scaling-stroke"
                      style={{ "--d": `${i * 420}ms` } as React.CSSProperties}
                    />
                  );
                })}
            </svg>

            <ul className="engines__nodes">
              {base.items.map((e, i) => {
                const p = POS[e.id];
                const dim = related ? !related.has(e.id) : false;
                const isHub = e.id === HUB;
                return (
                  <li
                    key={e.id}
                    className="engines__node-wrap"
                    style={
                      {
                        "--x": `${p[0]}%`,
                        "--y": `${(p[1] / 62) * 100}%`,
                        "--d": `${180 + i * 70}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <button
                      type="button"
                      className={`engines__node ${dim ? "is-dim" : ""} ${
                        focus === e.id ? "is-focus" : ""
                      } ${isHub ? "is-hub" : ""}`}
                      onPointerEnter={() => setFocus(e.id)}
                      onFocus={() => setFocus(e.id)}
                      onClick={() => setFocus((f) => (f === e.id ? null : e.id))}
                      aria-pressed={focus === e.id}
                      aria-describedby="engines-readout"
                      data-cursor="live"
                      data-cursor-label={isHub ? c.sourceCursor : c.focusCursor}
                    >
                      <span className="engines__node-dot" aria-hidden="true" />
                      <span className="engines__node-name">{c.items[i].name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            id="engines-readout"
            className="engines__readout glass"
            aria-live="polite"
          >
            {active ? (
              <>
                <span className="t-eyebrow">{active.name}</span>
                <p className="engines__readout-q">{active.q}</p>
                <span className="t-label engines__readout-feeds">
                  {c.feedsPrefix} {active.feeds.length}{" "}
                  {active.feeds.length === 1 ? c.engineSingular : c.enginePlural}
                </span>
              </>
            ) : (
              <>
                <span className="t-label">{c.idle}</span>
                <p className="engines__readout-q engines__readout-q--idle">
                  {c.idleHint}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
