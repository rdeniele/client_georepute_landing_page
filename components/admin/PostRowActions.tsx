"use client";

import { deletePostAction, publishPostAction, unpublishPostAction } from "@/lib/actions/posts";
import { blogPath } from "@/lib/utils/postLocale";
import type { Post } from "@/types/posts";

/**
 * What you can do with a post, in plain words. "Publish" puts it on the website; "Take offline" turns it back into a
 * private draft (nothing is deleted); "Delete" removes it for good and always asks first.
 */
export function PostRowActions({ post, showEdit = true }: { post: Post; showEdit?: boolean }) {
  const live = post.status === "published";
  return (
    <div className="admin-table__actions">
      {showEdit ? (
        <a className="admin-btn admin-btn--ghost" href={`/admin/blogs/${post.id}/edit`}>
          Edit
        </a>
      ) : null}

      {live ? (
        <a className="admin-btn admin-btn--ghost" href={blogPath(post.locale, post.slug)} target="_blank" rel="noopener noreferrer" title="Open this post on your website">
          View
        </a>
      ) : null}

      {live ? (
        <form
          action={unpublishPostAction}
          onSubmit={(event) => {
            if (!window.confirm(`Take "${post.title}" offline? It becomes a private draft. Nothing is deleted, and you can publish it again any time.`)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={post.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Take offline
          </button>
        </form>
      ) : (
        <form action={publishPostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button type="submit" className="admin-btn admin-btn--ghost" title="Put this post on your website">
            Publish
          </button>
        </form>
      )}

      <form
        action={deletePostAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${post.title}" for good? This cannot be undone. To keep it but hide it, use "Take offline" instead.`)) {
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
