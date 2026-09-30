"use client";

import { useActionState, useMemo, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteBlogImage, pathFromPublicUrl, uploadBlogImage } from "@/lib/services/storage";
import { slugify } from "@/lib/utils/slug";
import { formatBytes } from "@/lib/utils/format";
import { DraftGenerator } from "./DraftGenerator";
import { FaqEditor } from "./FaqEditor";
import { SeoAssistant } from "./SeoAssistant";
import { Callout, FieldLabel, HelpTip, Section } from "./ui/kit";
import type { FormSeoFields } from "@/lib/blog/optimize";
import { analyzeSeo } from "@/lib/blog/seo";
import { plainCheck } from "@/lib/blog/seoPlain";
import { BLOG_LANGUAGES, type GeneratedDraft } from "@/lib/blog/generation";
import { POST_LOCALES, blogPath, toPostLocale } from "@/lib/utils/postLocale";
import type { ContentBlock, PostFormValues } from "@/types/posts";
import type { PostFormState } from "@/lib/actions/posts";

// BlockNote constructs its editor against `window` synchronously during
// render, which crashes under Next's default SSR of client components on
// first load. `ssr: false` keeps it client-only.
const BlockEditor = dynamic(() => import("./BlockEditor").then((mod) => mod.BlockEditor), {
  ssr: false,
  loading: () => <div className="admin-editor admin-editor--loading">Loading the editor…</div>,
});

type PostFormAction = (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;

const initialState: PostFormState = { error: null };

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Shared create/edit form, laid out as four steps a first-time user can follow top to bottom:
 * write it, get it found (search boxes, filled in by the AI on request), add a picture and details, add questions.
 * `status`/`published_at` are deliberately not editable here: they change only through the explicit Publish and
 * Take offline actions, so it is never ambiguous whether saving accidentally published something.
 */
export function PostForm({
  action,
  initialValues,
  submitLabel,
  authors = null,
}: {
  action: PostFormAction;
  initialValues: PostFormValues;
  submitLabel: string;
  /** The authors an admin can pick from. `null` when the authors table does not exist yet (the picker is then hidden). */
  authors?: { id: string; name: string; is_default: boolean }[] | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [optimizedStat, setOptimizedStat] = useState<{ from: number; to: number } | null>(null);
  // Bumped when a generated draft replaces the content, so BlockNote remounts with the new blocks.
  const [editorKey, setEditorKey] = useState(0);

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
      setUploadError(error instanceof Error ? error.message : "The picture could not be uploaded. Try a smaller JPG or PNG.");
    } finally {
      setUploading(false);
    }
  }

  function handleContentChange(blocks: ContentBlock[]) {
    set("content_blocks", blocks);
  }

  /** Fills the form from a generated draft. Status stays "draft": saving and publishing remain explicit steps. */
  function applyDraft(draft: GeneratedDraft) {
    setValues((current) => ({
      ...current,
      title: draft.title,
      // Never rewrite the slug of a post that already has one (it may be live and linked).
      slug: slugTouched && current.slug ? current.slug : draft.slug || current.slug,
      excerpt: draft.excerpt,
      category: draft.category,
      tags: draft.tags,
      meta_title: draft.metaTitle,
      meta_description: draft.metaDescription,
      keywords: draft.keywords,
      faq: draft.faq,
      locale: toPostLocale(draft.language),
      content_blocks: draft.blocks as ContentBlock[],
    }));
    setEditorKey((k) => k + 1);
  }

  // Serialised once per document change (it feeds the hidden field and the overwrite check), not on every keystroke elsewhere in the form.
  const contentJson = useMemo(() => JSON.stringify(values.content_blocks), [values.content_blocks]);
  const hasContent =
    Boolean(values.title.trim()) ||
    values.content_blocks.some((b) => Boolean(b.content) && JSON.stringify(b.content) !== "[]");
  const dir = BLOG_LANGUAGES[values.locale].dir;
  const isLive = initialValues.status === "published";

  // Live "search readiness", using the same rules as the AI and the publish checks, shown in plain words.
  const readiness = useMemo(
    () =>
      analyzeSeo({
        title: values.title,
        metaTitle: values.meta_title || values.title,
        metaDescription: values.meta_description || values.excerpt,
        keywords: splitList(values.keywords),
        blocks: values.content_blocks,
        faq: values.faq.filter((f) => f.question.trim() && f.answer.trim()),
      }),
    [values.title, values.meta_title, values.meta_description, values.excerpt, values.keywords, values.content_blocks, values.faq],
  );
  const open = readiness.checks.filter((c) => !c.ok);
  // A blank form scores a few points for checks that pass vacuously; do not show that as progress.
  const started = Boolean(values.title.trim()) || values.content_blocks.some((b) => Boolean(b.content) && JSON.stringify(b.content) !== "[]");

  return (
    <form action={formAction}>
      {state.error ? (
        <Callout tone="error" title="Your post was not saved">
          {state.error}
        </Callout>
      ) : null}

      <DraftGenerator languages={POST_LOCALES} defaultLanguage={values.locale} hasContent={hasContent} onDraft={applyDraft} />

      <Section
        id="write"
        step={1}
        title="Write your post"
        description="Give it a title and write the article. Nothing here is public until you publish the post."
      >
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            dir={dir}
            type="text"
            required
            value={values.title}
            placeholder="For example: How to get more customer reviews"
            onChange={(event) => {
              const title = event.target.value;
              set("title", title);
              if (!slugTouched) set("slug", slugify(title));
            }}
          />
          <span className="admin-field__hint">The big headline at the top of your post. Say clearly what the reader will get.</span>
        </div>

        <div className="admin-field">
          <label>Article</label>
          <BlockEditor key={editorKey} initialBlocks={values.content_blocks} onChange={handleContentChange} dir={dir} />
          <input type="hidden" name="content_blocks" value={contentJson} />
          <span className="admin-field__hint">
            Start typing. Type <b>/</b> on a new line to add a heading, a list or an image. Aim for at least a few paragraphs.
          </span>
        </div>
      </Section>

      <Section
        id="seo"
        step={2}
        title="Get found on Google and AI"
        description="These boxes decide how your post looks in Google and how AI tools such as ChatGPT describe it. You do not need to know SEO: press Optimize and the AI fills them in."
      >
        <SeoAssistant
          language={values.locale}
          fields={{
            title: values.title,
            slug: values.slug,
            excerpt: values.excerpt,
            category: values.category,
            tags: values.tags,
            meta_title: values.meta_title,
            meta_description: values.meta_description,
            keywords: values.keywords,
            faq: values.faq,
          }}
          blocks={values.content_blocks}
          slugLocked={slugTouched}
          onApply={(next: FormSeoFields) => {
            setValues((current) => ({ ...current, ...next }));
            // A URL the assistant chose for a brand-new post stays editable, and stops following the title once set.
            if (next.slug !== values.slug) setSlugTouched(true);
          }}
        />

        <div className="ui-readiness" aria-live="polite">
          <strong>
            {started ? `Search readiness: ${readiness.score} / 100` : "Search readiness"}
            <HelpTip label="Search readiness">
              A quick check of how well this post is set up to be found. It updates as you type. It is a guide, not a rule: a post can be published at any score.
            </HelpTip>
          </strong>
          {started ? (
            <div className="ui-meter" data-level={readiness.score >= 70 ? "good" : readiness.score >= 40 ? "mid" : "low"} role="img" aria-label={`Search readiness ${readiness.score} out of 100`}>
              <span style={{ transform: `scaleX(${readiness.score / 100})` }} />
            </div>
          ) : null}
          {!started ? (
            <span className="admin-field__hint" style={{ display: "block", marginTop: 6 }}>
              Start writing and this will tell you, in plain words, what to improve.
            </span>
          ) : open.length === 0 ? (
            <span className="admin-field__hint">Everything looks good.</span>
          ) : (
            <details>
              <summary>
                {open.length} thing{open.length === 1 ? "" : "s"} you can improve
              </summary>
              <ul className="ui-ready">
                {open.map((c) => (
                  <li key={c.id}>{plainCheck(c).text}</li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="admin-field">
          <FieldLabel htmlFor="meta_title" help={{ label: "Google headline (meta title)", text: <>The blue title people see in Google results. Put the main phrase people would search for near the start. If you leave it empty, your post title is used.</> }}>Google headline</FieldLabel>
          <input id="meta_title" name="meta_title" dir={dir} type="text" value={values.meta_title} onChange={(event) => set("meta_title", event.target.value)} />
          <span className={`auto-count ${values.meta_title.length > 60 ? "auto-count--over" : ""}`}>
            {values.meta_title.length} / 60 characters. Longer headlines get cut off in Google.
          </span>
        </div>

        <div className="admin-field">
          <FieldLabel htmlFor="meta_description" help={{ label: "Google description (meta description)", text: <>The two grey lines under the headline in Google. Say what the reader will learn and why it is worth clicking. If you leave it empty, the short summary is used.</> }}>Google description</FieldLabel>
          <textarea
            id="meta_description"
            name="meta_description"
            dir={dir}
            rows={2}
            value={values.meta_description}
            onChange={(event) => set("meta_description", event.target.value)}
            style={{ minHeight: 0 }}
          />
          <span className={`auto-count ${values.meta_description.length > 160 ? "auto-count--over" : ""}`}>
            {values.meta_description.length} / 160 characters. Aim for 120 to 158.
          </span>
        </div>

        <div className="admin-field">
          <FieldLabel htmlFor="excerpt" help={{ label: "Short summary (excerpt)", text: <>One or two sentences shown on the blog list, next to your post title.</> }}>Short summary</FieldLabel>
          <textarea id="excerpt" name="excerpt" dir={dir} rows={3} value={values.excerpt} onChange={(event) => set("excerpt", event.target.value)} />
        </div>

        <div className="admin-field">
          <FieldLabel htmlFor="keywords" help={{ label: "Keywords", text: <>The phrases people type into Google to find a post like this. Put the most important one first. Separate them with commas.</> }}>Keywords</FieldLabel>
          <input
            id="keywords"
            name="keywords"
            dir={dir}
            type="text"
            placeholder="for example: customer reviews, get more reviews, review requests"
            value={values.keywords}
            onChange={(event) => set("keywords", event.target.value)}
          />
        </div>

        <div className="admin-field">
          <FieldLabel htmlFor="slug" help={{ label: "Web address (slug)", text: <>The last part of the link to your post. Short and readable is best. Once the post is live, avoid changing it: old links to it would stop working.</> }}>Web address</FieldLabel>
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
          <span className="admin-field__hint">
            Your post will be at <code>{blogPath(values.locale, values.slug || "…")}</code>
          </span>
        </div>
      </Section>

      <Section id="details" step={3} title="Picture and details" description="A picture makes your post stand out on the blog and when it is shared. The rest helps group your posts.">
        <div className="admin-field">
          <label htmlFor="featured-image-file">Main picture</label>
          <div className="admin-image-picker">
            {values.featured_image ? (
              <div className="admin-image-picker__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={values.featured_image} alt="Preview of the main picture" />
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
              ✓ Made smaller so your page loads faster: {formatBytes(optimizedStat.from)} → {formatBytes(optimizedStat.to)}
            </span>
          ) : null}
          {!values.featured_image && !uploading ? (
            <span className="admin-field__hint">No picture yet. Your post will show a plain branded banner instead. JPG or PNG, wider than tall, looks best.</span>
          ) : null}
          {uploadError ? (
            <span className="admin-field__hint" style={{ color: "var(--color-gap-core)" }}>
              {uploadError}
            </span>
          ) : null}
          <input type="hidden" name="featured_image" value={values.featured_image} />
        </div>

        {authors ? (
          <div className="admin-field" style={{ maxWidth: 460 }}>
            <FieldLabel htmlFor="byline_id" help={{ label: "Author", text: <>Who is shown as the writer under this article, with their photo and bio. Manage the list under Authors in the top menu. “Default author” is used when you do not choose one.</> }}>
              Author
            </FieldLabel>
            <select id="byline_id" name="byline_id" value={values.byline_id ?? ""} onChange={(event) => set("byline_id", event.target.value)}>
              <option value="">Default author{authors.find((a) => a.is_default) ? ` (${authors.find((a) => a.is_default)!.name})` : " (GeoRepute Editorial Team)"}</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="admin-row">
          <div className="admin-field">
            <FieldLabel htmlFor="category" help={{ label: "Category", text: <>One topic area for the post, such as “Local SEO”. Readers can filter the blog by category.</> }}>Category</FieldLabel>
            <input id="category" name="category" type="text" value={values.category} onChange={(event) => set("category", event.target.value)} />
          </div>
          <div className="admin-field">
            <FieldLabel htmlFor="tags" help={{ label: "Tags", text: <>A few short words describing the post. Separate them with commas.</> }}>Tags</FieldLabel>
            <input id="tags" name="tags" type="text" placeholder="comma, separated" value={values.tags} onChange={(event) => set("tags", event.target.value)} />
          </div>
          <div className="admin-field">
            <FieldLabel htmlFor="locale" help={{ label: "Language", text: <>Which version of the blog this post belongs to. To offer the same post in other languages, save it first, then use “Translate this post”.</> }}>Language of this post</FieldLabel>
            <select id="locale" name="locale" value={values.locale} onChange={(event) => set("locale", event.target.value as PostFormValues["locale"])}>
              {POST_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {BLOG_LANGUAGES[l].native === BLOG_LANGUAGES[l].name ? BLOG_LANGUAGES[l].name : `${BLOG_LANGUAGES[l].native} (${BLOG_LANGUAGES[l].name})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section
        id="faq"
        step={4}
        title="Questions and answers"
        description="Short answers to questions readers ask next. They appear under the article, and Google and AI tools like to quote them. Optional, but they help."
      >
        <div className="admin-field">
          <FaqEditor value={values.faq} onChange={(faq) => set("faq", faq)} dir={dir} />
          <input type="hidden" name="faq" value={JSON.stringify(values.faq)} />
          <span className="admin-field__hint">Incomplete pairs (a question with no answer) are ignored.</span>
        </div>
      </Section>

      <div className="ui-savebar">
        <span className="ui-savebar__note">
          {isLive
            ? "This post is live. Your changes appear on the website as soon as you save."
            : "Saving keeps this post as a draft. Nothing goes live until you publish it."}
        </span>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending || uploading}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
