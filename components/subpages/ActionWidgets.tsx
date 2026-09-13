"use client";

import { useState } from "react";
import { CONFIDENCE, interventions, type Intervention } from "@/lib/subpages/demo";

const URGENCY_RANK = { Immediate: 0, "This quarter": 1, Monitor: 2 } as const;
const EFFORT_RANK = { low: 0, medium: 1, high: 2 } as const;

/** Ranked by urgency, then by effort, cheapest decisive move first. */
const queue = [...interventions].sort(
  (a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort],
);

/* Timeline spans Aug 1 → Dec 31, 2026 */
const START = Date.UTC(2026, 7, 1);
const END = Date.UTC(2026, 11, 31);
const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec"];

function pos(date: string) {
  const t = Date.parse(`${date} UTC`);
  return Math.max(0, Math.min(1, (t - START) / (END - START)));
}

function urgencyTone(u: Intervention["urgency"]) {
  return u === "Immediate" ? "down" : u === "This quarter" ? "warn" : "muted";
}

export function ActionCenter() {
  const [view, setView] = useState<"queue" | "roadmap">("queue");
  const [open, setOpen] = useState<string | null>(queue[0].id);

  return (
    <div className="ac">
      <div className="ac__bar">
        <div className="kit-seg" role="tablist" aria-label="Action Center view">
          <button type="button" role="tab" aria-selected={view === "queue"} aria-controls="ac-panel" onClick={() => setView("queue")}>
            Priority queue
          </button>
          <button type="button" role="tab" aria-selected={view === "roadmap"} aria-controls="ac-panel" onClick={() => setView("roadmap")}>
            30/60/90 roadmap
          </button>
        </div>
        <p className="ac__hint">
          {view === "queue" ? "Ranked by urgency, then by effort, cheapest decisive move first." : "Each bar ends at its deadline. Length is the horizon it was planned on."}
        </p>
      </div>

      <div id="ac-panel" role="tabpanel" className="kit-swap" key={view}>
        {view === "queue" ? (
          <ol className="ac-queue">
            {queue.map((iv, i) => {
              const expanded = open === iv.id;
              const conf = CONFIDENCE[iv.confidence];
              return (
                <li key={iv.id} className={`ac-item${expanded ? " is-open" : ""}`}>
                  <button type="button" className="ac-item__head" aria-expanded={expanded} aria-controls={`ac-${iv.id}`} onClick={() => setOpen(expanded ? null : iv.id)}>
                    <span className="ac-item__rank kit-num">{i + 1}</span>
                    <span className="ac-item__title">{iv.title}</span>
                    <span className="ac-item__tags">
                      <span className={`kit-pill kit-pill--${urgencyTone(iv.urgency)}`}>{iv.urgency}</span>
                      <span className="kit-pill kit-pill--muted">{iv.horizon}-day</span>
                      <span className={`ac-effort ac-effort--${iv.effort}`} aria-label={`${iv.effort} effort`}>
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                    <span className="ac-item__chev" aria-hidden="true" />
                  </button>
                  <div id={`ac-${iv.id}`} className="ac-item__body" hidden={!expanded}>
                    <p className="ac-item__why">{iv.why}</p>
                    <div className="ac-item__grid">
                      <div className="ac-item__impact">
                        <span className="kit-mono">Expected impact</span>
                        <b>{iv.impact}</b>
                      </div>
                      <div>
                        <span className="kit-mono">Success metric</span>
                        <b>{iv.metric}</b>
                      </div>
                      <div>
                        <span className="kit-mono">Owner · deadline</span>
                        <b>
                          {iv.owner} · {iv.deadline}
                        </b>
                      </div>
                      <div>
                        <span className="kit-mono">Confidence</span>
                        <b>
                          <span aria-hidden="true">{conf.mark}</span> {conf.label}
                        </b>
                      </div>
                    </div>
                    <p className="ac-item__measured">
                      <span className="kit-mono">Measured change</span> Not yet measured, verified after execution.
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="ac-road kit-scroll-x">
            <div className="ac-road__inner">
              <div className="ac-road__months" aria-hidden="true">
                {MONTHS.map((m) => (
                  <span key={m}>{m} 2026</span>
                ))}
              </div>
              <ol className="ac-road__rows">
                {[...interventions]
                  .sort((a, b) => pos(a.deadline) - pos(b.deadline))
                  .map((iv) => {
                    const end = pos(iv.deadline);
                    const start = Math.max(0, end - (iv.horizon / 153));
                    return (
                      <li key={iv.id} className="ac-road__row">
                        <span className="ac-road__label">
                          <b>{iv.owner}</b>
                          <small>{iv.impact}</small>
                        </span>
                        <span className="ac-road__track">
                          <span
                            className={`ac-road__bar ac-road__bar--${urgencyTone(iv.urgency)}`}
                            style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }}
                            title={iv.title}
                          >
                            <span>{iv.horizon}d</span>
                          </span>
                          <span className="ac-road__due" style={{ left: `${end * 100}%` }}>
                            {iv.deadline.replace(", 2026", "")}
                          </span>
                        </span>
                      </li>
                    );
                  })}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
