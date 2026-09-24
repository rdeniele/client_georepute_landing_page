import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findPostBySlugAndLocale, getPostById } from "@/lib/services/posts";
import { PostForm } from "@/components/admin/PostForm";
import { TranslatePanel } from "@/components/admin/TranslatePanel";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { PreviewLinkPanel } from "@/components/admin/PreviewLinkPanel";
import { updatePostAction } from "@/lib/actions/posts";
import { postToFormValues } from "@/types/posts";

export const metadata: Metadata = { title: "Edit Post | GeoRepute Admin" };

// The "Generate a draft with Claude" server action runs under this route's limit.
// A long Hebrew article can take a minute or more; the Claude client times out at 110s.
export const maxDuration = 300;

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const post = await getPostById(supabase, id);

  if (!post) notFound();

  const boundAction = updatePostAction.bind(null, post.id);
  // Translations are linked by slug: the same slug in the other language (see SUPABASE_SETUP.md, Step 11).
  const translationTarget = post.locale === "he" ? "en" : "he";
  const existingTranslation = await findPostBySlugAndLocale(supabase, post.slug, translationTarget);

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Edit Post</h1>
          <p>
            <span className={`admin-status admin-status--${post.status}`}>{post.status}</span>
            {post.status === "published" ? (
              <>
                {" "}
                · <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                  View live
                </a>
              </>
            ) : null}
          </p>
        </div>
        <PostRowActions post={post} showEdit={false} />
      </div>
      <PreviewLinkPanel post={post} />
      <TranslatePanel postId={post.id} sourceLocale={post.locale} existing={existingTranslation} />
      <PostForm action={boundAction} initialValues={postToFormValues(post)} submitLabel="Save changes" />
    </>
  );
}
