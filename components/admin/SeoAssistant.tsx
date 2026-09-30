"use client";

import { useState, useTransition } from "react";
import { optimizeSeoAction } from "@/lib/actions/blogOptimize";
import { applyOptimized, type FormSeoFields, type OptimizeMode, type OptimizeResult } from "@/lib/blog/optimize";
import type { BlogLanguage } from "@/lib/blog/generation";
import type { ContentBlock } from "@/types/posts";

type Fields = FormSeoFields & { title: string };

/**
 * "SEO assistant" for posts written by hand. Two buttons, no SEO knowledge needed:
 *  - Autocomplete fills only the empty search fields.
 *  - Optimize rewrites the search fields (meta title, description, excerpt, keywords, FAQ).
 * It never touches the article text. Everything it changes can be undone until the post is saved, and nothing is
 * published from here. What it cannot fix for you (the wording of the article itself) comes back as a short to-do list.
 */
export function SeoAssistant({
  language,
  fields,
  blocks,
  slugLocked,
  onApply,
}: {
  language: BlogLanguage;
  fields: Fields;
  blocks: ContentBlock[];
  /** True when the post already has a saved or hand-typed URL that must not change. */
  slugLocked: boolean;
  onApply: (next: FormSeoFields) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<OptimizeMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mode: OptimizeMode; data: OptimizeResult } | null>(null);
  const [undo, setUndo] = useState<FormSeoFields | null>(null);
  const [copied, setCopied] = useState(false);

  function run(mode: OptimizeMode) {
    setError(null);
    setResult(null);
    setRunning(mode);
    const before: FormSeoFields = {
      slug: fields.slug,
      excerpt: fields.excerpt,
      category: fields.category,
      tags: fields.tags,
      meta_title: fields.meta_title,
      meta_description: fields.meta_description,
      keywords: fields.keywords,
      faq: fields.faq,
    };
    startTransition(async () => {
      const response = await optimizeSeoAction({
        mode,
        language,
        title: fields.title,
        slug: fields.slug,
        excerpt: fields.excerpt,
        category: fields.category,
        tags: fields.tags,
        metaTitle: fields.meta_title,
        metaDescription: fields.meta_description,
        keywords: fields.keywords,
        faq: fields.faq,
        blocks,
      });
      setRunning(null);
      if (!response.ok) {
        setError(response.error);
        return;
      }
      onApply(applyOptimized(mode, before, response.result, { slugLocked }));
      setUndo(before);
      setResult({ mode, data: response.result });
    });
  }

  const todo = result?.data.after.checks.filter((c) => !c.ok) ?? [];

  return (
    <div className="admin-generator">
      <div className="admin-generator__body" style={{ display: "grid", gap: 12 }}>
        <div>
          <strong>SEO assistant</strong>
          <p className="admin-field__hint" style={{ margin: "4px 0 0" }}>
            Write your title and article, then let AI handle the search fields below. Autocomplete only fills empty boxes. Optimize rewrites the
            search boxes for the best result. Your article text is never changed, and you can undo.
          </p>
        </div>

        <div className="admin-form__actions" style={{ flexWrap: "wrap" }}>
          <button type="button" className="admin-btn" onClick={() => run("autocomplete")} disabled={pending}>
            {running === "autocomplete" ? "Filling in…" : "Autocomplete empty fields"}
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => run("optimize")} disabled={pending}>
            {running === "optimize" ? "Optimizing…" : "Optimize for search"}
          </button>
          {undo ? (
            <button
              type="button"
              className="admin-btn"
              onClick={() => {
                onApply(undo);
                setUndo(null);
                setResult(null);
              }}
              disabled={pending}
            >
              Undo
            </button>
          ) : null}
          {pending ? <span className="admin-field__hint">This usually takes 10 to 40 seconds.</span> : null}
        </div>

        {error ? (
          <div className="admin-banner admin-banner--error" role="alert">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="admin-banner" role="status" style={{ display: "grid", gap: 8 }}>
            <div>
              {result.mode === "autocomplete" ? "Empty fields filled in." : "Search fields optimized."} SEO score:{" "}
              <strong>
                {result.data.before.score} → {result.data.after.score} / 100
              </strong>
              . Check the boxes below, then save.
              {slugLocked ? " The URL was left unchanged on purpose." : ""}
            </div>
            {result.data.suggestedIntro ? (
              <div>
                <div className="admin-field__hint">
                  Suggested opening paragraph (a direct answer that search and AI engines can quote). Paste it at the top of your article if you like it:
                </div>
                <blockquote style={{ margin: "6px 0", paddingInlineStart: 12, borderInlineStart: "3px solid currentColor" }}>{result.data.suggestedIntro}</blockquote>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result.data.suggestedIntro);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch {
                      /* clipboard unavailable: the text is selectable */
                    }
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : null}
            {result.data.advice.length > 0 ? (
              <div>
                <div className="admin-field__hint">To improve in the article text itself:</div>
                <ul style={{ margin: "4px 0 0", paddingInlineStart: 20 }}>
                  {result.data.advice.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {todo.length > 0 ? (
              <details>
                <summary>{todo.length} SEO checks still open</summary>
                <ul style={{ margin: "4px 0 0", paddingInlineStart: 20 }}>
                  {todo.map((c) => (
                    <li key={c.id}>
                      {c.label}
                      {c.detail ? ` (${c.detail})` : ""}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
