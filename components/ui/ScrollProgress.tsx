"use client";

import { useEffect, useRef } from "react";
import { scene } from "@/lib/sceneStore";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Instrument-style progress rail.
 *
 * Reads scroll position straight from the scene store on a rAF loop and
 * writes to the DOM — the component itself never re-renders while scrolling.
 */
export function ScrollProgress({ locale = "en" }: { locale?: string }) {
  const MARKS = getLocaleCopy(locale).scrollRail;
  const fill = useRef<HTMLSpanElement>(null);
  const marks = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 1100px)").matches) return;

    let raf = 0;
    let lastActive = -1;

    const tick = () => {
      if (fill.current) {
        fill.current.style.transform = `scaleY(${scene.progress})`;
      }
      if (marks.current && scene.section !== lastActive) {
        lastActive = scene.section;
        const items = marks.current.children;
        for (let i = 0; i < items.length; i++) {
          (items[i] as HTMLElement).dataset.active = String(i === lastActive);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <aside className="rail" aria-hidden="true">
      <span className="rail__track">
        <span ref={fill} className="rail__fill" />
      </span>
      <ol ref={marks} className="rail__marks">
        {MARKS.map((m, i) => (
          <li key={m} className="rail__mark" data-active={i === 0}>
            <span className="rail__dot" />
            <span className="rail__label">{m}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
