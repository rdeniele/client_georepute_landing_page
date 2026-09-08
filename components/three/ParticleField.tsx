"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme";
import { scene as sceneState } from "@/lib/sceneStore";
import { getSoftDot } from "./textures";

// Ambient dust: dusty lavender in dark mode, a quiet deep violet in light so
// it reads as fine graphite rather than neon once the canvas is multiplied.
const DUST = {
  light: new THREE.Color("#6a5aa8"),
  dark: new THREE.Color("#8fa2d6"),
};

/**
 * Ambient signal dust.
 *
 * Drift happens entirely in the vertex shader from a per-particle seed, so a
 * few thousand points cost one draw call and zero per-frame CPU work. Depth
 * fade does the atmospheric work a fog pass would otherwise charge for.
 */
const vert = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float s = aSeed * 6.2831;
    p.x += sin(uTime * 0.06 + s) * 0.55;
    p.y += cos(uTime * 0.05 + s * 1.7) * 0.45;
    p.z += sin(uTime * 0.04 + s * 2.3) * 0.55;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    // Dust must stay near the noise floor — it is atmosphere, not content.
    vAlpha = smoothstep(42.0, 6.0, depth) * (0.14 + 0.32 * aSeed);
    gl_PointSize = aSize * uPixelRatio * (25.0 / max(0.001, depth));
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function ParticleField({
  count,
  pixelRatio,
}: {
  count: number;
  pixelRatio: number;
}) {
  const { theme } = useTheme();
  const geom = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical shell, flattened vertically so the field reads as a volume
      // the camera travels through rather than a cloud it sits inside.
      const r = 9 + Math.pow(Math.random(), 0.5) * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.55;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      seed[i] = Math.random();
      size[i] = 1 + Math.random() * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uMap: { value: getSoftDot() },
      uColor: { value: DUST[theme].clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pixelRatio],
  );

  useEffect(() => {
    uniforms.uPixelRatio.value = pixelRatio;
  }, [pixelRatio, uniforms]);

  useEffect(() => {
    (uniforms.uColor.value as THREE.Color).copy(DUST[theme]);
  }, [theme, uniforms]);

  useEffect(() => () => geom.dispose(), [geom]);

  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    // A fast scroll briefly speeds up the drift and the field's own slow
    // rotation — dust reacting to the visitor's own motion, never louder
    // than that. sceneState.velocity is 0→1 and decays on its own in
    // CameraRig, so this needs no state of its own here.
    const kick = 1 + sceneState.velocity * 2.2;
    uniforms.uTime.value += dt * kick;
    if (ref.current) ref.current.rotation.y += dt * 0.006 * kick;
  });

  if (count === 0) return null;

  return (
    <points ref={ref} geometry={geom} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
