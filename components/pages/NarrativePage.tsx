import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { PlatformGlyph } from "@/components/ui/PlatformGlyph";
import { ConfidenceMark, Crumbs, CtaBand, DemoNote, lhref, PageHero, Pill, SectionIntro } from "@/components/subpages/kit";
import { SubNav, SubpageFx } from "@/components/subpages/fx";
import { CompetitorStories, NarrativeLandscape } from "@/components/subpages/NarrativeWidgets";
import { interventions, narratives, recognition, unownedStories } from "@/lib/subpages/demo";

function HealthDonut() {
  const parts = [
    { key: "favourable", pct: 20, label: "works for us" },
    { key: "adverse", pct: 74, label: "works against us" },
    { key: "neutral", pct: 6, label: "unowned, undefended" },
  ];
  let offset = 0;
  return (
    <figure className="nar-health" aria-label="Narrative health 30 of 100: 20% favourable, 74% adverse, 6% neutral">
      <div className="nar-health__ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="48" className="nar-health__track" />
          {parts.map((p) => {
            const el = (
              <circle
                key={p.key}
                cx="60"
                cy="60"
                r="48"
                pathLength={100}
                className={`nar-health__arc nar-health__arc--${p.key}`}
                style={{ strokeDasharray: `${p.pct - 0.8} ${100 - p.pct + 0.8}`, strokeDashoffset: -offset }}
              />
            );
            offset += p.pct;
            return el;
          })}
        </svg>
        <div className="nar-health__core">
          <b className="kit-num">30</b>
          <span>/100 health</span>
        </div>
      </div>
      <ul className="nar-health__legend">
        {parts.map((p) => (
          <li key={p.key} className={`nar-health__item nar-health__item--${p.key}`}>
            <b className="kit-num">{p.pct}%</b>
            <span>{p.label}</span>
          </li>
        ))}
      </ul>
      <figcaption className="nar-health__state">
        <Pill tone="down">Deteriorating</Pill>
        <Pill tone="warn">Unsettled</Pill>
        <Pill tone="down">Risk · High</Pill>
      </figcaption>
    </figure>
  );
}

export function NarrativePage({ locale }: { locale: string }) {
  const own = [
    { key: "business", label: "This business", pct: 4 },
    { key: "competitors", label: "Competitors", pct: narratives.filter((n) => ["Cindermark Industrial", "Hollowpine Supply Co"].includes(n.owner)).reduce((s, n) => s + n.reach, 0) },
    { key: "shared", label: "Shared", pct: narratives.filter((n) => n.owner === "Shared").reduce((s, n) => s + n.reach, 0) },
    { key: "unclaimed", label: "Unclaimed", pct: narratives.filter((n) => n.owner === "Unclaimed").reduce((s, n) => s + n.reach, 0) },
  ];
  const plan = ["narrative", "entity"].map((id) => interventions.find((i) => i.id === id)!);
  const influenceRow = { High: 0, Medium: 1, Low: 2 } as const;
  const competitionCol = { None: 0, Low: 1, Medium: 2, Contested: 3 } as const;

  return (
    <div className="kit-page nar-page">
      <SubpageFx />
      <PageHero
        id="nar"
        className="nar-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Platform" }, { label: "Narrative Intelligence" }]} />}
        eyebrow="Public narrative intelligence"
        title={
          <>
            What story is the market <em>telling about us?</em>
          </>
        }
        lead="Not how often the business is mentioned. Which accounts of it are active, who owns each one, and which of them decide whether it gets chosen."
        meta={
          <a className="nar-election" href={lhref("/en/election-intelligence", locale)}>
            <span className="nar-election__dot" aria-hidden="true" />
            Election mode · Political intelligence <span aria-hidden="true">→</span>
          </a>
        }
        actions={
          <>
            <Button href="#landscape" variant="primary">
              See every active narrative
            </Button>
            <Button href="#plan" variant="ghost">
              Narrative action plan
            </Button>
          </>
        }
        aside={<HealthDonut />}
      />

      <SubNav
        label="Narrative"
        links={[
          { id: "engines", label: "AI narrative" },
          { id: "landscape", label: "Landscape" },
          { id: "ownership", label: "Ownership" },
          { id: "competitors", label: "Competitors" },
          { id: "opportunity", label: "Opportunity" },
          { id: "plan", label: "Action plan" },
        ]}
      />

      <section className="kit-section kit-section--tight nar-verdict" data-section>
        <div className="shell nar-verdict__inner" data-reveal>
          <span className="kit-mono">Recommendation · Respond immediately</span>
          <p>Correct the record first, then claim the narrative nobody owns.</p>
          <ConfidenceMark level="medium" />
        </div>
      </section>

      <section id="engines" className="kit-section nar-engines" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="AI narrative"
            title="What each engine currently says this business is."
            body="4 of 6 engines carry a materially different account of this business. A buyer's understanding depends on which assistant they happen to open."
            align="split"
          />
          <ul className="nar-quotes">
            {recognition.map((r, i) => (
              <li key={r.engine} className={`kit-card nar-quote nar-quote--${r.status}`} data-reveal data-reveal-delay={String((i % 3) * 70)} data-spotlight>
                <div className="nar-quote__top">
                  <span className="nar-quote__engine">
                    <span className="nar-quote__glyph">
                      <PlatformGlyph id={r.engine} />
                    </span>
                    {r.name}
                  </span>
                  <span className="kit-num nar-quote__score">
                    {r.score}
                    <small>/100</small>
                  </span>
                </div>
                <blockquote>“{r.believes}”</blockquote>
                <p>{r.note ?? "Accurate. No divergence from the intended account."}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="landscape" className="kit-section nar-landsec" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="02"
            label="Landscape"
            title="Every active narrative in this category."
            body="Sorted by reach. The owner column is the one that matters, a favourable story nobody owns is an asset waiting to be claimed."
            align="split"
          />
          <div data-reveal>
            <NarrativeLandscape />
          </div>
          <DemoNote className="nar-demo" />
        </div>
      </section>

      <section id="ownership" className="kit-section nar-own" data-section>
        <div className="shell nar-own__grid">
          <SectionIntro
            index="03"
            label="Ownership"
            title="Who owns the story."
            body="Share of active conversation, weighted by reach. Unclaimed is not neutral ground, it is ground with no defender."
          />
          <div className="nar-own__viz" data-reveal>
            <div className="nar-own__bar" role="img" aria-label={own.map((o) => `${o.label} ${o.pct}%`).join(", ")}>
              {own.map((o) => (
                <span key={o.key} className={`nar-own__seg nar-own__seg--${o.key}`} style={{ flexGrow: o.pct } as CSSProperties}>
                  <b>{o.pct}%</b>
                </span>
              ))}
            </div>
            <ul className="nar-own__legend">
              {own.map((o) => (
                <li key={o.key} className={`nar-own__key nar-own__key--${o.key}`}>
                  <i aria-hidden="true" />
                  {o.label}
                  <b className="kit-num">{o.pct}%</b>
                </li>
              ))}
            </ul>
            <div className="nar-own__lang">
              <b className="kit-num">12%</b>
              <p>
                <strong>Category language owned.</strong> The share of the vocabulary engines use to define this category that belongs to this business. Whoever holds this sets the criteria every comparison is scored against.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="competitors" className="kit-section nar-compsec" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="04"
            label="Competitors"
            title="The story each competitor is telling."
            body="Every position has a weakness built into it. A narrative strong enough to dominate is usually narrow enough to outflank."
            align="split"
          />
          <div className="kit-card nar-compsec__panel" data-reveal>
            <CompetitorStories />
          </div>
        </div>
      </section>

      <section id="opportunity" className="kit-section nar-opp" data-section>
        <div className="shell">
          <SectionIntro
            index="05"
            label="Opportunity"
            title={<>Stories <em className="t-editorial">nobody owns.</em></>}
            body="Ranked by influence against competition. The best of these are high influence and uncontested, which is the rarest combination in any category."
            align="split"
          />
          <div className="nar-matrix" data-reveal>
            <div className="nar-matrix__y" aria-hidden="true">
              <span>High influence</span>
              <span>Medium influence</span>
            </div>
            <div className="nar-matrix__grid">
              {Array.from({ length: 8 }, (_, cell) => {
                const row = Math.floor(cell / 4);
                const col = cell % 4;
                const items = unownedStories.filter((s) => influenceRow[s.influence] === row && competitionCol[s.competition] === col);
                const sweet = row === 0 && col <= 1;
                return (
                  <div key={cell} className={`nar-matrix__cell${sweet ? " is-sweet" : ""}`}>
                    {items.map((s) => (
                      <article key={s.title} className="nar-opp__card" tabIndex={0}>
                        <b>{s.title}</b>
                        <p>{s.detail}</p>
                      </article>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="nar-matrix__x" aria-hidden="true">
              <span>No competition</span>
              <span>Low</span>
              <span>Medium</span>
              <span>Contested</span>
            </div>
          </div>
          <ol className="nar-opp__list">
            {unownedStories.map((s, i) => (
              <li key={s.title} className="kit-card nar-opp__row">
                <span className="nar-opp__n kit-num">{i + 1}</span>
                <div>
                  <b>{s.title}</b>
                  <p>{s.detail}</p>
                  <span className="nar-opp__tags">
                    <Pill tone="signal">Influence · {s.influence}</Pill>
                    <Pill tone={s.competition === "None" ? "up" : s.competition === "Contested" ? "down" : "warn"}>Competition · {s.competition}</Pill>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="plan" className="kit-section nar-plan" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="06"
            label="Intervention"
            title="Narrative action plan."
            body="Each carries its objective, the evidence behind it, the movement expected, a confidence, an owner, a deadline and how success is verified."
            align="split"
          />
          <div className="nar-plan__grid">
            {plan.map((iv, i) => (
              <article key={iv.id} className="kit-card nar-plan__card" data-reveal data-reveal-delay={String(i * 90)} data-spotlight>
                <span className="nar-plan__n kit-num">{i + 1}</span>
                <h3>{iv.id === "narrative" ? "Claim response time as a published supplier selection criterion." : "Correct the entity conflation and the hardware-retailer categorisation."}</h3>
                <p>
                  {iv.id === "narrative"
                    ? "The narrative is unowned, high influence and uncontested. Same-day regional delivery is a real capability that appears in no category description."
                    : "Gemini resolves a same-named logistics firm; ChatGPT categorises the business as retail. Both remove it from supplier-evaluation answers entirely."}
                </p>
                <div className="nar-plan__move">
                  <span className="kit-mono">Expected impact</span>
                  <b>{iv.id === "narrative" ? "Narrative ownership 12% → 24%" : "Average recognition 38 → 55 of 100"}</b>
                </div>
                <div className="nar-plan__meta">
                  <ConfidenceMark level={iv.id === "narrative" ? "medium" : "high"} />
                  <span>{iv.owner}</span>
                  <span>{iv.deadline}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="The same intelligence, for elections"
        title="Which narratives are moving the electorate?"
        body="Election mode runs the same narrative intelligence across candidates, parties and the political arena."
        primary={{ label: "Open the War Room", href: "/en/election-intelligence" }}
        secondary={{ label: "Back to Mission Control", href: "/en/app/mission-control" }}
      />
    </div>
  );
}
