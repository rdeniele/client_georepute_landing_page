/**
 * Still frame of the intelligence network.
 *
 * Shown to visitors who ask for reduced motion or whose device has no usable
 * WebGL context. It is the same idea rendered as a diagram rather than a
 * degraded version of the scene — the page never reads as broken, just quiet.
 */

const NODES: [number, number, number][] = [
  // x, y, radius
  [232, 214, 7],
  [418, 118, 5],
  [905, 176, 6.5],
  [1042, 366, 5],
  [846, 604, 7],
  [612, 690, 5.5],
  [318, 566, 6],
  [148, 412, 5],
  [724, 286, 4.5],
  [470, 430, 5.5],
];

const CX = 600;
const CY = 400;

function spoke([x, y]: [number, number, number]) {
  const mx = (x + CX) / 2;
  const my = (y + CY) / 2 - 46;
  return `M ${CX} ${CY} Q ${mx} ${my} ${x} ${y}`;
}

const PEERS: [number, number][] = [
  [0, 1],
  [1, 8],
  [8, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [9, 8],
];

export function StaticNetwork() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="static-network"
    >
      <defs>
        <radialGradient id="core-glow">
          <stop offset="0%" stopColor="var(--net-core)" stopOpacity="0.5" />
          <stop offset="45%" stopColor="var(--net-core)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--net-core)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="node-glow">
          <stop offset="0%" stopColor="var(--net-node)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--net-node)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={CX} cy={CY} r={340} fill="url(#core-glow)" />

      <g stroke="var(--net-stroke)" strokeOpacity="0.42" fill="none" strokeWidth="1">
        {NODES.map((n, i) => (
          <path key={`s${i}`} d={spoke(n)} />
        ))}
        {PEERS.map(([a, b], i) => (
          <line
            key={`p${i}`}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
            strokeOpacity="0.24"
          />
        ))}
      </g>

      {NODES.map(([x, y, r], i) => (
        <g key={`n${i}`}>
          <circle cx={x} cy={y} r={r * 4} fill="url(#node-glow)" opacity="0.35" />
          <circle cx={x} cy={y} r={r} fill="var(--net-node)" opacity="0.85" />
        </g>
      ))}

      <circle cx={CX} cy={CY} r={13} fill="var(--net-core)" opacity="0.9" />
      <circle
        cx={CX}
        cy={CY}
        r={30}
        fill="none"
        stroke="var(--net-node)"
        strokeOpacity="0.4"
      />
    </svg>
  );
}
