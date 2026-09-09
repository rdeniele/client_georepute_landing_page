import { platformFlow as base } from "@/lib/content";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * The platform flow: Research → Intelligence → Opportunity → Decision →
 * Strategy → Work Plan → Execution → Measurement → Improvement.
 *
 * The steps move as a quiet, continuous marquee. The set is duplicated so
 * the loop has no visible seam, while CSS handles the motion without a
 * per-frame JavaScript loop.
 */
export function PlatformFlowSection({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).platformFlow;

  return (
    <section id="platform-flow" className="section flow" data-section>
      <div className="shell flow__inner">
        <p className="t-eyebrow flow__eyebrow" data-reveal>
          {c.label}
        </p>
        <h2 className="flow__headline" data-reveal data-reveal-delay="60">
          {c.headline}
        </h2>

        <div className="flow__viewport" aria-label="Platform workflow">
          <div className="flow__track">
            {[false, true].map((duplicate) => (
              <ol className="flow__row" key={String(duplicate)} aria-hidden={duplicate}>
                {base.steps.map((_, i) => (
                  <li key={`${duplicate}-${c.steps[i]}`} className="flow__step">
                    <span className="flow__step-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flow__step-label">{c.steps[i]}</span>
                  </li>
                ))}
              </ol>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
