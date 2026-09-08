/**
 * Imperative scene state.
 *
 * Scroll and pointer drive the 3D scene at 60fps. Routing that through React
 * state would re-render the tree on every frame, so the values live in a
 * plain mutable object: writers mutate it, `useFrame` reads it. Nothing here
 * ever triggers a render.
 */

export type SceneState = {
  /** 0→1 across the whole document */
  progress: number;
  /** Index of the section currently occupying the viewport */
  section: number;
  /** Normalised pointer, -1→1 on both axes, already damped */
  pointerX: number;
  pointerY: number;
  /** Raw pointer target; the frame loop eases pointerX/Y toward this */
  targetX: number;
  targetY: number;
  /** Engine node id being focused in section 06, or null */
  focusedEngine: string | null;
  /** Decision-graph node id being focused in section 08, or null */
  focusedGraphNode: string | null;
  /**
   * How fast the visitor is scrolling right now, 0→1 (already clamped).
   * Written by ScrollProvider on every Lenis tick, decayed toward 0 by
   * whichever `useFrame` loop reads it — there is deliberately no owner that
   * resets it, so the scene keeps reacting for a beat after scrolling stops
   * instead of snapping back.
   */
  velocity: number;
};

export const scene: SceneState = {
  progress: 0,
  section: 0,
  pointerX: 0,
  pointerY: 0,
  targetX: 0,
  targetY: 0,
  focusedEngine: null,
  focusedGraphNode: null,
  velocity: 0,
};

export type DeviceTier = "high" | "mid" | "low" | "none";

/**
 * Decides how much scene to build. Called once on mount — never per frame.
 * `none` means no WebGL at all: reduced-motion users and machines without a
 * usable context get the static fallback instead.
 */
export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "none";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "none";
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return "none";
  } catch {
    return "none";
  }

  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (w < 768 || (coarse && cores <= 4)) return "low";
  if (w < 1280 || cores <= 6) return "mid";
  return "high";
}

/** Scene budget per tier. Mobile keeps the concept, not the polygon count. */
export const TIER_BUDGET = {
  high: { particles: 2200, maxNodes: 14, dpr: 1.75 },
  mid: { particles: 1100, maxNodes: 12, dpr: 1.5 },
  low: { particles: 420, maxNodes: 9, dpr: 1.25 },
  none: { particles: 0, maxNodes: 0, dpr: 1 },
} as const;
