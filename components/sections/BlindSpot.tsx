import { blindSpot as base } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Band } from "@/components/ui/Band";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 05 — The blind spot.
 *
 * Both maps are plotted on one shared time axis, which is the entire point:
 * conventional analytics do not measure less detail, they start later. The
 * amber region is everything that has already happened by the time the first
 * conventional event fires.
 */

const GEO_AT = [0, 23, 46, 70, 100];
const TRAD_AT = [62, 74, 86, 100];

export function BlindSpot({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).blindSpot;
  return (
    <section
      id="blindspot"
      className="section band band--paper band--paper-right"
      data-section
    >
      <Band tone="paper" edge="feather" />

      <div className="shell">
        <SectionHeader
          index={base.index}
          label={c.label}
          headline={c.headline}
          body={c.body}
        />

        <div className="blind" data-reveal>
          <div className="blind__region" aria-hidden="true">
            <span className="blind__region-label">
              {c.alreadyDecided}
            </span>
          </div>

          <div className="blind__row">
            <h3 className="blind__title blind__title--geo">
              <span className="blind__dot" aria-hidden="true" />
              {c.georeputeTitle}
            </h3>
            <ol className="blind__track">
              {base.georepute.steps.map((s, i) => (
                <li
                  key={s}
                  className="blind__step blind__step--geo"
                  style={{ "--at": `${GEO_AT[i]}%` } as React.CSSProperties}
                >
                  <span className="blind__marker" aria-hidden="true" />
                  <span className="blind__label">{c.georeputeSteps[i]}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="blind__axis" aria-hidden="true">
            <span className="t-label blind__axis-label">
              {c.axisLabel}
            </span>
          </div>

          <div className="blind__row">
            <h3 className="blind__title blind__title--trad">
              <span className="blind__dot" aria-hidden="true" />
              {c.traditionalTitle}
            </h3>
            <ol className="blind__track">
              {base.traditional.steps.map((s, i) => (
                <li
                  key={s}
                  className="blind__step blind__step--trad"
                  style={{ "--at": `${TRAD_AT[i]}%` } as React.CSSProperties}
                >
                  <span className="blind__marker" aria-hidden="true" />
                  <span className="blind__label">{c.traditionalSteps[i]}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
