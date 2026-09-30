"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteAuthorAction, saveAuthorAction } from "@/lib/actions/authors";
import { AUTHOR_LIMITS, initials, type AuthorLink } from "@/lib/authors";
import { BLOG_LANGUAGES } from "@/lib/blog/generation";
import { POST_LOCALES } from "@/lib/utils/postLocale";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadBlogImage } from "@/lib/services/storage";
import type { AuthorRow } from "@/types/database.types";
import { FieldLabel } from "./ui/kit";

type Form = {
  name: string;
  job_title: string;
  bio: string;
  avatar_url: string;
  links: AuthorLink[];
  bio_i18n: Record<string, string>;
  is_default: boolean;
};

const blank: Form = { name: "", job_title: "", bio: "", avatar_url: "", links: [], bio_i18n: {}, is_default: false };

function fromRow(a: AuthorRow): Form {
  const i18n = a.bio_i18n && typeof a.bio_i18n === "object" && !Array.isArray(a.bio_i18n) ? (a.bio_i18n as Record<string, unknown>) : {};
  return {
    name: a.name,
    job_title: a.job_title ?? "",
    bio: a.bio ?? "",
    avatar_url: a.avatar_url ?? "",
    links: (Array.isArray(a.links) ? (a.links as AuthorLink[]) : []).map((l) => ({ label: l.label ?? "", url: l.url ?? "" })),
    bio_i18n: Object.fromEntries(Object.entries(i18n).filter(([, v]) => typeof v === "string")) as Record<string, string>,
    is_default: a.is_default,
  };
}

/**
 * Add or edit one author. The photo is uploaded to the same public image storage as post pictures. Anything typed here is
 * public: it appears in the author box under every article by this author, and in the article's search-engine data.
 */
export function AuthorForm({ author, onDone }: { author?: AuthorRow; onDone?: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => (author ? fromRow(author) : blank));
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setMsg(null);
    setF((c) => ({ ...c, [k]: v }));
  };

  async function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadBlogImage(createSupabaseBrowserClient(), file);
      set("avatar_url", publicUrl);
    } catch (error) {
      setMsg({ tone: "error", text: error instanceof Error ? error.message : "The photo could not be uploaded. Try a smaller JPG or PNG." });
    } finally {
      setUploading(false);
    }
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveAuthorAction(author?.id ?? null, { ...f });
      if (res.ok) {
        setMsg({ tone: "ok", text: "Saved. It now appears under this author's articles." });
        if (!author) setF(blank);
        router.refresh();
        onDone?.();
      } else setMsg({ tone: "error", text: res.error });
    });
  }

  function remove() {
    if (!author) return;
    if (!window.confirm(`Delete ${author.name}? Their articles are kept and switch to the default author. This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteAuthorAction(author.id);
      if (res.ok) router.refresh();
      else setMsg({ tone: "error", text: res.error });
    });
  }

  const id = author?.id ?? "new";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="admin-row">
        <div className="admin-field">
          <FieldLabel htmlFor={`a-name-${id}`}>Name</FieldLabel>
          <input id={`a-name-${id}`} type="text" required maxLength={AUTHOR_LIMITS.name} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="For example: Dana Levi" />
        </div>
        <div className="admin-field">
          <FieldLabel htmlFor={`a-job-${id}`} help={{ label: "Job title", text: <>Shown under the name, for example “Head of Content”. It tells readers and search engines why this person is worth listening to.</> }}>
            Job title
          </FieldLabel>
          <input id={`a-job-${id}`} type="text" maxLength={AUTHOR_LIMITS.jobTitle} value={f.job_title} onChange={(e) => set("job_title", e.target.value)} />
        </div>
      </div>

      <div className="admin-field">
        <FieldLabel htmlFor={`a-bio-${id}`} help={{ label: "Short bio", text: <>Two or three sentences: who they are, what they know about, and why readers can trust them. Only state things that are true and that you are happy to show publicly.</> }}>
          Short bio
        </FieldLabel>
        <textarea id={`a-bio-${id}`} rows={3} maxLength={AUTHOR_LIMITS.bio} value={f.bio} onChange={(e) => set("bio", e.target.value)} />
        <span className="auto-count">{f.bio.length} / {AUTHOR_LIMITS.bio} characters. Shown under every article by this author.</span>
      </div>

      <div className="admin-field">
        <FieldLabel htmlFor={`a-photo-${id}`}>Photo</FieldLabel>
        <div className="ui-author-photo">
          {f.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.avatar_url} alt="" />
          ) : (
            <span aria-hidden="true">{initials(f.name) || "?"}</span>
          )}
          <input id={`a-photo-${id}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} disabled={uploading} />
          {f.avatar_url ? (
            <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" onClick={() => set("avatar_url", "")}>
              Remove photo
            </button>
          ) : null}
        </div>
        <span className="admin-field__hint">{uploading ? "Uploading…" : "A square photo of the person works best. Without one, their initials are shown."}</span>
      </div>

      <div className="admin-field">
        <FieldLabel htmlFor={`a-links-${id}`} help={{ label: "Links", text: <>Where readers can find the author elsewhere, such as LinkedIn or a personal website. These also tell search engines this is a real person. Addresses must start with https://</> }}>
          Links (optional)
        </FieldLabel>
        <div id={`a-links-${id}`} className="ui-author-links">
          {f.links.map((l, i) => (
            <div key={i} className="ui-author-links__row">
              <input type="text" aria-label={`Link ${i + 1} name`} value={l.label} maxLength={AUTHOR_LIMITS.label} placeholder="LinkedIn" onChange={(e) => set("links", f.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <input type="url" aria-label={`Link ${i + 1} address`} value={l.url} placeholder="https://www.linkedin.com/in/…" onChange={(e) => set("links", f.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              <button type="button" className="admin-btn admin-btn--danger auto-btn-sm" onClick={() => set("links", f.links.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={f.links.length >= AUTHOR_LIMITS.links} onClick={() => set("links", [...f.links, { label: "", url: "" }])}>
          Add a link
        </button>
      </div>

      <details className="ui-more">
        <summary>Bio in other languages (optional)</summary>
        <p className="admin-field__hint" style={{ marginTop: 8 }}>
          Readers of each language version see the bio written for their language. Where you leave one empty, the short bio above is used.
        </p>
        {POST_LOCALES.map((l) => (
          <div className="admin-field" key={l}>
            <FieldLabel htmlFor={`a-bio-${l}-${id}`}>{BLOG_LANGUAGES[l].native === BLOG_LANGUAGES[l].name ? BLOG_LANGUAGES[l].name : `${BLOG_LANGUAGES[l].name} (${BLOG_LANGUAGES[l].native})`}</FieldLabel>
            <textarea
              id={`a-bio-${l}-${id}`}
              rows={2}
              dir={BLOG_LANGUAGES[l].dir}
              maxLength={AUTHOR_LIMITS.bio}
              value={f.bio_i18n[l] ?? ""}
              onChange={(e) => set("bio_i18n", { ...f.bio_i18n, [l]: e.target.value })}
            />
          </div>
        ))}
      </details>

      <label className="auto-switch" htmlFor={`a-default-${id}`}>
        <input id={`a-default-${id}`} type="checkbox" checked={f.is_default} onChange={(e) => set("is_default", e.target.checked)} />
        <div>
          <strong>Use as the default author</strong>
          <span>Articles written by the AI Auto-Writer, and posts with no author chosen, are shown under the default author. Only one author can be the default.</span>
        </div>
      </label>

      <div className="admin-form__actions" style={{ marginTop: 16, flexWrap: "wrap" }}>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending || uploading}>
          {pending ? "Saving…" : author ? "Save changes" : "Add author"}
        </button>
        {author ? (
          <button type="button" className="admin-btn admin-btn--danger" disabled={pending} onClick={remove}>
            Delete author
          </button>
        ) : null}
        {msg ? (
          <span role={msg.tone === "error" ? "alert" : "status"} className={msg.tone === "error" ? "auto-count auto-count--over" : "auto-count"}>
            {msg.text}
          </span>
        ) : null}
      </div>
    </form>
  );
}
