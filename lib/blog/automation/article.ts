/**
 * Canonical article generation for the automation: one Claude call that returns structured JSON
 * (never HTML), then strict validation before anything is stored. The CMS, not the model, decides
 * what is saved: every field is cleaned, bounded and converted to editor blocks by our own code.
 *
 * No secrets and no `server-only`: the caller passes in an already-built client
 * (lib/services/claude.ts), so this file is testable offline with a scripted client.
 */
import type Anthropic from "@anthropic-ai/sdk";
import {
  BLOG_LANGUAGES,
  BLOG_LENGTHS,
  DEFAULT_BLOG_MODEL,
  GenerationError,
  SLUG,
  blockText,
  cleanText,
  countWords,
  extractUrls,
  fail,
  languageProblem,
  mapApiError,
  readJson,
  slugFrom,
  str,
  toEditorBlocks,
  type BlogLanguage,
  type DraftBlock,
  type RawBlock,
} from "@/lib/blog/generation";
import type { FaqItem } from "@/types/posts";
import { ARTICLE_JSON_SCHEMA, allowedLinks, buildArticlePrompt, type ArticleRequest } from "./prompt";
import { findPlaceholders } from "./validate";

export type GeneratedArticle = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  keywords: string[];
  /** Body, then the call to action as a closing heading and paragraph. */
  blocks: DraftBlock[];
  faq: FaqItem[];
  cta: { heading: string; text: string };
  imageConcept: string;
  linkOpportunities: string[];
  language: string;
  wordCount: number;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
};

type Raw = Record<string, unknown>;

const strip = (s: string) => cleanText(s).replace(/\*/g, "");
const plainOf = (s: string) => cleanText(s).replace(/\*\*?|\[([^\]]*)\]\([^)]*\)/g, "$1");

function stringList(v: unknown, min: number, max: number, maxLen: number): string[] {
  const list = (Array.isArray(v) ? v : [])
    .filter((x): x is string => typeof x === "string")
    .map((x) => strip(x).replace(/,/g, " ").replace(/\s+/g, " ").trim())
    .filter((x) => x.length >= min && x.length <= maxLen);
  return [...new Set(list)].slice(0, max);
}

/** Validates the model's answer and turns it into a `GeneratedArticle`. Throws `invalid_output` with a reason the model can act on. */
export function validateArticle(raw: unknown, req: ArticleRequest, meta: { model: string; usage: { inputTokens: number; outputTokens: number } }): GeneratedArticle {
  if (!raw || typeof raw !== "object") fail("the response was not an object");
  const d = raw as Raw;
  const language = String(req.language);
  const allowed = new Set(allowedLinks(req.config, req.notes ?? "", language).map((l) => l.href));
  extractUrls(req.notes ?? "").forEach((u) => allowed.add(u));

  const title = strip(str(d.title, "the title"));
  const metaTitle = strip(str(d.metaTitle, "the meta title"));
  const metaDescription = strip(str(d.metaDescription, "the meta description"));
  const excerpt = plainOf(str(d.excerpt, "the excerpt"));
  const modelCategory = strip(str(d.category, "the category"));
  if (title.length < 8 || title.length > 120) fail(`the title is ${title.length} characters`);
  if (metaTitle.length < 10 || metaTitle.length > 70) fail(`the meta title is ${metaTitle.length} characters (limit 60, hard maximum 70)`);
  if (metaDescription.length < 70 || metaDescription.length > 175) fail(`the meta description is ${metaDescription.length} characters (aim for 120 to 158)`);
  if (excerpt.length < 60 || excerpt.length > 320) fail(`the excerpt is ${excerpt.length} characters`);

  // An admin-chosen category is authoritative. Otherwise it must be one of the allowed categories when any are configured.
  let category = req.category?.trim() || modelCategory;
  if (!req.category?.trim() && req.config.categories.length) {
    const match = req.config.categories.find((c) => c.toLowerCase() === modelCategory.toLowerCase());
    if (!match) fail(`the category "${modelCategory}" is not one of the allowed categories`);
    category = match;
  }
  if (category.length < 2 || category.length > 60) fail("the category is missing or too long");

  const tags = stringList(d.tags, 2, 8, 40);
  if (tags.length < 2) fail("fewer than two usable tags");
  const keywords = stringList(d.keywords, 2, 12, 80);
  if (keywords.length < 1) fail("no keywords");

  let slug = typeof d.slug === "string" ? slugFrom(d.slug) : "";
  if (!SLUG.test(slug) || slug.length > 80) slug = slugFrom(title);
  if (!SLUG.test(slug)) slug = slugFrom(keywords[0]);
  if (!SLUG.test(slug)) fail("no usable Latin slug (use the keyword's Latin form)");

  if (!Array.isArray(d.blocks)) fail("there are no content blocks");
  if (d.blocks.length > 160) fail("there are too many blocks");
  const body = toEditorBlocks(d.blocks as RawBlock[], allowed);
  const headings = body.filter((b) => b.type === "heading").length;
  if (body.length < 6) fail(`only ${body.length} blocks`);
  if (headings < 3) fail(`only ${headings} headings`);
  if (body[0].type === "heading") fail("the article starts with a heading instead of an answer-first paragraph");
  const words = countWords(blockText(body));
  const target = BLOG_LENGTHS[req.config.length].words;
  if (words < target * 0.6 || words > target * 1.7) fail(`the body is ${words} words, expected about ${target}`);

  // Required sections: the model reports which heading answers each one, and we check that heading really exists.
  const headingText = new Set(
    body.filter((b) => b.type === "heading").map((b) => blockText([b]).trim().toLowerCase().replace(/\s+/g, " ")),
  );
  const reported = new Map<string, string>();
  for (const r of Array.isArray(d.requiredSections) ? (d.requiredSections as Raw[]) : []) {
    if (r && typeof r.section === "string" && typeof r.heading === "string") reported.set(r.section.trim().toLowerCase(), strip(r.heading).toLowerCase().replace(/\s+/g, " "));
  }
  for (const section of req.config.requiredSections) {
    const heading = reported.get(section.trim().toLowerCase());
    if (!heading || !headingText.has(heading)) fail(`the required section "${section}" has no matching heading`);
  }

  const faqRaw = req.config.faq === "never" ? [] : Array.isArray(d.faq) ? (d.faq as Raw[]) : [];
  const faq: FaqItem[] = faqRaw
    .filter((f) => f && typeof f.question === "string" && typeof f.answer === "string")
    .map((f) => ({ question: plainOf(String(f.question)), answer: plainOf(String(f.answer)) }))
    .filter((f) => f.question.length >= 8 && f.question.length <= 200 && f.answer.length >= 30 && f.answer.length <= 900)
    .slice(0, 8);
  if (req.config.faq === "always" && faq.length < 3) fail(`the FAQ has ${faq.length} usable items, at least 3 are required`);

  const ctaRaw = (d.cta ?? {}) as Raw;
  const cta = { heading: strip(str(ctaRaw.heading, "the call to action heading")), text: plainOf(str(ctaRaw.text, "the call to action text")) };
  if (cta.heading.length < 3 || cta.heading.length > 100) fail("the call to action heading is missing or too long");
  if (cta.text.length < 20 || cta.text.length > 500) fail("the call to action text is missing or the wrong length");

  const imageConcept = plainOf(str(d.imageConcept, "the image concept")).slice(0, 300);
  if (imageConcept.length < 10) fail("the featured image concept is missing");
  const linkOpportunities = stringList(d.linkOpportunities, 3, 5, 200);

  const all = `${title} ${metaTitle} ${metaDescription} ${blockText(body)} ${faq.map((f) => `${f.question} ${f.answer}`).join(" ")} ${cta.heading} ${cta.text}`;
  const problem = languageProblem(all, language as BlogLanguage);
  if (problem) fail(`wrong language (${problem})`);
  if (/[—―]/.test(all)) fail("it still contains em dashes");
  const placeholders = findPlaceholders(all);
  if (placeholders.length) fail(`it contains ${placeholders.join(", ")}`);

  const blocks: DraftBlock[] = [
    ...body,
    { type: "heading", props: { level: 2 }, content: [{ type: "text", text: cta.heading, styles: {} }] },
    { type: "paragraph", content: [{ type: "text", text: cta.text, styles: {} }] },
  ];

  return { title, metaTitle, metaDescription, slug, excerpt, category, tags, keywords, blocks, faq, cta, imageConcept, linkOpportunities, language, wordCount: words, model: meta.model, usage: meta.usage };
}

export type GenerateArticleOptions = {
  model?: string;
  /** Attempts including the first. Only unusable output is retried here; API failures go back to the queue with backoff. */
  attempts?: number;
  sdk: typeof Anthropic;
};

export async function generateArticle(client: Anthropic, req: ArticleRequest, { model = DEFAULT_BLOG_MODEL, attempts = 2, sdk }: GenerateArticleOptions): Promise<GeneratedArticle> {
  if (!req.topic || req.topic.trim().length < 5) throw new GenerationError("invalid_input", "The topic is too short.");
  if (!(String(req.language) in BLOG_LANGUAGES)) throw new GenerationError("invalid_input", `Unsupported language: ${req.language}.`);
  const { system, user, maxTokens } = buildArticlePrompt(req);
  let feedback = "";
  let last: GenerationError | null = null;
  const usage = { inputTokens: 0, outputTokens: 0 };

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        output_config: { effort: "medium", format: { type: "json_schema", schema: ARTICLE_JSON_SCHEMA as unknown as Record<string, unknown> } },
        messages: [{ role: "user", content: feedback ? `${user}\n\n${feedback}` : user }],
      });
      usage.inputTokens += message.usage.input_tokens;
      usage.outputTokens += message.usage.output_tokens;
      return validateArticle(readJson(message), req, { model: message.model, usage: { ...usage } });
    } catch (error) {
      const mapped = mapApiError(error, sdk);
      last = mapped;
      if (mapped.code !== "invalid_output" || attempt === attempts) break;
      feedback = `Your previous attempt was rejected: ${mapped.message} Write the article again and fix that problem. Follow every rule in the system prompt.`;
    }
  }
  throw last ?? new GenerationError("unknown", "Article generation failed unexpectedly.");
}
