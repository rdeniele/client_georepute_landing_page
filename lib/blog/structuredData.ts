/**
 * Structured data (JSON-LD) and absolute URLs for the blog.
 *
 * Pure functions with no imports so the offline check script can test them. What the SEO / GEO
 * audit rubric asks of a post's markup, in one place:
 *  - BlogPosting with an absolute `@id`/`url`, publisher (Organization with logo), author (the
 *    named person when there is one, otherwise the organization: an anonymous article is a weaker
 *    E-E-A-T signal than an attributed one), dates, language, word count, section, keywords and a
 *    share image that always exists.
 *  - `speakable` pointing at the headline and the opening paragraph, for voice assistants.
 *  - BreadcrumbList matching the visible breadcrumb.
 *  - FAQPage from the post's FAQ (only complete question/answer pairs).
 */

export const SITE_NAME = "GeoRepute";
export const DEFAULT_SITE_URL = "https://www.georepute.ai";
/** 1200x630, served by app/opengraph-image.png. */
export const FALLBACK_IMAGE = "/opengraph-image.png";
/** 512x512, served by app/icon.png. */
export const LOGO_PATH = "/icon.png";

/** `og:locale` wants language_TERRITORY, not a bare language code. */
export const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  he: "he_IL",
  ar: "ar_AR",
  ru: "ru_RU",
  fr: "fr_FR",
  es: "es_ES",
  pt: "pt_BR",
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

/** Makes a site-relative path absolute; leaves absolute URLs alone. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Escapes `<` so a JSON-LD payload can never close the surrounding `<script>` tag. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: SITE_NAME,
    url: siteUrl(),
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_PATH), width: 512, height: 512 },
  };
}

export type PostLdInput = {
  /** Site-relative canonical path, for example "/blog/my-post?lang=he". */
  path: string;
  title: string;
  description: string;
  locale: string;
  publishedAt: string | null;
  modifiedAt: string;
  image: string | null;
  authorName: string | null;
  category: string | null;
  keywords: string[];
  wordCount: number;
  /** Visible breadcrumb: [{ name, path }] from the blog index to the post. */
  breadcrumb: { name: string; path: string }[];
  faq: { question: string; answer: string }[];
};

/** Everything the post page emits as JSON-LD, ready to serialise. Empty FAQ produces no FAQPage. */
export function buildPostJsonLd(p: PostLdInput): object[] {
  const url = absoluteUrl(p.path);
  const org = organizationLd();
  const image = absoluteUrl(p.image || FALLBACK_IMAGE);

  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: p.title,
    description: p.description || undefined,
    image: [image],
    datePublished: p.publishedAt ?? undefined,
    dateModified: p.modifiedAt,
    inLanguage: p.locale,
    isAccessibleForFree: true,
    author: p.authorName ? { "@type": "Person", name: p.authorName } : { "@type": "Organization", name: SITE_NAME, url: siteUrl() },
    publisher: org,
    articleSection: p.category ?? undefined,
    keywords: p.keywords.length ? p.keywords.join(", ") : undefined,
    wordCount: p.wordCount || undefined,
    // Voice assistants and AI answers read these two regions first: the headline and the answer-first opening paragraph.
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".blog-article__body > p:first-of-type"] },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...p.breadcrumb.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: absoluteUrl(b.path) })),
      { "@type": "ListItem", position: p.breadcrumb.length + 1, name: p.title, item: url },
    ],
  };

  const faq = p.faq.filter((f) => f.question?.trim() && f.answer?.trim());
  const out: object[] = [article, breadcrumb];
  if (faq.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: p.locale,
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    });
  }
  return out;
}

export type IndexLdInput = {
  path: string;
  name: string;
  description: string;
  locale: string;
  posts: { path: string; title: string }[];
};

/** Blog index: a CollectionPage whose ItemList names the posts on this page, so crawlers can enumerate them. */
export function buildIndexJsonLd(i: IndexLdInput): object {
  const url = absoluteUrl(i.path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: i.name,
    description: i.description,
    inLanguage: i.locale,
    isPartOf: { "@type": "Blog", name: `${SITE_NAME} Blog`, url: absoluteUrl("/blog"), publisher: organizationLd() },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: i.posts.map((p, n) => ({ "@type": "ListItem", position: n + 1, url: absoluteUrl(p.path), name: p.title })),
    },
  };
}

/** Title tag for a post: the hand-written or generated meta title as is, else the title with the brand when it still fits a search result. */
export function postTitleTag(post: { title: string; meta_title: string | null }): string {
  const meta = post.meta_title?.trim();
  if (meta) return meta;
  const branded = `${post.title} | ${SITE_NAME}`;
  return branded.length <= 60 ? branded : post.title;
}

export function xmlEscape(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string);
}
