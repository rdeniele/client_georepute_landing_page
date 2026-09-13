"use client";

import { useEffect, useRef, useState } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Page-level motion for subpages, mounted once per page:
 * - `[data-spotlight]` cards get a pointer-following glow (fine pointers only)
 * - `[data-parallax="0.12"]` layers drift against scroll (transform only)
 * Both are skipped under reduced motion; parallax is also skipped on touch,
 * where scroll-linked movement reads as lag rather than depth.
 */
export function SubpageFx() {
  useEffect(() => {
    if (reduced()) return;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-spotlight]");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    if (fine) document.addEventListener("pointermove", onMove, { passive: true });

    const layers = fine ? [...document.querySelectorAll<HTMLElement>("[data-parallax]")] : [];
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of layers) {
        const r = el.parentElement?.getBoundingClientRect();
        if (!r || r.bottom < 0 || r.top > vh) continue;
        const speed = Number(el.dataset.parallax) || 0.1;
        const offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    if (layers.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      tick();
    }

    return () => {
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

/** Counts from 0 to `to` once, when it first scrolls into view. */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1100,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.textContent = format(to);
      return;
    }
    el.textContent = format(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(to * eased);
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}

/**
 * Sticky in-page navigation with a scroll-spy underline. The active link is
 * whichever section most recently crossed the upper third of the viewport.
 */
export function SubNav({ label, links }: { label: string; links: { id: string; label: string }[] }) {
  const [active, setActive] = useState(links[0]?.id);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [links]);

  useEffect(() => {
    const a = scroller.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!a || !scroller.current) return;
    const s = scroller.current;
    const left = a.offsetLeft - s.clientWidth / 2 + a.clientWidth / 2;
    s.scrollTo({ left, behavior: reduced() ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav className="kit-subnav" aria-label={`${label} sections`}>
      <div className="shell kit-subnav__inner">
        <span className="kit-subnav__label">{label}</span>
        <div className="kit-subnav__links" ref={scroller}>
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} data-id={l.id} aria-current={active === l.id ? "location" : undefined}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
