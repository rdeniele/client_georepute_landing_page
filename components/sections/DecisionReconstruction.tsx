import { reconstruction as c } from "@/lib/content";

/**
 * Section 04 — Watch a decision form.
 *
 * Section 04 — Watch a decision form.
 *
 * All six stages stay visible in a calm framed grid. Scroll changes emphasis
 * only, so the process remains understandable without a pinned sequence.
 */

export function DecisionReconstruction() {
  return (
    <section
      id="reconstruct"
      className="section recon"
      data-section
    >
      <div className="shell recon__shell">
        <div className="recon__head">
          <div className="sec-head__meta recon__meta">
            <span className="sec-head__index">{c.index}</span>
            <span className="t-label">{c.label}</span>
          </div>
          <h2 className="t-h3 recon__headline">{c.headline}</h2>

          <div className="recon__query glass">
            <span className="t-label">Commercial question</span>
            <p className="recon__query-text">{c.query}</p>
          </div>
        </div>

        <ol className="recon__cards">
          {c.stages.map((s, i) => (
            <li
              key={s.key}
              className="recon__card"
            >
              <div className="recon__card-top">
                <span className="recon__card-number">0{i + 1}</span>
              </div>
              <span className="t-eyebrow">{s.label}</span>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </li>
          ))}
        </ol>

        <p className="recon__sample">{c.sampleNote}</p>
      </div>
    </section>
  );
}
