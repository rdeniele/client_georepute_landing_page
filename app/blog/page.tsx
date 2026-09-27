import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Crumbs, CtaBand, PageHero, SectionIntro } from "@/components/subpages/kit";
import { PostCard } from "@/components/blog/PostCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedCategories, getPublishedPosts } from "@/lib/services/posts";
import { POST_LOCALES, blogPath, toPostLocale } from "@/lib/utils/postLocale";
import type { PostLocale } from "@/types/posts";
import { getBlogChromeCopy } from "@/lib/subpages/blogChrome";

type BlogSearchParams = { lang?: string; category?: string; page?: string };

/** Posts per page. Enough for a busy schedule to stay browsable: the index pages instead of silently dropping older posts. */
const PAGE_SIZE = 24;

const pageNumber = (raw?: string) => Math.max(1, Math.min(500, Number.parseInt(raw ?? "1", 10) || 1));

function categoryHref(locale: PostLocale, category?: string, page = 1) {
  return blogPath(locale, undefined, { category, page: page > 1 ? String(page) : undefined });
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<BlogSearchParams> }): Promise<Metadata> {
  const { lang, category, page } = await searchParams;
  const locale = toPostLocale(lang);
  const c = getBlogChromeCopy(locale);
  // Each language is its own index page, so it is its own canonical page and lists the others as alternates.
  const languages = Object.fromEntries(POST_LOCALES.map((l) => [l, blogPath(l)]));
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: categoryHref(locale, category, pageNumber(page)), languages: { ...languages, "x-default": blogPath("en") } },
  };
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const { lang, category, page: rawPage } = await searchParams;
  const locale: PostLocale = toPostLocale(lang);
  const page = pageNumber(rawPage);
  const c = getBlogChromeCopy(locale);

  const supabase = await createSupabaseServerClient();

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let categories: string[] = [];
  let loadFailed = false;
  try {
    // One extra row tells us whether a next page exists without a second count query.
    [posts, categories] = await Promise.all([
      getPublishedPosts(supabase, { locale, category: category || undefined, limit: PAGE_SIZE + 1, offset: (page - 1) * PAGE_SIZE }),
      getPublishedCategories(supabase, locale),
    ]);
  } catch {
    loadFailed = true;
  }

  const hasNext = posts.length > PAGE_SIZE;
  const visiblePosts = posts.slice(0, PAGE_SIZE);

  return (
    <SiteShell locale={locale}>
      <div className="kit-page blog-page">
        <PageHero
          id="blog"
          layout="stack"
          backdrop="network"
          crumbs={<Crumbs locale={locale} trail={[{ label: c.crumb }]} />}
          eyebrow={c.eyebrow}
          title={c.title}
          lead={c.lead}
        />

        <section className="kit-section" data-section>
          <div className="shell">
            <SectionIntro index="01" label={c.recentLabel} title={c.recentTitle} />

            {categories.length > 0 ? (
              <div className="blog-tags blog-filters" role="navigation" aria-label="Filter by category">
                <a href={categoryHref(locale)} className={`kit-pill${!category ? " kit-pill--active" : ""}`}>
                  {c.allFilter}
                </a>
                {categories.map((c) => (
                  <a
                    key={c}
                    href={categoryHref(locale, c)}
                    className={`kit-pill${category === c ? " kit-pill--active" : ""}`}
                  >
                    {c}
                  </a>
                ))}
              </div>
            ) : null}

            {loadFailed ? (
              <div className="blog-state" role="alert">
                <h2 className="t-h3 blog-state__title">{c.unavailableTitle}</h2>
                <p className="t-body">{c.unavailableBody}</p>
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="blog-state">
                <h2 className="t-h3 blog-state__title">{c.emptyTitle}</h2>
                <p className="t-body">{c.emptyBody}</p>
              </div>
            ) : (
              <div className="blog-grid">
                {visiblePosts.map((post, i) => (
                  <div key={post.id} data-reveal data-reveal-delay={String(Math.min(i, 6) * 60)}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}

            {page > 1 || hasNext ? (
              <nav className="blog-tags blog-filters" aria-label="Pages" style={{ marginTop: 32 }}>
                {page > 1 ? (
                  <a className="kit-pill" href={categoryHref(locale, category, page - 1)} rel="prev">
                    {c.newerPosts}
                  </a>
                ) : null}
                {hasNext ? (
                  <a className="kit-pill" href={categoryHref(locale, category, page + 1)} rel="next">
                    {c.olderPosts}
                  </a>
                ) : null}
              </nav>
            ) : null}
          </div>
        </section>

        <CtaBand
          title={c.ctaTitle}
          body={c.ctaBody}
          primary={{ label: c.startAnalysis, href: "https://www.georepute.ai/signup" }}
          locale={locale}
        />
      </div>
    </SiteShell>
  );
}
