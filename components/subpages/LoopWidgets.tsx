"use client";

import { useEffect, useState } from "react";

/**
 * The sticky PDCA ring beside the four phases. The quadrant for whichever
 * phase is crossing the middle of the viewport lights up; clicking a quadrant
 * jumps to that phase.
 */
export function PhaseRing({ phases }: { phases: { key: string; name: string }[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = phases.map((p) => document.getElementById(`phase-${p.key}`)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [phases]);

  const r = 88;
  const c = 110;
  const arc = (i: number) => {
    const a0 = ((-90 + i * 90 + 4) * Math.PI) / 180;
    const a1 = ((-90 + (i + 1) * 90 - 4) * Math.PI) / 180;
    return `M ${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)}`;
  };

  return (
    <div className="hiw-ring">
      <svg viewBox="0 0 220 220" aria-hidden="true">
        {phases.map((p, i) => (
          <path key={p.key} d={arc(i)} className={`hiw-ring__arc${i === active ? " is-on" : ""}${i < active ? " is-done" : ""}`} />
        ))}
      </svg>
      <div className="hiw-ring__core" aria-live="polite">
        <span className="kit-mono">Phase {String(active + 1).padStart(2, "0")}</span>
        <b>{phases[active].name}</b>
      </div>
      {phases.map((p, i) => {
        const a = ((-45 + i * 90) * Math.PI) / 180;
        return (
          <a
            key={p.key}
            href={`#phase-${p.key}`}
            className={`hiw-ring__label${i === active ? " is-on" : ""}`}
            style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
          >
            {p.name}
          </a>
        );
      })}
    </div>
  );
}

/** Cycles the "sometimes that requires…" words, pausing on hover/focus. */
export function Sometimes({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => window.clearInterval(t);
  }, [paused, words.length]);

  return (
    <div
      className="hiw-sometimes"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <span className="hiw-sometimes__lead">Sometimes that requires</span>
      <span className="hiw-sometimes__word" aria-live="polite">
        <span key={i} className="kit-swap">
          {words[i].toLowerCase()}.
        </span>
      </span>
      <ul className="hiw-sometimes__all">
        {words.map((w, n) => (
          <li key={w}>
            <button type="button" aria-pressed={n === i} onClick={() => setI(n)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
              {w}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
