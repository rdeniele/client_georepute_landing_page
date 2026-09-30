import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_POSTS_PAGE_SIZE, getPostsPage } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils/format";
import { POST_LOCALES, isPostLocale } from "@/lib/utils/postLocale";
import { BLOG_LANGUAGES } from "@/lib/blog/generation";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { Callout, EmptyState, HelpTip, PageHead } from "@/components/admin/ui/kit";

export const metadata = { title: "Posts | GeoRepute Admin" };

type Search = { error?: string; page?: string; status?: string; lang?: string; q?: string };

function href(p: { page?: number; status?: string; lang?: string; q?: string }) {
  const params = new URLSearchParams();
  if (p.status) params.set("status", p.status);
  if (p.lang) params.set("lang", p.lang);
  if (p.q) params.set("q", p.q);
  if (p.page && p.page > 1) params.set("page", String(p.page));
  const s = params.toString();
  return `/admin/blogs${s ? `?${s}` : ""}`;
}

/** What a reader would say: a published post dated in the future is not live yet, it is scheduled. */
function statusOf(post: { status: string; published_at: string | null }): { key: "live" | "scheduled" | "draft"; label: string } {
  if (post.status !== "published") return { key: "draft", label: "Draft" };
  if (post.published_at && new Date(post.published_at).getTime() > Date.now()) return { key: "scheduled", label: "Scheduled" };
  return { key: "live", label: "Live" };
}

export default async function AdminBlogsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const status = sp.status === "draft" || sp.status === "published" ? sp.status : undefined;
  const lang = isPostLocale(sp.lang) ? sp.lang : undefined;
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const supabase = await createSupabaseServerClient();

  let posts: Awaited<ReturnType<typeof getPostsPage>>["rows"] = [];
  let total = 0;
  let loadFailed = false;
  try {
    ({ rows: posts, total } = await getPostsPage(supabase, { page, status, locale: lang, q }));
  } catch {
    loadFailed = true;
  }
  const pages = Math.max(1, Math.ceil(total / ADMIN_POSTS_PAGE_SIZE));
  const filtered = Boolean(status || lang || q);

  return (
    <>
      <PageHead title="Your posts" action={{ label: "Write a post", href: "/admin/blogs/new" }}>
        Everything you have written. A <strong>Draft</strong> is private. A <strong>Live</strong> post is on your website.
        <HelpTip label="Draft, Live and Scheduled">
          Saving a post keeps it as a Draft, which only people signed in here can see. Press <b>Publish</b> to make it Live. A post published for a future date shows as Scheduled until then.
        </HelpTip>
      </PageHead>

      {sp.error ? (
        <Callout tone="error" title="That did not work">
          {sp.error}
        </Callout>
      ) : null}

      <form className="auto-filters" action="/admin/blogs" method="get">
        <select name="status" defaultValue={status ?? ""} aria-label="Show" className="admin-btn admin-btn--ghost">
          <option value="">All posts</option>
          <option value="published">Live posts</option>
          <option value="draft">Drafts</option>
        </select>
        <select name="lang" defaultValue={lang ?? ""} aria-label="Language" className="admin-btn admin-btn--ghost">
          <option value="">Every language</option>
          {POST_LOCALES.map((l) => (
            <option key={l} value={l}>
              {BLOG_LANGUAGES[l].name}
            </option>
          ))}
        </select>
        <input type="search" name="q" defaultValue={q} placeholder="Search by title" aria-label="Search by title" />
        <button type="submit" className="admin-btn admin-btn--ghost">
          Search
        </button>
        {filtered ? (
          <Link className="admin-btn admin-btn--ghost" href="/admin/blogs">
            Show everything
          </Link>
        ) : null}
      </form>

      {loadFailed ? (
        <Callout tone="error" title="Could not load your posts">
          This is usually temporary. Refresh the page in a moment. If it keeps happening, check that the database is reachable.
        </Callout>
      ) : posts.length === 0 ? (
        filtered ? (
          <EmptyState title="No posts match" actions={[{ label: "Show everything", href: "/admin/blogs", primary: true }]}>
            Try a different word, or clear the filters.
          </EmptyState>
        ) : (
          <EmptyState
            title="No posts yet"
            actions={[
              { label: "Write your first post", href: "/admin/blogs/new", primary: true },
              { label: "Let AI write posts", href: "/admin/automation" },
            ]}
          >
            Write a post yourself, or upload a list of topics and let the AI Auto-Writer do it for you.
          </EmptyState>
        )
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Language</th>
              <th>Status</th>
              <th>Category</th>
              <th>Last changed</th>
              <th aria-label="What you can do" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const st = statusOf(post);
              return (
                <tr key={post.id}>
                  <td className="admin-table__title">
                    <a href={`/admin/blogs/${post.id}/edit`}>{post.title}</a>
                  </td>
                  <td>{BLOG_LANGUAGES[post.locale]?.name ?? post.locale}</td>
                  <td>
                    <span className={`admin-status admin-status--${st.key}`}>{st.label}</span>
                  </td>
                  <td>{post.category || "—"}</td>
                  <td>{formatDate(post.updated_at)}</td>
                  <td>
                    <PostRowActions post={post} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!loadFailed && total > 0 ? (
        <div className="auto-pager">
          <span>
            {total.toLocaleString("en-US")} post{total === 1 ? "" : "s"} · page {page} of {pages}
          </span>
          <span className="auto-inline">
            {page > 1 ? (
              <Link className="admin-btn admin-btn--ghost" href={href({ page: page - 1, status, lang, q })}>
                Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link className="admin-btn admin-btn--ghost" href={href({ page: page + 1, status, lang, q })}>
                Next
              </Link>
            ) : null}
          </span>
        </div>
      ) : null}
    </>
  );
}
