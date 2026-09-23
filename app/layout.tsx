import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { LOCALES, localeDirections } from "@/lib/i18n";
import "./globals.css";
import "./ui.css";
import "./sections.css";
import "./bands.css";
import "./subpages.css";
import "./warroom.css";
import "./kit.css";
import "./pages-engines.css";
import "./pages-product.css";
import "./pages-info.css";
import "./intro.css";
import "./trymodal.css";
import "./cookies.css";
import "./blog.css";
import "./admin.css";

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
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: "GeoRepute | Strategic Business Intelligence Infrastructure",
  description:
    "Every business should have its own intelligence center. GeoRepute builds a living strategic intelligence layer around the business and turns hundreds of signals into one strategic picture, priorities and next moves.",
};

export const viewport: Viewport = {
  // Dark is the default experience; the theme provider syncs this meta tag
  // when the visitor switches to light.
  themeColor: "#0C1134",
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
      // hydrates, which is the point of it, React must not try to revert it.
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
        {/* Sets lang/dir from the URL before first paint, so RTL locales don't
            flash LTR while waiting for LocaleAttributes' post-hydration effect. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=(location.pathname.split("/")[1]||"");var locales=${JSON.stringify(LOCALES)};var dirs=${JSON.stringify(localeDirections)};if(locales.indexOf(l)===-1)l="en";document.documentElement.lang=l;document.documentElement.dir=dirs[l];document.documentElement.dataset.locale=l}catch(e){}`,
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
        <CookieConsentBanner />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
