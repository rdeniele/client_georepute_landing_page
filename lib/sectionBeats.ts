"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { applyBeat, blendBeats, type Beat } from "./director";

gsap.registerPlugin(ScrollTrigger);

/**
 * One continuous camera timeline for the whole page.
 *
 * Every section contributes one or more anchors on the scroll axis. On each
 * scroll update the viewport centre is located between two anchors and their
 * beats are blended — so the camera, node activation and focus travel all move
 * *with* the scroll rather than being retargeted at a threshold. Applying beats
 * discretely on `onEnter` is what made nodes appear to snap between sections.
 *
 * Section 04's six beats live here too, so the pinned sequence is part of the
 * same timeline instead of a second system fighting it for control.
 */

type Entry = { selector: string; beats: Beat[] };

const ENTRIES: Entry[] = [
  {
    // 01 — the whole environment, held at a distance
    selector: "#top",
    beats: [
      {
        focus: null,
        activate: [],
        dim: 0,
        cam: { pos: [0, 1.6, 26], look: [-0.6, 0, 0] },
      },
    ],
  },
  {
    // 02 — customer intent travels forward; a question enters the system
    selector: "#invisible",
    beats: [
      {
        focus: "intent",
        activate: ["question", "intent"],
        dim: 0.5,
        cam: { pos: [-6.4, 0.8, 13.5], look: [-7.2, -0.3, 0] },
      },
    ],
  },
  {
    // 03 — the measure field: many systems lit at once, none singled out
    selector: "#signals",
    beats: [
      {
        focus: null,
        activate: [
          "recognition",
          "search",
          "reputation",
          "content",
          "market",
          "authority",
          "evidence",
          "competitors",
        ],
        dim: 0.15,
        cam: { pos: [0, 0.6, 19], look: [0, 0, -0.5] },
      },
    ],
  },
  {
    // 04 — the pinned reconstruction, one beat per step
    selector: "#reconstruct",
    beats: [
      {
        focus: "question",
        activate: ["question"],
        dim: 0.55,
        cam: { pos: [-7.5, 1.8, 12], look: [-8.6, 0.6, 0] },
      },
      {
        focus: "interpretation",
        activate: ["question", "intent", "interpretation", "recognition"],
        dim: 0.6,
        cam: { pos: [-3, 2.2, 11], look: [-3.7, 0.5, -0.6] },
      },
      {
        focus: "evidence",
        activate: ["interpretation", "evidence", "search", "content"],
        dim: 0.62,
        cam: { pos: [-0.4, -0.6, 10.5], look: [-0.6, -0.8, 0.4] },
      },
      {
        focus: "competitors",
        activate: ["evidence", "competitors", "market", "authority"],
        dim: 0.62,
        cam: { pos: [2.2, -1.6, 11], look: [2, -1.8, 1.2] },
      },
      {
        focus: "recommendation",
        activate: ["authority", "competitors", "recommendation"],
        dim: 0.68,
        cam: { pos: [5, 0.4, 10.5], look: [5.2, -0.1, -0.2] },
      },
      {
        focus: "decision",
        activate: ["recommendation", "decision", "outcome"],
        dim: 0.72,
        cam: { pos: [8.2, 1.6, 11.5], look: [8, 0.9, 0.3] },
      },
    ],
  },
  {
    // 05 — sighted down the causal chain, so it reads as one line of events
    selector: "#blindspot",
    beats: [
      {
        focus: null,
        activate: [
          "question",
          "intent",
          "interpretation",
          "evidence",
          "authority",
          "recommendation",
          "decision",
          "outcome",
        ],
        dim: 0.5,
        cam: { pos: [-13.5, 1.4, 10], look: [4, -0.2, -0.4] },
      },
    ],
  },
  {
    // 06 — pulled back with the entire system live
    selector: "#engines",
    beats: [
      {
        focus: null,
        activate: [
          "recognition",
          "search",
          "reputation",
          "content",
          "market",
          "question",
          "intent",
          "interpretation",
          "evidence",
          "authority",
          "competitors",
          "recommendation",
          "decision",
          "outcome",
        ],
        dim: 0,
        cam: { pos: [0, 2.4, 23], look: [0, 0, -1] },
      },
    ],
  },
  {
    // 07 — the feedback loop: an outcome feeding back into the market
    selector: "#loop",
    beats: [
      {
        focus: null,
        activate: ["recommendation", "decision", "outcome", "market", "competitors"],
        dim: 0.45,
        cam: { pos: [7.4, 0.8, 14], look: [7.2, -0.5, -1] },
      },
    ],
  },
  {
    // 08 — recedes so the interactive graph owns the viewport
    selector: "#graph",
    beats: [
      {
        focus: null,
        activate: [],
        dim: 0.62,
        cam: { pos: [2, -1, 27], look: [2, 0, 0] },
      },
    ],
  },
  {
    // 09 — furthest back and dimmest; the dashboard is the subject here
    selector: "#executive",
    beats: [
      {
        focus: null,
        activate: [],
        dim: 0.78,
        cam: { pos: [4, -2, 31], look: [4, 0, 0] },
      },
    ],
  },
  {
    // 10 — back to a working distance with the decision path lit
    selector: "#action",
    beats: [
      {
        focus: null,
        activate: ["authority", "recommendation", "decision", "outcome"],
        dim: 0.4,
        cam: { pos: [6.2, 0.2, 20], look: [5.4, 0, -0.5] },
      },
    ],
  },
  {
    // 11 — everything converges on the core
    selector: "#analyze",
    beats: [
      {
        focus: null,
        activate: [
          "question",
          "intent",
          "interpretation",
          "evidence",
          "authority",
          "competitors",
          "recommendation",
          "decision",
          "outcome",
          "recognition",
          "search",
          "reputation",
          "content",
          "market",
        ],
        dim: 0,
        cam: { pos: [0, 0.6, 16], look: [0, 0, 0] },
      },
    ],
  },
];

/** An anchor is a beat pinned to a scroll position, in viewport-centre space. */
type Anchor = { at: number; beat: Beat };

export function useSectionBeats(enabled = true) {
  const anchors = useRef<Anchor[]>([]);
  const measuredVh = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    /**
     * Anchors are expressed in "viewport centre" coordinates: the document
     * scroll position at which the middle of the screen sits on that beat.
     * A single-beat section anchors at its own centre; the pinned section
     * spreads its beats evenly across the range its centre actually travels.
     */
    const measure = () => {
      const vh = window.innerHeight;
      const next: Anchor[] = [];

      for (const { selector, beats } of ENTRIES) {
        const el = document.querySelector<HTMLElement>(selector);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const h = rect.height;

        if (beats.length === 1) {
          next.push({ at: top + h / 2, beat: beats[0] });
          continue;
        }

        const from = top + vh / 2;
        const to = top + h - vh / 2;
        const span = Math.max(1, to - from);
        beats.forEach((beat, i) => {
          next.push({ at: from + (span * i) / (beats.length - 1), beat });
        });
      }

      next.sort((a, b) => a.at - b.at);
      anchors.current = next;
      measuredVh.current = vh;
    };

    const render = () => {
      // Cheap guard: the viewport can change without firing `resize`, which
      // would leave every anchor measured against the wrong height.
      if (window.innerHeight !== measuredVh.current) measure();

      const list = anchors.current;
      if (!list.length) return;

      const centre = window.scrollY + window.innerHeight / 2;

      if (centre <= list[0].at) return applyBeat(list[0].beat);
      const last = list[list.length - 1];
      if (centre >= last.at) return applyBeat(last.beat);

      let i = 0;
      while (i < list.length - 2 && centre > list[i + 1].at) i++;

      const a = list[i];
      const b = list[i + 1];
      blendBeats(a.beat, b.beat, (centre - a.at) / (b.at - a.at));
    };

    measure();
    render();

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: render,
      onRefresh: () => {
        measure();
        render();
      },
    });

    const onResize = () => {
      measure();
      render();
    };
    window.addEventListener("resize", onResize, { passive: true });
    document.fonts?.ready.then(onResize);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);
}
