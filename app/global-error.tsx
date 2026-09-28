"use client";

import { useEffect } from "react";

/**
 * Root-layout error boundary (App Router convention). `app/error.tsx` only
 * catches errors below the root layout; a crash in the layout itself (or
 * anywhere React re-throws past every nested boundary) skips straight past
 * it and, without this file, leaves a genuinely blank white tab with nothing
 * in the DOM at all. This file replaces the whole document on that path, so
 * it renders its own <html>/<body> and cannot rely on globals.css, the theme
 * class on <html>, or any component styles, all of which may be exactly
 * what failed to apply. Colors are hard-coded and switch on the OS color
 * scheme directly, since the site's own ThemeProvider never got to run.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[georepute] root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html,body{height:100%}
              body{margin:0;display:flex;align-items:center;justify-content:center;
                background:#0C1134;color:#F4F2FF;
                font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif;
                padding:24px;text-align:center}
              @media (prefers-color-scheme: light){
                body{background:#F6F4FF;color:#171433}
              }
              .eg-card{max-width:420px}
              .eg-card p.eg-eyebrow{font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;opacity:.6;margin:0 0 10px}
              .eg-card h1{font-size:1.4rem;margin:0 0 8px;font-weight:600}
              .eg-card p.eg-lead{opacity:.75;margin:0 0 22px;line-height:1.55}
              .eg-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
              .eg-btn{border-radius:999px;padding:10px 22px;font-size:.95rem;cursor:pointer;font-family:inherit}
              .eg-btn--primary{border:1px solid transparent;background:#744bd1;color:#fff}
              .eg-btn--secondary{border:1px solid rgba(255,255,255,0.2);background:transparent;color:inherit}
              @media (prefers-color-scheme: light){
                .eg-btn--secondary{border-color:rgba(23,20,51,0.18)}
              }
            `,
          }}
        />
        <div className="eg-card">
          <p className="eg-eyebrow">Something went wrong</p>
          <h1>This page couldn&apos;t load.</h1>
          <p className="eg-lead">
            An unexpected error stopped the page from rendering. Reloading usually fixes it.
          </p>
          <div className="eg-actions">
            <button type="button" className="eg-btn eg-btn--primary" onClick={() => reset()}>
              Try again
            </button>
            <button
              type="button"
              className="eg-btn eg-btn--secondary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
