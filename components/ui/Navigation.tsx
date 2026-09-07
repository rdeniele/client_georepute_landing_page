"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/public/brand/logo-g-mark.png";
import { nav } from "@/lib/content";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Primary navigation.
 *
 * Mirrors the live site: three mega-menu groups, two direct links, sign-in and
 * the primary CTA. Groups open on hover for pointer users but are real
 * `aria-expanded` buttons underneath, so the whole menu works from the keyboard
 * — Escape closes and returns focus to the trigger, and moving focus out of a
 * group closes it.
 *
 * Starts transparent over the hero and gains a glass backing once the page has
 * moved; the network should own the first viewport, not the chrome.
 */
export function Navigation() {
  const pathname = usePathname();
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const liftedRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 40;
      if (next !== liftedRef.current) {
        liftedRef.current = next;
        setLifted(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        const trigger = headerRef.current?.querySelector<HTMLButtonElement>(
          `[data-trigger="${open}"]`,
        );
        setOpen(null);
        trigger?.focus();
      }
      setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // A pointer press anywhere outside the header dismisses an open panel
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    <header
      ref={headerRef}
      className={`nav ${lifted || open ? "nav--lifted" : ""}`}
      onPointerLeave={() => !coarse && setOpen(null)}
    >
      <div className="nav__shell">
        <a href={nav.brand.href} className="nav__brand" aria-label={`${nav.brand.name} — home`}>
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="nav__logo"
            priority
          />
          <span className="nav__wordmark">
            <span className="nav__name">{nav.brand.name}</span>
            <span className="nav__sub">{nav.brand.sub}</span>
          </span>
        </a>

        <nav className="nav__primary" aria-label="Primary">
          {nav.groups.map((g) => (
            <div
              key={g.id}
              className={`nav__group ${g.items.some((item) => pathname.startsWith(item.href)) ? "is-current" : ""}`}
              onPointerEnter={() => !coarse && setOpen(g.id)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOpen((v) => (v === g.id ? null : v));
                }
              }}
            >
              <button
                type="button"
                data-trigger={g.id}
                className={`nav__trigger ${open === g.id ? "is-open" : ""}`}
                aria-expanded={open === g.id}
                aria-controls={`nav-panel-${g.id}`}
                onClick={() => setOpen((v) => (v === g.id ? null : g.id))}
              >
                {g.label}
                <svg
                  className="nav__chev"
                  viewBox="0 0 12 12"
                  width="11"
                  height="11"
                  aria-hidden="true"
                >
                  <path
                    d="M3 4.5 6 7.5 9 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                id={`nav-panel-${g.id}`}
                className={`nav__panel glass ${open === g.id ? "is-open" : ""}`}
                hidden={open !== g.id}
              >
                <ul className="nav__items">
                  {g.items.map((it) => (
                    <li key={it.href + it.name}>
                      <a href={it.href} className="nav__item">
                        <span className="nav__item-name">{it.name}</span>
                        <span className="nav__item-desc">{it.desc}</span>
                      </a>
                    </li>
                  ))}
                </ul>

                {"feature" in g && g.feature ? (
                  <a href={g.feature.href} className="nav__feature">
                    <span className="t-eyebrow">{g.feature.eyebrow}</span>
                    <span className="nav__feature-title">{g.feature.title}</span>
                    <span className="nav__feature-desc">{g.feature.desc}</span>
                    <span className="nav__feature-cta">
                      {g.feature.cta}
                      <span aria-hidden="true"> →</span>
                    </span>
                  </a>
                ) : null}

                {"more" in g && g.more ? (
                  <a href={g.more.href} className="nav__more">
                    {g.more.label}
                    <span aria-hidden="true"> →</span>
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          {nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`nav__link ${pathname.startsWith(l.href) ? "is-current" : ""}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a href={nav.signIn.href} className="nav__signin">
            {nav.signIn.label}
          </a>
          <ThemeToggle />
          <Button href={nav.cta.href} variant="primary" className="nav__cta">
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
        {nav.groups.map((g) => (
          <div key={g.id} className="nav__acc">
            <button
              type="button"
              className="nav__acc-trigger"
              aria-expanded={expanded === g.id}
              onClick={() => setExpanded((v) => (v === g.id ? null : g.id))}
            >
              {g.label}
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path
                  d="M3 4.5 6 7.5 9 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ul className="nav__acc-list" hidden={expanded !== g.id}>
              {g.items.map((it) => (
                <li key={it.href + it.name}>
                  <a
                    href={it.href}
                    className="nav__acc-link"
                    onClick={() => setDrawer(false)}
                  >
                    {it.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {nav.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="nav__drawer-link"
            onClick={() => setDrawer(false)}
          >
            {l.label}
          </a>
        ))}

        <div className="nav__drawer-actions">
          <a href={nav.signIn.href} className="nav__signin">
            {nav.signIn.label}
          </a>
          <Button href={nav.cta.href} variant="primary">
            {nav.cta.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
