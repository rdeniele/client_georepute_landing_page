"use client";

import { useRef, type ReactNode } from "react";

/**
 * Magnetic CTA.
 *
 * The button leans toward the cursor while hovered and settles back on exit.
 * Movement is capped small — it should register as responsiveness, not as a
 * toy. Transform only, and the whole effect is skipped under reduced motion.
 */
export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "conversion";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.transform = `translate3d(${dx * 9}px, ${dy * 6}px, 0)`;
    if (inner.current) {
      inner.current.style.transform = `translate3d(${dx * 4}px, ${dy * 3}px, 0)`;
    }
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
    if (inner.current) inner.current.style.transform = "";
  };

  return (
    <a
      ref={ref}
      href={href}
      className={`btn btn--${variant} ${className}`}
      onPointerMove={move}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <span ref={inner} className="btn__inner">
        <span className="btn__label">{children}</span>
        <svg
          className="btn__arrow"
          viewBox="0 0 16 16"
          width="15"
          height="15"
          aria-hidden="true"
        >
          <path
            d="M2 8h11M9 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
