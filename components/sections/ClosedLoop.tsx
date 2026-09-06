import { loop as c } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Section 07 — The closed loop.
 *
 * The travelling highlight is a short arc inside a rotating group, so the
 * motion is a single transform rather than an animated stroke offset. The
 * ring sits over the live scene with no backing, which is what visually
 * returns the cycle to the network.
 */

const R = 150;
const C = 2 * Math.PI * R;
const SEG = (C * 82) / 360;
const GAP = (C * 8) / 360;

/** Label anchors at each quadrant's centre, as percentages of the box. */
const LABEL_POS = [
  [84.5, 15.5],
  [84.5, 84.5],
  [15.5, 84.5],
  [15.5, 15.5],
];

export function ClosedLoop() {
  return (
    <section id="loop" className="section" data-section>
      <div className="shell loop">
        <div className="loop__aside">
          <SectionHeader
            index={c.index}
            label={c.label}
            headline={c.headline}
            body={c.body}
          />
        </div>

        <div className="loop__stage" data-reveal>
          <svg className="loop__ring" viewBox="0 0 400 400" aria-hidden="true">
            <circle
              cx="200"
              cy="200"
              r={R}
              className="loop__base"
              strokeDasharray={`${SEG} ${GAP}`}
            />
            <g className="loop__spin">
              <circle
                cx="200"
                cy="200"
                r={R}
                className="loop__head"
                strokeDasharray={`${C * 0.06} ${C}`}
              />
            </g>
            <circle cx="200" cy="200" r="4" className="loop__core" />
          </svg>

          <ol className="loop__labels">
            {c.stages.map((s, i) => (
              <li
                key={s.key}
                className="loop__label"
                style={
                  {
                    "--x": `${LABEL_POS[i][0]}%`,
                    "--y": `${LABEL_POS[i][1]}%`,
                    "--d": `${i * 0.9}s`,
                  } as React.CSSProperties
                }
              >
                <span className="loop__key">{s.key}</span>
                <span className="loop__detail">{s.detail}</span>
              </li>
            ))}
          </ol>

          <p className="loop__centre">
            <span className="t-label">Every cycle</span>
            <span className="loop__centre-text t-editorial">
              returns better informed
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
