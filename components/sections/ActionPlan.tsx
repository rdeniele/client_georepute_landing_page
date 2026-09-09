import { actionPlan as base } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { ProductShot } from "@/components/ui/ProductShot";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 10 — From insight to action.
 *
 * Each intervention names the measure it is expected to move, who owns it and
 * by when — the section exists to show the system resolving into something
 * accountable, so those three fields matter more than the card styling.
 */
export function ActionPlan({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).actionPlan;
  return (
    <section id="action" className="section band band--tint" data-section>
      <Band tone="tint" edge="feather" />

      <div className="shell">
        <SectionHeader
          index={base.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <ol className="plan">
          {base.items.map((item, i) => (
            <li
              key={item.n}
              className="plan__item glass"
              data-reveal
              data-reveal-delay={i * 70}
            >
              <span className="plan__spine" aria-hidden="true" />
              <span className="plan__n">{item.n}</span>
              <div className="plan__main">
                <h3 className="plan__title">{c.items[i].title}</h3>
                <dl className="plan__meta">
                  <div className="plan__field">
                    <dt className="t-label">{c.movesLabel}</dt>
                    <dd className="plan__measure">{c.items[i].measure}</dd>
                  </div>
                  <div className="plan__field">
                    <dt className="t-label">{c.ownerLabel}</dt>
                    <dd>{c.items[i].owner}</dd>
                  </div>
                  <div className="plan__field">
                    <dt className="t-label">{c.horizonLabel}</dt>
                    <dd>{c.items[i].horizon}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>

        <ProductShot
          src="/screenshots/UI6.png"
          alt="GeoRepute's Share of Voice screen: ranked mention share across every platform, with key takeaways and recommended opportunities to act on."
          url="app.georepute.ai/share-of-voice"
          ratio="1672 / 941"
          size="wide"
          className="plan__shot"
        />
      </div>
    </section>
  );
}
