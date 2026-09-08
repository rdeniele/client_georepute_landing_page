"use client";

import { PLATFORMS, PlatformGlyph } from "./PlatformGlyph";

/** First-stage proof of the surfaces GeoRepute scans. */

export function PlatformConstellation() {
  return (
    <div className="platforms" data-reveal>
      <p className="platforms__label">
        GeoRepute scans Google + 6 AI engines — the surfaces where your business
        is discovered
      </p>

      <div className="platforms__stage" aria-label="Platforms monitored by GeoRepute">
        <div className="platforms__viewport">
          <div className="platforms__track">
            {[0, 1].map((copy) => (
              <div className="platforms__set" key={copy} aria-hidden={copy === 1}>
                {PLATFORMS.map((platform) => (
                  <span className="platforms__chip" key={`${copy}-${platform.id}`}>
                    <span className="platforms__glyph">
                      <PlatformGlyph id={platform.id} />
                    </span>
                    <span>{platform.name}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
