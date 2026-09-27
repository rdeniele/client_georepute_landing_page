import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_POSTS_PAGE_SIZE, getPostsPage } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils/format";
import { POST_LOCALES, isPostLocale } from "@/lib/utils/postLocale";
import { PostRowActions } from "@/components/admin/PostRowActions";

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
      <div className="admin-header">
        <div>
          <h1>Posts</h1>
          <p>Create, edit and publish blog content.</p>
        </div>
        <a className="admin-btn admin-btn--primary" href="/admin/blogs/new">
          New Post
        </a>
      </div>

      {sp.error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {sp.error}
        </div>
      ) : null}

      <form className="auto-filters" action="/admin/blogs" method="get">
        <select name="status" defaultValue={status ?? ""} aria-label="Status" className="admin-btn admin-btn--ghost">
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select name="lang" defaultValue={lang ?? ""} aria-label="Language" className="admin-btn admin-btn--ghost">
          <option value="">Any language</option>
          {POST_LOCALES.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>
        <input type="search" name="q" defaultValue={q} placeholder="Search titles" aria-label="Search titles" />
        <button type="submit" className="admin-btn admin-btn--ghost">
          Filter
        </button>
        {filtered ? (
          <Link className="admin-btn admin-btn--ghost" href="/admin/blogs">
            Clear
          </Link>
        ) : null}
      </form>

      {loadFailed ? (
        <div className="admin-banner admin-banner--error" role="alert">
          Couldn&apos;t load posts. Please refresh the page.
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-banner admin-banner--info">{filtered ? "No posts match these filters." : "No posts yet. Create your first one."}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Language</th>
              <th>Status</th>
              <th>Category</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="admin-table__title">
                  <a href={`/admin/blogs/${post.id}/edit`}>{post.title}</a>
                </td>
                <td>{post.locale.toUpperCase()}</td>
                <td>
                  <span className={`admin-status admin-status--${post.status}`}>{post.status}</span>
                </td>
                <td>{post.category || "None"}</td>
                <td>{formatDate(post.updated_at)}</td>
                <td>
                  <PostRowActions post={post} />
                </td>
              </tr>
            ))}
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
