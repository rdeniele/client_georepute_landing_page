import { hero, capabilities } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { PlatformConstellation } from "@/components/ui/PlatformConstellation";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { BandNetwork } from "@/components/ui/BandNetwork";
import { getLocaleCopy } from "@/lib/i18n";
import { HeroScrollFx } from "@/components/sections/HeroScrollFx";
import {
  MagnifyingGlass,
  Brain,
  Globe,
  ArrowsClockwise,
} from "@phosphor-icons/react/ssr";
import type { IconProps } from "@phosphor-icons/react/lib";

// Real, meaning-matched marks for the capability strip — never a generic
// placeholder glyph. Keyed from lib/content.ts so copy and icon stay paired
// in one place.
const CAP_ICON: Record<string, React.ComponentType<IconProps>> = {
  search: MagnifyingGlass,
  brain: Brain,
  globe: Globe,
  cycle: ArrowsClockwise,
};

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
 *
 * The composition is the half-white / half-colour language stated once, at
 * full strength: light paper carries the argument on the left; the brand
 * environment on the right holds the real-world photograph with the
 * intelligence layer visibly leaving its edge. The reader meets both halves
 * of the story — reality and the invisible layer around it — in one viewport.
 */
export function Hero({ locale = "en" }: { locale?: string }) {
  const localeCopy = getLocaleCopy(locale);
  const copy = localeCopy.hero;
  const panel = localeCopy.heroPanel;
  return (
    <section id="top" className="hero band band--split" data-section>
      <HeroScrollFx />
      <div className="hero__stage">
        <div className="hero__env" aria-hidden="true">
          <BandNetwork className="bandnet--hero" />
        </div>

        <div className="shell hero__shell">
          <div className="hero__copy">
            <p
              className="t-eyebrow hero__eyebrow"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              {copy.eyebrow}
            </p>

            <h1 className="hero__headline">
              <span
                className="hero__lead"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                {copy.headlineLead}
              </span>
              {copy.emphasis.map((word, i) => (
                <span
                  key={word}
                  className={`hero__word ${i === 2 ? "hero__word--chosen" : ""}`}
                  style={{ "--i": 2 + i, "--indent": i } as React.CSSProperties}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p
              className="t-lead hero__support"
              style={{ "--i": 5 } as React.CSSProperties}
            >
              {copy.supporting}
            </p>

            <div
              className="hero__actions"
              style={{ "--i": 6 } as React.CSSProperties}
            >
              <Button href={copy.primaryCta.href} variant="conversion">
                {copy.primaryCta.label}
              </Button>
              <Button href={copy.secondaryCta.href} variant="ghost">
                {copy.secondaryCta.label}
              </Button>
            </div>
          </div>

          {/* The real-world half. The photograph is the business; the glass
            readout is what GeoRepute reads off it; the bridge lines are the
            decision environment the network extends into. */}
          <div
            className="hero__plate"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <EditorialPhoto slot="hero" bridge tint="soft" locale={locale}>
              <div className="photo__panel">
                <div className="photo__panel-head">
                  <span className="photo__panel-label">{panel.title}</span>
                </div>
                <dl className="photo__panel-rows">
                  <div className="photo__panel-row">
                    <dt>{panel.surfaces}</dt>
                    <dd>Google + 6 AI</dd>
                  </div>
                  <div className="photo__panel-row">
                    <dt>{panel.signals}</dt>
                    <dd>10</dd>
                  </div>
                  <div className="photo__panel-row">
                    <dt>{panel.position}</dt>
                    <dd>{panel.state}</dd>
                  </div>
                </dl>
              </div>
            </EditorialPhoto>
          </div>
        </div>
      </div>

      <div className="shell hero__constellation-shell">
        <PlatformConstellation locale={locale} />
      </div>

      <div className="hero__foot" style={{ "--i": 7 } as React.CSSProperties}>
        <div className="shell hero__foot-shell">
          <ul className="hero__caps">
            {capabilities.map((c, i) => {
              const Icon = CAP_ICON[c.icon];
              return (
                <li key={c.label} className="hero__cap">
                  <span className="hero__cap-icon" aria-hidden="true">
                    <Icon size={16} weight="duotone" />
                  </span>
                  <span className="hero__cap-text">
                    <span className="hero__cap-value">{c.value}</span>
                    <span className="hero__cap-label">{localeCopy.capabilityLabels[i]}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <span className="hero__hint">
            <span className="t-label">{copy.scrollHint}</span>
            <span className="hero__hint-rail" aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
}
