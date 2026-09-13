"use client";

import { useState } from "react";
import { competitorStories, narratives, type Stance } from "@/lib/subpages/demo";

const STANCES: { key: Stance | "all"; label: string }[] = [
  { key: "all", label: "All narratives" },
  { key: "adverse", label: "Adverse" },
  { key: "favourable", label: "Favourable" },
  { key: "neutral", label: "Neutral" },
];

export function NarrativeLandscape() {
  const [f, setF] = useState<Stance | "all">("all");
  const list = narratives.filter((n) => f === "all" || n.stance === f);
  const count = (k: Stance | "all") => (k === "all" ? narratives.length : narratives.filter((n) => n.stance === k).length);

  return (
    <div className="nar-land">
      <div className="kit-seg nar-land__filters" role="group" aria-label="Filter narratives by stance">
        {STANCES.map((s) => (
          <button key={s.key} type="button" aria-pressed={f === s.key} onClick={() => setF(s.key)}>
            {s.label}
            <span className="kit-seg__count">{count(s.key)}</span>
          </button>
        ))}
      </div>
      <ol className="nar-land__list" key={f}>
        {list.map((n, i) => (
          <li key={n.quote} className={`nar-story nar-story--${n.stance} kit-swap`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="nar-story__reach">
              <b className="kit-num">{n.reach}%</b>
              <span>reach</span>
              <span className="nar-story__bar" aria-hidden="true">
                <i style={{ transform: `scaleY(${n.reach / 31})` }} />
              </span>
            </div>
            <div className="nar-story__body">
              <div className="nar-story__tags">
                <span className={`nar-stance nar-stance--${n.stance}`}>{n.stance}</span>
                <span className="kit-pill kit-pill--muted">{n.motion}</span>
              </div>
              <blockquote>“{n.quote}”</blockquote>
              <p>{n.detail}</p>
              <span className="nar-story__seen">Observed in {n.seen}</span>
            </div>
            <div className="nar-story__owner">
              <span className="kit-mono">Owned by</span>
              <b className={n.owner === "Unclaimed" ? "is-unclaimed" : undefined}>{n.owner}</b>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CompetitorStories() {
  const [i, setI] = useState(0);
  const c = competitorStories[i];
  return (
    <div className="nar-comp">
      <div className="nar-comp__tabs" role="tablist" aria-label="Competitors">
        {competitorStories.map((s, idx) => (
          <button
            key={s.name}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-controls="nar-comp-panel"
            onClick={() => setI(idx)}
            className="nar-comp__tab"
          >
            <b>{s.name}</b>
            <span className="kit-num">{s.share}% share</span>
          </button>
        ))}
      </div>
      <div id="nar-comp-panel" role="tabpanel" className="nar-comp__panel">
        <div className="kit-swap" key={c.name}>
          <blockquote className="nar-comp__story">“{c.story}”</blockquote>
          <div className="nar-comp__grid">
            <div className="nar-comp__cell">
              <span className="kit-mono">Strength</span>
              <p>{c.strength}</p>
            </div>
            <div className="nar-comp__cell nar-comp__cell--weak">
              <span className="kit-mono">Weakness</span>
              <p>{c.weakness}</p>
            </div>
            <div className="nar-comp__cell nar-comp__cell--opp">
              <span className="kit-mono">Opportunity</span>
              <p>{c.opportunity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
