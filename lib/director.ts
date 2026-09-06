import * as THREE from "three";
import { NODES, NODE_INDEX, type NodeId } from "@/components/three/network";

/**
 * Choreography state shared by the DOM and the 3D scene.
 *
 * `sectionBeats` writes targets here from one page-wide scroll handler, and the
 * scene eases toward them every frame. Because the copy and the camera are both
 * read from the same scroll position, they cannot drift out of sync.
 *
 * Nothing in here is React state: it is mutated in place and read inside
 * `useFrame`.
 */

export type Beat = {
  /** The node that travels toward the viewer and becomes the subject */
  focus?: NodeId | null;
  /** 0→1, how far the focused node has travelled out of the network */
  focusAmount?: number;
  /** Nodes lit for this beat. Everything else recedes by `dim`. */
  activate?: readonly NodeId[];
  /** 0→1 how far unrelated network falls back */
  dim?: number;
  /** Where the camera should be, and what it should be looking at */
  cam?: { pos: [number, number, number]; look: [number, number, number] };
  /** Multiplier on how quickly the camera chases its target (1 = default) */
  urgency?: number;
};

export const director = {
  dim: 0,
  urgency: 1,
  /** Per-node target activation, indexed to `NODES` */
  activation: new Float32Array(NODES.length),
  /**
   * Per-node travel toward the viewer, 0→1, indexed to `NODES`.
   *
   * Deliberately an array rather than a single "focused index". With one shared
   * scalar the outgoing node's value drops to zero the instant the index
   * changes, so it teleports back into the network instead of easing home.
   * Per-node targets let the previous node walk back while the next one comes
   * forward — the handover is a crossfade, not a cut.
   */
  focus: new Float32Array(NODES.length),
  camPos: new THREE.Vector3(0, 1.6, 24),
  camLook: new THREE.Vector3(-0.5, 0, 0),
};

const _tmp = new THREE.Vector3();

export function applyBeat(beat: Beat) {
  director.dim = beat.dim ?? 0;
  director.urgency = beat.urgency ?? 1;

  director.focus.fill(0);
  if (beat.focus) {
    const i = NODE_INDEX[beat.focus];
    if (i !== undefined) director.focus[i] = beat.focusAmount ?? 1;
  }

  director.activation.fill(0);
  if (beat.activate) {
    for (const id of beat.activate) {
      const i = NODE_INDEX[id];
      if (i !== undefined) director.activation[i] = 1;
    }
  }

  if (beat.cam) {
    director.camPos.set(...beat.cam.pos);
    director.camLook.set(...beat.cam.look);
  }
}

const lerp = (x: number, y: number, k: number) => x + (y - x) * k;

/**
 * Blends two adjacent beats. `sectionBeats` calls this every scroll update with
 * the pair either side of the viewport centre, so the entire page is one
 * continuous interpolation rather than a series of cuts — and scrolling
 * backward retraces it exactly.
 */
export function blendBeats(a: Beat, b: Beat, t: number) {
  const k = Math.min(1, Math.max(0, t));

  const aAmt = a.focusAmount ?? 1;
  const bAmt = b.focusAmount ?? 1;

  // Focus cross-fades per node: the outgoing node eases home over exactly the
  // interval the incoming one uses to arrive. When both beats name the same
  // node the amounts interpolate directly, so it does not dip on the way past.
  director.focus.fill(0);
  if (a.focus && b.focus && a.focus === b.focus) {
    const i = NODE_INDEX[a.focus];
    if (i !== undefined) director.focus[i] = lerp(aAmt, bAmt, k);
  } else {
    if (a.focus) {
      const i = NODE_INDEX[a.focus];
      if (i !== undefined) director.focus[i] = aAmt * (1 - k);
    }
    if (b.focus) {
      const i = NODE_INDEX[b.focus];
      if (i !== undefined) director.focus[i] = Math.max(director.focus[i], bAmt * k);
    }
  }

  director.dim = lerp(a.dim ?? 0, b.dim ?? 0, k);
  director.urgency = lerp(a.urgency ?? 1, b.urgency ?? 1, k);

  // Activation cross-fades so edges light progressively. A node present in
  // BOTH beats stays fully lit across the whole blend — cross-fading it as
  // `max(1-k, k)` would dip it to 0.5 at the midpoint, making every node that
  // survives a transition visibly flicker on the way through.
  director.activation.fill(0);
  if (a.activate) {
    for (const id of a.activate) {
      const i = NODE_INDEX[id];
      if (i !== undefined) director.activation[i] = 1 - k;
    }
  }
  if (b.activate) {
    for (const id of b.activate) {
      const i = NODE_INDEX[id];
      if (i === undefined) continue;
      const inBoth = a.activate?.includes(id) ?? false;
      director.activation[i] = inBoth
        ? 1
        : Math.max(director.activation[i], k);
    }
  }

  if (a.cam && b.cam) {
    director.camPos.set(...a.cam.pos).lerp(_tmp.set(...b.cam.pos), k);
    director.camLook.set(...a.cam.look).lerp(_tmp.set(...b.cam.look), k);
  } else if (b.cam) {
    director.camPos.set(...b.cam.pos);
    director.camLook.set(...b.cam.look);
  } else if (a.cam) {
    director.camPos.set(...a.cam.pos);
    director.camLook.set(...a.cam.look);
  }
}
