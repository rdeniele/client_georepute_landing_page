import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { SUBPAGE_ROUTE_SLUGS } from "@/app/[locale]/[...slug]/page";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.georepute.ai";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  // Static locale home routes: /{locale} for each of lib/i18n.ts's LOCALES.
  for (const locale of LOCALES) {
    entries.push({ url: `${base}/${locale}`, changeFrequency: "weekly", priority: locale === "en" ? 1 : 0.8 });
  }

  // Every bespoke subpage under app/[locale]/[...slug]/page.tsx's ROUTES map, for every locale.
  for (const locale of LOCALES) {
    for (const slug of SUBPAGE_ROUTE_SLUGS) {
      entries.push({ url: `${base}/${locale}/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }

  // Booking page (rendered by app/[locale]/briefing, not part of the ROUTES map above).
  for (const locale of LOCALES) {
    entries.push({ url: `${base}/${locale}/briefing`, changeFrequency: "monthly", priority: 0.7 });
  }

  return entries;
}
