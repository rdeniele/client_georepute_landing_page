"use client";

import { useTheme } from "@/lib/theme";

/**
 * Minimal premium theme switcher for the navigation.
 *
 * A 44px pill that swaps sun/moon glyphs. Light is the default experience, so
 * the control reads "switch to dark" at rest; the icon flips once the visitor
 * has chosen dark.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <svg
        className="theme-toggle__icon theme-toggle__icon--sun"
        viewBox="0 0 20 20"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M3.5 3.5l1.6 1.6M14.9 14.9l1.6 1.6M16.5 3.5l-1.6 1.6M5.1 14.9l-1.6 1.6" />
        </g>
      </svg>
      <svg
        className="theme-toggle__icon theme-toggle__icon--moon"
        viewBox="0 0 20 20"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path
          d="M16.6 12.4A7 7 0 0 1 7.6 3.4a7 7 0 1 0 9 9Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}