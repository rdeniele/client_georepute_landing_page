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
import { PageHead } from "@/components/admin/ui/kit";
import { updatePostAction } from "@/lib/actions/posts";
import { postToFormValues } from "@/types/posts";
import { blogPath } from "@/lib/utils/postLocale";

export const metadata: Metadata = { title: "Edit post | GeoRepute Admin" };

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
  const live = post.status === "published";

  return (
    <>
      <PageHead title="Edit post">
        <span className={`admin-status admin-status--${live ? "live" : "draft"}`}>{live ? "Live" : "Draft"}</span>{" "}
        {live ? (
          <>
            This post is on your website.{" "}
            <a href={blogPath(post.locale, post.slug)} target="_blank" rel="noreferrer">
              View it
            </a>
            . Changes you save appear there straight away.
          </>
        ) : (
          <>This post is private. Use “Publish” when it is ready to go on your website.</>
        )}
      </PageHead>
      <div style={{ marginBottom: 24 }}>
        <PostRowActions post={post} showEdit={false} />
      </div>

      {automation ? <PostAutomationPanel variant={automation.variant} topic={automation.topic} timezone={timezone} /> : null}

      <PostForm action={boundAction} initialValues={postToFormValues(post)} submitLabel="Save changes" />

      <h2 className="admin-section-title" style={{ marginTop: 40 }}>
        More you can do with this post
      </h2>
      <details className="ui-more">
        <summary>Share a private preview link (so someone can read it before it is live)</summary>
        <PreviewLinkPanel post={post} />
      </details>
      <details className="ui-more">
        <summary>Translate this post into other languages</summary>
        <TranslatePanel postId={post.id} sourceLocale={post.locale} existing={existingTranslations} />
      </details>
    </>
  );
}
