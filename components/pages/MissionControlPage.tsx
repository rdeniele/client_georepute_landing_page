import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import {
  ConfidenceMark,
  Crumbs,
  CtaBand,
  DemoNote,
  lhref,
  PageHero,
  Pill,
  SectionIntro,
} from "@/components/subpages/kit";
import { SubNav, SubpageFx } from "@/components/subpages/fx";
import { IntelligenceFeed, MeasureBoard } from "@/components/subpages/MissionWidgets";
import { causalChain, interventions } from "@/lib/subpages/demo";

export function MissionControlPage({ locale }: { locale: string }) {
  const top = ["authority", "entity"].map((id) => interventions.find((iv) => iv.id === id)!);

  return (
    <div className="kit-page mc-page">
      <SubpageFx />
      <PageHero
        id="mc"
        layout="stack"
        className="mc-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Platform" }, { label: "Executive Mission Control" }]} />}
        eyebrow="Executive Mission Control"
        title={
          <>
            Not more data. <em>A decision position.</em>
          </>
        }
        lead="Ten measures, one decision position, each opening its evidence, and the causal chain that connects them to the intervention they imply."
        meta={
          <>
            <span className="mc-chip">
              <span className="mc-chip__dot" aria-hidden="true" /> Workspace · Ironvale Supply
            </span>
            <span className="mc-chip">Decision deadline · Nov 30, 2026</span>
            <span className="mc-chip">Window · 7 months</span>
          </>
        }
        actions={
          <>
            <Button href="#position" variant="primary">
              Read the position
            </Button>
            <Button href={lhref("/en/app/reconstruct", locale)} variant="ghost">
              Reconstruct the decision
            </Button>
          </>
        }
      />

      <SubNav
        label="Mission Control"
        links={[
          { id: "position", label: "Position" },
          { id: "explanation", label: "Explanation" },
          { id: "feed", label: "Intelligence feed" },
          { id: "execution", label: "Execution" },
        ]}
      />

      <section id="position" className="kit-section mc-position" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="Position"
            title="Ten measures, each with evidence behind it."
            body="Every figure is computed from observed data. Select any tile to open its readout, its confidence and where the evidence lives."
            align="split"
          />
          <div data-reveal>
            <MeasureBoard locale={locale} />
          </div>
          <DemoNote className="mc-demo" />
        </div>
      </section>

      <section id="explanation" className="kit-section mc-chain" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell mc-chain__grid">
          <div className="mc-chain__intro">
            <SectionIntro
              index="02"
              label="Explanation"
              title={<>One decision. Many signals. <em className="t-editorial">One explanation.</em></>}
              body="The measures above are not independent. This is the chain that connects them, ending in the intervention it implies."
            />
          </div>
          <div className="mc-chain__track">
          <span className="mc-chain__spine" data-draw aria-hidden="true" />
          <ol className="mc-chain__list">
            {causalChain.map((s, i) => (
              <li key={s.label} className="mc-link" data-reveal data-reveal-delay={String(i * 70)} style={{ "--i": i } as CSSProperties}>
                <span className="mc-link__node" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="kit-card mc-link__card">
                  <div className="mc-link__top">
                    <span>{s.label}</span>
                    <b className="kit-num">{s.value}</b>
                  </div>
                  <p>{s.detail}</p>
                </div>
              </li>
            ))}
            <li className="mc-link mc-link--rx" data-reveal data-reveal-delay="480">
              <span className="mc-link__node" aria-hidden="true">
                ✓
              </span>
              <div className="mc-link__card mc-link__card--rx">
                <span className="kit-mono">Prescription</span>
                <strong>Strengthen independent authority evidence and supplier-comparison coverage.</strong>
                <p>Authority is the binding constraint, so it is where intervention begins.</p>
              </div>
            </li>
          </ol>
          </div>
        </div>
      </section>

      <section id="feed" className="kit-section mc-feedsec" data-section>
        <div className="shell mc-feedsec__grid">
          <div className="mc-feedsec__intro">
            <SectionIntro
              index="03"
              label="Executive intelligence feed"
              title="What moved this week, and whether it helps or hurts."
              body="Nine events across competitors, cost, citations, narrative and timing. Filter to the kind of movement you need to act on."
            />
            <div className="mc-feedsec__sum" data-reveal>
              <div>
                <b className="kit-num">9</b>
                <span>events</span>
              </div>
              <div>
                <b className="kit-num mc-down">5</b>
                <span>risks</span>
              </div>
              <div>
                <b className="kit-num mc-up">2</b>
                <span>gains</span>
              </div>
            </div>
          </div>
          <div data-reveal>
            <IntelligenceFeed />
          </div>
        </div>
      </section>

      <section id="execution" className="kit-section mc-exec" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="04"
            label="Execution"
            title="The platform does not end with insight."
            body="Each intervention names an owner, a deadline, the signal it should move and how that movement will be verified."
            align="split"
            aside={
              <Button href={lhref("/en/app/actions", locale)} variant="ghost">
                Open Action Center
              </Button>
            }
          />
          <div className="mc-exec__grid">
            {top.map((iv, i) => (
              <article key={iv.id} className="kit-card mc-iv" data-reveal data-reveal-delay={String(i * 90)} data-spotlight>
                <header>
                  <span className="mc-iv__n">{i + 1}</span>
                  <Pill tone="down">{iv.urgency}</Pill>
                  <Pill tone="muted">{iv.horizon}-day</Pill>
                  <ConfidenceMark level={iv.confidence} />
                </header>
                <h3>{iv.title}</h3>
                <p>{iv.why}</p>
                <div className="mc-iv__impact">
                  <span className="kit-mono">Expected impact</span>
                  <b>{iv.impact}</b>
                </div>
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
                    <dt>Success metric</dt>
                    <dd>{iv.metric}</dd>
                  </div>
                  <div>
                    <dt>Measured change</dt>
                    <dd>Not yet measured, verified after execution.</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="Go deeper"
        title="Every tile opens an engine. Every engine opens its evidence."
        primary={{ label: "Reconstruct the decision", href: "/en/app/reconstruct" }}
        secondary={{ label: "Explore intelligence engines", href: "/en/engines" }}
      />
    </div>
  );
}
