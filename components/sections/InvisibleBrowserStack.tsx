"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Section 02's product visual: a floating browser card, not a monitor or a
 * flat screenshot. A soft tinted mat sits behind a white window; the chrome
 * (traffic lights + address pill) owns its own header strip above the
 * screenshot rather than floating over it — the product screenshot already
 * has its own UI at the top edge, and chrome overlapping chrome read as a
 * mistake, not as an editorial layering.
 *
 * Shows the "Missed Prompts" / customer decision journey screen — the
 * clearest real-product proof of this section's claim: the four-stage
 * journey (Awareness, Research, Supplier Selection, Purchase) a business
 * never sees in conventional analytics.
 *
 * The card tilts a few degrees toward the cursor — capped small, skipped
 * under reduced motion or a coarse pointer.
 */
export function InvisibleBrowserStack({ locale = "en" }: { locale?: string }) {
  void locale;
  const cardRef = useRef<HTMLDivElement>(null);
  const shot = {
    src: "/screenshots/UI4.png",
    alt: "GeoRepute's Missed Prompts view: the four-stage customer decision journey — Awareness, Research, Supplier Selection, Purchase — and the questions your brand isn't showing up for.",
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1600px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`;
        raf = 0;
      });
    };
    const onLeave = () => {
      card.style.transform = "perspective(1600px) rotateX(0deg) rotateY(0deg)";
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="invis__photo browsercard">
      <div ref={cardRef} className="browsercard__mat">
        <div className="browsercard__window" style={{ aspectRatio: "1672 / 941" }}>
          <div className="browsercard__chrome" aria-hidden="true">
            <span className="browsercard__lights">
              <span className="browsercard__light browsercard__light--red" />
              <span className="browsercard__light browsercard__light--amber" />
              <span className="browsercard__light browsercard__light--green" />
            </span>
            <span className="browsercard__url">app.georepute.ai/decision-journey</span>
          </div>
          <div className="browsercard__imagewrap">
            {shot.src && (
              <Image
                className="browsercard__img"
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 1100px) 100vw, 46vw"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
