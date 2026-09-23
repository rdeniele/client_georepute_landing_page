import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import type { Post, PostFormValues, PostLocale, PostWithAuthor } from "@/types/posts";
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
};

/** Public listing feed: published posts only, newest first, scoped to one locale. Safe to call with the anon key. */
export async function getPublishedPosts(
  supabase: Client,
  { limit = 20, offset = 0, locale = "en" }: PostListOptions = {},
): Promise<PostWithAuthor[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("status", "published")
    .eq("locale", locale)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) raise("load published posts", error);
  return (data ?? []) as unknown as PostWithAuthor[];
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

  const fallback = await supabase
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (fallback.error) raise("load post", fallback.error);
  return fallback.data as unknown as PostWithAuthor | null;
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

/** Admin editor: a single post by id regardless of status. Requires an admin session. */
export async function getPostById(supabase: Client, id: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) raise("load post", error);
  return data as unknown as Post | null;
}

function normalizeTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
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
