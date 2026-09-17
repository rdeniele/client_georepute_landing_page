import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Crumbs, CtaBand, PageHero } from "@/components/subpages/kit";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedPostBySlug } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils/format";

type Params = { slug: string };

async function loadPost(slug: string) {
  const supabase = await createSupabaseServerClient();
  return getPublishedPostBySlug(supabase, slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  let post;
  try {
    post = await loadPost(slug);
  } catch {
    return { title: "Blog | GeoRepute" };
  }
  if (!post) return { title: "Post not found | GeoRepute" };

  const description = post.excerpt ?? post.content.slice(0, 160);

  return {
    title: `${post.title} | GeoRepute Blog`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
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

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let post;
  try {
    post = await loadPost(slug);
  } catch {
    post = undefined;
  }

  if (post === undefined) {
    return (
      <SiteShell locale="en">
        <div className="kit-page blog-page">
          <section className="kit-section" data-section>
            <div className="shell">
              <div className="blog-state" role="alert">
                <h2 className="t-h3 blog-state__title">This post is temporarily unavailable</h2>
                <p className="t-body">We couldn&apos;t reach the content service. Please try again shortly.</p>
              </div>
            </div>
          </section>
        </div>
      </SiteShell>
    );
  }

  if (post === null) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.featured_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author?.full_name ? { "@type": "Person", name: post.author.full_name } : undefined,
    mainEntityOfPage: `/blog/${post.slug}`,
  };

  return (
    <SiteShell locale="en">
      <div className="kit-page blog-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        <PageHero
          id="post"
          crumbs={<Crumbs locale="en" trail={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />}
          eyebrow={post.category ?? "Insight"}
          title={post.title}
          lead={post.excerpt ?? undefined}
          meta={
            <div className="blog-card__meta">
              {post.published_at ? <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> : null}
              {post.author?.full_name ? <span>{post.author.full_name}</span> : null}
            </div>
          }
        />

        <section className="kit-section kit-section--tight" data-section>
          <div className="shell">
            <article className="blog-article">
              {post.featured_image ? (
                <div className="blog-article__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.featured_image} alt="" />
                </div>
              ) : null}

              <div className="blog-article__body">
                {post.content_blocks && post.content_blocks.length > 0 ? (
                  <BlockRenderer blocks={post.content_blocks} />
                ) : (
                  post.content.split(/\n{2,}/).map((paragraph, i) => <p key={i}>{paragraph}</p>)
                )}
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
          title="See what GeoRepute sees about your business."
          primary={{ label: "Start Analysis", href: "https://www.georepute.ai/signup" }}
          secondary={{ label: "Back to Blog", href: "/blog" }}
          locale="en"
        />
      </div>
    </SiteShell>
  );
}
