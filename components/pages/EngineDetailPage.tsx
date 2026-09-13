import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { PlatformGlyph } from "@/components/ui/PlatformGlyph";
import {
  ConfidenceMark,
  Crumbs,
  CtaBand,
  DemoNote,
  DEMO_HREF,
  lhref,
  PageHero,
  Pill,
  SectionIntro,
  TrendMark,
} from "@/components/subpages/kit";
import { CountUp, SubNav, SubpageFx } from "@/components/subpages/fx";
import { GapQuadrant, RecognitionMatrix, RecommendationMap } from "@/components/subpages/EngineWidgets";
import { competitors, interventions, keywords, recognition, type Intervention } from "@/lib/subpages/demo";
import { ENGINE_ORDER, engineReadouts, type EngineReadout } from "@/lib/subpages/engines";

/* --------------------------------------------------------------------------
   Hero instruments, one per engine, each answering its question at a glance
   ----------------------------------------------------------------------- */

function RecognitionRadial() {
  const size = 400;
  const c = size / 2;
  const inner = 58;
  const outer = 168;
  return (
    <figure className="eng-radial" aria-label="Entity understanding score by AI engine, average 38 of 100">
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <circle key={k} cx={c} cy={c} r={inner + (outer - inner) * k} className="eng-radial__ring" />
        ))}
        {recognition.map((r, i) => {
          const a = (-90 + i * 60) * (Math.PI / 180);
          const len = inner + (outer - inner) * (r.score / 100);
          const pt = (d: number) => [c + Math.cos(a) * d, c + Math.sin(a) * d];
          const [x1, y1] = pt(inner);
          const [x2, y2] = pt(len);
          const [tx, ty] = pt(outer);
          return (
            <g key={r.engine}>
              <line x1={x1} y1={y1} x2={tx} y2={ty} className="eng-radial__track" />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={`eng-radial__spoke eng-radial__spoke--${r.status}`}
                style={{ "--d": `${i * 90}ms` } as CSSProperties}
              />
            </g>
          );
        })}
      </svg>
      <div className="eng-radial__core">
        <b className="kit-num">38</b>
        <span>avg / 100</span>
      </div>
      {recognition.map((r, i) => {
        const a = (-90 + i * 60) * (Math.PI / 180);
        return (
          <span
            key={r.engine}
            className={`eng-radial__label eng-radial__label--${r.status}`}
            style={{ left: `${50 + Math.cos(a) * 47}%`, top: `${50 + Math.sin(a) * 47}%` }}
          >
            <span className="eng-radial__glyph">
              <PlatformGlyph id={r.engine} />
            </span>
            {r.name} <b>{r.score}</b>
          </span>
        );
      })}
    </figure>
  );
}

function GapCounters() {
  const tally = (g: string) => keywords.filter((k) => k.gap === g).length;
  const items = [
    { n: tally("compound"), label: "Compound blind spots", tone: "down" },
    { n: tally("strategic"), label: "Strategic blind spots", tone: "warn" },
    { n: tally("recoverable"), label: "Recoverable search", tone: "live" },
    { n: tally("aligned"), label: "Aligned", tone: "up" },
  ];
  return (
    <div className="eng-counters">
      <div className="eng-counters__head">
        <span className="kit-mono">Gap Matrix · 20 commercial questions</span>
      </div>
      <div className="eng-counters__split" aria-hidden="true">
        {items.map((it) => (
          <i key={it.label} className={`eng-counters__seg eng-counters__seg--${it.tone}`} style={{ flexGrow: it.n }} />
        ))}
      </div>
      <dl className="eng-counters__grid">
        {items.map((it) => (
          <div key={it.label} className={`eng-counters__item eng-counters__item--${it.tone}`}>
            <dt>{it.label}</dt>
            <dd>
              <CountUp to={it.n} className="kit-num" />
              <small>of 20</small>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ShareHero() {
  const [lead, , , , you] = competitors;
  return (
    <div className="eng-share">
      <div className="eng-share__duel">
        <div className="eng-share__side">
          <span className="kit-mono">Receives the decision</span>
          <b className="kit-num eng-share__big">
            <CountUp to={lead.share} suffix="%" />
          </b>
          <span className="eng-share__name">{lead.name}</span>
        </div>
        <span className="eng-share__vs" aria-hidden="true">vs</span>
        <div className="eng-share__side is-you">
          <span className="kit-mono">Receives the lead</span>
          <b className="kit-num eng-share__big">
            <CountUp to={you.share} decimals={1} suffix="%" />
          </b>
          <span className="eng-share__name">{you.name}</span>
        </div>
      </div>
      <div className="eng-share__sources">
        <span className="kit-mono">Independent sources engines can cite</span>
        <div className="eng-share__row">
          <span>{lead.name.split(" ")[0]}</span>
          <span className="eng-share__pips">
            {Array.from({ length: lead.sources }, (_, i) => (
              <i key={i} style={{ "--d": `${i * 30}ms` } as CSSProperties} />
            ))}
          </span>
          <b>{lead.sources}</b>
        </div>
        <div className="eng-share__row is-you">
          <span>Ironvale</span>
          <span className="eng-share__pips">
            {Array.from({ length: you.sources }, (_, i) => (
              <i key={i} style={{ "--d": `${i * 30}ms` } as CSSProperties} />
            ))}
          </span>
          <b>{you.sources}</b>
        </div>
      </div>
    </div>
  );
}

function ImpactStack() {
  return (
    <ol className="eng-impact">
      {interventions.slice(0, 3).map((iv, i) => {
        const [label, move] = splitImpact(iv.impact);
        return (
          <li key={iv.id} className="eng-impact__item" style={{ "--i": i } as CSSProperties}>
            <span className="eng-impact__n">{i + 1}</span>
            <div>
              <span className="kit-mono">{iv.horizon}-day · {iv.owner}</span>
              <strong>{label}</strong>
              <span className="eng-impact__move">{move}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function splitImpact(impact: string): [string, string] {
  const m = impact.match(/^(.*?)\s([\d.%]+\s→\s.*)$/);
  return m ? [m[1], m[2]] : [impact, ""];
}

/* --------------------------------------------------------------------------
   Centrepiece for Action Intelligence, the 30/60/90 roadmap
   ----------------------------------------------------------------------- */

function Roadmap({ locale }: { locale: string }) {
  const lanes: { days: Intervention["horizon"]; label: string }[] = [
    { days: 30, label: "Lands this month" },
    { days: 60, label: "Lands this quarter" },
    { days: 90, label: "Lands within 90 days" },
  ];
  return (
    <div className="eng-roadmap">
      {lanes.map((lane, li) => (
        <section key={lane.days} className="eng-lane" data-reveal data-reveal-delay={String(li * 90)}>
          <header className="eng-lane__head">
            <b className="kit-num">{lane.days}</b>
            <span>
              days<small>{lane.label}</small>
            </span>
          </header>
          <ul>
            {interventions
              .filter((iv) => iv.horizon === lane.days)
              .map((iv) => (
                <li key={iv.id} className="kit-card eng-lane__card" data-spotlight>
                  <div className="eng-lane__top">
                    <Pill tone={iv.urgency === "Immediate" ? "down" : iv.urgency === "Monitor" ? "muted" : "warn"}>{iv.urgency}</Pill>
                    <ConfidenceMark level={iv.confidence} />
                  </div>
                  <h4>{iv.title}</h4>
                  <p className="eng-lane__impact">{iv.impact}</p>
                  <dl>
                    <div>
                      <dt>Owner</dt>
                      <dd>{iv.owner}</dd>
                    </div>
                    <div>
                      <dt>Deadline</dt>
                      <dd>{iv.deadline}</dd>
                    </div>
                    <div>
                      <dt>Effort</dt>
                      <dd>{iv.effort}</dd>
                    </div>
                  </dl>
                </li>
              ))}
          </ul>
        </section>
      ))}
      <div className="eng-roadmap__link">
        <Button href={lhref("/en/app/actions", locale)} variant="ghost">
          Open the Strategic Action Center
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   The shared case-file readout
   ----------------------------------------------------------------------- */

function Readout({ e }: { e: EngineReadout }) {
  return (
    <div className="eng-case">
      <article className="eng-case__meaning kit-card" data-reveal>
        <span className="kit-mono">01 · Business meaning</span>
        <p>{e.meaning}</p>
        <div className="eng-case__tags">
          <Pill tone={e.urgency === "Immediate" ? "down" : "warn"}>{e.urgency}</Pill>
          <ConfidenceMark level={e.confidence} />
          <TrendMark trend={e.trend} />
        </div>
      </article>

      <article className="eng-case__competitor kit-card" data-reveal data-reveal-delay="60">
        <span className="kit-mono">02 · Competitor context</span>
        <p>{e.competitor}</p>
        <span className="eng-case__exposure">
          <span className="kit-mono">Commercial exposure</span>
          Directional estimate, not confirmed lost revenue.
        </span>
      </article>

      <article className="eng-case__evidence kit-card" data-reveal data-reveal-delay="120">
        <span className="kit-mono">03 · Evidence ({e.evidence.length})</span>
        <ol>
          {e.evidence.map((ev) => (
            <li key={ev.observed}>
              <div className="eng-case__ev-top">
                <b>{ev.observed}</b>
                <time>{ev.date}</time>
              </div>
              <p>{ev.finding}</p>
              <span className="kit-pill kit-pill--muted">{ev.source}</span>
            </li>
          ))}
        </ol>
      </article>

      <article className="eng-case__signals kit-card" data-reveal data-reveal-delay="60">
        <span className="kit-mono">04 · Connected signals</span>
        <ul>
          {e.signals.map((s) => (
            <li key={s.name}>
              <span>{s.name}</span>
              <b className={`eng-case__sig eng-case__sig--${s.trend}`}>
                <span aria-hidden="true">{s.trend === "down" ? "↓" : s.trend === "up" ? "↑" : "→"}</span> {s.value}
              </b>
            </li>
          ))}
        </ul>
      </article>

      <article className="eng-case__rx" data-reveal data-reveal-delay="120">
        <span className="kit-mono">05 · Prescription</span>
        <p>{e.prescription}</p>
        <dl>
          <div>
            <dt>Expected movement</dt>
            <dd>
              <b className="kit-num">→ {e.movement.value}</b>
              <small>{e.movement.label}</small>
            </dd>
          </div>
          <div>
            <dt>Owner and deadline</dt>
            <dd>
              <b>{e.owner}</b>
              <small>by {e.deadline}</small>
            </dd>
          </div>
        </dl>
      </article>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Page
   ----------------------------------------------------------------------- */

const HERO_VARIANT: Record<EngineReadout["slug"], string> = {
  "ai-recognition": "eng-hero--recognition",
  "google-vs-ai": "eng-hero--gap",
  "competitor-decision": "eng-hero--share",
  action: "eng-hero--action",
};

export function EngineDetailPage({ slug, locale }: { slug: EngineReadout["slug"]; locale: string }) {
  const e = engineReadouts[slug];
  const idx = ENGINE_ORDER.indexOf(slug);

  const aside =
    slug === "ai-recognition" ? <RecognitionRadial /> :
    slug === "google-vs-ai" ? <GapCounters /> :
    slug === "competitor-decision" ? <ShareHero /> :
    <ImpactStack />;

  const centre =
    slug === "ai-recognition" ? <RecognitionMatrix /> :
    slug === "google-vs-ai" ? <GapQuadrant /> :
    slug === "competitor-decision" ? <RecommendationMap /> :
    <Roadmap locale={locale} />;

  const centreTitle =
    slug === "ai-recognition" ? "What each engine believes the business is." :
    slug === "google-vs-ai" ? "Twenty commercial questions, two surfaces." :
    slug === "competitor-decision" ? "Who receives the recommendation instead." :
    "Six interventions, sequenced by what they depend on.";

  return (
    <div className={`kit-page eng-page eng-page--${slug}`}>
      <SubpageFx />
      <PageHero
        id="engine"
        className={HERO_VARIANT[slug]}
        crumbs={<Crumbs locale={locale} trail={[{ label: "Intelligence engines", href: "/en/engines" }, { label: e.short }]} />}
        eyebrow={`Engine ${String(idx + 1).padStart(2, "0")} of 12 · ${e.name}`}
        title={e.question}
        lead={e.lead}
        actions={
          <>
            <Button href={lhref("/en/app/mission-control", locale)} variant="primary">
              Open Mission Control
            </Button>
            <Button href="#readout" variant="ghost">
              Read the readout
            </Button>
          </>
        }
        aside={aside}
      />

      <SubNav
        label={e.short}
        links={[
          { id: "readout", label: "Intelligence readout" },
          { id: "conclusion", label: "What it concluded" },
          { id: "screens", label: "In the platform" },
        ]}
      />

      <section id="readout" className="kit-section eng-centre" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="Intelligence readout"
            title={centreTitle}
            align="split"
            aside={
              <ul className="eng-modules" aria-label="Modules in this engine">
                {e.modules.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            }
          />
          <div className="eng-centre__panel kit-card" data-reveal>
            {centre}
          </div>
          <DemoNote className="eng-centre__demo" />
        </div>
      </section>

      <section id="conclusion" className="kit-section eng-conclusion" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="02"
            label="What this engine concluded"
            title={<>Signal, evidence, consequence, <em className="t-editorial">action.</em></>}
            body="Every conclusion carries its evidence, its confidence and the intervention it implies, so the readout can be argued with, not just read."
          />
          <Readout e={e} />
        </div>
      </section>

      <section id="screens" className="kit-section kit-section--tight eng-screens" data-section>
        <div className="shell eng-screens__grid">
          <div>
            <span className="t-label">03 · In the platform</span>
            <h2 className="t-h3 eng-screens__title" data-reveal>
              Screens this engine provides
            </h2>
          </div>
          <ul className="eng-screens__list">
            {e.screens.map((s, i) => (
              <li key={s} className="kit-card" data-reveal data-reveal-delay={String(i * 60)} data-spotlight>
                <span className="eng-screens__n">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <nav className="shell eng-pager" aria-label="Engine navigation">
          <a className="kit-card eng-pager__link" href={lhref("/en/engines", locale)} data-spotlight>
            <span className="kit-mono">← All engines</span>
            <b>Twelve engines. One operating system.</b>
          </a>
          <a className="kit-card eng-pager__link eng-pager__link--next" href={lhref(e.next.href, locale)} data-spotlight>
            <span className="kit-mono">Next →</span>
            <b>{e.next.label}</b>
          </a>
        </nav>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="Run it on your business"
        title="See what this engine concludes about you."
        body="The demonstration reconstructs one seeded organisation. A live scan runs the same engine against your own business, market and competitors."
        primary={{ label: "Start Analysis", href: DEMO_HREF }}
        secondary={{ label: "Reconstruct a decision", href: "/en/app/reconstruct" }}
      />
    </div>
  );
}
