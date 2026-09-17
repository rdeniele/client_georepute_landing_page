"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./guard";
import {
  createPost,
  deletePost,
  publishPost,
  regeneratePreviewLink,
  unpublishPost,
  updatePost,
} from "@/lib/services/posts";
import { deleteBlogImage, pathFromPublicUrl } from "@/lib/services/storage";
import type { ContentBlock, PostFormValues, PostStatus } from "@/types/posts";

export type PostFormState = { error: string | null };

function readContentBlocks(formData: FormData): ContentBlock[] {
  const raw = String(formData.get("content_blocks") ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readFormValues(formData: FormData): PostFormValues {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content_blocks: readContentBlocks(formData),
    featured_image: String(formData.get("featured_image") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    tags: String(formData.get("tags") ?? ""),
    status: (formData.get("status") as PostStatus) ?? "draft",
  };
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
  if (slug) revalidatePath(`/blog/${slug}`);
}

/** Backs the "new post" form. Bound with `useActionState` so the form can show a validation/DB error inline instead of crashing to the nearest error boundary. */
export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const values = readFormValues(formData);
  if (!values.title) return { error: "Title is required." };

  let post;
  try {
    const { supabase, profile } = await requireAdmin();
    post = await createPost(supabase, values, profile.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create post." };
  }

  revalidateBlogPaths(post.slug);
  redirect(`/admin/blogs/${post.id}/edit`);
}

/** Backs the "edit post" form. Leaves `status`/`published_at` untouched — publishing is a separate, explicit action. */
export async function updatePostAction(
  id: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const values = readFormValues(formData);
  if (!values.title) return { error: "Title is required." };

  let post;
  try {
    const { supabase } = await requireAdmin();
    post = await updatePost(supabase, id, values);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update post." };
  }

  revalidateBlogPaths(post.slug);
  return { error: null };
}

/**
 * Row actions from the admin list (delete/publish/unpublish). These are
 * plain `<form action={...}>` submits, not `useActionState`-bound, so on
 * failure they redirect back to the list with `?error=` instead of
 * returning state a non-hooked form can't read.
 */
async function withListRedirect(action: () => Promise<{ slug?: string }>) {
  try {
    const { slug } = await action();
    revalidateBlogPaths(slug);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    redirect(`/admin/blogs?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/blogs");
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const featuredImage = String(formData.get("featured_image") ?? "");

  await withListRedirect(async () => {
    const { supabase } = await requireAdmin();
    await deletePost(supabase, id);
    const path = featuredImage ? pathFromPublicUrl(featuredImage) : null;
    if (path) await deleteBlogImage(supabase, path).catch(() => {});
    return {};
  });
}

export async function publishPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await withListRedirect(async () => {
    const { supabase } = await requireAdmin();
    const post = await publishPost(supabase, id);
    return { slug: post.slug };
  });
}

export async function unpublishPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await withListRedirect(async () => {
    const { supabase } = await requireAdmin();
    const post = await unpublishPost(supabase, id);
    return { slug: post.slug };
  });
}

export type PreviewLinkState = { error: string | null; token: string; expiresAt: string | null };

/** Backs the "regenerate link" control in PreviewLinkPanel. Rotating the token immediately breaks any previously shared link. */
export async function regeneratePreviewLinkAction(
  id: string,
  prevState: PreviewLinkState,
  formData: FormData,
): Promise<PreviewLinkState> {
  const raw = String(formData.get("expires_in_days") ?? "");
  const expiresInDays = raw ? Number(raw) : null;

  try {
    const { supabase } = await requireAdmin();
    const post = await regeneratePreviewLink(supabase, id, expiresInDays);
    revalidatePath(`/admin/blogs/${id}/edit`);
    return { error: null, token: post.preview_token, expiresAt: post.preview_expires_at };
  } catch (error) {
    return { ...prevState, error: error instanceof Error ? error.message : "Failed to regenerate link." };
  }
}
