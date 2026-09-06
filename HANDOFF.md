# GeoRepute Site Redesign — Continuation Prompt

> Paste this whole file as your opening message to the next coding AI.
> Project root: `D:\georepute\landingpages\client_georepute_landing_page`
>
> **Status: home page complete. Subpages are the next phase — see §14.**

---

## 0. Your role and the current scope

You are continuing a from-scratch redesign of the GeoRepute marketing site.

**Scope so far: the home page only.** All eleven of its sections are built, plus
the global navigation. Nothing else exists — the app has exactly one route.

Your job is to **finish, verify, and polish** what is there, or to start the
subpages if that is what you have been asked for. Either way: do not restart, do
not redesign what already works, and do not re-litigate the visual direction.

**The subpages are the next phase.** See §14 — it lists every route the
navigation already promises and the one routing decision that has to be made
before any of them get built.

Read this entire brief before touching code. Then read the actual files. Do not
trust this document over what the code currently says — verify.

---

## 1. The goal (non-negotiable framing)

The redesign target is the **globally best, most eyecatching** version of this
page — not a competent one. "Competent but generic" is the failure mode.

If the current site says *"Here is our AI marketing platform,"* the redesigned
site must say:

> **"There is an invisible decision environment surrounding your business.
> GeoRepute lets you see it."**

The visitor should feel they have entered that environment. The interaction must
*explain the product*, not decorate it.

Emotional arc the page must produce, in order:
Curiosity → Recognition → Concern → Understanding → Desire → Action.

---

## 2. The house design standard

There is a project skill at
`.claude/skills/georepute-landing-design/SKILL.md`. **Read it.** If your tool
supports skills it may load automatically; if not, read the file directly. Its
key rules, summarised (the file is authoritative):

**Aesthetic commitment.** One bold direction held across *every* section.
Sections that drift back to default patterns are what make a redesign feel
unfinished.

**Banlist** — reads as AI slop: bare system-font/Inter-only typography as the
primary face; purple-gradient-on-white hero; default Tailwind blue; timid
evenly-distributed palette; generic drop shadows as the only depth cue; a
repeated three-column icon-headline-paragraph grid section after section.

**Prefer:** one dominant colour + one sharp accent; a distinctive display/body
pairing; one well-orchestrated staggered reveal on load over scattered
micro-interactions; asymmetry and grid-breaking moments; atmosphere (gradient
mesh, grain, glass with `backdrop-filter`) over flat fills.

**Motion table** (obey exactly):

| Interaction | Duration | Easing |
|---|---|---|
| Micro (hover, press, toggle) | 100–150ms | ease-out |
| State change (accordion, tab) | 200–300ms | ease-out / ease-in-out |
| Section transition, hero reveal | 300–500ms | custom ease-out |

- Entrances **always** custom ease-out; exits ease-in.
- Animate `transform` and `opacity` only. Never `transition: all`, never
  animate `width`/`height`/`top`/`left`/`margin`.
- Clickables get a pressed state (`scale(0.97)`). Never animate an entrance
  from `scale(0)` — start at ≥0.95 with `opacity: 0`.
- Always ship a near-instant `prefers-reduced-motion` variant.

**Accessibility floor (non-negotiable):** WCAG 2.1 AA contrast checked against
the *actual rendered background* (not a flat swatch); semantic landmarks; full
keyboard navigability with a **visible** focus ring on every interactive
element; 44×44px minimum touch targets.

**Decision protocol.** Bias to action. Proceed autonomously on implementation
details (exact spacing, easing curve, font pairing within the direction, copy
micro-edits). Only ask when a choice is load-bearing and ambiguous: a
fundamentally different aesthetic direction, a brand-identity decision, or a
rebuild-vs-restyle scope call. Rule of thumb — if reversing it means restyling
one component, just proceed; if it means redoing the page's whole visual
language, ask.

**Pre-completion verification (§7 — do not skip).** Before calling any UI work
done: check every explicit requirement *and* implied promise against the code,
not your memory; reread the rendered result and confirm the direction holds
across every section; confirm contrast against the real background; run the
project's real lint/typecheck/build; and **open the page in a browser at
desktop and mobile widths and actually look at it**, triggering hover/focus/
active states directly. If a check finds a gap, fix it — do not log it as a
"known issue" and move on.

---

## 3. Direction already committed to — "SIGNAL ROOM"

**Hold this. Do not re-litigate it.**

A dark cinematic instrument panel. Deep navy void. Purple appears **only where
meaning lives**: an active signal, a live connection, a decision outcome.
Everything else is void, hairline rules, and mono telemetry labels. An
editorial serif carries the human decision language.

Not a purple site with a 3D toy on top. Not cyberpunk, not neon, not gamer.

### Colour tokens (in `app/globals.css` `@theme`)

```
--color-void:        #060A14   deepest background
--color-base:        #0A1020   page background
--color-raised:      #0E1526
--color-elevated:    #131C33

--color-ink:         #F5F3FF   18.9:1 on base — primary text
--color-ink-dim:     #9AA6C4    7.78:1 — body copy
--color-ink-faint:   #7C89A8    5.42:1 — labels, tertiary

--color-signal-core: #610AE5   fills, CTA background, glow source
--color-signal:      #7B3AEC    3.30:1 — LARGE TEXT / BORDERS / UI ONLY
--color-signal-lit:  #A78BFA    6.96:1 — safe for small accent text
--color-gap:         #FFB547   amber — blind spot / risk / unseen
```

Contrast ratios above are computed against `#0A1020` and verified. **`#7B3AEC`
fails AA for body text — never use it for small text.** Use `--color-signal-lit`
for eyebrows and small accent copy.

Two accents only, each with one fixed meaning: **purple = your business /
active signal / GeoRepute**, **amber = gap / risk / unmeasured**. Competitors
are rendered in neutral slate, deliberately — do not introduce a third hue.

### Typography (three faces, loaded via `next/font/google`)

- **Inter Tight** — display + UI (`--font-display`), weights 400/500/600
- **Instrument Serif** — editorial accent, italic (`--font-editorial`); carries
  the payoff word "*Chosen.*", pull quotes, section numerals. **Never body copy.**
- **JetBrains Mono** — telemetry: eyebrows, node labels, metrics, readouts

Type scale is a fluid modular scale in `@theme` (`--text-hero` → 110px cap).
Helper classes: `.t-hero .t-h2 .t-h3 .t-h4 .t-body .t-lead .t-metric
.t-eyebrow .t-label .t-editorial`.

### System values

Spacing 4/8/12/16/24/32/48/64/96/128. Radius: `--radius-sm 6px` (chips),
`--radius-md 12px` (cards/panels), `--radius-lg 20px` (shells),
`--radius-full 999px` (pills). Easing: `--ease-out cubic-bezier(.16,1,.3,1)`,
`--ease-in`, `--ease-inout`. Durations `--d-micro 140ms`, `--d-state 260ms`,
`--d-section 460ms`.

---

## 4. Stack

Next.js 16.3 (App Router, Turbopack) · React 19.2 · TypeScript strict ·
Tailwind CSS v4 (CSS-first `@theme`, no JS config) · three 0.185 ·
@react-three/fiber 9 · @react-three/drei 10 · GSAP 3.15 + ScrollTrigger ·
Lenis 1.3.

```bash
npm run dev        # http://localhost:3000
npm run build      # production build + typecheck
npx tsc --noEmit   # typecheck only
```

`.claude/launch.json` is configured for the dev server on port 3000.

---

## 5. File map

```
app/
  layout.tsx      fonts, metadata, skip-link, <noscript> reveal override, grain
  page.tsx        client component; assembles all 11 sections. ALSO currently
                  owns Navigation, ScrollProgress, the canvas and ScrollProvider
                  — all of which are global chrome. Extracting those into a
                  layout is the first job of the subpage phase (§14).
  globals.css     @theme tokens, base, type roles, glass, reveal, reduced-motion
  ui.css          void-wash, scene layer + scrim, buttons, nav, rail, sec-head, hero
  sections.css    all 11 section styles + responsive breakpoints

lib/
  content.ts      SINGLE SOURCE OF TRUTH for all copy
  sceneStore.ts   raw scroll/pointer state + device tier + TIER_BUDGET
  director.ts     CHOREOGRAPHY state — what the 3D is doing right now
  sectionBeats.ts per-section beats, registered centrally from page.tsx
  useReveal.ts    IntersectionObserver → data-revealed="true"
  ScrollProvider.tsx  Lenis + GSAP ticker + ScrollTrigger wiring, pointer capture

components/three/
  IntelligenceCanvas.tsx  Canvas host, tier gating, adaptive DPR, pause-when-hidden
  IntelligenceNetwork.tsx nodes + links, custom shaders, home→resolved morph,
                          per-node activation and focus travel
  ParticleField.tsx       ambient dust, drift entirely in vertex shader
  CameraRig.tsx           eases toward the director's camera pose + parallax
  network.ts              the named node cast, causal edge list, link geometry
  textures.ts             procedural sprite textures (soft dot, ring dot)
  StaticNetwork.tsx       SVG still frame — reduced-motion / no-WebGL fallback

public/brand/
  logo-g-mark.png the real GeoRepute G mark — 96x96 transparent PNG, 3KB,
                  taken from georepute.ai's own image optimizer:
                  /_next/image?url=%2Flogo-g-mark.png&w=96&q=75
                  Verified genuinely transparent (78% of pixels alpha 0) and
                  reads correctly on the dark navy.
                  CAUTION: the *unoptimized* source at georepute.ai/logo-g-mark.png
                  (1024x1024, 1.4MB) is a different beast — it has a baked-in
                  grey gradient background and bevel and renders as a grey
                  square on dark. Do not "upgrade" to it for more resolution.
                  At 96px there is no headroom above ~3x DPR at 32px display;
                  if a larger mark is ever needed, ask for a clean vector.

components/ui/
  Navigation.tsx   mirrors the LIVE SITE's nav verbatim — three mega-menu
                   groups (Platform / Intelligence Engines / Marketplace),
                   How It Works, Methodology, Sign In, Start Analysis. Labels,
                   descriptions and hrefs were scraped from the live header and
                   live in `content.ts`; they are real routes, so they 404 until
                   the rest of the app is rebuilt. Opens on hover but is real
                   `aria-expanded` buttons underneath: Escape closes and returns
                   focus to the trigger.
  Button.tsx       magnetic hover, animated arrow, pressed state
  SectionHeader.tsx  shared chrome: index + label + headline + body
  ScrollProgress.tsx instrument rail, rAF → DOM, never re-renders

components/sections/   Hero, InvisibleDecision, SignalMap,
                       DecisionReconstruction, BlindSpot, IntelligenceEngines,
                       ClosedLoop, DecisionGraphSection, ExecutiveIntelligence,
                       ActionPlan, FinalCta
```

---

## 6. Architecture decisions — understand before changing

**One persistent WebGL canvas** fixed behind the whole document
(`.scene-layer`, `z-index: 0`; content is `z-index: 1`). The network is never
re-created between sections, so the camera traverse stays continuous and only
one GL context ever exists.

**Scroll and pointer never touch React state.** They are written into a plain
mutable object (`lib/sceneStore.ts` → `scene`) and read inside `useFrame`.
Routing 60fps values through `useState` would re-render the tree every frame.
**Keep it this way.**

**No postprocessing pass.** Bloom is faked with additive sprites + procedural
radial textures. This is a deliberate GPU-budget decision — do not add
`@react-three/postprocessing` without measuring.

**Link pulses are pure shader work.** Each link vertex carries `aT` (position
along the link) and `aSeed`; the travelling signal is computed from `uTime` in
the fragment shader with **zero per-frame CPU cost**. Link positions are only
rebuilt while the scatter→ordered morph is actually moving.

**The network morphs from `home` to `resolved`** as scroll progresses
(`network.ts` gives every node both layouts). This is the argument made
geometrically: the environment becomes legible. Preserve it.

**One continuous timeline drives the whole page.** `lib/sectionBeats.ts` places
every section's beat on the scroll axis as an *anchor* (the pinned section 04
contributes six, spread across its range). On each scroll update it locates the
viewport centre between two anchors and calls `blendBeats` on that pair — so the
camera, activation and focus travel move **with** the scroll rather than being
retargeted at a threshold. `lib/director.ts` holds the resulting state and
`CameraRig` / `IntelligenceNetwork` ease toward it each frame.

Applying beats discretely on `onEnter` is what made nodes appear to snap between
sections — **do not go back to it.** Anchors are cached and recomputed on
resize, on ScrollTrigger refresh, and whenever `innerHeight` changes (the
viewport can change without firing `resize`).

**Nodes are characters, not decoration.** `network.ts` defines a named cast
(`NodeId`) wired along a real causal chain — question → intent →
interpretation → evidence → authority → recommendation → decision → outcome,
with context systems (recognition, search, reputation, content, market)
feeding in from depth. A focused node physically travels out of the network to
a stage point in front of the camera. Every edge is a causal claim; do not add
edges for visual density.

**Adaptive tiers** in `sceneStore.ts` — `TIER_BUDGET`:
`high` 2200 particles / 14 nodes / dpr 1.75 ·
`mid` 1100 / 12 / 1.5 · `low` 420 / 9 / 1.25 · `none` → `StaticNetwork`.
`detectTier()` returns `none` for `prefers-reduced-motion` or no WebGL.
drei's `PerformanceMonitor` steps DPR down on decline. Edge count follows from
the node set, so there is no separate link budget. The nine **chain** nodes are
never dropped — a reduced budget gives up context nodes only, so the causal
story survives on the smallest device.

---

## 7. Bugs already found and fixed — DO NOT REGRESS THESE

1. **Hero copy was invisible for ~5.5s.** Its entrance was gated on React
   hydration of the Three.js bundle. It is now a **CSS `@keyframes` animation**
   (`hero-in`, staggered via an inline `--i`), and `Hero.tsx` is a **server
   component**. Do not reintroduce a JS-toggled class for the hero entrance.
2. **No-JS users saw a blank page** — every `[data-reveal]` starts at
   `opacity: 0`. `app/layout.tsx` renders a `<noscript>` `<style>` that forces
   them visible. Keep it.
3. **The 3D read as a planet/globe.** Bowed core spokes formed a sphere cage.
   Curvature is now nearly flat (`network.ts` → `_ctrl.y += 0.16` only) and the
   node field is a wide shallow disc, not a shell. **The brief explicitly bans
   planets.**
4. **Scene blew out into a purple nebula**, destroying text contrast. Additive
   alphas were rebalanced and a **legibility scrim** added
   (`.scene-layer::after` in `ui.css`) — a left-weighted radial plus a vignette
   so text always has a dark floor.
5. **`:nth-of-type` counted the `.hero__lead` span**, so the hero indent
   stagger was off by one and "Chosen." got none. Now driven by an explicit
   `--indent` custom property.
6. **Link depth-fade range was culling the whole network** after the camera
   moved back. It must span the camera's actual traverse — see §8 for the
   current value. Re-check it whenever camera distances change.
7. **Point-size divisor** was `300.0/depth`, producing ~490px nodes. See §8 for
   the current values (nodes and particles differ).
8. Nav brand was a 102×26 tap target → `min-height: 44px`.
9. `.scene-layer` got `overflow: hidden` so the canvas can never contribute
   page overflow while it catches up to a viewport change.
10. Signal rows were `tabIndex={0}` with no action (a11y anti-pattern) →
    removed; hover-only styling.
11. **Section 04 content escaped the viewport when scrolling back up.** The old
    sticky panel stacked a header, the question and all six stages, which was
    taller than the viewport, so it overflowed and scrolled out of frame. It is
    now a viewport-locked stage (`height: 100svh; overflow: hidden`) with
    absolutely positioned regions and one cross-fading caption — nothing flows.
12. **The mega-menu panel was unreadable.** It used the shared `.glass`
    surface (4% white), which is fine floating over the void but opens directly
    on top of 110px hero type — the headline read straight through the menu
    items. `.nav__panel` now sets its own opaque floor
    (`rgba(9,14,28,0.95)` + 30px blur). Contrast has to be checked against what
    is *actually* behind an element, not the page background colour.
13. **`[hidden]` loses to `display: grid`.** The UA stylesheet's
    `[hidden] { display: none }` is weaker than any class-based `display`, so
    the nav panels would have been permanently visible. `.nav__panel[hidden]`
    et al. state it explicitly. Watch for this on any element that sets
    `display` and toggles `hidden`.
15. **Nodes snapped between sections.** Three separate causes, all fixed:
    - `director.focus` was a single scalar plus an identity check
      (`i === director.focus`). The moment the active index changed, the
      outgoing node's value became `0` in one frame and it **teleported** back
      into the network. Focus is now a **per-node `Float32Array`**, so the
      previous node eases home over the same interval the next one uses to
      arrive. Do not collapse it back to a single index.
    - The focused node travelled toward a stage point computed from
      `director.camPos` — the camera's *target*, not where it actually was — so
      it flew at somewhere the camera had not reached. Now taken from
      `camera.position` / `camera.getWorldDirection()`.
    - Beats were applied discretely via `onEnter`/`onEnterBack`, so the camera
      got a whole new target at one scroll threshold. See §6 "one continuous
      timeline".
16. **A node lit in two adjacent beats flickered.** Activation cross-faded as
    `max(1-k, k)`, which dips to 0.5 at the midpoint of every transition.
    `blendBeats` now holds nodes present in *both* beats at full.
14. **Section 04 progress is derived from live geometry**, not
    `ScrollTrigger.progress`. Cached start/end go stale whenever the viewport
    changes without a resize event (mobile URL-bar collapse, orientation
    change, layout shift above the section), which silently compressed the
    six-beat sequence into part of its range. `render()` reads
    `getBoundingClientRect()` each update instead. Do not "simplify" this back
    to `self.progress`.

---

## 8. Current scene tuning values (change deliberately)

`IntelligenceNetwork.tsx`
- link base `mix(0.085 * (1 - uDim*0.75), 0.30, vActive)` — idle edges are a
  hairline, active edges carry visible traffic
- link pulse `+ pulse * 0.85`, gated by `vActive` so movement always means a
  signal is actually being carried
- `depthFade = smoothstep(38.0, 4.0, vDepth)` — must span the camera's real
  traverse (~10–31 units out)
- node `aSize = 8 + weight*6`; `gl_PointSize = aSize*pulse*scale*dpr*(34.0/depth)`
  where `scale = 1 + aActive*0.55 + aFocus*1.1`
- node alpha `mix(0.34 * (1 - uDim*0.7), 1.0, lit)` — dormant nodes sit near
  the noise floor so an activation genuinely reads
- core `aSize 54`
- focused node travels to `camPos + forward * 7.2`
- layout morph `smoothstep(0.05, 0.72, sceneProgress)` (home → resolved)

`ParticleField.tsx`
- shell radius `9 + pow(rand, 0.5) * 20`; size `1 + rand*2`
- alpha `smoothstep(42,6,depth) * (0.14 + 0.32*aSeed)`; size factor `25.0/depth`

`CameraRig.tsx` — no keyframes any more. The camera eases toward
`director.camPos` / `director.camLook` at `1 - exp(-dt * 1.9 * urgency)`.
Camera poses live in `lib/sectionBeats.ts` and, for section 04, in the `BEATS`
array inside `DecisionReconstruction.tsx`. fov 46, far 90.

---

## 9. Content rules

**`lib/content.ts` is the single source of truth.** All positioning, module
names, engine names and capability figures were taken from the live site
`https://geo-marketing-virid.vercel.app/en`.

Real, verified facts you may use:
- *"The intelligence & execution layer for modern agencies"*
- *"Traditional platforms optimize channels. GeoRepute reconstructs decisions."*
- *"Ten measures, one decision position, each opening its evidence."*
- Engines: AI Recognition · Google vs AI Visibility · Competitor Decision ·
  Authority · Trust · Context · Narrative Intelligence · Action Intelligence ·
  Executive Intelligence
- Capabilities: 100+ analyses · Google + 6 AI engines · 7 languages ·
  continuous PDCA

**Do not invent capabilities, customers, logos, or statistics.** Two places use
illustrative data — the fastener decision reconstruction (§04) and the dashboard
readings (§09). Both carry a visible `sampleNote` labelling them as worked
examples. **Keep those labels.** Never present them as customer results.

Never replace the positioning with generic marketing language ("Supercharge
your business with AI", "Unlock your growth"). The voice is precise, strategic,
evidence-driven, executive-level.

---

## 10. State: what is done

**The home page, and only the home page.** One route exists (`/`). Typecheck and
`next build` pass clean, and content is verified against the live site.

**Global navigation is built** — the full mega-menu mirroring the live header
(§5). Its links point at real routes that do not exist yet; that is §14.

The eleven home-page sections:

01 Hero · 02 The Invisible Decision · 03 See the Signals · 04 Watch a Decision
Form (scroll-pinned, 6 stages) · 05 The Blind Spot (both maps on one shared
time axis — the amber region is everything already decided before the first
measurable event) · 06 The Intelligence Engines (interactive graph) · 07 The
Closed Loop (PDCA ring) · 08 The Decision Graph (interactive + evidence panel) ·
09 Executive Intelligence (10 measures + composite dial, rAF counters) ·
10 From Insight to Action · 11 Final CTA + footer.

**Verified working:** production build + typecheck clean; no horizontal overflow
at 390 / 768 / 1024; tap targets pass; both interactive graphs work by keyboard
(focus lights connected edges, dims unrelated, opens evidence panel).

**Section 04 verified numerically.** Scanning its full scroll range: progress
spans exactly 0→1, each of the six captions peaks at exactly its beat
(0, 0.2, 0.4, 0.6, 0.8, 1.0), the header and lower third stay inside the
viewport at every position (`inFrame: true` throughout), and a backward scan
returns byte-identical values to the forward scan — so it reverses exactly.

---

## 11. What is NOT verified — start here

The previous session's preview browser **stopped producing animation frames**
(`requestAnimationFrame` returned 0 frames in 1 second while
`document.visibilityState === "visible"`). That single environment fault caused
blank screenshots, unfired IntersectionObservers, and frozen counters. It was
**not** a page bug — but it means **only the hero was ever pixel-verified.**

### Priority 1 — Actually look at the page

Run `npm run dev`, open a real browser, and scroll the whole page at ~1440px
and at ~390px. Then:

- Confirm the "Signal Room" direction holds in **every** section, or note which
  ones drift generic (§1 of the skill — this is the primary failure mode).
- Confirm the reveals fire, the §09 counters/dial/meters animate, and the §04
  stages advance.
- Trigger hover, focus, and active states directly.
- Check contrast **against the actual rendered background**, not the token
  values — the scene sits behind the text and its brightness varies with the
  camera.

### Priority 2 — Watch the node choreography actually run

This is the biggest unverified piece. The director architecture is built and
typechecks, and section 04's DOM half is numerically verified, but **no one has
yet watched a node travel out of the network toward the camera.** Confirm for
each beat that: the focused node visibly approaches and grows, its edges light
while unrelated ones recede, the camera arrives without snapping, and the
handover between beats (the `focusAmount` dip in `blendBeats`) reads as the
previous node returning home rather than teleporting. Tune `dim`, the stage
distance (7.2), and the easing rate in `CameraRig` from what you see.

### Priority 3 — Tune scene brightness across the scroll journey

Only the hero was ever balanced, and the shader was substantially rewritten
since. Walk sections 02→11 and check the network is present but never competing
with copy (skill §18: one dominant thing per viewport). Adjust the values in §8
and the `.scene-layer::after` scrim.

### Priority 4 — Mobile pass

Below 860px the graphs collapse from absolute positioning to flow lists and the
blind-spot axis rotates to vertical. Confirm these read well rather than merely
not breaking. Verify the `low` tier scene on a real phone or throttled device.

### Priority 5 — Not yet done at all

- **No `prefers-reduced-motion` end-to-end test.** `detectTier()` should return
  `none` and render `StaticNetwork`. Untested.
- **No performance measurement.** Get real FPS + a Lighthouse pass. The brief
  is explicit: the site must still feel extremely fast.
- **No lint config.** `npm run lint` is wired but ESLint was never installed.
  Either install `eslint-config-next` or drop the script.
- **Hero and final-CTA buttons still point at `#analyze`**, an on-page anchor.
  The nav's "Start Analysis" already points at the real route
  (`/en/app/reconstruct`). Decide whether the in-page CTAs should follow it or
  stay as scroll anchors — and note the two currently use different wording
  ("Analyze My Business" vs "Start Analysis"), both of which were explicitly
  requested at different times. Worth confirming with the user rather than
  silently unifying.
- **`components/three/textures.ts` `disposeTextures()`** is called on
  `IntelligenceCanvas` unmount; confirm no double-dispose warning in StrictMode.

---

## 12. Environment gotchas (save yourself the time)

- **The dev preview browser may stop producing frames.** If screenshots come
  back blank or time out, test `requestAnimationFrame` before assuming a page
  bug. A fixed bright probe element at `z-index: 99999` that fails to appear in
  a screenshot proves the capture is stale, not the page.
- **Viewport emulation does not fire `window.resize`,** so the R3F canvas will
  not resize with it and appears stuck at the old size. Dispatching
  `new Event('resize')` fixes it. This is an emulation artifact — **real
  browsers are fine, do not add a workaround.**
- **`window.scrollTo` is not Lenis-aware.** It moves native scroll, but Lenis
  eases back to its own internal position within a second or so. Measure within
  ~80ms of the call, or drive scrolling with real wheel events. A screenshot
  taken seconds later will show the page back where Lenis wanted it.
- **CSSOM red herring:** a `transition` shorthand containing `var()` serialises
  with empty longhands in `cssText`. That is normal — it is not a broken rule.
- **Enumerating CSS rules:** `CSSStyleRule.cssRules` exists (empty) with CSS
  nesting, so `if (r.cssRules)` wrongly treats every style rule as a group.
  Check `r.selectorText` first.

---

## 13. Working agreement

- Repo has **no commits yet**. Do not commit unless the user explicitly asks.
- Prefer editing existing files. Don't refactor beyond the task, don't add
  abstractions for hypothetical needs, don't add error handling for cases that
  cannot happen.
- Default to no code comments; add one only when the *why* is non-obvious.
- Match the existing architecture (imperative scene store, shader-side
  animation, one canvas). If you think something needs re-architecting, say so
  and explain the tradeoff before doing it.
- **Run `npm run build` before reporting anything done, and say plainly what
  you verified versus what you did not.** Do not claim visual QA you did not
  perform.

---

## 14. Next phase — the subpages

The home page is done. Nothing else exists: the app has exactly one route (`/`),
while the navigation already links to eighteen real ones. Every one of them
currently 404s.

### 14.1 Settle the routing decision first — this is load-bearing

**The home page lives at `/`. Every nav link points at `/en/…`.** That mismatch
has to be resolved before any subpage is built, because it determines the whole
directory structure.

The live site uses an `/en` prefix and the product genuinely ships in seven
languages, so the near-certain answer is a locale segment: move the home page to
`app/[locale]/page.tsx`, redirect `/` → `/en`, and keep the existing hrefs. The
alternative — dropping `/en` everywhere and rewriting the nav hrefs — is simpler
but throws away the localisation the product already claims.

Reversing this later means moving every route file, so **confirm it with the
user before building.** It is exactly the kind of decision the skill's §6 says
to ask about.

### 14.2 Extract the shell before the second page exists

`app/page.tsx` currently owns `ScrollProvider`, `IntelligenceCanvas`,
`Navigation`, `ScrollProgress` and `useReveal` alongside the eleven sections.
All of that except the sections is global chrome and belongs in a layout —
otherwise the second page duplicates it and you get two WebGL contexts.

Three things break the moment a second route exists, so handle them in the same
pass:

- **`useSectionBeats`** looks up `#top`, `#invisible`, … and skips selectors it
  cannot find, which is fine — but it then calls `applyBeat(BEATS[0].beat)`
  unconditionally, forcing the hero camera pose on every route. Give subpages
  their own resting beat instead.
- **`ScrollProgress`** hardcodes the home page's eleven section labels. It
  should render only where those sections exist.
- **`DecisionReconstruction`** registers a ScrollTrigger on mount. Confirm its
  cleanup actually runs on route change (it returns `st.kill()`, but verify —
  a leaked pinned trigger will corrupt scrolling on the next page).

### 14.3 Decide what the 3D does on a subpage

The canvas is a single persistent context in the layout, which is the right
shape — but the network currently tells the *home page's* story. A content page
should not fight its own copy for attention.

Recommended: keep one canvas alive across routes, and give subpages a single
calm beat — distant camera, high `dim`, no focused node — so the network reads
as atmosphere rather than narrative. Reserve node choreography for pages that
genuinely have a sequence to explain. Do not rebuild the scene per route.

### 14.4 The routes the navigation already promises

Taken from `nav` in `lib/content.ts` — that is the authoritative list, not this
one. Re-read it before planning.

```
/en/how-it-works
/en/methodology
/en/signin
/en/election-intelligence

/en/app/mission-control          Executive Mission Control
/en/app/reconstruct              Decision Reconstruction  (also "Start Analysis")
/en/app/campaign-readiness       Campaign Readiness
/en/app/narrative                Narrative Intelligence
/en/app/actions                  Strategic Action Center

/en/engines                      index — live site says TWELVE engines
/en/engines/ai-recognition
/en/engines/google-vs-ai
/en/engines/competitor-decision
/en/engines/action

/en/marketplace                  index — "full intelligence ecosystem"
/en/marketplace/category/ai-visibility-intelligence
/en/marketplace/category/competitive-intelligence
/en/marketplace/category/executive-intelligence
```

Two of these are indexes whose menus only surface a subset: the engines index
must cover twelve engines (the menu shows four, and the home page's graph maps
nine), and the marketplace index covers more than its three listed categories.
**Scrape the live pages for the full lists — do not extrapolate.**

`/en/signin` is an authentication surface. Build the page shell if asked, but
never wire up real credential handling on your own initiative.

### 14.5 Rules that carry over unchanged

- **§9 content rules still apply.** Every subpage's copy comes from the live
  site. Scrape the corresponding page; do not write marketing copy from
  imagination, invent capabilities, or fabricate customers and statistics.
- **§3 direction still applies.** Signal Room, same tokens, same three
  typefaces, same motion table. Subpages are where a redesign usually drifts
  back to generic — that is the specific failure the skill exists to prevent.
- **Reuse the existing primitives** rather than inventing per-page ones:
  `SectionHeader`, `Button`, `.glass`, `.shell`, `.section`, the reveal
  vocabulary (`[data-reveal]` / `[data-draw]`), and the `.t-*` type roles.
- A content page needs a **footer**. There is currently only the one embedded
  in `FinalCta.tsx`; extract it before the second page needs it.

---
# 2026-09-06 — LIGHT MODE + FIRST-STAGE PLATFORM RECOGNITION

Client feedback that drove this session:

> "Ok, it's not there yet, add the icons of the AI engines and Google that we are
> scanning so that it is clear what it is in the first stage. And that there will
> be an option for a bright mode."

## Completed

* **Verified the platform set against the live site, not assumption.** GeoRepute
  scans **Google + 6 AI engines: ChatGPT, Gemini, Claude, Perplexity, Copilot,
  Grok** — confirmed from the GEON study protocol (gintex-ai.vercel.app blog:
  "6 AI engines (ChatGPT, Gemini, Claude, Perplexity, Copilot, Grok)") and the
  live ai-recognition page (which cites ChatGPT, Gemini, Grok findings). The
  existing copy's "6 AI engines, plus Google" matches exactly.
* **Added a light theme as the DEFAULT experience.** The site now opens bright
  (white / `#F5F3FF` / `#EDEAFF` lavender environment, deep-navy ink text,
  `#610AE5` accents). Dark mode is an explicit visitor choice, not the default
  and not driven by OS preference.
* **Added a theme switcher to the navigation** — a 44px sun/moon pill in
  `nav__actions`, aria-labelled, persisted to `localStorage` (`georepute-theme`),
  re-applied by an inline script in `layout.tsx` before first paint so the
  choice survives reloads without a flash of the wrong theme. Light loads by
  default even when the OS prefers dark (client requirement).
* **Restructured all colour tokens** in `app/globals.css`: `:root` now holds the
  LIGHT values, `html.theme-dark` overrides with the original Signal Room dark
  values. Every component already read `var(--color-*)` / `var(--line)` etc., so
  the whole page restyles from the token layer; hardcoded rgba surfaces
  (nav panel, drawer, graph nodes, ghost button, evidence chips, measure
  tracks, invis markers) were converted to theme variables.
* **Designed the light-mode 3D environment separately from dark.** The additive
  scene is multiplied into the bright page (`mix-blend-mode: multiply`,
  opacity 0.85) so the network reads as a deep-violet technical drawing instead
  of washed-out neon; uniforms are re-pointed per theme (dark keeps `#a78bfa`
  glow, light uses `#5b21c7` ink with a 1.15 lift so multiply keeps saturation);
  the dark legibility scrim is replaced by a soft white frame veil in light;
  `StaticNetwork` fallback became theme-aware via CSS variables.
* **Added the first-stage platform constellation** (`PlatformConstellation` +
  `PlatformGlyph`): the seven surfaces (Google + six engines) rendered as
  connected intelligence nodes — a GeoRepute core pill ("GeoRepute scans") with
  seven arcs to platform chips carrying recognisable brand glyphs (Google
  multicolour G, ChatGPT/Copilot sparkles, Gemini/Claude four-point stars,
  Perplexity hexagon, Grok X) + names, placed between the hero CTAs and the
  capabilities foot. On narrow screens it collapses to a wrapped chip row.
* **Theme-aware graph/glass surfaces** in sections 06 and 08 (nodes now use
  `--surface-glass`, focus uses `--color-signal-mist`), measure tracks,
  evidence chips, blind-spot markers, plan items.
* **Decision reconstruction (section 04) verified intact** — the viewport-locked
  sticky stage (the client's "content moves beyond the viewport" complaint from
  an earlier round) was already fixed and this session re-verified it live:
  stage stays pinned (top 0, height = viewport) through the whole scroll range,
  the six captions crossfade at their beats, ticks advance 0→5, backward scroll
  returns to state 0, head and lower third never leave the frame.

## Design Decisions

* **Light is the primary direction; dark is the choice.** The client was
  explicit: "light mode must be the default initial experience", and "do not
  build dark mode first and then simply invert it". The light theme is a
  white/lavender analytical instrument room (per the client's palette), not a
  brightness-inverted dark page. Both themes share layout, type, hierarchy and
  motion; only the environmental treatment changes.
* **The scanned platforms are a connected constellation, not a logo row.** Each
  platform sits on its own node with a line to the GeoRepute core, so the first
  stage reads "these systems are being monitored" rather than "here is a logo
  strip". Names are always shown beside the glyph — recognition never depends
  on the icon alone.
* **Platform marks are simplified geometric glyphs in brand colours** rather
  than downloaded logo assets (no logo files existed in the repo, and quality
  of hand-drawn raster logos was not worth the risk). Names + colours carry the
  recognition; glyphs are the accent.
* **The light-mode scene uses CSS multiply instead of a second shader
  pipeline.** The additive shaders stay untouched; multiplying the canvas into
  the bright background converts additive glow into dark ink, and the uniform
  colour lift keeps the result violet rather than grey. This keeps one GL
  context, one draw path, and no per-frame theme cost.
* **Contrast is checked per theme against the actual rendered background.**
  Light ink `#1B2340` ≈ 14.9:1, dim `#4C5678` ≈ 6.2:1, accent `#5B21C7` ≈ 7.6:1
  on white; amber moved to `#B45309` (7.0:1) in light because `#FFB547` fails on
  white. `#7B3AEC` remains forbidden for small text in both themes.
* **Theme persistence is a convenience, never a requirement** — localStorage
  failures are swallowed; the page just stays light.
* **Chose not to also inject the platform identity into the WebGL node layer**:
  the hero constellation is DOM/SVG (crisp, theme-adaptable, accessible), the
  WebGL scene stays the abstract decision network behind it. This is the
  deliberate split — the 3D network argues causality, the constellation names
  the surfaces being watched.

## Technical Changes

* **New files:**
  * `lib/theme.tsx` — `ThemeProvider`, `useTheme`, `readStoredTheme`,
    `applyThemeClass` (toggles `theme-dark` on `<html>`, syncs `colorScheme`
    and the `theme-color` meta tag).
  * `components/ui/ThemeToggle.tsx` — 44px sun/moon pill for the nav.
  * `components/ui/PlatformGlyph.tsx` — the seven platform marks + `PLATFORMS`
    list (verified set).
  * `components/ui/PlatformConstellation.tsx` — arc layout with SVG connectors,
    core pill, responsive chip wrap.
* **Modified:**
  * `app/layout.tsx` — theme pre-hydration inline script, `ThemeProvider`
    wrapper, light `themeColor`/`colorScheme` defaults.
  * `app/globals.css` — colour tokens moved from `@theme` into `:root` (light)
    + `html.theme-dark` (dark); added surface/line/glow/scrim/nav-floor
    variables per theme; smooth theme transitions on body/nav/panels;
    reduced-motion block extended to the constellation.
  * `app/ui.css` — `.scene-layer canvas` blend/opacity via `--canvas-blend` /
    `--canvas-opacity`; scrim now `--scrim-radial` + `--scrim-linear` per theme;
    nav panel/drawer/lifted backgrounds tokenised; theme-toggle styles;
    full `.platforms*` constellation styles; `.btn--ghost` tokenised.
  * `app/sections.css` — graph nodes/edges/evidence/measure/invis-marker
    surfaces tokenised; plan hover surface.
  * `components/three/IntelligenceNetwork.tsx` — theme-aware `PALETTE`
    (light/dark), uniform re-point on theme change with a 1.15 light lift.
  * `components/three/ParticleField.tsx` — theme-aware dust colour uniform.
  * `components/three/StaticNetwork.tsx` — colours via `--net-*` CSS vars.
  * `components/sections/Hero.tsx` — `PlatformConstellation` between CTAs and
    foot (hero stays a server component; the constellation is a client island).
  * `components/ui/Navigation.tsx` — `<ThemeToggle />` in `nav__actions`.
* **No libraries added or removed.** No shader rewrites; blending mode,
  geometry and the director/beat architecture are untouched.
* **Theme switching does not recreate the GL context** — only uniform colours
  change; verified the canvas survives toggles (context not lost).

## Files Changed

* `app/globals.css`
* `app/layout.tsx`
* `app/ui.css`
* `app/sections.css`
* `components/sections/Hero.tsx`
* `components/ui/Navigation.tsx`
* `components/ui/ThemeToggle.tsx` (new)
* `components/ui/PlatformGlyph.tsx` (new)
* `components/ui/PlatformConstellation.tsx` (new)
* `components/three/IntelligenceNetwork.tsx`
* `components/three/ParticleField.tsx`
* `components/three/StaticNetwork.tsx`
* `lib/theme.tsx` (new)
* `handoff.md`

## Current State

The site now loads in **light mode**: white-to-lavender gradient environment,
deep-navy Inter Tight headlines, purple accents, and the 3D network drawn as a
subtle dark-violet linework behind the copy. The hero reads, top to bottom:
eyebrow → "See where your business is Recognized. Recommended. *Chosen.*" →
supporting copy → two CTAs → the **platform constellation** (GeoRepute core
with arcs to Google, ChatGPT, Gemini, Claude, Perplexity, Copilot, Grok) →
capabilities strip. The nav carries the sun/moon switcher; choosing dark
re-applies the original luminous Signal Room treatment with a smooth crossfade,
persists across reloads, and the scene follows (violet glow in dark, ink in
light). Section 04 stays a locked cinematic stage: scroll drives six captions
and ticks while the camera/node choreography runs on the same axis. Reveals,
§09 counters/dial/meters, both interactive graphs, the drawer/accordion and
the final CTA all verified working in both themes. `npm run build` and
`tsc --noEmit` pass clean; no horizontal overflow at mobile width.

## Known Issues

* **Light-mode scene presence is tuned from screenshots in an emulated
  browser; the network reads as elegant dark-violet linework, but the exact
  balance (canvas opacity 0.85, uniform lift 1.15) should be re-checked on a
  real display.** If the network feels too faint in light mode, raise
  `--canvas-opacity` or `LIGHT_BOOST` in `IntelligenceNetwork.tsx`; if the
  scene darkens the page too much, lower them.
* The preview browser in this environment is viewport-locked at mobile width
  and its screenshots lag theme switches — desktop-wide pixel QA of the
  constellation arc and mega-menus was done via forced-layout DOM checks, not
  real desktop screenshots.
* Platform glyphs are simplified geometric brand marks, not official logo
  files. Fine for recognition; if the client wants the actual trademarked logo
  assets, those need to be sourced (repo has none).
* Nav mega-menus still open on hover with keyboard fallback; unchanged, but
  their light-mode panel (frosted white floor) deserves a desktop visual check.
* `npm run lint` is still unwired (no ESLint installed) — carried over from
  before; the `react-hooks/exhaustive-deps` comments in the 3D uniforms are
  there for when it lands.
* The dev server for this session ended up on port **64889** (an earlier
  `npm run dev` on 3000 was killed by a terminated shell and Next re-bound to a
  free port). `.claude/launch.json` still expects 3000 — harmless, but note it
  if a fresh server won't start on 3000.

## Client Feedback

### Addressed

"add the icons of the AI engines and Google that we are scanning so that it is
clear what it is in the first stage."

→ Verified platform set (Google + ChatGPT, Gemini, Claude, Perplexity, Copilot,
Grok) and rendered them as a connected constellation in the hero: recognisable
brand glyphs + names, arcs into a "GeoRepute scans" core, wrapping to chips on
mobile. The hierarchy stays headline → network → platform recognition → CTA.

"And that there will be an option for a bright mode."

→ Light mode is now the DEFAULT first experience (bright, premium, analytical
per the client's palette), with dark mode one toggle away and persisted.

### Remaining

* No request yet for the platform constellation to also drive the WebGL camera
  choreography (platform nodes approaching/illuminating on scroll). The
  director currently choreographs the abstract decision nodes; wiring the
  platform layer into it is possible if the client asks.
* CTA wording divergence ("Analyze My Business" vs "Start Analysis") and the
  `#analyze` in-page anchors vs real routes — unchanged, still worth a client
  decision.

## Next Recommended Tasks

1. **Real-device visual pass in light mode** — desktop (1440px) and phone, both
   themes; fine-tune `--canvas-opacity` / `LIGHT_BOOST` and check the mega-menu
   panels and constellation arc at true desktop width.
2. **Test `prefers-reduced-motion` end-to-end** — `detectTier()` should return
   `none` and render the themed `StaticNetwork`; the reduced-motion overrides
   now cover the constellation; verify both.
3. **Wire ESLint** (`eslint-config-next`) or drop the `lint` script — carried
   over from the previous session.
4. **Decide the hero CTA anchors** (`#analyze` vs `/en/app/reconstruct`) with
   the client, then unify wording.
5. **Subpages phase (§14 of the parent handoff)** — settle the `/` vs `/en/…`
   routing decision, extract the app shell (ScrollProvider, canvas,
   Navigation, ScrollProgress) into a layout, and build the first content
   page with the theme system intact.
6. **Optional: deepen the platform integration** — give the first-stage
   constellation a scroll beat (platforms light one-by-one as the camera
   approaches) once the client confirms they want the platforms in the
   choreography, not just the stage.