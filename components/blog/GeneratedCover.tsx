import Image from "next/image";
import type { CSSProperties } from "react";
import logo from "@/public/brand/logo-g-mark.png";

/** Small stable hash, so a post always gets the same tint. */
function hash(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Cover shown at the top of a post that has no photo (no Unsplash key, no match, or a hand-written post with no upload),
 * so no article page ever opens on a bare gap. Branded and decorative: the headline sits right above it, so it carries
 * no text of its own beyond the category, and is hidden from screen readers.
 */
export function GeneratedCover({ seed, label }: { seed: string; label: string }) {
  const hue = (hash(seed) % 50) - 25;
  return (
    <div className="blog-cover blog-cover--generated" style={{ "--cover-hue": `${hue}deg` } as CSSProperties} aria-hidden="true">
      <Image src={logo} alt="" width={56} height={56} className="blog-cover__mark" />
      <span className="t-label blog-cover__label">{label}</span>
    </div>
  );
}
