"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createTranslationAction, translatePostAction, type TranslatePostResult } from "@/lib/actions/blogTranslation";
import { BLOG_LANGUAGES } from "@/lib/blog/generation";
import type { PostLocale } from "@/types/posts";

type Result = Extract<TranslatePostResult, { ok: true }>;

function fieldLabel(field: string): string {
  const m = /^unit:(\d+)$/.exec(field);
  if (m) return `Text block ${Number(m[1]) + 1}`;
  return { title: "Title", excerpt: "Excerpt", category: "Category", tags: "Tags", document: "Whole post" }[field] ?? field;
}

/**
 * "Translate this post" on the edit page. Translating never saves anything: the
 * admin sees what was checked and what (if anything) is still flagged, then
 * chooses to store the result as an unpublished draft in the other language.
 */
export function TranslatePanel({
  postId,
  sourceLocale,
  existing,
}: {
  postId: string;
  sourceLocale: PostLocale;
  existing: { id: string; status: string } | null;
}) {
  const router = useRouter();
  const target: PostLocale = sourceLocale === "he" ? "en" : "he";
  const targetName = BLOG_LANGUAGES[target].name;
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [working, startWork] = useTransition();
  const [saving, startSave] = useTransition();
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (working) {
      setElapsed(0);
      timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [working]);

  function translate() {
    setError(null);
    setResult(null);
    setAck(false);
    startWork(async () => {
      const r = await translatePostAction(postId, target);
      if (r.ok) setResult(r);
      else {
        setError(r.error);
        if (r.existingId) setExistingId(r.existingId);
      }
    });
  }

  function save() {
    if (!result) return;
    setError(null);
    startSave(async () => {
      const r = await createTranslationAction({
        sourceId: postId,
        target,
        translated: result.translated,
        needsReview: result.report.status === "needs_review",
        acknowledged: ack,
      });
      if (r.ok) router.push(`/admin/blogs/${r.id}/edit`);
      else setError(r.error);
    });
  }

  const linkedId = existing?.id ?? existingId;
  const report = result?.report;
  const needsReview = report?.status === "needs_review";
  const dir = BLOG_LANGUAGES[target].dir;

  return (
    <div className="admin-generator admin-translate">
      <button type="button" className="admin-generator__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span aria-hidden="true">{open ? "−" : "+"}</span> Translate this post to {targetName}
        {linkedId ? <span className="admin-translate__pill">translation exists</span> : null}
      </button>

      {open ? (
        <div className="admin-generator__body">
          {linkedId ? (
            <p className="admin-field__hint">
              A {targetName} version of this post already exists.{" "}
              <Link href={`/admin/blogs/${linkedId}/edit`}>Open it to edit it</Link>. Delete it first if you want to translate again.
            </p>
          ) : (
            <>
              <p className="admin-field__hint">
                Claude translates block by block, then the result is checked for numbers, links, names and the site&apos;s terminology, and a second
                independent pass reviews it. You get an unpublished draft with the same slug. Read it before publishing: no automatic check
                replaces a human reader.
              </p>

              {error ? (
                <div className="admin-banner admin-banner--error" role="alert">
                  {error}
                </div>
              ) : null}

              {!result ? (
                <div className="admin-form__actions">
                  <button type="button" className="admin-btn admin-btn--primary" onClick={translate} disabled={working}>
                    {working ? `Translating and checking… ${elapsed}s` : `Translate to ${targetName}`}
                  </button>
                  {working ? <span className="admin-field__hint">This usually takes 1 to 3 minutes. Keep this tab open.</span> : null}
                </div>
              ) : null}

              {result && report ? (
                <div className="admin-translate__result">
                  <div className={`admin-banner ${needsReview ? "admin-banner--error" : ""}`} role="status">
                    {needsReview
                      ? `Needs review: ${report.issues.filter((i) => i.severity !== "minor").length} issue(s) could not be resolved automatically.`
                      : "Checked: no serious problems found."}
                    {report.fixed ? ` ${report.fixed} problem(s) were found and corrected automatically.` : ""}
                  </div>

                  <div className="admin-translate__preview" dir={dir}>
                    <strong>{result.translated.title}</strong>
                    <p>{result.translated.excerpt}</p>
                  </div>

                  <details>
                    <summary>What was checked</summary>
                    <ul className="admin-translate__list">
                      {report.checks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <p className="admin-field__hint">
                      {report.calls} model calls, {report.seconds}s, {report.usage.inputTokens.toLocaleString("en-US")} input and{" "}
                      {report.usage.outputTokens.toLocaleString("en-US")} output tokens, model {report.model}.
                    </p>
                  </details>

                  {report.issues.length ? (
                    <ul className="admin-translate__issues">
                      {report.issues.map((i, n) => (
                        <li key={`${i.field}-${n}`} className={`admin-translate__issue admin-translate__issue--${i.severity}`}>
                          <span className="admin-translate__sev">{i.severity}</span> <strong>{fieldLabel(i.field)}</strong>: {i.note}
                          {i.source ? <div className="admin-translate__snip">Source: {i.source}</div> : null}
                          {i.translation ? (
                            <div className="admin-translate__snip" dir={dir}>
                              Translation: {i.translation}
                            </div>
                          ) : null}
                          {i.suggestion ? (
                            <div className="admin-translate__snip" dir={dir}>
                              Suggested: {i.suggestion}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {needsReview ? (
                    <label className="admin-translate__ack">
                      <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> I will read the flagged parts before publishing.
                    </label>
                  ) : null}

                  <p className="admin-field__hint">The featured image is not copied. Add one to the translation.</p>
                  <div className="admin-form__actions">
                    <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={saving || (needsReview && !ack)}>
                      {saving ? "Saving…" : `Save as ${targetName} draft`}
                    </button>
                    <button type="button" className="admin-btn" onClick={translate} disabled={working || saving}>
                      Translate again
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
