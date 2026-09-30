/**
 * SEO / GEO / AEO knowledge for blog posts, as code.
 *
 * Distilled from the audit rubric in SNLabat/SEO-GEO-AEO-Skill (kept at
 * .claude/skills/seo-geo-aeo/SKILL.md). That skill scores a page on:
 *   SEO: title 50-60 chars with the keyword, meta description 150-160 chars, one H1 and a
 *        logical H2/H3 hierarchy, clean URL, canonical, Open Graph, alt text, internal
 *        links, freshness, Article/Breadcrumb schema.
 *   GEO: E-E-A-T (named author or organization, publisher entity), factual density, a clear
 *        claim at the top, honest sourcing, one consistently named entity, structured data
 *        depth (Speakable, sameAs), clean crawlability.
 *   AEO: a 40-60 word direct answer under a question heading, "X is ..." definitions, lists
 *        and tables, FAQ markup, question-phrased headings, long-tail who/what/how coverage.
 * This file turns those signals into (1) the playbook the writer is told to follow, (2)
 * deterministic checks that run on every article, and (3) helpers the public post page uses
 * (heading anchors, table of contents).
 *
 * Pure logic on purpose, no imports: the generator, the localizer, the publish gate, the post
 * page and the offline check scripts all use it.
 */

/* -------------------------------------------------------------------------- */
/* Limits                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `target` is what the writer is asked for (fits a search result without truncation); `max` is the
 * hard limit validation enforces. Counting is by character, and the slack allows for scripts whose
 * glyph widths differ.
 */
export const SEO_LIMITS = {
  metaTitle: { target: 60, max: 70 },
  metaDescription: { min: 120, target: 158, max: 175 },
  /** The opening paragraph is the answer an engine can quote on its own. */
  intro: { minWords: 25, maxWords: 80 },
  faqAnswerWords: 75,
  takeaways: { min: 3, max: 5 },
  h2: { min: 3, max: 8 },
} as const;

/* -------------------------------------------------------------------------- */
/* Per-language search behaviour                                              */
/* -------------------------------------------------------------------------- */

/**
 * How people in each language actually ask and search, so headings, FAQ questions and the primary
 * keyword read like real queries instead of translated English. Keyed by locale code; a locale
 * with no entry gets the generic instruction only.
 */
export const SEARCH_NOTES: Record<string, string> = {
  en: 'Question headings start with How, What, Why, When, Which or Should ("How does AI search choose which business to recommend?"). Definitions use the pattern "X is ...".',
  he: 'Hebrew searchers ask with איך, מה, למה, כמה, מתי, האם. Write question headings and FAQ questions in that natural form, ending with "?". Use the keyword the way people type it (a prefix such as ב, ל or ה on the keyword is normal Hebrew). Terms Israelis search in Latin script (SEO, AI, ChatGPT, Google) stay in Latin script. Definitions read naturally as "X הוא / היא ...".',
  ar: 'Arabic searchers ask with كيف, ما هو / ما هي, لماذا, متى, هل, كم. Write question headings and FAQ questions in that form, ending with "؟". Use the term Arabic-speaking users actually search, not a literal rendering of the English keyword. Latin brand names and acronyms stay in Latin script.',
  ru: 'Russian searchers ask with как, что такое, почему, сколько, когда, стоит ли. Write question headings and FAQ questions in that form, ending with "?". Definitions use the pattern "X, это ...". Keep the keyword in a form a person would type (the nominative case) in the title, and decline it naturally in running text.',
  fr: 'French searchers ask with comment, qu\'est-ce que, pourquoi, quand, combien, faut-il. Write question headings and FAQ questions in that form, ending with "?". Definitions use the pattern "X est ...". Use French typography and no English title case.',
  es: 'Spanish searchers ask with cómo, qué es, por qué, cuándo, cuánto, debo. Question headings and FAQ questions carry the opening ¿ and closing ?. Neutral international Spanish, no regional slang. No English title case.',
  pt: 'Portuguese (Brazil) searchers ask with como, o que é, por que, quando, quanto, vale a pena. Write question headings and FAQ questions in that form, ending with "?". No English title case.',
};

/* -------------------------------------------------------------------------- */
/* The playbook the writer follows                                            */
/* -------------------------------------------------------------------------- */

/**
 * SEO / GEO / AEO instructions appended to the request in code. Deliberately not part of the
 * editable system prompt: an admin can replace that prompt in the database, and search
 * optimization must not silently disappear when they do.
 */
export function seoPlaybook(language: string): string {
  const L = SEO_LIMITS;
  const searchNote = SEARCH_NOTES[language];
  return `<seo_playbook>
This article must rank in search, be quoted by AI engines (ChatGPT, Gemini, Perplexity, Google AI Overviews, Claude) and win featured snippets and voice answers, while being genuinely useful to a human. Never keyword-stuff, and never trade accuracy for optimization.
- Primary keyword: keywords[0] is the phrase a searcher in this language would type for this topic. If a primary keyword is given in another language, adapt it to the natural local search phrase, do not translate it literally. It appears in the title, the metaTitle, the metaDescription, the first sentence of the opening paragraph and at least one H2, each time in a natural form.
- title (the H1) and metaTitle: the metaTitle is at most ${L.metaTitle.target} characters, keyword first where it reads naturally, and promises something specific (a how-to, a number of steps, a comparison, a direct answer). No clickbait, no all caps, no site name.
- metaDescription: ${L.metaDescription.min} to ${L.metaDescription.target} characters, contains the primary keyword once, states the concrete answer or benefit, and gives a reason to click. It must stand alone as a summary and must not repeat the title.
- Opening paragraph (answer first): ${L.intro.minWords} to ${L.intro.maxWords} words that answer the topic's core question directly, primary keyword in the first sentence. It could be quoted alone as the answer. No warm-up, no restating the title.
- Definition: define the core concept once, near the top, in a plain "X is ..." sentence in the target language's natural pattern.
- keyTakeaways: ${L.takeaways.min} to ${L.takeaways.max} short, self-contained points that summarise the article for a reader in a hurry, and give the section a short natural heading in takeawaysHeading.
- Headings: ${L.h2.min} to 6 H2 sections. Write most H2s as the question a searcher would ask, or as a clear noun phrase that names the answer. The first sentence of each section directly answers its heading in 40 to 60 words, then expands with detail. H3 only to split a long section; never skip a heading level. Headings are sentence case and never keyword-stuffed.
- Scannable structure: at least one list (numbered for steps, bulleted for criteria or options). Short paragraphs.
- Factual density and honesty: prefer specific, checkable statements over vague ones. Give a number only when the brief gives it; label any illustration as an example. Never invent statistics, studies, quotes or sources. Phrase unsupported points as reasoning or a typical pattern, not as fact.
- Entity clarity: name GeoRepute, Google and each AI engine consistently and in full. Do not alternate between different names for the same thing.
- faq: real follow-up questions a searcher would ask next (People Also Ask style), each in the target language's natural question form and ending with a question mark. Each answer opens with the direct answer, is self-contained, is ${L.faqAnswerWords} words or fewer, and does not repeat the article. Do not repeat FAQ questions as H2s.
- keywords: the primary phrase first, then related searches and synonyms a topical brief would list.${searchNote ? `\n- Search behavior in this language: ${searchNote}` : ""}
</seo_playbook>`;
}

/* -------------------------------------------------------------------------- */
/* Text helpers                                                               */
/* -------------------------------------------------------------------------- */

export type Block = { type?: string; props?: Record<string, unknown>; content?: unknown; children?: Block[] };

export function inlineText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((n: { text?: unknown; content?: unknown }) => (typeof n?.text === "string" ? n.text : inlineText(n?.content)))
    .join("");
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

const QUESTION_END = /[?？؟]\s*$/;

export function isQuestion(text: string): boolean {
  return QUESTION_END.test(text.trim());
}

export function headingLevel(block: Block): number {
  return Number((block.props as { level?: number } | undefined)?.level) || 2;
}

/** First paragraph of a post, plain text. */
export function introText(blocks: Block[]): string {
  const first = blocks.find((b) => b.type === "paragraph");
  return first ? inlineText(first.content).trim() : "";
}

const fold = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "") // accents, Hebrew niqqud, Arabic harakat
    .toLowerCase();

const stemOf = (w: string) => (w.length <= 3 ? w : w.slice(0, Math.max(3, Math.ceil(w.length * 0.75))));

// One-letter Hebrew and Arabic proclitics (ה ו ב כ ל מ ש / و ب ل ف ك) and the Arabic article ال attach to the next word.
const PROCLITIC = /^(?:ال|[הובכלמשوبلفك])(.{4,})$/u;

/**
 * Whether `text` contains the keyword, tolerant of inflection. Each keyword word is matched by its
 * stem (the first ~75% of its letters), which covers suffixes and plurals in every language, Russian
 * cases, and French, Spanish and Portuguese conjugations. Hebrew and Arabic prefixes are handled on
 * both sides (the text may say בביקורות where the keyword says ביקורות, or the reverse). Word order
 * is not required: "reputation audit" matches "auditing your reputation".
 */
export function mentions(text: string, keyword: string): boolean {
  const hay = fold(text);
  const words = fold(keyword).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 2);
  if (!words.length) return false;
  return words.every((w) => {
    const bare = w.match(PROCLITIC)?.[1];
    return hay.includes(stemOf(w)) || (bare !== undefined && hay.includes(stemOf(bare)));
  });
}

/* -------------------------------------------------------------------------- */
/* Heading anchors and outline                                                */
/* -------------------------------------------------------------------------- */

/**
 * URL-fragment id for a heading. Unicode-aware so Hebrew, Arabic and Cyrillic headings get real
 * anchors (deep links, jump-link sitelinks, AI citations of one section) instead of an empty id.
 */
export function headingId(text: string): string {
  const id = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return id || "section";
}

/** Makes ids unique within one document: a second "faq" becomes "faq-2". */
export function uniqueIds(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = headingId(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/** H2 headings with the same anchor ids the renderer gives them, for the table of contents. */
export function outline(blocks: Block[]): { text: string; id: string }[] {
  const id = uniqueIds();
  const out: { text: string; id: string }[] = [];
  for (const b of blocks) {
    if (b.type !== "heading") continue;
    const text = inlineText(b.content).trim();
    if (!text) continue;
    const anchor = id(text);
    if (headingLevel(b) <= 2) out.push({ text, id: anchor });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Checks                                                                     */
/* -------------------------------------------------------------------------- */

export type SeoCheck = { id: string; label: string; ok: boolean; detail?: string };
export type SeoReport = { score: number; checks: SeoCheck[] };

export type SeoInput = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** keywords[0] is the primary keyword. */
  keywords: string[];
  blocks: Block[];
  faq: { question: string; answer: string }[];
};

/**
 * The audit skill's signals applied to one article. Every failed check is advisory (it becomes a
 * warning in the publish gate); the hard limits that trigger a rewrite live in article.ts.
 */
export function analyzeSeo(input: SeoInput): SeoReport {
  const { title, metaTitle, metaDescription, keywords, blocks, faq } = input;
  const L = SEO_LIMITS;
  const checks: SeoCheck[] = [];
  const add = (id: string, label: string, ok: boolean, detail?: string) => checks.push({ id, label, ok, detail });

  const mt = metaTitle.trim();
  add("meta-title-length", `The meta title is at most ${L.metaTitle.target} characters`, mt.length > 0 && mt.length <= L.metaTitle.target, `${mt.length} characters`);
  const md = metaDescription.trim();
  add(
    "meta-description-length",
    `The meta description is ${L.metaDescription.min} to ${L.metaDescription.target} characters`,
    md.length >= L.metaDescription.min && md.length <= L.metaDescription.target,
    `${md.length} characters`,
  );

  const intro = introText(blocks);
  const introWords = countWords(intro);
  add(
    "intro-answer",
    `The opening paragraph is a direct answer (${L.intro.minWords} to ${L.intro.maxWords} words)`,
    introWords >= L.intro.minWords && introWords <= L.intro.maxWords,
    `${introWords} words`,
  );

  const primary = keywords[0]?.trim();
  if (primary) {
    add("kw-meta-title", "The primary keyword is in the meta title", mentions(metaTitle, primary));
    add("kw-title", "The primary keyword is in the title", mentions(title, primary));
    add("kw-meta-description", "The primary keyword is in the meta description", mentions(metaDescription, primary));
    add("kw-intro", "The primary keyword is in the opening paragraph", mentions(intro, primary));
    const h2Text = blocks.filter((b) => b.type === "heading" && headingLevel(b) === 2).map((b) => inlineText(b.content));
    add("kw-heading", "The primary keyword is in a subheading", h2Text.some((h) => mentions(h, primary)));
  }

  const headings = blocks.filter((b) => b.type === "heading");
  const h2 = headings.filter((b) => headingLevel(b) === 2);
  add("h2-count", `${L.h2.min} to ${L.h2.max} H2 sections`, h2.length >= L.h2.min && h2.length <= L.h2.max, `${h2.length} sections`);
  let previous = 1;
  let skipped = false;
  for (const h of headings) {
    const level = headingLevel(h);
    if (level > previous + 1) skipped = true;
    previous = level;
  }
  add("heading-order", "Heading levels never skip", !skipped);
  const questionHeadings = headings.filter((b) => isQuestion(inlineText(b.content)));
  add("question-headings", "Question-form headings for snippets and voice search", questionHeadings.length >= 1, `${questionHeadings.length} found`);
  add("list", "Contains a list or steps", blocks.some((b) => b.type === "bulletListItem" || b.type === "numberedListItem"));

  add("faq", "Has an FAQ", faq.length >= 3, `${faq.length} questions`);
  if (faq.length) {
    add("faq-questions", "FAQ entries are written as questions", faq.every((f) => isQuestion(f.question)));
    add("faq-answers", `FAQ answers are direct (${L.faqAnswerWords} words or fewer)`, faq.every((f) => countWords(f.answer) <= L.faqAnswerWords * 1.4));
  }
  if (keywords.length) add("keywords", "Related keywords are listed", keywords.length >= 4, `${keywords.length} keywords`);

  const passed = checks.filter((c) => c.ok).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}
