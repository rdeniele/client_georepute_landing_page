import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/Button";

export default function BlogPostNotFound() {
  return (
    <SiteShell locale="en">
      <div className="kit-page blog-page">
        <section className="kit-section" data-section>
          <div className="shell">
            <div className="blog-state">
              <h1 className="t-h2 blog-state__title">Post not found</h1>
              <p className="t-body">
                This post doesn&apos;t exist, or it hasn&apos;t been published yet.
              </p>
              <Button href="/blog" variant="ghost">
                Back to Blog
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
