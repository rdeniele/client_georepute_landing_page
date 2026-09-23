"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tryTool as base } from "@/lib/content";
import { TRY_OPEN_EVENT } from "@/lib/tryModal";
import { Button } from "@/components/ui/Button";
import { lockScroll } from "@/components/intro/IntroModal";
import { getLocaleCopy } from "@/lib/i18n";
import { getIntroCopy } from "@/lib/intro";

/**
 * Try it on a business, as a modal. Every sign-up CTA on the site opens this
 * (see `Button`). The visitor types a business name and watches a results
 * panel resolve using the same measure vocabulary as the executive dashboard,
 * then the panel goes behind a blur with an unlock CTA that opens the live
 * platform sign-up in a new tab. The values are fixed and illustrative, never
 * a real analysis, which is why the panel carries the same sample-note
 * discipline as the executive dashboard instead of pretending to be a live
 * scan.
 */

const DURATION = 700;
const CLOSE_MS = 240;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Phase = "idle" | "analyzing" | "revealed";
type Visibility = "closed" | "open" | "closing";

export function TryModal({ locale = "en" }: { locale?: string }) {
  const c = getLocaleCopy(locale).tryTool;
  const outOf100 = getLocaleCopy(locale).executive.outOf100;
  const closeLabel = getIntroCopy(locale).close;
  const [visibility, setVisibility] = useState<Visibility>("closed");
  const [domain, setDomain] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const timers = useRef<{ close?: number; analyze?: number }>({});

  const open = useCallback(() => {
    window.clearTimeout(timers.current.close);
    window.clearTimeout(timers.current.analyze);
    returnFocus.current = document.activeElement as HTMLElement | null;
    // Every opening is a fresh test.
    setDomain("");
    setPhase("idle");
    setVisibility("open");
  }, []);

  const close = useCallback(() => {
    window.clearTimeout(timers.current.analyze);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setVisibility("closing");
    timers.current.close = window.setTimeout(() => setVisibility("closed"), reduced ? 0 : CLOSE_MS);
  }, []);

  useEffect(() => {
    const onOpen = () => open();
    const pending = timers.current;
    window.addEventListener(TRY_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(TRY_OPEN_EVENT, onOpen);
      window.clearTimeout(pending.close);
      window.clearTimeout(pending.analyze);
    };
  }, [open]);

  // Scroll lock + focus handoff tied to visibility. The rAF mirrors
  // IntroModal's own initial-focus guard (see components/intro/IntroModal.tsx):
  // focusing synchronously in this effect can miss the portal's first paint.
  const visible = visibility !== "closed";
  useEffect(() => {
    if (!visible) return;
    lockScroll(true);
    const raf = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(raf);
      lockScroll(false);
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [visible]);

  // Escape to close, Tab kept inside the dialog
  useEffect(() => {
    if (visibility !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }, [visibility, close]);

  useEffect(() => {
    if (phase !== "revealed") return;
    const el = panelRef.current;
    if (!el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => (n.textContent = String(n.dataset.count)));
      return;
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const e = easeOut(t);
      nodes.forEach((n) => {
        n.textContent = String(Math.round(Number(n.dataset.count) * e));
      });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || phase !== "idle") return;
    setPhase("analyzing");
    timers.current.analyze = window.setTimeout(() => setPhase("revealed"), 1200);
  };

  if (!visible) return null;

  // Opens in a new tab: `Button` treats any absolute URL as external.
  const unlockHref = domain.trim()
    ? `${base.unlockHref}?domain=${encodeURIComponent(domain.trim())}`
    : base.unlockHref;

  return createPortal(
    <div className="intro trymodal" data-state={visibility} dir={locale === "he" || locale === "ar" ? "rtl" : "ltr"}>
      <div className="intro__backdrop" onClick={close} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="trymodal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trymodal-title"
        aria-describedby="trymodal-desc"
        tabIndex={-1}
        data-lenis-prevent
      >
        <button type="button" className="intro__close" onClick={close} aria-label={closeLabel}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="trymodal__scroll">
          <header className="trymodal__head">
            <p className="t-eyebrow trytool__eyebrow">{c.label}</p>
            <h2 id="trymodal-title" className="trytool__headline">
              {c.headline}
            </h2>
            <p id="trymodal-desc" className="t-lead trytool__body">
              {c.body}
            </p>
          </header>

          <form className="trytool__form" onSubmit={submit}>
            <input
              ref={inputRef}
              type="text"
              className="trytool__input"
              placeholder={c.placeholder}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={phase !== "idle"}
              aria-label={c.placeholder}
            />
            <button
              type="submit"
              className="btn btn--conversion trytool__submit"
              disabled={phase !== "idle" || !domain.trim()}
            >
              {phase === "analyzing" ? c.analyzing : c.submitCta}
            </button>
          </form>

          {phase !== "idle" && (
            <div className="trytool__panel-wrap">
              <div
                ref={panelRef}
                className={`trytool__panel glass ${phase === "revealed" ? "is-blurred" : ""}`}
                aria-live="polite"
              >
                <div className="trytool__panel-bar">
                  <span className="t-label">
                    {c.resultsLabel} &ldquo;{domain.trim()}&rdquo;
                  </span>
                  <span className="trytool__sample">{c.sampleNote}</span>
                </div>
                <ol className="trytool__measures">
                  {base.measures.map((m, i) => (
                    <li key={m.name} className="measure">
                      <span className="measure__name">{c.measureNames[i]}</span>
                      <span className="measure__track" aria-hidden="true">
                        <span
                          className="measure__fill"
                          style={{
                            transform: phase === "revealed" ? `scaleX(${m.value / 100})` : "scaleX(0)",
                          }}
                        />
                      </span>
                      <span className="measure__value">
                        <span data-count={m.value}>0</span>
                        <span className="sr-only"> {outOf100}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {phase === "analyzing" && <div className="trytool__scanline" aria-hidden="true" />}

              {phase === "revealed" && (
                <div className="trytool__unlock glass">
                  <span className="t-h4 trytool__unlock-headline">{c.unlockHeadline}</span>
                  <p className="t-body trytool__unlock-body">{c.unlockBody}</p>
                  <Button href={unlockHref} variant="conversion">
                    {c.unlockCta}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
