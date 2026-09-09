import { footer as f } from "@/lib/content";
import { getLocaleCopy } from "@/lib/i18n";

export function SiteFooter({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).footer;
  return (
    <footer className="foot">
      <div className="shell foot__shell">
        <span className="foot__brand">{f.brand}</span>
        <span className="foot__tagline">{c.tagline}</span>
        <span className="foot__note t-editorial">{c.note}</span>
      </div>
    </footer>
  );
}