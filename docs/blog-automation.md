# AI content automation (blog)

Upload a list of topics once, choose how many articles to publish per day, and the site does the rest: Claude writes each
article, adapts it into every language the site supports, checks it, schedules it and publishes it. The CMS shows what was
written, what is scheduled, what is live and what needs a person.

It extends the existing blog CMS (same `posts` table, same editor, same public pages, same login). Nothing about manual
posts, manual translation or the draft generator changed.

Admin: **/admin/automation** (Overview, Content queue, Add topics, Settings).

## One-time setup

1. **Database.** Run the SQL in `SUPABASE_SETUP.md`, **Step 13** (adds SEO fields to `posts`, and three admin-only tables:
   settings, topics, and one row per topic and language). Safe to re-run.
2. **Environment variables** (host and `.env.local`; none may start with `NEXT_PUBLIC_`):
   `ANTHROPIC_API_KEY` (already needed), `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (`openssl rand -hex 32`).
3. **Scheduler.** Something must call `GET /api/cron/blog-automation` every 5 minutes with
   `Authorization: Bearer <CRON_SECRET>`. Step 13 has ready-made setups for Supabase pg_cron (recommended, free), Vercel Cron
   (Pro plan only for this frequency) and any HTTP pinger. The function needs a 300 s limit (`maxDuration = 300`: Vercel
   Pro, or Hobby with Fluid compute). A shorter limit makes long jobs time out and be retried.
4. Open **Automation > Settings**, set the schedule, save. Open **Add topics**, upload a file. Press **Start Automation** on the Overview.

Until step 3 is done the automation still works: press **Run now** on the Overview to run one pass by hand.

## Daily use

| You want to | Where |
|---|---|
| Add hundreds of topics | Add topics > upload `.csv` or `.xlsx` (template provided). Preview shows every row that will be skipped and why. |
| Add one topic | Add topics > "Add one topic" |
| See everything | Content queue: one row per topic, expand it for one row per language (status, dates, retries, error) |
| Fix a failed article | Retry, or Edit (opens the normal editor). "Retry all failed" for a whole night's failures |
| Review before publishing | Edit if needed, then Approve (or "Approve all ready") |
| Change a publish date | Change date, on the language row |
| Rewrite one language only | "Regenerate this language" on that row (one Claude call, nothing else is touched) |
| Stop everything | Overview > Pause generation (scheduled articles still publish) or Stop automation (nothing runs) |

## How the schedule works

- **Articles per day** (1 to 100) counts *topics*. **How languages are used** decides what one topic becomes:
  - *Every topic in every selected language*: written once, adapted into each other language. 10 topics a day in 7 languages is 70 pieces a day.
  - *One language per topic, taking turns*: each topic is written directly in one language, the languages rotate. 10 topics a day is 10 pieces a day.

  The Settings page states the resulting number of pieces and Claude calls in plain words as you change it, so "100 per day" can never silently mean 700.
- **Languages** default to "all languages the site supports", read from `lib/i18n.ts` (`LOCALES`) every time. Add a language to
  the site and the next planning run includes it: no change to the automation, no SQL (the `locale` check is a format check, not a list).
- Topics are **planned** `look-ahead` days ahead (default 3) in queue order, each day up to the per-day number, from the start
  date, at the publish time in the chosen time zone (with the configured spacing between articles). Everything else waits in the
  queue, so a 500-topic upload is not generated in one go and costs nothing until its turn.
- Lowering the per-day number gives back planned topics whose work has not started.

## Pipeline

```
topic -> PLAN -> GENERATE (1 Claude call) -> LOCALIZE (per language) -> VALIDATE -> [review] -> PUBLISH
```

Each step is a separate job with its own state, so a Claude outage cannot stop publishing, and articles are written ahead of
their publish date. A tick (one scheduler call) does a bounded amount of work and returns; the admin pages only read state.

| Status | Meaning |
|---|---|
| Queued | Waiting (also: waiting for a retry time) |
| Generating / Translating | Claude is working on it |
| Needs review | Failed a check or the translation was flagged. Never publishes until fixed and approved |
| Ready | Written and checked. Waiting for approval (review required) or for a manual publish (auto-publish off) |
| Scheduled | Approved. Publishes by itself at its time |
| Published | Live |
| Failed | All automatic attempts failed. Error kept. Retry from the queue |
| Skipped | Topic skipped |

At topic level the queue also shows *Generated* (canonical article done, translations pending) and *Translation in progress*.

## Content and quality

- **Structured output.** Claude returns JSON (title, meta title, meta description, slug, excerpt, body blocks, FAQ, CTA, tags,
  keywords, image concept, link opportunities), never HTML. Our code cleans it, bounds it and converts it to editor blocks. The
  model cannot add a link that is not on the allowed list, and cannot change what the system does.
- **Generation rules are data.** *Settings > Generation rules* holds the full prompt (edit it without a deploy). Tone, SEO
  instructions, CTA, categories, required sections, FAQ mode, length and internal-linking rules are separate fields. The built-in
  default lives in `lib/blog/automation/prompt.ts`.
- **Localization, not literal translation.** Body, title, excerpt, tags, CTA and FAQ go through the existing verified translator
  (`lib/blog/translation.ts`): block-for-block, numbers, links, brand names and site terminology checked without a model, plus an
  optional independent bilingual review. The **SEO fields are written separately for each language** (own meta title, meta
  description, slug, keywords) so the localized page is optimized for its own searchers. Internal links are rewritten to the
  target language's pages.
- **Publish gate** (`lib/blog/automation/validate.ts`, deterministic, runs after generation and again right before publishing):
  title, slug, meta title, meta description, content, heading structure, required sections, FAQ when required, target language,
  no placeholder text or AI-refusal text or raw JSON, all links allowed (internal links must be on the allowed list, in the
  post's own language). A failure means **Needs review**, never a live post.
- **Built-in proofreading.** A word repeated back to back (any language) blocks publishing outright. A whole sentence repeated
  in the body, and English AI-filler clichés ("in today's fast-paced world", "unlock the power of", "dive into", and the like),
  are flagged as warnings for the editor to judge. At generation time, a repeated word is also rejected before it is ever
  stored: the model gets the reason as feedback and rewrites that attempt automatically (see `validateArticle` in
  `lib/blog/automation/article.ts`).
- **Public pages** use the language's own meta title and description, add keywords, an FAQ section with FAQPage structured data,
  and hreflang links between the language versions (linked through `translation_group`, so each language can have its own slug).
  The blog index is paginated (24 per page) and has per-language canonical URLs.

## Pictures inside articles

Besides the featured image, the AI plans up to **N pictures inside each article** (Settings > "Pictures inside each article", 0 to 4,
default 2). For each it returns the section (an exact heading of the article), a plain-English search for a stock photo, and a
description of the photo in the article's language. `lib/blog/automation/inlineImages.ts` does the rest, before the article is first saved:

- A plan that names a heading the article does not have is dropped, never an error. Fewer pictures than planned is normal.
- Each picture is a different photo, and none repeats the featured image (a repeated result is retried with another seed).
- A picture is placed after the first paragraph of its section, so the section's direct answer stays first; if the section opens with a
  list, it goes straight under the heading.
- Storage uses the props BlockNote's image block keeps: `caption` is the visible credit line (in the article's language), `name` holds a
  small JSON object `{alt, by, byUrl}` with the description for screen readers and search engines and the photographer. Hand-added
  pictures keep a plain file name there and work as before.
- The public page renders the description as `alt`, lazy-loads the image, and links the photographer and Unsplash in the caption (only to
  unsplash.com), as Unsplash's guidelines require. The pictures are also offered to search engines in the article's structured data.
- Localization translates each description together with the article (they travel as extra paragraphs after the FAQ, with the same
  checks) and rewrites the credit line in the target language. The photos are reused, so other languages cost **no extra Unsplash
  requests**.
- The publish gate warns (never blocks) about a picture with no description.

Unsplash's free demo tier allows 50 requests an hour, and each article uses about one search and one download report per picture (featured
included). A few articles an hour is fine; for bulk runs, apply for production access on unsplash.com/developers.

## What every article contains

Each article is built to a fixed shape (the client's brief: images, graphs, bullet points, an executive summary, a sidebar with the
author's other articles, internal and external links, and information about the author):

- **Opening paragraph** (answer first), then an **Executive summary** section: a 40 to 80 word summary of the whole article followed by
  3 to 5 key-takeaway bullets. The heading is written in the article's language.
- **At least one bulleted or numbered list** in the body (a hard requirement; the AI rewrites if there is none).
- **Pictures** inside the article (see below) and **charts and diagrams** (Settings > "Charts and diagrams", 0 to 2, default 1):
  - A **process diagram** (3 to 6 steps) needs no numbers.
  - A **bar chart** is drawn as real data only if it names a source and *every number appears in the topic or notes the admin wrote*
    (checked by code, not trusted to the model). Otherwise it is forced to "Illustrative example, not real data", stamped inside the
    picture itself. The rule is `enforceHonesty` in `lib/blog/automation/charts.ts`.
  - Charts are our own SVG, stored in an image block (`data:image/svg+xml`, the only inline address the page will render), with the data kept
    in the block so localization redraws them in the target language and direction. Each has a written description (alt text).
- **2 to 5 links**: at least one to a page of our own site and, when one fits, one to an authoritative outside source. The AI may only use
  addresses from `lib/blog/links.ts` (the site's pages in the article's language, plus a short list of checked Google, Schema.org and W3C
  pages), the admin's link rules and URLs in the brief. It never invents a URL. The publish gate warns when an article has no internal
  link, no outside link or no list.
- **Author box and sidebar** on the page (see below).

## Authors

Readers see an author box (name, photo, role, short bio, links) and "More from this author" beside every article, and the article's
structured data names the author as a Person (job title, bio, photo, profiles) or, for the built-in team, the organization.

- `profiles` is private (each person can read only their own row), so public author details live in a separate `authors` table that
  anyone can read and only admins can change. **Run SUPABASE_SETUP.md Step 14.** Until then everything works and articles show the
  built-in "GeoRepute Editorial Team" (bios in all seven languages, `lib/authors.ts`).
- Manage people in **Admin > Authors** (photo upload, links, a bio per language). One can be the **default author**: AI-written articles and
  posts with no author chosen use it. Choose an author per post in the editor (step 3).
- "More from this author" lists that author's other published posts in the same language; the default author also owns every post with
  no author of its own. Everything degrades safely if the table or column is missing.

## Featured images (Unsplash)

- Set `UNSPLASH_ACCESS_KEY` (server-side only; unsplash.com/developers > your app > Access Key) and run the `featured_image_credit`
  line in `SUPABASE_SETUP.md` Step 13. Without the key, articles are simply written without a featured image.
- When the canonical article is written, Claude also returns a short English `imageQuery`. The site searches Unsplash with it
  (landscape, safe content), picks one of the top 10 results (stable per topic, so different topics rarely share a photo),
  reports the download to Unsplash, and stores the photo URL plus the photographer credit on the post. Every language version
  reuses the same photo. The public post shows "Photo by <name> on Unsplash" on the cover, with the UTM-tagged links Unsplash requires.
- It never blocks anything: no key, no result, an API error or the rate limit just means no image. An image an editor set
  is never replaced, and the credit only shows while the post still uses that exact image.
- **Rate limit:** a new Unsplash app is in demo mode (50 requests/hour, 2 per article). Apply for production access
  (5,000/hour) in the Unsplash dashboard before running many articles a day. Unsplash's terms require the credit and the
  hotlinked URL, so the photo is not copied into Supabase Storage.
- Code: `lib/blog/automation/images.ts`, `components/blog/PhotoCredit.tsx`.

## Errors, retries and cost

- Every failure saves a status and a readable message (never keys or provider text) and keeps the topic. Retryable failures
  (rate limit, overload, timeout, connection, unusable output) are retried automatically with growing delays up to *attempts*
  (default 3), then marked Failed; Retry in the queue starts over.
- One bad article never blocks the queue. A rate limit or overload pauses *all* Claude calls for a while (shown on the Overview). A
  wrong or missing API key or a billing problem does not use up attempts: the item waits and the Overview says why.
- A job that dies mid-way (function timeout) holds a lease; when it expires the job is retried.
- Claude is called once per operation: one call writes an article, one localization per language. Finished work is stored and
  never repeated. Regenerating one language re-adapts only that language from the stored article. Retrying one failed language
  calls Claude once. Topics are only written when they enter the look-ahead window.

## Security

- Every admin action re-checks admin status, like the rest of the CMS. The three tables are admin-only under RLS (no `anon` policy).
- The scheduler has no signed-in admin, so it uses the Supabase **service-role key**, read in exactly one server-only file
  (`lib/supabase/admin.ts`) and used only by `app/api/cron/blog-automation/route.ts`, which first checks `CRON_SECRET`
  (constant-time, fails closed, does not say why it refused). Nothing else in the app uses that key.
- Topic text is treated as material to write about, never as instructions. Imported cells are stripped of control and bidi characters.

## SEO, GEO and AEO

Every article (automated or written with the editor's "Generate with Claude") is built to the same standard, taken from the
audit rubric in `.claude/skills/seo-geo-aeo/SKILL.md`. The rules live in code, in `lib/blog/seo.ts`, not in the editable prompt:
the playbook is appended to every request, so saving a custom system prompt cannot switch it off.

- **What the writer is told.** Primary keyword (`keywords[0]`, adapted to how people in that language really search, never
  translated literally) in the title, meta title, meta description, first sentence and an H2; meta title at most 60
  characters, meta description 120 to 158; an answer-first opening paragraph of 25 to 80 words; a plain "X is ..." definition;
  question-form H2s whose first sentence answers them in 40 to 60 words; a list; 3 to 5 key takeaways right after the opening;
  an FAQ of real follow-up questions with direct answers; consistent entity names; no invented statistics. Each language also
  gets its own note on how people ask questions in it (`SEARCH_NOTES`: Hebrew איך/מה/למה, Arabic كيف/ما هو, Russian как/что такое,
  French comment/qu'est-ce que, Spanish ¿cómo/qué es?, Portuguese como/o que é).
- **What forces a rewrite** (the model is told why and tries again): meta title over 70 characters or without the primary keyword,
  meta description outside 100 to 175 characters, fewer than 3 key takeaways. The localizer's SEO-field call is held to the same
  keyword and length rules. Keyword matching is stem-based, so Russian cases, French/Spanish/Portuguese plurals and Hebrew/Arabic
  prefixes do not cause false failures.
- **What is only flagged.** The publish gate adds a warning (never a blocker) for each failed check: meta lengths, keyword
  placement, opening paragraph length, heading order, question headings, a list, an FAQ, related keywords.
- **What the public page adds.** Title tag, description, canonical and hreflang per language; Open Graph article tags with a
  share-image fallback; `max-image-preview:large` and unlimited snippets for search and AI answers; BlogPosting JSON-LD (absolute
  URLs, publisher with logo, author or the organization, language, word count, section, speakable), BreadcrumbList and FAQPage;
  heading anchors that work in Hebrew, Arabic and Cyrillic; a collapsed table of contents; three related posts (internal
  links); `lang`/`dir` on the article; image alt text.
- **Discovery.** Every post lists all its language versions in `sitemap.xml` (hreflang), each language has its own blog index
  entry, and each language has an RSS feed at `/blog/feed.xml?lang=xx`.

**Posts written by hand.** The post editor has an **SEO assistant** (`components/admin/SeoAssistant.tsx`, logic in
`lib/blog/optimize.ts`). *Autocomplete empty fields* fills only the blank search boxes; *Optimize for search* rewrites meta
title, meta description, excerpt, keywords and FAQ (category and tags only if empty). It reads the article but never edits it,
never changes a URL that already exists, shows the SEO score before and after, offers a suggested answer-first opening
paragraph to paste in, lists what to change in the text, and has **Undo** until the post is saved. It needs a title and about 80
words of article, is admin-only and limited to 30 runs an hour.

Google restricts FAQ *rich results* to a few kinds of sites, so do not expect FAQ dropdowns in Google results. The FAQ markup still
helps AI engines and answer boxes read the page, and the FAQ is visible to readers.

## Where the code is

| | |
|---|---|
| `lib/blog/automation/config.ts` | Settings type, defaults, clamping, "what this means" workload text |
| `lib/blog/automation/schedule.ts` | Time zones, publish slots, planning window, language rotation |
| `lib/blog/seo.ts` | SEO / GEO / AEO playbook, per-language search notes, keyword matching, heading anchors, SEO scoring |
| `lib/blog/structuredData.ts` | JSON-LD builders, absolute URLs, title tag rules |
| `lib/blog/automation/prompt.ts` | Default prompt, article JSON schema, allowed links |
| `lib/blog/automation/article.ts` | Canonical article: call, validation, retry with feedback |
| `lib/blog/automation/localize.ts` | Localization: body/FAQ/CTA via the translator, per-language SEO fields, link rewriting |
| `lib/blog/automation/validate.ts` | The publish gate |
| `lib/blog/automation/images.ts` | Unsplash featured-image lookup and photographer credit |
| `lib/blog/automation/worker.ts` | The engine (`runTick`) and manual operations (retry, regenerate, approve, publish, reschedule, skip) |
| `lib/blog/automation/topics.ts` | CSV/Excel rows to topics |
| `lib/services/blogAutomation.ts` | Supabase store, queue and statistics queries |
| `lib/services/blogAutomationRunner.ts` | Claude adapter and `runAutomationTick` |
| `lib/actions/blogAutomation.ts` | Admin server actions |
| `app/api/cron/blog-automation/route.ts` | Scheduler entry point |
| `app/admin/(dashboard)/automation/*`, `components/admin/automation/*` | The UI |

## Tests

`npm run automation:check` runs 404 offline checks with an in-memory store and a scripted model (no database, no API, no cost):
scheduling maths across time zones and DST, planning, both language modes, dynamic languages, retries and back-off, systemic
errors, expired leases, the publish gate, review, pause and resume, one-language regeneration (no wasted calls), topic import,
article and SEO validation, localization of body/FAQ/CTA/links, and static checks on secrets and admin guards.

`npm run automation:check -- --live` (needs `ANTHROPIC_API_KEY`, about 5 real calls) also writes one real article, localizes it
into Hebrew and French, and checks both pass the publish gate. Output goes to `scripts/.output/` for a human read.

## Known limits

- The database code, the Claude calls and the scheduler route have not been exercised end to end against the real Supabase
  project and the real API in this repository's checks: the offline suite covers the logic, and the admin screens were checked in
  a browser with sample data. Do a first run with a handful of topics (Run now) before uploading hundreds.
- Featured images come from Unsplash (see below) and are stock photos chosen by a search, not generated. Each article still stores an image idea (visible in the queue and the post editor). Images inside the article body are not added.
- Translations of a post that was edited after localization are not refreshed automatically; use Regenerate on that language.
- Articles over 3,000 words cannot be localized by the existing translator (the length options stay well below that).
