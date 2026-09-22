"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getIntroCopy,
  INTRO_OPEN_EVENT,
  INTRO_STORAGE_KEY,
  introVideo,
  type IntroCopy,
} from "@/lib/intro";

/** Asks ScrollProvider to pause/resume Lenis while the dialog owns the screen. */
export const SCROLL_LOCK_EVENT = "georepute:scroll-lock";

const OPEN_DELAY_MS = 650;
const CLOSE_MS = 240;
/** Matches the modal's own single-column breakpoint (app/intro.css `max-width: 980px`). */
const DESKTOP_QUERY = "(min-width: 981px)";

type Phase = "closed" | "open" | "closing";

function readSeen() {
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSeen() {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* storage unavailable, the dialog simply shows again next visit */
  }
}

export function lockScroll(lock: boolean) {
  const root = document.documentElement;
  if (lock) {
    const gutter = window.innerWidth - root.clientWidth;
    root.style.setProperty("--intro-gutter", `${gutter}px`);
    root.classList.add("intro-lock");
  } else {
    root.classList.remove("intro-lock");
    root.style.removeProperty("--intro-gutter");
  }
  window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: lock }));
}

function VideoArea({ c, isDesktop }: { c: IntroCopy; isDesktop: boolean }) {
  const active = introVideo && (!introVideo.desktopOnly || isDesktop) ? introVideo : null;

  if (active?.kind === "file") {
    return (
      <video
        className="intro__video"
        controls
        playsInline
        preload="metadata"
        poster={active.poster}
        aria-label={c.videoLabel}
      >
        <source src={active.src} />
        {active.captions ? <track kind="captions" src={active.captions} default /> : null}
      </video>
    );
  }
  if (active?.kind === "embed") {
    return (
      <iframe
        className="intro__video"
        src={active.src}
        title={c.videoLabel}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  return (
    <div className="intro__placeholder" role="img" aria-label={`${c.placeholderTag}. ${c.placeholderNote}`}>
      <span className="intro__placeholder-grid" aria-hidden="true" />
      <span className="intro__placeholder-tag">{c.placeholderTag}</span>
      <span className="intro__placeholder-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />
        </svg>
      </span>
      <span className="intro__placeholder-title">{c.placeholderTitle}</span>
      <span className="intro__placeholder-note">{c.placeholderNote}</span>
    </div>
  );
}

export function IntroModal({ locale = "en" }: { locale?: string }) {
  const c = getIntroCopy(locale);
  const [phase, setPhase] = useState<Phase>("closed");
  // Defaults to desktop: nothing renders before `visible` flips true (well after
  // mount), by which point the effect below has already run, so this default
  // is never actually shown.
  const [isDesktop, setIsDesktop] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // A `desktopOnly` video (see lib/intro.ts) only plays above this width; kept
  // live so resizing the window while the dialog is open still swaps correctly.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const open = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    returnFocus.current = document.activeElement as HTMLElement | null;
    setPhase("open");
  }, []);

  const close = useCallback(() => {
    writeSeen();
    dialogRef.current?.querySelectorAll("video").forEach((v) => v.pause());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("closing");
    closeTimer.current = window.setTimeout(() => setPhase("closed"), reduced ? 0 : CLOSE_MS);
  }, []);

  // First entry: open once, unless already dismissed. `?intro` forces it.
  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("intro");
    let t: number | undefined;
    if (forced || !readSeen()) t = window.setTimeout(open, OPEN_DELAY_MS);
    const onOpen = () => open();
    window.addEventListener(INTRO_OPEN_EVENT, onOpen);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(closeTimer.current);
      window.removeEventListener(INTRO_OPEN_EVENT, onOpen);
    };
  }, [open]);

  // Scroll lock + focus handoff tied to visibility
  const visible = phase !== "closed";
  useEffect(() => {
    if (!visible) return;
    lockScroll(true);
    const raf = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      lockScroll(false);
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [visible]);

  // Escape to close, Tab kept inside the dialog
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), video[controls], iframe, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, close]);

  if (!visible) return null;

  return createPortal(
    <div className="intro" data-state={phase} dir={locale === "he" || locale === "ar" ? "rtl" : "ltr"}>
      <div className="intro__backdrop" onClick={close} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="intro__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        aria-describedby="intro-desc"
        tabIndex={-1}
        data-lenis-prevent
      >
        <button type="button" className="intro__close" onClick={close} aria-label={c.close}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="intro__scroll">
          <header className="intro__head">
            <span className="intro__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-g-mark.png" alt="" width="28" height="28" />
              GeoRepute
            </span>
            <span className="t-eyebrow intro__eyebrow">{c.eyebrow}</span>
            <h2 id="intro-title" className="intro__title">
              {c.title}
            </h2>
            <p id="intro-desc" className="intro__lead">
              {c.intro}
            </p>
          </header>

          <figure className="intro__media">
            <div className="intro__frame">
              <VideoArea c={c} isDesktop={isDesktop} />
            </div>
            <figcaption className="intro__points">
              <span className="t-label">{c.pointsLabel}</span>
              <ol>
                {c.points.map((p, i) => (
                  <li key={p} style={{ "--i": i } as React.CSSProperties}>
                    <span className="intro__point-n">{String(i + 1).padStart(2, "0")}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </figcaption>
          </figure>

          <p className="intro__takeaway">{c.takeaway}</p>
        </div>

        <footer className="intro__actions">
          <button type="button" className="btn btn--primary intro__explore" onClick={close}>
            <span className="btn__inner">
              <span className="btn__label">{c.explore}</span>
              <svg className="btn__arrow" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          <button type="button" className="intro__skip" onClick={close}>
            {c.skip}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/** A quiet "watch the introduction" control, for placing anywhere on the site. */
export function IntroTrigger({ locale = "en", className = "" }: { locale?: string; className?: string }) {
  const c = getIntroCopy(locale);
  return (
    <button
      type="button"
      className={`intro-trigger ${className}`}
      onClick={() => window.dispatchEvent(new Event(INTRO_OPEN_EVENT))}
    >
      <span className="intro-trigger__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />
        </svg>
      </span>
      {c.replay}
    </button>
  );
}
