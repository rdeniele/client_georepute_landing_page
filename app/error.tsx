"use client";

import { useEffect } from "react";

/**
 * Route-segment error boundary (App Router convention: catches a render
 * error anywhere below the root layout and shows this instead of nothing).
 *
 * Before this file existed there was no error boundary anywhere in the app,
 * so any uncaught client exception (a WebGL context loss in the home page's
 * background scene, a GSAP/ScrollTrigger failure, anything) unmounted the
 * whole React tree and left a blank page, most visible after switching back
 * to a backgrounded tab. Styled with inline styles and CSS variables only
 * (never a component class), since the failure that lands here may be the
 * very reason a stylesheet chunk did not apply.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[georepute] page error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        background: "var(--color-void, #0C1134)",
        color: "var(--color-ink, #F4F2FF)",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <p
          style={{
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.6,
            marginBottom: 10,
          }}
        >
          Something went wrong
        </p>
        <h1 style={{ fontSize: "1.4rem", margin: "0 0 8px", fontWeight: 600 }}>
          This page hit a snag.
        </h1>
        <p style={{ opacity: 0.75, margin: "0 0 22px", lineHeight: 1.55 }}>
          Try again, or reload the page. If it keeps happening, switching tabs back and forth
          shortly before this helps us track it down.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: "0.95rem",
              cursor: "pointer",
              border: "1px solid transparent",
              background: "var(--color-signal-core, #744bd1)",
              color: "#fff",
            }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: "0.95rem",
              cursor: "pointer",
              border: "1px solid var(--line, rgba(255,255,255,0.2))",
              background: "transparent",
              color: "inherit",
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
