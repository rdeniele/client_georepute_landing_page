import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { lhref } from "@/components/subpages/kit";
import { measures } from "@/lib/subpages/demo";

/**
 * The live site's demonstration workspace has no authentication, every
 * visitor enters the same seeded organisation. This page deliberately
 * collects nothing: there is no field to fill in, only a way through.
 */
export function SignInPage({ locale }: { locale: string }) {
  const preview = measures.filter((m) => ["dhi", "recognition", "capture", "narrative"].includes(m.key));

  return (
    <div className="kit-page si-page">
      <section className="si" aria-labelledby="si-title">
        <div className="si__brand">
          <div className="si__brand-inner">
            <span className="t-eyebrow" data-enter style={{ "--i": 0 } as CSSProperties}>
              Return to the intelligence room
            </span>
            <p className="si__brand-title" data-enter style={{ "--i": 1 } as CSSProperties}>
              Not more data. <em>A decision position.</em>
            </p>
            <ul className="si__preview" data-enter style={{ "--i": 2 } as CSSProperties} aria-label="Workspace preview">
              {preview.map((m, i) => (
                <li key={m.key} style={{ "--i": i } as CSSProperties}>
                  <span>{m.name}</span>
                  <b className="kit-num">
                    {m.value}
                    {m.unit ? <small>{m.unit}</small> : null}
                  </b>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="si__panel">
          <div className="si__card" data-enter style={{ "--i": 1 } as CSSProperties}>
            <span className="kit-mono">Sign in</span>
            <h1 id="si-title">Enter the demonstration workspace</h1>
            <p>
              This environment has no authentication. Every visitor sees the same seeded organisation, Ironvale Supply, so that every figure stays verifiable against the published methodology.
            </p>

            <div className="si__workspace">
              <span className="si__avatar" aria-hidden="true">
                IS
              </span>
              <span>
                <span className="kit-mono">Workspace</span>
                <b>Ironvale Supply</b>
                <small>ironvale.example · US Midwest</small>
              </span>
              <span className="si__status">
                <i aria-hidden="true" /> Seeded
              </span>
            </div>

            <Button href={lhref("/en/app/mission-control", locale)} variant="primary" className="si__go">
              Continue to Mission Control
            </Button>

            <p className="si__note">
              No password is requested because none is checked. Real authentication drops in behind the same route without changing this screen’s place in the flow.
            </p>

            <nav className="si__links" aria-label="Other ways in">
              <a href={lhref("/en/app/reconstruct", locale)}>Reconstruct a decision</a>
              <a href={lhref("/en/methodology", locale)}>Read the methodology</a>
            </nav>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </div>
  );
}
