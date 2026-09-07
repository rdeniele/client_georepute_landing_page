import { finalCta as c } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { photos } from "@/lib/photos";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { SiteFooter } from "@/components/ui/SiteFooter";

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
export function FinalCta() {
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
          The decision is{" "}
          <em className="t-editorial final__em">already happening.</em>
        </h2>

        <p className="t-lead final__body" data-reveal data-reveal-delay="160">
          {c.body}
        </p>

        <div className="final__actions" data-reveal data-reveal-delay="240">
          <Button href={c.primaryCta.href} variant="primary">
            {c.primaryCta.label}
          </Button>
          <Button href={c.secondaryCta.href} variant="ghost">
            {c.secondaryCta.label}
          </Button>
        </div>
      </div>

      <SiteFooter />
    </section>
  );
}
