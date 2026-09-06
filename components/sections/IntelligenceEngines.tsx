"use client";

import { useMemo, useState } from "react";
import { engines as c } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";

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

export function IntelligenceEngines() {
  const [focus, setFocus] = useState<string | null>(null);

  const edges = useMemo(
    () =>
      c.items.flatMap((e) =>
        e.feeds.map((to) => ({ from: e.id, to, key: `${e.id}-${to}` })),
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

  const active = focus ? c.items.find((i) => i.id === focus) ?? null : null;

  return (
    <section id="engines" className="section" data-section>
      <div className="shell">
        <SectionHeader
          index={c.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <div
          className="engines"
          data-focused={focus ? "true" : "false"}
          onPointerLeave={() => setFocus(null)}
          data-reveal
        >
          <svg
            className="engines__edges"
            viewBox="0 0 100 62"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {edges.map((e) => {
              const a = POS[e.from];
              const b = POS[e.to];
              if (!a || !b) return null;
              const lit = related ? related.has(e.from) && related.has(e.to) : false;
              return (
                <line
                  key={e.key}
                  x1={a[0]}
                  y1={a[1]}
                  x2={b[0]}
                  y2={b[1]}
                  className={`engines__edge ${lit ? "is-lit" : ""}`}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          <ul className="engines__nodes">
            {c.items.map((e) => {
              const p = POS[e.id];
              const dim = related ? !related.has(e.id) : false;
              return (
                <li
                  key={e.id}
                  className="engines__node-wrap"
                  style={
                    {
                      "--x": `${p[0]}%`,
                      "--y": `${(p[1] / 62) * 100}%`,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className={`engines__node ${dim ? "is-dim" : ""} ${
                      focus === e.id ? "is-focus" : ""
                    }`}
                    onPointerEnter={() => setFocus(e.id)}
                    onFocus={() => setFocus(e.id)}
                    onClick={() => setFocus((f) => (f === e.id ? null : e.id))}
                    aria-pressed={focus === e.id}
                    aria-describedby="engines-readout"
                  >
                    <span className="engines__node-dot" aria-hidden="true" />
                    <span className="engines__node-name">{e.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

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
                  Feeds {active.feeds.length}{" "}
                  {active.feeds.length === 1 ? "engine" : "engines"}
                </span>
              </>
            ) : (
              <>
                <span className="t-label">Idle</span>
                <p className="engines__readout-q engines__readout-q--idle">
                  Focus an engine to isolate what it feeds.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
