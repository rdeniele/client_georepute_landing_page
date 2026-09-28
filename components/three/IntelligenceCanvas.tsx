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
import { debugLog } from "@/lib/debugLog";

/**
 * Host for the persistent scene.
 *
 * One fixed canvas sits behind the entire document, the network is never
 * re-created between sections, so the camera traverse stays continuous and
 * there is only ever one WebGL context alive. Rendering stops entirely when
 * the tab is hidden, and DPR steps down if the frame budget slips.
 */
export function IntelligenceCanvas() {
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [dprScale, setDprScale] = useState(1);
  const [visible, setVisible] = useState(true);
  // Backgrounding a tab for a while is a common trigger for the GPU driver to
  // drop the WebGL context to reclaim memory. Left unhandled, the next frame
  // three.js tries to draw throws, and with no boundary above this that used
  // to take the whole page down to a blank screen on return. `lost` swaps to
  // the static, non-WebGL fallback the instant that happens; `canvasKey`
  // forces a full remount if the browser hands the context back, since every
  // buffer and texture on the old one is gone and nothing here re-uploads
  // them in place.
  const [lost, setLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    const detected = detectTier();
    debugLog(`canvas: tier=${detected}`);
    setTier(detected);

    const onVisibility = () => {
      debugLog(`canvas: visibilitychange hidden=${document.hidden}`);
      setVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // The browser's back/forward cache is a *different* lifecycle path than
    // visibilitychange: switching away and back can freeze the whole page
    // (JS paused, not unloaded) and restore it later without ever firing a
    // WebGL context-loss event, yet the canvas's drawing buffer is not
    // guaranteed to survive the freeze. A stale or corrupted buffer paints
    // as blank/black behind live content that is otherwise fine. `pageshow`
    // with `persisted: true` is the one reliable signal a bfcache restore
    // happened; force a full remount so three.js starts a clean context and
    // draws a real first frame instead of whatever the GPU kept, or didn't.
    const onPageShow = (e: PageTransitionEvent) => {
      debugLog(`canvas: pageshow persisted=${e.persisted}`);
      if (e.persisted) setCanvasKey((k) => k + 1);
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      disposeTextures();
    };
  }, []);

  // Logs which branch below is actually on screen, since that's the direct
  // visual state a screenshot shows: the empty loading placeholder, the
  // static fallback, or the live canvas.
  useEffect(() => {
    debugLog(`canvas: render tier=${tier} lost=${lost} visible=${visible} canvasKey=${canvasKey}`);
  }, [tier, lost, visible, canvasKey]);

  // Nothing renders until the tier is known, so no WebGL context is created
  // on machines that would only get the fallback anyway.
  if (tier === null) return <div className="scene-layer" aria-hidden="true" />;

  if (tier === "none" || lost) {
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
        key={canvasKey}
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
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          const onLost = (e: Event) => {
            // Required so the browser will attempt to hand the context back;
            // without it the loss is permanent for that canvas element.
            e.preventDefault();
            debugLog("canvas: webglcontextlost");
            setLost(true);
          };
          const onRestored = () => {
            debugLog("canvas: webglcontextrestored");
            setLost(false);
            setCanvasKey((k) => k + 1);
          };
          canvas.addEventListener("webglcontextlost", onLost, false);
          canvas.addEventListener("webglcontextrestored", onRestored, false);
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
