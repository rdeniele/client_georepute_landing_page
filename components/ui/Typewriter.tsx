"use client";

import { useEffect, useRef, useState } from "react";

const TYPE_MS = 42;
const DELETE_MS = 26;
const HOLD_MS = 1700;
const GAP_MS = 400;

/**
 * Premium, restrained typewriter: types a phrase, holds it, deletes it,
 * moves to the next. No blinking-cursor gimmick — a single steady caret that
 * only animates opacity subtly while idle, never distracting from the copy.
 *
 * `prefers-reduced-motion` skips the animation entirely and renders the
 * first phrase statically, so the line still reads as intended content
 * rather than an empty box.
 *
 * The wrapping element gets a fixed min-height (one line at the component's
 * own font-size) so typing/deleting never shifts surrounding layout — only
 * the text's own width changes, never the document's flow.
 */
export function Typewriter({
  phrases,
  className = "",
}: {
  phrases: readonly string[];
  className?: string;
}) {
  const [text, setText] = useState(phrases[0] ?? "");
  const [reduced, setReduced] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced || phrases.length <= 1) return;

    let phraseIndex = 0;
    let charIndex = phrases[0]?.length ?? 0;
    let mode: "hold" | "deleting" | "typing" = "hold";

    const tick = () => {
      const current = phrases[phraseIndex];

      if (mode === "hold") {
        mode = "deleting";
        timeoutRef.current = setTimeout(tick, HOLD_MS);
        return;
      }

      if (mode === "deleting") {
        charIndex -= 1;
        setText(current.slice(0, charIndex));
        if (charIndex <= 0) {
          phraseIndex = (phraseIndex + 1) % phrases.length;
          mode = "typing";
          charIndex = 0;
          timeoutRef.current = setTimeout(tick, GAP_MS);
        } else {
          timeoutRef.current = setTimeout(tick, DELETE_MS);
        }
        return;
      }

      // typing
      const next = phrases[phraseIndex];
      charIndex += 1;
      setText(next.slice(0, charIndex));
      if (charIndex >= next.length) {
        mode = "hold";
        timeoutRef.current = setTimeout(tick, HOLD_MS);
      } else {
        timeoutRef.current = setTimeout(tick, TYPE_MS);
      }
    };

    timeoutRef.current = setTimeout(tick, HOLD_MS);
    indexRef.current = phraseIndex;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phrases, reduced]);

  return (
    <span className={`typewriter ${className}`}>
      <span className="typewriter__text">{text}</span>
      {!reduced && <span className="typewriter__caret" aria-hidden="true" />}
    </span>
  );
}
