import { Button } from "@/components/ui/Button";
import { getLocaleCopy, localizePath, normalizeLocale } from "@/lib/i18n";

/**
 * The two connected use cases of one platform: growing the agency's own
 * business, and going deeper on every client it manages. Same visual
 * weight, same card treatment, neither reads as the "real" product with
 * the other bolted on.
 *
 * "Explore the Platform" lives here rather than in the hero: it's the
 * exploration-tier CTA, positioned after the audience has been told who
 * this is for, not competing with the hero's conversion action.
 */
export function ValueAreas({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).valueAreas;
  const exploreHref = localizePath("/en/app/reconstruct", normalizeLocale(locale));
  return (
    <section id="value-areas" className="section values" data-section>
      <div className="shell">
        <p className="t-eyebrow values__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="values__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>
        <p className="t-lead values__body" data-reveal data-reveal-delay="90">
          {c.supporting}
        </p>

        <div className="values__grid">
          <article className="values__card glass" data-reveal data-reveal-delay="120">
            <h3 className="values__card-title">{c.business.title}</h3>
            <ul className="values__list">
              {c.business.items.map((item, i) => (
                <li
                  key={item}
                  className="values__item"
                  data-reveal
                  data-reveal-delay={140 + i * 40}
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="values__card glass" data-reveal data-reveal-delay="180">
            <h3 className="values__card-title">{c.clients.title}</h3>
            <ul className="values__list">
              {c.clients.items.map((item, i) => (
                <li
                  key={item}
                  className="values__item"
                  data-reveal
                  data-reveal-delay={200 + i * 40}
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="values__explore" data-reveal data-reveal-delay="240">
          <Button href={exploreHref} variant="ghost">
            {c.exploreCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
