import type { CSSProperties } from "react";
import {
  ArrowsClockwise,
  ChartBar,
  Lightning,
  ListNumbers,
  MagnifyingGlass,
  Scales,
  Target,
  Timer,
  TreeStructure,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PlatformGlyph, type PlatformId } from "@/components/ui/PlatformGlyph";
import { nav } from "@/lib/content";
import { normalizeLocale } from "@/lib/i18n";
import { getWarRoomCopy, readings as r, type Trend } from "@/lib/warRoom";

const ENGINES: { id: PlatformId; name: string }[] = [
  { id: "perplexity", name: "Perplexity" },
  { id: "chatgpt", name: "ChatGPT" },
  { id: "gemini", name: "Gemini" },
  { id: "claude", name: "Claude" },
  { id: "copilot", name: "Copilot" },
  { id: "grok", name: "Grok" },
];
const SECTION_IDS = ["map", "levels", "action", "weekly", "loop"] as const;
const STEP_ICONS = [MagnifyingGlass, TreeStructure, ListNumbers, Lightning, ChartBar, ArrowsClockwise];
const LOOP_ICONS = [Target, TreeStructure, MagnifyingGlass, Scales, Lightning, ChartBar, ArrowsClockwise];

function linePath(values: readonly number[], w: number, h: number, max = 100) {
  const step = w / (values.length - 1);
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
}

function TrendMark({ trend, delta }: { trend: Trend; delta: string | null }) {
  if (!delta) return null;
  return (
    <span className={`wr-trend wr-trend--${trend}`}>
      {trend === "up" ? "↑" : "↓"} {delta}
    </span>
  );
}

function Ring({ value, tone, size = 52 }: { value: number; tone: string; size?: number }) {
  return (
    <span className={`wr-ring wr-tone--${tone}`} style={{ "--ring": `${size}px` } as CSSProperties}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" pathLength={100} className="wr-ring__track" />
        <circle
          cx="20"
          cy="20"
          r="16"
          pathLength={100}
          className="wr-ring__value"
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <b>{value}</b>
    </span>
  );
}

function radarPoints(values: readonly number[], cx: number, cy: number, radius: number) {
  return values
    .map((v, i) => {
      const a = ((-90 + i * 72) * Math.PI) / 180;
      const d = (v / 100) * radius;
      return `${(cx + Math.cos(a) * d).toFixed(1)},${(cy + Math.sin(a) * d).toFixed(1)}`;
    })
    .join(" ");
}

export function WarRoomPage({ locale = "en" }: { locale?: string }) {
  const loc = normalizeLocale(locale);
  const c = getWarRoomCopy(loc);
  const contactHref = nav.cta.href;

  return (
    <div className="subpage subpage--warroom">
      {/* 01, Hero */}
      <section className="subhero wr-hero" aria-labelledby="warroom-title">
        <Band tone="tint" edge="top-hard" />
        <div className="shell subhero__grid wr-hero__grid">
          <div className="subhero__copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href={`/${loc}`}>{c.breadcrumb.home}</a>
              <span aria-hidden="true">/</span>
              <span>{c.breadcrumb.group}</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{c.breadcrumb.page}</span>
            </nav>
            <span className="t-eyebrow subhero__eyebrow">{c.hero.eyebrow}</span>
            <h1 id="warroom-title" className="wr-hero__title">
              {c.hero.title}
            </h1>
            <p className="wr-hero__lines">
              {c.hero.lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
            <p className="t-lead subhero__body">{c.hero.body}</p>
            <ul className="wr-scopes" aria-label={c.hero.eyebrow}>
              {c.hero.scopes.map((scope) => (
                <li key={scope}>{scope}</li>
              ))}
            </ul>
            <div className="subhero__actions">
              <Button href={contactHref} variant="primary">
                {c.hero.primary}
              </Button>
              <Button href="#map" variant="ghost">
                {c.hero.secondary}
              </Button>
            </div>
          </div>

          <figure className="wr-panel" aria-label={c.panel.title}>
            <header className="wr-panel__head">
              <span>{c.panel.title}</span>
              <span className="wr-live">
                <i aria-hidden="true" />
                {c.panel.live}
              </span>
            </header>
            <div className="wr-panel__body">
              <dl className="wr-kpis">
                {r.kpis.map((kpi, i) => (
                  <div key={i} className="wr-kpi">
                    <dt>{c.panel.kpis[i]}</dt>
                    <dd className={`wr-tone--${kpi.tone}`}>{kpi.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="wr-chart">
                <div className="wr-chart__head">
                  <span>{c.panel.chartTitle}</span>
                  <span className="wr-legend">
                    <span className="wr-legend__item wr-tone--signal">{c.panel.legend[0]}</span>
                    <span className="wr-legend__item wr-tone--down">{c.panel.legend[1]}</span>
                  </span>
                </div>
                <svg viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="wr-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--color-signal)" stopOpacity="0.28" />
                      <stop offset="1" stopColor="var(--color-signal)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${linePath(r.strengthA, 320, 76, 60)} L320 80 L0 80 Z`} fill="url(#wr-area)" />
                  <path d={linePath(r.strengthB, 320, 76, 60)} className="wr-line wr-line--down wr-line--dash" />
                  <path d={linePath(r.strengthA, 320, 76, 60)} className="wr-line wr-line--signal" />
                </svg>
              </div>
              <ul className="wr-signals">
                {r.signals.map((s, i) => (
                  <li key={i}>
                    <span className={`wr-trend wr-trend--${s.trend}`}>
                      {s.delta} {s.trend === "up" ? "↑" : "↓"}
                    </span>
                    <span>{c.panel.signals[i]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="wr-sample">{c.sampleNote}</figcaption>
          </figure>
        </div>

        <div className="shell wr-layer">
          <span className="t-eyebrow wr-layer__eyebrow">{c.layer.eyebrow}</span>
          <div className="wr-layer__sources">
            <div className="wr-source">
              <span className="wr-source__glyph">
                <PlatformGlyph id="google" />
              </span>
              <span>
                <b>{c.layer.google.title}</b>
                <small>{c.layer.google.sub}</small>
              </span>
            </div>
            <span className="wr-layer__plus" aria-hidden="true">
              +
            </span>
            <div className="wr-source wr-source--ai">
              <span className="wr-source__badge" aria-hidden="true">
                AI
              </span>
              <span>
                <b>{c.layer.ai.title}</b>
                <small>{c.layer.ai.sub}</small>
              </span>
            </div>
          </div>
          <ul className="wr-engines">
            {ENGINES.map((p, i) => (
              <li key={p.id} data-reveal data-reveal-delay={String(i * 50)}>
                <span className="wr-engines__glyph">
                  <PlatformGlyph id={p.id} />
                </span>
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav className="subnav" aria-label={c.subnav.label}>
        <div className="shell subnav__inner">
          <span className="subnav__label">{c.subnav.label}</span>
          {SECTION_IDS.map((id, i) => (
            <a key={id} href={`#${id}`}>
              {c.subnav.links[i]}
            </a>
          ))}
        </div>
      </nav>

      {/* 02, What moves the map */}
      <section id="map" className="subsection wr-map" data-section>
        <div className="shell wr-map__grid">
          <div>
            <span className="t-eyebrow">{c.map.eyebrow}</span>
            <h2 className="t-h2 wr-h2">{c.map.title}</h2>
            <p className="t-body wr-intro">{c.map.body}</p>
            <ul className="wr-questions">
              {c.map.cards.map((card, i) => (
                <li
                  key={i}
                  className={`wr-question wr-question--${i}`}
                  data-reveal
                  data-reveal-delay={String(i * 50)}
                >
                  <span className="wr-tag">{card.tag}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <figure className="wr-card wr-influence" aria-label={c.map.panelTitle}>
            <header className="wr-card__head">
              <span>{c.map.panelTitle}</span>
              <span className="wr-pill">{c.map.panelBadge}</span>
            </header>
            <div className="wr-influence__stage">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <ellipse cx="50" cy="51" rx="36" ry="39" className="wr-influence__ring" />
                {r.mapNodes.map((n, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="51"
                    x2={n.x}
                    y2={n.y}
                    className={`wr-influence__edge wr-stroke--${n.tone}`}
                  />
                ))}
                <line x1="50" y1="12" x2="50" y2="90" className="wr-influence__edge wr-stroke--down" />
                <line x1="14" y1="32" x2="86" y2="70" className="wr-influence__edge wr-stroke--up" />
              </svg>
              <div className="wr-influence__core">
                <small>War Room</small>
                {c.map.core}
              </div>
              {r.mapNodes.map((n, i) => (
                <div
                  key={i}
                  className={`wr-influence__node wr-tone--${n.tone}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <span>{c.map.nodes[i]}</span>
                  <b>{n.score}</b>
                </div>
              ))}
            </div>
            <figcaption className="wr-sample">{c.sampleNote}</figcaption>
          </figure>
        </div>
      </section>

      {/* 03, Three levels */}
      <section id="levels" className="subsection subsection--stages wr-levels" data-section>
        <Band tone="paper" edge="feather" />
        <div className="shell wr-levels__inner">
          <div className="wr-levels__head">
            <span className="t-eyebrow">{c.levels.eyebrow}</span>
            <h2 className="t-h2 wr-h2">{c.levels.title}</h2>
            <p className="t-body">{c.levels.body}</p>
          </div>

          <ol className="wr-tabs" aria-hidden="true">
            {c.levels.tabs.map((tab) => (
              <li key={tab}>{tab}</li>
            ))}
          </ol>

          <div className="wr-levels__grid">
            {/* Candidate */}
            <article className="wr-card wr-level" data-reveal>
              <header className="wr-level__head">
                <span className="wr-pill">{c.levels.candidate.tag}</span>
                <span className="wr-level__index">
                  <small>{c.levels.tabs[0]}</small>
                  <b>{c.levels.candidate.name}</b>
                </span>
              </header>
              <h3>{c.levels.candidate.question}</h3>
              <p>{c.levels.candidate.body}</p>
              <ul className="wr-metrics">
                {r.candidate.map((m, i) => {
                  const state =
                    i === 2 ? c.levels.candidate.states.stable : i === 4 ? c.levels.candidate.states.medium : null;
                  const tone = i === 4 ? "down" : i === 5 ? "warn" : i === 3 ? "up" : "signal";
                  return (
                    <li key={i}>
                      <Ring value={m.value} tone={tone} size={46} />
                      <span>
                        <small>{c.levels.candidate.metrics[i]}</small>
                        {state ? (
                          <span className="wr-state">● {state}</span>
                        ) : (
                          <TrendMark trend={m.trend} delta={m.delta} />
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <footer className="wr-level__foot">
                <span className="t-eyebrow">{c.levels.candidate.footLabel}</span>
                <p>{c.levels.candidate.foot}</p>
              </footer>
            </article>

            {/* Party */}
            <article className="wr-card wr-level" data-reveal data-reveal-delay="80">
              <header className="wr-level__head">
                <span className="wr-pill">{c.levels.party.tag}</span>
                <span className="wr-level__index">
                  <small>{c.levels.tabs[1]}</small>
                  <b>{c.levels.party.name}</b>
                </span>
              </header>
              <h3>{c.levels.party.question}</h3>
              <p>{c.levels.party.body}</p>
              <table className="wr-members">
                <thead>
                  <tr>
                    {c.levels.party.columns.map((col) => (
                      <th key={col} scope="col">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.members.map((m, i) => {
                    const up = m.trend === "up";
                    return (
                      <tr key={i}>
                        <td>
                          <span className={`wr-trend wr-trend--${m.trend}`}>
                            {up ? "↑" : "↓"} {m.delta}
                          </span>
                        </td>
                        <td>{m.sentiment}</td>
                        <td>{m.trust}</td>
                        <td>
                          <span className="wr-member">
                            <b>
                              {c.levels.party.member} 0{i + 1}
                            </b>
                            <span className={`wr-bar wr-tone--${up ? "up" : "down"}`}>
                              <i style={{ "--w": m.influence / 100 } as CSSProperties} />
                            </span>
                            <small className={`wr-trend wr-trend--${m.trend}`}>
                              {up ? c.levels.party.strengthening : c.levels.party.weakening}
                            </small>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <footer className="wr-level__foot">
                <span className="t-eyebrow">{c.levels.party.footLabel}</span>
                <p>{c.levels.party.foot}</p>
              </footer>
            </article>

            {/* Arena */}
            <article className="wr-card wr-level" data-reveal data-reveal-delay="160">
              <header className="wr-level__head">
                <span className="wr-pill">{c.levels.arena.tag}</span>
                <span className="wr-level__index">
                  <small>{c.levels.tabs[2]}</small>
                  <b>{c.levels.arena.name}</b>
                </span>
              </header>
              <h3>{c.levels.arena.question}</h3>
              <p>{c.levels.arena.body}</p>
              <div className="wr-radar">
                <svg viewBox="0 0 240 220" aria-hidden="true">
                  {[1, 0.66, 0.33].map((k) => (
                    <polygon
                      key={k}
                      points={radarPoints([100, 100, 100, 100, 100], 120, 116, 80 * k)}
                      className="wr-radar__grid"
                    />
                  ))}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const a = ((-90 + i * 72) * Math.PI) / 180;
                    return (
                      <line
                        key={i}
                        x1="120"
                        y1="116"
                        x2={120 + Math.cos(a) * 80}
                        y2={116 + Math.sin(a) * 80}
                        className="wr-radar__grid"
                      />
                    );
                  })}
                  {r.arena.map((s) => (
                    <polygon
                      key={s.series}
                      points={radarPoints(s.values, 120, 116, 80)}
                      className={`wr-radar__series wr-series--${s.series}`}
                    />
                  ))}
                  {c.levels.arena.axes.map((axis, i) => {
                    const a = ((-90 + i * 72) * Math.PI) / 180;
                    return (
                      <text
                        key={axis}
                        x={120 + Math.cos(a) * 100}
                        y={116 + Math.sin(a) * 96 + 4}
                        textAnchor="middle"
                        className="wr-radar__label"
                      >
                        {axis}
                      </text>
                    );
                  })}
                </svg>
                <ul className="wr-radar__legend">
                  {r.arena.map((s) => (
                    <li key={s.series} className={`wr-series--${s.series}`}>
                      <i aria-hidden="true" />
                      {c.levels.arena.series[s.series]}
                      {s.series === "you" && <span className="wr-pill wr-pill--up">{c.levels.arena.leading}</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <footer className="wr-level__foot">
                <span className="t-eyebrow">{c.levels.arena.footLabel}</span>
                <p>{c.levels.arena.foot}</p>
              </footer>
            </article>
          </div>

          <div className="wr-banner" data-reveal>
            <p>{c.levels.banner}</p>
            <ol className="wr-chain">
              {c.levels.chain.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <p className="subpage__sample subpage__sample--center">{c.sampleNote}</p>
        </div>
      </section>

      {/* 04, Action plan */}
      <section id="action" className="subsection band band--color wr-action" data-section>
        <Band tone="color" network edge="hard" />
        <div className="shell wr-action__inner">
          <div className="wr-action__head">
            <div>
              <span className="t-eyebrow">{c.action.eyebrow}</span>
              <h2 className="t-h2 wr-h2 wr-h2--wide">{c.action.title}</h2>
              <p className="t-lead">{c.action.body}</p>
            </div>
            <span className="wr-window">
              <Timer size={20} weight="bold" aria-hidden="true" />
              {c.action.window}
            </span>
          </div>
          <ol className="wr-steps">
            {c.action.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <li key={i} className="wr-step" data-reveal data-reveal-delay={String(i * 60)}>
                  <span className="wr-step__head">
                    <Icon size={18} weight="bold" aria-hidden="true" />
                    {step.title}
                  </span>
                  <p>{step.body}</p>
                </li>
              );
            })}
          </ol>
          <p className="wr-action__foot">{c.action.foot}</p>
        </div>
      </section>

      {/* 05, Weekly scan */}
      <section id="weekly" className="subsection wr-weekly" data-section>
        <div className="shell wr-weekly__grid">
          <div>
            <span className="t-eyebrow">{c.weekly.eyebrow}</span>
            <h2 className="t-h2 wr-h2">{c.weekly.title}</h2>
            <span className="wr-badge">{c.weekly.badge}</span>
            <ul className="wr-checklist">
              {c.weekly.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <figure className="wr-card wr-dash" aria-label={c.weekly.badge} data-reveal>
            <ul className="wr-dash__rings">
              {r.weeklyRings.map((ring, i) => (
                <li key={i}>
                  <Ring value={ring.value} tone={ring.tone} size={58} />
                  <small>{c.weekly.rings[i]}</small>
                </li>
              ))}
            </ul>
            <div className="wr-dash__chart">
              <span className="wr-dash__title">{c.weekly.chartTitle}</span>
              <dl className="wr-dash__stats">
                {r.weeklyStats.map((v, i) => (
                  <div key={i}>
                    <dt>{c.weekly.stats[i]}</dt>
                    <dd className={v.startsWith("-") ? "wr-tone--down" : undefined}>{v}</dd>
                  </div>
                ))}
              </dl>
              <svg viewBox="0 0 480 150" preserveAspectRatio="none" aria-hidden="true">
                {[0, 1, 2, 3].map((k) => (
                  <line key={k} x1="0" x2="480" y1={10 + k * 45} y2={10 + k * 45} className="wr-radar__grid" />
                ))}
                {r.weeklySeries.map((s, i) => (
                  <path key={i} d={linePath(s.values, 480, 140)} transform="translate(0 6)" className={`wr-line wr-line--${s.tone}`} />
                ))}
              </svg>
              <ul className="wr-legend wr-legend--wrap">
                {r.weeklySeries.map((s, i) => (
                  <li key={i} className={`wr-legend__item wr-tone--${s.tone}`}>
                    {c.weekly.series[i]}
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="wr-sample">{c.sampleNote}</figcaption>
          </figure>
        </div>
      </section>

      {/* 06, The intelligence loop */}
      <section id="loop" className="subsection wr-loop" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell wr-loop__inner">
          <span className="t-eyebrow">{c.loop.eyebrow}</span>
          <h2 className="t-h3 wr-loop__title">{c.loop.title}</h2>
          <ol className="wr-loop__steps">
            {c.loop.steps.map((step, i) => {
              const Icon = LOOP_ICONS[i];
              const edge = i === 0 || i === c.loop.steps.length - 1;
              return (
                <li
                  key={i}
                  className={`wr-loop__step${edge ? " is-edge" : ""}`}
                  data-reveal
                  data-reveal-delay={String(i * 60)}
                >
                  <span className="wr-loop__icon">
                    <Icon size={22} weight={edge ? "bold" : "regular"} aria-hidden="true" />
                  </span>
                  <small lang="en">{step.code}</small>
                  <b>{step.name}</b>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="subpage-cta band band--color wr-cta" data-section>
        <Band tone="color" network edge="top-hard" />
        <div className="shell subpage-cta__inner wr-cta__inner">
          <h2 className="t-h2">{c.cta.title}</h2>
          <p className="t-lead">{c.cta.body}</p>
          <Button href={contactHref} variant="primary">
            {c.cta.button}
          </Button>
        </div>
      </section>

      <SiteFooter locale={loc} />
    </div>
  );
}
