"use client";

import { useMemo, useState } from "react";
import { decisionGraph as base } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { getLocaleCopy } from "@/lib/i18n";

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

export function DecisionGraphSection({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).decisionGraph;
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const focus = hovered ?? selected;

  const related = useMemo(() => {
    if (!focus) return null;
    const set = new Set<string>([focus]);
    for (const [a, b] of base.edges) {
      if (a === focus) set.add(b);
      if (b === focus) set.add(a);
    }
    return set;
  }, [focus]);

  const activeIndex = focus ? base.nodes.findIndex((n) => n.id === focus) : -1;
  const active = activeIndex >= 0 ? { ...base.nodes[activeIndex], ...c.nodes[activeIndex] } : null;

  return (
    <section id="graph" className="section band band--tint" data-section>
      <Band tone="tint" edge="feather" />

      <div className="shell">
        <SectionHeader
          index={base.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <div className="dgraph glass" data-reveal>
          <div className="dgraph__bar">
            <span className="t-label">{c.barLabel}</span>
            <span className="dgraph__stat">
              {base.nodes.length} {c.nodesLabel} · {base.edges.length} {c.edgesLabel}
            </span>
            <span
              className={`dgraph__state ${focus ? "is-live" : ""}`}
              aria-live="polite"
            >
              {focus ? `${c.isolating} ${active?.name}` : c.allPaths}
            </span>
          </div>

          <div className="dgraph__body">
            <div
              className="dgraph__canvas"
              data-focused={focus ? "true" : "false"}
              onPointerLeave={() => setHovered(null)}
            >
              <svg
                className="dgraph__edges"
                viewBox="0 0 100 62"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {base.edges.map(([a, b]) => {
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
                {base.nodes.map((n, i) => {
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
                         onPointerEnter={() => setHovered(n.id)}
                         onFocus={() => setHovered(n.id)}
                         onClick={() =>
                           setSelected((current) =>
                             current === n.id ? null : n.id,
                           )
                         }
                        aria-pressed={focus === n.id}
                        aria-describedby="dgraph-panel"
                        data-cursor="live"
                        data-cursor-label={c.isolateCursor}
                      >
                        <span className="dgraph__node-dot" aria-hidden="true" />
                        <span className="dgraph__node-name">{c.nodes[i].name}</span>
                        <span className="dgraph__node-kind">{c.nodes[i].kind}</span>
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
                    {c.supportingEvidence}
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
                  <span className="t-label">{c.noNodeSelected}</span>
                  <p className="dgraph__panel-detail">
                    {c.noNodeHint}
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
