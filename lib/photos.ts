/**
 * Photography manifest.
 *
 * Every editorial photo slot on the page is declared here, and only here.
 * A slot renders a real photograph as soon as `src` points at a file in
 * `public/photography/`; until then it renders its designed reserved plate:
 * the network artwork with a discreet annotation; so the layout is final and
 * dropping the image in is a one-line change.
 *
 * The `spec` is the brief handed to the client for that slot. It is shown on
 * the reserved plate so the ask is visible in context rather than buried in a
 * document.
 *
 * NOTE ON SOURCING: the live GeoRepute site carries no photography of its own.
 * Its six photographs are all Unsplash stock (abstract circuitry, fibre optic,
 * Earth-from-orbit); the only self-hosted imagery is thirteen product-UI
 * screenshots under /screens/. Real photographs therefore have to come from
 * the client. See handoff.md § Photography.
 */

export type PhotoSlot = {
  /** Stable id: also the expected filename stem in public/photography/. */
  id: string;
  /** Path under /public once the client supplies the file, else null. */
  src: string | null;
  /** Required. Written now so it ships with the image rather than after. */
  alt: string;
  /** Aspect ratio the layout reserves. */
  ratio: string;
  /** Priority order in which the client is being asked for these. */
  priority: 1 | 2 | 3;
  /** The ask, shown on the reserved plate and repeated in the handoff. */
  spec: {
    orientation: "landscape" | "portrait" | "square";
    minWidth: number;
    subject: string;
    composition: string;
  };
};

export const photos = {
  hero: {
    id: "hero",
    src: "/screenshots/shot4.png",
    alt: "A real GeoRepute customer environment: the business whose decision environment the network is mapping.",
    ratio: "4 / 5",
    priority: 1,
    spec: {
      orientation: "portrait",
      minWidth: 1400,
      subject:
        "A real business or customer environment: people at work, a client meeting, a physical premises, a decision being made.",
      composition:
        "Subject weighted low or to one side. Calm upper area for the glass readout to sit over. No text or logos in frame.",
    },
  },
  decision: {
    id: "decision",
    src: "/screenshots/shot%201.png",
    alt: "A customer weighing alternatives: the moment the decision is actually shaped, before any analytics event fires.",
    ratio: "3 / 2",
    priority: 2,
    spec: {
      orientation: "landscape",
      minWidth: 1800,
      subject:
        "Real-world customer context: a person comparing options, searching, asking, deciding. Human, unposed.",
      composition:
        "Landscape. Subject toward the right so the frame can bleed off the page edge. Room to crop from the left.",
    },
  },
  overview: {
    id: "overview",
    src: "/screenshots/shot%203.png",
    alt: "The GeoRepute overview dashboard: AI Overviews found, domains cited, and visibility trend for a tracked business.",
    ratio: "16 / 10",
    priority: 2,
    spec: {
      orientation: "landscape",
      minWidth: 1800,
      subject: "Product screenshot: the overview dashboard.",
      composition:
        "Landscape, used small as a second stacked window behind the primary decision-environment plate.",
    },
  },
  close: {
    id: "close",
    src: null,
    alt: "The real business the decision environment forms around: where GeoRepute's analysis lands.",
    ratio: "21 / 9",
    priority: 3,
    spec: {
      orientation: "landscape",
      minWidth: 2400,
      subject:
        "A real business, team or market at work: the organisation the whole page has been talking about. Human and credible, not a stock boardroom.",
      composition:
        "Very wide. Runs full-bleed behind the closing statement under a brand-colour veil, so mid-tones read better than heavy contrast.",
    },
  },
} as const satisfies Record<string, PhotoSlot>;

export type PhotoId = keyof typeof photos;
