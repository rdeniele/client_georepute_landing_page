import * as THREE from "three";

/**
 * Procedural sprite textures.
 *
 * The scene's glow comes from additive sprites rather than a postprocessing
 * bloom pass — same look at a fraction of the GPU cost, and it keeps the
 * frame budget available for the network itself on mid-tier hardware.
 */

let softDot: THREE.Texture | null = null;
let ringDot: THREE.Texture | null = null;

function makeCanvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

/** Soft radial falloff — used for particles and node glow. */
export function getSoftDot(): THREE.Texture {
  if (softDot) return softDot;
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.72)");
  g.addColorStop(0.45, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  softDot = new THREE.CanvasTexture(c);
  softDot.colorSpace = THREE.SRGBColorSpace;
  return softDot;
}

/** Hard-cored dot with a thin ring — reads as an instrument marker, not a ball. */
export function getRingDot(): THREE.Texture {
  if (ringDot) return ringDot;
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext("2d")!;
  const mid = size / 2;

  const g = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.12, "rgba(255,255,255,0.55)");
  g.addColorStop(0.34, "rgba(255,255,255,0.06)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(mid, mid, mid * 0.62, 0, Math.PI * 2);
  ctx.stroke();

  ringDot = new THREE.CanvasTexture(c);
  ringDot.colorSpace = THREE.SRGBColorSpace;
  return ringDot;
}

export function disposeTextures() {
  softDot?.dispose();
  ringDot?.dispose();
  softDot = null;
  ringDot = null;
}
