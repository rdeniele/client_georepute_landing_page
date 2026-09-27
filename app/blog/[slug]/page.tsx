import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { CalendarBlank, Clock, UserCircle } from "@phosphor-icons/react/ssr";
import { Crumbs, CtaBand, PageHero } from "@/components/subpages/kit";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedAlternates, getPublishedPostBySlug } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils/format";
import { blogPath, toPostLocale } from "@/lib/utils/postLocale";
import type { PostLocale } from "@/types/posts";
import { getBlogChromeCopy } from "@/lib/subpages/blogChrome";

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
  if (!post) return { title: "Post not found | GeoRepute" };

  // The SEO fields written for this language (automation) win; posts written by hand fall back to the title and excerpt.
  const description = post.meta_description || post.excerpt || post.content.slice(0, 160);
  const languages = await loadAlternates(post);

  return {
    title: post.meta_title || `${post.title} | GeoRepute Blog`,
    description,
    keywords: post.keywords?.length ? post.keywords : undefined,
    alternates: { canonical: blogPath(post.locale, post.slug), ...(languages ? { languages } : {}) },
    openGraph: {
      type: "article",
      locale: post.locale,
      title: post.meta_title || post.title,
      description,
      url: blogPath(post.locale, post.slug),
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: post.featured_image ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

/** Escapes `<` so a JSON-LD payload can't prematurely close the surrounding `<script>` tag. */
function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.featured_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author?.full_name ? { "@type": "Person", name: post.author.full_name } : undefined,
    mainEntityOfPage: blogPath(post.locale, post.slug),
    inLanguage: post.locale,
    keywords: post.keywords?.length ? post.keywords.join(", ") : undefined,
  };
  const faq = (post.faq ?? []).filter((f) => f?.question && f?.answer);
  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: post.locale,
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }
    : null;

  return (
    <SiteShell locale={locale}>
      <div className="kit-page blog-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} /> : null}
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
              {post.author?.full_name ? (
                <li className="blog-meta__chip">
                  <UserCircle weight="duotone" aria-hidden="true" />
                  <span>{post.author.full_name}</span>
                </li>
              ) : null}
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
                <img src={post.featured_image} alt="" />
              </div>
            ) : null}

            <article className="blog-article">
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
