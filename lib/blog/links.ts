/**
 * Links an article is allowed to contain, shared by the automated writer and the "Generate with Claude" button.
 *
 * The AI never invents a URL: it may only use an address from this list (plus any the admin or the brief supplies). Internal
 * links go to the site's own pages (the same ones as the header navigation, in the article's language). External links go
 * to a short, curated list of stable, authoritative pages that were opened and checked when they were added. Add to the
 * list here, or, without a deploy, add `https://...| when to link` lines to Settings > "Pages articles may link to".
 */
import { localizeNav } from "@/lib/i18n";

export type LinkRule = { href: string; note: string };

/** Stable pages from Google and the W3C/Schema.org that a blog about search and AI visibility can honestly cite. */
export const TRUSTED_SOURCES: readonly LinkRule[] = [
  { href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", note: "Google's SEO Starter Guide: link when explaining search basics" },
  { href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", note: "Google on helpful, reliable, people-first content: link when talking about content quality" },
  { href: "https://developers.google.com/search/docs/fundamentals/how-search-works", note: "How Google Search works: link when explaining crawling, indexing or ranking" },
  { href: "https://developers.google.com/search/docs/appearance/snippet", note: "Google on meta descriptions and snippets: link when talking about how a page appears in results" },
  { href: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data", note: "Google's intro to structured data: link when talking about schema or markup" },
  { href: "https://schema.org/FAQPage", note: "Schema.org FAQPage: link when talking about FAQ markup" },
  { href: "https://support.google.com/business/answer/7091", note: "Google Business Profile: tips to improve local ranking: link when talking about local visibility" },
  { href: "https://support.google.com/business/answer/3039617", note: "Google Business Profile Help: editing a profile: link when talking about keeping business details correct" },
  { href: "https://www.w3.org/WAI/tutorials/images/decision-tree/", note: "W3C guide to writing image descriptions (alt text): link when talking about accessibility of images" },
];

/** The site's own real pages, from the same navigation the header renders, localized. */
export function siteLinkRules(locale: string): LinkRule[] {
  const nav = localizeNav(locale);
  const rules: LinkRule[] = [];
  for (const group of nav.groups) {
    for (const item of group.items) rules.push({ href: item.href, note: `${item.name}: ${item.desc}` });
  }
  for (const link of nav.links) if (link.href.startsWith("/")) rules.push({ href: link.href, note: link.label });
  const seen = new Set<string>();
  return rules.filter((r) => (seen.has(r.href) ? false : (seen.add(r.href), true)));
}

/** Everything an article may link to by default: the site's pages, then the trusted external sources. */
export const defaultLinkRules = (locale: string): LinkRule[] => [...siteLinkRules(locale), ...TRUSTED_SOURCES];

const isOwn = (href: string) => href.startsWith("/") || /^https:\/\/(?:www\.)?georepute\.ai(?:\/|$)/i.test(href);

/** Counts a document's links by kind. Used by the publish gate. */
export function countLinks(hrefs: string[]): { internal: number; external: number } {
  const unique = [...new Set(hrefs)];
  const internal = unique.filter(isOwn).length;
  return { internal, external: unique.filter((h) => /^https?:\/\//i.test(h) && !isOwn(h)).length };
}
