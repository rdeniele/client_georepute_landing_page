import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findRelatedPosts, getPostById } from "@/lib/services/posts";
import { SupabaseAutomationStore, getVariantForPost } from "@/lib/services/blogAutomation";
import { PostAutomationPanel } from "@/components/admin/automation/PostAutomationPanel";
import { PostForm } from "@/components/admin/PostForm";
import { TranslatePanel } from "@/components/admin/TranslatePanel";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { PreviewLinkPanel } from "@/components/admin/PreviewLinkPanel";
import { updatePostAction } from "@/lib/actions/posts";
import { postToFormValues } from "@/types/posts";
import { blogPath } from "@/lib/utils/postLocale";

export const metadata: Metadata = { title: "Edit Post | GeoRepute Admin" };

// The "Generate a draft with Claude" server action runs under this route's limit.
// A long article in Hebrew or Arabic can take a minute or more; the Claude client times out at 110s.
export const maxDuration = 300;

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const post = await getPostById(supabase, id);

  if (!post) notFound();

  const boundAction = updatePostAction.bind(null, post.id);
  // Language versions are linked by slug (translated by hand) or by translation group (written by the AI automation, one slug per language).
  const existingTranslations = await findRelatedPosts(supabase, post);
  // Only posts written by the automation have this; a missing table (Step 13 not run yet) must never break the editor.
  const automation = await getVariantForPost(supabase, post.id).catch(() => null);
  const timezone = automation ? (await new SupabaseAutomationStore(supabase).getSettings().catch(() => null))?.timezone ?? "UTC" : "UTC";

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
                · <a href={blogPath(post.locale, post.slug)} target="_blank" rel="noreferrer">
                  View live
                </a>
              </>
            ) : null}
          </p>
        </div>
        <PostRowActions post={post} showEdit={false} />
      </div>
      {automation ? <PostAutomationPanel variant={automation.variant} topic={automation.topic} timezone={timezone} /> : null}
      <PreviewLinkPanel post={post} />
      <TranslatePanel postId={post.id} sourceLocale={post.locale} existing={existingTranslations} />
      <PostForm action={boundAction} initialValues={postToFormValues(post)} submitLabel="Save changes" />
    </>
  );
}
