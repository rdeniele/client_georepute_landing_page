export default function BlogLoading() {
  return (
    <div className="kit-page blog-page">
      <section className="kit-section" data-section>
        <div className="shell">
          <div className="blog-grid" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="kit-card blog-card">
                <div className="blog-card__media" style={{ opacity: 0.5 }} />
                <div className="blog-card__body">
                  <span className="t-label" style={{ opacity: 0.4 }}>
                    Loading
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
