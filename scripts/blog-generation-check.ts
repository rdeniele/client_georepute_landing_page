/**
 * Blog generation checks.
 *
 *   npm run blog:check            offline suite, plus live runs if ANTHROPIC_API_KEY is set
 *   npm run blog:check -- --offline   offline suite only (no API calls, no cost)
 *   npm run blog:check -- --full      live matrix incl. long articles, Spanish, Arabic, Russian
 *
 * Offline: input/output validation, formatting hygiene, language detection,
 * error mapping, retry behaviour, and rendering through the real public
 * BlockRenderer. Live: real Claude calls in English, Hebrew, French (and more
 * with --full), each verified and written to scripts/.output/ for human review.
 */
import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import type { ContentBlock } from "@/types/blocks";
import {
  BLOG_LENGTHS,
  GenerationError,
  cleanText,
  generateBlogDraft,
  languageProblem,
  mapApiError,
  parseInline,
  validateDraft,
  validateInput,
  type BlogGenerationInput,
  type BlogLanguage,
  type BlogLength,
} from "@/lib/blog/generation";

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
async function throwsCode(fn: () => unknown, code: string) {
  try {
    await fn();
    return `no error, expected ${code}`;
  } catch (e) {
    return e instanceof GenerationError && e.code === code ? "" : `got ${e instanceof GenerationError ? e.code : String(e)}, expected ${code}`;
  }
}

/* -------------------------------------------------------------------------- */
/* Fixtures: a plausible model response, built per language                   */
/* -------------------------------------------------------------------------- */

const BANK: Record<"en" | "he" | "fr", { intro: string; head: string[]; sentences: string[]; items: string[]; close: string }> = {
  en: {
    intro: "Most businesses still measure visibility by their Google position, but buyers now also ask AI engines who to trust, and the answer often names someone else.",
    head: ["Why rankings are no longer the whole picture", "What AI engines actually look at", "How to check what they say about you", "Where the gaps usually appear", "A simple plan for the next month", "What to do next"],
    sentences: [
      "AI engines assemble answers from many sources, so a strong website alone does not guarantee a mention.",
      "Consistency across profiles, reviews and independent coverage tells the model who a business really is.",
      "Start by asking the same buying question in several engines and writing down which names come back.",
      "Compare those names with the competitors you already track, and note where your business is missing.",
      "Small, specific fixes usually beat large rewrites, because they are easier to measure and repeat.",
      "Review the results every few weeks, since answers change as sources and models are updated.",
    ],
    items: ["Ask the buying question in three engines", "Record every business that is named", "Fix the most visible inconsistency first"],
    close: "Pick one buying question this week, ask it in three engines, and write down what comes back. That single page of notes is your baseline.",
  },
  he: {
    intro: "רוב העסקים עדיין מודדים נראות לפי המיקום שלהם בגוגל, אבל לקוחות שואלים היום גם מנועי בינה מלאכותית במי לבחור, והתשובה נוקבת לא פעם בשם של מישהו אחר.",
    head: ["למה דירוג בגוגל כבר לא מספר את כל הסיפור", "על מה מנועי בינה מלאכותית מסתכלים באמת", "איך בודקים מה אומרים עליכם", "איפה בדרך כלל נוצרים הפערים", "תוכנית פשוטה לחודש הקרוב", "מה עושים עכשיו"],
    sentences: [
      "מנועי בינה מלאכותית מרכיבים תשובות ממקורות רבים, ולכן אתר חזק לבדו אינו מבטיח שהעסק יוזכר.",
      "עקביות בין פרופילים, ביקורות וסיקור עצמאי מלמדת את המודל מי העסק באמת.",
      "כדאי להתחיל בשאלה זהה על החלטת רכישה בכמה מנועים, ולרשום אילו שמות חוזרים בתשובות.",
      "אחר כך משווים את השמות למתחרים שכבר עוקבים אחריהם, ומסמנים איפה העסק חסר.",
      "תיקונים קטנים וממוקדים מנצחים בדרך כלל שכתוב גדול, כי קל יותר למדוד אותם ולחזור עליהם.",
      "בודקים מחדש כל כמה שבועות, כי התשובות משתנות עם עדכון המקורות והמודלים.",
    ],
    items: ["שואלים את שאלת הרכישה בשלושה מנועים", "רושמים כל עסק שמוזכר", "מתקנים קודם את חוסר העקביות הבולט ביותר"],
    close: "בחרו השבוע שאלת רכישה אחת, שאלו אותה בשלושה מנועים ורשמו מה חוזר. דף הרשימות הזה הוא נקודת הפתיחה שלכם.",
  },
  fr: {
    intro: "La plupart des entreprises mesurent encore leur visibilité par leur position sur Google, mais les acheteurs demandent aussi aux moteurs d'IA qui choisir, et la réponse cite souvent quelqu'un d'autre.",
    head: ["Pourquoi le classement ne dit plus tout", "Ce que regardent réellement les moteurs d'IA", "Comment vérifier ce qu'ils disent de vous", "Où apparaissent généralement les écarts", "Un plan simple pour le mois à venir", "Ce qu'il faut faire ensuite"],
    sentences: [
      "Les moteurs d'IA composent leurs réponses à partir de nombreuses sources, donc un bon site ne garantit pas une mention.",
      "La cohérence entre les profils, les avis et la couverture indépendante montre au modèle qui est vraiment l'entreprise.",
      "Commencez par poser la même question d'achat dans plusieurs moteurs et notez les noms qui reviennent dans les réponses.",
      "Comparez ces noms avec les concurrents que vous suivez déjà et repérez les endroits où votre entreprise est absente.",
      "Des corrections petites et précises valent souvent mieux qu'une grande refonte, car elles se mesurent et se répètent plus facilement.",
      "Vérifiez de nouveau toutes les quelques semaines, car les réponses changent avec la mise à jour des sources et des modèles.",
    ],
    items: ["Poser la question d'achat dans trois moteurs", "Noter chaque entreprise citée", "Corriger d'abord l'incohérence la plus visible"],
    close: "Choisissez cette semaine une question d'achat, posez-la dans trois moteurs et notez ce qui revient. Cette page de notes est votre point de départ.",
  },
};

type RawBlock = { type: string; level: number; text: string; items: string[] };

function fixture(lang: "en" | "he" | "fr", opts: { sections?: number; extra?: (b: RawBlock[]) => void } = {}) {
  const bank = BANK[lang];
  const blocks: RawBlock[] = [{ type: "paragraph", level: 0, text: bank.intro, items: [] }];
  const sections = opts.sections ?? 6;
  for (let i = 0; i < sections; i++) {
    blocks.push({ type: "heading", level: 2, text: bank.head[i % bank.head.length], items: [] });
    for (let p = 0; p < 3; p++) {
      const s = [0, 1, 2].map((k) => bank.sentences[(i + p + k) % bank.sentences.length]);
      blocks.push({ type: "paragraph", level: 0, text: s.join(" "), items: [] });
    }
    if (i % 2 === 0) blocks.push({ type: "bullet_list", level: 0, text: "", items: bank.items });
  }
  blocks.push({ type: "paragraph", level: 0, text: bank.close, items: [] });
  opts.extra?.(blocks);
  const excerpt = { en: "Why Google rankings alone no longer show how buyers find a business, and a simple way to check what AI engines say.", he: "למה דירוג בגוגל כבר לא מראה איך לקוחות מוצאים עסק, ואיך בודקים בדרך פשוטה מה מנועי בינה מלאכותית אומרים.", fr: "Pourquoi le classement Google ne montre plus comment les acheteurs trouvent une entreprise, et comment vérifier ce que disent les moteurs d'IA." }[lang];
  return {
    title: bank.head[0],
    slug: "google-rankings-vs-ai-visibility",
    excerpt,
    category: { en: "AI visibility", he: "נראות בבינה מלאכותית", fr: "Visibilité IA" }[lang],
    tags: { en: ["AI visibility", "reputation", "agencies"], he: ["נראות", "מוניטין", "סוכנויות"], fr: ["visibilité IA", "réputation", "agences"] }[lang],
    blocks,
  };
}

const META = { model: "test-model", usage: { inputTokens: 100, outputTokens: 1000 } };
const input = (language: BlogLanguage, length: BlogLength = "medium", notes = ""): BlogGenerationInput => ({ topic: "AI visibility for agencies", language, length, notes });

/* -------------------------------------------------------------------------- */
/* Offline suite                                                              */
/* -------------------------------------------------------------------------- */

async function offline() {
  console.log("\nInput validation");
  check("rejects empty topic", (await throwsCode(() => validateInput({ topic: "", language: "en", length: "short" }), "invalid_input")) === "");
  check("rejects unknown language", (await throwsCode(() => validateInput({ topic: "A valid topic here", language: "xx", length: "short" }), "invalid_input")) === "");
  check("rejects unknown length", (await throwsCode(() => validateInput({ topic: "A valid topic here", language: "en", length: "epic" }), "invalid_input")) === "");
  check("rejects a 3000 character brief", (await throwsCode(() => validateInput({ topic: "A valid topic here", language: "en", length: "short", notes: "x".repeat(3000) }), "invalid_input")) === "");

  console.log("\nFormatting hygiene");
  check("removes em dashes", !/[\u2014\u2015]/.test(cleanText("Rankings \u2014 and visibility \u2014 differ")));
  check("removes bidi control characters", cleanText("\u200Fשלום\u200E \u202Bעולם\u202C") === "שלום עולם");
  check("strips stray HTML", cleanText("Hello <b>world</b> <script>x</script>") === "Hello world x");
  check("strips markdown heading and bullet markers", cleanText("## Title") === "Title" && cleanText("- item") === "item");
  const allowed = new Set(["https://example.com/guide"]);
  const inline = parseInline("A **bold** and *italic* [guide](https://example.com/guide) and [bad](https://evil.example/x).", allowed);
  check("keeps bold and italic", inline.some((n) => n.type === "text" && n.styles.bold) && inline.some((n) => n.type === "text" && n.styles.italic));
  check("keeps an allowed link", inline.some((n) => n.type === "link" && n.href === "https://example.com/guide"));
  check("drops an unapproved link but keeps its label", !inline.some((n) => n.type === "link" && n.href.includes("evil")) && JSON.stringify(inline).includes("bad"));
  check("unbalanced markers never leave stray asterisks", !JSON.stringify(parseInline("5 * 3 and **oops", new Set())).includes("*"));
  const heInline = parseInline("**GeoRepute** מודדת נראות ב-AI, בגוגל ובביקורות.", new Set());
  check("Hebrew text with Latin brand names survives intact", JSON.stringify(heInline).includes("מודדת נראות ב-AI"));

  console.log("\nLanguage detection");
  const text = (l: "en" | "he" | "fr") => BANK[l].sentences.join(" ") + " " + BANK[l].intro;
  check("English accepted as English", languageProblem(text("en"), "en") === null);
  check("Hebrew accepted as Hebrew", languageProblem(text("he"), "he") === null);
  check("French accepted as French", languageProblem(text("fr"), "fr") === null);
  check("English rejected when Hebrew requested", languageProblem(text("en"), "he") !== null);
  check("Hebrew rejected when English requested", languageProblem(text("he"), "en") !== null);
  check("French rejected when English requested", languageProblem(text("fr"), "en") !== null);
  check("English rejected when French requested", languageProblem(text("en"), "fr") !== null);

  console.log("\nDraft validation and conversion");
  for (const lang of ["en", "he", "fr"] as const) {
    let draft;
    try {
      draft = validateDraft(fixture(lang), input(lang), META);
    } catch (e) {
      check(`${lang}: valid draft accepted`, false, e instanceof Error ? e.message : String(e));
      continue;
    }
    check(`${lang}: valid draft accepted`, true);
    check(`${lang}: slug is Latin kebab-case`, /^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug));
    check(`${lang}: list items become individual list blocks`, draft.blocks.filter((b) => b.type === "bulletListItem").length === 9);
    check(`${lang}: first block is a paragraph`, draft.blocks[0].type === "paragraph");
    check(`${lang}: heading levels are 2 or 3`, draft.blocks.filter((b) => b.type === "heading").every((b) => [2, 3].includes(Number((b.props as { level: number }).level))));

    const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks: draft.blocks as ContentBlock[] }));
    check(`${lang}: renders headings, paragraphs and lists`, /<h2>/.test(html) && /<p>/.test(html) && /<ul>/.test(html));
    check(`${lang}: rendered HTML has no leftover markdown or undefined`, !/\*\*|undefined|\[object/.test(html));
    const count = (tag: string) => (html.match(new RegExp(`<${tag}[ >]`, "g")) ?? []).length;
    check(`${lang}: rendered HTML tags are balanced`, count("ul") === (html.match(/<\/ul>/g) ?? []).length && count("p") === (html.match(/<\/p>/g) ?? []).length);
  }

  const bad = async (name: string, f: () => unknown) => check(name, (await throwsCode(f, "invalid_output")) === "", await throwsCode(f, "invalid_output"));
  await bad("rejects a draft in the wrong language", () => validateDraft(fixture("en"), input("he"), META));
  await bad("rejects a too-short draft", () => validateDraft(fixture("en", { sections: 1 }), input("en", "long"), META));
  await bad("rejects a draft with too few headings", () => validateDraft(fixture("en", { sections: 2 }), input("en"), META));
  // An em dash the model slipped in is normalised by cleanText, so the draft passes and the dash is gone.
  const dashed = fixture("en", { extra: (b) => { b[1].text = "Section \u2014 one"; b[2].text = b[2].text + " It matters \u2014 a lot."; } });
  const cleaned = validateDraft(dashed, input("en"), META);
  check("em dashes from the model are removed, not shipped", !JSON.stringify(cleaned.blocks).match(/[\u2014\u2015]/));
  await bad("rejects a non-object response", () => validateDraft("nope", input("en"), META));
  const hebrewSlug = validateDraft({ ...fixture("he"), slug: "עברית" }, input("he"), META);
  check("falls back gracefully when the slug is unusable", hebrewSlug.slug === "" || /^[a-z0-9-]+$/.test(hebrewSlug.slug));

  console.log("\nError mapping");
  const gen = (status: number, type: string, headers?: Record<string, string>, detail = "provider detail sk-ant-SECRET") =>
    Anthropic.APIError.generate(status, { type: "error", error: { type, message: detail } }, detail, new Headers(headers));
  const cases: [string, unknown, string][] = [
    ["401 maps to not_configured", gen(401, "authentication_error"), "not_configured"],
    ["429 maps to rate_limited", gen(429, "rate_limit_error", { "retry-after": "12" }), "rate_limited"],
    ["529 maps to overloaded", gen(529, "overloaded_error"), "overloaded"],
    ["500 maps to overloaded", gen(500, "api_error"), "overloaded"],
    ["402 maps to billing", gen(402, "billing_error"), "billing"],
    ["400 maps to bad_request", gen(400, "invalid_request_error"), "bad_request"],
    ["400 about a missing workspace maps to a specific setup message", gen(400, "invalid_request_error", undefined, "This API key is not scoped to a workspace, so this request must include the anthropic-workspace-id header sk-ant-SECRET"), "not_configured"],
    ["timeout maps to timeout", new Anthropic.APIConnectionTimeoutError(), "timeout"],
    ["network maps to connection", new Anthropic.APIConnectionError({ message: "boom" }), "connection"],
    ["anything else maps to unknown", new TypeError("x"), "unknown"],
  ];
  for (const [name, err, code] of cases) {
    const m = mapApiError(err, Anthropic);
    check(name, m.code === code, `got ${m.code}`);
    check(`${name}: message never leaks provider text or keys`, !/SECRET|sk-ant|provider detail/.test(m.message));
  }
  check("429 keeps retry-after seconds", mapApiError(cases[1][1], Anthropic).retryAfterSeconds === 12);

  console.log("\nGeneration flow (fake client)");
  const message = (over: Record<string, unknown> = {}) =>
    ({ model: "fake", stop_reason: "end_turn", usage: { input_tokens: 10, output_tokens: 20 }, content: [{ type: "text", text: JSON.stringify(fixture("en")) }], ...over }) as unknown as Anthropic.Message;
  const fake = (responses: (() => Anthropic.Message | Promise<Anthropic.Message>)[]) => {
    let calls = 0;
    const client = { messages: { create: async () => responses[Math.min(calls++, responses.length - 1)]() } } as unknown as Anthropic;
    return { client, calls: () => calls };
  };
  const ok = fake([() => message()]);
  const draft = await generateBlogDraft(ok.client, input("en"), { sdk: Anthropic });
  check("happy path returns a draft after one call", draft.blocks.length > 6 && ok.calls() === 1);

  const retry = fake([() => message({ content: [{ type: "text", text: "{ not json" }] }), () => message()]);
  const retried = await generateBlogDraft(retry.client, input("en"), { sdk: Anthropic });
  check("invalid JSON is retried once and then succeeds", retry.calls() === 2 && retried.blocks.length > 6);

  const alwaysBad = fake([() => message({ content: [{ type: "text", text: "{}" }] })]);
  check("persistent invalid output stops after 2 attempts", (await throwsCode(() => generateBlogDraft(alwaysBad.client, input("en"), { sdk: Anthropic }), "invalid_output")) === "" && alwaysBad.calls() === 2);

  const cut = fake([() => message({ stop_reason: "max_tokens" })]);
  check("truncated output is reported, not retried", (await throwsCode(() => generateBlogDraft(cut.client, input("en"), { sdk: Anthropic }), "truncated")) === "" && cut.calls() === 1);

  const refused = fake([() => message({ stop_reason: "refusal" })]);
  check("refusal is reported clearly", (await throwsCode(() => generateBlogDraft(refused.client, input("en"), { sdk: Anthropic }), "refused")) === "");

  const limited = fake([() => Promise.reject(gen(429, "rate_limit_error", { "retry-after": "30" }))]);
  check("rate limit is surfaced and not retried in a loop", (await throwsCode(() => generateBlogDraft(limited.client, input("en"), { sdk: Anthropic }), "rate_limited")) === "" && limited.calls() === 1);

  const down = fake([() => Promise.reject(gen(529, "overloaded_error"))]);
  check("overload is surfaced with a friendly code", (await throwsCode(() => generateBlogDraft(down.client, input("en"), { sdk: Anthropic }), "overloaded")) === "");

  let sent: Record<string, unknown> = {};
  const spy = { messages: { create: async (p: Record<string, unknown>) => ((sent = p), message()) } } as unknown as Anthropic;
  await generateBlogDraft(spy, input("en", "medium", "Use https://example.com/guide only."), { sdk: Anthropic });
  check("request uses structured JSON output", JSON.stringify(sent.output_config).includes("json_schema"));
  check("request never asks for prefill or sampling params", !("temperature" in sent) && !("top_p" in sent));
  check("request lists the allowed link", JSON.stringify(sent.messages).includes("https://example.com/guide"));
  check("max_tokens matches the chosen length", sent.max_tokens === BLOG_LENGTHS.medium.maxTokens);
}

/* -------------------------------------------------------------------------- */
/* Live suite                                                                 */
/* -------------------------------------------------------------------------- */

const LIVE: { language: BlogLanguage; length: BlogLength; topic: string; notes?: string }[] = [
  { language: "en", length: "short", topic: "How AI engines decide which business to recommend" },
  { language: "en", length: "medium", topic: "Google rankings versus AI visibility: why agencies need to track both", notes: "Audience: marketing agency owners. Include a short checklist." },
  { language: "he", length: "short", topic: "למה עסק יכול להיות ראשון בגוגל ועדיין לא מוזכר בתשובות של בינה מלאכותית" },
  { language: "he", length: "medium", topic: "איך סוכנויות שיווק יכולות למדוד מוניטין מקוון בעידן הבינה המלאכותית", notes: "קהל יעד: בעלי סוכנויות. כללו רשימת בדיקה קצרה." },
  { language: "fr", length: "medium", topic: "Comment mesurer la visibilité d'une marque dans les réponses des moteurs d'IA" },
];
const LIVE_FULL: typeof LIVE = [
  { language: "en", length: "long", topic: "A practical 30-day plan to improve how AI engines describe a brand" },
  { language: "he", length: "long", topic: "מדריך: בניית אסטרטגיית נראות בבינה מלאכותית לעסק קטן" },
  { language: "es", length: "short", topic: "Por qué la reputación en línea ya no depende solo de Google" },
  { language: "ar", length: "short", topic: "لماذا لم تعد سمعة الشركة على الإنترنت تعتمد على جوجل وحده" },
  { language: "ru", length: "short", topic: "Почему репутация бизнеса в сети больше не зависит только от Google" },
];

async function live() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    console.log("\nLive suite skipped: ANTHROPIC_API_KEY is not set (add it to .env.local, then run `npm run blog:check`).");
    return;
  }
  const model = process.env.ANTHROPIC_BLOG_MODEL?.trim() || "claude-opus-5";
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  const client = new Anthropic({
    apiKey: key,
    ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}),
    timeout: 110_000,
    maxRetries: 1,
  });
  const matrix = args.has("--full") ? [...LIVE, ...LIVE_FULL] : LIVE;
  console.log(`\nLive suite: ${matrix.length} generations with ${model}`);
  mkdirSync("scripts/.output", { recursive: true });
  const report: unknown[] = [];

  for (const c of matrix) {
    const label = `${c.language}/${c.length}`;
    const started = Date.now();
    try {
      const d = await generateBlogDraft(client, { topic: c.topic, language: c.language, length: c.length, notes: c.notes ?? "" }, { model, sdk: Anthropic });
      const secs = Math.round((Date.now() - started) / 1000);
      const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks: d.blocks as ContentBlock[] }));
      const headings = d.blocks.filter((b) => b.type === "heading").length;
      const lists = d.blocks.filter((b) => b.type.endsWith("ListItem")).length;
      const target = BLOG_LENGTHS[c.length].words;
      console.log(`\n  ${label}: ${d.wordCount} words (target ${target}), ${headings} headings, ${lists} list items, ${secs}s, tokens in/out ${d.usage.inputTokens}/${d.usage.outputTokens}`);
      console.log(`    title:   ${d.title}\n    slug:    ${d.slug}\n    excerpt: ${d.excerpt}\n    tags:    ${d.tags}`);
      check(`${label}: usable draft with no manual cleanup`, !/\*\*|undefined|&lt;|&gt;|<script/.test(html));
      check(`${label}: no em dashes`, !/[\u2014\u2015]/.test(JSON.stringify(d.blocks) + d.title + d.excerpt));
      check(`${label}: no links (none were allowed)`, !d.blocks.some((b) => JSON.stringify(b.content).includes('"link"')) || Boolean(c.notes?.includes("http")));
      report.push({ case: c, draft: d, seconds: secs });
    } catch (e) {
      const err = e instanceof GenerationError ? `${e.code}: ${e.message}` : String(e);
      check(`${label}: generation succeeded`, false, err);
      report.push({ case: c, error: err });
    }
  }
  const file = `scripts/.output/blog-check-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nFull drafts written to ${file} for human review.`);
}

async function main() {
  console.log("Offline suite");
  await offline();
  if (!args.has("--offline")) await live();
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
}
main();
