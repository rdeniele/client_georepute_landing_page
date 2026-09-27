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
import { BLOG_LANGUAGES, GenerationError, type BlogLanguage } from "@/lib/blog/generation";
import { buildGlossary } from "@/lib/blog/glossary";
import { POST_LOCALES, blogPath, isPostLocale, toPostLocale } from "@/lib/utils/postLocale";
import {
  MAX_TRANSLATION_WORDS,
  pairTerms,
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
  const entry = (en: string) => glossary.find((g) => g.terms.en === en);
  const dr = entry("Decision Reconstruction");
  check("the glossary is derived from the site's own nav in every language", Boolean(dr) && dr!.strict && dr!.terms.he === "שחזור החלטה" && POST_LOCALES.every((l) => Boolean(dr!.terms[l])));
  check("site-writing rules for Hebrew only apply English to Hebrew", glossary.filter((g) => g.terms.en === "AI" || g.terms.en === "artificial intelligence").every((g) => g.from?.join() === "en" && g.to?.join() === "he"));
  check("a rule that applies to one direction is skipped in the others", pairTerms(entry("AI")!, "he", "en")[0] === null && pairTerms(entry("AI")!, "en", "fr")[0] === null && pairTerms(entry("AI")!, "en", "he")[0] === "AI");
  check("a name that is identical in every language is not a translation rule", !glossary.some((g) => g.terms.en === "Blog"));


  console.log("\nEvery language pair");
  const L = "https://www.georepute.ai/en/methodology";
  const lAllowed = new Set([L]);
  type Row = [string, string, number?];
  const mini = (units: Row[]): TranslatableBlock[] => units.map(([t, m, lv]) => ({ type: t, ...(lv ? { props: { level: lv } } : {}), content: markupToInline(m, lAllowed).nodes, children: [] }));
  type Mini = { title: string; excerpt: string; category: string; tags: string[]; units: string[] };
  const MINI: Record<BlogLanguage, Mini> = {
    en: {
      title: "Why consistency beats volume in AI answers",
      excerpt: "AI engines trust businesses that describe themselves the same way everywhere. Here is how to check yours in one afternoon.",
      category: "AI visibility",
      tags: ["AI visibility", "reputation"],
      units: [
        "When 3 different AI engines answer the same question, they rely on the sources they can verify. In our sample of 124 answers, **consistent profiles** were named far more often.",
        "Check your own profiles",
        `Compare how Google, ChatGPT and your own website describe the business. Fix the biggest gap first and read our [method](${L}) for the details.`,
      ],
    },
    he: {
      title: "למה עקביות מנצחת נפח בתשובות של בינה מלאכותית",
      excerpt: "מנועי בינה מלאכותית סומכים על עסקים שמתארים את עצמם באותה צורה בכל מקום. כך בודקים את שלכם בצהריים אחד.",
      category: "נראות בבינה מלאכותית",
      tags: ["נראות בבינה מלאכותית", "מוניטין"],
      units: [
        "כש-3 מנועי בינה מלאכותית שונים עונים על אותה שאלה, הם נשענים על המקורות שהם יכולים לאמת. בדגימה שלנו של 124 תשובות, **פרופילים עקביים** הוזכרו הרבה יותר.",
        "בדקו את הפרופילים שלכם",
        `השוו איך Google, ChatGPT והאתר שלכם מתארים את העסק. תקנו קודם את הפער הגדול ביותר וקראו את [השיטה שלנו](${L}) לפרטים.`,
      ],
    },
    ar: {
      title: "لماذا يتفوق الاتساق على الحجم في إجابات الذكاء الاصطناعي",
      excerpt: "تثق محركات الذكاء الاصطناعي بالشركات التي تصف نفسها بالطريقة نفسها في كل مكان. إليكم كيف تتحققون من شركتكم في عصر يوم واحد.",
      category: "الظهور في الذكاء الاصطناعي",
      tags: ["الظهور في الذكاء الاصطناعي", "السمعة"],
      units: [
        "عندما تجيب 3 محركات ذكاء اصطناعي مختلفة عن السؤال نفسه، فإنها تعتمد على المصادر التي تستطيع التحقق منها. في عيّنتنا المؤلفة من 124 إجابة، ذُكرت **الملفات المتسقة** أكثر بكثير.",
        "راجعوا ملفاتكم بأنفسكم",
        `قارنوا كيف يصف Google وChatGPT وموقعكم الخاص الشركة. أصلحوا أكبر فجوة أولًا واقرؤوا [منهجيتنا](${L}) لمعرفة التفاصيل.`,
      ],
    },
    ru: {
      title: "Почему последовательность важнее объёма в ответах ИИ",
      excerpt: "Движки ИИ доверяют компаниям, которые одинаково описывают себя везде. Вот как проверить свою компанию за один день.",
      category: "Видимость в ИИ",
      tags: ["Видимость в ИИ", "репутация"],
      units: [
        "Когда 3 разных движка ИИ отвечают на один и тот же вопрос, они опираются на источники, которые могут проверить. В нашей выборке из 124 ответов **согласованные профили** упоминались гораздо чаще.",
        "Проверьте свои профили",
        `Сравните, как Google, ChatGPT и ваш собственный сайт описывают компанию. Сначала устраните самый большой разрыв и прочитайте наш [метод](${L}) с подробностями.`,
      ],
    },
    fr: {
      title: "Pourquoi la cohérence l'emporte sur le volume dans les réponses de l'IA",
      excerpt: "Les moteurs d'IA font confiance aux entreprises qui se décrivent de la même manière partout. Voici comment vérifier la vôtre en un après-midi.",
      category: "Visibilité IA",
      tags: ["Visibilité IA", "réputation"],
      units: [
        "Lorsque 3 moteurs d'IA différents répondent à la même question, ils s'appuient sur les sources qu'ils peuvent vérifier. Dans notre échantillon de 124 réponses, les **profils cohérents** ont été cités bien plus souvent.",
        "Vérifiez vos propres profils",
        `Comparez la façon dont Google, ChatGPT et votre propre site décrivent l'entreprise. Corrigez d'abord l'écart le plus important et lisez notre [méthode](${L}) pour les détails.`,
      ],
    },
    es: {
      title: "Por qué la coherencia supera al volumen en las respuestas de la IA",
      excerpt: "Los motores de IA confían en las empresas que se describen de la misma manera en todas partes. Así puedes comprobar la tuya en una tarde.",
      category: "Visibilidad en IA",
      tags: ["Visibilidad en IA", "reputación"],
      units: [
        "Cuando 3 motores de IA distintos responden a la misma pregunta, se basan en las fuentes que pueden verificar. En nuestra muestra de 124 respuestas, los **perfiles coherentes** se mencionaron mucho más a menudo.",
        "Revisa tus propios perfiles",
        `Compara cómo describen el negocio Google, ChatGPT y tu propio sitio web. Corrige primero la mayor diferencia y lee nuestro [método](${L}) para ver los detalles.`,
      ],
    },
    pt: {
      title: "Por que a consistência vale mais do que o volume nas respostas da IA",
      excerpt: "Os mecanismos de IA confiam em empresas que se descrevem da mesma forma em todos os lugares. Veja como verificar a sua em uma tarde.",
      category: "Visibilidade em IA",
      tags: ["Visibilidade em IA", "reputação"],
      units: [
        "Quando 3 mecanismos de IA diferentes respondem à mesma pergunta, eles se baseiam nas fontes que conseguem verificar. Em nossa amostra de 124 respostas, os **perfis consistentes** foram citados com muito mais frequência.",
        "Confira os seus próprios perfis",
        `Compare como o Google, o ChatGPT e o seu próprio site descrevem a empresa. Corrija primeiro a maior lacuna e leia o nosso [método](${L}) para ver os detalhes.`,
      ],
    },
  };
  const shape: [string, number?][] = [["paragraph"], ["heading", 2], ["paragraph"]];
  const rows = (lang: BlogLanguage, edit: (m: string, i: number) => string = (m) => m): Row[] => MINI[lang].units.map((m, i) => [shape[i][0], edit(m, i), shape[i][1]]);
  const miniPost = (lang: BlogLanguage, blocks?: TranslatableBlock[]): SourcePost => ({
    title: MINI[lang].title,
    excerpt: MINI[lang].excerpt,
    category: MINI[lang].category,
    tags: MINI[lang].tags,
    blocks: blocks ?? mini(rows(lang)),
  });
  const mctx = (from: BlogLanguage, to: BlogLanguage): CheckContext => ({ from, to, glossary });
  const serious = (issues: ReturnType<typeof kinds>) => issues.filter((i) => i.severity !== "minor");
  const langs = POST_LOCALES as readonly BlogLanguage[];
  const pairsList = langs.flatMap((from) => langs.filter((to) => to !== from).map((to) => [from, to] as [BlogLanguage, BlogLanguage]));

  const notClean = pairsList.map(([from, to]) => [from, to, serious(kinds(miniPost(to), miniPost(from), mctx(from, to)))] as const).filter(([, , f]) => f.length);
  check(`a faithful translation passes all ${pairsList.length} language pairs`, notClean.length === 0, notClean.map(([f, t, x]) => `${f}->${t}: ${x.map((i) => `${i.kind}: ${i.note}`).join("; ")}`).join(" | "));

  const numMiss = pairsList.filter(([from, to]) => !has(kinds(miniPost(to, mini(rows(to, (m) => m.replace("124", "142")))), miniPost(from), mctx(from, to)), "critical", "number"));
  check("a changed number is caught in every language pair", numMiss.length === 0, numMiss.join(" | "));
  const linkMiss = pairsList.filter(([from, to]) => !has(kinds(miniPost(to, mini(rows(to, (m) => m.replace(/\[([^\]]+)\]\([^)]*\)/, "$1")))), miniPost(from), mctx(from, to)), "critical", "link"));
  check("a removed link is caught in every language pair", linkMiss.length === 0, linkMiss.join(" | "));

  // The translation is the untouched source text, as if the model had skipped it.
  const leftMiss = ([["he", "ar"], ["ar", "he"], ["ru", "he"], ["he", "ru"], ["ru", "ar"], ["ar", "ru"], ["he", "fr"], ["ar", "es"], ["ru", "pt"], ["fr", "es"], ["es", "pt"], ["pt", "fr"], ["fr", "en"], ["en", "ru"], ["en", "ar"], ["en", "fr"]] as [BlogLanguage, BlogLanguage][]).filter(([from, to]) => {
    const skipped = miniPost(to, mini(rows(from)));
    return !kinds(skipped, miniPost(from), mctx(from, to)).some((i) => i.severity !== "minor" && (i.kind === "untranslated" || i.kind === "language"));
  });
  check("text left in the source language is caught, across scripts and between Latin-script languages", leftMiss.length === 0, leftMiss.join(" | "));

  const esAsFr = { ...miniPost("fr", mini(rows("es"))), title: MINI.es.title, excerpt: MINI.es.excerpt };
  check("Spanish passed off as French is caught (language)", has(kinds(esAsFr, miniPost("en"), mctx("en", "fr")), "critical", "language"));
  const heAsAr = { ...miniPost("ar", mini(rows("he"))), title: MINI.he.title, excerpt: MINI.he.excerpt };
  check("Hebrew passed off as Arabic is caught (language)", has(kinds(heAsAr, miniPost("he"), mctx("he", "ar")), "critical", "language"));
  const ruAsHe = { ...miniPost("he", mini(rows("ru"))), title: MINI.ru.title, excerpt: MINI.ru.excerpt };
  check("Russian passed off as Hebrew is caught (language)", has(kinds(ruAsHe, miniPost("ru"), mctx("ru", "he")), "critical", "language"));

  // Site terminology in every direction, taken from the site's own nav.
  const term = entry("Decision Reconstruction")!;
  const withTerm = (lang: BlogLanguage, extra: string): SourcePost => miniPost(lang, mini([["paragraph", `${MINI[lang].units[0]} ${extra}`]]));
  const termBad = pairsList.filter(([from, to]) => {
    const src = withTerm(from, term.terms[from]!);
    const hit = kinds(withTerm(to, term.terms[to]!), src, mctx(from, to)).filter((i) => i.kind === "terminology");
    const miss = kinds(withTerm(to, "and so on"), src, mctx(from, to)).filter((i) => i.kind === "terminology" && i.severity === "major");
    return hit.length > 0 || miss.length === 0;
  });
  check("the site's own term for a feature is enforced in every direction", termBad.length === 0, termBad.join(" | "));
  const sac = entry("Strategic Action Center")!;
  const curly = kinds(withTerm("fr", sac.terms.fr!.replace("’", "'")), withTerm("en", "Strategic Action Center"), mctx("en", "fr")).filter((i) => i.kind === "terminology");
  check("curly and straight apostrophes count as the same in a French site term", curly.length === 0, JSON.stringify(curly));

  // Scripted end-to-end runs for a sample of pairs, including several that never touch English.
  for (const [from, to] of [["fr", "es"], ["en", "ar"], ["ru", "he"], ["pt", "en"], ["ar", "fr"]] as [BlogLanguage, BlogLanguage][]) {
    const fake = scripted({
      translate: [{ title: MINI[to].title, excerpt: MINI[to].excerpt, category: MINI[to].category, tags: MINI[to].tags, units: MINI[to].units.map((text, i) => ({ i, text })) }],
      review: [{ issues: [] }],
    });
    const res = await translatePost(fake.client, miniPost(from), { ...opts, from, to });
    check(`${from} -> ${to} is verified end to end (scripted model)`, res.report.status === "verified" && res.report.calls === 2, JSON.stringify(res.report.issues));
    const both = (text: string) => text.includes(BLOG_LANGUAGES[from].name) && text.includes(BLOG_LANGUAGES[to].name);
    const sys = fake.log[0].params.system;
    check(`${from} -> ${to}: both prompts name the two languages and use that pair's site terms`, both(sys) && both(fake.log[1].params.system) && sys.includes(`${term.terms[from]} => ${term.terms[to]}`));
    check(`${from} -> ${to}: the terms are never fed backwards`, !sys.includes(`${term.terms[to]} => ${term.terms[from]}`));
  }
  await translatePost(scripted({}).client, miniPost("he"), { ...opts, from: "he", to: "he" }).then(
    () => check("the same language on both sides is refused", false),
    (e) => check("the same language on both sides is refused", e instanceof GenerationError && e.code === "invalid_input"),
  );
  const enHe = scripted({ translate: [{ ...MINI.he, units: MINI.he.units.map((text, i) => ({ i, text })) }], review: [{ issues: [] }] });
  await translatePost(enHe.client, miniPost("en"), { ...opts, from: "en", to: "he" });
  check("the Hebrew-only AI rule is given to the model when translating English into Hebrew", enHe.log[0].params.system.includes("AI => בינה מלאכותית"));
  const frEs = scripted({ translate: [{ ...MINI.es, units: MINI.es.units.map((text, i) => ({ i, text })) }], review: [{ issues: [] }] });
  await translatePost(frEs.client, miniPost("fr"), { ...opts, from: "fr", to: "es" });
  check("and it is not given for other pairs", !frEs.log[0].params.system.includes("בינה מלאכותית"));

  console.log("\nBlog language plumbing");
  check("all seven site languages are valid post languages", langs.length === 7 && langs.every((l) => isPostLocale(l) && Boolean(BLOG_LANGUAGES[l])));
  check("an unknown or missing language falls back to English", toPostLocale("de") === "en" && toPostLocale(undefined) === "en" && toPostLocale("fr") === "fr");
  check("public paths carry ?lang= for every language except English", blogPath("en", "a") === "/blog/a" && blogPath("ar", "a") === "/blog/a?lang=ar" && blogPath("pt") === "/blog?lang=pt" && blogPath("ru", undefined, { category: "X" }) === "/blog?lang=ru&category=X");
  check("Hebrew and Arabic are right to left, the others left to right", (["he", "ar"] as const).every((l) => BLOG_LANGUAGES[l].dir === "rtl") && (["en", "ru", "fr", "es", "pt"] as const).every((l) => BLOG_LANGUAGES[l].dir === "ltr"));

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
  console.log(`\nLive round trip with ${model}: English to Hebrew and back, then English to French to Arabic to Russian to English`);
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

  // The site speaks seven languages, so also chain through languages that are neither English nor Hebrew:
  // English to French, French to Arabic, Arabic to Russian, Russian back to English. Every hop starts from the previous output.
  const chain: BlogLanguage[] = ["fr", "ar", "ru", "en"];
  let current: SourcePost = source;
  let currentLang: BlogLanguage = "en";
  for (const next of chain) {
    const hop = await translatePost(client, current, { ...opts, from: currentLang, to: next, model });
    console.log(`  ${currentLang} -> ${next}: ${hop.report.status}, ${hop.report.calls} calls, ${hop.report.seconds}s, fixed ${hop.report.fixed}`);
    console.log(`    title: ${hop.translated.title}`);
    hop.report.issues.forEach((i) => console.log(`    [${i.severity}] ${i.field}: ${i.note}`));
    check(`${currentLang} -> ${next}: no unresolved serious problems`, hop.report.status === "verified");
    report.push({ direction: `${currentLang}-${next}`, result: hop });
    current = { ...hop.translated };
    currentLang = next;
  }
  const loop = checkTranslation(source, { ...current }, { from: "en", to: "en", glossary: [] }).issues.filter((i) => i.kind === "number" || i.kind === "link" || i.kind === "structure");
  check("four hops through four scripts keep every number, link and block", loop.length === 0, JSON.stringify(loop));

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
