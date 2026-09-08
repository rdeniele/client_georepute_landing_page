import { invisibleDecision as c } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { InvisibleBrowserStack } from "@/components/sections/InvisibleBrowserStack";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 02 — The invisible decision.
 *
 * The argument is the diagram: six steps rendered as unresolved outlines and
 * one rendered as a solid, lit event. The proportion is the point, so the
 * copy stays short and lets the ratio carry it.
 *
 * The band is mostly white, and the real-world photograph enters from the
 * right and runs off the page. That is the section's claim made spatially:
 * the customer is out there, already deciding, outside the frame your
 * analytics can see.
 */
export function InvisibleDecision({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).invisible;
  const invisibleCount = c.timeline.filter((s) => !s.visible).length;

  return (
    <section id="invisible" className="section band band--paper" data-section>
      <Band tone="paper" edge="feather" />

      <div className="shell">
        <div className="invis__top">
          <SectionHeader
            index={c.index}
            label={c.label}
            headline={c.headline}
            body={c.body}
          />

          <InvisibleBrowserStack locale={locale} />
        </div>

        <div className="invis">
          <div className="invis__brackets" aria-hidden="true">
            <span
              className="invis__bracket invis__bracket--dark"
              style={{ "--span": invisibleCount } as React.CSSProperties}
              data-reveal
            >
              <span className="t-label invis__bracket-label">
                {c.invisibleLabel}
              </span>
            </span>
            <span className="invis__bracket invis__bracket--lit" data-reveal>
              <span className="t-label invis__bracket-label">
                {c.visibleLabel}
              </span>
            </span>
          </div>

          <ol className="invis__track">
            {c.timeline.map((step, i) => (
              <li
                key={step.t}
                className={`invis__step ${step.visible ? "is-visible" : ""}`}
                data-reveal
                data-reveal-delay={i * 60}
              >
                <span className="invis__marker" aria-hidden="true" />
                <span className="invis__step-label">{step.t}</span>
                {!step.visible && (
                  <span className="sr-only">(not measured)</span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <blockquote className="pull" data-reveal>
          <p className="pull__text">
            {c.pullLead}{" "}
            <em className="t-editorial pull__em">{c.pullEmphasis}</em>
          </p>
        </blockquote>
      </div>
    </section>
  );
}
