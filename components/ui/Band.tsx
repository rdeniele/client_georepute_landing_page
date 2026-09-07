import type { ReactNode } from "react";
import { BandNetwork } from "./BandNetwork";

/**
 * The page's background rhythm.
 *
 * "Half-white / half-colour" is a pacing device, not a template: a band is a
 * horizontal environment the section sits inside, and the sequence of them —
 * paper, tint, colour, paper — is what stops the page reading as one
 * continuous treatment. Sections still choose their own internal asymmetry.
 *
 * `paper` and `tint` are translucent, so the persistent WebGL network reads
 * straight through them; `colour` is opaque and carries its own SVG network
 * instead (see BandNetwork). The plate is painted behind the section's own
 * content via z-index inside the section's stacking context, and colour bands
 * re-point the ink/line tokens so every component inside them restyles from
 * the token layer rather than needing colour-band variants.
 */
export type BandTone = "paper" | "tint" | "color";

export function Band({
  tone,
  network = false,
  edge = "feather",
  className = "",
}: {
  tone: BandTone;
  /** Colour bands only — draw the inverted intelligence network on the plate. */
  network?: boolean;
  /** How the plate meets the bands above and below it. */
  edge?: "feather" | "hard" | "top-hard" | "bottom-hard";
  className?: string;
}) {
  return (
    <div
      className={`band__plate band__plate--${tone} band__plate--edge-${edge} ${className}`}
      aria-hidden="true"
    >
      {network && tone === "color" && <BandNetwork className="bandnet--plate" />}
    </div>
  );
}

/** Convenience wrapper for the common case: a section that is one band. */
export function BandSection({
  id,
  tone,
  network,
  edge,
  className = "",
  children,
}: {
  id: string;
  tone: BandTone;
  network?: boolean;
  edge?: "feather" | "hard" | "top-hard" | "bottom-hard";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`section band band--${tone} ${className}`}
      data-section
    >
      <Band tone={tone} network={network} edge={edge} />
      {children}
    </section>
  );
}
