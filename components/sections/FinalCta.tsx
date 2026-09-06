import { finalCta as c, footer as f } from "@/lib/content";
import { Button } from "@/components/ui/Button";

/**
 * Section 11 — Analyze my business.
 *
 * The camera has returned to the centre of the network by this point and the
 * scene is at its brightest, so this section stays deliberately bare: one
 * line, one supporting sentence, two controls.
 */
export function FinalCta() {
  return (
    <section id="analyze" className="section final" data-section>
      <div className="shell final__shell">
        <span className="t-eyebrow" data-reveal>
          {c.label}
        </span>

        <h2 className="t-h1 final__headline" data-reveal data-reveal-delay="80">
          The decision is{" "}
          <em className="t-editorial final__em">already happening.</em>
        </h2>

        <p className="t-lead final__body" data-reveal data-reveal-delay="160">
          {c.body}
        </p>

        <div className="final__actions" data-reveal data-reveal-delay="240">
          <Button href={c.primaryCta.href} variant="primary">
            {c.primaryCta.label}
          </Button>
          <Button href={c.secondaryCta.href} variant="ghost">
            {c.secondaryCta.label}
          </Button>
        </div>
      </div>

      <footer className="foot">
        <div className="shell foot__shell">
          <span className="foot__brand">{f.brand}</span>
          <span className="foot__tagline">{f.tagline}</span>
          <span className="foot__note t-editorial">{f.note}</span>
        </div>
      </footer>
    </section>
  );
}
