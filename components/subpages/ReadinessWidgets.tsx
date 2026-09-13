"use client";

import { useState } from "react";
import { readiness } from "@/lib/subpages/demo";

function tone(score: number) {
  return score >= 70 ? "up" : score >= 45 ? "warn" : "down";
}

export function ReadinessDimensions() {
  const [key, setKey] = useState(readiness.dimensions[1].key);
  const d = readiness.dimensions.find((x) => x.key === key) ?? readiness.dimensions[0];

  return (
    <div className="cr-dims">
      <div className="cr-dims__list" role="tablist" aria-label="Readiness dimensions" aria-orientation="vertical">
        {readiness.dimensions.map((x) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            id={`cr-tab-${x.key}`}
            aria-selected={key === x.key}
            aria-controls="cr-dim-panel"
            className={`cr-dim cr-dim--${tone(x.score)}`}
            onClick={() => setKey(x.key)}
          >
            <span className="cr-dim__name">
              {x.name}
              <small>{x.weight}% of index</small>
            </span>
            <span className="cr-dim__bar" aria-hidden="true">
              <i style={{ transform: `scaleX(${x.score / 100})` }} />
              <b style={{ left: "45%" }} />
              <b style={{ left: "70%" }} />
            </span>
            <span className="cr-dim__score kit-num">{x.score}</span>
          </button>
        ))}
      </div>

      <div id="cr-dim-panel" role="tabpanel" aria-labelledby={`cr-tab-${d.key}`} className="cr-panel">
        <div className="kit-swap" key={d.key}>
          <div className="cr-panel__head">
            <div>
              <span className="kit-mono">{d.weight}% of the readiness index</span>
              <h3>{d.question}</h3>
            </div>
            <span className={`cr-panel__state cr-panel__state--${d.state === "At risk" ? "warn" : "down"}`}>
              <b className="kit-num">{d.score}</b>
              <small>{d.state}</small>
            </span>
          </div>
          <dl className="cr-panel__findings">
            {d.findings.map(([name, value, detail]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>
                  <b>{value}</b>
                  <span>{detail}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="cr-panel__if">
            <span className="kit-mono">If you launch anyway</span>
            <p>{d.ifLaunched}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
