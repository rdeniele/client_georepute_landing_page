import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import type { FaqItem, Post, PostFormValues, PostLocale, PostWithAuthor } from "@/types/posts";
import { slugify } from "@/lib/utils/slug";
import { blocksToPlainText } from "@/lib/utils/blocks";

type Client = SupabaseClient<Database>;

const AUTHOR_SELECT = "*, author:profiles(id, full_name, email)";

/**
 * Data-access layer for `posts`. Every function takes the caller's own
 * Supabase client (server or browser) instead of importing one internally —
 * that keeps this module usable from Server Components, Server Actions, and
 * client components alike, and means every query still runs as whichever
 * user the caller authenticated as. RLS (see SUPABASE_SETUP.md) is the real
 * authorization boundary; nothing here bypasses it.
 *
 * Every function throws a plain `Error` with a readable message on failure —
 * callers (pages, actions) decide how to surface that (error.tsx boundary,
 * a form's error state, etc).
 */

function raise(action: string, error: { message: string } | null): never {
  throw new Error(`Failed to ${action}: ${error?.message ?? "unknown error"}`);
}

export type PostListOptions = {
  limit?: number;
  offset?: number;
  /** Defaults to "en" — matches the site's default locale. */
  locale?: PostLocale;
  /** Only posts in this category. */
  category?: string;
};

/** Public listing feed: published posts only, newest first, scoped to one locale. Safe to call with the anon key. */
export async function getPublishedPosts(
  supabase: Client,
  { limit = 20, offset = 0, locale = "en", category }: PostListOptions = {},
): Promise<PostWithAuthor[]> {
  let query = supabase
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("status", "published")
    .eq("locale", locale)
    .lte("published_at", new Date().toISOString());
  if (category) query = query.eq("category", category);
  const { data, error } = await query.order("published_at", { ascending: false }).range(offset, offset + limit - 1);

  if (error) raise("load published posts", error);
  return (data ?? []) as unknown as PostWithAuthor[];
}

/**
 * Every published post of one language, for the sitemap. PostgREST returns at most 1,000 rows per request, so this
 * reads in pages: a blog that grows by dozens of posts a day must not silently drop its oldest posts from search.
 */
export async function getPublishedForSitemap(
  supabase: Client,
  locale: PostLocale,
  maxPages = 20,
): Promise<{ slug: string; updated_at: string; published_at: string | null; translation_group: string | null }[]> {
  const size = 1000;
  const out: { slug: string; updated_at: string; published_at: string | null; translation_group: string | null }[] = [];
  for (let page = 0; page < maxPages; page++) {
    const { data, error } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at, translation_group")
      .eq("status", "published")
      .eq("locale", locale)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .range(page * size, page * size + size - 1);
    if (error) raise("load posts for the sitemap", error);
    out.push(...(data ?? []));
    if ((data ?? []).length < size) break;
  }
  return out;
}

/** The categories in use among published posts in one language, for the blog's filter pills. Safe to call with the anon key. */
export async function getPublishedCategories(supabase: Client, locale: PostLocale = "en"): Promise<string[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .eq("status", "published")
    .eq("locale", locale)
    .lte("published_at", new Date().toISOString())
    .not("category", "is", null)
    .limit(1000);
  if (error) raise("load categories", error);
  return [...new Set((data ?? []).map((r) => r.category).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b));
}

/**
 * Public post page: a single published post by (locale, slug), or `null` if
 * it doesn't exist / isn't published. `slug` alone is no longer unique
 * (Step 11 in SUPABASE_SETUP.md scopes uniqueness to `(locale, slug)`), so a
 * locale is needed to disambiguate — but a URL's `?lang=` query param can be
 * stale, missing, or just wrong, and a real post shouldn't 404 over that.
 * If the exact `(locale, slug)` pair isn't found, this falls back to any
 * published post with that slug regardless of locale. Callers should read
 * the returned row's own `locale` field (not trust the `locale` they passed
 * in) when deciding how to render the page.
 */
export async function getPublishedPostBySlug(
  supabase: Client,
  slug: string,
  locale: PostLocale = "en",
): Promise<PostWithAuthor | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) raise("load post", error);
  if (data) return data as unknown as PostWithAuthor;

  // Translations share a slug, so more than one row can match. Prefer English, otherwise the most recently published.
  const fallback = await supabase
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (fallback.error) raise("load post", fallback.error);
  const rows = (fallback.data ?? []) as unknown as PostWithAuthor[];
  return rows.find((row) => row.locale === "en") ?? rows[0] ?? null;
}

/** Admin list: every post regardless of status, most recently updated first. Requires an admin session — RLS enforces this. */
export async function getAllPosts(supabase: Client): Promise<PostWithAuthor[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(AUTHOR_SELECT)
    .order("updated_at", { ascending: false });

  if (error) raise("load posts", error);
  return (data ?? []) as unknown as PostWithAuthor[];
}

export const ADMIN_POSTS_PAGE_SIZE = 50;

export type AdminPostFilter = { page?: number; status?: "draft" | "published"; locale?: PostLocale; q?: string };

/**
 * Admin list, one page at a time with a total. The automation can produce hundreds of posts a week, so the list
 * must page (PostgREST also silently caps a single response at 1,000 rows). Requires an admin session (RLS).
 */
export async function getPostsPage(
  supabase: Client,
  { page = 1, status, locale, q }: AdminPostFilter = {},
): Promise<{ rows: PostWithAuthor[]; total: number }> {
  const from = (Math.max(1, page) - 1) * ADMIN_POSTS_PAGE_SIZE;
  let query = supabase.from("posts").select(AUTHOR_SELECT, { count: "exact" });
  if (status) query = query.eq("status", status);
  if (locale) query = query.eq("locale", locale);
  const term = (q ?? "").replace(/[%_,()\\]/g, " ").trim();
  if (term) query = query.ilike("title", `%${term}%`);
  const { data, error, count } = await query.order("updated_at", { ascending: false }).range(from, from + ADMIN_POSTS_PAGE_SIZE - 1);
  if (error) raise("load posts", error);
  return { rows: (data ?? []) as unknown as PostWithAuthor[], total: count ?? 0 };
}

/** Exact totals for the admin dashboard, without loading a single post. */
export async function getPostCounts(supabase: Client): Promise<{ total: number; published: number; drafts: number }> {
  const count = async (status?: "draft" | "published") => {
    let q = supabase.from("posts").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count: n, error } = await q;
    if (error) raise("count posts", error);
    return n ?? 0;
  };
  const [total, published, drafts] = await Promise.all([count(), count("published"), count("draft")]);
  return { total, published, drafts };
}

/** Admin editor: a single post by id regardless of status. Requires an admin session. */
export async function getPostById(supabase: Client, id: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) raise("load post", error);
  return data as unknown as Post | null;
}

/**
 * Every language version of a post (same slug), used by the admin to see which translations exist. Admin only: it also finds drafts.
 */
export async function findTranslationsBySlug(
  supabase: Client,
  slug: string,
): Promise<{ id: string; status: string; locale: PostLocale }[]> {
  const { data, error } = await supabase.from("posts").select("id, status, locale").eq("slug", slug);
  if (error) raise("look up translations", error);
  return (data ?? []) as { id: string; status: string; locale: PostLocale }[];
}

/**
 * The other language versions of a post, admin side (drafts included). Versions are linked two ways: the same slug
 * (posts translated by hand) or the same `translation_group` (posts written by the AI automation, which gives each
 * language its own slug). A post that has neither simply has no related versions.
 */
export async function findRelatedPosts(
  supabase: Client,
  post: Pick<Post, "id" | "slug" | "translation_group">,
): Promise<{ id: string; status: string; locale: PostLocale }[]> {
  const found = new Map<string, { id: string; status: string; locale: PostLocale }>();
  const bySlug = await supabase.from("posts").select("id, status, locale").eq("slug", post.slug);
  if (bySlug.error) raise("look up translations", bySlug.error);
  for (const row of (bySlug.data ?? []) as { id: string; status: string; locale: PostLocale }[]) found.set(row.id, row);
  if (post.translation_group) {
    const byGroup = await supabase.from("posts").select("id, status, locale").eq("translation_group", post.translation_group);
    if (byGroup.error) raise("look up translations", byGroup.error);
    for (const row of (byGroup.data ?? []) as { id: string; status: string; locale: PostLocale }[]) found.set(row.id, row);
  }
  found.delete(post.id);
  return [...found.values()];
}

/** The version of a post in `locale`, by group or by slug. Admin only: it also finds drafts. */
export async function findRelatedInLocale(
  supabase: Client,
  post: Pick<Post, "id" | "slug" | "translation_group">,
  locale: PostLocale,
): Promise<{ id: string; status: string } | null> {
  const related = await findRelatedPosts(supabase, post);
  return related.find((r) => r.locale === locale) ?? null;
}

/**
 * Published versions of a post in other languages, for hreflang alternates. Safe to call with the anon key:
 * RLS only ever returns posts that are live.
 */
export async function getPublishedAlternates(
  supabase: Client,
  post: Pick<Post, "id" | "slug" | "locale" | "translation_group">,
): Promise<{ locale: PostLocale; slug: string }[]> {
  const now = new Date().toISOString();
  const live = () => supabase.from("posts").select("locale, slug").eq("status", "published").lte("published_at", now);
  const out = new Map<PostLocale, string>();
  const bySlug = await live().eq("slug", post.slug);
  if (bySlug.error) raise("load alternate languages", bySlug.error);
  for (const r of (bySlug.data ?? []) as { locale: PostLocale; slug: string }[]) out.set(r.locale, r.slug);
  if (post.translation_group) {
    const byGroup = await live().eq("translation_group", post.translation_group);
    if (byGroup.error) raise("load alternate languages", byGroup.error);
    for (const r of (byGroup.data ?? []) as { locale: PostLocale; slug: string }[]) out.set(r.locale, r.slug);
  }
  out.set(post.locale, post.slug);
  return [...out.entries()].map(([locale, slug]) => ({ locale, slug }));
}

/**
 * The other-language version of a post: same slug, different locale (the
 * `(locale, slug)` uniqueness from SUPABASE_SETUP.md Step 11 is what links
 * translations). Admin only: it also finds drafts.
 */
export async function findPostBySlugAndLocale(
  supabase: Client,
  slug: string,
  locale: PostLocale,
): Promise<{ id: string; status: string } | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, status")
    .eq("slug", slug)
    .eq("locale", locale)
    .maybeSingle();
  if (error) raise("look up translation", error);
  return data as { id: string; status: string } | null;
}

function normalizeTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/** Drops incomplete pairs so the public page never renders (or marks up for search engines) a question with no answer. */
export function normalizeFaq(faq: PostFormValues["faq"] | null | undefined): FaqItem[] {
  return (faq ?? [])
    .map((item) => ({ question: String(item?.question ?? "").trim(), answer: String(item?.answer ?? "").trim() }))
    .filter((item) => item.question && item.answer)
    .slice(0, 20);
}

function toInsert(values: PostFormValues, authorId: string | null) {
  return {
    title: values.title.trim(),
    slug: (values.slug.trim() || slugify(values.title)).trim(),
    excerpt: values.excerpt.trim() || null,
    // `content` stays a plain-text mirror of the blocks (JSON-LD description
    // fallback, excerpt fallback) — always derived, never edited directly.
    content: blocksToPlainText(values.content_blocks),
    // Structurally not a `Json` per TS's recursive definition (optional
    // properties like `props`/`content` aren't strictly JSON-shaped), but it
    // came from BlockNote's own JSON round-trip and serializes fine.
    content_blocks: values.content_blocks as unknown as Json,
    featured_image: values.featured_image.trim() || null,
    category: values.category.trim() || null,
    tags: normalizeTags(values.tags),
    status: values.status,
    locale: values.locale,
    meta_title: values.meta_title.trim() || null,
    meta_description: values.meta_description.trim() || null,
    keywords: normalizeTags(values.keywords),
    faq: normalizeFaq(values.faq) as unknown as Json,
    // Only sent when the author feature exists, so saving works on a database that has not had Step 14 yet.
    ...(values.byline_id !== null && values.byline_id !== undefined ? { byline_id: values.byline_id || null } : {}),
    author_id: authorId,
  };
}

/** Creates a post. Always starts from the submitted `status`/`published_at` is left null — use `publishPost` to go live. */
export async function createPost(
  supabase: Client,
  values: PostFormValues,
  authorId: string | null,
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert(toInsert(values, authorId))
    .select("*")
    .single();

  if (error) raise("create post", error);
  return data as unknown as Post;
}

/** Updates a post's editable fields. Does not touch `status`/`published_at` — use `publishPost`/`unpublishPost` for those. */
export async function updatePost(
  supabase: Client,
  id: string,
  values: PostFormValues,
): Promise<Post> {
  // Excludes `status` (changed only via publishPost/unpublishPost) and
  // `author_id` (toInsert(values, null) would otherwise null out the
  // existing author on every edit — this was a pre-existing bug).
  const { status: _status, author_id: _authorId, ...rest } = toInsert(values, null);
  void _status;
  void _authorId;

  const { data, error } = await supabase
    .from("posts")
    .update(rest)
    .eq("id", id)
    .select("*")
    .single();

  if (error) raise("update post", error);
  return data as unknown as Post;
}

export async function deletePost(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) raise("delete post", error);
}

/**
 * Publishes a post. Preserves the original `published_at` across an
 * unpublish/republish cycle (only sets it the first time) so the visible
 * publish date doesn't change just because a post was briefly taken down.
 */
export async function publishPost(supabase: Client, id: string): Promise<Post> {
  const existing = await getPostById(supabase, id);
  if (!existing) throw new Error("Failed to publish post: post not found");

  const { data, error } = await supabase
    .from("posts")
    .update({
      status: "published",
      published_at: existing.published_at ?? new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) raise("publish post", error);
  return data as unknown as Post;
}

/** Unpublishes a post back to draft. `published_at` is left untouched so re-publishing doesn't lose its original date. */
export async function unpublishPost(supabase: Client, id: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({ status: "draft" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) raise("unpublish post", error);
  return data as unknown as Post;
}

/**
 * Loads a post by its preview token, regardless of status — this is how a
 * shared draft link works. The token itself is the access control: the
 * `get_post_by_preview_token` function (SUPABASE_SETUP.md) is `security
 * definer` so it can read past RLS, but only ever returns a row when the
 * token matches exactly and hasn't expired.
 */
export async function getPostByPreviewToken(supabase: Client, token: string): Promise<Post | null> {
  const { data, error } = await supabase.rpc("get_post_by_preview_token", { token });
  if (error) raise("load preview post", error);
  return data as unknown as Post | null;
}

/**
 * Rotates a post's preview token (invalidating any previously shared link)
 * and sets a new expiration, or clears it when `expiresInDays` is `null`.
 * Runs through the `regenerate_preview_link` function, which re-checks
 * `is_admin()` itself on top of the caller already having passed
 * `requireAdmin()` — same defense-in-depth as every other write here.
 */
export async function regeneratePreviewLink(
  supabase: Client,
  id: string,
  expiresInDays: number | null,
): Promise<Post> {
  const { data, error } = await supabase.rpc("regenerate_preview_link", {
    post_id: id,
    expires_in_days: expiresInDays,
  });

  if (error) raise("regenerate preview link", error);
  return data as unknown as Post;
}

/**
 * Other published posts to link from the bottom of an article (internal linking: it passes authority to related
 * pages and keeps readers, and crawlers, moving through the site). Same language only, same category first, then the
 * newest posts to fill the row. Safe to call with the anon key.
 */
export async function getRelatedPosts(
  supabase: Client,
  post: Pick<Post, "id" | "locale" | "category">,
  limit = 3,
): Promise<PostWithAuthor[]> {
  const picked: PostWithAuthor[] = [];
  const add = (rows: PostWithAuthor[]) => {
    for (const row of rows) {
      if (picked.length >= limit) return;
      if (row.id !== post.id && !picked.some((p) => p.id === row.id)) picked.push(row);
    }
  };
  if (post.category) add(await getPublishedPosts(supabase, { locale: post.locale, category: post.category, limit: limit + 1 }));
  if (picked.length < limit) add(await getPublishedPosts(supabase, { locale: post.locale, limit: limit + 4 }));
  return picked;
}
