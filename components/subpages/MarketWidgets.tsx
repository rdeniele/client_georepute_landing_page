"use client";

import { useState } from "react";
import type { Module } from "@/lib/subpages/copy";

export function ModuleExplorer({ modules }: { modules: Module[] }) {
  const [liveOnly, setLiveOnly] = useState(false);
  const live = modules.filter((m) => m.live).length;
  const list = liveOnly ? modules.filter((m) => m.live) : modules;

  return (
    <div className="cat-mods">
      <div className="cat-mods__bar">
        <div className="kit-seg" role="group" aria-label="Filter modules">
          <button type="button" aria-pressed={!liveOnly} onClick={() => setLiveOnly(false)}>
            All modules<span className="kit-seg__count">{modules.length}</span>
          </button>
          <button type="button" aria-pressed={liveOnly} onClick={() => setLiveOnly(true)} disabled={live === 0}>
            Live in demo<span className="kit-seg__count">{live}</span>
          </button>
        </div>
      </div>
      <ol className="cat-mods__grid" key={String(liveOnly)}>
        {list.map((m, i) => (
          <li key={m.name} className={`kit-card cat-mod kit-swap${m.live ? " is-live" : ""}`} style={{ animationDelay: `${i * 35}ms` }} data-spotlight>
            <div className="cat-mod__top">
              <span className="cat-mod__n">{String(modules.indexOf(m) + 1).padStart(2, "0")}</span>
              <span className={`kit-pill kit-pill--${m.live ? "up" : "muted"}`}>{m.live ? "Live" : "In platform"}</span>
            </div>
            <h3>{m.question}</h3>
            <p>{m.body}</p>
            <span className="cat-mod__name">{m.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
