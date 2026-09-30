# Supabase setup — GeoRepute Blog CMS

The app code is already wired for Supabase (client, server, data-access layer,
admin UI, RLS-aware queries). Nothing in the codebase creates or modifies your
Supabase project — that's entirely manual, and this document is the exact
sequence to do it. Once you've done Steps 1–6, the app works with zero code
changes: just set the two environment variables and restart.

---

## Step 1 — Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick an organization, name it (e.g. `georepute-landing`), set a database
   password (save it somewhere — it's separate from the API keys below), and
   choose a region close to your users.
3. Wait for provisioning to finish (a couple of minutes).

---

## Step 2 — Environment variables

In the dashboard: **Project Settings → Data API** gives you the **Project URL**.
**Project Settings → API Keys** gives you the **anon / public key**.

Create `.env.local` at the repo root (already gitignored) from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

Do **not** put the `service_role` key in a `NEXT_PUBLIC_` variable, ever. The
CMS itself never uses it: every operation, including admin writes, goes through
the signed-in admin's own session and is authorized by RLS (Steps 4–6). The one
exception is the optional AI content automation (Step 13), whose background
scheduler has no signed-in admin; it reads `SUPABASE_SERVICE_ROLE_KEY` in a
single server-only file.

Restart `npm run dev` after adding these — Next only reads `.env.local` at
startup.

---

## Step 3 — Database

Open **SQL Editor → New query** in the dashboard, paste the whole block
below, and run it once. It creates both tables, indexes, the `updated_at`
trigger, and the `is_admin()` helper function that Step 5's policies use.

```sql
-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- One row per admin. There is no public sign-up flow anywhere in this app;
-- rows here are inserted manually in Step 4, after creating the auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  featured_image text,
  author_id uuid references public.profiles (id) on delete set null,
  category text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists posts_status_published_at_idx on public.posts (status, published_at desc);

-- Keeps `updated_at` correct without every write having to remember to set it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

-- SECURITY DEFINER so RLS policies (Step 5) can call it without recursively
-- re-checking RLS on `profiles` inside itself.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;
```

**Why this schema, vs. the brief's suggestion:** it's the same shape you
proposed, unchanged — `posts` with the exact columns/types listed, plus one
addition: `profiles`, needed because "only authorized admins can manage
content" can't be enforced from `auth.users` alone (every authenticated
Supabase user lives there; there's no built-in admin flag). `profiles` is
that flag, and `author_id` references it instead of `auth.users` directly so
a post's author survives even if you later want author display names/avatars
without another join to a table your RLS policies can't safely expose.

---

## Step 4 — Admin authentication

1. **Turn off public sign-ups** (defense in depth — this app has no sign-up
   UI, but this stops anyone from hitting Supabase's public signup endpoint
   directly): **Authentication → Sign In / Providers → Email**, or
   **Authentication → Settings** depending on your dashboard version, look for
   Manage/ **User Signups** and disable "Allow new users to sign up".
2. **Create the first admin user**: **Authentication → Users → Add user →
   Create new user**. Enter an email and password, and check **Auto Confirm
   User** (so it doesn't wait on a confirmation email).
3. Copy the new user's **UID** (shown in the users table).
4. Back in **SQL Editor**, associate that user with an admin profile:

   ```sql
   insert into public.profiles (id, email, full_name, role)
   values ('paste-the-uid-here', 'admin@example.com', 'Your Name', 'admin');
   ```

**How the app decides who's an admin:** never a client-supplied flag. Every
check — `proxy.ts`, `app/admin/(dashboard)/layout.tsx`, every Server Action in
`lib/actions/`, and the RLS policies themselves — resolves admin status the
same way: is there a row in `public.profiles` whose `id` matches the caller's
`auth.uid()`? An authenticated user with no `profiles` row is treated as a
regular visitor everywhere in this app. To add a second admin later, repeat
steps 2–4 for that person; no code changes needed.

---

## Step 5 — Row Level Security

Same **SQL Editor**, new query:

```sql
alter table public.posts enable row level security;
alter table public.profiles enable row level security;

-- Anyone (including logged-out visitors) can read a post once it's published
-- and its publish date has arrived — this is also what makes scheduled
-- publishing (publish now, `published_at` set in the future) safe later.
create policy "Public can read published posts"
on public.posts for select
to anon, authenticated
using (status = 'published' and published_at is not null and published_at <= now());

-- Admins can read every post regardless of status (drafts included).
create policy "Admins can read all posts"
on public.posts for select
to authenticated
using (public.is_admin());

create policy "Admins can insert posts"
on public.posts for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update posts"
on public.posts for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete posts"
on public.posts for delete
to authenticated
using (public.is_admin());

-- Lets a signed-in user read their own profile row, which is how the app
-- checks "am I an admin?" server-side. Nobody can read anyone else's row.
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());
```

With no `insert`/`update`/`delete` policy on `posts` for the `anon` role (or
for authenticated-but-not-admin users), Postgres denies those operations by
default the moment RLS is enabled — there's nothing else to configure to
satisfy "visitors cannot create/edit/delete/publish posts."

---

## Step 6 — Storage

1. **Storage → New bucket**. Name it exactly `blog-images` (the code in
   `lib/services/storage.ts` hardcodes this name). Toggle **Public bucket**
   on — featured images are meant to be publicly viewable, and a public
   bucket serves them without needing signed URLs.
2. Apply the write policies (SQL Editor):

   ```sql
   -- Redundant with "Public bucket" above for reads, but harmless to have
   -- explicitly, and required if you ever flip the bucket back to private.
   create policy "Public can view blog images"
   on storage.objects for select
   to public
   using (bucket_id = 'blog-images');

   create policy "Admins can upload blog images"
   on storage.objects for insert
   to authenticated
   with check (bucket_id = 'blog-images' and public.is_admin());

   create policy "Admins can update blog images"
   on storage.objects for update
   to authenticated
   using (bucket_id = 'blog-images' and public.is_admin())
   with check (bucket_id = 'blog-images' and public.is_admin());

   create policy "Admins can delete blog images"
   on storage.objects for delete
   to authenticated
   using (bucket_id = 'blog-images' and public.is_admin());
   ```

The admin editor uploads directly from the browser to this bucket (see
`lib/services/storage.ts` → `uploadBlogImage`), using the signed-in admin's
own session — there's no upload API route, because none is needed: Storage
RLS above is what actually restricts writes to admins.

---

## Step 7 — APIs: what's automatic vs. what you configured

Supabase auto-generates two APIs the moment a project exists — nothing to set
up beyond Steps 3–6 above:

- **PostgREST** (a REST API over every table), which `@supabase/supabase-js`
  talks to under the hood for every `.from("posts")...` call in this
  codebase. It's already access-controlled by the RLS policies you just
  applied — there's no separate "enable API for this table" switch.
- **GoTrue** (the Auth API) for sign-in/sign-out/session refresh, used by
  `lib/actions/auth.ts` and `proxy.ts`.
- **Storage API** for the upload/list/remove calls in `lib/services/storage.ts`.

What you configured manually was never "turn on an API" — it was the tables,
policies and bucket those APIs sit on top of.

**This app's own API surface** (the "clean interface" the frontend calls) is
the data-access layer in `lib/services/posts.ts`, wired into pages or into
Server Actions in `lib/actions/`:

| Operation | Function | Called from |
|---|---|---|
| GET published posts | `getPublishedPosts()` | `app/blog/page.tsx` |
| GET published post by slug | `getPublishedPostBySlug()` | `app/blog/[slug]/page.tsx` |
| GET admin post list (all statuses) | `getAllPosts()` | `app/admin/(dashboard)/blogs/page.tsx` |
| GET single post for editing | `getPostById()` | `app/admin/(dashboard)/blogs/[id]/edit/page.tsx` |
| POST create | `createPost()` | `createPostAction` (Server Action) |
| PATCH update | `updatePost()` | `updatePostAction` |
| PATCH publish / unpublish | `publishPost()` / `unpublishPost()` | `publishPostAction` / `unpublishPostAction` |
| DELETE | `deletePost()` | `deletePostAction` |

**Why Server Actions instead of `app/api/.../route.ts` REST endpoints:**
reads happen directly in Server Components (no network hop needed — they
already run on the server), and mutations come from this app's own admin
forms, which is exactly what Next's Server Actions are for. Every action
re-verifies the caller is an admin itself (`lib/actions/guard.ts`) on top of
RLS, so nothing here is "trust the form." If you later need raw HTTP
endpoints (a separate admin client, a webhook, a mobile app), wrap any of the
`lib/services/posts.ts` functions in a `route.ts` — the service layer already
does not care who calls it.

---

## Step 8 — Test the backend

Once Steps 1–7 are done and `.env.local` is set:

```bash
npm run dev
```

- [ ] `/admin/login` — sign in with the admin account from Step 4.
- [ ] `/admin/blogs/new` — create a post, confirm it lands in the list as **draft**.
- [ ] Edit that post (change the title/content) and confirm the save sticks.
- [ ] Click **Publish** on it from the list (or the edit page).
- [ ] Open `/blog` in a different (or incognito) browser tab — the post appears.
- [ ] Click through to `/blog/<slug>` — the full post renders.
- [ ] Click **Unpublish** — the post disappears from `/blog` and its
      `/blog/<slug>` page now 404s (`not-found.tsx`).
- [ ] In an incognito window (no admin session), try `POST`-ing to Supabase
      directly or just confirm there's no create/edit/delete UI on the public
      site — RLS denies it at the database even if someone tried the API directly.
- [ ] In the post editor, upload a featured image — confirm the preview shows
      and the URL is saved.
- [ ] Confirm that image renders on the published post's card in `/blog` and
      on `/blog/<slug>`.
- [ ] Sign out, confirm `/admin/blogs` redirects to `/admin/login`.

---

## Step 9 — Draft preview links (migration)

Adds the ability to share an unpublished draft via a private link (e.g.
`https://<your-site>/blog/preview/<token>`) — anyone with the link can view
it, it's excluded from search indexing, and it works independently of
publishing. Run once in **SQL Editor**:

```sql
alter table public.posts
  add column if not exists preview_token uuid not null default gen_random_uuid(),
  add column if not exists preview_expires_at timestamptz;

create unique index if not exists posts_preview_token_idx on public.posts (preview_token);

-- Public lookup by token. Security definer so it can read past RLS, but it
-- only ever returns a row when the token matches exactly and (if set) hasn't
-- expired — the token itself is the access control here, not auth.
create or replace function public.get_post_by_preview_token(token uuid)
returns public.posts
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.posts
  where preview_token = token
    and (preview_expires_at is null or preview_expires_at > now())
  limit 1;
$$;

grant execute on function public.get_post_by_preview_token(uuid) to anon, authenticated;

-- Rotates a post's token (instantly invalidating any previously shared
-- link) and sets a new expiration, or clears it when expires_in_days is
-- null. Re-checks is_admin() itself, on top of the app's own requireAdmin().
create or replace function public.regenerate_preview_link(post_id uuid, expires_in_days integer default null)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.posts;
begin
  if not public.is_admin() then
    raise exception 'Only admins can regenerate a preview link';
  end if;

  update public.posts
  set preview_token = gen_random_uuid(),
      preview_expires_at = case
        when expires_in_days is null then null
        else now() + (expires_in_days || ' days')::interval
      end
  where id = post_id
  returning * into updated;

  return updated;
end;
$$;

grant execute on function public.regenerate_preview_link(uuid, integer) to authenticated;
```

No RLS policy changes needed — both functions are `security definer` (same pattern as `is_admin()`), so they bypass RLS internally while staying scoped to exactly what they're meant to expose.

---

## Step 10 — Block editor content (migration)

Adds a `content_blocks` column holding the post body as structured JSON from
the block editor (components/admin/BlockEditor.tsx). The existing `content`
column stays — it's now a plain-text mirror derived from the blocks on every
save (used for the JSON-LD/excerpt fallback), not edited directly. Posts
saved before this migration keep rendering from their old `content` text
until they're next edited. Run once in **SQL Editor**:

```sql
alter table public.posts add column if not exists content_blocks jsonb;
```

No RLS changes needed — it's covered by the existing `posts` policies from
Step 5.

---

## Step 11 — Post locale (migration)

Adds a `locale` column so a post belongs to a specific language (currently
`en` or `he` at this step; Step 12 widens it to all seven site languages). The `slug`
uniqueness constraint moves from "unique across all posts" to "unique per
locale" — `/blog/my-post` can now exist once in English and once in Hebrew
without colliding. Run once in **SQL Editor**:

```sql
alter table public.posts
  add column if not exists locale text not null default 'en' check (locale in ('en', 'he'));

-- Was `unique` on slug alone (from Step 3); replaced with a composite
-- uniqueness so the same slug can exist once per locale.
alter table public.posts drop constraint if exists posts_slug_key;
drop index if exists posts_slug_idx;

create unique index if not exists posts_locale_slug_idx on public.posts (locale, slug);
create index if not exists posts_locale_idx on public.posts (locale);
create index if not exists posts_locale_status_published_at_idx on public.posts (locale, status, published_at desc);
```

No RLS changes needed — it's covered by the existing `posts` policies from
Step 5. The table is empty at the time of writing, so this migration is safe
to run with no data backfill; if posts already exist when you run this, every
existing row defaults to `locale = 'en'`.

---

## Step 12 — All seven blog languages (migration)

The blog and the Claude translator work in all seven site languages (English,
Hebrew, Arabic, Russian, French, Spanish, Portuguese). Step 11 limited the
`locale` column to `en` and `he`, so **run this once in the SQL Editor before
saving a post or translation in any other language**. Without it, saving an
Arabic, Russian, French, Spanish or Portuguese post fails with a check
constraint error. It is safe to re-run and changes no existing rows.

```sql
alter table public.posts drop constraint if exists posts_locale_check;
alter table public.posts
  add constraint posts_locale_check check (locale in ('en', 'he', 'ar', 'ru', 'fr', 'es', 'pt'));
```

No RLS or index changes are needed. The `(locale, slug)` unique index from Step 11
already allows the same slug once per language.

---

## Step 13 — AI content automation (migration)

Adds everything the **AI Content Automation** section of the CMS (`/admin/automation`) needs: SEO fields
and a translation link on `posts`, and three admin-only tables for the topic queue. It is safe to re-run.
Run it once in the **SQL Editor** (after Steps 3-12):

```sql
-- 13a. posts: per-language SEO fields, FAQ, and a link between the language versions of one article.
alter table public.posts
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists keywords text[] not null default '{}',
  add column if not exists faq jsonb,
  add column if not exists translation_group uuid;

-- Photographer credit for an automatically chosen (Unsplash) featured image.
alter table public.posts add column if not exists featured_image_credit jsonb;

create index if not exists posts_translation_group_idx
  on public.posts (translation_group) where translation_group is not null;

-- Languages are no longer a fixed list in the database: the site's own language list (lib/i18n.ts) is the
-- source of truth, so adding a language to the site needs no SQL. Any language code is accepted here.
alter table public.posts drop constraint if exists posts_locale_check;
alter table public.posts
  add constraint posts_locale_check check (locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$');

-- 13b. Settings: exactly one row (id = 1), edited from Automation > Settings.
create table if not exists public.blog_automation_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default false,
  generation_paused boolean not null default false,
  auto_publish boolean not null default false,
  require_review boolean not null default true,
  articles_per_day integer not null default 1 check (articles_per_day between 1 and 100),
  language_mode text not null default 'all_languages' check (language_mode in ('all_languages', 'rotate')),
  source_locale text not null default 'en',
  languages text[],                                  -- null = every language the site supports
  start_date date,
  publish_time time not null default '09:00',
  timezone text not null default 'UTC',
  spread_minutes integer not null default 15 check (spread_minutes between 0 and 240),
  lookahead_days integer not null default 3 check (lookahead_days between 1 and 30),
  max_attempts integer not null default 3 check (max_attempts between 1 and 8),
  concurrency integer not null default 2 check (concurrency between 1 and 4),
  content_config jsonb not null default '{}'::jsonb,  -- tone, SEO rules, CTA, prompt, models, ...
  backoff_until timestamptz,                         -- runtime state: set while Claude is rate limiting
  plan_lock_until timestamptz,                       -- runtime state: short lock while days are planned
  last_tick_at timestamptz,                          -- runtime state: last time the scheduler ran
  last_tick_summary jsonb,
  updated_at timestamptz not null default now()
);
insert into public.blog_automation_settings (id) values (1) on conflict (id) do nothing;

-- 13c. Topic queue: one row per topic.
create table if not exists public.blog_topics (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  primary_keyword text,
  secondary_keywords text[] not null default '{}',
  category text,
  search_intent text,
  notes text,
  status text not null default 'queued' check (status in ('draft', 'queued', 'completed', 'skipped')),
  position bigint generated by default as identity,   -- queue order, lowest first
  scheduled_date date,                                -- the publish day the planner gave it
  source_locale text,                                 -- language the article is first written in
  plan_locales text[] not null default '{}',
  translation_group uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_topics_queue_idx on public.blog_topics (status, scheduled_date, position);
create index if not exists blog_topics_date_idx on public.blog_topics (scheduled_date) where scheduled_date is not null;

-- 13d. One row per topic and language: the unit the scheduler generates, retries and publishes.
create table if not exists public.blog_variants (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.blog_topics (id) on delete cascade,
  locale text not null check (locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
  is_source boolean not null default false,           -- the canonical article the others are adapted from
  status text not null default 'queued' check (status in
    ('queued', 'generating', 'localizing', 'needs_review', 'ready', 'scheduled', 'published', 'failed', 'skipped')),
  attempts integer not null default 0,                -- failed attempts so far
  last_error text,
  error_code text,
  next_attempt_at timestamptz,
  locked_until timestamptz,                           -- lease held while a job runs
  post_id uuid references public.posts (id) on delete set null,
  scheduled_at timestamptz,
  generated_at timestamptz,
  published_at timestamptz,
  validation jsonb,                                   -- publish-gate findings
  meta jsonb,                                         -- model, tokens, image concept, approval, ...
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, locale)
);
create index if not exists blog_variants_status_idx on public.blog_variants (status, scheduled_at);
create index if not exists blog_variants_topic_idx on public.blog_variants (topic_id);
create index if not exists blog_variants_post_idx on public.blog_variants (post_id) where post_id is not null;

drop trigger if exists blog_automation_settings_set_updated_at on public.blog_automation_settings;
create trigger blog_automation_settings_set_updated_at before update on public.blog_automation_settings
  for each row execute function public.set_updated_at();
drop trigger if exists blog_topics_set_updated_at on public.blog_topics;
create trigger blog_topics_set_updated_at before update on public.blog_topics
  for each row execute function public.set_updated_at();
drop trigger if exists blog_variants_set_updated_at on public.blog_variants;
create trigger blog_variants_set_updated_at before update on public.blog_variants
  for each row execute function public.set_updated_at();

-- 13e. Row Level Security: admins only. There is deliberately no policy for `anon`, so visitors can
-- neither read nor change any of this. (The scheduler's service-role key bypasses RLS by design.)
alter table public.blog_automation_settings enable row level security;
alter table public.blog_topics enable row level security;
alter table public.blog_variants enable row level security;

create policy "Admins manage automation settings" on public.blog_automation_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage blog topics" on public.blog_topics
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage blog variants" on public.blog_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
```

Public reading of posts is unchanged: a post is visible only when `status = 'published'` and its
`published_at` has arrived (Step 5). The automation writes new articles as **drafts** and only the
publisher step (which re-validates first) flips them to published.

### Environment variables

Add these to `.env.local` and to the production host (Vercel > Settings > Environment Variables). None
of them may have a `NEXT_PUBLIC_` prefix:

| Variable | What it is |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API Keys > `service_role`. Used **only** by the scheduler route, which has no signed-in admin (`lib/supabase/admin.ts`). Everything an admin does in the CMS still runs through their own session and RLS. |
| `CRON_SECRET` | A long random string (`openssl rand -hex 32`). The scheduler route refuses any request that does not send `Authorization: Bearer <CRON_SECRET>`. |
| `ANTHROPIC_API_KEY` | Already required for blog generation and translation. |

### Running the scheduler

The automation is driven by `GET /api/cron/blog-automation`. Each call does one bounded slice of work (plan
days, write articles, adapt them into other languages, publish what is due) in under about 4.5 minutes and
returns a JSON summary, so it never depends on a browser being open. Something must call it every
**5 minutes**. Pick one:

**Option A: Supabase pg_cron (recommended, free, any hosting).** In the SQL Editor:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'georepute-blog-automation',
  '*/5 * * * *',
  $$ select net.http_get(
       url := 'https://www.georepute.ai/api/cron/blog-automation',
       headers := jsonb_build_object('Authorization', 'Bearer PASTE_CRON_SECRET_HERE'),
       timeout_milliseconds := 300000
     ); $$
);
-- To stop it later:  select cron.unschedule('georepute-blog-automation');
```

**Option B: Vercel Cron (needs a Pro plan for anything more often than daily).** Add a `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/blog-automation", "schedule": "*/5 * * * *" }] }
```

Vercel sends `Authorization: Bearer <CRON_SECRET>` by itself when `CRON_SECRET` is set. Do not commit this file
on the Hobby plan: a schedule more frequent than once a day fails the deployment.

**Option C: any HTTP pinger** (GitHub Actions `schedule`, cron-job.org, a server crontab) that sends the same
`Authorization` header every 5 minutes.

Check that it works: open **Automation** in the CMS. The status card shows when the scheduler last ran and
what it did; "Run now" runs one tick from the CMS immediately, without the scheduler (useful to test).

---

## Regenerating types once the schema is live

`types/database.types.ts` is hand-written to match the SQL above exactly. Once
it's applied, you can regenerate it from the live database instead of
maintaining it by hand (optional — nothing breaks if you skip this, as long
as the SQL you ran matches):

```bash
npx supabase login
npx supabase gen types typescript --project-id <your-project-ref> --schema public > types/database.types.ts
```

The project ref is the subdomain in your project URL
(`https://<project-ref>.supabase.co`).

---

## Step 14 — Authors (public author box and "more from this author")

Optional, and safe to run more than once. Without it the blog works exactly as before and every article shows the built-in
"GeoRepute Editorial Team" as its author. With it you can add real authors in **Admin > Authors** (name, job title, photo, short bio in
each language, links), choose one per post, and set a default author for the AI-written articles.

`profiles` is deliberately private (each person can read only their own row), so the public author details live in their own table
that anyone can read and only admins can change.

```sql
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  job_title text,
  bio text,
  -- Bio per language code, for example {"he": "...", "fr": "..."}. `bio` is used when a language has none.
  bio_i18n jsonb not null default '{}'::jsonb,
  avatar_url text,
  -- [{ "label": "LinkedIn", "url": "https://..." }]
  links jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one default author.
create unique index if not exists authors_one_default on public.authors (is_default) where is_default;

alter table public.authors enable row level security;

drop policy if exists "Public can read authors" on public.authors;
create policy "Public can read authors"
on public.authors for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage authors" on public.authors;
create policy "Admins can manage authors"
on public.authors for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Which author a post is shown under. Empty means "the default author".
alter table public.posts add column if not exists byline_id uuid references public.authors (id) on delete set null;
create index if not exists posts_byline_idx on public.posts (byline_id, locale, published_at desc);
```

Only put information in `authors` that you are happy to show publicly: it is readable by everyone.
