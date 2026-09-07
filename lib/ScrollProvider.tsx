"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scene } from "./sceneStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns scroll for the whole page.
 *
 * Lenis smooths the scroll, GSAP's ticker drives it, and ScrollTrigger is
 * told to read position from Lenis so section triggers and the 3D camera stay
 * on the same clock. Scroll progress and pointer are written straight into the
 * scene store — the React tree is never re-rendered by either.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    const onGsapTick = (time: number) => lenis?.raf(time * 1000);

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        // Long, settling ease-out — the page should feel weighted, not springy
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onGsapTick);
      gsap.ticker.lagSmoothing(0);
    }

    // --- Global scroll progress ------------------------------------------
    const progressTrigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scene.progress = self.progress;
      },
    });

    // --- Which section owns the viewport ---------------------------------
    // Also publishes the owning section's band tone on <html>, because the
    // fixed chrome (the scroll rail) sits outside every band and cannot
    // inherit its tokens — on a colour band its dark ink would vanish.
    const root = document.documentElement;
    const sectionTriggers = gsap.utils
      .toArray<HTMLElement>("[data-section]")
      .map((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (!self.isActive) return;
            scene.section = i;
            root.dataset.band =
              el.classList.contains("band--color") ||
              el.classList.contains("band--split")
                ? "color"
                : "default";
          },
        }),
      );

    // --- Pointer parallax target -----------------------------------------
    const onPointer = (e: PointerEvent) => {
      scene.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      scene.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Fonts change layout height; recalculate once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("pointermove", onPointer);
      progressTrigger.kill();
      sectionTriggers.forEach((t) => t.kill());
      delete root.dataset.band;
      if (lenis) {
        gsap.ticker.remove(onGsapTick);
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
