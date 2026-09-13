import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { Crumbs, CtaBand, DEMO_HREF, DemoNote, lhref, PageHero, SectionIntro } from "@/components/subpages/kit";
import { SubpageFx } from "@/components/subpages/fx";
import { enginesIndex as c } from "@/lib/subpages/copy";

export function EnginesIndexPage({ locale }: { locale: string }) {
  const grid = [
    ...c.built.map((b) => ({ name: b.name.replace(" Intelligence", ""), built: true })),
    ...c.further.map((f) => ({ name: f.name, built: false })),
  ];

  return (
    <div className="kit-page eix-page">
      <SubpageFx />
      <PageHero
        id="engines"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Intelligence engines" }]} />}
        eyebrow={c.eyebrow}
        title={
          <>
            Twelve intelligence engines. <em>One operating system.</em>
          </>
        }
        lead={c.lead}
        actions={
          <>
            <Button href="#built" variant="primary">
              Explore the engines
            </Button>
            <Button href={lhref("/en/app/mission-control", locale)} variant="ghost">
              Open Mission Control
            </Button>
          </>
        }
        aside={
          <div className="eix-matrix" aria-label="Twelve engines, four built to full depth in this environment">
            {grid.map((g, i) => (
              <span
                key={g.name}
                className={`eix-matrix__cell${g.built ? " is-built" : ""}`}
                style={{ "--i": i } as CSSProperties}
              >
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{g.name}</span>
              </span>
            ))}
            <p className="eix-matrix__legend">
              <i className="is-built" aria-hidden="true" /> Built to full depth in this environment
              <i aria-hidden="true" /> Available in platform
            </p>
          </div>
        }
      />

      <section id="built" className="kit-section eix-built" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="Built in this environment · 4 of 12"
            title="Four engines, built to full depth, and chained into one argument."
            body="Each carries a real seeded outcome, its evidence, its commercial consequence and the action it prescribes. They chain into one another, together they form the causal argument rather than four samples of it."
            align="split"
          />

          <ol className="eix-chain">
            {c.built.map((b, i) => (
              <li key={b.href} className="eix-chain__step" data-reveal data-reveal-delay={String(i * 90)}>
                <a className="kit-card eix-card" href={lhref(b.href, locale)} data-spotlight>
                  <span className="eix-card__top">
                    <span className="eix-card__n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="kit-mono">{b.name}</span>
                  </span>
                  <strong className="eix-card__q">{b.question}</strong>
                  <span className="eix-card__stat">
                    <b className="kit-num">{b.stat}</b>
                    <small>{b.statLabel}</small>
                  </span>
                  <span className="eix-card__finding">{b.finding}</span>
                  <span className="eix-card__modules">
                    {b.modules.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </span>
                  <span className="eix-card__open">
                    Open the readout <span aria-hidden="true">→</span>
                  </span>
                </a>
                {i < c.built.length - 1 ? (
                  <span className="eix-chain__link" aria-hidden="true">
                    <span>feeds</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <DemoNote className="eix-built__demo" />
        </div>
      </section>

      <section className="kit-section eix-further" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="02"
            label="The full operating system"
            title="Eight further engines available in the platform."
            body="These are part of the operating system but are not built in this demonstration environment. Their business questions are listed so the shape of the full system is visible."
          />
          <ul className="eix-grid">
            {c.further.map((f, i) => (
              <li key={f.name} className="kit-card kit-card--lift eix-mini" data-reveal data-reveal-delay={String((i % 4) * 60)} data-spotlight>
                <span className="eix-mini__n">{String(i + 5).padStart(2, "0")}</span>
                <span className="kit-mono">{f.name}</span>
                <p>{f.question}</p>
                <span className="eix-mini__tag">Available in platform</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="From engines to a decision"
        title="Twelve engines resolve into one decision position."
        body="Mission Control reads every engine at once, ten measures, each opening its evidence."
        primary={{ label: "Open Mission Control", href: "/en/app/mission-control" }}
        secondary={{ label: "Start Analysis", href: DEMO_HREF }}
      />
    </div>
  );
}
