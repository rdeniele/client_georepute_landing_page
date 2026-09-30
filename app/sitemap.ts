import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { SUBPAGE_ROUTE_SLUGS } from "@/app/[locale]/[...slug]/page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedForSitemap } from "@/lib/services/posts";
import { POST_LOCALES, blogPath } from "@/lib/utils/postLocale";
import type { PostLocale } from "@/types/posts";

/** Every language a post can be written in (see lib/utils/postLocale.ts). */
const BLOG_LOCALES: readonly PostLocale[] = POST_LOCALES;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.georepute.ai";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Blog index, one per language, each listing the others as alternates.
  const indexLanguages = {
    ...Object.fromEntries(BLOG_LOCALES.map((l) => [l, `${base}${blogPath(l)}`])),
    "x-default": `${base}${blogPath("en")}`,
  };
  for (const locale of BLOG_LOCALES) {
    entries.push({ url: `${base}${blogPath(locale)}`, changeFrequency: "daily", priority: locale === "en" ? 0.7 : 0.6, alternates: { languages: indexLanguages } });
  }

  // Every published post, across every locale the blog supports. The URL
  // scheme is `/blog/{slug}` for the default locale (en) and
  // `/blog/{slug}?lang=xx` otherwise — see app/blog/[slug]/page.tsx, which
  // reads `?lang=` and falls back across locales if it's missing/wrong.
  try {
    const supabase = await createSupabaseServerClient();
    const postsByLocale = await Promise.all(
      BLOG_LOCALES.map((locale) => getPublishedForSitemap(supabase, locale)),
    );

    // Language versions of one article are linked by translation group (the automation gives each language its own
    // slug) or, for hand-translated posts, by a shared slug. Every version lists all of them (hreflang), itself included.
    const versions = new Map<string, Record<string, string>>();
    const keyOf = (post: { slug: string; translation_group: string | null }) => post.translation_group ?? `slug:${post.slug}`;
    for (const [i, locale] of BLOG_LOCALES.entries()) {
      for (const post of postsByLocale[i]) {
        const key = keyOf(post);
        versions.set(key, { ...(versions.get(key) ?? {}), [locale]: `${base}${blogPath(locale, post.slug)}` });
      }
    }

    for (const [i, locale] of BLOG_LOCALES.entries()) {
      for (const post of postsByLocale[i]) {
        const group = versions.get(keyOf(post));
        entries.push({
          url: `${base}${blogPath(locale, post.slug)}`,
          lastModified: post.updated_at ?? post.published_at ?? undefined,
          changeFrequency: "monthly",
          priority: 0.6,
          ...(group && Object.keys(group).length > 1 ? { alternates: { languages: { ...group, "x-default": group.en ?? Object.values(group)[0] } } } : {}),
        });
      }
    }
  } catch {
    // Supabase unreachable at build/request time — ship the sitemap without
    // post entries rather than failing the whole route.
  }

  return entries;
}
