"use client";

import { useRef, type ReactNode } from "react";
import { SIGNUP_URL, TRY_OPEN_EVENT } from "@/lib/tryModal";

/**
 * Magnetic CTA.
 *
 * The button leans toward the cursor while hovered and settles back on exit.
 * Movement is capped small, it should register as responsiveness, not as a
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

  // External destinations open in a new tab so the visitor never loses their place on the page.
  // mailto: is excluded: it never navigates the page at all (it hands off to the OS mail app),
  // so target="_blank" only leaves a blank tab behind when no mail app is configured.
  const isNewTab = href.startsWith("http");

  // Sign-up CTAs open the "try it" modal first. The href stays on the anchor, so
  // modified clicks (new tab, copy link) and no-JS visitors still reach sign-up.
  const opensTryModal = href === SIGNUP_URL;
  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!opensTryModal || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.dispatchEvent(new Event(TRY_OPEN_EVENT));
  };

  return (
    <a
      ref={ref}
      href={href}
      target={isNewTab ? "_blank" : undefined}
      rel={isNewTab ? "noopener noreferrer" : undefined}
      className={`btn btn--${variant} ${className}`}
      onClick={open}
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
