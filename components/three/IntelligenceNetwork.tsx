"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene as sceneState } from "@/lib/sceneStore";
import { director } from "@/lib/director";
import {
  buildLinkGeometry,
  buildNetwork,
  updateLinkActivation,
  updateLinkPositions,
} from "./network";
import { getRingDot, getSoftDot } from "./textures";

const SIGNAL = new THREE.Color("#a78bfa");
const SIGNAL_CORE = new THREE.Color("#7b3aec");
const HAIRLINE = new THREE.Color("#46527a");

const linkVert = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  attribute float aActive;
  varying float vT;
  varying float vSeed;
  varying float vActive;
  varying float vDepth;
  void main() {
    vT = aT; vSeed = aSeed; vActive = aActive;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const linkFrag = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uDim;
  uniform vec3 uSignal;
  uniform vec3 uHairline;
  varying float vT;
  varying float vSeed;
  varying float vActive;
  varying float vDepth;

  void main() {
    // Idle edges are a thin technical rule; active edges carry real traffic.
    float base = mix(0.085 * (1.0 - uDim * 0.75), 0.30, vActive);

    // The travelling packet only runs on edges a signal is actually using,
    // so movement in the scene always means something is being carried.
    float speed = 0.16 + vSeed * 0.12;
    float head = fract(uTime * speed + vSeed * 7.13);
    float d = abs(vT - head);
    d = min(d, 1.0 - d);
    float pulse = smoothstep(0.09, 0.0, d) * vActive;

    float depthFade = smoothstep(38.0, 4.0, vDepth);
    vec3 col = mix(uHairline, uSignal, max(vActive * 0.75, pulse));
    float alpha = (base + pulse * 0.85) * depthFade;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const nodeVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute float aActive;
  attribute float aFocus;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vActive;
  varying float vFocus;
  void main() {
    vActive = aActive;
    vFocus = aFocus;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = 0.88 + 0.12 * sin(uTime * 1.3 + aSeed * 6.2831);
    // Active nodes grow; the focused node grows further still
    float scale = 1.0 + aActive * 0.55 + aFocus * 1.1;
    gl_PointSize = aSize * pulse * scale * uPixelRatio * (34.0 / max(0.001, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const nodeFrag = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  uniform vec3 uSignal;
  uniform vec3 uHairline;
  uniform float uDim;
  varying float vActive;
  varying float vFocus;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float lit = max(vActive, vFocus);
    // Dormant nodes sit near the noise floor so an activation really reads
    float alpha = mix(0.34 * (1.0 - uDim * 0.7), 1.0, lit) * tex.a;
    if (alpha < 0.004) discard;
    vec3 col = mix(uHairline, uSignal, lit);
    gl_FragColor = vec4(col, alpha);
  }
`;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function IntelligenceNetwork({
  maxNodes,
  pixelRatio,
}: {
  maxNodes: number;
  pixelRatio: number;
}) {
  const { camera } = useThree();

  const { nodes, links } = useMemo(() => buildNetwork(maxNodes), [maxNodes]);
  const linkGeom = useMemo(() => buildLinkGeometry(links), [links]);

  const nodeGeom = useMemo(() => {
    const n = nodes.length;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(n * 3), 3),
    );
    g.setAttribute(
      "aSize",
      new THREE.BufferAttribute(
        new Float32Array(nodes.map((d) => 8 + d.def.weight * 6)),
        1,
      ),
    );
    g.setAttribute(
      "aSeed",
      new THREE.BufferAttribute(new Float32Array(nodes.map((d) => d.seed)), 1),
    );
    g.setAttribute("aActive", new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setAttribute("aFocus", new THREE.BufferAttribute(new Float32Array(n), 1));
    return g;
  }, [nodes]);

  const coreGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3),
    );
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([54]), 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array([0.2]), 1));
    g.setAttribute("aActive", new THREE.BufferAttribute(new Float32Array([1]), 1));
    g.setAttribute("aFocus", new THREE.BufferAttribute(new Float32Array([0]), 1));
    return g;
  }, []);

  const linkUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDim: { value: 0 },
      uSignal: { value: SIGNAL },
      uHairline: { value: HAIRLINE },
    }),
    [],
  );

  const nodeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uMap: { value: getRingDot() },
      uSignal: { value: SIGNAL },
      uHairline: { value: HAIRLINE },
      uDim: { value: 0 },
    }),
    [pixelRatio],
  );

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uMap: { value: getSoftDot() },
      uSignal: { value: SIGNAL_CORE },
      uHairline: { value: SIGNAL_CORE },
      uDim: { value: 0 },
    }),
    [pixelRatio],
  );

  useEffect(() => {
    nodeUniforms.uPixelRatio.value = pixelRatio;
    coreUniforms.uPixelRatio.value = pixelRatio;
  }, [pixelRatio, nodeUniforms, coreUniforms]);

  useEffect(
    () => () => {
      linkGeom.dispose();
      nodeGeom.dispose();
      coreGeom.dispose();
    },
    [linkGeom, nodeGeom, coreGeom],
  );

  // Eased mirrors of the director's targets — the scene never snaps
  const act = useMemo(() => new Float32Array(nodes.length), [nodes.length]);
  const focusAmt = useMemo(() => new Float32Array(nodes.length), [nodes.length]);
  const dimEase = useRef(0);
  const linkAct = useMemo(() => new Float32Array(links.length), [links.length]);
  const lastLinkAct = useRef(-1);
  const worldPos = useMemo(
    () => nodes.map(() => new THREE.Vector3()),
    [nodes],
  );

  const stage = useMemo(() => new THREE.Vector3(), []);
  const fwd = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = (linkUniforms.uTime.value += dt);
    nodeUniforms.uTime.value = t;
    coreUniforms.uTime.value = t;

    const k = 1 - Math.exp(-dt * 3.4);
    const p = sceneState.progress;

    // The network resolves from dispersed to causal as the page is read
    const morph = smoothstep(0.05, 0.72, p);

    dimEase.current += (director.dim - dimEase.current) * k;
    linkUniforms.uDim.value = dimEase.current;
    nodeUniforms.uDim.value = dimEase.current;

    // Where a focused node travels to: a point in front of the camera, taken
    // from the camera's ACTUAL pose rather than the director's target. Using
    // the target makes a node fly toward somewhere the camera has not reached
    // yet, which reads as the node darting off on its own.
    camera.getWorldDirection(fwd);
    stage.copy(camera.position).addScaledVector(fwd, 7.2);

    const pos = nodeGeom.getAttribute("position") as THREE.BufferAttribute;
    const aActive = nodeGeom.getAttribute("aActive") as THREE.BufferAttribute;
    const aFocus = nodeGeom.getAttribute("aFocus") as THREE.BufferAttribute;

    for (let i = 0; i < nodes.length; i++) {
      act[i] += (director.activation[i] - act[i]) * k;

      const n = nodes[i];
      const v = worldPos[i];
      v.copy(n.home).lerp(n.resolved, morph);

      // Gentle idle drift so the network breathes without spinning
      v.y += Math.sin(t * 0.35 + n.seed * 6.28) * 0.12;

      focusAmt[i] += (director.focus[i] - focusAmt[i]) * k;
      const f = focusAmt[i];
      if (f > 0.001) v.lerp(stage, f);

      pos.setXYZ(i, v.x, v.y, v.z);
      aActive.setX(i, act[i]);
      aFocus.setX(i, f);
    }
    pos.needsUpdate = true;
    aActive.needsUpdate = true;
    aFocus.needsUpdate = true;

    updateLinkPositions(linkGeom, links, worldPos);

    // An edge is live only when both of its endpoints are
    let sum = 0;
    for (let li = 0; li < links.length; li++) {
      const v = Math.min(act[links[li].a], act[links[li].b]);
      linkAct[li] = v;
      sum += v;
    }
    if (Math.abs(sum - lastLinkAct.current) > 0.002) {
      updateLinkActivation(linkGeom, linkAct, links.length);
      lastLinkAct.current = sum;
    }
  });

  return (
    <group>
      <lineSegments geometry={linkGeom} frustumCulled={false}>
        <shaderMaterial
          vertexShader={linkVert}
          fragmentShader={linkFrag}
          uniforms={linkUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points geometry={nodeGeom} frustumCulled={false}>
        <shaderMaterial
          vertexShader={nodeVert}
          fragmentShader={nodeFrag}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points geometry={coreGeom} frustumCulled={false}>
        <shaderMaterial
          vertexShader={nodeVert}
          fragmentShader={nodeFrag}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
