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
 * DARK is the default experience — the site opens in its original "Signal
 * Room" treatment. LIGHT is an explicit visitor choice, applied as the
 * absence of `theme-dark` on <html> and persisted. The stored choice is
 * adopted after hydration to keep the server and client renders identical;
 * the inline script in layout.tsx applies it before first paint too, so a
 * visitor who chose light never sees a dark flash on return.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "georepute-theme";

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
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
  // dark (the SSR default — see the inline script in layout.tsx) and adopts
  // the stored choice in an effect. Reading localStorage in the initialiser
  // instead produced a hydration mismatch on every control whose label
  // depends on the theme.
  const [theme, setTheme] = useState<Theme>("dark");
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
