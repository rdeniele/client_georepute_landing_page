/**
 * The publish gate. Nothing the automation writes goes live unless it passes this, and it runs
 * again on the stored post at publish time, so a human edit that breaks a post is caught too.
 *
 * `error` issues block publishing (the article becomes "needs review" instead). `warning`
 * issues are shown to the admin but do not block. This is deliberately deterministic: no model
 * decides whether content is safe to publish.
 */
import { SLUG, countWords, languageProblem, type BlogLanguage } from "@/lib/blog/generation";
import type { ContentBlock } from "@/types/blocks";
import type { FaqItem } from "@/types/posts";

export type Issue = { severity: "error" | "warning"; code: string; message: string };

export type PublishCandidate = {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  blocks: ContentBlock[];
  faq: FaqItem[];
};

export type ValidationOptions = {
  /** Headings every article must contain (compared case-insensitively). */
  requiredHeadings?: string[];
  faqRequired?: boolean;
  /** Whether a link may appear in an article in this language. */
  isAllowedLink: (href: string, locale: string) => boolean;
  minWords?: number;
};

const PLACEHOLDERS: [RegExp, string][] = [
  [/lorem ipsum/i, "lorem ipsum"],
  [/\b(?:TODO|TBD|FIXME)\b/, "TODO/TBD marker"],
  [/\[(?:insert|add|your|company|brand|name|link|url|keyword|topic|date|city)[^\]]{0,40}\]/i, "bracketed placeholder"],
  [/\{\{[^}]{0,60}\}\}|\{%[^%]{0,60}%\}/, "template placeholder"],
  [/<(?:insert|placeholder)[^>]*>/i, "angle-bracket placeholder"],
  [/\bXX{2,}\b|\?\?\?+/, "XXX / ??? filler"],
  [/\b(?:placeholder|sample text|your text here)\b/i, "placeholder wording"],
];

const GENERATION_ARTIFACTS: [RegExp, string][] = [
  [/^\s*(?:i'?m sorry|sorry,|i cannot|i can'?t (?:help|write|assist|comply)|as an ai\b|as a language model)/im, "an AI refusal or disclaimer"],
  [/\b(?:here is|here's) (?:the|your) (?:article|blog post|draft)\b/i, "assistant preamble"],
  [/```/, "code fence"],
  [/"(?:metaTitle|metaDescription|blocks|excerpt)"\s*:/, "raw JSON"],
  [/\bundefined\b|\bNaN\b|\[object Object\]/, "a programming artifact"],
];

export function findPlaceholders(text: string): string[] {
  return [...PLACEHOLDERS, ...GENERATION_ARTIFACTS].filter(([re]) => re.test(text)).map(([, label]) => label);
}

type Inline = { type?: string; text?: string; href?: string; content?: unknown };

function linksOf(content: unknown, out: string[]) {
  if (!Array.isArray(content)) return;
  for (const n of content as Inline[]) {
    if (n && n.type === "link" && typeof n.href === "string") out.push(n.href);
    if (n && n.content) linksOf(n.content, out);
  }
}

export function collectLinks(blocks: ContentBlock[]): string[] {
  const out: string[] = [];
  const walk = (list: ContentBlock[]) =>
    list.forEach((b) => {
      linksOf(b.content, out);
      if (b.children) walk(b.children);
    });
  walk(blocks);
  return out;
}

/** Inline content is either a plain string (BlockNote's shorthand, also what legacy posts use) or an array of text and link nodes. */
function inlineText(c: unknown): string {
  return typeof c === "string" ? c : Array.isArray(c) ? (c as Inline[]).map((n) => (typeof n.text === "string" ? n.text : inlineText(n.content))).join("") : "";
}

export function bodyText(blocks: ContentBlock[]): string {
  return blocks.map((b) => [inlineText(b.content), b.children ? bodyText(b.children) : ""].filter(Boolean).join("\n")).filter(Boolean).join("\n");
}

export function headingTexts(blocks: ContentBlock[]): string[] {
  return blocks.filter((b) => b.type === "heading").map((b) => inlineText(b.content).trim());
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export function validateForPublish(c: PublishCandidate, o: ValidationOptions): Issue[] {
  const issues: Issue[] = [];
  const error = (code: string, message: string) => issues.push({ severity: "error", code, message });
  const warn = (code: string, message: string) => issues.push({ severity: "warning", code, message });

  if (!c.title.trim()) error("title_missing", "The title is missing.");
  else if (c.title.trim().length < 8) error("title_short", "The title is too short to be a real title.");

  if (!c.slug.trim()) error("slug_missing", "The URL slug is missing.");
  else if (!SLUG.test(c.slug)) error("slug_invalid", "The URL slug must be lowercase letters, digits and hyphens.");

  if (!c.metaTitle.trim()) error("meta_title_missing", "The meta title is missing.");
  else if (c.metaTitle.trim().length > 70) warn("meta_title_long", `The meta title is ${c.metaTitle.trim().length} characters; search engines cut it near 60.`);

  if (!c.metaDescription.trim()) error("meta_description_missing", "The meta description is missing.");
  else {
    const n = c.metaDescription.trim().length;
    if (n < 70) warn("meta_description_short", `The meta description is only ${n} characters.`);
    if (n > 175) warn("meta_description_long", `The meta description is ${n} characters; search engines cut it near 160.`);
  }

  const blocks = (c.blocks ?? []) as ContentBlock[];
  const body = bodyText(blocks);
  const words = countWords(body);
  if (!blocks.length || !body.trim()) error("content_missing", "The article has no content.");
  else if (words < (o.minWords ?? 150)) error("content_short", `The article is only ${words} words.`);

  const headings = headingTexts(blocks);
  if (blocks.length && headings.length < 2) error("headings_missing", `The article has ${headings.length} heading${headings.length === 1 ? "" : "s"}; it needs a proper section structure.`);
  for (const required of o.requiredHeadings ?? []) {
    if (required.trim() && !headings.some((h) => norm(h) === norm(required))) {
      error("required_section_missing", `The required section "${required}" is missing.`);
    }
  }

  const faq = (c.faq ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  if (o.faqRequired && faq.length < 3) error("faq_missing", `The FAQ needs at least 3 questions (it has ${faq.length}).`);

  const everything = [c.title, c.excerpt, c.metaTitle, c.metaDescription, body, ...faq.flatMap((f) => [f.question, f.answer])].join("\n");
  const problem = blocks.length ? languageProblem(`${c.title} ${body} ${faq.map((f) => `${f.question} ${f.answer}`).join(" ")}`, c.locale as BlogLanguage) : null;
  if (problem) error("wrong_language", `The text does not read as the target language (${problem}).`);

  const found = [...new Set(findPlaceholders(everything))];
  if (found.length) error("placeholder_text", `The text contains ${found.join(", ")}.`);

  for (const href of new Set(collectLinks(blocks))) {
    if (!o.isAllowedLink(href, c.locale)) error("link_invalid", `The link ${href.slice(0, 120)} is not an allowed internal or approved link for this language.`);
  }

  if (/[—―]/.test(everything)) warn("em_dash", "The text contains em dashes.");
  return issues;
}

export const hasBlockingIssues = (issues: Issue[]) => issues.some((i) => i.severity === "error");
