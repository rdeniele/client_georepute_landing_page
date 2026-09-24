/**
 * Blog translation checks.
 *
 *   npm run translate:check              offline suite, plus a live round trip if ANTHROPIC_API_KEY is set
 *   npm run translate:check -- --offline offline suite only (no API calls, no cost)
 *
 * The offline suite is where accuracy safeguards are proven: a hand-checked
 * English/Hebrew pair must pass, and every kind of deliberate corruption
 * (changed number, changed link, dropped block, dropped brand name, wrong
 * terminology, untranslated text, wrong language) must be caught. The model
 * is scripted, so nothing here depends on how good a real translation is.
 * The live round trip prints the real report for a human to read.
 */
import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import type { ContentBlock } from "@/types/blocks";
import { GenerationError } from "@/lib/blog/generation";
import { buildGlossary } from "@/lib/blog/glossary";
import {
  MAX_TRANSLATION_WORDS,
  applyTranslation,
  checkTranslation,
  collectUnits,
  inlineToMarkup,
  linksIn,
  markupToInline,
  translatePost,
  type CheckContext,
  type InlineNode,
  type SourcePost,
  type TranslatableBlock,
  type TranslatedPost,
  type TranslateOptions,
} from "@/lib/blog/translation";

const args = new Set(process.argv.slice(2));
let failures = 0;
let passes = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passes++;
    console.log(`  ok    ${name}`);
  } else {
    failures++;
    console.log(`  FAIL  ${name}${detail ? `: ${detail}` : ""}`);
  }
}

const EM = String.fromCharCode(0x2014);
const glossary = buildGlossary();
const NO_LINKS: ReadonlySet<string> = new Set();

/* -------------------------------------------------------------------------- */
/* Fixture: one small article, plus a hand-checked Hebrew translation         */
/* -------------------------------------------------------------------------- */

const LINK = "https://www.georepute.ai/en/methodology";
const allowed = new Set([LINK]);
const mk = (type: string, markup: string, level?: number): TranslatableBlock => ({
  type,
  ...(level ? { props: { level, textAlignment: "left" } } : { props: { textAlignment: "left" } }),
  content: markupToInline(markup, allowed).nodes,
  children: [],
});
const image: TranslatableBlock = { type: "image", props: { url: "https://cdn.example.com/a.png", caption: "" } };

const EN_UNITS: [string, string, number?][] = [
  ["paragraph", "When a buyer asks an AI engine who to trust, the answer is built from many sources, not only from a website. In our sample of 124 answers, the same three names came back **most of the time**."],
  ["heading", "What AI engines actually look at", 2],
  ["paragraph", `Consistency matters more than volume. Profiles, reviews and independent coverage tell the model who a business really is. Read the full method on our [methodology page](${LINK}).`],
  ["bulletListItem", "Ask the same buying question in three engines"],
  ["bulletListItem", "Write down every business that is named"],
  ["bulletListItem", "Fix the most visible inconsistency first"],
  ["heading", "Where the gaps usually appear", 2],
  ["paragraph", "Google and ChatGPT rarely agree. About 40% of the questions we tested returned a different first answer on each surface, so check both. Decision Reconstruction shows the difference question by question."],
  ["paragraph", "Pick one question this week and run the three checks above. That page of notes is your baseline."],
];
const HE_UNITS: string[] = [
  "כשקונה שואל מנוע בינה מלאכותית במי לבטוח, התשובה נבנית ממקורות רבים ולא רק מאתר האינטרנט. בדגימה שלנו של 124 תשובות, אותם שלושה שמות חזרו **ברוב המקרים**.",
  "על מה מנועי בינה מלאכותית מסתכלים באמת",
  `עקביות חשובה יותר מנפח. פרופילים, ביקורות וסיקור עצמאי מלמדים את המודל מי העסק באמת. את השיטה המלאה אפשר לקרוא ב[דף המתודולוגיה שלנו](${LINK}).`,
  "שואלים את אותה שאלת רכישה בשלושה מנועים",
  "רושמים כל עסק שמוזכר",
  "מתקנים קודם את חוסר העקביות הבולט ביותר",
  "איפה בדרך כלל נוצרים הפערים",
  "Google ו-ChatGPT כמעט אף פעם לא מסכימים. בכ-40% מהשאלות שבדקנו התקבלה תשובה ראשונה שונה בכל משטח, ולכן כדאי לבדוק את שניהם. שחזור החלטה מראה את ההבדל שאלה אחר שאלה.",
  "בחרו השבוע שאלה אחת והריצו את שלוש הבדיקות שלמעלה. דף הרשימות הזה הוא נקודת הפתיחה שלכם.",
];
const HE_META = {
  title: "איך מנועי בינה מלאכותית מחליטים איזה עסק להמליץ עליו",
  excerpt: "מבט מעשי על הסיבות שבגללן מנועי בינה מלאכותית מזכירים עסקים מסוימים ומדלגים על אחרים, עם שלוש בדיקות שאפשר להריץ כבר השבוע.",
  category: "נראות בבינה מלאכותית",
  tags: ["נראות בבינה מלאכותית", "מוניטין", "סוכנויות"],
};

const source: SourcePost = {
  title: "How AI engines decide which business to recommend",
  excerpt: "A practical look at why AI engines name some businesses and skip others, with three checks you can run this week.",
  category: "AI visibility",
  tags: ["AI visibility", "reputation", "agencies"],
  blocks: [
    ...EN_UNITS.slice(0, 3).map(([t, m, l]) => mk(t, m, l)),
    image,
    ...EN_UNITS.slice(3).map(([t, m, l]) => mk(t, m, l)),
  ],
};

function heCandidate(texts: string[] = HE_UNITS, meta: Partial<TranslatedPost> = {}): TranslatedPost {
  return { ...HE_META, ...meta, blocks: applyTranslation(source.blocks, texts, "en", "he", allowed) };
}
const ctxEnHe: CheckContext = { from: "en", to: "he", glossary };
const kinds = (c: TranslatedPost, s: SourcePost = source, ctx = ctxEnHe) => checkTranslation(s, c, ctx).issues;
const has = (issues: ReturnType<typeof kinds>, severity: string, kind: string) => issues.some((i) => i.severity === severity && i.kind === kind);

/* -------------------------------------------------------------------------- */
/* Scripted model                                                             */
/* -------------------------------------------------------------------------- */

type Params = { system: string; messages: { content: string }[]; output_config?: { effort?: string; format?: { type?: string } }; max_tokens: number; model: string };
const unitsPayload = (texts: string[], meta = HE_META) => ({ ...meta, units: texts.map((text, i) => ({ i, text })) });
function scripted(script: { translate?: (Record<string, unknown> | Error)[]; review?: (Record<string, unknown> | Error)[]; clock?: { t: number; step: number } }) {
  const t = [...(script.translate ?? [])];
  const r = [...(script.review ?? [])];
  const log: { role: "translate" | "review"; params: Params }[] = [];
  const client = {
    messages: {
      create: async (params: Params) => {
        const role = params.system.includes("translation reviewer") ? "review" : "translate";
        log.push({ role, params });
        if (script.clock) script.clock.t += script.clock.step;
        const next = (role === "review" ? r : t).shift();
        if (!next) throw new Error(`unscripted ${role} call`);
        if (next instanceof Error) throw next;
        return { model: "fake", stop_reason: "end_turn", usage: { input_tokens: 100, output_tokens: 200 }, content: [{ type: "text", text: JSON.stringify(next) }] };
      },
    },
  } as unknown as Anthropic;
  return { client, log };
}
const opts: TranslateOptions = { from: "en", to: "he", model: "fake", glossary, sdk: Anthropic };
const badUnits = (fn: (u: string[]) => void) => {
  const u = [...HE_UNITS];
  fn(u);
  return u;
};

/* -------------------------------------------------------------------------- */
/* Offline suite                                                              */
/* -------------------------------------------------------------------------- */

const norm = (nodes: InlineNode[]) => {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.type === "link") out.push(`L(${n.href})[${n.content.map((c) => `${JSON.stringify(c.styles)}${c.text}`).join("|")}]`);
    else if (out.length && out[out.length - 1].startsWith(`T${JSON.stringify(n.styles)}`)) out[out.length - 1] += n.text;
    else out.push(`T${JSON.stringify(n.styles)}${n.text}`);
  }
  return out.join("~");
};

async function offline() {
  console.log("\nInline markup round trip");
  const rich = [
    { type: "text", text: "Use ", styles: {} },
    { type: "text", text: "bold", styles: { bold: true } },
    { type: "text", text: " and ", styles: {} },
    { type: "text", text: "both", styles: { bold: true, italic: true } },
    { type: "text", text: " plus ", styles: {} },
    { type: "text", text: "code()", styles: { code: true } },
    { type: "text", text: " and 5 * 3 = 15, snake_case, a [bracket] and a \\ backslash ", styles: {} },
    { type: "link", href: "https://ex.com/a", content: [{ type: "text", text: "a link", styles: { bold: true } }] },
    { type: "text", text: " end.", styles: { underline: true, strike: true } },
  ];
  const markup = inlineToMarkup(rich);
  const back = markupToInline(markup, new Set(["https://ex.com/a"])).nodes;
  check("mixed styles, link, escapes and literals survive a round trip", norm(back) === norm(rich as InlineNode[]), `\n${norm(back)}\n${norm(rich as InlineNode[])}`);
  const he = [{ type: "text", text: "שלום, GeoRepute (בטא) 2026-09-24.", styles: {} }];
  check("Hebrew with Latin names, digits and parentheses survives", norm(markupToInline(inlineToMarkup(he), NO_LINKS).nodes) === norm(he as InlineNode[]));
  check("a bare string content is handled", inlineToMarkup("plain *text*") === "plain \\*text\\*");
  check("a disallowed link URL is dropped but its label is kept", norm(markupToInline("see [here](https://evil.example/x) now", allowed).nodes) === norm([{ type: "text", text: "see here now", styles: {} }]));
  check("an unbalanced marker never throws and is reported", markupToInline("oops **bold never closed", NO_LINKS).unbalanced === true);
  check("em dashes from the model are removed", !markupToInline(`a ${EM} b`, NO_LINKS).nodes.some((n) => n.type === "text" && n.text.includes(EM)));
  check("invisible bidi characters are removed", norm(markupToInline("\u200Fשלום\u200E", NO_LINKS).nodes) === norm([{ type: "text", text: "שלום", styles: {} }]));
  check("code text keeps angle brackets and backticks logic", markupToInline("`<div>`", NO_LINKS).nodes.some((n) => n.type === "text" && n.text === "<div>" && n.styles.code === true));

  console.log("\nUnits and applying a translation");
  const units = collectUnits(source.blocks);
  check("nine text units are found; the image is passed through", units.length === 9 && !units.some((u) => u.type === "image"));
  check("units carry their markup and heading level", units[1].level === 2 && units[2].markup.includes(`](${LINK})`));
  const before = JSON.stringify(source.blocks);
  const cand = heCandidate();
  check("the source blocks are never mutated", JSON.stringify(source.blocks) === before);
  check("block ids are dropped for the new post", !JSON.stringify(cand.blocks).includes('"id"'));
  check("left alignment is reset when the text direction flips", !JSON.stringify(cand.blocks).includes("textAlignment"));
  check("heading levels and the image block are preserved", cand.blocks.some((b) => b.type === "image" && (b.props as { url: string }).url === "https://cdn.example.com/a.png") && cand.blocks.filter((b) => b.type === "heading").every((b) => (b.props as { level: number }).level === 2));
  const nested: TranslatableBlock[] = [{ type: "bulletListItem", content: "parent", children: [{ type: "bulletListItem", content: "child", children: [] }] }];
  const nestedOut = applyTranslation(nested, ["אב", "בן"], "en", "he", NO_LINKS);
  check("nested list items are translated in order", JSON.stringify(nestedOut).includes("אב") && JSON.stringify(nestedOut.at(0)?.children).includes("בן"));

  console.log("\nA correct translation passes every check");
  const good = kinds(heCandidate());
  check("no critical or major issues on the hand-checked Hebrew", !good.some((i) => i.severity !== "minor"), JSON.stringify(good.filter((i) => i.severity !== "minor")));
  const ratio = checkTranslation(source, heCandidate(), ctxEnHe);
  check("the report lists what was checked", ratio.checks.length >= 6);
  const reverseSource: SourcePost = { ...HE_META, blocks: heCandidate().blocks };
  const backToEn: TranslatedPost = { ...source, blocks: applyTranslation(reverseSource.blocks, EN_UNITS.map(([, m]) => m), "he", "en", allowed) };
  const reverse = kinds(backToEn, reverseSource, { from: "he", to: "en", glossary });
  check("the reverse direction (Hebrew to English) passes on the same pair", !reverse.some((i) => i.severity !== "minor"), JSON.stringify(reverse.filter((i) => i.severity !== "minor")));

  console.log("\nCorrupted translations are caught");
  check("a changed number is critical", has(kinds(heCandidate(badUnits((u) => (u[0] = u[0].replace("124", "142"))))), "critical", "number"));
  check("a dropped percentage is critical", has(kinds(heCandidate(badUnits((u) => (u[7] = u[7].replace("בכ-40%", "בחלק"))))), "critical", "number"));
  check("a changed link URL is critical", has(kinds(heCandidate(badUnits((u) => (u[2] = u[2].replace(LINK, "https://evil.example/x"))))), "critical", "link"));
  check("a removed link is critical", has(kinds(heCandidate(badUnits((u) => (u[2] = u[2].replace(/\[|\]\([^)]*\)/g, ""))))), "critical", "link"));
  const dropped = heCandidate();
  dropped.blocks.splice(4, 1);
  check("a dropped block is critical", has(kinds(dropped), "critical", "structure"));
  const retyped = heCandidate();
  retyped.blocks[0].type = "heading";
  check("a paragraph turned into a heading is critical", has(kinds(retyped), "critical", "structure"));
  check("a dropped brand name is major", has(kinds(heCandidate(badUnits((u) => (u[7] = u[7].replace("ChatGPT", "צ'אט"))))), "major", "terminology"));
  check("wrong site terminology is major", has(kinds(heCandidate(badUnits((u) => (u[7] = u[7].replace("שחזור החלטה", "בנייה מחדש של החלטה"))))), "major", "terminology"));
  const enLeft = heCandidate(badUnits((u) => (u[7] = "Google and ChatGPT rarely agree, so you should always check both surfaces before you trust one of them alone in your reports.")));
  check("a paragraph left in English is major", has(kinds(enLeft), "major", "untranslated") || has(kinds(enLeft), "critical", "number"));
  check("a badly shortened paragraph is flagged", kinds(heCandidate(badUnits((u) => (u[8] = "בחרו."))), source).some((i) => i.field === "unit:8" && i.severity !== "minor"));
  const allEnglish = heCandidate(EN_UNITS.map(([, m]) => m), { title: source.title, excerpt: source.excerpt, category: source.category });
  check("a whole translation left in English is critical (language)", has(kinds(allEnglish), "critical", "language"));
  check("an empty unit is critical", has(kinds(heCandidate(badUnits((u) => (u[3] = "")))), "critical", "omission"));
  check("missing tags are major", has(kinds(heCandidate(HE_UNITS, { tags: [] })), "major", "omission"));
  check("a changed number in the title is critical", has(kinds(heCandidate(HE_UNITS, { title: "5 דרכים: איך מנועי בינה מלאכותית מחליטים" })), "critical", "number"));
  check("every issue points at a source excerpt a person can find", kinds(heCandidate(badUnits((u) => (u[0] = u[0].replace("124", "142"))))).every((i) => i.source || i.field === "document"));

  console.log("\nTranslate, review and revise (scripted model)");
  const okT = unitsPayload(HE_UNITS);
  const clean = scripted({ translate: [okT], review: [{ issues: [] }] });
  const r1 = await translatePost(clean.client, source, opts);
  check("a faithful translation is verified with two calls", r1.report.status === "verified" && r1.report.calls === 2 && r1.report.fixed === 0);
  check("the report says an independent review ran", r1.report.checks.some((c) => c.includes("independent")));
  check("usage is totalled across calls", r1.report.usage.inputTokens === 200 && r1.report.usage.outputTokens === 400);

  const wrongNumber = unitsPayload(badUnits((u) => (u[0] = u[0].replace("124", "142"))));
  const revise = scripted({ translate: [wrongNumber, okT], review: [{ issues: [] }, { issues: [] }] });
  const r2 = await translatePost(revise.client, source, opts);
  check("a wrong number is corrected automatically, then verified", r2.report.status === "verified" && r2.report.fixed >= 1 && r2.report.calls === 4, JSON.stringify(r2.report.issues));
  check("the correction call receives the problems and the previous translation", revise.log[2].params.messages[0].content.includes("<problems>") && revise.log[2].params.messages[0].content.includes("142"));
  check("the corrected text is what is returned", JSON.stringify(r2.translated.blocks).includes("124") && !JSON.stringify(r2.translated.blocks).includes("142"));

  const reviewerFlag = { issues: [{ field: "unit:0", severity: "major", kind: "negation", note: "The source hedges ('most of the time') and the translation states it as certain.", suggestion: "ברוב המקרים" }] };
  const stuck = scripted({ translate: [okT, okT], review: [reviewerFlag, reviewerFlag] });
  const r3 = await translatePost(stuck.client, source, opts);
  check("a reviewer finding that cannot be resolved leaves the post needing review", r3.report.status === "needs_review" && r3.report.issues.some((i) => i.origin === "review" && i.kind === "negation"));
  check("the unresolved issue is shown, not hidden", r3.report.issues.some((i) => i.field === "unit:0" && Boolean(i.source)));

  const minorOnly = scripted({ translate: [okT], review: [{ issues: [{ field: "unit:2", severity: "minor", kind: "tone", note: "Slightly formal.", suggestion: "" }] }] });
  const r4 = await translatePost(minorOnly.client, source, opts);
  check("minor notes do not block a verified result and trigger no revision", r4.report.status === "verified" && r4.report.calls === 2 && r4.report.issues.length === 1);

  const dropUnit = { ...okT, units: okT.units.slice(0, 5) };
  const retry = scripted({ translate: [dropUnit, okT], review: [{ issues: [] }] });
  const r5 = await translatePost(retry.client, source, opts);
  check("a response missing units is retried once with feedback", r5.report.status === "verified" && retry.log[1].params.messages[0].content.includes("missing"));
  const alwaysDrops = scripted({ translate: [dropUnit, dropUnit] });
  await translatePost(alwaysDrops.client, source, opts).then(() => check("persistently incomplete output is an error", false), (e) => check("persistently incomplete output is an error", e instanceof GenerationError && e.code === "invalid_output"));

  const clock = { t: 0, step: 0 };
  const slow = scripted({ translate: [okT], review: [{ issues: [] }], clock: { t: 0, step: 0 } });
  const r6 = await translatePost(slow.client, source, { ...opts, budgetMs: 60_000, clock: () => clock.t });
  check("with no time left the review is skipped, reported, and the result needs review", r6.report.reviewSkipped && r6.report.status === "needs_review" && r6.report.issues.some((i) => i.kind === "review"));

  const limited = scripted({ translate: [Anthropic.APIError.generate(429, { type: "error", error: { type: "rate_limit_error", message: "SECRET sk-ant" } }, "SECRET sk-ant", new Headers({ "retry-after": "20" }))] });
  await translatePost(limited.client, source, opts).then(() => check("a rate limit surfaces as a friendly error", false), (e) => check("a rate limit surfaces as a friendly error without leaking details", e instanceof GenerationError && e.code === "rate_limited" && !/SECRET|sk-ant/.test(e.message)));

  const longSource: SourcePost = { ...source, blocks: [mk("paragraph", "word ".repeat(MAX_TRANSLATION_WORDS + 50))] };
  await translatePost(scripted({}).client, longSource, opts).then(() => check("an over-long post is refused up front", false), (e) => check("an over-long post is refused up front, before any API call", e instanceof GenerationError && e.code === "invalid_input"));
  await translatePost(scripted({}).client, { ...source, blocks: [image] }, opts).then(() => check("a post with no text is refused", false), (e) => check("a post with no text is refused", e instanceof GenerationError && e.code === "invalid_input"));
  await translatePost(scripted({}).client, source, { ...opts, to: "en" }).then(() => check("same-language translation is refused", false), (e) => check("same-language translation is refused", e instanceof GenerationError && e.code === "invalid_input"));

  const first = clean.log[0].params;
  check("the request asks for structured JSON at high effort", first.output_config?.format?.type === "json_schema" && first.output_config?.effort === "high");
  check("the system prompt carries the glossary and protected names", first.system.includes("שחזור החלטה") && first.system.includes("GeoRepute") && first.system.includes("Decision Reconstruction"));
  check("the source travels only inside <source> as data", first.messages[0].content.startsWith("<source") && first.messages[0].content.includes("124"));
  check("the reviewer is told to be independent", clean.log[1].params.system.includes("You did not write this translation"));

  console.log("\nGlossary");
  check("the glossary is derived from the site's own Hebrew nav", glossary.some((g) => g.en === "Decision Reconstruction" && g.he === "שחזור החלטה" && g.strict));
  check("site-writing rules for Hebrew only apply English to Hebrew", glossary.filter((g) => g.en === "AI" || g.en === "artificial intelligence").every((g) => g.dir === "en-he"));

  console.log("\nRendering the translated blocks through the public renderer");
  const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks: heCandidate().blocks as ContentBlock[] }));
  check("headings, lists, bold and the link render", /<h2>/.test(html) && /<ul>/.test(html) && /<strong>/.test(html) && html.includes(`href="${LINK}"`));
  check("the rendered link text is translated and the URL is unchanged", html.includes("דף המתודולוגיה שלנו") && linksIn(inlineToMarkup(collectUnits(heCandidate().blocks)[2].markup ? collectUnits(heCandidate().blocks)[2].block.content : "")).join() === LINK);
  check("no markup leaks into the visible text", !/\*\*|__|~~|undefined/.test(html.replace(/<[^>]+>/g, "")));
}

/* -------------------------------------------------------------------------- */
/* Live round trip                                                            */
/* -------------------------------------------------------------------------- */

async function live() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    console.log("\nLive round trip skipped: ANTHROPIC_API_KEY is not set (add it to .env.local, then run `npm run translate:check`).");
    return;
  }
  const model = process.env.ANTHROPIC_TRANSLATION_MODEL?.trim() || process.env.ANTHROPIC_BLOG_MODEL?.trim() || "claude-opus-5";
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  const client = new Anthropic({
    apiKey: key,
    ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}),
    timeout: 110_000,
    maxRetries: 1,
  });
  console.log(`\nLive round trip with ${model}: English to Hebrew, then Hebrew back to English`);
  mkdirSync("scripts/.output", { recursive: true });
  const report: unknown[] = [];

  const toHe = await translatePost(client, source, { ...opts, model });
  console.log(`  en -> he: ${toHe.report.status}, ${toHe.report.calls} calls, ${toHe.report.seconds}s, fixed ${toHe.report.fixed}`);
  console.log(`    title: ${toHe.translated.title}`);
  toHe.report.issues.forEach((i) => console.log(`    [${i.severity}] ${i.field}: ${i.note}`));
  check("en -> he: no unresolved serious problems", toHe.report.status === "verified");
  report.push({ direction: "en-he", result: toHe });

  const heSource: SourcePost = { ...toHe.translated };
  const toEn = await translatePost(client, heSource, { ...opts, from: "he", to: "en", model });
  console.log(`  he -> en: ${toEn.report.status}, ${toEn.report.calls} calls, ${toEn.report.seconds}s, fixed ${toEn.report.fixed}`);
  console.log(`    title: ${toEn.translated.title}`);
  toEn.report.issues.forEach((i) => console.log(`    [${i.severity}] ${i.field}: ${i.note}`));
  check("he -> en: no unresolved serious problems", toEn.report.status === "verified");
  // A round trip cannot prove accuracy, but it must not lose numbers or links.
  const back = checkTranslation(source, { ...toEn.translated }, { from: "en", to: "en", glossary: [] }).issues.filter((i) => i.kind === "number" || i.kind === "link" || i.kind === "structure");
  check("the round trip keeps every number, link and block", back.length === 0, JSON.stringify(back));
  report.push({ direction: "he-en", result: toEn });

  const file = `scripts/.output/translation-check-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nFull results written to ${file} for human review.`);
}

async function main() {
  console.log("Offline suite");
  await offline();
  if (!args.has("--offline")) await live();
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
}
main();
