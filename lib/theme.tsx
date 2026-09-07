"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Theme system.
 *
 * LIGHT is the default experience by client requirement — the site must open
 * bright even when the OS prefers dark. DARK is an explicit visitor choice,
 * applied as `theme-dark` on <html> and persisted. A tiny inline script in
 * the layout re-applies the persisted class before first paint so the choice
 * survives reloads without a flash of the wrong theme.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "georepute-theme";

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0A1020" : "#F6F5FC");
}

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The first client render has to match the server's, so it always starts
  // light and adopts the stored choice in an effect. Reading localStorage in
  // the initialiser instead produced a hydration mismatch on every control
  // whose label depends on the theme. There is no flash: the inline script in
  // the layout has already put the right class on <html> before first paint,
  // and applyThemeClass deliberately holds off until that value is known.
  const [theme, setTheme] = useState<Theme>("light");
  const [adopted, setAdopted] = useState(false);

  useEffect(() => {
    setTheme(readStoredTheme());
    setAdopted(true);
  }, []);

  useEffect(() => {
    if (!adopted) return;
    applyThemeClass(theme);
  }, [theme, adopted]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Persistence is a convenience, never a requirement
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}