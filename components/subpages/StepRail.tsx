"use client";

import { useEffect, useState } from "react";

/**
 * Sticky progress rail for long, numbered walkthroughs. Tracks which step is
 * crossing the middle of the viewport and fills the rail up to it.
 */
export function StepRail({ steps }: { steps: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = steps.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [steps]);

  return (
    <nav className="steprail" aria-label="Reconstruction steps">
      <span className="steprail__progress" aria-hidden="true">
        <i style={{ transform: `scaleY(${(active + 1) / steps.length})` }} />
      </span>
      <ol>
        {steps.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={i === active ? "step" : undefined} data-done={i < active || undefined}>
              <span className="steprail__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="steprail__label">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
