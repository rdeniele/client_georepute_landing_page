import Image from "next/image";
import { photos, type PhotoId } from "@/lib/photos";
import { BandNetwork } from "./BandNetwork";
import { normalizeLocale } from "@/lib/i18n";

/**
 * A photographic plate.
 *
 * Photography is the real-world layer; the network is the invisible layer that
 * forms decisions about it. So a plate is never a bare image — it is a frame
 * the network can be seen leaving, optionally under a glass readout, so the
 * two read as one argument rather than as an image next to a graphic.
 *
 * Treatment stays honest: a clip, a soft violet veil at low opacity, one
 * shadow. No heavy filters — the photographs have to stay authentic.
 *
 * Until the client supplies the file, the slot renders its reserved plate:
 * the same frame, the same network, and a discreet mono annotation naming the
 * image that belongs there. The layout is final either way.
 */
export function EditorialPhoto({
  slot,
  bridge = false,
  tint = "soft",
  reveal = false,
  className = "",
  locale = "en",
  children,
}: {
  slot: PhotoId;
  /** Draw the network continuing out of the frame's edge into the band. */
  bridge?: boolean;
  tint?: "none" | "soft" | "deep";
  /** Join the page's shared scroll-reveal vocabulary. */
  reveal?: boolean;
  className?: string;
  locale?: string;
  /** Glass readout composited over the photograph. */
  children?: React.ReactNode;
}) {
  const p = photos[slot];
  const isHebrew = normalizeLocale(locale) === "he";
  const placeholderTag = isHebrew ? "תמונה בהמתנה" : "IMAGE PLACEHOLDER";
  const placeholderSpec = isHebrew
    ? slot === "decision"
      ? "הקשר לקוח אמיתי — אדם משווה אפשרויות, מחפש, שואל ומחליט. אנושי ולא מבוים."
      : "סביבת עסק או לקוח אמיתית — אנשים בעבודה, פגישה, מקום פיזי או החלטה שמתקבלת."
    : p.spec.subject;

  return (
    <figure
      className={`photo photo--tint-${tint} ${p.src ? "" : "photo--reserved"} ${children ? "photo--panelled" : ""} ${className}`}
      style={{ "--photo-ratio": p.ratio } as React.CSSProperties}
      {...(reveal ? { "data-reveal": "" } : {})}
    >
      <div className="photo__frame">
        {p.src ? (
          <Image
            className="photo__img"
            src={p.src}
            alt={p.alt}
            fill
            sizes="(max-width: 1100px) 100vw, 46vw"
            priority={p.priority === 1}
          />
        ) : (
          <div className="photo__reserved" aria-label={placeholderTag}>
            <p className="photo__reserved-note">
              <span className="photo__reserved-tag">{placeholderTag}</span>
              <span className="photo__reserved-spec">
                {placeholderSpec}
              </span>
            </p>
          </div>
        )}

        <span className="photo__veil" aria-hidden="true" />
        {children}
      </div>

      {bridge && (
        <BandNetwork bridge className="bandnet--bridge" />
      )}
    </figure>
  );
}
