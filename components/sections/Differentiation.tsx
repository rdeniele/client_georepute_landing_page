import { getLocaleCopy } from "@/lib/i18n";
import { ProductShot } from "@/components/ui/ProductShot";

/**
 * Key differentiation statement, directly after the hero.
 *
 * One job: stop the visitor from filing GeoRepute under "ranking tracker"
 * before they've scrolled past the fold. Deliberately spare — a label, a
 * short prominent title, one paragraph — so it reads as a statement, not
 * another content block.
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
          <h2 className="diff__title">
            {c.title}
          </h2>
          <p className="t-lead diff__body">
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
