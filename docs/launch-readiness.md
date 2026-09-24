# Launch readiness (2026-09-24)

Status of the pre-launch brief: site QA, links and assets, the Claude blog system, and deployment readiness.
Verified against a fresh `npm run build` + `next start`, not the dev server.

## Verified

- Production build succeeds. TypeScript clean. 187 pages crawled: all HTTP 200, 0 broken internal links, exactly one `<h1>` per page.
- Responsive: 33 page/width combinations at 375, 768 and 1280 px, no horizontal overflow.
- Console on a clean load of the production build: no errors. All requests 200.
- External links: `https://www.georepute.ai/signup`, `https://wa.me/972556800600` and the Calendly scheduler (`calendly.com/georepute/30min`, embedded on /briefing) all respond 200.
- Admin: every `/admin/*` route redirects to login when signed out, including a direct POST to the server-action endpoint. Server actions re-check admin status themselves (`lib/actions/guard.ts`).
- Secrets: nothing from the Claude integration (key name, SDK, provider URL) appears in any browser bundle. `.env.local` is git-ignored; only `.env.example` is tracked.

## Fixed in this pass

- **Footer** had no links. Rebuilt (`components/ui/SiteFooter.tsx`) to follow the reference site's layout: brand with "Powered by Gintex", tagline, four columns (Product, Intelligence, Methodology, Company), a directional-modelling disclaimer, copyright and a demonstration-environment note. 26 links to pages or section anchors that exist here (Terms, Data processing and Security are omitted because those pages do not exist; Intelligence Marketplace is omitted because it was removed from the navigation), plus an Ecosystem column (GINTEX, copyup.ai, onlineperception.ai) with translated descriptions. Note: copyup.ai is the company behind the anonymized "Company A" sample reports, so this link lets a reader connect the two. Localized in all 7 languages, RTL-safe, 1/2/4 columns responsive.
- **No favicon / app icons** (`/favicon.ico` returned 404, the console error). Added `app/icon.png`, `app/apple-icon.png`.
- **No social preview.** Added `app/opengraph-image.png` and `app/twitter-image.png` plus Open Graph and Twitter card metadata.
- **Every page had the same `<title>` and description.** Added per-page titles, descriptions, canonical URLs and hreflang alternates for all locales (`lib/seo.ts`).
- **`/briefing` canonical** was hard-coded to `/en/briefing` for every language, and the page was missing from the sitemap. Fixed both.
- **Hebrew blog posts**: list and quote styles used physical `left` padding/border, so bullets and quote bars sat on the wrong side in RTL. Switched to logical properties (`app/blog.css`).

## Claude blog generation (new; there was no AI generation before)

The blog was an admin-only BlockNote editor over Supabase with no generation. Added:

- `lib/blog/generation.ts`: prompt, JSON schema (structured output), validation, language detection, safe inline-formatting parser, error mapping. No secrets and no runtime imports, so it is testable outside Next.
- `lib/services/claude.ts`: the only place `ANTHROPIC_API_KEY` is read. Marked `server-only`, so the build fails if a client component imports it.
- `lib/actions/blogGeneration.ts`: admin-only server action, 12 drafts per admin per hour cap, error codes only in logs.
- `components/admin/DraftGenerator.tsx`: "Generate a draft with Claude" panel on New/Edit post. It only fills the form. Nothing is saved or published from it; the result is a normal editable BlockNote document.
- Admin editor and title/excerpt fields switch to RTL for Hebrew posts.
- Both admin post pages set `maxDuration = 300`.

Model defaults to `claude-opus-5`; set `ANTHROPIC_BLOG_MODEL` to change it without a code change.

### How output is kept clean

The model returns structured JSON, never HTML or Markdown. Our code converts it to editor blocks and: strips HTML, bidi control characters and em dashes; allows only bold, italic and links the admin supplied in the brief; checks the output language by script and stopwords; checks length, headings, slug, tags and excerpt; and retries once with feedback if the draft is unusable.

### Tests

`npm run blog:check -- --offline` runs 80 offline checks (validation, formatting, language detection, error mapping, retry behavior, and rendering Hebrew/French/English through the real public `BlockRenderer`). All pass.

`npm run blog:check` also runs live generations when `ANTHROPIC_API_KEY` is set: English (short, medium), Hebrew (short, medium) and French (medium); `-- --full` adds long articles, Spanish, Arabic and Russian. Drafts are written to `scripts/.output/` for human review.

## Blog translation (English <-> Hebrew)

Admin > edit a saved post > **Translate this post**. Translating never saves anything: the admin sees a report, then chooses to save the result as an **unpublished draft** with the same slug in the other language (posts are linked by slug, per the `(locale, slug)` uniqueness). The featured image is deliberately not copied, because deleting either post would delete the shared image.

Accuracy is protected in layers (`lib/blog/translation.ts`):

1. **Block by block.** The post is split into units (each heading, paragraph, quote and list item). The model must return every unit exactly once, so nothing can be silently dropped, merged or reordered.
2. **Protected formatting.** Bold, italic, underline, strike, code and links travel as a small markup that our own parser turns back into editor blocks. A link URL cannot change; no HTML reaches the editor.
3. **Deterministic checks, no model involved:** same block structure and types; numbers, percentages and currency identical; links identical; brand names kept (GeoRepute, Google, ChatGPT and so on); the site's own terminology used (derived from the site's Hebrew nav in `lib/blog/glossary.ts`, so it cannot drift from `lib/i18n.ts`); no text left in the source language; length in proportion; target script.
4. **Independent review.** A second call sees source and translation side by side as a bilingual editor and reports mistranslations, omissions, additions, negation and tone problems.
5. **Automatic revision.** Any critical or major finding triggers one correction pass, then everything is checked again. Whatever remains is shown in the report, never hidden, and saving then requires the admin to confirm they will review it.

The save step re-runs the deterministic checks on the server, so a tampered browser payload cannot bypass them. Limits: posts over 3,000 words are refused (translate them in parts); 8 translations per admin per hour; 2 to 4 model calls per translation; the whole run is time-budgeted and reports it if the review had to be skipped.

**What this cannot promise.** No automated system guarantees an accurate translation. The layers above reliably catch numbers, links, dropped or invented blocks, dropped brand names, wrong site terminology, untranslated text and wrong language. They can still miss a subtle nuance, tone or idiom error, which is why the result is always an unpublished draft and a person must read it before it goes live.

Tests: `npm run translate:check -- --offline` (58 checks: markup round trip, a hand-checked Hebrew translation that must pass, 15 kinds of deliberate corruption that must each be caught, the full translate/review/revise loop against a scripted model, rendering). `npm run translate:check` also runs a live English -> Hebrew -> English round trip when `ANTHROPIC_API_KEY` is set. The live run is **not yet done** (no key), so real translation quality is unverified.

Config: `ANTHROPIC_API_KEY` (shared with generation) and optional `ANTHROPIC_TRANSLATION_MODEL` (defaults to the blog model, `claude-opus-5`).

## Installed skills

`content-writer` and `geo-content-optimizer` from `aaron-he-zhu/aaron-marketing-skills` (Apache-2.0), installed unmodified in `.claude/skills/` with attribution in `.claude/skills/THIRD-PARTY-aaron-marketing-skills.md`. They are SEO and GEO writing skills, not translation skills. They link to a few shared upstream files that are not installed here.

## Security and performance checklist review

Checked the team's two checklists against the code (the five items marked as failing, plus the passing items that could be verified). `npm run security:check` (51 checks) covers the fixes below.

**Marked failing, resolved or disproved**
- *Hide .env files from Git*: already satisfied. `.env*` is ignored, only `.env.example` is tracked, no env file or secret-shaped string was ever committed (checked all history).
- *Keep sensitive data from logs*: real leak, fixed. `meeting.ts` logged the whole Google API error (its request includes the visitor's name, email, phone and message); `mailer.ts` logged provider text that quotes the recipient address; the public form also returned raw provider messages to visitors. All logging now goes through `lib/utils/safeLog.ts` (redacts emails, phone numbers, keys, JWTs, secret query values) and visitors get a fixed message.
- *N+1 database queries*: none found. No queries inside loops; posts come from single joined queries.
- *Unused dependencies*: none (depcheck clean).
- *Unnecessary re-renders*: two real costs fixed (theme context value rebuilt every render; the post editor serialised the whole document on every keystroke). Scroll and pointer handlers are already rAF-throttled and passive, and write to the DOM directly.

**Marked passing, but not true, fixed**
- *Block cross-site scripting*: blog link renderer accepted any URL scheme, including `javascript:`. Now http(s), mailto, tel and relative links only (`lib/utils/safeHref.ts`). JSON-LD already used an escaping helper.
- *Tighten CORS / hardening headers*: no security headers were sent at all and `X-Powered-By` advertised the framework. Added nosniff, `X-Frame-Options: SAMEORIGIN`, Referrer-Policy, Permissions-Policy and HSTS to every route, and removed the banner. There are no API routes, so no CORS surface exists.
- *Rate limit requests*: the public meeting form had only a honeypot, yet it emails an address the visitor types (spam relay) and the team inbox. Added a per-IP limit (5 per 10 minutes). It is in-memory per server instance, so it slows casual abuse rather than guaranteeing a cap; the email provider's own limits remain the backstop.

**Verified as stated**: no secrets in browser storage (only theme, intro and cookie-consent flags); `npm audit` reports 0 vulnerabilities; admin routes are gated three ways (proxy, layout, RLS) and server actions re-check admin status.

**Not verifiable from the code, or not present**
- *Enable RLS / Index the database / connection pooling*: the setup SQL enables RLS and creates indexes, but the live Supabase project was not inspected.
- *Content-Security-Policy*: not added. A correct policy needs nonces for the inline theme script and JSON-LD plus allowances for the Calendly embed and intro video. Introduce it in report-only mode first.
- *claude-code-security-review*: there is no `.github/workflows` in this repo, so it is not set up here. It needs an Anthropic key stored as a GitHub secret.
- *Verify webhook signatures*: nothing to verify; the app has no webhook endpoints.
- *Validate file uploads*: type and size are checked in the browser only (uploads go straight to Supabase Storage), so real enforcement must be the bucket's own size and MIME limits. Check those in Supabase.
- *Verify email addresses*: the meeting form checks format only, it does not confirm the visitor owns the address.
- *Paginate large lists*: bounded but not paginated. The public blog index caps at 100 posts with no pager and the admin post list is unbounded.
- *Lighthouse audit, CDN, caching, load balancer*: not run or host-level. Run Lighthouse against the deployed site.

## Not done: needs an owner decision or access

1. **Live Claude testing.** No `ANTHROPIC_API_KEY` exists in the project or this environment, so no real generation or translation has been run. Add the key to `.env.local`, run `npm run blog:check` and `npm run translate:check`, and read the output in `scripts/.output/`. Every quality claim about Hebrew and other languages is unverified until then.
2. **Production configuration.** No Vercel project is linked and there is no CLI here, so production was not touched. Before go-live set in the host's environment:
   - `NEXT_PUBLIC_SITE_URL=https://www.georepute.ai` (canonical, hreflang, sitemap and robots all read it; local `.env.local` has `http://localhost:3000`)
   - `ANTHROPIC_API_KEY` (server only), optional `ANTHROPIC_BLOG_MODEL`
   - the existing Supabase, Resend and Google variables from `.env.example`
   Then run one generation in production and confirm the function's max duration allows it (plan limits apply).
3. **Domain.** Confirm the final domain, that DNS points at the deployment, and that HTTPS works.
4. **Social profiles.** The footer has no social icons: no official profile URLs exist anywhere in the repo, and they should not be guessed.
5. **Icon quality.** The only brand mark in the repo is 96x96 (`public/brand/logo-g-mark.png`), so the app icons and social image are upscaled and soft. Supply a large or vector mark.
6. **Terms of Service.** There is no terms page, and the footer links only to the Privacy Policy. Add one if the business needs it.
7. **Blog languages.** Posts only support `en` and `he` (database check constraint). The generator supports all 7 site languages, but the editor offers en/he only. Adding more needs a migration.
