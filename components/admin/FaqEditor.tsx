"use client";

import type { FaqItem } from "@/types/posts";

/** Edits the FAQ list of a post. Questions and answers are plain text; the public page renders them and marks them up for search engines. */
export function FaqEditor({ value, onChange, dir }: { value: FaqItem[]; onChange: (next: FaqItem[]) => void; dir: "ltr" | "rtl" }) {
  const update = (i: number, patch: Partial<FaqItem>) => onChange(value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  return (
    <div>
      <div className="auto-faq">
        {value.map((item, i) => (
          <div key={i} className="auto-faq__item">
            <input type="text" dir={dir} value={item.question} placeholder="Question" aria-label={`Question ${i + 1}`} onChange={(e) => update(i, { question: e.target.value })} />
            <textarea dir={dir} value={item.answer} placeholder="Answer" aria-label={`Answer ${i + 1}`} onChange={(e) => update(i, { answer: e.target.value })} />
            <div>
              <button type="button" className="admin-btn admin-btn--danger auto-btn-sm" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onChange([...value, { question: "", answer: "" }])} disabled={value.length >= 20}>
        Add a question
      </button>
    </div>
  );
}
