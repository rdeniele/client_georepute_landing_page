import { getLocaleCopy } from "@/lib/i18n";

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
        <p className="t-eyebrow diff__eyebrow" data-reveal>
          {c.eyebrow}
        </p>
        <h2 className="diff__title" data-reveal data-reveal-delay="60">
          {c.title}
        </h2>
        <p className="t-lead diff__body" data-reveal data-reveal-delay="120">
          {c.body}
        </p>
      </div>
    </section>
  );
}
