"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Reusable product-screenshot card: a soft tinted mat behind a white browser
 * window, traffic lights + URL pill floating over the screenshot. Mirrors the
 * hero's `.browsercard` treatment (see InvisibleBrowserStack) so every real
 * product shot on the page reads as one consistent object rather than a
 * dropped-in image.
 *
 * `ratio` should match the source image's natural aspect ratio — the window
 * sizes to it directly, so `object-fit: cover` never has to crop.
 */
export function ProductShot({
  src,
  alt,
  url,
  ratio,
  size = "default",
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  url: string;
  ratio: string;
  size?: "default" | "wide";
  priority?: boolean;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

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
        card.style.transform = `perspective(1700px) rotateX(${py * -2.2}deg) rotateY(${px * 3}deg)`;
        raf = 0;
      });
    };
    const onLeave = () => {
      card.style.transform = "perspective(1700px) rotateX(0deg) rotateY(0deg)";
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
    <div className={`shotcard ${size === "wide" ? "shotcard--wide" : ""} ${className}`}>
      <div ref={cardRef} className="shotcard__mat">
        <div className="shotcard__window" style={{ aspectRatio: ratio }}>
          <div className="shotcard__chrome" aria-hidden="true">
            <span className="shotcard__lights">
              <span className="shotcard__light shotcard__light--red" />
              <span className="shotcard__light shotcard__light--amber" />
              <span className="shotcard__light shotcard__light--green" />
            </span>
            <span className="shotcard__url">{url}</span>
          </div>
          <div className="shotcard__imagewrap">
            <Image
              className="shotcard__img"
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 60vw, 640px"
              priority={priority}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
