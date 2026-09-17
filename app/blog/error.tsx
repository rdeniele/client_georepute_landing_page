"use client";

export default function BlogError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="kit-page blog-page">
      <section className="kit-section" data-section>
        <div className="shell">
          <div className="blog-state" role="alert">
            <h2 className="t-h3 blog-state__title">Something went wrong loading the blog</h2>
            <p className="t-body">Please try again in a moment.</p>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
