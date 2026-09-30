import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { CalendarBlank, Clock, UserCircle } from "@phosphor-icons/react/ssr";
import { Crumbs, CtaBand, PageHero } from "@/components/subpages/kit";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedAlternates, getPublishedPostBySlug, getRelatedPosts } from "@/lib/services/posts";
import { PostCard } from "@/components/blog/PostCard";
import { outline } from "@/lib/blog/seo";
import { imageUrls } from "@/lib/blog/automation/inlineImages";
import { FALLBACK_IMAGE, OG_LOCALE, SITE_NAME, buildPostJsonLd, postTitleTag, safeJsonLd } from "@/lib/blog/structuredData";
import { BLOG_LANGUAGES } from "@/lib/blog/generation";
import { formatDate } from "@/lib/utils/format";
import { blogPath, feedPath, toPostLocale } from "@/lib/utils/postLocale";
import type { PostLocale } from "@/types/posts";
import { getBlogChromeCopy } from "@/lib/subpages/blogChrome";
import { PhotoCredit } from "@/components/blog/PhotoCredit";
import { GeneratedCover } from "@/components/blog/GeneratedCover";
import { AuthorBox, MoreByAuthor } from "@/components/blog/AuthorBox";
import Image from "next/image";
import teamLogo from "@/public/brand/logo-g-mark.png";
import { getAuthorForPost, getMoreByAuthor } from "@/lib/services/authors";

type Params = { slug: string };
type SearchParams = { lang?: string };

const WORDS_PER_MINUTE = 220;

function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function toLocale(lang?: string): PostLocale {
  return toPostLocale(lang);
}

async function loadPost(slug: string, locale: PostLocale) {
  const supabase = await createSupabaseServerClient();
  return getPublishedPostBySlug(supabase, slug, locale);
}

/** hreflang for the other published language versions of this article. Missing alternates never break the page. */
async function loadAlternates(post: NonNullable<Awaited<ReturnType<typeof loadPost>>>): Promise<Record<string, string> | undefined> {
  try {
    const supabase = await createSupabaseServerClient();
    const versions = await getPublishedAlternates(supabase, post);
    if (versions.length < 2) return undefined;
    const languages: Record<string, string> = {};
    for (const v of versions) languages[v.locale] = blogPath(v.locale, v.slug);
    const fallback = versions.find((v) => v.locale === "en") ?? versions[0];
    languages["x-default"] = blogPath(fallback.locale, fallback.slug);
    return languages;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;

  let post;
  try {
    post = await loadPost(slug, toLocale(lang));
  } catch {
    return { title: "Blog | GeoRepute" };
  }
  if (!post) return { title: "Post not found | GeoRepute", robots: { index: false, follow: false } };

  // The SEO fields written for this language (automation) win; posts written by hand fall back to the title and excerpt.
  const description = post.meta_description || post.excerpt || post.content.slice(0, 160);
  const languages = await loadAlternates(post);
  const path = blogPath(post.locale, post.slug);
  const title = postTitleTag(post);
  const image = post.featured_image || FALLBACK_IMAGE;
  const alternateLocale = languages ? Object.keys(languages).filter((l) => l !== post.locale && l !== "x-default").map((l) => OG_LOCALE[l] ?? l) : undefined;

  return {
    title: { absolute: title },
    description,
    keywords: post.keywords?.length ? post.keywords : undefined,
    authors: post.author?.full_name ? [{ name: post.author.full_name }] : [{ name: SITE_NAME }],
    alternates: { canonical: path, ...(languages ? { languages } : {}), types: { "application/rss+xml": feedPath(post.locale) } },
    // Lets Google and AI answer engines use full-size images and longer snippets from the page.
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: OG_LOCALE[post.locale] ?? post.locale,
      alternateLocale,
      title,
      description,
      url: path,
      images: [{ url: image, alt: post.title }],
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      section: post.category ?? undefined,
      tags: post.tags.length ? post.tags : undefined,
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const requestedLocale = toLocale(lang);

  let post;
  try {
    post = await loadPost(slug, requestedLocale);
  } catch {
    post = undefined;
  }

  if (post === undefined) {
    const uc = getBlogChromeCopy(requestedLocale);
    return (
      <SiteShell locale={requestedLocale}>
        <div className="kit-page blog-page">
          <section className="kit-section" data-section>
            <div className="shell">
              <div className="blog-state" role="alert">
                <h2 className="t-h3 blog-state__title">{uc.postUnavailableTitle}</h2>
                <p className="t-body">{uc.unavailableBody}</p>
              </div>
            </div>
          </section>
        </div>
      </SiteShell>
    );
  }

  if (post === null) notFound();

  // Trust the row's own locale over the `?lang=` query param — the service
  // falls back across locales when the param doesn't match, so what actually
  // rendered may differ from what was requested.
  const locale = post.locale;
  const c = getBlogChromeCopy(locale);

  // The public author (Admin > Authors), or the default author, or the built-in team. Never fails the page.
  const author = await getAuthorForPost(await createSupabaseServerClient(), post);
  const moreByAuthor = await getMoreByAuthor(await createSupabaseServerClient(), post, author, 4);

  const faq = (post.faq ?? []).filter((f) => f?.question && f?.answer);
  const path = blogPath(post.locale, post.slug);
  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const jsonLd = buildPostJsonLd({
    path,
    title: post.title,
    description: post.meta_description || post.excerpt || post.content.slice(0, 160),
    locale: post.locale,
    publishedAt: post.published_at,
    modifiedAt: post.updated_at,
    image: post.featured_image,
    extraImages: imageUrls(post.content_blocks ?? []),
    authorName: null,
    author: { name: author.name, jobTitle: author.jobTitle, description: author.bio, image: author.avatarUrl, sameAs: author.links.map((l) => l.url), isTeam: author.isTeam },
    category: post.category,
    keywords: post.keywords ?? [],
    wordCount,
    breadcrumb: [{ name: c.crumb, path: blogPath(locale) }],
    faq,
  });

  // Table of contents from the article's own H2s (same anchor ids the renderer gives them), plus the FAQ section.
  const toc = [...outline(post.content_blocks ?? []), ...(faq.length ? [{ text: c.faqTitle, id: "post-faq" }] : [])];
  let related: Awaited<ReturnType<typeof getRelatedPosts>> = [];
  try {
    related = await getRelatedPosts(await createSupabaseServerClient(), post, 3);
  } catch {
    // Related posts are an enhancement: never fail the article over them.
  }

  return (
    <SiteShell locale={locale}>
      {/* lang and dir on the content itself: the document element is set from the URL path by script, which a
          crawler reading the raw HTML of /blog/x?lang=he would otherwise see as English and left-to-right. */}
      <div className="kit-page blog-page" lang={locale} dir={BLOG_LANGUAGES[locale].dir}>
        {jsonLd.map((node, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(node) }} />
        ))}
        <PageHero
          id="post"
          layout="stack"
          backdrop="network"
          className="blog-hero--post"
          crumbs={<Crumbs locale={locale} trail={[{ label: c.crumb, href: blogPath(locale) }, { label: post.title }]} />}
          eyebrow={post.category ?? c.insightFallback}
          title={post.title}
          lead={post.excerpt ?? undefined}
          meta={
            <ul className="blog-meta">
              {post.published_at ? (
                <li className="blog-meta__chip">
                  <CalendarBlank weight="duotone" aria-hidden="true" />
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </li>
              ) : null}
              <li className="blog-meta__chip">
                <UserCircle weight="duotone" aria-hidden="true" />
                <a href="#author">{author.name}</a>
              </li>
              <li className="blog-meta__chip">
                <Clock weight="duotone" aria-hidden="true" />
                <span>{c.minRead(readingMinutes(post.content))}</span>
              </li>
            </ul>
          }
        />

        <section className="kit-section kit-section--tight blog-body" data-section>
          <div className="shell">
            {post.featured_image ? (
              <div className="blog-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.featured_image} alt={post.title} />
                <PhotoCredit image={post.featured_image} credit={post.featured_image_credit} />
              </div>
            ) : (
              <GeneratedCover seed={post.slug} label={post.category ?? c.insightFallback} />
            )}

            <div className="blog-layout">
            <article className="blog-article">
              {toc.length >= 3 ? (
                // Collapsed: the answer-first opening paragraph stays the first thing a reader sees, while the jump links
                // remain in the HTML for crawlers and for anyone who opens the list.
                <details className="blog-toc">
                  <summary className="t-label blog-toc__title">{c.onThisPage}</summary>
                  <nav aria-label={c.onThisPage}>
                    <ol>
                      {toc.map((t) => (
                        <li key={t.id}>
                          <a href={`#${t.id}`}>{t.text}</a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </details>
              ) : null}
              <div className="blog-article__body">
                {post.content_blocks && post.content_blocks.length > 0 ? (
                  <BlockRenderer blocks={post.content_blocks} />
                ) : (
                  post.content.split(/\n{2,}/).map((paragraph, i) => <p key={i}>{paragraph}</p>)
                )}
                {faq.length > 0 ? (
                  <section aria-labelledby="post-faq">
                    <h2 id="post-faq">{c.faqTitle}</h2>
                    {faq.map((f, i) => (
                      <div key={i}>
                        <h3>{f.question}</h3>
                        <p>{f.answer}</p>
                      </div>
                    ))}
                  </section>
                ) : null}
              </div>

              {post.tags.length > 0 ? (
                <div className="blog-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="kit-pill kit-pill--muted">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>

            <aside className="blog-sidebar" aria-label={author.name}>
              <AuthorBox author={author} copy={c} teamMark={<Image src={teamLogo} alt="" width={28} height={28} />} />
              <MoreByAuthor author={author} posts={moreByAuthor} locale={locale} copy={c} />
            </aside>
            </div>

            {related.length > 0 ? (
              <aside className="blog-related" aria-labelledby="post-related">
                <h2 id="post-related" className="t-h3 blog-related__title">
                  {c.relatedTitle}
                </h2>
                <div className="blog-grid">
                  {related.map((r) => (
                    <PostCard key={r.id} post={r} />
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </section>

        <CtaBand
          title={c.ctaTitle}
          primary={{ label: c.startAnalysis, href: "https://www.georepute.ai/signup" }}
          secondary={{ label: c.backToBlog, href: blogPath(locale) }}
          locale={locale}
        />
      </div>
    </SiteShell>
  );
}
