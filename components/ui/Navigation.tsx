"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/public/brand/logo-g-mark.png";
import { getLocaleCopy, localeNames, localizeNav, normalizeLocale, LOCALES } from "@/lib/i18n";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Primary navigation.
 *
 * Mirrors the live site's three mega-menu groups, direct links, and primary CTA.
 * Groups open on hover for pointer users but are real
 * `aria-expanded` buttons underneath, so the whole menu works from the keyboard
 *, Escape closes and returns focus to the trigger, and moving focus out of a
 * group closes it.
 *
 * Starts transparent over the hero and gains a glass backing once the page has
 * moved; the network should own the first viewport, not the chrome.
 */
export function Navigation() {
  const pathname = usePathname();
  // /blog and /blog/[slug] are not under a /{locale}/ path (see lib/utils/postLocale.ts):
  // they carry their language as a `?lang=` query param instead (English has none). The
  // path-prefix scheme below does not apply there, so both which language is "current" and
  // what a language link should point to are read from the query on those routes.
  const isBlogRoute = pathname === "/blog" || pathname.startsWith("/blog/");
  // usePathname() never includes the query string, and this runs during SSR (no `window`
  // yet), so the query is read after mount and defaults to "no query" until then — the
  // dropdown is closed at that point, so nothing user-visible depends on the gap.
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (isBlogRoute) setSearch(window.location.search);
  }, [isBlogRoute, pathname]);
  const locale = isBlogRoute ? normalizeLocale(new URLSearchParams(search).get("lang") ?? undefined) : normalizeLocale(pathname.split("/")[1]);
  const localizedNav = localizeNav(locale);
  const localeCopy = getLocaleCopy(locale);

  function localeHref(code: string): string {
    if (isBlogRoute) {
      const params = new URLSearchParams(search);
      if (code === "en") params.delete("lang");
      else params.set("lang", code);
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    }
    return pathname.replace(/^\/(?:en|he|ar|ru|fr|es|pt)(?=\/|$)/, `/${code}`);
  }
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
        <a href={localizedNav.brand.href} className="nav__brand" aria-label={`${localizedNav.brand.name} home`}>
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="nav__logo"
            priority
          />
          <span className="nav__wordmark">
            <span className="nav__name">{localizedNav.brand.name}</span>
            <span className="nav__sub">{localizedNav.brand.sub}</span>
          </span>
        </a>

        <nav className="nav__primary" aria-label="Primary">
          {localizedNav.groups.map((g) => (
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

          {localizedNav.links.map((l) => (
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
           <details className="nav__locale">
            <summary className="nav__locale-trigger">
              <span className="sr-only">{localeCopy.nav.language || "Language"}</span>
              <span aria-hidden="true">{locale.toUpperCase()}</span>
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="nav__locale-menu" role="menu" aria-label={localeCopy.nav.language || "Language"}>
              {LOCALES.map((code) => {
                const href = localeHref(code);
                return (
                  <a key={code} href={href} role="menuitem" aria-current={code === locale ? "true" : undefined}>
                    <span>{localeNames[code]}</span>
                    <small>{code}</small>
                  </a>
                );
              })}
            </div>
          </details>
          <ThemeToggle />
          <Button href={localizedNav.cta.href} variant="conversion" className="nav__cta">
            {localizedNav.cta.label}
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
        {localizedNav.groups.map((g) => (
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

        {localizedNav.links.map((l) => (
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
           <Button href={localizedNav.cta.href} variant="conversion">
            {localizedNav.cta.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
