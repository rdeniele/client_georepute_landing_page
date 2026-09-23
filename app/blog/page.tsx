import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Crumbs, CtaBand, PageHero, SectionIntro } from "@/components/subpages/kit";
import { PostCard } from "@/components/blog/PostCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedPosts } from "@/lib/services/posts";
import type { PostLocale } from "@/types/posts";
import { getBlogChromeCopy } from "@/lib/subpages/blogChrome";

export const metadata: Metadata = {
  title: "Blog | GeoRepute",
  description:
    "Notes on AI visibility, competitive intelligence and how strategic business decisions actually get made, from the GeoRepute team.",
  alternates: { canonical: "/blog" },
};

type BlogSearchParams = { lang?: string; category?: string };

function categoryHref(locale: PostLocale, category?: string) {
  const params = new URLSearchParams();
  if (locale === "he") params.set("lang", "he");
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const { lang, category } = await searchParams;
  const locale: PostLocale = lang === "he" ? "he" : "en";
  const c = getBlogChromeCopy(locale);

  const supabase = await createSupabaseServerClient();

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let loadFailed = false;
  try {
    // Fetched unfiltered by category (locale-filtered only) so the category
    // pills below can be derived from the full set, then narrowed in-memory —
    // this is a small marketing blog, not worth a second round trip per filter.
    posts = await getPublishedPosts(supabase, { locale, limit: 100 });
  } catch {
    loadFailed = true;
  }

  const categories = Array.from(
    new Set(posts.map((post) => post.category).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  const visiblePosts = category ? posts.filter((post) => post.category === category) : posts;

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
