import type { Metadata } from "next";
import { PostForm } from "@/components/admin/PostForm";
import { PageHead } from "@/components/admin/ui/kit";
import { createPostAction } from "@/lib/actions/posts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAuthors } from "@/lib/services/authors";
import { EMPTY_POST_FORM } from "@/types/posts";

export const metadata: Metadata = { title: "Write a post | GeoRepute Admin" };

// The "Generate a draft with Claude" server action runs under this route's limit.
// A long Hebrew article can take a minute or more; the Claude client times out at 110s.
export const maxDuration = 300;

export default async function NewBlogPostPage() {
  const authors = await listAuthors(await createSupabaseServerClient());
  return (
    <>
      <PageHead title="Write a post">
        Four short steps. Your post is saved as a private draft, so you can take your time. It only goes live when you publish it.
      </PageHead>
      <PostForm action={createPostAction} initialValues={EMPTY_POST_FORM} submitLabel="Save as draft" authors={authors} />
    </>
  );
}
