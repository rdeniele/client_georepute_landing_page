import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Crumbs, PageHero } from "@/components/subpages/kit";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostByPreviewToken } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils/format";

type Params = { token: string };

async function loadPost(token: string) {
  const supabase = await createSupabaseServerClient();
  return getPostByPreviewToken(supabase, token);
}

/** Never indexed — this route exists only for a link shared by hand, not for search engines or the public blog listing. */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { token } = await params;

  let post;
  try {
    post = await loadPost(token);
  } catch {
    return { title: "Preview | GeoRepute", robots: { index: false, follow: false } };
  }

  return {
    title: post ? `Preview: ${post.title} | GeoRepute` : "Preview not found | GeoRepute",
    robots: { index: false, follow: false },
  };
}

export default async function BlogPreviewPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;

  let post;
  try {
    post = await loadPost(token);
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
                <h2 className="t-h3 blog-state__title">This preview is temporarily unavailable</h2>
                <p className="t-body">We couldn&apos;t reach the content service. Please try again shortly.</p>
              </div>
            </div>
          </section>
        </div>
      </SiteShell>
    );
  }

  if (post === null) notFound();

  return (
    <SiteShell locale="en">
      <div className="kit-page blog-page">
        <PageHero
          id="preview"
          crumbs={<Crumbs locale="en" trail={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />}
          eyebrow={post.status === "draft" ? "Draft preview" : post.category ?? "Insight"}
          title={post.title}
          lead={post.excerpt ?? undefined}
          meta={
            <div className="blog-card__meta">
              <time dateTime={post.updated_at}>Last updated {formatDate(post.updated_at)}</time>
            </div>
          }
        />

        <section className="kit-section kit-section--tight" data-section>
          <div className="shell">
            {post.status === "draft" ? (
              <div className="admin-banner admin-banner--info" role="status">
                This is an unpublished draft shared via a private link. It isn&apos;t listed on the public blog and
                isn&apos;t indexed by search engines.
              </div>
            ) : (
              <div className="admin-banner admin-banner--info" role="status">
                This post is already published — <a href={`/blog/${post.slug}`}>view the live version</a>.
              </div>
            )}

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
      </div>
    </SiteShell>
  );
}
