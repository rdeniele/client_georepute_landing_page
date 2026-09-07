import { footer as f } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="shell foot__shell">
        <span className="foot__brand">{f.brand}</span>
        <span className="foot__tagline">{f.tagline}</span>
        <span className="foot__note t-editorial">{f.note}</span>
      </div>
    </footer>
  );
}