import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { ConfidenceMark, Crumbs, CtaBand, DemoNote, lhref, PageHero, Pill, SectionIntro } from "@/components/subpages/kit";
import { CountUp, SubNav, SubpageFx } from "@/components/subpages/fx";
import { ReadinessDimensions } from "@/components/subpages/ReadinessWidgets";
import { interventions, readiness as r } from "@/lib/subpages/demo";

/** The pre-launch sequence, in the order the live assessment gives it. */
const PLAN: { id: string; blockedBy?: number }[] = [
  { id: "authority" },
  { id: "entity" },
  { id: "gemini", blockedBy: 2 },
  { id: "comparison" },
  { id: "paid", blockedBy: 4 },
];

function Gauge() {
  // Semicircle 0–100 with the published thresholds: blocking < 45 ≤ at risk < 70 ≤ ready
  const arc = "M 20 120 A 100 100 0 0 1 220 120";
  return (
    <figure className="cr-gauge" aria-label="Campaign readiness 32 of 100, delay the campaign">
      <svg viewBox="0 0 240 140" aria-hidden="true">
        <path d={arc} pathLength={100} className="cr-gauge__zone cr-gauge__zone--block" style={{ strokeDasharray: "45 100" }} />
        <path d={arc} pathLength={100} className="cr-gauge__zone cr-gauge__zone--risk" style={{ strokeDasharray: "0 45 25 100" }} />
        <path d={arc} pathLength={100} className="cr-gauge__zone cr-gauge__zone--ready" style={{ strokeDasharray: "0 70 30 100" }} />
        <path d={arc} pathLength={100} className="cr-gauge__value" style={{ strokeDasharray: `${r.score} 100` }} />
      </svg>
      <div className="cr-gauge__read">
        <b className="kit-num">
          <CountUp to={r.score} />
        </b>
        <span>/100 readiness</span>
      </div>
      <div className="cr-gauge__scale" aria-hidden="true">
        <span>Blocking</span>
        <span>At risk · 45</span>
        <span>Ready · 70</span>
      </div>
      <figcaption className="cr-verdict">
        <span className="cr-verdict__stamp">Delay campaign</span>
        <ConfidenceMark level="high" />
      </figcaption>
    </figure>
  );
}

export function CampaignReadinessPage({ locale }: { locale: string }) {
  const maxCoverage = 10;

  return (
    <div className="kit-page cr-page">
      <SubpageFx />
      <PageHero
        id="cr"
        className="cr-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Platform" }, { label: "Campaign Readiness" }]} />}
        eyebrow="Campaign readiness intelligence"
        title={
          <>
            Should we launch this campaign <em>today?</em>
          </>
        }
        lead="This assessment evaluates the business, not the campaign. Creative, targeting and budget can all be correct while the business remains structurally unable to convert the attention it buys."
        actions={
          <>
            <Button href="#dimensions" variant="primary">
              See why it scores 32
            </Button>
            <Button href="#plan" variant="ghost">
              What to fix first
            </Button>
          </>
        }
        aside={<Gauge />}
      />

      <div className="shell cr-brief" data-reveal>
        {[
          ["Campaign", r.campaign.name],
          ["Intended launch", r.campaign.launch],
          ["Duration", r.campaign.duration],
          ["Channels", r.campaign.channels],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="kit-mono">{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>

      <SubNav
        label="Campaign Readiness"
        links={[
          { id: "dimensions", label: "Assessment" },
          { id: "coverage", label: "Coverage" },
          { id: "risk", label: "Commercial risk" },
          { id: "plan", label: "Required before launch" },
        ]}
      />

      <section id="dimensions" className="kit-section cr-assess" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="Assessment"
            title="Seven readiness dimensions, weighted into one index."
            body="Every score is computed from observed data rather than assigned. The weights are published and sum to one. Authority, at 11, is the primary constraint."
            align="split"
          />
          <div className="kit-card cr-assess__panel" data-reveal>
            <ReadinessDimensions />
          </div>
          <DemoNote className="cr-demo" />
        </div>
      </section>

      <section id="coverage" className="kit-section cr-coverage" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="02"
            label="Coverage"
            title="Where the campaign would reach buyers, and where it would not."
            body="A campaign creates demand across the whole journey. It converts only at the stages where the business is actually present."
            align="center"
          />
          <ol className="cr-journey">
            {r.stages.map((s, i) => (
              <li
                key={s.name}
                className={`cr-stage${s.coverage === 0 ? " is-absent" : ""}${i === 3 ? " is-decisive" : ""}`}
                data-reveal
                data-reveal-delay={String(i * 80)}
                style={{ "--h": s.coverage / maxCoverage } as CSSProperties}
              >
                <span className="kit-mono">Stage {i + 1}</span>
                <b className="cr-stage__name">{s.name}</b>
                <span className="cr-stage__col" aria-hidden="true">
                  <i />
                </span>
                <span className="cr-stage__pct kit-num">{s.coverage}%</span>
                <span className="cr-stage__q">{s.questions} tracked questions</span>
                {s.coverage === 0 ? <Pill tone="down">Absent</Pill> : null}
                {i === 3 ? <Pill tone="warn">Decides 60% of revenue</Pill> : null}
                <span className="cr-stage__seen">{s.seenBy}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="risk" className="kit-section cr-risk" data-section>
        <div className="shell">
          <SectionIntro
            index="03"
            label="Commercial risk"
            title="What launching today would cost."
            body="Risk here is not the chance the campaign underperforms. It is the mechanism by which spend converts into a competitor's advantage."
            align="split"
          />
          <div className="cr-risk__grid">
            {r.risks.map((x, i) => (
              <article key={x.value} className="kit-card kit-card--lift cr-risk__card" data-reveal data-reveal-delay={String(i * 90)} data-spotlight>
                <b className="kit-num">{x.value}</b>
                <p>{x.label}</p>
              </article>
            ))}
            <article className="cr-risk__card cr-risk__card--budget" data-reveal data-reveal-delay="270">
              <span className="kit-mono">Estimated budget at risk</span>
              <p>A directional estimate per quarter, built on the customer’s own deal-value and conversion assumptions.</p>
              <ConfidenceMark level="directional" />
              <small>Directional estimate, not confirmed lost revenue.</small>
            </article>
          </div>
        </div>
      </section>

      <section id="plan" className="kit-section cr-plan" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="04"
            label="Intervention"
            title="Required before launch."
            body="Each carries a priority, an owner, a deadline, an effort estimate, its dependencies and the movement it should produce."
            align="split"
            aside={
              <Button href={lhref("/en/app/actions", locale)} variant="ghost">
                Open Action Center
              </Button>
            }
          />
          <ol className="cr-steps">
            {PLAN.map((p, i) => {
              const iv = interventions.find((x) => x.id === p.id)!;
              return (
                <li key={p.id} className={`cr-step${p.blockedBy ? " is-blocked" : ""}`} data-reveal data-reveal-delay={String(i * 70)}>
                  <span className="cr-step__n kit-num">{i + 1}</span>
                  <div className="kit-card cr-step__card" data-spotlight>
                    <div className="cr-step__top">
                      <Pill tone={iv.urgency === "Immediate" ? "down" : "warn"}>{iv.urgency}</Pill>
                      <Pill tone="muted">{iv.effort} effort</Pill>
                      <span className={`cr-step__dep${p.blockedBy ? " is-blocked" : ""}`}>
                        {p.blockedBy ? `Blocked until priority ${p.blockedBy} lands` : "No dependencies · can start immediately"}
                      </span>
                    </div>
                    <h3>{iv.title}</h3>
                    <div className="cr-step__meta">
                      <span>
                        <small>Expected</small>
                        {iv.impact}
                      </span>
                      <span>
                        <small>Verified by</small>
                        {iv.metric}
                      </span>
                      <span>
                        <small>Owner</small>
                        {iv.owner} · {iv.deadline}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="Executive decision"
        title="Delay the campaign. Fix authority first."
        body="Launching remains available and is sometimes correct, a product deadline or a competitive move can outweigh a readiness score. This assessment states the cost of that choice."
        primary={{ label: "Fix readiness first", href: "/en/app/actions" }}
        secondary={{ label: "Review the full position", href: "/en/app/mission-control" }}
      />
    </div>
  );
}
