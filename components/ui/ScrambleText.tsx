"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * A short label that decodes into its real value once it enters view —
 * every `<span className="sec-head__index">02</span>` in the page becomes
 * this. Deliberately reserved for two-to-three character index badges: long
 * enough to read as "resolving," short enough that the churn settles in a
 * few hundred milliseconds instead of reading as a gimmick.
 *
 * Falls back to the plain value under reduced motion, and the DOM always
 * carries the real text server-side (`text`, via `suppressHydrationWarning`)
 * so nothing depends on this running to be readable.
 */
export function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let frame = 0;
    const totalFrames = 14;

    const step = () => {
      frame++;
      const reveal = Math.floor((frame / totalFrames) * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal) out += text[i];
        else if (/\s/.test(text[i])) out += text[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      if (frame < totalFrames) raf = requestAnimationFrame(step);
      else setDisplay(text);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {display}
    </span>
  );
}
