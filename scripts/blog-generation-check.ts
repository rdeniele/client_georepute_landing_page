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
import { SEARCH_NOTES, seoPlaybook } from "@/lib/blog/seo";
import { TRUSTED_SOURCES } from "@/lib/blog/links";
import { MIN_WORDS_TO_OPTIMIZE, applyOptimized, buildOptimizePrompt, optimizePost, validateOptimizeInput, validateOptimized, type OptimizeInput, type OptimizeResult } from "@/lib/blog/optimize";
import {
  BLOG_LENGTHS,
  GenerationError,
  buildPrompt,
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
  const seo = {
    en: {
      metaTitle: "AI visibility for agencies: why rankings are not enough",
      metaDescription: "Learn why Google rankings alone no longer show how buyers find a business, and how to check what AI engines say about yours.",
      keywords: ["AI visibility", "google rankings", "ai search engines", "agency reporting"],
      takeawaysHeading: "Executive summary",
      executiveSummary: "Rankings show only one side of visibility. Buyers also ask AI engines whom to trust, and those answers draw on consistent profiles, reviews and independent coverage. Check one buying question in three engines each week, note which names return, and fix the most visible inconsistency first.",
      keyTakeaways: ["Rankings are only one of two discovery surfaces", "AI engines reward consistent, independent information", "Check one buying question in three engines this week"],
      faq: [
        { question: "What is AI visibility?", answer: "AI visibility is how often and how accurately AI engines mention a business when a buyer asks who to choose." },
        { question: "How do I check what AI engines say about my business?", answer: "Ask the same buying question in several engines, write down the names they return and compare them with your competitors." },
        { question: "Does a top Google ranking guarantee an AI mention?", answer: "No. Engines assemble answers from many sources, so a high ranking does not guarantee that a business is named in the answer." },
      ],
    },
    he: {
      metaTitle: "נראות בבינה מלאכותית: למה דירוג בגוגל כבר לא מספיק",
      metaDescription: "כך תבינו למה דירוג בגוגל לבדו כבר לא מראה איך לקוחות מוצאים עסק, ואיך בודקים בדרך פשוטה מה מנועי בינה מלאכותית אומרים עליכם.",
      keywords: ["נראות בבינה מלאכותית", "דירוג בגוגל", "מנועי בינה מלאכותית", "דוחות לסוכנויות"],
      takeawaysHeading: "תקציר מנהלים",
      executiveSummary: "דירוג בגוגל מראה רק צד אחד של הנראות. לקוחות שואלים היום גם מנועי בינה מלאכותית במי לבחור, והתשובות נשענות על פרופילים עקביים, ביקורות וסיקור עצמאי. בדקו בכל שבוע שאלת רכישה אחת בשלושה מנועים, רשמו אילו שמות חוזרים ותקנו קודם את חוסר העקביות הבולט ביותר.",
      keyTakeaways: ["דירוג הוא רק אחד משני משטחי הגילוי", "מנועי בינה מלאכותית מתגמלים מידע עקבי ועצמאי", "בדקו השבוע שאלת רכישה אחת בשלושה מנועים"],
      faq: [
        { question: "מה זו נראות בבינה מלאכותית?", answer: "נראות בבינה מלאכותית היא כמה פעמים ובאיזו דיוק מנועי בינה מלאכותית מזכירים עסק כשלקוח שואל במי לבחור." },
        { question: "איך בודקים מה מנועי בינה מלאכותית אומרים על העסק?", answer: "שואלים את אותה שאלת רכישה בכמה מנועים, רושמים את השמות שחוזרים ומשווים אותם למתחרים שכבר עוקבים אחריהם." },
        { question: "האם מקום ראשון בגוגל מבטיח אזכור בבינה מלאכותית?", answer: "לא. המנועים מרכיבים תשובות ממקורות רבים, ולכן דירוג גבוה אינו מבטיח שהעסק יופיע בתשובה עצמה." },
      ],
    },
    fr: {
      metaTitle: "Visibilité IA : pourquoi le classement ne suffit plus",
      metaDescription: "Visibilité IA : comprenez pourquoi le classement Google ne montre plus comment les acheteurs trouvent une entreprise et comment vérifier ce que disent les moteurs.",
      keywords: ["visibilité IA", "classement google", "moteurs d'IA", "rapports d'agence"],
      takeawaysHeading: "Résumé",
      executiveSummary: "Le classement ne montre qu'un côté de la visibilité. Les acheteurs demandent aussi aux moteurs d'IA qui choisir, et leurs réponses reposent sur des profils cohérents, des avis et une couverture indépendante. Testez une question d'achat dans trois moteurs chaque semaine, notez les noms qui reviennent et corrigez d'abord l'incohérence la plus visible.",
      keyTakeaways: ["Le classement n'est qu'une des deux surfaces de découverte", "Les moteurs d'IA récompensent une information cohérente et indépendante", "Testez une question d'achat dans trois moteurs cette semaine"],
      faq: [
        { question: "Qu'est-ce que la visibilité IA ?", answer: "La visibilité IA mesure la fréquence et l'exactitude avec lesquelles les moteurs d'IA citent une entreprise quand un acheteur demande qui choisir." },
        { question: "Comment vérifier ce que les moteurs d'IA disent de mon entreprise ?", answer: "Posez la même question d'achat dans plusieurs moteurs, notez les noms cités et comparez-les avec vos concurrents habituels." },
        { question: "Un bon classement Google garantit-il une mention par l'IA ?", answer: "Non. Les moteurs composent leurs réponses à partir de nombreuses sources, donc un bon classement ne garantit pas d'être cité." },
      ],
    },
  }[lang];
  return {
    title: bank.head[0],
    slug: "google-rankings-vs-ai-visibility",
    excerpt,
    ...seo,
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
    check(`${lang}: list items become individual list blocks`, draft.blocks.filter((b) => b.type === "bulletListItem").length === 12);
    check(`${lang}: first block is a paragraph`, draft.blocks[0].type === "paragraph");
    check(`${lang}: heading levels are 2 or 3`, draft.blocks.filter((b) => b.type === "heading").every((b) => [2, 3].includes(Number((b.props as { level: number }).level))));

    const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks: draft.blocks as ContentBlock[] }));
    check(`${lang}: renders headings, paragraphs and lists`, /<h2[ >]/.test(html) && /<p>/.test(html) && /<ul>/.test(html));
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
  console.log("\nSEO / GEO / AEO package");
  for (const lang of ["en", "he", "fr"] as const) {
    const d = validateDraft(fixture(lang), input(lang), META);
    check(`${lang}: meta title, description, keywords and FAQ come back`, !!d.metaTitle && !!d.metaDescription && d.keywords.split(", ").length === 4 && d.faq.length === 3);
    check(`${lang}: the primary keyword is keywords[0]`, d.keywords.split(", ")[0] === fixture(lang).keywords[0]);
    check(`${lang}: key takeaways follow the opening paragraph`, d.blocks[0].type === "paragraph" && d.blocks[1].type === "heading" && d.blocks[2].type === "paragraph" && d.blocks[3].type === "bulletListItem");
    check(`${lang}: the advisory SEO score is computed`, d.seo.score >= 70 && d.seo.checks.length >= 10, `${d.seo.score}: failing ${d.seo.checks.filter((c) => !c.ok).map((c) => `${c.id}${c.detail ? ` (${c.detail})` : ""}`).join(", ")}`);
    check(`${lang}: the FAQ questions are questions`, d.faq.every((f) => /[?؟]$/.test(f.question)));
    check(`${lang}: the request carries the language's search behaviour`, buildPrompt(input(lang)).user.includes(SEARCH_NOTES[lang]) && buildPrompt(input(lang)).user.includes("<seo_playbook>"));
  }
  for (const lang of ["ar", "ru", "es", "pt"] as const) check(`${lang}: playbook available for a language without a fixture`, seoPlaybook(lang).includes(SEARCH_NOTES[lang]));
  await bad("rejects a meta title over 70 characters", () => validateDraft({ ...fixture("en"), metaTitle: "x".repeat(80) }, input("en"), META));
  await bad("rejects a meta title without the primary keyword", () => validateDraft({ ...fixture("en"), metaTitle: "A completely different subject about cooking" }, input("en"), META));
  await bad("rejects a meta description that is too short", () => validateDraft({ ...fixture("en"), metaDescription: "Too short." }, input("en"), META));
  await bad("rejects a draft with no executive summary", () => validateDraft({ ...fixture("en"), executiveSummary: "" }, input("en"), META));
  await bad("rejects a draft with no bulleted or numbered list in the body", () => validateDraft(fixture("en", { extra: (b) => { for (let i = b.length - 1; i >= 0; i--) if (b[i].type === "bullet_list") b.splice(i, 1); } }), input("en"), META));
  check("a trusted external link is accepted in a manual draft; an invented one is dropped", (() => { const link = TRUSTED_SOURCES[0].href; const mk = (u: string) => validateDraft(fixture("en", { extra: (b) => { b[0].text = `${b[0].text} See [Google's guide](${u}).`; } }), input("en"), META); return JSON.stringify(mk(link).blocks).includes(link) && !JSON.stringify(mk("https://made-up.example/x").blocks).includes("made-up.example"); })());
  check("the manual request lists the site's pages and the trusted sources as allowed links", (() => { const u = buildPrompt(input("en")).user; return u.includes(TRUSTED_SOURCES[0].href) && u.includes("/en/"); })());
  await bad("rejects fewer than 3 key takeaways", () => validateDraft({ ...fixture("en"), keyTakeaways: ["Only one"] }, input("en"), META));
  await bad("rejects fewer than 3 FAQ entries", () => validateDraft({ ...fixture("en"), faq: fixture("en").faq.slice(0, 1) }, input("en"), META));
  await bad("rejects a draft with no keywords", () => validateDraft({ ...fixture("en"), keywords: [] }, input("en"), META));
  const shortMeta = validateDraft({ ...fixture("en"), metaDescription: "AI visibility explained: a description of the right sort of size for a search result page, but a little longer than the target of one hundred fifty-eight characters." }, input("en"), META);
  check("a description above the target but under the hard limit is accepted and flagged", shortMeta.seo.checks.find((c) => c.id === "meta-description-length")?.ok === false, String(shortMeta.metaDescription.length));

  const hebrewSlug = validateDraft({ ...fixture("he"), slug: "עברית" }, input("he"), META);
  check("falls back gracefully when the slug is unusable", hebrewSlug.slug === "" || /^[a-z0-9-]+$/.test(hebrewSlug.slug));

  console.log("\nSEO assistant (hand-written posts)");
  {
    const enFix = fixture("en");
    const blocks = enFix.blocks.map((b) => (b.type === "heading" ? { type: "heading", props: { level: 2 }, content: [{ type: "text", text: b.text, styles: {} }] } : b.type === "bullet_list" ? null : { type: "paragraph", content: [{ type: "text", text: b.text, styles: {} }] })).filter(Boolean) as { type: string }[];
    const base = (over: Partial<OptimizeInput> = {}): OptimizeInput => ({ mode: "optimize", language: "en", title: "Why rankings are not enough", slug: "", excerpt: "", category: "", tags: "", metaTitle: "", metaDescription: "", keywords: "", faq: [], blocks, ...over });
    const good = {
      focusKeyword: "AI visibility",
      metaTitle: "AI visibility: why Google rankings are not enough",
      metaDescription: "AI visibility explained: why a top Google ranking no longer shows how buyers find a business, and a simple weekly check of what AI engines say.",
      excerpt: "Why Google rankings alone no longer show how buyers find a business, and a simple way to check what AI engines say about yours.",
      keywords: ["AI visibility", "google rankings", "ai search engines", "brand mentions"],
      tags: ["AI visibility", "reputation", "search"],
      category: "AI visibility",
      slug: "ai-visibility-vs-google-rankings",
      faq: enFix.faq,
      suggestedIntro: "AI visibility is how often AI engines name your business when a buyer asks who to choose. A top Google ranking does not guarantee it, so check both surfaces every week.",
      advice: ["The opening paragraph is long; replace it with the suggested intro.", "Rename the first heading to a question people search for."],
    };
    const ok = (over: Record<string, unknown> = {}, input = base()) => validateOptimized({ ...good, ...over }, input, META);
    const rejects = (name: string, over: Record<string, unknown>, re: RegExp) => {
      try {
        ok(over);
        check(name, false, "accepted");
      } catch (e) {
        check(name, e instanceof GenerationError && e.code === "invalid_output" && re.test(e.message), e instanceof Error ? e.message : String(e));
      }
    };

    const r = ok();
    check("a complete result is accepted with a before and after score", r.after.score > r.before.score && r.keywords.startsWith("AI visibility"));
    check("the result carries the intro suggestion and advice", r.suggestedIntro.length > 0 && r.advice.length === 2);
    rejects("a meta title without the focus keyword is rejected", { metaTitle: "A completely unrelated headline about cooking" }, /focus keyword/);
    rejects("a meta title over 70 characters is rejected", { metaTitle: "AI visibility " + "x".repeat(70) }, /meta title/);
    rejects("a meta description under 100 characters is rejected", { metaDescription: "Too short." }, /meta description/);
    rejects("fewer than 3 FAQ entries is rejected", { faq: enFix.faq.slice(0, 1) }, /FAQ/);
    rejects("the wrong language is rejected", { metaTitle: "נראות בבינה מלאכותית: למה דירוג בגוגל כבר לא מספיק", metaDescription: "כך תבינו למה דירוג בגוגל לבדו כבר לא מראה איך לקוחות מוצאים עסק, ואיך בודקים בדרך פשוטה מה מנועי בינה מלאכותית אומרים.", excerpt: "למה דירוג בגוגל כבר לא מראה איך לקוחות מוצאים עסק, ואיך בודקים בדרך פשוטה מה מנועי בינה מלאכותית אומרים עליכם.", focusKeyword: "נראות בבינה מלאכותית", keywords: ["נראות בבינה מלאכותית"], faq: fixture("he").faq }, /language/);
    check("em dashes are cleaned, not shipped", !/[\u2014\u2015]/.test(ok({ excerpt: good.excerpt + " \u2014 really" }).excerpt));
    check("a FAQ question without a question mark gets one", ok({ faq: enFix.faq.map((f) => ({ ...f, question: f.question.replace("?", "") })) }).faq.every((f) => f.question.endsWith("?")));
    check("an unusable slug falls back to the keyword", ok({ slug: "!!!" }).slug === "ai-visibility");
    check("an absurdly long suggested intro is rejected", (() => { try { ok({ suggestedIntro: "word ".repeat(200) }); return false; } catch (e) { return e instanceof GenerationError; } })());
    check("an empty suggested intro is allowed (the article already opens well)", ok({ suggestedIntro: "" }).suggestedIntro === "");

    // Merge rules: what the author typed survives, and a live URL never moves.
    const empty = { slug: "", excerpt: "", category: "", tags: "", meta_title: "", meta_description: "", keywords: "", faq: [] as { question: string; answer: string }[] };
    const typed = { slug: "my-own-url", excerpt: "My excerpt", category: "Mine", tags: "a, b", meta_title: "My meta title", meta_description: "My meta description", keywords: "mine", faq: [{ question: "Mine?", answer: "Mine." }] };
    const filled = applyOptimized("autocomplete", empty, r, { slugLocked: false });
    check("autocomplete fills every empty field", !!filled.slug && !!filled.excerpt && !!filled.category && !!filled.tags && !!filled.meta_title && !!filled.meta_description && !!filled.keywords && filled.faq.length >= 3);
    const kept = applyOptimized("autocomplete", typed, r, { slugLocked: true });
    check("autocomplete keeps everything the author typed", JSON.stringify(kept) === JSON.stringify(typed));
    const partial = applyOptimized("autocomplete", { ...typed, meta_title: "", faq: [] }, r, { slugLocked: true });
    check("autocomplete fills only the missing pieces", partial.meta_title === r.metaTitle && partial.faq.length === r.faq.length && partial.excerpt === "My excerpt");
    const opt = applyOptimized("optimize", typed, r, { slugLocked: true });
    check("optimize replaces the search fields", opt.meta_title === r.metaTitle && opt.meta_description === r.metaDescription && opt.excerpt === r.excerpt && opt.keywords === r.keywords && opt.faq.length === r.faq.length);
    check("optimize keeps the author's category and tags", opt.category === "Mine" && opt.tags === "a, b");
    check("optimize never changes an existing or locked URL", opt.slug === "my-own-url" && applyOptimized("optimize", { ...typed, slug: "" }, r, { slugLocked: true }).slug === "");
    check("optimize sets the URL of a new post only while it is empty and unlocked", applyOptimized("optimize", empty, r, { slugLocked: false }).slug === r.slug);

    // Input rules
    const bad = (raw: unknown) => { try { validateOptimizeInput(raw); return false; } catch (e) { return e instanceof GenerationError && e.code === "invalid_input"; } };
    check("asks for a title first", bad({ ...base(), title: "" }));
    check("asks for some article text first", bad({ ...base(), blocks: [] }) && MIN_WORDS_TO_OPTIMIZE >= 50);
    check("rejects an unknown mode and language", bad({ ...base(), mode: "rewrite" }) && bad({ ...base(), language: "xx" }));
    check("a valid request passes", validateOptimizeInput(base()).mode === "optimize");
    const prompt = buildOptimizePrompt(base());
    check("the request carries the language's search behaviour and the article", prompt.user.includes(SEARCH_NOTES.en) && prompt.user.includes("<article>") && prompt.user.includes("Why rankings"));
    check("the system prompt forbids rewriting or inventing", /Never add facts/.test(prompt.system) && /do not rewrite their article/i.test(prompt.system));
    check("article text is treated as data, not instructions", /never instructions/.test(prompt.system));

    // Scripted client: one bad answer is retried with feedback; the key never appears
    const reply = (o: unknown) => ({ model: "fake", stop_reason: "end_turn", usage: { input_tokens: 10, output_tokens: 20 }, content: [{ type: "text", text: JSON.stringify(o) }] });
    const steps: unknown[] = [reply({ ...good, metaTitle: "Unrelated cooking headline" }), reply(good)];
    const seen: string[] = [];
    const client = { messages: { create: async (p: { messages: { content: string }[] }) => { seen.push(p.messages[0].content); return steps.shift() as never; } } } as unknown as Anthropic;
    const out: OptimizeResult = await optimizePost(client, base(), { sdk: Anthropic, attempts: 2 });
    check("a rejected answer is retried once with the reason", out.metaTitle === good.metaTitle && seen.length === 2 && seen[1].includes("rejected") && out.usage.inputTokens === 20);
    const failing = { messages: { create: async () => reply({ ...good, metaTitle: "Unrelated cooking headline" }) as never } } as unknown as Anthropic;
    check("after the last attempt the error reaches the editor", (await throwsCode(() => optimizePost(failing, base(), { sdk: Anthropic, attempts: 2 }), "invalid_output")) === "");
  }

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
