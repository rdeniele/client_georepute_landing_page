import type { Metadata } from "next";
import { PostForm } from "@/components/admin/PostForm";
import { createPostAction } from "@/lib/actions/posts";
import { EMPTY_POST_FORM } from "@/types/posts";

export const metadata: Metadata = { title: "New Post | GeoRepute Admin" };

// The "Generate a draft with Claude" server action runs under this route's limit.
// A long Hebrew article can take a minute or more; the Claude client times out at 110s.
export const maxDuration = 300;

export default function NewBlogPostPage() {
  return (
    <>
      <div className="admin-header">
        <div>
          <h1>New Post</h1>
          <p>Saved as a draft first. Publish it from the post list when it&apos;s ready.</p>
        </div>
      </div>
      <PostForm action={createPostAction} initialValues={EMPTY_POST_FORM} submitLabel="Create draft" />
    </>
  );
}
