import { getLocaleCopy } from "@/lib/i18n";
import { ProductShot } from "@/components/ui/ProductShot";

/**
 * Key differentiation statement, directly after the hero.
 *
 * One job: stop the visitor from filing GeoRepute under "another tool"
 * before they've scrolled past the fold. Three struck-through categories it
 * is not, then the one line that says what it is: intelligence that stays
 * with the business when people change.
 */
export function Differentiation({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).differentiation;
  return (
    <section id="differentiation" className="section diff" data-section>
      <div className="shell diff__inner">
        <div className="diff__copy">
          <p className="t-eyebrow diff__eyebrow">
            {c.eyebrow}
          </p>
          <ul className="diff__nots">
            {c.negations.map((n, i) => (
              <li key={n} data-reveal data-reveal-delay={String(i * 90)}>
                {n}
              </li>
            ))}
          </ul>
          <h2 className="diff__title" data-reveal data-reveal-delay="300">
            {c.title}
          </h2>
          <p className="t-lead diff__body" data-reveal data-reveal-delay="380">
            {c.body}
          </p>
        </div>
        <ProductShot
          src="/screenshots/UI3.png"
          alt="GeoRepute's full prompt list mapping commercial questions through the purchase decision."
          url="app.georepute.ai/prompts"
          ratio="1672 / 941"
          className="diff__preview"
        />
      </div>
    </section>
  );
}
