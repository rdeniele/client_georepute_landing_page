import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./ui.css";
import "./sections.css";

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
  themeColor: "#0A1020",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${editorial.variable} ${mono.variable}`}
    >
      <body>
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
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
