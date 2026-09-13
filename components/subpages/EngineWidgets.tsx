"use client";

import { useMemo, useState } from "react";
import { PlatformGlyph } from "@/components/ui/PlatformGlyph";
import {
  competitors,
  GAP_LABEL,
  keywords,
  recognition,
  STATUS_LABEL,
  type GapClass,
} from "@/lib/subpages/demo";

/* ==========================================================================
   AI Recognition Matrix, sortable, each row expands into what the engine
   believes and why it matters.
   ======================================================================= */

export function RecognitionMatrix() {
  const [sort, setSort] = useState<"score" | "presence">("score");
  const [open, setOpen] = useState<string | null>("chatgpt");
  const rows = useMemo(
    () => [...recognition].sort((a, b) => (sort === "score" ? b.score - a.score : b.presence - a.presence || b.score - a.score)),
    [sort],
  );

  return (
    <div className="rec-matrix">
      <div className="rec-matrix__bar">
        <div>
          <span className="kit-mono">Intelligence readout</span>
          <h3 className="rec-matrix__title">AI Recognition Matrix</h3>
        </div>
        <div className="kit-seg" role="group" aria-label="Sort engines">
          <button type="button" aria-pressed={sort === "score"} onClick={() => setSort("score")}>
            Entity understanding
          </button>
          <button type="button" aria-pressed={sort === "presence"} onClick={() => setSort("presence")}>
            Recommendation presence
          </button>
        </div>
      </div>

      <ul className="rec-matrix__rows">
        {rows.map((r) => {
          const expanded = open === r.engine;
          return (
            <li key={r.engine} className={`rec-row rec-row--${r.status}`} data-open={expanded || undefined}>
              <button
                type="button"
                className="rec-row__head"
                aria-expanded={expanded}
                aria-controls={`rec-${r.engine}`}
                onClick={() => setOpen(expanded ? null : r.engine)}
              >
                <span className="rec-row__engine">
                  <span className="rec-row__glyph">
                    <PlatformGlyph id={r.engine} />
                  </span>
                  {r.name}
                </span>
                <span className="rec-row__score">
                  <b className="kit-num">{r.score}</b>
                  <small>/100</small>
                </span>
                <span className="rec-row__meter" aria-hidden="true">
                  <i style={{ transform: `scaleX(${r.score / 100})` }} />
                </span>
                <span className={`rec-row__status rec-row__status--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                <span className="rec-row__presence">
                  {r.presence === 0 ? "Never recommends" : `${r.presence}% presence`}
                </span>
                <span className="rec-row__chev" aria-hidden="true" />
              </button>
              <div id={`rec-${r.engine}`} className="rec-row__body" hidden={!expanded}>
                <p className="rec-row__belief">
                  <span className="kit-mono">What it believes</span>“{r.believes}”
                </p>
                {r.note ? <p className="rec-row__note">{r.note}</p> : <p className="rec-row__note">Accurate. No divergence from the intended account.</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="rec-matrix__foot">
        Entity understanding and recommendation presence are separate measures. An engine can resolve the business correctly and still never put it forward,
        recognition is necessary for a recommendation, not sufficient.
      </p>
    </div>
  );
}

/* ==========================================================================
   Google vs AI, every tracked question plotted on both surfaces.
   x = Google position (log-scaled, "not in top 100" pinned right)
   y = AI recommendation (recommended band on top, absent band below)
   ======================================================================= */

const CLASS_ORDER: GapClass[] = ["compound", "strategic", "recoverable", "aligned"];

function xFor(position: number | null) {
  if (position === null) return 94;
  return 6 + (Math.log10(position) / 2) * 80;
}

export function GapQuadrant() {
  const [filter, setFilter] = useState<GapClass | "all">("all");
  const [hover, setHover] = useState<string | null>(keywords[0].q);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: keywords.length };
    for (const k of keywords) c[k.gap] = (c[k.gap] ?? 0) + 1;
    return c;
  }, []);
  const active = keywords.find((k) => k.q === hover) ?? keywords[0];
  const maxVol = 320;

  return (
    <div className="gap">
      <div className="gap__filters kit-seg" role="group" aria-label="Filter by gap classification">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
          All<span className="kit-seg__count">{counts.all}</span>
        </button>
        {CLASS_ORDER.map((g) => (
          <button key={g} type="button" aria-pressed={filter === g} onClick={() => setFilter(g)} className={`gap__f gap__f--${g}`}>
            {GAP_LABEL[g].label}
            <span className="kit-seg__count">{counts[g]}</span>
          </button>
        ))}
      </div>

      <div className="gap__stage">
        <div className="gap__plot" role="img" aria-label="Scatter plot of twenty commercial questions by Google position and AI recommendation">
          <span className="gap__band gap__band--ai">Recommended by AI</span>
          <span className="gap__band gap__band--none">Absent from AI answers</span>
          <span className="gap__top10" style={{ left: `${xFor(10)}%` }}>
            <em>Google top 10</em>
          </span>
          <div className="gap__axis">
            <span style={{ left: `${xFor(1)}%` }}>#1</span>
            <span style={{ left: `${xFor(10)}%` }}>#10</span>
            <span style={{ left: `${xFor(50)}%` }}>#50</span>
            <span style={{ left: `${xFor(null)}%` }}>100+</span>
          </div>
          {keywords.map((k, i) => {
            const dim = filter !== "all" && filter !== k.gap;
            const size = 14 + (k.volume / maxVol) * 30;
            const jitter = ((i * 37) % 40) - 20;
            const xJitter = k.position === null ? ((i * 13) % 4) * 3 - 4 : 0;
            return (
              <button
                key={k.q}
                type="button"
                className={`gap__dot gap__dot--${k.gap}`}
                data-dim={dim || undefined}
                data-active={hover === k.q || undefined}
                style={{
                  left: `${xFor(k.position) + xJitter}%`,
                  top: `calc(${k.ai ? 25 : 70}% + ${jitter}px)`,
                  width: size,
                  height: size,
                }}
                onPointerEnter={() => setHover(k.q)}
                onFocus={() => setHover(k.q)}
                onClick={() => setHover(k.q)}
                aria-label={`${k.q}: ${k.position ? `Google position ${k.position}` : "not in Google top 100"}, ${k.ai ? "recommended by AI" : "absent from AI"}, ${k.volume} searches a month, ${GAP_LABEL[k.gap].label}`}
                tabIndex={dim ? -1 : 0}
              />
            );
          })}
        </div>

        <aside className={`gap__card gap__card--${active.gap}`} aria-live="polite">
          <span className="kit-mono">Commercial question</span>
          <strong className="gap__q">“{active.q}”</strong>
          <dl className="gap__facts">
            <div>
              <dt>Volume</dt>
              <dd>{active.volume}/mo</dd>
            </div>
            <div>
              <dt>Google</dt>
              <dd>{active.position ? `#${active.position}` : "Not in top 100"}</dd>
            </div>
            <div>
              <dt>AI</dt>
              <dd>{active.ai ? "Recommended" : "Absent"}</dd>
            </div>
          </dl>
          <span className={`gap__class gap__class--${active.gap}`}>{GAP_LABEL[active.gap].label}</span>
          <p>{GAP_LABEL[active.gap].detail}</p>
        </aside>
      </div>

      <ol className="gap__list">
        {keywords
          .filter((k) => filter === "all" || filter === k.gap)
          .map((k) => (
            <li key={k.q} className={`gap__item gap__item--${k.gap}`}>
              <span className="gap__item-q">{k.q}</span>
              <span className="gap__item-meta">
                {k.volume}/mo · {k.position ? `#${k.position}` : "100+"} · {k.ai ? "AI ✓" : "AI ✗"}
              </span>
            </li>
          ))}
      </ol>
    </div>
  );
}

/* ==========================================================================
   Competitor Recommendation Map, a share strip + leaderboard; choosing a
   brand opens why engines choose it.
   ======================================================================= */

export function RecommendationMap() {
  const [pick, setPick] = useState(0);
  const unattributed = Math.round((100 - competitors.reduce((s, c) => s + c.share, 0)) * 10) / 10;
  const chosen = competitors[pick];

  return (
    <div className="recmap">
      <div className="recmap__strip" role="img" aria-label="Share of AI recommendations across 24 decision questions">
        {competitors.map((c, i) => (
          <button
            key={c.name}
            type="button"
            className={`recmap__seg recmap__seg--${i}${c.you ? " is-you" : ""}`}
            style={{ flexGrow: c.share }}
            aria-pressed={pick === i}
            onClick={() => setPick(i)}
            aria-label={`${c.name} ${c.share}%`}
          >
            <span>{c.share >= 7 ? `${c.share}%` : ""}</span>
          </button>
        ))}
        <span className="recmap__seg recmap__seg--rest" style={{ flexGrow: unattributed }}>
          <span>Unattributed {unattributed}%</span>
        </span>
      </div>

      <div className="recmap__grid">
        <ol className="recmap__board">
          {competitors.map((c, i) => (
            <li key={c.name}>
              <button
                type="button"
                className={`recmap__row${c.you ? " is-you" : ""}`}
                aria-pressed={pick === i}
                onClick={() => setPick(i)}
              >
                <span className="recmap__rank">{c.you ? "You" : String(i + 1).padStart(2, "0")}</span>
                <span className="recmap__name">{c.name}</span>
                <span className="recmap__bar" aria-hidden="true">
                  <i style={{ transform: `scaleX(${c.share / 31})` }} />
                </span>
                <b className="recmap__share kit-num">{c.share}%</b>
              </button>
            </li>
          ))}
        </ol>

        <article className="recmap__why kit-swap" key={chosen.name}>
          <span className="kit-mono">{chosen.you ? "Your position" : "Why they win"}</span>
          <h3>{chosen.name}</h3>
          <p>{chosen.why}</p>
          <div className="recmap__sources">
            <div>
              <span className="kit-mono">Independent sources</span>
              <div className="recmap__dots" aria-label={`${chosen.sources} independent sources`}>
                {Array.from({ length: 21 }, (_, i) => (
                  <i key={i} data-on={i < chosen.sources || undefined} />
                ))}
              </div>
            </div>
            <div className="recmap__stage">
              <span className="kit-mono">Strongest stage</span>
              <b>{chosen.stage}</b>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
