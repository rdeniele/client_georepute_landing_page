"use client";

import { useMemo, useState } from "react";
import { CONFIDENCE, feed, measures, type FeedKind } from "@/lib/subpages/demo";

/**
 * The ten-measure board. Selecting a tile opens its readout in the detail
 * panel; on narrow screens the panel follows the selected tile.
 */
export function MeasureBoard({ locale }: { locale: string }) {
  const [sel, setSel] = useState("dhi");
  const m = measures.find((x) => x.key === sel) ?? measures[0];
  const conf = CONFIDENCE[m.confidence];
  const href = m.href ? m.href.replace(/^\/en(?=\/|$)/, `/${locale}`) : null;

  return (
    <div className="mc-board">
      <div className="mc-tiles">
        {measures.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`mc-tile mc-tile--${t.key} mc-tile--${t.trend}`}
            aria-pressed={sel === t.key}
            aria-controls="mc-detail"
            onClick={() => setSel(t.key)}
            data-spotlight
          >
            <span className="mc-tile__name">{t.name}</span>
            <span className="mc-tile__value">
              <b className="kit-num">{t.value}</b>
              {t.unit ? <small>{t.unit}</small> : null}
            </span>
            {t.key === "dhi" ? (
              <span className="mc-dial" aria-hidden="true">
                <svg viewBox="0 0 120 70">
                  <path d="M10 62 A50 50 0 0 1 110 62" className="mc-dial__track" />
                  <path d="M10 62 A50 50 0 0 1 110 62" className="mc-dial__fill" pathLength={100} style={{ strokeDasharray: "41 100" }} />
                </svg>
              </span>
            ) : null}
            <span className="mc-tile__foot">
              <span className={`mc-tile__trend mc-tile__trend--${t.trend}`} aria-hidden="true">
                {t.trend === "down" ? "▼" : t.trend === "up" ? "▲" : "■"}
              </span>
              <span className="mc-tile__conf" aria-hidden="true">
                {CONFIDENCE[t.confidence].mark}
              </span>
            </span>
          </button>
        ))}
      </div>

      <aside id="mc-detail" className="mc-detail" aria-live="polite">
        <div className="kit-swap" key={m.key}>
          <span className="kit-mono">Selected measure</span>
          <h3>{m.name}</h3>
          <p className="mc-detail__value">
            <b className="kit-num">{m.value}</b>
            {m.unit ? <small>{m.unit}</small> : null}
          </p>
          <p className="mc-detail__note">{m.note}</p>
          <dl>
            <div>
              <dt>Confidence</dt>
              <dd>
                <span aria-hidden="true">{conf.mark}</span> {conf.label}
              </dd>
            </div>
            <div>
              <dt>Trend</dt>
              <dd className={`mc-detail__trend--${m.trend}`}>
                {m.trend === "down" ? "Deteriorating" : m.trend === "up" ? "Improving" : "Stable"}
              </dd>
            </div>
          </dl>
          <p className="mc-detail__conf">{conf.detail}</p>
          {href ? (
            <a className="mc-detail__link" href={href}>
              Open the full readout <span aria-hidden="true">→</span>
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

const FILTERS: { key: FeedKind | "all"; label: string }[] = [
  { key: "all", label: "All events" },
  { key: "risk", label: "Risks" },
  { key: "gain", label: "Gains" },
  { key: "market", label: "Market" },
];

export function IntelligenceFeed() {
  const [f, setF] = useState<FeedKind | "all">("all");
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: feed.length };
    for (const e of feed) c[e.kind] = (c[e.kind] ?? 0) + 1;
    return c;
  }, []);
  const items = feed.filter((e) => f === "all" || e.kind === f);

  return (
    <div className="mc-feed">
      <div className="kit-seg mc-feed__filters" role="group" aria-label="Filter the intelligence feed">
        {FILTERS.map((x) => (
          <button key={x.key} type="button" aria-pressed={f === x.key} onClick={() => setF(x.key)}>
            {x.label}
            <span className="kit-seg__count">{counts[x.key]}</span>
          </button>
        ))}
      </div>
      <ol className="mc-feed__list" key={f}>
        {items.map((e, i) => (
          <li key={e.title} className={`mc-event mc-event--${e.kind} kit-swap`} style={{ animationDelay: `${i * 40}ms` }}>
            <span className="mc-event__rail" aria-hidden="true">
              <i />
            </span>
            <div className="mc-event__body">
              <div className="mc-event__meta">
                <span className="mc-event__type">{e.type}</span>
                {e.delta ? <span className="mc-event__delta">{e.delta}</span> : null}
                {e.severity ? <span className={`kit-pill kit-pill--${e.severity === "High" ? "down" : "warn"}`}>{e.severity}</span> : null}
                <time>{e.date}</time>
              </div>
              <h4>{e.title}</h4>
              <p>{e.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
