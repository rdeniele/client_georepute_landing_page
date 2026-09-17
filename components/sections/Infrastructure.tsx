import { getLocaleCopy } from "@/lib/i18n";

/**
 * Infrastructure, a compact credibility strip ahead of the final CTA.
 *
 * Communicates the breadth of the platform itself (surfaces watched,
 * languages, engines, measurement cadence) rather than customer performance
 * claims. Not part of the numbered section sequence, same placement as the
 * results strip it replaces.
 */
export function Infrastructure({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).infrastructure;

  return (
    <section id="infrastructure" className="section infra" data-section>
      <div className="shell">
        <p className="t-eyebrow infra__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="infra__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>

        <div className="infra__grid">
          {c.items.map((item, i) => (
            <div key={item} className="infra__item glass" data-reveal data-reveal-delay={120 + i * 60}>
              <span className="infra__item-text">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
