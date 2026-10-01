"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/brand/logo-g-mark.png";
import { nav } from "@/lib/content";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

/** In-page anchors; the site is a single page. */
const LINKS = [
  { label: "How it works", href: "#platform-flow" },
  { label: "Intelligence", href: "#executive" },
  { label: "Contact", href: "#analyze" },
] as const;

/**
 * Primary navigation: brand, three in-page links, theme toggle and the primary CTA.
 *
 * Starts transparent over the hero and gains a glass backing once the page has
 * moved; the network should own the first viewport, not the chrome.
 */
export function Navigation() {
  const [lifted, setLifted] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`nav ${lifted || drawer ? "nav--lifted" : ""}`}>
      <div className="nav__shell">
        <a href="#top" className="nav__brand" aria-label={`${nav.brand.name} home`}>
          <Image src={logo} alt="" width={32} height={32} className="nav__logo" priority />
          <span className="nav__wordmark">
            <span className="nav__name">{nav.brand.name}</span>
            <span className="nav__sub">{nav.brand.sub}</span>
          </span>
        </a>

        <nav className="nav__primary" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <ThemeToggle />
          <Button href={nav.cta.href} variant="conversion" className="nav__cta">
            {nav.cta.label}
          </Button>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={drawer}
            aria-controls="nav-drawer"
            onClick={() => setDrawer((v) => !v)}
          >
            <span className="sr-only">{drawer ? "Close menu" : "Open menu"}</span>
            <span className={`nav__burger ${drawer ? "is-open" : ""}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="nav-drawer" className="nav__drawer" hidden={!drawer}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="nav__drawer-link" onClick={() => setDrawer(false)}>
            {l.label}
          </a>
        ))}
        <div className="nav__drawer-actions">
          <Button href={nav.cta.href} variant="conversion">
            {nav.cta.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
