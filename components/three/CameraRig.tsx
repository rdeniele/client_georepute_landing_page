"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene as sceneState } from "@/lib/sceneStore";
import { director } from "@/lib/director";

/**
 * The camera follows the director rather than raw scroll.
 *
 * Sections declare where the camera should be for their beat; this eases
 * toward that pose every frame so arrivals settle instead of snapping, and
 * scrubbing backward retraces the same path. Pointer adds a small parallax on
 * top — enough to feel alive, never enough to compete with the copy.
 */
export function CameraRig() {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useRef(new THREE.Vector3(-0.5, 0, 0));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);

    sceneState.pointerX += (sceneState.targetX - sceneState.pointerX) * dt * 2.4;
    sceneState.pointerY += (sceneState.targetY - sceneState.pointerY) * dt * 2.4;

    // Sole owner of the velocity decay — ScrollProvider only ever pushes it
    // up, so it has to relax back to 0 somewhere once scrolling stops.
    sceneState.velocity *= Math.max(0, 1 - dt * 2.6);

    target.copy(director.camPos);
    target.x += sceneState.pointerX * 0.7;
    target.y += -sceneState.pointerY * 0.45;

    // Frame-rate independent easing. `urgency` lets a beat arrive faster
    // without the whole page feeling twitchy.
    const k = 1 - Math.exp(-dt * 1.9 * director.urgency);
    camera.position.lerp(target, k);
    look.current.lerp(director.camLook, k);
    camera.lookAt(look.current);
  });

  return null;
}
