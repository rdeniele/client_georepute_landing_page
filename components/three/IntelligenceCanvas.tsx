"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { detectTier, TIER_BUDGET, type DeviceTier } from "@/lib/sceneStore";
import { disposeTextures } from "./textures";
import { IntelligenceNetwork } from "./IntelligenceNetwork";
import { ParticleField } from "./ParticleField";
import { CameraRig } from "./CameraRig";
import { StaticNetwork } from "./StaticNetwork";

/**
 * Host for the persistent scene.
 *
 * One fixed canvas sits behind the entire document — the network is never
 * re-created between sections, so the camera traverse stays continuous and
 * there is only ever one WebGL context alive. Rendering stops entirely when
 * the tab is hidden, and DPR steps down if the frame budget slips.
 */
export function IntelligenceCanvas() {
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [dprScale, setDprScale] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setTier(detectTier());

    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      disposeTextures();
    };
  }, []);

  // Nothing renders until the tier is known, so no WebGL context is created
  // on machines that would only get the fallback anyway.
  if (tier === null) return <div className="scene-layer" aria-hidden="true" />;

  if (tier === "none") {
    return (
      <div className="scene-layer" aria-hidden="true">
        <StaticNetwork />
      </div>
    );
  }

  const budget = TIER_BUDGET[tier];
  const dpr = Math.min(
    budget.dpr,
    (typeof window !== "undefined" ? window.devicePixelRatio : 1) * dprScale,
  );

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        camera={{ fov: 46, near: 0.1, far: 90, position: [0, 1.6, 24] }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true,
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDprScale((s) => Math.max(0.65, s - 0.2))}
          onIncline={() => setDprScale((s) => Math.min(1, s + 0.1))}
        />
        <CameraRig />
        <ParticleField count={budget.particles} pixelRatio={dpr} />
        <IntelligenceNetwork maxNodes={budget.maxNodes} pixelRatio={dpr} />
      </Canvas>
    </div>
  );
}
