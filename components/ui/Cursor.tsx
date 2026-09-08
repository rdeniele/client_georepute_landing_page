"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor.
 *
 * A dot tracks the pointer exactly; a ring trails it with a short spring lag
 * so the cursor reads as weighted rather than glued to the mouse. Hovering an
 * ordinary interactive element tightens the ring toward the dot; hovering
 * something marked `data-cursor="live"` (the intelligence graphs) opens it
 * into the rose "this reacted to you" state and surfaces its
 * `data-cursor-label`.
 *
 * Only ever mounted for a fine pointer with motion allowed — see the
 * `(pointer: fine)` guard in globals.css and the reduced-motion bail below.
 * Everything here is a transform, so the whole loop costs one style write a
 * frame regardless of page length.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const root = document.documentElement;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let raf = 0;
    let visible = false;

    // The native cursor only switches off once the replacement has a real
    // position to show — otherwise there is a gap between page load and the
    // first mouse move with no cursor drawn at all.
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        root.classList.add("has-custom-cursor");
        if (rootRef.current) rootRef.current.style.opacity = "1";
      }
    };

    const INTERACTIVE = "a, button, input, textarea, select, summary, [role='button']";

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor], " + INTERACTIVE,
      );
      const root = rootRef.current;
      if (!root) return;
      if (!el) {
        root.classList.remove("cursor--interactive", "cursor--live");
        return;
      }
      const kind = el.dataset.cursor;
      if (kind === "live") {
        root.classList.add("cursor--live");
        root.classList.remove("cursor--interactive");
        if (labelRef.current) {
          labelRef.current.textContent = el.dataset.cursorLabel ?? "Focus";
        }
      } else {
        root.classList.add("cursor--interactive");
        root.classList.remove("cursor--live");
      }
    };

    const onLeaveWindow = () => {
      if (rootRef.current) rootRef.current.style.opacity = "0";
      visible = false;
    };

    const tick = () => {
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);
    raf = requestAnimationFrame(tick);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("mouseleave", onLeaveWindow);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor" style={{ opacity: 0 }} aria-hidden="true">
      <div ref={ringRef} className="cursor__ring">
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
}
