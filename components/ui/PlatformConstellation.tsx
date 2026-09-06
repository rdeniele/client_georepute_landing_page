"use client";

import { PLATFORMS, PlatformGlyph, type PlatformId } from "./PlatformGlyph";

/**
 * First-stage proof of what GeoRepute scans.
 *
 * The seven surfaces (Google + six AI engines) are drawn as a connected
 * constellation rather than a logo row: each platform sits on its own node,
 * tied to the GeoRepute core by a line, so the stage reads as "these systems
 * are being monitored" instead of "here is a logo strip". On narrow screens
 * the arc collapses to a compact chip wrap — the names stay legible at every
 * size, which is the point.
 */

type Chip = { id: PlatformId; x: number; y: number };

// Positions as percentages of the stage box: the core sits at bottom centre
// and the platforms fan across the upper half, so the arcs read as signals
// feeding into the core rather than a decorative halo.
const CHIPS: Chip[] = [
  { id: "google", x: 13, y: 58 },
  { id: "chatgpt", x: 26.5, y: 26 },
  { id: "gemini", x: 41.5, y: 9 },
  { id: "claude", x: 58.5, y: 9 },
  { id: "perplexity", x: 73.5, y: 26 },
  { id: "copilot", x: 87, y: 58 },
  { id: "grok", x: 50, y: 42 },
];

const CORE = { x: 50, y: 92 };

/** A gentle arc from the core to a chip, bowed upward so lines never overlap. */
function arcTo(cx: number, cy: number, x: number, y: number) {
  const mx = (cx + x) / 2;
  const my = Math.min(cy, y) - 18;
  return `M ${cx} ${cy} Q ${mx} ${my} ${x} ${y}`;
}

export function PlatformConstellation() {
  return (
    <div className="platforms" data-reveal>
      <p className="platforms__label">
        GeoRepute scans Google + 6 AI engines — the surfaces where your business
        is discovered
      </p>

      <div className="platforms__stage">
        <svg className="platforms__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {CHIPS.map((c) => (
            <path
              key={c.id}
              className="platforms__line"
              d={arcTo(CORE.x, CORE.y, c.x, c.y)}
            />
          ))}
        </svg>

        <div className="platforms__core">
          <span className="platforms__core-dot" aria-hidden="true" />
          <span className="platforms__core-text">GeoRepute scans</span>
        </div>

        <div className="platforms__chips">
          {CHIPS.map((c, i) => (
            <span
              key={c.id}
              className="platforms__chip"
              style={
                {
                  "--chip-x": `${c.x}%`,
                  "--chip-y": `${c.y}%`,
                } as React.CSSProperties
              }
              data-reveal
              data-reveal-delay={120 + i * 60}
            >
              <span className="platforms__glyph">
                <PlatformGlyph id={c.id} />
              </span>
              <span>{PLATFORMS.find((p) => p.id === c.id)!.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}