"use client";

import { useEffect, useState } from "react";
import { methodology } from "@/lib/subpages/copy";

const DEFAULTS = methodology.vectors.map((v) => v.score);

/**
 * The Decision Health Index is published as a formula so it can be recomputed
 * independently, this lets the visitor do exactly that.
 */
export function IndexCalculator() {
  const [scores, setScores] = useState<number[]>(DEFAULTS);
  const dhi = methodology.vectors.reduce((s, v, i) => s + v.weight * scores[i], 0);
  const changed = scores.some((s, i) => s !== DEFAULTS[i]);
  const binding = methodology.vectors.reduce((best, v, i) =>
    v.weight * (100 - scores[i]) > best.gap ? { name: v.name, gap: v.weight * (100 - scores[i]) } : best,
  { name: "", gap: -1 });

  return (
    <div className="meth-calc">
      <div className="meth-calc__vectors">
        {methodology.vectors.map((v, i) => (
          <label key={v.name} className="meth-vec" style={{ ["--w" as string]: v.weight / 0.3 }}>
            <span className="meth-vec__head">
              <b>{v.name}</b>
              <span className="meth-vec__weight">× {v.weight}</span>
              <output className="kit-num">{scores[i]}</output>
            </span>
            <span className="meth-vec__body">{v.body}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={scores[i]}
              onChange={(e) => {
                const next = [...scores];
                next[i] = Number(e.target.value);
                setScores(next);
              }}
              aria-label={`${v.name} score`}
              style={{ ["--p" as string]: `${scores[i]}%` }}
            />
          </label>
        ))}
      </div>

      <div className="meth-calc__out">
        <span className="kit-mono">Decision Health Index</span>
        <div className="meth-calc__dial">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="50" className="meth-calc__track" />
            <circle cx="60" cy="60" r="50" pathLength={100} className="meth-calc__fill" style={{ strokeDasharray: `${dhi} 100` }} />
          </svg>
          <b className="kit-num" aria-live="polite">
            {Math.round(dhi)}
            <small>of 100</small>
          </b>
        </div>
        <p className="meth-calc__formula">
          {methodology.vectors.map((v, i) => (
            <span key={v.name}>
              {i > 0 ? " + " : ""}({v.name} <b>{scores[i]}</b> × {v.weight})
            </span>
          ))}
        </p>
        <p className="meth-calc__binding">
          Binding constraint: <b>{binding.name}</b>, the vector whose weighted shortfall costs the index most.
        </p>
        <button type="button" className="meth-calc__reset" onClick={() => setScores(DEFAULTS)} disabled={!changed}>
          Reset to observed values
        </button>
      </div>
    </div>
  );
}

/** Sticky table of contents with scroll-spy. */
export function DocToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="meth-toc" aria-label="On this page">
      <span className="kit-mono">On this page</span>
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} aria-current={active === it.id ? "location" : undefined}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
