import { signals as c } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Section 03 — See the signals.
 *
 * A ledger, not a card grid. Each measure is one hairline row: index, name,
 * and the question it actually answers. Focusing a row draws its connector
 * and lifts the question — the same illuminate-on-focus behaviour the graph
 * sections use, so the vocabulary stays consistent.
 */
export function SignalMap() {
  return (
    <section id="signals" className="section" data-section>
      <div className="shell signals">
        <div className="signals__aside">
          <SectionHeader
            index={c.index}
            label={c.label}
            headline={c.headline}
            body={c.body}
          />
        </div>

        <ol className="signals__list">
          {c.items.map((item, i) => (
            <li
              key={item.name}
              className="signal"
              data-reveal
              data-reveal-delay={i * 45}
            >
              <span className="signal__index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="signal__body">
                <span className="signal__name">{item.name}</span>
                <span className="signal__q">{item.q}</span>
              </span>
              <span className="signal__link" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
