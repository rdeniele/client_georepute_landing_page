import { finalCta as base } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { photos } from "@/lib/photos";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { getLocaleCopy } from "@/lib/i18n";

/**
 * Section 11 — Analyze my business.
 *
 * The close resolves the page's two layers into one frame: the real business
 * runs full-bleed behind the statement, the brand environment veils it, and
 * the network converges over the top. Reality and the invisible layer, finally
 * in the same picture.
 *
 * The copy stays deliberately bare — one line, one supporting sentence, two
 * controls — because the composition is doing the argument.
 */
export function FinalCta({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).finalCta;
  return (
    <section
      id="analyze"
      className="section final band band--color"
      data-section
    >
      <Band tone="color" network edge="bottom-hard" />

      {/* Until the closing photograph lands there is nothing to veil, and an
          empty reserved plate would only flatten the band's own gradient. */}
      {photos.close.src && (
        <div className="band__bg final__photo">
          <EditorialPhoto slot="close" tint="deep" />
        </div>
      )}

      <div className="shell final__shell">
        <span className="t-eyebrow" data-reveal>
          {c.label}
        </span>

        <h2 className="final__headline" data-reveal data-reveal-delay="80">
          {c.headline}
        </h2>

        <p className="t-lead final__body" data-reveal data-reveal-delay="160">
          {c.body}
        </p>

        <div className="final__actions" data-reveal data-reveal-delay="240">
          <Button href={base.primaryCta.href} variant="conversion">
            {c.primaryCta}
          </Button>
          <Button href={base.secondaryCta.href} variant="ghost">
            {c.secondaryCta}
          </Button>
        </div>
      </div>

      <SiteFooter locale={locale} />
    </section>
  );
}
