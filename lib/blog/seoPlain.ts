import type { SeoCheck } from "./seo";

/**
 * The SEO checks in the words of someone who has never heard of SEO. Each entry is an instruction ("Do this"), not a
 * diagnosis, and never uses terms like "meta title" or "H2". The publish gate keeps the technical labels; the editor
 * uses these.
 */
const PLAIN: Record<string, { ok: string; todo: string }> = {
  "meta-title-length": { ok: "Your Google headline is short enough", todo: "Shorten the Google headline to 60 characters or fewer so Google does not cut it off" },
  "meta-description-length": { ok: "Your Google description is the right length", todo: "Make the Google description 120 to 158 characters: long enough to explain, short enough not to be cut off" },
  "intro-answer": { ok: "Your first paragraph gets straight to the point", todo: "Start the article with a short paragraph (about 30 to 70 words) that answers the main question right away" },
  "kw-meta-title": { ok: "The main phrase is in your Google headline", todo: "Put your main keyword phrase in the Google headline" },
  "kw-title": { ok: "The main phrase is in your title", todo: "Use your main keyword phrase in the post title" },
  "kw-meta-description": { ok: "The main phrase is in your Google description", todo: "Use your main keyword phrase once in the Google description" },
  "kw-intro": { ok: "The main phrase is in your first paragraph", todo: "Use your main keyword phrase in the first sentence of the article" },
  "kw-heading": { ok: "The main phrase is in one of your subheadings", todo: "Use your main keyword phrase in at least one subheading" },
  "h2-count": { ok: "Your article is split into clear sections", todo: "Split the article into 3 to 8 sections, each with its own subheading" },
  "heading-order": { ok: "Your headings are in a sensible order", todo: "Do not skip heading levels (for example, go from a main subheading to a smaller one, not straight to the smallest)" },
  "question-headings": { ok: "You have a heading written as a question", todo: "Write at least one subheading as a question people would type into Google, for example “How do I…?”" },
  list: { ok: "You use a list", todo: "Add a bulleted or numbered list. It is easier to read and search engines like it" },
  faq: { ok: "You have questions and answers", todo: "Add at least 3 questions and answers (the AI can write them: press Optimize for search)" },
  "faq-questions": { ok: "Your FAQ questions end with a question mark", todo: "Write each FAQ question as a real question ending with a question mark" },
  "faq-answers": { ok: "Your FAQ answers are short and direct", todo: "Keep each FAQ answer short: about 75 words or fewer, starting with the answer" },
  keywords: { ok: "You listed related keywords", todo: "List a few related phrases people might search for (the AI can suggest them)" },
};

export function plainCheck(check: SeoCheck): { ok: boolean; text: string } {
  const p = PLAIN[check.id];
  return { ok: check.ok, text: p ? (check.ok ? p.ok : p.todo) : check.label };
}
