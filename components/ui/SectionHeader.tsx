import type { ReactNode } from "react";

/**
 * Shared section chrome: file-card index, telemetry label, headline.
 * Repeating this exact structure is what keeps eleven very different sections
 * reading as one continuous document.
 */
export function SectionHeader({
  index,
  label,
  headline,
  body,
  align = "left",
}: {
  index: string;
  label: string;
  headline: ReactNode;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`sec-head sec-head--${align}`}>
      <div className="sec-head__meta" data-reveal>
        <span className="sec-head__index">{index}</span>
        <span className="t-label">{label}</span>
        <span className="sec-head__rule" data-draw />
      </div>
      <h2 className="t-h2 sec-head__title" data-reveal data-reveal-delay="70">
        {headline}
      </h2>
      {body ? (
        <p className="t-lead sec-head__body" data-reveal data-reveal-delay="140">
          {body}
        </p>
      ) : null}
    </div>
  );
}
