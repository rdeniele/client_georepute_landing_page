import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";
import "./ui.css";
import "./sections.css";
import "./bands.css";
import "./subpages.css";

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["400", "500", "600"],
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GeoRepute — See where your business is recognized, recommended, and chosen",
  description:
    "GeoRepute maps the decision environment around your business — across AI, search, reputation, competitors, and the signals that influence what customers choose.",
};

export const viewport: Viewport = {
  // Dark is the default experience; the theme provider syncs this meta tag
  // when the visitor switches to light.
  themeColor: "#0A1020",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`theme-dark ${display.variable} ${editorial.variable} ${mono.variable}`}
      // The inline script below mutates class and color-scheme before React
      // hydrates, which is the point of it — React must not try to revert it.
      suppressHydrationWarning
    >
      <body>
        {/* Dark is the server-rendered default (the class above). A visitor
            who explicitly chose light needs that choice applied before first
            paint too, or they see a dark flash on every return visit. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("georepute-theme")==="light"){document.documentElement.classList.remove("theme-dark");document.documentElement.style.colorScheme="light";document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#F6F5FC")}}catch(e){}`,
          }}
        />
        {/* Scroll reveals start hidden and are shown by IntersectionObserver.
            If scripting is unavailable that observer never runs, so without
            this the entire page below the hero would stay blank. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>[data-reveal],[data-draw]{opacity:1!important;transform:none!important}</style>`,
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
