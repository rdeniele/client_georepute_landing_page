"use client";

import { useEffect, useState } from "react";

/** Calendly takes its colours as hex query params (no "#"), so match the card in the current theme. */
function themeParams(): string {
  const dark = document.documentElement.classList.contains("theme-dark");
  return new URLSearchParams(
    dark
      ? { background_color: "182052", text_color: "f6f4ff", primary_color: "a88bf5" }
      : { background_color: "ffffff", text_color: "0c1134", primary_color: "6b34e8" },
  ).toString();
}

/**
 * Inline Calendly scheduler. Rendered after mount because it needs the
 * page's hostname and theme. The event details Calendly prints itself (host
 * name, event title, duration) are hidden: the card around it says the same
 * in the site's own type, and the host's Calendly profile name shouldn't
 * show here. `locale` is passed through as Calendly's own `locale` param so
 * the widget's UI (button labels, date formats) follows the visitor's
 * language on RTL locales too; Calendly falls back to its own default for
 * any code it doesn't recognise, so this is never a hard dependency.
 */
export function CalendlyEmbed({ url, locale = "en" }: { url: string; locale?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const build = () =>
      setSrc(
        `${url}?embed_domain=${encodeURIComponent(window.location.hostname)}&embed_type=Inline&hide_gdpr_banner=1&hide_event_type_details=1&locale=${encodeURIComponent(locale)}&${themeParams()}`,
      );
    build();
    // Re-theme when the visitor flips light/dark. Unrelated class changes produce the same string, so React skips them.
    const observer = new MutationObserver(build);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [url, locale]);

  // Calendly reports its content height as the visitor moves between steps, so the frame never needs its own scrollbar.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com") return;
      const data = event.data as { event?: string; payload?: { height?: string } } | undefined;
      if (data?.event !== "calendly.page_height") return;
      const next = parseInt(data.payload?.height ?? "", 10);
      if (Number.isFinite(next) && next > 0) setHeight(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!src) return <div className="briefing-embed" aria-hidden="true" />;
  return (
    <iframe
      className="briefing-embed"
      src={src}
      title="Book a meeting"
      loading="lazy"
      style={height ? { height } : undefined}
    />
  );
}
