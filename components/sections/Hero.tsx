import { hero, capabilities } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { PlatformConstellation } from "@/components/ui/PlatformConstellation";

/**
 * Section 01 — Enter the system.
 *
 * The page's single orchestrated entrance: eyebrow, then the three payoff
 * words in sequence, then the supporting line and controls. Everything after
 * this section reveals on scroll instead, so the load moment stays the one
 * choreographed event rather than one of many.
 *
 * The stagger is CSS-only so the copy renders and animates without waiting
 * for hydration — this stays a server component on purpose.
 */
export function Hero() {
  return (
    <section id="top" className="hero" data-section>
      <div className="shell hero__shell">
        <p className="t-eyebrow hero__eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
          {hero.eyebrow}
        </p>

        <h1 className="hero__headline">
          <span
            className="hero__lead"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {hero.headlineLead}
          </span>
          {hero.emphasis.map((word, i) => (
            <span
              key={word}
              className={`hero__word ${i === 2 ? "hero__word--chosen" : ""}`}
              style={
                { "--i": 2 + i, "--indent": i } as React.CSSProperties
              }
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          className="t-lead hero__support"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          {hero.supporting}
        </p>

        <div
          className="hero__actions"
          style={{ "--i": 6 } as React.CSSProperties}
        >
          <Button href={hero.primaryCta.href} variant="primary">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="ghost">
            {hero.secondaryCta.label}
          </Button>
        </div>

        <PlatformConstellation />
      </div>

      <div
        className="hero__foot"
        style={{ "--i": 7 } as React.CSSProperties}
      >
        <div className="shell hero__foot-shell">
          <ul className="hero__caps">
            {capabilities.map((c) => (
              <li key={c.label} className="hero__cap">
                <span className="hero__cap-value">{c.value}</span>
                <span className="hero__cap-label">{c.label}</span>
              </li>
            ))}
          </ul>
          <span className="hero__hint">
            <span className="t-label">{hero.scrollHint}</span>
            <span className="hero__hint-rail" aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
}
