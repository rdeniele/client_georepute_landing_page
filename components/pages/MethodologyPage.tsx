import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { ConfidenceMark, Crumbs, CtaBand, lhref, PageHero } from "@/components/subpages/kit";
import { SubpageFx } from "@/components/subpages/fx";
import { DocToc, IndexCalculator } from "@/components/subpages/MethodWidgets";
import { getMethodologyCopy } from "@/lib/subpages/copy";
import { getConfidence, type Confidence } from "@/lib/subpages/demo";

function hexPoint(i: number, count: number, d: number, c: number) {
  const a = ((-90 + i * (360 / count)) * Math.PI) / 180;
  return `${(c + Math.cos(a) * d).toFixed(1)},${(c + Math.sin(a) * d).toFixed(1)}`;
}

/** The six published GEON vectors, plotted at their observed scores, resolving to the same DHI the calculator below computes. */
function VectorHex({ vectors }: { vectors: ReturnType<typeof getMethodologyCopy>["vectors"] }) {
  const size = 168;
  const c = size / 2;
  const r = 66;
  const dhi = Math.round(vectors.reduce((s, v) => s + v.weight * v.score, 0));
  const grid = (k: number) => vectors.map((_, i) => hexPoint(i, vectors.length, r * k, c)).join(" ");
  return (
    <figure className="meth-hex" aria-label={`Decision Health Index ${dhi} of 100, across six GEON vectors`}>
      <div className="meth-hex__ring">
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {[1, 0.66, 0.33].map((k) => (
            <polygon key={k} points={grid(k)} className="meth-hex__grid" />
          ))}
          <polygon points={vectors.map((v, i) => hexPoint(i, vectors.length, r * (v.score / 100), c)).join(" ")} className="meth-hex__series" />
        </svg>
        <div className="meth-hex__core">
          <b className="kit-num">{dhi}</b>
          <span>/100 DHI</span>
        </div>
      </div>
      <ul className="meth-hex__legend">
        {vectors.map((v) => (
          <li key={v.name}>
            <span>{v.name}</span>
            <b className="kit-num">{v.score}</b>
          </li>
        ))}
      </ul>
    </figure>
  );
}

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
  const m = getMethodologyCopy(locale);
  const CONFIDENCE = getConfidence(locale);
  const weights = m.vectors;
  const TOC = m.ui.toc.map((label, i) => ({ id: ["geon", "evidence", "confidence", "financial", "limits"][i], label }));
  return (
    <div className="kit-page meth-page">
      <SubpageFx />
      <PageHero
        id="meth"
        layout="stack"
        className="meth-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: m.ui.crumb }]} />}
        eyebrow={m.eyebrow}
        title={
          <>
            {m.ui.heroTitle[0]} <em>{m.ui.heroTitle[1]}</em>
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
              {m.ui.traceLabels.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          </>
        }
        aside={<VectorHex vectors={weights} />}
      />

      <div className="shell meth-layout">
        <aside className="meth-layout__toc">
          <DocToc items={TOC} />
        </aside>

        <div className="meth-layout__doc">
          <DocSection id="geon" n="01" label={m.ui.sec1Label} title={m.ui.sec1Title}>
            <p className="t-body meth-p" data-reveal>
              {m.ui.sec1Body}
            </p>
            <div className="meth-weights" data-reveal aria-label={m.ui.weightsAria}>
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
            <p className="meth-small">{m.ui.sec1Note}</p>
          </DocSection>

          <DocSection id="evidence" n="02" label={m.ui.sec2Label} title={m.ui.sec2Title}>
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

          <DocSection id="confidence" n="03" label={m.ui.sec3Label} title={m.ui.sec3Title}>
            <p className="t-body meth-p" data-reveal>
              {m.ui.sec3Body}
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

          <DocSection id="financial" n="04" label={m.ui.sec4Label} title={m.ui.sec4Title}>
            <div className="meth-formula" data-reveal aria-label={m.financial.formula.join(" × ")}>
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
                <span className="kit-mono">{m.ui.economicsLabel}</span>
                <div className="meth-cpc__scale" aria-hidden="true">
                  <span className="meth-cpc__be" style={{ left: `${(6.13 / 10) * 100}%` }}>
                    <small>{m.ui.breakEvenLabel} {m.financial.economics[1][1]}</small>
                  </span>
                  <span className="meth-cpc__blend" style={{ left: `${(8.42 / 10) * 100}%` }}>
                    <small>{m.ui.blendedLabel} {m.financial.economics[0][1]}</small>
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

          <DocSection id="limits" n="05" label={m.ui.sec5Label} title={m.ui.sec5Title}>
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
                {m.ui.btnMissionControl}
              </Button>
              <Button href={lhref("/en/engines", locale)} variant="ghost">
                {m.ui.btnEngines}
              </Button>
            </div>
          </DocSection>
        </div>
      </div>

      <CtaBand
        locale={locale}
        eyebrow={m.ui.ctaEyebrow}
        title={m.ui.ctaTitle}
        body={m.ui.ctaBody}
        primary={{ label: m.ui.btnReconstruct, href: "/en/app/reconstruct" }}
        secondary={{ label: m.ui.btnMissionControl, href: "/en/app/mission-control" }}
      />
    </div>
  );
}
