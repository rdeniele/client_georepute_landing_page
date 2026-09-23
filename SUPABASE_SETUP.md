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

Do **not** put the `service_role` key anywhere in this project. Nothing in
this codebase uses it — every operation, including admin writes, goes through
the signed-in admin's own session and is authorized by RLS (Steps 4–6).

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
`en` or `he`, matching the two locales the blog supports). The `slug`
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
