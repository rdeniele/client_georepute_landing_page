"use client";

import { PLATFORMS, PlatformGlyph } from "./PlatformGlyph";
import { getLocaleCopy } from "@/lib/i18n";

/** First-stage proof of the surfaces GeoRepute scans. */

export function PlatformConstellation({ locale = "en" }: { locale?: string }) {
  const label = getLocaleCopy(locale).platformsLabel;
  return (
    <div className="platforms" data-reveal>
      <p className="platforms__label">
        {label}
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
