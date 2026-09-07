/**
 * The intelligence layer, drawn inside a band.
 *
 * The persistent WebGL network reads as violet ink on the page's light bands,
 * which is where it looks strongest. It cannot also read on top of a saturated
 * brand-colour plate — the plate is painted above the fixed canvas — so colour
 * bands carry this SVG counterpart instead: the same node/edge vocabulary,
 * inverted to luminous white-on-purple.
 *
 * `bridge` anchors the leftmost edges to x=0 so the network reads as
 * continuing out of an adjacent photograph rather than starting at the plate.
 * That is the whole conceptual move: the real world on one side, the invisible
 * layer it sits inside on the other.
 *
 * Coordinates are fixed, so this renders identically on the server and client
 * and costs nothing per frame — the travelling signals are CSS keyframes on
 * `stroke-dashoffset` of short dashes, not a rAF loop.
 */

type Node = { x: number; y: number; r: number; lit?: boolean };

const NODES: Node[] = [
  { x: 96, y: 214, r: 3.2 },
  { x: 214, y: 96, r: 2.4 },
  { x: 258, y: 330, r: 4.6, lit: true },
  { x: 392, y: 178, r: 3 },
  { x: 470, y: 402, r: 2.6 },
  { x: 556, y: 258, r: 6.2, lit: true },
  { x: 636, y: 84, r: 2.8 },
  { x: 704, y: 372, r: 3.4 },
  { x: 828, y: 196, r: 4.8, lit: true },
  { x: 902, y: 428, r: 2.6 },
  { x: 990, y: 118, r: 3 },
  { x: 1046, y: 306, r: 3.6 },
  { x: 1148, y: 220, r: 2.4 },
];

/** Every edge is a causal hop, not decoration — indices into NODES. */
const EDGES: [number, number][] = [
  [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6], [5, 7],
  [6, 8], [7, 8], [8, 10], [8, 11], [9, 11], [10, 12], [11, 12], [7, 9],
];

/** Edges that run off the left edge of the plate, toward the photograph. */
const BRIDGE: [number, number][] = [
  [0, 96], [0, 214],
  [0, 330], [0, 258],
  [0, 96], [0, 402],
];

export function BandNetwork({
  bridge = false,
  className = "",
}: {
  bridge?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`bandnet ${className}`}
      viewBox="0 0 1200 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {bridge &&
        BRIDGE.map(([x0, y0], i) => {
          const target = NODES[i % 4];
          return (
            <line
              key={`b${i}`}
              className="bandnet__edge bandnet__edge--bridge"
              x1={x0}
              y1={y0}
              x2={target.x}
              y2={target.y}
              style={{ "--d": `${i * 0.42}s` } as React.CSSProperties}
            />
          );
        })}

      {EDGES.map(([a, b], i) => (
        <line
          key={`e${i}`}
          className="bandnet__edge"
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
        />
      ))}

      {/* Signals travel only on the causal spine, so movement always means
          something is actually being carried. */}
      {[[2, 3], [3, 5], [5, 7], [7, 8], [8, 11], [11, 12]].map(([a, b], i) => (
        <line
          key={`p${i}`}
          className="bandnet__pulse"
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          style={{ "--d": `${i * 0.9}s` } as React.CSSProperties}
        />
      ))}

      {NODES.map((n, i) => (
        <circle
          key={`n${i}`}
          className={`bandnet__node ${n.lit ? "is-lit" : ""}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          style={{ "--d": `${(i % 5) * 0.7}s` } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}
