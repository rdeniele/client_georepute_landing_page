import { getLocaleCopy } from "@/lib/i18n";

/**
 * The two connected use cases of one platform: growing the agency's own
 * business, and going deeper on every client it manages. Same visual
 * weight, same card treatment — neither reads as the "real" product with
 * the other bolted on.
 */
export function ValueAreas({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).valueAreas;
  return (
    <section id="value-areas" className="section values" data-section>
      <div className="shell">
        <p className="t-eyebrow values__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="values__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>

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
      </div>
    </section>
  );
}
