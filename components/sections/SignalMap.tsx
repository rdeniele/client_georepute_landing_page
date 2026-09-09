import { signals as base } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { ProductShot } from "@/components/ui/ProductShot";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 03 — See the signals.
 *
 * A ledger, not a card grid. Each measure is one hairline row: index, name,
 * and the question it actually answers. Focusing a row draws its connector
 * and lifts the question — the same illuminate-on-focus behaviour the graph
 * sections use, so the vocabulary stays consistent.
 */
export function SignalMap({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).signals;
  return (
    <section
      id="signals"
      className="section band band--tint"
      data-section
    >
      <Band tone="tint" network edge="feather" />

      <div className="shell signals">
        <div className="signals__aside">
          <SectionHeader
            index={base.index}
            label={c.label}
            headline={c.headline}
            body={c.body}
          />
          <ProductShot
            src="/screenshots/UI2.png"
            alt="GeoRepute's AI Visibility screen: platform mentions, sentiment, visibility score, and the prompts where the brand appears or is missed."
            url="app.georepute.ai/ai-visibility"
            ratio="3 / 2"
            className="signals__shot"
          />
        </div>

        <ol className="signals__list">
          {base.items.map((item, i) => (
            <li
              key={item.name}
              className="signal"
              data-reveal
              data-reveal-delay={i * 45}
              data-cursor="live"
              data-cursor-label={c.signalCursor}
            >
              <span className="signal__index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="signal__body">
                <span className="signal__name">{c.items[i].name}</span>
                <span className="signal__q">{c.items[i].q}</span>
              </span>
              <span className="signal__link" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
