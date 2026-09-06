---
name: georepute-landing-design
description: >
  House design system for the GeoRepute marketing/landing site (currently
  live at geo-marketing-virid.vercel.app, being redesigned into a from-scratch
  codebase). Use this whenever working on this project's landing page, hero
  section, or marketing UI and the goal is for it to look eyecatching,
  premium, "best-in-class," or "globally best" — any redesign pass, new
  section, color/typography decision, animation or motion tuning, or visual
  QA on this site. Also use it before declaring ANY UI change on this site
  "done" — it carries a pre-completion verification checklist. Don't default
  to generic Tailwind/shadcn boilerplate, a purple-gradient-on-white hero, or
  Inter/system-font typography on this project without checking this skill
  first — it exists specifically to keep this site off that path.
---

# GeoRepute Landing Design

This project's redesign goal is explicit: the *globally best, most
eyecatching* version of this page — not a competent one. Competent-but-generic
is the failure mode this skill exists to prevent. It merges seven source
design/engineering philosophies (Emil Kowalski's motion discipline, Anthropic's
frontend-design guidance, a UX-decision-protocol skill, a "pro-max" pattern
library, a frontend workflow skill, and a conscientiousness/verification
skill) into one coherent standard for this codebase, so that standard doesn't
have to be re-derived — or re-argued — every session.

## 1. Aesthetic commitment — pick one bold direction, ban the generic

Before writing a line of CSS, choose **one** explicit aesthetic direction and
hold it across *every* section. A page that hedges between "clean SaaS" and
"bold editorial" reads as neither — the sections that drift back to default
patterns are exactly what makes a redesign feel unfinished rather than bold.

GeoRepute's own pitch is that it "reconstructs decisions" — an intelligence
and evidence layer for agencies making high-stakes calls. A visual language
that reads as authoritative and evidentiary (dark, editorial, data-forward,
briefing-room) fits that story better than a soft consumer-app look, but the
specific direction is a call to make deliberately, not a rule to follow
blindly — name the direction explicitly before building.

**Banlist** — these read as "AI slop" / templated, avoid unless the chosen
direction specifically justifies one:
- Inter, Roboto, Arial, or bare system-font stacks as the *primary* typeface
- A purple-gradient-on-white hero
- Default Tailwind blue (`#3B82F6`) as the only accent
- An evenly-distributed, timid palette with no dominant color
- Generic drop shadows applied to every card as the only depth cue
- A repeated three-column icon-headline-paragraph grid, verbatim, section
  after section

**Prefer:**
- One dominant color + a single sharp accent, over many timid colors
- A distinctive display/body font pairing, not a same-font-everywhere page
- One well-orchestrated staggered reveal on page load, over scattered
  micro-interactions dropped everywhere
- Asymmetry, overlap, and grid-breaking moments, over a rigid centered grid
- Atmosphere — gradient mesh, grain/noise, geometric pattern, glassmorphic
  panels with `backdrop-filter: blur()` and thin translucent borders — over
  flat solid backgrounds. Every atmospheric effect still has to clear the
  accessibility floor in §5.

## 2. Color & typography system

- **Neutrals**: 4–5 shades (background, surface, border, secondary text,
  primary text), deliberately warm or cool — not default grey.
- **Accent**: 1–3 saturated colors, each with one fixed meaning (primary
  action, warning/risk, success) reused consistently — never decorative-only.
- **Contrast**: WCAG AA minimum, 4.5:1 for body text, 3:1 for large
  text/UI components — checked against the actual rendered background
  (gradient, image, blurred panel), not a flat swatch in isolation.
- **Typefaces**: 2–3 max, 3 weights max per typeface. Split roles: headline/
  display type carries personality and can trade a little legibility for
  impact; body/UI type stays restrained and highly legible. Use a
  mathematical type scale (×1.25 or ×1.333) instead of ad hoc sizes.
- **Reading comfort**: body line-height ≈1.5×, line length 45–75 characters,
  headline letter-tracking tightens slightly as size increases.

## 3. Layout & spacing

- One spacing scale for the whole page — 4/8/16/24/32/48/64px (or a rem
  equivalent). No arbitrary one-off margins.
- One corner-radius vocabulary — the token used for "rounded" means the same
  thing everywhere it appears.
- Touch targets ≥44×44px, with adequate spacing between adjacent interactive
  elements.
- Build hierarchy through scale, weight, color, and spatial relationship —
  not stacked box-shadows imitating physical depth. Reserve real elevation
  (shadow/blur) for things genuinely layered above the page: modals,
  dropdowns, sticky headers.

## 4. Motion & animation

| Interaction | Duration | Easing |
|---|---|---|
| Micro (hover, button press, toggle) | 100–150ms | ease-out |
| State change (accordion, tab switch) | 200–300ms | ease-out in / ease-in out |
| Page or section transition, hero reveal | 300–500ms | custom ease-out |

- **Entrances** always use a custom ease-out curve (fast start, settles into
  place) — never ease-in for anything entering the screen. **Exits** use
  ease-in (or an exit-animation primitive like `AnimatePresence`) so elements
  leave with acceleration rather than just vanishing.
- Never animate a keyboard-triggered action a user will trigger 100×/day
  (Enter-to-submit, etc.) — motion earns its place by orienting attention or
  giving feedback, not by decorating high-frequency input.
- Clickables get a pressed/active state (e.g. `scale(0.97)`) for tactile
  feedback. Never animate an entrance from `scale(0)` — start at ≥0.95
  combined with `opacity: 0`, so nothing visibly "pops" from nothing.
- Animate `transform` and `opacity` only. `transition: all`, or animating
  `width`/`height`/`top`/`left`/`margin`, causes layout thrash — name the
  exact properties.
- One well-orchestrated staggered reveal on page load (hero, then first
  section) reads as more premium than scattered micro-interactions
  everywhere — don't over-animate the rest of the page to compensate.
- Anything that can disappear (modal, toast, a filtered-out card) needs an
  exit animation, not an instant vanish. Always ship a near-instant variant
  behind `prefers-reduced-motion`.

## 5. Accessibility floor (non-negotiable)

These hold regardless of which bold direction was chosen in §1 — a striking
design that fails accessibility isn't "premium," it's broken for a portion of
users:
- WCAG 2.1 AA contrast (§2), semantic HTML landmarks, alt text on meaningful
  images.
- Full keyboard navigability with a *visible* focus state on every
  interactive element. A dark-on-dark or glassmorphic design that hides
  focus rings is a failure of the implementation, not an acceptable
  trade-off for the aesthetic.
- 44×44px minimum touch targets on any device-facing control.

## 6. Decision protocol

This project runs with a bias toward action: proceed autonomously through
implementation details — exact spacing values, the specific easing curve,
which font pairing *within* the chosen direction, copy micro-edits — without
stopping to ask.

Surface a question only when a choice is genuinely load-bearing and
ambiguous from context: which of two fundamentally different aesthetic
directions to commit to (§1), a brand-identity decision with no existing
answer (logo, primary brand color), or a scope call (rebuild vs. restyle an
existing page) the user hasn't already settled.

Rule of thumb: if reversing a decision later means restyling one component,
it's a detail — proceed. If reversing it means redoing the whole page's
visual language, ask first.

## 7. Pre-completion verification

Before calling any UI or landing-page work "done," run this checklist —
verify with evidence, not memory. Skipping straight to "looks done" is
verification theater, not verification:

- **Completeness**: list every explicit requirement *and* every implied
  promise made in conversation ("also make it responsive," "and fix the
  contrast") and check each one against what's actually in the code — not
  against what you remember writing.
- **Correctness**: reread the rendered result. Does the chosen aesthetic
  direction actually hold across every section, or did later sections drift
  back to generic patterns? Do animations obey the timing/easing rules in
  §4? Does contrast actually pass against the real rendered background, not
  an assumed one?
- **Presentation**: is copy hierarchy scannable? Is the page honest about any
  placeholder or unfinished section rather than presenting it as finished?
- **Build hygiene**: actually run the project's real lint/typecheck/build
  commands (whatever they turn out to be once the stack is chosen) before
  reporting done — don't eyeball the diff and assume it's clean.
- **Visual QA**: open the page in a browser at both a desktop and a mobile
  viewport width and look at it — a live render, not just the JSX/CSS.
  Trigger hover/focus/active states directly rather than inferring them from
  the stylesheet.
- If a check turns up a gap, fix it before reporting completion. Noting it as
  a "known issue" and moving on defeats the purpose of checking at all.
