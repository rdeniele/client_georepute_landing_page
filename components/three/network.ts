import * as THREE from "three";

/**
 * The intelligence network's cast.
 *
 * Every node is a named participant in how a commercial decision actually
 * forms, and every edge is a real causal relationship — not decoration. The
 * chain reads question → intent → interpretation → evidence → authority →
 * recommendation → decision → outcome, with context systems feeding in from
 * depth. Sections activate individual nodes and pull them toward the viewer,
 * so the graph has to mean something before the choreography can explain
 * anything.
 */

export type NodeId =
  | "question"
  | "intent"
  | "interpretation"
  | "evidence"
  | "authority"
  | "competitors"
  | "recommendation"
  | "decision"
  | "outcome"
  | "recognition"
  | "search"
  | "reputation"
  | "content"
  | "market";

export type NodeDef = {
  id: NodeId;
  label: string;
  /** Dispersed position — how the environment looks before it is understood */
  home: [number, number, number];
  /** Resolved position — the clean causal arc the page resolves toward */
  resolved: [number, number, number];
  /** Chain nodes carry the decision; context nodes feed it from depth */
  role: "chain" | "context";
  /** Relative visual weight */
  weight: number;
};

/**
 * Ordered so the causal chain occupies indices 0-8. Section choreography
 * relies on that ordering to sweep along the decision path.
 */
export const NODES: NodeDef[] = [
  // --- the decision path, left to right -----------------------------------
  { id: "question", label: "Question", home: [-10.6, 2.4, 3.4], resolved: [-9.6, 1.2, 1.8], role: "chain", weight: 1.15 },
  { id: "intent", label: "Customer Intent", home: [-7.4, -2.1, -1.6], resolved: [-6.9, -0.6, 0.4], role: "chain", weight: 1.1 },
  { id: "interpretation", label: "AI Interpretation", home: [-3.2, 2.9, 2.2], resolved: [-3.7, 1.0, -0.9], role: "chain", weight: 1.2 },
  { id: "evidence", label: "Evidence", home: [-0.2, -3.1, -2.4], resolved: [-0.6, -1.2, 0.8], role: "chain", weight: 1.15 },
  { id: "authority", label: "Authority", home: [2.9, 2.6, -3.1], resolved: [2.2, 0.9, -0.6], role: "chain", weight: 1.1 },
  { id: "competitors", label: "Competitors", home: [1.6, -3.4, 3.6], resolved: [2.0, -2.3, 2.4], role: "chain", weight: 1.05 },
  { id: "recommendation", label: "Recommendation", home: [5.8, 1.9, 2.8], resolved: [5.2, -0.2, -0.4], role: "chain", weight: 1.2 },
  { id: "decision", label: "Decision", home: [8.9, -2.4, -2.2], resolved: [8.0, 1.1, 0.6], role: "chain", weight: 1.3 },
  { id: "outcome", label: "Outcome", home: [11.4, 1.6, 3.1], resolved: [10.6, -0.8, -1.3], role: "chain", weight: 1.1 },

  // --- context systems, held further back in depth -------------------------
  { id: "recognition", label: "AI Recognition", home: [-5.6, 4.2, -5.4], resolved: [-5.0, 3.2, -4.5], role: "context", weight: 0.9 },
  { id: "search", label: "Search", home: [-2.4, -4.6, -4.2], resolved: [-1.8, -3.4, -3.8], role: "context", weight: 0.85 },
  { id: "reputation", label: "Reputation", home: [4.2, 4.1, -5.0], resolved: [3.6, 3.0, -4.2], role: "context", weight: 0.85 },
  { id: "content", label: "Content", home: [-4.8, -4.0, 4.4], resolved: [-4.2, -3.0, 3.2], role: "context", weight: 0.8 },
  { id: "market", label: "Market", home: [8.2, -3.8, -4.6], resolved: [7.4, -2.8, -3.6], role: "context", weight: 0.85 },
];

export const NODE_INDEX = Object.fromEntries(
  NODES.map((n, i) => [n.id, i]),
) as Record<NodeId, number>;

export function nodeIndex(id: NodeId) {
  return NODE_INDEX[id];
}

/**
 * Deliberate edges only. Each one is a claim about causality, which is what
 * lets the scene argue that a decision is assembled rather than clicked.
 */
export const EDGES: [NodeId, NodeId][] = [
  ["question", "intent"],
  ["intent", "interpretation"],
  ["interpretation", "evidence"],
  ["evidence", "authority"],
  ["authority", "recommendation"],
  ["competitors", "recommendation"],
  ["recommendation", "decision"],
  ["decision", "outcome"],
  // context feeding the chain
  ["recognition", "interpretation"],
  ["search", "evidence"],
  ["content", "evidence"],
  ["reputation", "authority"],
  ["market", "competitors"],
  ["evidence", "competitors"],
  // the loop back — an outcome changes the market it came from
  ["outcome", "market"],
];

export type NetworkNode = {
  def: NodeDef;
  home: THREE.Vector3;
  resolved: THREE.Vector3;
  seed: number;
};

export type NetworkLink = { a: number; b: number; seed: number };

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function buildNetwork(maxNodes: number) {
  // Chain nodes are never dropped — the causal story has to survive on the
  // smallest device. Context nodes are what a reduced budget gives up.
  const chain = NODES.filter((n) => n.role === "chain");
  const context = NODES.filter((n) => n.role === "context");
  const kept = [...chain, ...context.slice(0, Math.max(0, maxNodes - chain.length))];
  const keptIds = new Set(kept.map((n) => n.id));

  const nodes: NetworkNode[] = kept.map((def, i) => ({
    def,
    home: new THREE.Vector3(...def.home),
    resolved: new THREE.Vector3(...def.resolved),
    seed: hash(i),
  }));

  const indexOf = new Map(kept.map((n, i) => [n.id, i]));

  const links: NetworkLink[] = EDGES.filter(
    ([a, b]) => keptIds.has(a) && keptIds.has(b),
  ).map(([a, b], i) => ({
    a: indexOf.get(a)!,
    b: indexOf.get(b)!,
    seed: hash(i + 91),
  }));

  return { nodes, links };
}

const SAMPLES = 22;

/**
 * All edges flattened into one LineSegments geometry — the whole network is a
 * single draw call. `aT` carries position along the edge so the travelling
 * signal runs in the shader, and `aLink` lets per-edge activation be uploaded
 * as a small attribute rather than rebuilt geometry.
 */
export function buildLinkGeometry(links: NetworkLink[]) {
  const segs = SAMPLES - 1;
  const vertsPerLink = segs * 2;
  const total = links.length * vertsPerLink;

  const position = new Float32Array(total * 3);
  const aT = new Float32Array(total);
  const aSeed = new Float32Array(total);
  const aLink = new Float32Array(total);
  const aActive = new Float32Array(total);

  links.forEach((link, li) => {
    for (let s = 0; s < segs; s++) {
      for (let e = 0; e < 2; e++) {
        const vi = li * vertsPerLink + s * 2 + e;
        aT[vi] = (s + e) / segs;
        aSeed[vi] = link.seed;
        aLink[vi] = li;
      }
    }
  });

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geom.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  geom.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  geom.setAttribute("aLink", new THREE.BufferAttribute(aLink, 1));
  geom.setAttribute("aActive", new THREE.BufferAttribute(aActive, 1));
  geom.userData.segs = segs;
  geom.userData.vertsPerLink = vertsPerLink;

  return geom;
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _ctrl = new THREE.Vector3();
const _p = new THREE.Vector3();

/** Rewrites edge positions from the current node positions. */
export function updateLinkPositions(
  geom: THREE.BufferGeometry,
  links: NetworkLink[],
  positions: THREE.Vector3[],
) {
  const attr = geom.getAttribute("position") as THREE.BufferAttribute;
  const arr = attr.array as Float32Array;
  const segs = geom.userData.segs as number;
  const vertsPerLink = geom.userData.vertsPerLink as number;

  for (let li = 0; li < links.length; li++) {
    _a.copy(positions[links[li].a]);
    _b.copy(positions[links[li].b]);

    // A shallow lift only. Anything more and the edges bow into a cage.
    _ctrl.addVectors(_a, _b).multiplyScalar(0.5);
    _ctrl.y += 0.22;

    for (let s = 0; s < segs; s++) {
      for (let e = 0; e < 2; e++) {
        const t = (s + e) / segs;
        const it = 1 - t;
        _p.set(0, 0, 0)
          .addScaledVector(_a, it * it)
          .addScaledVector(_ctrl, 2 * it * t)
          .addScaledVector(_b, t * t);

        const vi = (li * vertsPerLink + s * 2 + e) * 3;
        arr[vi] = _p.x;
        arr[vi + 1] = _p.y;
        arr[vi + 2] = _p.z;
      }
    }
  }

  attr.needsUpdate = true;
}

/** Uploads per-edge activation without touching geometry. */
export function updateLinkActivation(
  geom: THREE.BufferGeometry,
  linkActivation: Float32Array,
  linkCount: number,
) {
  const attr = geom.getAttribute("aActive") as THREE.BufferAttribute;
  const arr = attr.array as Float32Array;
  const vertsPerLink = geom.userData.vertsPerLink as number;

  for (let li = 0; li < linkCount; li++) {
    const v = linkActivation[li];
    const start = li * vertsPerLink;
    for (let k = 0; k < vertsPerLink; k++) arr[start + k] = v;
  }
  attr.needsUpdate = true;
}
