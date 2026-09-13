import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { ConfidenceMark, Crumbs, CtaBand, lhref, PageHero } from "@/components/subpages/kit";
import { SubpageFx } from "@/components/subpages/fx";
import { DocToc, IndexCalculator } from "@/components/subpages/MethodWidgets";
import { methodology as m } from "@/lib/subpages/copy";
import { CONFIDENCE, type Confidence } from "@/lib/subpages/demo";

const TOC = [
  { id: "geon", label: "The GEON framework" },
  { id: "evidence", label: "Where observations come from" },
  { id: "confidence", label: "Confidence" },
  { id: "financial", label: "Financial model" },
  { id: "limits", label: "Limitations" },
];

function DocSection({ id, n, label, title, children }: { id: string; n: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="meth-sec" aria-labelledby={`${id}-t`}>
      <header className="meth-sec__head" data-reveal>
        <span className="meth-sec__n">{n}</span>
        <span className="t-label">{label}</span>
      </header>
      <h2 id={`${id}-t`} className="t-h2 meth-sec__title" data-reveal data-reveal-delay="60">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MethodologyPage({ locale }: { locale: string }) {
  const weights = m.vectors;
  return (
    <div className="kit-page meth-page">
      <SubpageFx />
      <PageHero
        id="meth"
        layout="stack"
        className="meth-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Methodology" }]} />}
        eyebrow={m.eyebrow}
        title={
          <>
            The stronger the claim, <em>the stronger the evidence path must be.</em>
          </>
        }
        lead={m.lead}
        meta={
          <>
            <span className="meth-version">
              <span className="meth-version__dot" aria-hidden="true" />
              {m.version}
            </span>
            <span className="meth-trace">
              {["Date", "Source", "Engine", "Prompt", "Dataset"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          </>
        }
      />

      <div className="shell meth-layout">
        <aside className="meth-layout__toc">
          <DocToc items={TOC} />
        </aside>

        <div className="meth-layout__doc">
          <DocSection id="geon" n="01" label="The GEON framework" title="Six vectors, one published weighting.">
            <p className="t-body meth-p" data-reveal>
              The Decision Health Index is a weighted function of these six vectors, not a score assigned by judgement. The weighting is published so the index can be recomputed independently. Move any vector to see how.
            </p>
            <div className="meth-weights" data-reveal aria-label="Published vector weights">
              {weights.map((v) => (
                <span key={v.name} className="meth-weights__seg" style={{ flexGrow: v.weight } as CSSProperties}>
                  <b>{Math.round(v.weight * 1000) / 10}%</b>
                  <small>{v.name}</small>
                </span>
              ))}
            </div>
            <div className="kit-card meth-calc-wrap" data-reveal>
              <IndexCalculator />
            </div>
            <p className="meth-small">Observed values are from the demonstration environment (Ironvale Supply). The weights are the published GEON-2.4 weights.</p>
          </DocSection>

          <DocSection id="evidence" n="02" label="Evidence" title="Where the observations come from.">
            <ol className="meth-evidence">
              {m.evidence.map((e, i) => (
                <li key={e.name} className="meth-evidence__item" data-reveal data-reveal-delay={String((i % 4) * 50)}>
                  <span className="meth-evidence__n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{e.name}</b>
                    <p>{e.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </DocSection>

          <DocSection id="confidence" n="03" label="Confidence" title="Every conclusion carries its own confidence.">
            <p className="t-body meth-p" data-reveal>
              Confidence is attached to the individual conclusion, not to the product. Two findings in the same readout can carry different confidence, and they frequently do.
            </p>
            <ul className="meth-conf">
              {(Object.keys(CONFIDENCE) as Confidence[]).map((k, i) => (
                <li key={k} className={`kit-card meth-conf__card meth-conf__card--${k}`} data-reveal data-reveal-delay={String(i * 60)}>
                  <span className="meth-conf__mark" aria-hidden="true">
                    {CONFIDENCE[k].mark}
                  </span>
                  <b>{CONFIDENCE[k].label}</b>
                  <p>{CONFIDENCE[k].detail}</p>
                </li>
              ))}
            </ul>
          </DocSection>

          <DocSection id="financial" n="04" label="Financial model" title="Directional, ranged, and never described as confirmed.">
            <div className="meth-formula" data-reveal aria-label={m.financial.formula.join(" times ")}>
              {m.financial.formula.map((t, i) => (
                <span key={t} className="meth-formula__term">
                  {i > 0 ? (
                    <i aria-hidden="true">×</i>
                  ) : null}
                  <b>{t}</b>
                </span>
              ))}
            </div>
            <div className="meth-fin">
              <ul className="meth-rules" data-reveal>
                {m.financial.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="kit-card meth-cpc" data-reveal data-reveal-delay="100">
                <span className="kit-mono">Search economics, derived</span>
                <div className="meth-cpc__scale" aria-hidden="true">
                  <span className="meth-cpc__be" style={{ left: `${(6.13 / 10) * 100}%` }}>
                    <small>Break-even $6.13</small>
                  </span>
                  <span className="meth-cpc__blend" style={{ left: `${(8.42 / 10) * 100}%` }}>
                    <small>Blended $8.42</small>
                  </span>
                </div>
                <dl>
                  {m.financial.economics.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd className="kit-num">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p>{m.financial.economicsNote}</p>
                <ConfidenceMark level="directional" />
              </div>
            </div>
          </DocSection>

          <DocSection id="limits" n="05" label="Limitations" title="What this system cannot tell you.">
            <ol className="meth-limits">
              {m.limitations.map((l, i) => (
                <li key={l} data-reveal data-reveal-delay={String(i * 50)}>
                  <span className="meth-limits__n">{i + 1}</span>
                  <p>{l}</p>
                </li>
              ))}
            </ol>
            <div className="meth-end" data-reveal>
              <Button href={lhref("/en/app/mission-control", locale)} variant="primary">
                Open Mission Control
              </Button>
              <Button href={lhref("/en/engines", locale)} variant="ghost">
                See the engines
              </Button>
            </div>
          </DocSection>
        </div>
      </div>

      <CtaBand
        locale={locale}
        eyebrow="Audit it yourself"
        title="Every number on this site opens its evidence."
        body="Start from a decision and follow any figure back to the engine, the question and the date it was observed."
        primary={{ label: "Reconstruct a decision", href: "/en/app/reconstruct" }}
        secondary={{ label: "Open Mission Control", href: "/en/app/mission-control" }}
      />
    </div>
  );
}
