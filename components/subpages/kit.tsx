import type { CSSProperties, ReactNode } from "react";
import { Band, type BandTone } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { CONFIDENCE, DEMO_NOTE, type Confidence, type Trend } from "@/lib/subpages/demo";
import { nav } from "@/lib/content";

export const DEMO_HREF = nav.cta.href;

/**
 * Booking destination for every "Book a Live Demo" / meeting CTA. Points at
 * the site's own /briefing form (emails georepute@gmail.com — see
 * lib/services/mailer.ts) rather than a mailto: link, since mailto only
 * works for visitors with a desktop mail app configured. Swap this to a
 * real calendar tool's URL later if the client gets one.
 */
export const MEETING_HREF = "/briefing";

/** Rewrites an `/en/...` route into the visitor's current locale. */
export function lhref(href: string, locale: string) {
  return href.startsWith("/en") ? href.replace(/^\/en(?=\/|$)/, `/${locale}`) : href;
}

export function Crumbs({ trail, locale }: { trail: { label: string; href?: string }[]; locale: string }) {
  return (
    <nav className="kit-crumbs" aria-label="Breadcrumb" data-enter style={{ "--i": 0 } as CSSProperties}>
      <a href={`/${locale}`}>GeoRepute</a>
      {trail.map((t, i) => (
        <span key={t.label} className="kit-crumbs__step">
          <span aria-hidden="true">/</span>
          {t.href && i < trail.length - 1 ? (
            <a href={lhref(t.href, locale)}>{t.label}</a>
          ) : (
            <span aria-current={i === trail.length - 1 ? "page" : undefined}>{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/**
 * The page-top composition. Every subpage opens with the same entrance
 * choreography (`data-enter` + `--i` stagger, CSS-only so it never waits on
 * hydration) but chooses its own layout and its own right-hand instrument.
 */
export function PageHero({
  id,
  eyebrow,
  title,
  lead,
  actions,
  aside,
  layout = "split",
  tone = "tint",
  crumbs,
  className = "",
  meta,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  layout?: "split" | "center" | "stack";
  tone?: BandTone;
  crumbs: ReactNode;
  className?: string;
  meta?: ReactNode;
}) {
  return (
    <section className={`kit-hero kit-hero--${layout} ${className}`} aria-labelledby={`${id}-title`}>
      <Band tone={tone} edge="top-hard" />
      <div className="kit-hero__glow" aria-hidden="true" data-parallax="0.12" />
      <div className="shell kit-hero__grid">
        <div className="kit-hero__copy">
          {crumbs}
          <span className="t-eyebrow kit-hero__eyebrow" data-enter style={{ "--i": 1 } as CSSProperties}>
            {eyebrow}
          </span>
          <h1 id={`${id}-title`} className="kit-hero__title" data-enter style={{ "--i": 2 } as CSSProperties}>
            {title}
          </h1>
          {lead ? (
            <p className="t-lead kit-hero__lead" data-enter style={{ "--i": 3 } as CSSProperties}>
              {lead}
            </p>
          ) : null}
          {meta ? (
            <div className="kit-hero__meta" data-enter style={{ "--i": 4 } as CSSProperties}>
              {meta}
            </div>
          ) : null}
          {actions ? (
            <div className="kit-hero__actions" data-enter style={{ "--i": 5 } as CSSProperties}>
              {actions}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="kit-hero__aside" data-enter style={{ "--i": 3 } as CSSProperties}>
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SectionIntro({
  index,
  label,
  title,
  body,
  align = "left",
  className = "",
  aside,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center" | "split";
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={`kit-intro kit-intro--${align} ${className}`}>
      <div className="kit-intro__head">
        <div className="kit-intro__meta" data-reveal>
          {index ? <span className="kit-intro__index">{index}</span> : null}
          <span className="t-label">{label}</span>
          <span className="kit-intro__rule" data-draw aria-hidden="true" />
        </div>
        <h2 className="t-h2 kit-intro__title" data-reveal data-reveal-delay="60">
          {title}
        </h2>
      </div>
      {body || aside ? (
        <div className="kit-intro__body" data-reveal data-reveal-delay="120">
          {body ? <p className="t-body">{body}</p> : null}
          {aside}
        </div>
      ) : null}
    </div>
  );
}

export function DemoNote({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <p className={`kit-demo ${className}`}>
      <span className="kit-demo__dot" aria-hidden="true" />
      {children ?? DEMO_NOTE}
    </p>
  );
}

export function ConfidenceMark({ level, label = true }: { level: Confidence; label?: boolean }) {
  const c = CONFIDENCE[level];
  return (
    <span className={`kit-conf kit-conf--${level}`} title={c.detail}>
      <span className="kit-conf__mark" aria-hidden="true">
        {c.mark}
      </span>
      {label ? c.label : <span className="sr-only">{c.label}</span>}
    </span>
  );
}

export function TrendMark({ trend }: { trend: Trend }) {
  const text = trend === "down" ? "Deteriorating" : trend === "up" ? "Improving" : "Stable";
  const glyph = trend === "down" ? "▼" : trend === "up" ? "▲" : "■";
  return (
    <span className={`kit-trend kit-trend--${trend}`}>
      <span aria-hidden="true">{glyph}</span> {text}
    </span>
  );
}

/** A horizontal meter. The fill scales in on reveal, transform only. */
export function Meter({
  value,
  max = 100,
  tone = "signal",
  label,
  target,
  className = "",
}: {
  value: number;
  max?: number;
  tone?: "signal" | "up" | "down" | "warn" | "muted";
  label?: string;
  target?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <span
      className={`kit-meter kit-meter--${tone} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ "--v": pct } as CSSProperties}
    >
      <i className="kit-meter__fill" data-reveal />
      {target !== undefined ? (
        <b className="kit-meter__target" style={{ "--t": Math.min(1, target / max) } as CSSProperties} />
      ) : null}
    </span>
  );
}

export function Pill({ children, tone = "signal" }: { children: ReactNode; tone?: "signal" | "up" | "down" | "warn" | "muted" }) {
  return <span className={`kit-pill kit-pill--${tone}`}>{children}</span>;
}

export function CtaBand({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  locale,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  locale: string;
}) {
  return (
    <>
      <section className="kit-cta band band--color" data-section>
        <Band tone="color" edge="top-hard" />
        <div className="shell kit-cta__inner">
          {eyebrow ? (
            <span className="t-eyebrow" data-reveal>
              {eyebrow}
            </span>
          ) : null}
          <h2 className="t-h2 kit-cta__title" data-reveal data-reveal-delay="60">
            {title}
          </h2>
          {body ? (
            <p className="t-lead kit-cta__body" data-reveal data-reveal-delay="120">
              {body}
            </p>
          ) : null}
          <div className="kit-cta__actions" data-reveal data-reveal-delay="180">
            <Button href={lhref(primary.href, locale)} variant="primary">
              {primary.label}
            </Button>
            {secondary ? (
              <Button href={lhref(secondary.href, locale)} variant="ghost">
                {secondary.label}
              </Button>
            ) : null}
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
