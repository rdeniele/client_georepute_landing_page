"use client";

import { deletePostAction, publishPostAction, unpublishPostAction } from "@/lib/actions/posts";
import type { Post } from "@/types/posts";

export function PostRowActions({ post, showEdit = true }: { post: Post; showEdit?: boolean }) {
  return (
    <div className="admin-table__actions">
      {showEdit ? (
        <a className="admin-btn admin-btn--ghost" href={`/admin/blogs/${post.id}/edit`}>
          Edit
        </a>
      ) : null}

      {post.status === "published" ? (
        <form action={unpublishPostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Unpublish
          </button>
        </form>
      ) : (
        <form action={publishPostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Publish
          </button>
        </form>
      )}

      <form
        action={deletePostAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="featured_image" value={post.featured_image ?? ""} />
        <button type="submit" className="admin-btn admin-btn--danger">
          Delete
        </button>
      </form>
    </div>
  );
}
