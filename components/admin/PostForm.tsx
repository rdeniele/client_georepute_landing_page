"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteBlogImage, pathFromPublicUrl, uploadBlogImage } from "@/lib/services/storage";
import { slugify } from "@/lib/utils/slug";
import { formatBytes } from "@/lib/utils/format";
import type { ContentBlock, PostFormValues } from "@/types/posts";
import type { PostFormState } from "@/lib/actions/posts";

// BlockNote constructs its editor against `window` synchronously during
// render, which crashes under Next's default SSR of client components on
// first load. `ssr: false` keeps it client-only.
const BlockEditor = dynamic(() => import("./BlockEditor").then((mod) => mod.BlockEditor), {
  ssr: false,
  loading: () => <div className="admin-editor admin-editor--loading">Loading editor…</div>,
});

type PostFormAction = (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;

const initialState: PostFormState = { error: null };

/**
 * Shared create/edit form. `status`/`published_at` are deliberately not
 * editable here — they're changed via the explicit Publish/Unpublish
 * actions elsewhere in the admin, so it's never ambiguous whether saving a
 * draft accidentally published it.
 */
export function PostForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: PostFormAction;
  initialValues: PostFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [optimizedStat, setOptimizedStat] = useState<{ from: number; to: number } | null>(null);

  function set<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setOptimizedStat(null);
    setUploading(true);
    const previous = values.featured_image;

    try {
      const supabase = createSupabaseBrowserClient();
      const { publicUrl, originalBytes, optimizedBytes } = await uploadBlogImage(supabase, file);
      set("featured_image", publicUrl);
      if (optimizedBytes < originalBytes) setOptimizedStat({ from: originalBytes, to: optimizedBytes });

      if (previous) {
        const previousPath = pathFromPublicUrl(previous);
        if (previousPath) void deleteBlogImage(supabase, previousPath).catch(() => {});
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  function handleContentChange(blocks: ContentBlock[]) {
    set("content_blocks", blocks);
  }

  return (
    <form action={formAction}>
      {state.error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="admin-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={values.title}
          onChange={(event) => {
            const title = event.target.value;
            set("title", title);
            if (!slugTouched) set("slug", slugify(title));
          }}
        />
      </div>

      <div className="admin-field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={values.slug}
          onChange={(event) => {
            setSlugTouched(true);
            set("slug", slugify(event.target.value));
          }}
        />
        <span className="admin-field__hint">Public URL: /blog/{values.slug || "…"}</span>
      </div>

      <div className="admin-field">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={values.excerpt}
          onChange={(event) => set("excerpt", event.target.value)}
        />
        <span className="admin-field__hint">Short summary shown on the blog listing and in search results.</span>
      </div>

      <div className="admin-field">
        <label htmlFor="featured-image-file">Featured image</label>
        <div className="admin-image-picker">
          {values.featured_image ? (
            <div className="admin-image-picker__preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.featured_image} alt="" />
            </div>
          ) : null}
          <input
            id="featured-image-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={handleImageChange}
            disabled={uploading}
          />
        </div>
        {uploading ? <span className="admin-field__hint">Uploading…</span> : null}
        {!uploading && optimizedStat ? (
          <span className="admin-field__hint">
            ✓ Optimized — {formatBytes(optimizedStat.from)} → {formatBytes(optimizedStat.to)}
          </span>
        ) : null}
        {uploadError ? (
          <span className="admin-field__hint" style={{ color: "var(--color-gap-core)" }}>
            {uploadError}
          </span>
        ) : null}
        <input type="hidden" name="featured_image" value={values.featured_image} />
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            value={values.category}
            onChange={(event) => set("category", event.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="comma, separated"
            value={values.tags}
            onChange={(event) => set("tags", event.target.value)}
          />
        </div>
      </div>

      <div className="admin-field">
        <label>Content</label>
        <BlockEditor initialBlocks={values.content_blocks} onChange={handleContentChange} />
        <input type="hidden" name="content_blocks" value={JSON.stringify(values.content_blocks)} />
      </div>

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending || uploading}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
