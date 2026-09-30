import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthorRow, Database } from "@/types/database.types";
import type { PostLocale, PostWithAuthor } from "@/types/posts";
import { authorFromRow, teamAuthor, type Author } from "@/lib/authors";
import { getPublishedPosts } from "@/lib/services/posts";

type Client = SupabaseClient<Database>;

/**
 * Data access for authors. Public reads are safe with the anon key (the table is world-readable by design; it holds only what an
 * author box shows). Every read is tolerant: until SUPABASE_SETUP.md Step 14 has been run there is no `authors` table and no
 * `posts.byline_id` column, and the blog must keep working, showing the built-in team author.
 */

/** All authors for the admin, default first. `null` means the authors table does not exist yet. */
export async function listAuthors(supabase: Client): Promise<AuthorRow[] | null> {
  const { data, error } = await supabase.from("authors").select("*").order("is_default", { ascending: false }).order("name");
  if (error) return null;
  return (data ?? []) as AuthorRow[];
}

/** The author of a post, as shown in the post's language. Never throws: any problem means the built-in team author. */
export async function getAuthorForPost(supabase: Client, post: { byline_id?: string | null; locale: PostLocale }): Promise<Author> {
  try {
    if (post.byline_id) {
      const { data } = await supabase.from("authors").select("*").eq("id", post.byline_id).maybeSingle();
      if (data) return authorFromRow(data as AuthorRow, post.locale);
    }
    const { data: fallback } = await supabase.from("authors").select("*").eq("is_default", true).maybeSingle();
    if (fallback) return authorFromRow(fallback as AuthorRow, post.locale);
  } catch {
    // no authors table yet
  }
  return teamAuthor(post.locale);
}

/**
 * Other published posts by the same author, newest first, in the same language. The default author also owns every post that has
 * no author chosen (this is how AI-written posts are grouped). If the byline column does not exist yet, every post counts as
 * written by the default author, so the list falls back to the newest posts.
 */
export async function getMoreByAuthor(supabase: Client, post: { id: string; locale: PostLocale }, author: Author, limit = 4): Promise<PostWithAuthor[]> {
  try {
    let q = supabase
      .from("posts")
      .select("*, author:profiles(id, full_name, email)")
      .eq("status", "published")
      .eq("locale", post.locale)
      .lte("published_at", new Date().toISOString())
      .neq("id", post.id);
    if (author.id && author.isDefault) q = q.or(`byline_id.eq.${author.id},byline_id.is.null`);
    else if (author.id) q = q.eq("byline_id", author.id);
    else q = q.is("byline_id", null);
    const { data, error } = await q.order("published_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as PostWithAuthor[];
  } catch {
    if (author.id && !author.isDefault) return [];
    const latest = await getPublishedPosts(supabase, { locale: post.locale, limit: limit + 1 }).catch(() => []);
    return latest.filter((p) => p.id !== post.id).slice(0, limit);
  }
}

/* ------------------------------ admin writes ------------------------------ */

export async function saveAuthor(supabase: Client, id: string | null, value: Omit<AuthorRow, "id" | "created_at">): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  // At most one default: clear the flag elsewhere first (the database also enforces it with a unique index).
  if (value.is_default) {
    const cleared = await supabase.from("authors").update({ is_default: false }).eq("is_default", true);
    if (cleared.error) return { ok: false, error: fail(cleared.error.message) };
  }
  if (id) {
    const { error } = await supabase.from("authors").update(value).eq("id", id);
    return error ? { ok: false, error: fail(error.message) } : { ok: true, id };
  }
  // A taken web name gets a short suffix instead of an error.
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? value.slug : `${value.slug}-${Math.random().toString(36).slice(2, 5)}`;
    const { data, error } = await supabase.from("authors").insert({ ...value, slug }).select("id").single();
    if (!error && data) return { ok: true, id: (data as { id: string }).id };
    if (error && !/duplicate|unique/i.test(error.message)) return { ok: false, error: fail(error.message) };
  }
  return { ok: false, error: "That name is already used by another author. Try a slightly different one." };
}

export async function deleteAuthor(supabase: Client, id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from("authors").delete().eq("id", id);
  return error ? { ok: false, error: fail(error.message) } : { ok: true };
}

/** A missing table is the expected first-run state; say so in words the admin can act on. */
function fail(message: string): string {
  return /relation .*authors.* does not exist|schema cache/i.test(message)
    ? "The authors table does not exist yet. Someone who manages the database needs to run SUPABASE_SETUP.md, Step 14, once."
    : "The author could not be saved. Please try again.";
}
