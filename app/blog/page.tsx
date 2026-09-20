import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Crumbs, CtaBand, PageHero, SectionIntro } from "@/components/subpages/kit";
import { PostCard } from "@/components/blog/PostCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedPosts } from "@/lib/services/posts";

export const metadata: Metadata = {
  title: "Blog | GeoRepute",
  description:
    "Notes on AI visibility, competitive intelligence and how strategic business decisions actually get made, from the GeoRepute team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const supabase = await createSupabaseServerClient();

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let loadFailed = false;
  try {
    posts = await getPublishedPosts(supabase);
  } catch {
    loadFailed = true;
  }

  return (
    <SiteShell locale="en">
      <div className="kit-page blog-page">
        <PageHero
          id="blog"
          layout="stack"
          backdrop="network"
          crumbs={<Crumbs locale="en" trail={[{ label: "Blog" }]} />}
          eyebrow="Insights"
          title="From the GeoRepute team."
          lead="Notes on AI visibility, competitive intelligence and how strategic decisions actually get made."
        />

        <section className="kit-section" data-section>
          <div className="shell">
            <SectionIntro index="01" label="Latest" title="Recent posts" />

            {loadFailed ? (
              <div className="blog-state" role="alert">
                <h2 className="t-h3 blog-state__title">Posts are temporarily unavailable</h2>
                <p className="t-body">We couldn&apos;t reach the content service. Please try again shortly.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="blog-state">
                <h2 className="t-h3 blog-state__title">No posts published yet</h2>
                <p className="t-body">Check back soon — new posts will appear here as soon as they&apos;re published.</p>
              </div>
            ) : (
              <div className="blog-grid">
                {posts.map((post, i) => (
                  <div key={post.id} data-reveal data-reveal-delay={String(Math.min(i, 6) * 60)}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <CtaBand
          title="See what GeoRepute sees about your business."
          body="A living intelligence layer that turns hundreds of signals into one strategic picture."
          primary={{ label: "Start Analysis", href: "https://www.georepute.ai/signup" }}
          locale="en"
        />
      </div>
    </SiteShell>
  );
}
