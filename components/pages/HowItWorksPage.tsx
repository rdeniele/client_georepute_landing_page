import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { Crumbs, CtaBand, DEMO_HREF, DemoNote, lhref, PageHero, SectionIntro } from "@/components/subpages/kit";
import { SubpageFx } from "@/components/subpages/fx";
import { PhaseRing, Sometimes } from "@/components/subpages/LoopWidgets";
import { howItWorks as c } from "@/lib/subpages/copy";

function HeroLoop() {
  return (
    <div className="hiw-orbit" aria-label="Plan, do, check, act, one continuous loop">
      <span className="hiw-orbit__ring" aria-hidden="true" />
      <span className="hiw-orbit__ring hiw-orbit__ring--inner" aria-hidden="true" />
      <span className="hiw-orbit__comet" aria-hidden="true" />
      {c.phases.map((p, i) => (
        <span key={p.key} className={`hiw-orbit__node hiw-orbit__node--${i}`}>
          <small>{p.n}</small>
          {p.name}
        </span>
      ))}
      <span className="hiw-orbit__core">
        <b>Repeat</b>
        <small>The output of one cycle becomes the intelligence of the next.</small>
      </span>
    </div>
  );
}

export function HowItWorksPage({ locale }: { locale: string }) {
  return (
    <div className="kit-page hiw-page">
      <SubpageFx />
      <PageHero
        id="hiw"
        className="hiw-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "How it works" }]} />}
        eyebrow={c.eyebrow}
        title={
          <>
            From intelligence to execution. <em>From execution back to intelligence.</em>
          </>
        }
        lead={c.lead}
        actions={
          <>
            <Button href={DEMO_HREF} variant="primary">
              Book a Live Demo
            </Button>
            <Button href="#loop" variant="ghost">
              Walk the loop
            </Button>
          </>
        }
        aside={<HeroLoop />}
      />

      <section className="kit-section hiw-gap" data-section>
        <div className="shell">
          <SectionIntro index="01" label={c.disconnected.eyebrow} title={c.disconnected.title} body={c.disconnected.body} align="split" />
          <div className="hiw-compare">
            <div className="hiw-compare__side hiw-compare__side--broken" data-reveal>
              <span className="kit-mono">The traditional model is fragmented</span>
              <ul className="hiw-scatter">
                {c.disconnected.pieces.map((p, i) => (
                  <li key={p} style={{ "--r": `${((i * 47) % 9) - 4}deg` } as CSSProperties}>
                    {p}
                  </li>
                ))}
              </ul>
              <ol className="hiw-chain hiw-chain--broken">
                {c.disconnected.fragmented.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <div className="hiw-compare__side hiw-compare__side--closed" data-reveal data-reveal-delay="120">
              <span className="kit-mono">GeoRepute closes the gap</span>
              <p className="hiw-compare__claim">GeoRepute connects the entire decision cycle.</p>
              <ol className="hiw-chain hiw-chain--closed">
                {c.disconnected.connected.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="hiw-compare__foot">
                The same intelligence that identifies the problem guides the strategy. The execution is measured against the original objective. And the result determines what the system does next.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="loop" className="kit-section hiw-phases" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell hiw-phases__grid">
          <aside className="hiw-phases__rail">
            <PhaseRing phases={c.phases.map((p) => ({ key: p.key, name: p.name }))} />
            <p className="hiw-phases__pdca">Plan → Do → Check → Act → Repeat</p>
          </aside>

          <div className="hiw-phases__list">
            {c.phases.map((p) => (
              <article key={p.key} id={`phase-${p.key}`} className="hiw-phase">
                <header data-reveal>
                  <span className="hiw-phase__n">{p.n}</span>
                  <span className="hiw-phase__name">{p.name}</span>
                </header>
                <h2 className="t-h3" data-reveal data-reveal-delay="60">
                  {p.title}
                </h2>
                <p className="t-body" data-reveal data-reveal-delay="100">
                  {p.body}
                </p>

                <div className="hiw-phase__grid" data-reveal data-reveal-delay="140">
                  <div className="kit-card hiw-phase__card">
                    <span className="kit-mono">{p.listLabel}</span>
                    <ul className={`hiw-tags${p.key === "check" ? " hiw-tags--ba" : ""}`}>
                      {p.list.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="kit-card hiw-phase__card hiw-phase__card--q">
                    <span className="kit-mono">The question</span>
                    <b className="hiw-phase__question">{p.question}</b>
                    <ul className="hiw-checks">
                      {p.determines.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="hiw-contrast" data-reveal>
                  <s>{p.contrast[0]}</s>
                  <span aria-hidden="true">→</span>
                  <b>{p.contrast[1]}</b>
                </p>

                {p.key === "check" ? (
                  <div className="kit-card hiw-ba" data-reveal>
                    <div className="hiw-ba__head">
                      <span className="kit-mono">Before → Action → After</span>
                      <span className="hiw-ba__legend">
                        <i className="is-before" /> Before <i className="is-after" /> After <i className="is-target" /> Target
                      </span>
                    </div>
                    <ul>
                      {c.beforeAfter.map((row) => {
                        const max = Math.max(row.target * 1.25, row.after);
                        return (
                          <li key={row.signal} className="hiw-ba__row">
                            <span className="hiw-ba__signal">{row.signal}</span>
                            <span className="hiw-ba__bars" aria-label={`${row.signal}: before ${row.before}${row.unit}, after ${row.after}${row.unit}, target ${row.target}${row.unit}`}>
                              <i className="is-before" style={{ "--v": row.before / max } as CSSProperties} data-reveal />
                              <i className="is-after" style={{ "--v": row.after / max } as CSSProperties} data-reveal data-reveal-delay="200" />
                              <b className="is-target" style={{ left: `${(row.target / max) * 100}%` }} />
                            </span>
                            <span className="hiw-ba__nums">
                              {row.before}
                              {row.unit} → <b>{row.after}{row.unit}</b>
                              <small>target {row.target}{row.unit}</small>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <DemoNote>{c.beforeAfterNote}</DemoNote>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="kit-section hiw-cycle" data-section>
        <div className="shell">
          <SectionIntro index="02" label="The closed loop" title="One system. One continuous learning cycle." body="Every cycle makes the next cycle more informed." align="center" />
          <ol className="hiw-seven">
            {c.loop.map((s, i) => (
              <li key={s.name} className="kit-card kit-card--lift hiw-seven__step" data-reveal data-reveal-delay={String(i * 60)} data-spotlight style={{ "--i": i } as CSSProperties}>
                <span className="hiw-seven__n">{i + 1}</span>
                <b>{s.name}</b>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="hiw-seven__return" data-reveal>
            <span aria-hidden="true">↺</span> Correct feeds straight back into Understand.
          </p>
        </div>
      </section>

      <section className="kit-section hiw-brain" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell hiw-brain__grid">
          <div>
            <SectionIntro index="03" label={c.brain.eyebrow} title={c.brain.title} body={c.brain.body} />
            <div data-reveal>
              <Sometimes words={c.brain.sometimes} />
            </div>
          </div>
          <div className="hiw-diff" data-reveal data-reveal-delay="120">
            <span className="kit-mono">The difference</span>
            <ol>
              {c.difference.map(([k, v], i) => (
                <li key={k} style={{ "--i": i } as CSSProperties}>
                  <b>{k}</b> {v}
                </li>
              ))}
            </ol>
            <p>GeoRepute connects all five, and runs the cycle again.</p>
          </div>
        </div>
      </section>

      <section className="kit-section hiw-living" data-section>
        <div className="shell hiw-living__inner">
          <SectionIntro label="From a snapshot to a living strategy" title={c.living.title} body={c.living.body} align="center" />
        </div>
        <div className="hiw-marquee" aria-label={c.living.verbs.join(". ")}>
          <div className="hiw-marquee__track" aria-hidden="true">
            {[0, 1].map((dup) => (
              <span key={dup} className="hiw-marquee__set">
                {c.living.verbs.map((v) => (
                  <span key={v}>
                    {v}
                    <i>·</i>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="See it run"
        title={c.cta.title}
        body={c.cta.body}
        primary={{ label: "Book a Live Demo", href: DEMO_HREF }}
        secondary={{ label: "Open Mission Control", href: lhref("/en/app/mission-control", locale) }}
      />
    </div>
  );
}
