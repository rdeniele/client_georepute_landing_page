import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { SUBPAGE_ROUTE_SLUGS } from "@/app/[locale]/[...slug]/page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedPosts } from "@/lib/services/posts";
import type { PostLocale } from "@/types/posts";

/** Blog only supports these two locales for now (see types/posts.ts). */
const BLOG_LOCALES: PostLocale[] = ["en", "he"];

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

  // Blog index.
  entries.push({ url: `${base}/blog`, changeFrequency: "daily", priority: 0.7 });

  // Every published post, across every locale the blog supports. The URL
  // scheme is `/blog/{slug}` for the default locale (en) and
  // `/blog/{slug}?lang=he` otherwise — see app/blog/[slug]/page.tsx, which
  // reads `?lang=` and falls back across locales if it's missing/wrong.
  try {
    const supabase = await createSupabaseServerClient();
    const postsByLocale = await Promise.all(
      BLOG_LOCALES.map((locale) => getPublishedPosts(supabase, { locale, limit: 1000 })),
    );

    for (const [i, locale] of BLOG_LOCALES.entries()) {
      for (const post of postsByLocale[i]) {
        const url = locale === "en" ? `${base}/blog/${post.slug}` : `${base}/blog/${post.slug}?lang=${locale}`;
        entries.push({
          url,
          lastModified: post.updated_at ?? post.published_at ?? undefined,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  } catch {
    // Supabase unreachable at build/request time — ship the sitemap without
    // post entries rather than failing the whole route.
  }

  return entries;
}
