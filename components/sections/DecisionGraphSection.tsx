"use client";

import { useMemo, useState } from "react";
import { decisionGraph as c } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";

/**
 * Section 08 — The decision graph.
 *
 * The same illuminate-on-focus grammar as section 06, taken further: focusing
 * a node dims every unrelated path and resolves a panel of the evidence that
 * node is actually built from. It is meant to read as a working instrument,
 * which is why it carries a status bar and node counts rather than decoration.
 */

const POS: Record<string, [number, number]> = {
  input: [8, 30],
  interpretation: [30, 11],
  market: [55, 5],
  channel: [36, 50],
  outcome: [73, 26],
  action: [92, 49],
};

export function DecisionGraphSection() {
  const [focus, setFocus] = useState<string | null>(null);

  const related = useMemo(() => {
    if (!focus) return null;
    const set = new Set<string>([focus]);
    for (const [a, b] of c.edges) {
      if (a === focus) set.add(b);
      if (b === focus) set.add(a);
    }
    return set;
  }, [focus]);

  const active = focus ? c.nodes.find((n) => n.id === focus) ?? null : null;

  return (
    <section id="graph" className="section band band--tint" data-section>
      <Band tone="tint" edge="feather" />

      <div className="shell">
        <SectionHeader
          index={c.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <div className="dgraph glass" data-reveal>
          <div className="dgraph__bar">
            <span className="t-label">Decision graph</span>
            <span className="dgraph__stat">
              {c.nodes.length} nodes · {c.edges.length} edges
            </span>
            <span
              className={`dgraph__state ${focus ? "is-live" : ""}`}
              aria-live="polite"
            >
              {focus ? `Isolating ${active?.name}` : "All paths"}
            </span>
          </div>

          <div className="dgraph__body">
            <div
              className="dgraph__canvas"
              data-focused={focus ? "true" : "false"}
              onPointerLeave={() => setFocus(null)}
            >
              <svg
                className="dgraph__edges"
                viewBox="0 0 100 62"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {c.edges.map(([a, b]) => {
                  const pa = POS[a];
                  const pb = POS[b];
                  const lit = related
                    ? related.has(a) && related.has(b)
                    : false;
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={pa[0]}
                      y1={pa[1]}
                      x2={pb[0]}
                      y2={pb[1]}
                      className={`dgraph__edge ${lit ? "is-lit" : ""}`}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>

              <ul className="dgraph__nodes">
                {c.nodes.map((n) => {
                  const p = POS[n.id];
                  const dim = related ? !related.has(n.id) : false;
                  return (
                    <li
                      key={n.id}
                      className="dgraph__node-wrap"
                      style={
                        {
                          "--x": `${p[0]}%`,
                          "--y": `${(p[1] / 62) * 100}%`,
                        } as React.CSSProperties
                      }
                    >
                      <button
                        type="button"
                        className={`dgraph__node ${dim ? "is-dim" : ""} ${
                          focus === n.id ? "is-focus" : ""
                        }`}
                        onPointerEnter={() => setFocus(n.id)}
                        onFocus={() => setFocus(n.id)}
                        onClick={() =>
                          setFocus((f) => (f === n.id ? null : n.id))
                        }
                        aria-pressed={focus === n.id}
                        aria-describedby="dgraph-panel"
                        data-cursor="live"
                        data-cursor-label="Isolate"
                      >
                        <span className="dgraph__node-dot" aria-hidden="true" />
                        <span className="dgraph__node-name">{n.name}</span>
                        <span className="dgraph__node-kind">{n.kind}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div id="dgraph-panel" className="dgraph__panel" aria-live="polite">
              {active ? (
                <>
                  <span className="t-eyebrow">{active.kind}</span>
                  <h3 className="t-h4 dgraph__panel-title">{active.name}</h3>
                  <p className="dgraph__panel-detail">{active.detail}</p>
                  <span className="t-label dgraph__panel-legend">
                    Supporting evidence
                  </span>
                  <ul className="dgraph__evidence">
                    {active.evidence.map((e) => (
                      <li key={e} className="dgraph__evidence-item">
                        <span className="dgraph__evidence-tick" aria-hidden="true" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="dgraph__panel-idle">
                  <span className="t-label">No node selected</span>
                  <p className="dgraph__panel-detail">
                    Focus any node to isolate what connects to it and open its
                    evidence.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
