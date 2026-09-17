import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils/format";
import { PostRowActions } from "@/components/admin/PostRowActions";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  let loadFailed = false;
  try {
    posts = await getAllPosts(supabase);
  } catch {
    loadFailed = true;
  }

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

      {error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {error}
        </div>
      ) : null}

      {loadFailed ? (
        <div className="admin-banner admin-banner--error" role="alert">
          Couldn&apos;t load posts. Please refresh the page.
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-banner admin-banner--info">No posts yet. Create your first one.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
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
                <td>
                  <span className={`admin-status admin-status--${post.status}`}>{post.status}</span>
                </td>
                <td>{post.category || "—"}</td>
                <td>{formatDate(post.updated_at)}</td>
                <td>
                  <PostRowActions post={post} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
