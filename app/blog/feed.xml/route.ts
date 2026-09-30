import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedPosts } from "@/lib/services/posts";
import { SITE_NAME, absoluteUrl, xmlEscape } from "@/lib/blog/structuredData";
import { blogPath, feedPath, toPostLocale } from "@/lib/utils/postLocale";
import { getBlogChromeCopy } from "@/lib/subpages/blogChrome";

/**
 * RSS 2.0 feed of the latest posts in one language (`?lang=`, English by default). Feeds are how readers, aggregators
 * and a good share of AI and search crawlers discover new posts within minutes instead of waiting for a re-crawl.
 */
export const revalidate = 900;

export async function GET(request: Request) {
  const locale = toPostLocale(new URL(request.url).searchParams.get("lang"));
  const c = getBlogChromeCopy(locale);

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts(await createSupabaseServerClient(), { locale, limit: 30 });
  } catch {
    // An empty feed is better than an error page for a feed reader.
  }

  const items = posts
    .map((p) => {
      const link = absoluteUrl(blogPath(p.locale, p.slug));
      const description = p.meta_description || p.excerpt || "";
      return [
        "    <item>",
        `      <title>${xmlEscape(p.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        p.published_at ? `      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : "",
        p.category ? `      <category>${xmlEscape(p.category)}</category>` : "",
        description ? `      <description>${xmlEscape(description)}</description>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const selfUrl = absoluteUrl(feedPath(locale));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${SITE_NAME} ${c.crumb}`)}</title>
    <link>${xmlEscape(absoluteUrl(blogPath(locale)))}</link>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(c.metaDescription)}</description>
    <language>${locale}</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
