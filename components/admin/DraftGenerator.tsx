"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { generateDraftAction } from "@/lib/actions/blogGeneration";
import { BLOG_LANGUAGES, BLOG_LENGTHS, INPUT_LIMITS, type BlogLanguage, type BlogLength, type GeneratedDraft } from "@/lib/blog/generation";

/**
 * "Generate a draft with Claude" panel for the post form. It only ever fills the
 * form: nothing is saved or published from here, and the result is a normal
 * editable BlockNote document the admin reviews first.
 */
export function DraftGenerator({
  languages,
  defaultLanguage,
  hasContent,
  onDraft,
}: {
  languages: BlogLanguage[];
  defaultLanguage: BlogLanguage;
  /** True when the form already has a title or body, so applying a draft would overwrite work. */
  hasContent: boolean;
  onDraft: (draft: GeneratedDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<BlogLanguage>(defaultLanguage);
  const [length, setLength] = useState<BlogLength>("medium");
  const [keywords, setKeywords] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<GeneratedDraft | null>(null);
  const [pending, startTransition] = useTransition();
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pending) {
      setElapsed(0);
      timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [pending]);

  function generate() {
    setError(null);
    setDone(null);
    if (
      hasContent &&
      !window.confirm("Replace the current title, excerpt, tags and content with a newly generated draft? Unsaved edits will be lost.")
    ) {
      return;
    }
    startTransition(async () => {
      const result = await generateDraftAction({ topic, language, length, keywords, notes });
      if (result.ok) {
        onDraft(result.draft);
        setDone(result.draft);
      } else {
        setError(result.error);
      }
    });
  }

  const dir = BLOG_LANGUAGES[language].dir;

  return (
    <div className="admin-generator">
      <button type="button" className="admin-generator__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span aria-hidden="true">{open ? "−" : "+"}</span> Generate a draft with Claude
      </button>

      {open ? (
        <div className="admin-generator__body">
          <p className="admin-field__hint">
            Claude writes a first draft into this form. Review and edit everything before saving. Nothing is published until you publish it.
          </p>

          <div className="admin-field">
            <label htmlFor="gen-topic">Topic</label>
            <textarea
              id="gen-topic"
              rows={2}
              dir={dir}
              value={topic}
              maxLength={INPUT_LIMITS.topic[1]}
              placeholder="e.g. Why a business can rank on Google and still be invisible to AI engines"
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="admin-row">
            <div className="admin-field">
              <label htmlFor="gen-language">Language</label>
              <select id="gen-language" value={language} onChange={(e) => setLanguage(e.target.value as BlogLanguage)}>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {BLOG_LANGUAGES[l].name} ({BLOG_LANGUAGES[l].native})
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="gen-length">Length</label>
              <select id="gen-length" value={length} onChange={(e) => setLength(e.target.value as BlogLength)}>
                {(Object.keys(BLOG_LENGTHS) as BlogLength[]).map((l) => (
                  <option key={l} value={l}>
                    {BLOG_LENGTHS[l].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="gen-keywords">Keywords (optional)</label>
              <input
                id="gen-keywords"
                type="text"
                dir={dir}
                value={keywords}
                maxLength={INPUT_LIMITS.keywords[1]}
                placeholder="comma, separated"
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="gen-notes">Brief (optional)</label>
            <textarea
              id="gen-notes"
              rows={3}
              dir={dir}
              value={notes}
              maxLength={INPUT_LIMITS.notes[1]}
              placeholder="Angle, audience, points to cover. Any URLs you paste here are the only links the draft may use."
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error ? (
            <div className="admin-banner admin-banner--error" role="alert">
              {error}
            </div>
          ) : null}
          {done ? (
            <div className="admin-banner" role="status">
              Draft ready: about {done.wordCount} words in {BLOG_LANGUAGES[done.language].name}. Review it below, then save.
            </div>
          ) : null}

          <div className="admin-form__actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={generate}
              disabled={pending || topic.trim().length < INPUT_LIMITS.topic[0]}
            >
              {pending ? `Writing… ${elapsed}s` : done ? "Generate again" : "Generate draft"}
            </button>
            {pending ? <span className="admin-field__hint">This usually takes 20 to 90 seconds. Keep this tab open.</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
