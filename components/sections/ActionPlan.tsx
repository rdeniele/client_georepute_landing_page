import { actionPlan as c } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";

/**
 * Section 10 — From insight to action.
 *
 * Each intervention names the measure it is expected to move, who owns it and
 * by when — the section exists to show the system resolving into something
 * accountable, so those three fields matter more than the card styling.
 */
export function ActionPlan() {
  return (
    <section id="action" className="section band band--tint" data-section>
      <Band tone="tint" edge="feather" />

      <div className="shell">
        <SectionHeader
          index={c.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <ol className="plan">
          {c.items.map((item, i) => (
            <li
              key={item.n}
              className="plan__item glass"
              data-reveal
              data-reveal-delay={i * 70}
            >
              <span className="plan__spine" aria-hidden="true" />
              <span className="plan__n">{item.n}</span>
              <div className="plan__main">
                <h3 className="plan__title">{item.title}</h3>
                <dl className="plan__meta">
                  <div className="plan__field">
                    <dt className="t-label">Moves</dt>
                    <dd className="plan__measure">{item.measure}</dd>
                  </div>
                  <div className="plan__field">
                    <dt className="t-label">Owner</dt>
                    <dd>{item.owner}</dd>
                  </div>
                  <div className="plan__field">
                    <dt className="t-label">Horizon</dt>
                    <dd>{item.horizon}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
