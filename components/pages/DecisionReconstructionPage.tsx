import { reconstruction as c } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { SiteFooter } from "@/components/ui/SiteFooter";

export function DecisionReconstructionPage() {
  return (
    <div className="subpage subpage--reconstruct">
      <section className="subhero" aria-labelledby="reconstruct-title">
        <Band tone="tint" edge="top-hard" />
        <div className="shell subhero__grid">
          <div className="subhero__copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/en">GeoRepute</a>
              <span aria-hidden="true">/</span>
              <span>Platform</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Decision Reconstruction</span>
            </nav>
            <span className="t-eyebrow subhero__eyebrow">Platform / decision reconstruction</span>
            <h1 id="reconstruct-title" className="subhero__title">
              See how a decision <em className="t-editorial">forms.</em>
            </h1>
            <p className="t-lead subhero__body">
              Enter a domain, pick a commercial question, and watch the evidence resolve into the answer a buyer receives.
            </p>
            <div className="subhero__actions">
              <Button href="#stages" variant="primary">Explore the reconstruction</Button>
              <Button href="/en/app/mission-control" variant="ghost">Open Mission Control</Button>
            </div>
            <p className="subpage__sample">{c.sampleNote}</p>
          </div>

          <div className="reconstruct-orbit" aria-label="Decision reconstruction flow">
            <div className="reconstruct-orbit__ring reconstruct-orbit__ring--outer" />
            <div className="reconstruct-orbit__ring reconstruct-orbit__ring--inner" />
            <div className="reconstruct-orbit__core">
              <span className="t-eyebrow">Question in</span>
              <strong>Decision out</strong>
            </div>
            {c.stages.slice(0, 5).map((stage, index) => (
              <span
                key={stage.key}
                className="reconstruct-orbit__node"
                style={{ "--orbit-index": index } as React.CSSProperties}
              >
                {stage.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <nav className="subnav" aria-label="Decision Reconstruction sections">
        <div className="shell subnav__inner">
          <span className="subnav__label">Decision Reconstruction</span>
          <a href="#overview">Overview</a>
          <a href="#stages">How it works</a>
          <a href="#outputs">Outputs</a>
          <a href="#next">Next action</a>
        </div>
      </nav>

      <section id="overview" className="subsection subsection--overview" data-section>
        <div className="shell subsection__intro">
          <span className="t-eyebrow">01 / The premise</span>
          <h2 className="t-h2">The click is the last visible moment.</h2>
          <p className="t-body">
            GeoRepute follows the question, interpretation, evidence, and alternatives that shape a decision before a visit is recorded.
          </p>
        </div>
        <div className="shell evidence-strip" aria-label="Decision inputs">
          <span>Question</span>
          <span>Interpretation</span>
          <span>Evidence</span>
          <span>Alternatives</span>
          <span>Recommendation</span>
          <span>Decision</span>
        </div>
      </section>

      <section id="stages" className="subsection subsection--stages" data-section>
        <Band tone="paper" edge="feather" />
        <div className="shell subsection__heading">
          <div>
            <span className="t-eyebrow">02 / The reconstruction</span>
            <h2 className="t-h2">One question. Six readable stages.</h2>
          </div>
          <p className="t-body">{c.query}</p>
        </div>
        <ol className="shell reconstruction-list">
          {c.stages.map((stage, index) => (
            <li key={stage.key} className="reconstruction-card" data-reveal data-reveal-delay={String(index * 50)}>
              <span className="reconstruction-card__index">0{index + 1}</span>
              <div className="reconstruction-card__body">
                <span className="t-eyebrow">{stage.label}</span>
                <h3>{stage.title}</h3>
                <p>{stage.detail}</p>
              </div>
              <span className="reconstruction-card__signal" aria-hidden="true">→</span>
            </li>
          ))}
        </ol>
        <p className="shell subpage__sample subpage__sample--center">{c.sampleNote}</p>
      </section>

      <section id="outputs" className="subsection subsection--outputs" data-section>
        <div className="shell outputs-grid">
          <div>
            <span className="t-eyebrow">03 / The output</span>
            <h2 className="t-h2">The answer opens its evidence.</h2>
            <p className="t-body">
              Every stage leaves a trace: what the system understood, which signals supported it, and where the business was absent from the answer.
            </p>
          </div>
          <div className="output-panel glass">
            <span className="t-eyebrow">Decision position</span>
            <strong>Named answer</strong>
            <div className="output-panel__line"><span>Interpretation</span><b>resolved</b></div>
            <div className="output-panel__line"><span>Evidence</span><b>weighted</b></div>
            <div className="output-panel__line"><span>Competitive context</span><b>visible</b></div>
          </div>
        </div>
      </section>

      <section id="next" className="subpage-cta band band--color" data-section>
        <Band tone="color" network edge="top-hard" />
        <div className="shell subpage-cta__inner">
          <span className="t-eyebrow">04 / Continue into the system</span>
          <h2 className="t-h2">The reconstruction is where the work begins.</h2>
          <p className="t-lead">Move from the named decision to the measures, evidence, and actions behind it.</p>
          <Button href="/en/app/mission-control" variant="primary">Open Mission Control</Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}