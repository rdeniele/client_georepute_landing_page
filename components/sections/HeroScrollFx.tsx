"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero → content handoff.
 *
 * The load-in stagger (`hero-in` in ui.css) owns the hero's entrance and is
 * untouched by this. This owns what happens on the way *out*: as the visitor
 * scrolls past the hero, the whole argument compresses and lifts rather than
 * simply scrolling off — the same kind of cinematic exit the 3D camera is
 * already doing underneath it (see sectionBeats.ts), so headline and scene
 * read as one continuous push rather than two unrelated systems.
 *
 * Scrubbed to scroll position (not time-based), and it only ever touches
 * `.hero__shell` as a whole — never the individually staggered children —
 * so it can never race the entrance animation for control of the same
 * inline style.
 */
export function HeroScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const shell = document.querySelector<HTMLElement>(".hero__shell");
    const stage = document.querySelector<HTMLElement>("#top");
    if (!shell || !stage) return;

    gsap.set(shell, { transformOrigin: "50% 0%" });

    const tween = gsap.to(shell, {
      scale: 0.92,
      y: -28,
      opacity: 0.35,
      ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(shell, { clearProps: "transform,opacity,transformOrigin" });
    };
  }, []);

  return null;
}
