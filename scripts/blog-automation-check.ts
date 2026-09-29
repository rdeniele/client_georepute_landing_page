/**
 * AI blog automation checks (offline: no API calls, no database, no cost).
 *
 *   npm run automation:check
 *
 * The engine is a state machine over two interfaces (the database store and the Claude adapter), so
 * everything that matters is tested here against an in-memory store and a scripted model: scheduling maths,
 * planning, the language modes, retries and back-off, the publish gate, review, pause/resume, one-language
 * regeneration (no wasted calls), and the CSV/Excel topic parser.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { LOCALES } from "@/lib/i18n";
import { GenerationError } from "@/lib/blog/generation";
import { buildGlossary } from "@/lib/blog/glossary";
import {
  DEFAULT_SETTINGS,
  describeWorkload,
  normalizeSettings,
  resolveLanguages,
  type AutomationSettings,
  type TickSummary,
} from "@/lib/blog/automation/config";
import { addDays, assignTopics, dateInZone, daySlots, planLocales, planWindow, zonedTimeToUtc } from "@/lib/blog/automation/schedule";
import { csvToTopics, parseCsv, rowsToTopics, cleanTopic } from "@/lib/blog/automation/topics";
import { ARTICLE_JSON_SCHEMA, DEFAULT_SYSTEM_PROMPT, allowedLinks, buildArticlePrompt, isAllowedLinkFor, parseLinkRules } from "@/lib/blog/automation/prompt";
import { generateArticle, validateArticle, type GeneratedArticle } from "@/lib/blog/automation/article";
import { faqToBlocks, blocksToFaq, localizeArticle, rewriteLocalePaths, validateSeo, type LocalizedArticle } from "@/lib/blog/automation/localize";
import { createUnsplashFinder, creditFor, type ImageFinder } from "@/lib/blog/automation/images";
import { findPlaceholders, validateForPublish, type PublishCandidate, type ValidationOptions } from "@/lib/blog/automation/validate";
import {
  approveVariant,
  backoffSeconds,
  decideStatus,
  publishVariantNow,
  regenerateVariant,
  rescheduleVariant,
  restoreTopic,
  retryVariant,
  runTick,
  skipTopic,
  unpublishVariant,
  type AutomationAi,
  type AutomationStore,
  type Job,
  type NewVariant,
  type PostInput,
  type StoredPost,
} from "@/lib/blog/automation/worker";
import type { BlogTopicRow, BlogVariantRow, VariantStatus } from "@/types/database.types";
import type { ContentBlock } from "@/types/blocks";

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
const section = (name: string) => console.log(`\n${name}`);

/* -------------------------------------------------------------------------- */
/* In-memory store (same semantics as SupabaseAutomationStore)                */
/* -------------------------------------------------------------------------- */

class MemoryStore implements AutomationStore {
  settings: AutomationSettings = { ...DEFAULT_SETTINGS };
  topics: BlogTopicRow[] = [];
  variants: BlogVariantRow[] = [];
  posts: StoredPost[] = [];
  ticks: TickSummary[] = [];
  private planLock: number | null = null;
  private seq = 0;
  private position = 0;
  constructor(public now: () => Date) {}

  id(prefix: string) {
    return `${prefix}-${++this.seq}`;
  }
  addTopics(n: number, extra: Partial<BlogTopicRow> = {}) {
    for (let i = 0; i < n; i++) {
      const at = this.now().toISOString();
      this.topics.push({
        id: this.id("topic"),
        topic: `How local businesses can improve visibility number ${this.seq}`,
        primary_keyword: "local business visibility",
        secondary_keywords: ["local seo"],
        category: null,
        search_intent: null,
        notes: null,
        status: "queued",
        position: ++this.position,
        scheduled_date: null,
        source_locale: null,
        plan_locales: [],
        translation_group: `group-${this.seq}`,
        created_at: at,
        updated_at: at,
        ...extra,
      });
    }
  }
  v(status?: VariantStatus) {
    return status ? this.variants.filter((x) => x.status === status) : this.variants;
  }

  async getSettings() {
    return this.settings;
  }
  async recordTick(s: TickSummary) {
    this.ticks.push(s);
    this.settings = { ...this.settings, lastTickAt: s.at, lastTickSummary: s };
  }
  async setBackoff(until: Date | null) {
    this.settings = { ...this.settings, backoffUntil: until ? until.toISOString() : null };
  }
  async tryPlanLease(ms: number, now: Date) {
    if (this.planLock !== null && this.planLock > now.getTime()) return false;
    this.planLock = now.getTime() + ms;
    return true;
  }
  async releasePlanLease() {
    this.planLock = null;
  }
  async assignedCountsByDate(dates: string[]) {
    return Object.fromEntries(dates.map((d) => [d, this.topics.filter((t) => t.scheduled_date === d && (t.status === "queued" || t.status === "completed")).length]));
  }
  async plannedTopicCount() {
    return this.topics.filter((t) => t.scheduled_date).length;
  }
  async nextQueuedTopics(limit: number) {
    return this.topics.filter((t) => t.status === "queued" && !t.scheduled_date).sort((a, b) => a.position - b.position).slice(0, limit);
  }
  async assignTopic(id: string, plan: { date: string; sourceLocale: string; planLocales: string[] }, variants: NewVariant[]) {
    const t = this.topics.find((x) => x.id === id);
    if (!t || t.status !== "queued" || t.scheduled_date) return false;
    t.scheduled_date = plan.date;
    t.source_locale = plan.sourceLocale;
    t.plan_locales = plan.planLocales;
    for (const nv of variants) {
      if (this.variants.some((x) => x.topic_id === id && x.locale === nv.locale)) continue;
      const at = this.now().toISOString();
      this.variants.push({
        id: this.id("var"),
        topic_id: id,
        locale: nv.locale,
        is_source: nv.is_source,
        status: "queued",
        attempts: 0,
        last_error: null,
        error_code: null,
        next_attempt_at: null,
        locked_until: null,
        post_id: null,
        scheduled_at: nv.scheduled_at,
        generated_at: null,
        published_at: null,
        validation: null,
        meta: null,
        created_at: at,
        updated_at: at,
      });
    }
    return true;
  }
  async unassignTopic(id: string) {
    const vs = this.variants.filter((x) => x.topic_id === id);
    if (vs.some((x) => x.post_id || x.attempts > 0 || !["queued", "skipped"].includes(x.status))) return false;
    this.variants = this.variants.filter((x) => x.topic_id !== id);
    const t = this.topics.find((x) => x.id === id)!;
    t.scheduled_date = null;
    t.source_locale = null;
    t.plan_locales = [];
    return true;
  }
  async unassignExtra(date: string, keep: number) {
    const on = this.topics.filter((t) => t.scheduled_date === date && t.status === "queued").sort((a, b) => b.position - a.position);
    let surplus = on.length - keep;
    let freed = 0;
    for (const t of on) {
      if (surplus <= 0) break;
      if (await this.unassignTopic(t.id)) {
        freed++;
        surplus--;
      }
    }
    return freed;
  }
  async reclaimStale(now: Date, maxAttempts: number) {
    let n = 0;
    for (const v of this.variants.filter((x) => (x.status === "generating" || x.status === "localizing") && (!x.locked_until || new Date(x.locked_until) < now))) {
      v.attempts++;
      v.status = v.attempts >= maxAttempts ? "failed" : "queued";
      v.locked_until = null;
      v.error_code = "timeout";
      n++;
    }
    return n;
  }
  async runnableJobs(now: Date, limit: number): Promise<Job[]> {
    const jobs: Job[] = [];
    for (const variant of this.variants.filter((x) => x.status === "queued" && (!x.next_attempt_at || new Date(x.next_attempt_at) <= now))) {
      const topic = this.topics.find((t) => t.id === variant.topic_id);
      if (!topic || topic.status !== "queued" || !topic.scheduled_date) continue;
      if (variant.is_source) {
        jobs.push({ variant: { ...variant }, topic, source: null });
        continue;
      }
      const src = this.variants.find((x) => x.topic_id === variant.topic_id && x.is_source);
      const post = src?.post_id ? this.posts.find((p) => p.id === src.post_id) : undefined;
      if (src && post && ["ready", "scheduled", "published"].includes(src.status)) jobs.push({ variant: { ...variant }, topic, source: { variant: { ...src }, post } });
    }
    jobs.sort((a, b) => (a.variant.scheduled_at ?? "").localeCompare(b.variant.scheduled_at ?? "") || Number(b.variant.is_source) - Number(a.variant.is_source));
    return jobs.slice(0, limit);
  }
  async claim(id: string, status: "generating" | "localizing", leaseMs: number, now: Date) {
    const v = this.variants.find((x) => x.id === id);
    if (!v || v.status !== "queued") return null;
    v.status = status;
    v.locked_until = new Date(now.getTime() + leaseMs).toISOString();
    return { ...v };
  }
  async updateVariant(id: string, patch: Partial<BlogVariantRow>) {
    Object.assign(this.variants.find((x) => x.id === id)!, patch);
  }
  async getVariant(id: string) {
    const v = this.variants.find((x) => x.id === id);
    return v ? { ...v } : null;
  }
  async getTopic(id: string) {
    return this.topics.find((t) => t.id === id) ?? null;
  }
  async variantsOfTopic(id: string) {
    return this.variants.filter((x) => x.topic_id === id).map((x) => ({ ...x }));
  }
  async updateTopic(id: string, patch: Partial<BlogTopicRow>) {
    Object.assign(this.topics.find((t) => t.id === id)!, patch);
  }
  async listVariantsByStatus(status: VariantStatus, limit: number) {
    return this.variants.filter((x) => x.status === status).slice(0, limit).map((x) => ({ ...x }));
  }
  async dueVariants(now: Date, limit: number) {
    return this.variants.filter((x) => x.status === "scheduled" && x.scheduled_at && new Date(x.scheduled_at) <= now).slice(0, limit).map((x) => ({ ...x }));
  }
  async getPost(id: string) {
    const p = this.posts.find((x) => x.id === id);
    return p ? { ...p } : null;
  }
  async savePost(existing: string | null, input: PostInput) {
    let slug = input.slug;
    for (let n = 2; this.posts.some((p) => p.locale === input.locale && p.slug === slug && p.id !== existing); n++) slug = `${input.slug}-${n}`;
    if (existing) {
      const p = this.posts.find((x) => x.id === existing)!;
      if (p.status === "published") throw new Error("published");
      Object.assign(p, { ...input, slug });
      return { ...p };
    }
    const p: StoredPost = { id: this.id("post"), status: "draft", publishedAt: null, ...input, slug };
    this.posts.push(p);
    return { ...p };
  }
  async setFeaturedImage(id: string, image: { url: string; credit: import("@/lib/blog/automation/images").ImageCredit | null }) {
    const p = this.posts.find((x) => x.id === id)!;
    if (!p.featuredImage) Object.assign(p, { featuredImage: image.url, featuredImageCredit: image.credit });
  }
  async publishPost(id: string, at: Date) {
    Object.assign(this.posts.find((p) => p.id === id)!, { status: "published", publishedAt: at.toISOString() });
  }
  async unpublishPost(id: string) {
    this.posts.find((p) => p.id === id)!.status = "draft";
  }
}

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const EN_SENTENCES = [
  "Most customers check how a business looks online before they ever call it, so the first impression is usually a search result.",
  "A complete and consistent profile tells both people and search engines that the business is real and that it is active.",
  "Reviews matter because they answer the question that the website cannot answer for itself, which is what it is like to buy here.",
  "Small improvements repeated every week are worth more than one large project that never gets finished properly.",
  "Write down the questions that buyers ask, then check whether your pages give a direct answer to each one of them.",
  "Keep the name, address and phone number identical everywhere, because small differences make it harder for engines to trust the record.",
];
function para(n: number, seed = 0) {
  return Array.from({ length: n }, (_, i) => EN_SENTENCES[(i + seed) % EN_SENTENCES.length]).join(" ");
}
type Raw = Record<string, unknown>;
const NAV_LINK = "/en/methodology";
function rawArticle(over: Raw = {}): Raw {
  return {
    title: "How local businesses can improve their visibility on Google",
    metaTitle: "Improve your local business visibility on Google",
    metaDescription: "A practical guide to local business visibility: what searchers see first, what to fix this week and how to keep it consistent over time.",
    slug: "local-business-visibility",
    excerpt: "A practical look at how local businesses show up on Google and in AI answers, with the small fixes that matter most.",
    category: "Local SEO",
    tags: ["local seo", "visibility"],
    keywords: ["local business visibility", "google business profile", "local seo tips"],
    blocks: [
      { type: "paragraph", level: 0, text: `Local business visibility starts with the profile people see first. ${para(3)}`, items: [] },
      { type: "heading", level: 2, text: "Why the first impression matters", items: [] },
      { type: "paragraph", level: 0, text: para(4, 1), items: [] },
      { type: "heading", level: 2, text: "What to fix first", items: [] },
      { type: "bullet_list", level: 0, text: "", items: ["Complete every field of the profile", "Reply to the latest reviews", "Match the name and phone number everywhere"] },
      { type: "paragraph", level: 0, text: `${para(4, 2)} Read our [methodology](${NAV_LINK}) for the full approach.`, items: [] },
      { type: "heading", level: 2, text: "How to keep it consistent", items: [] },
      { type: "paragraph", level: 0, text: para(5, 3), items: [] },
      { type: "heading", level: 2, text: "Measuring progress", items: [] },
      { type: "paragraph", level: 0, text: para(5, 4), items: [] },
      { type: "paragraph", level: 0, text: para(4, 5), items: [] },
      { type: "paragraph", level: 0, text: para(4, 0), items: [] },
      { type: "paragraph", level: 0, text: para(4, 2), items: [] },
      { type: "paragraph", level: 0, text: para(4, 1), items: [] },
    ],
    faq: [
      { question: "How long does it take to improve local visibility?", answer: "Most businesses see the first changes within a few weeks of fixing their profile and replying to reviews, although the full effect takes longer." },
      { question: "Do I need a website for local visibility?", answer: "A website helps, but a complete business profile and consistent listings already do a lot of the work for local searches." },
      { question: "How often should I update my profile?", answer: "Review it monthly and whenever your hours, address or services change, so that the information searchers see stays correct." },
    ],
    cta: { heading: "See how your business looks today", text: "Run a GeoRepute analysis to see how Google and AI engines describe your business, and what to fix first." },
    imageConcept: "A shop window at dusk with a phone showing a map pin in front of it.",
    linkOpportunities: ["Link to a future article about reviews"],
    requiredSections: [],
    ...over,
  };
}
const META = { model: "fake", usage: { inputTokens: 1, outputTokens: 1 } };
const baseReq = { topic: "How to improve your local business visibility on Google", primaryKeyword: "local business visibility", language: "en", config: DEFAULT_SETTINGS.config };
const validate = (raw: Raw, req = baseReq) => validateArticle(raw, req as never, META);
function throwsMsg(fn: () => unknown, re: RegExp) {
  try {
    fn();
    return false;
  } catch (e) {
    return e instanceof GenerationError && e.code === "invalid_output" && re.test(e.message);
  }
}

/** One sentence per language, long enough and in the right script, so the language check in the publish gate passes for a fake "translation". */
const FILL: Record<string, string> = {
  en: "Most customers check how the business looks online before they call it, and the first result is often the profile that they see. ",
  he: "רוב הלקוחות בודקים איך העסק נראה ברשת לפני שהם מתקשרים אליו, והתוצאה הראשונה היא לרוב הפרופיל שהם רואים בחיפוש. ",
  ar: "يتحقق معظم العملاء من مظهر النشاط التجاري على الإنترنت قبل أن يتصلوا به، وغالبا ما تكون النتيجة الأولى هي الملف الذي يرونه في البحث. ",
  ru: "Большинство клиентов проверяют, как компания выглядит в интернете, прежде чем позвонить, и первым результатом часто становится профиль, который они видят в поиске. ",
  fr: "La plupart des clients vérifient la présence en ligne de l'entreprise avant de la contacter, et le premier résultat est souvent la fiche que vous voyez dans une recherche sur une ville. ",
  es: "La mayoría de los clientes comprueban cómo se ve el negocio en línea antes de llamar, y el primer resultado es casi siempre el perfil que ven en una búsqueda para su ciudad. ",
  pt: "A maioria dos clientes verifica como o negócio aparece na internet antes de ligar, e o primeiro resultado é quase sempre o perfil que eles veem em uma pesquisa para a sua cidade. ",
};

/** A scripted Claude adapter that records what it was asked to do. Failures can be queued per call. */
function fakeAi() {
  const calls: { kind: "generate" | "localize"; locale: string }[] = [];
  const failures: (Error | null)[] = [];
  let n = 0;
  const ai: AutomationAi = {
    async generateArticle(req) {
      calls.push({ kind: "generate", locale: String(req.language) });
      const f = failures.shift();
      if (f) throw f;
      n++;
      return validateArticle(rawArticle({ title: `${String(rawArticle().title)} ${n}`, slug: `local-business-visibility-${n}` }), { ...baseReq, language: req.language } as never, META);
    },
    async localizeArticle(source, o) {
      calls.push({ kind: "localize", locale: o.to });
      const f = failures.shift();
      if (f) throw f;
      const text = (FILL[o.to] ?? FILL.en).repeat(2).trim();
      const blocks = source.blocks.map((b) => {
        const links = Array.isArray(b.content) ? (b.content as { type?: string }[]).filter((n) => n.type === "link") : [];
        return { ...b, content: [{ type: "text", text, styles: {} }, ...links] };
      });
      return {
        title: `${text.slice(0, 60)} ${o.to}`,
        excerpt: text.slice(0, 120),
        category: source.category,
        tags: source.tags,
        blocks: rewriteLocalePaths(blocks as never, o.from, o.to),
        faq: source.faq.map(() => ({ question: text.slice(0, 40), answer: text.slice(0, 80) })),
        metaTitle: text.slice(0, 50),
        metaDescription: text.slice(0, 120),
        slug: `${source.slug}-${o.to}`,
        keywords: source.keywords,
        language: o.to,
        report: { status: "verified", issues: [], fixed: 0, checks: [], calls: 3, model: "fake", usage: { inputTokens: 1, outputTokens: 1 }, seconds: 1, reviewSkipped: false },
        calls: 3,
        usage: { inputTokens: 1, outputTokens: 1 },
        seconds: 1,
      };
    },
  };
  return { ai, calls, failures };
}

/** A clock the test moves by hand. */
function clock(start: string) {
  let t = new Date(start).getTime();
  return { now: () => new Date(t), set: (iso: string) => (t = new Date(iso).getTime()), advance: (ms: number) => (t += ms) };
}
function setup(over: Partial<AutomationSettings> = {}, start = "2026-09-26T05:00:00Z") {
  const c = clock(start);
  const store = new MemoryStore(c.now);
  store.settings = normalizeSettings({ enabled: true, autoPublish: true, requireReview: false, articlesPerDay: 2, lookaheadDays: 3, ...over });
  const f = fakeAi();
  const deps = { store, ai: f.ai, now: c.now, defaultModels: { generation: "g", translation: "t" } };
  const tick = () => runTick(deps, { trigger: "manual", budgetMs: 265_000 });
  return { c, store, f, deps, tick };
}

/* -------------------------------------------------------------------------- */

async function main() {
  section("Languages come from the site, not from this code");
  {
    check("the blog's language list is the site's LOCALES", resolveLanguages({ languages: null, sourceLocale: "en" }).join() === LOCALES.join());
    check("'all languages' automatically includes a language added later", resolveLanguages({ languages: null, sourceLocale: "en" }, [...LOCALES, "de"]).includes("de"));
    check("an explicit subset is respected and ordered like the site", resolveLanguages({ languages: ["fr", "en"], sourceLocale: "en" }).join() === "en,fr");
    check("a language the site no longer supports is dropped, never scheduled", resolveLanguages({ languages: ["en", "xx"], sourceLocale: "en" }).join() === "en");
    const files = [...walk("lib/blog/automation"), "lib/services/blogAutomation.ts", "lib/services/blogAutomationRunner.ts", "lib/actions/blogAutomation.ts"];
    const hardcoded = files.filter((f) => /["']he["']\s*,\s*["']ar["']|["']ru["']\s*,\s*["']fr["']/.test(readSafe(f)));
    check("no automation source file hard-codes a list of languages", hardcoded.length === 0, hardcoded.join(", "));
    const locales = planLocales(normalizeSettings({ languageMode: "all_languages" }, DEFAULT_SETTINGS, [...LOCALES, "de"]), 0, [...LOCALES, "de"]);
    check("planning includes a newly supported language with no other change", locales.targets.includes("de") && locales.source === "en");
  }

  section("Settings are clamped and explained");
  {
    const s = normalizeSettings({ articlesPerDay: 5000, lookaheadDays: 0, publishTime: "25:99", timezone: "Mars/Base", startDate: "2026-02-31", concurrency: 99, languageMode: "nope", sourceLocale: "xx" });
    check("articles per day is capped at 100", s.articlesPerDay === 100);
    check("look-ahead is at least 1 day", s.lookaheadDays === 1);
    check("an invalid publish time and time zone fall back to the previous values", s.publishTime === "09:00" && s.timezone === "UTC");
    check("an impossible start date is cleared", s.startDate === null);
    check("concurrency is capped, language mode falls back, unknown source language becomes English", s.concurrency === 4 && s.languageMode === "all_languages" && s.sourceLocale === "en");
    const sub = normalizeSettings({ languages: ["fr", "es"], sourceLocale: "en" });
    check("the canonical language is always one that is published", resolveLanguages(sub).includes(sub.sourceLocale), sub.sourceLocale);
    const all = describeWorkload(normalizeSettings({ articlesPerDay: 10, languageMode: "all_languages" }));
    check("10 topics a day in all 7 languages is stated as 70 pieces", all.piecesPerDay === 70 && /70 pieces/.test(all.sentence), all.sentence);
    const rot = describeWorkload(normalizeSettings({ articlesPerDay: 100, languageMode: "rotate" }));
    check("100 a day in rotate mode is 100 pieces, not 700", rot.piecesPerDay === 100 && rot.callsPerDay === 100, rot.sentence);
    check("cheaper localization when review is off", describeWorkload(normalizeSettings({ articlesPerDay: 1, config: { localizationReview: false } as never })).callsPerDay < describeWorkload(normalizeSettings({ articlesPerDay: 1 })).callsPerDay);
  }

  section("Scheduling maths");
  {
    check("09:00 in Jerusalem in summer is 06:00 UTC", zonedTimeToUtc("2026-10-01", "09:00", "Asia/Jerusalem").toISOString() === "2026-10-01T06:00:00.000Z");
    check("09:00 in Jerusalem in winter is 07:00 UTC (DST handled)", zonedTimeToUtc("2026-11-01", "09:00", "Asia/Jerusalem").toISOString() === "2026-11-01T07:00:00.000Z");
    check("09:00 in New York before and after DST", zonedTimeToUtc("2026-03-07", "09:00", "America/New_York").toISOString() === "2026-03-07T14:00:00.000Z" && zonedTimeToUtc("2026-03-09", "09:00", "America/New_York").toISOString() === "2026-03-09T13:00:00.000Z");
    check("the calendar date depends on the time zone", dateInZone(new Date("2026-09-26T22:30:00Z"), "Asia/Jerusalem") === "2026-09-27" && dateInZone(new Date("2026-09-26T22:30:00Z"), "UTC") === "2026-09-26");
    check("date arithmetic crosses month ends", addDays("2026-09-30", 1) === "2026-10-01" && addDays("2026-03-01", -1) === "2026-02-28");
    const s = normalizeSettings({ articlesPerDay: 3, spreadMinutes: 20, publishTime: "09:00" });
    check("slots are spread from the publish time", daySlots("2026-10-01", s).map((d) => d.toISOString().slice(11, 16)).join() === "09:00,09:20,09:40");
    const big = daySlots("2026-10-01", normalizeSettings({ articlesPerDay: 100, spreadMinutes: 60 }));
    check("100 a day still fits inside about 12 hours", big.length === 100 && big[99].getTime() - big[0].getTime() <= 12 * 3600_000);

    const now = new Date("2026-09-26T05:00:00Z");
    const win = planWindow(now, normalizeSettings({ articlesPerDay: 2, lookaheadDays: 3 }), {});
    check("the window covers today (its time has not passed) and the next days", win.map((d) => d.date).join() === "2026-09-26,2026-09-27,2026-09-28");
    const late = planWindow(new Date("2026-09-26T12:00:00Z"), normalizeSettings({ articlesPerDay: 2, lookaheadDays: 3 }), {});
    check("today is skipped once its publish time has passed", late[0].date === "2026-09-27");
    const future = planWindow(now, normalizeSettings({ articlesPerDay: 2, lookaheadDays: 3, startDate: "2026-10-01" }), {});
    check("nothing is planned before the start date", future.length === 0);
    const near = planWindow(new Date("2026-09-29T05:00:00Z"), normalizeSettings({ articlesPerDay: 2, lookaheadDays: 3, startDate: "2026-10-01" }), {});
    check("the start date enters the window when it is close enough", near.map((d) => d.date).join() === "2026-10-01");
    check("a partly filled day only offers what is left", planWindow(now, normalizeSettings({ articlesPerDay: 5, lookaheadDays: 1 }), { "2026-09-26": 3 })[0].free === 2);

    const a = assignTopics(["a", "b", "c", "d", "e"], planWindow(now, s, {}), s, 0);
    check("topics fill days in queue order", a.map((x) => `${x.topicId}@${x.date}`).join() === "a@2026-09-26,b@2026-09-26,c@2026-09-26,d@2026-09-27,e@2026-09-27");
    check("each topic gets its own publish time within the day", a[0].scheduledAt.toISOString().endsWith("09:00:00.000Z") && a[1].scheduledAt.toISOString().endsWith("09:20:00.000Z"));
    const rotate = normalizeSettings({ articlesPerDay: 7, languageMode: "rotate" });
    const r = assignTopics(["1", "2", "3", "4", "5", "6", "7"], planWindow(now, rotate, {}), rotate, 0);
    check("rotate mode gives each topic ONE language, taking turns, and covers every language in a day", new Set(r.map((x) => x.plan.source)).size === LOCALES.length && r.every((x) => x.plan.targets.length === 0));
    check("the rotation continues where it stopped", planLocales(rotate, 7).source === planLocales(rotate, 0).source && planLocales(rotate, 8).source === LOCALES[1]);
    const all = planLocales(normalizeSettings({ languageMode: "all_languages" }), 3);
    check("all-languages mode writes once in the canonical language and adapts into the rest", all.source === "en" && all.targets.length === LOCALES.length - 1);
  }

  section("Topic import (CSV and Excel rows)");
  {
    const csv = 'Topic,Primary Keyword,Secondary Keywords,Category,Search Intent,Notes\n"How to improve your local business visibility on Google",local business visibility,"local seo; maps",Local SEO,informational,"Mention reviews, and ""quality"" signals"\nAnother topic about reviews and reputation,reviews,,Reputation,,\n';
    const r = csvToTopics(csv);
    check("a CSV with a header row parses every column", r.topics.length === 2 && r.header && r.topics[0].primary_keyword === "local business visibility" && r.topics[0].category === "Local SEO");
    check("quoted commas and doubled quotes survive", r.topics[0].notes === 'Mention reviews, and "quality" signals');
    check("secondary keywords split on semicolons", r.topics[0].secondary_keywords.join() === "local seo,maps");
    const semi = csvToTopics("title;keyword\nA long enough topic about maps;maps");
    check("semicolon-separated files (European Excel) and header synonyms work", semi.topics.length === 1 && semi.topics[0].primary_keyword === "maps");
    check("a byte-order mark and CRLF line endings are handled", csvToTopics("﻿Topic\r\nA long enough topic about maps\r\n").topics.length === 1);
    const plain = csvToTopics("A long enough topic about maps\nAnother long enough topic about reviews");
    check("a single column without a header is a plain list of topics", plain.topics.length === 2 && !plain.header);
    const dupes = csvToTopics("Topic\nA long enough topic about maps\na long enough topic about maps\nExisting long topic about reviews", new Set(["existing long topic about reviews"]));
    check("duplicates inside the file and against existing topics are skipped and counted", dupes.topics.length === 1 && dupes.duplicates === 2);
    const bad = csvToTopics("Topic\nshort\nA long enough topic about maps");
    check("a bad row is reported with its row number and does not block the good ones", bad.topics.length === 1 && bad.issues[0].row === 2);
    const xlsx = rowsToTopics([["Topic", "Keyword", "Date"], ["A long enough topic about maps", 12345, new Date("2026-01-02")], ["Another long enough topic here", null, ""]] as unknown[][]);
    check("Excel cells (numbers, dates, blanks) become text", xlsx.topics.length === 2 && xlsx.topics[0].primary_keyword === "12345");
    check("control and bidi characters are removed from topics", (cleanTopic({ topic: "Hidden‮text in the topic\u0000 here" }) as { topic: string }).topic === "Hiddentext in the topic here");
    check("the file size limit is enforced", rowsToTopics(Array.from({ length: 5002 }, (_, i) => [`Topic number ${i} about something`])).issues.length === 1);
    check("a topic that is too long is rejected", typeof cleanTopic({ topic: "x".repeat(600) }) === "string");
    const loose = rowsToTopics([["Content Topic", "Main Keyword (SEO)", "Related Keywords", "Article Category", "Instructions"], ["A long enough topic about maps", "maps", "a; b", "Local", "Be brief"]] as unknown[][]);
    check("column names are matched loosely (Content Topic, Main Keyword (SEO), Instructions...)", loose.header && loose.topics[0]?.primary_keyword === "maps" && loose.topics[0]?.secondary_keywords.join() === "a,b" && loose.topics[0]?.category === "Local" && loose.topics[0]?.notes === "Be brief");
    check("a first data row that merely contains the word 'topic' is not mistaken for a header", !csvToTopics("A long enough topic about maps and more\nAnother long enough topic about reviews").header);
    check("parseCsv keeps empty cells in place", parseCsv("a,,c\n").join("|") === "a,,c");
  }

  section("Article validation (the structured output)");
  {
    const ok = validate(rawArticle());
    check("a complete article is accepted and gets every SEO field", !!ok.metaTitle && !!ok.metaDescription && !!ok.slug && ok.faq.length === 3 && ok.keywords.length >= 1 && !!ok.imageConcept);
    check("the call to action becomes the closing heading and paragraph", ok.blocks.at(-2)?.type === "heading" && ok.blocks.at(-1)?.type === "paragraph");
    check("an allowed internal link is kept as a real link", JSON.stringify(ok.blocks).includes(`"href":"${NAV_LINK}"`));
    check("an invented link is reduced to plain text", !JSON.stringify(validate(rawArticle({ blocks: (rawArticle().blocks as Raw[]).map((b, i) => (i === 0 ? { ...b, text: `${b.text} See [this](https://evil.example/x).` } : b)) })).blocks).includes("evil.example"));
    check("a meta title over 70 characters is rejected", throwsMsg(() => validate(rawArticle({ metaTitle: "x".repeat(80) })), /meta title/));
    check("a missing meta description is rejected", throwsMsg(() => validate(rawArticle({ metaDescription: "" })), /meta description/));
    check("an unusable slug is rebuilt from the title", validate(rawArticle({ slug: "!!!" })).slug === "how-local-businesses-can-improve-their-visibility-on-google");
    check("too few headings is rejected", throwsMsg(() => validate(rawArticle({ blocks: (rawArticle().blocks as Raw[]).filter((b) => b.type !== "heading") })), /headings|blocks/));
    check("an article that opens with a heading is rejected", throwsMsg(() => validate(rawArticle({ blocks: [{ type: "heading", level: 2, text: "Start", items: [] }, ...(rawArticle().blocks as Raw[])] })), /starts with a heading/));
    check("a body far too short is rejected", throwsMsg(() => validate(rawArticle({ blocks: (rawArticle().blocks as Raw[]).slice(0, 7) })), /words|blocks/));
    check("placeholder text is rejected", throwsMsg(() => validate(rawArticle({ title: "Lorem ipsum dolor sit amet title" })), /lorem/));
    check("an em dash is cleaned to a comma before anything is stored", !/[—―]/.test(validate(rawArticle({ excerpt: `${String(rawArticle().excerpt)} — really` })).excerpt));
    check("the wrong language is rejected", throwsMsg(() => validate(rawArticle(), { ...baseReq, language: "he" }), /wrong language/));
    check("the topic's category overrides the model's", validate(rawArticle(), { ...baseReq, category: "Reputation" } as never).category === "Reputation");
    const withCats = { ...baseReq, config: { ...DEFAULT_SETTINGS.config, categories: ["Reputation", "Local SEO"] } };
    check("with allowed categories, one outside the list is rejected and one inside is accepted", throwsMsg(() => validate(rawArticle({ category: "Cooking" }), withCats as never), /allowed categories/) && validate(rawArticle({ category: "local seo" }), withCats as never).category === "Local SEO");
    const need = { ...baseReq, config: { ...DEFAULT_SETTINGS.config, requiredSections: ["Key takeaways"] } };
    check("a required section must exist as a real heading", throwsMsg(() => validate(rawArticle(), need as never), /required section/));
    const withSection = rawArticle({ requiredSections: [{ section: "Key takeaways", heading: "What to fix first" }] });
    check("...and passes when the reported heading exists", validate(withSection, need as never).blocks.length > 0);
    check("...but not when the model reports a heading that does not exist", throwsMsg(() => validate(rawArticle({ requiredSections: [{ section: "Key takeaways", heading: "Nope" }] }), need as never), /required section/));
    const faqAlways = { ...baseReq, config: { ...DEFAULT_SETTINGS.config, faq: "always" as const } };
    check("FAQ 'always' needs at least 3 usable items", throwsMsg(() => validate(rawArticle({ faq: [] }), faqAlways as never), /FAQ/));
    check("FAQ 'never' drops the FAQ", validate(rawArticle(), { ...baseReq, config: { ...DEFAULT_SETTINGS.config, faq: "never" as const } } as never).faq.length === 0);
    check("a question with no real answer is dropped", validate(rawArticle({ faq: [{ question: "What is this about exactly?", answer: "Short." }, ...(rawArticle().faq as Raw[])] })).faq.length === 3);
    check("non-object output is rejected", throwsMsg(() => validate("nope" as never), /not an object/));
    check("the schema lists every field the validator reads", ["metaTitle", "metaDescription", "slug", "faq", "cta", "keywords", "imageConcept", "requiredSections"].every((k) => (ARTICLE_JSON_SCHEMA.required as readonly string[]).includes(k)));
  }

  section("Generation: retries and error mapping (scripted client)");
  {
    const reply = (text: unknown, stop = "end_turn") => ({ model: "fake", stop_reason: stop, usage: { input_tokens: 10, output_tokens: 20 }, content: [{ type: "text", text: JSON.stringify(text) }] });
    const client = (steps: unknown[]) => {
      const calls: { user: string; system: string }[] = [];
      return {
        calls,
        client: {
          messages: {
            create: async (p: { messages: { content: string }[]; system: string }) => {
              calls.push({ user: p.messages[0].content, system: p.system });
              const step = steps.shift();
              if (step instanceof Error) throw step;
              return step as never;
            },
          },
        } as unknown as Anthropic,
      };
    };
    const a = client([reply(rawArticle())]);
    const art = await generateArticle(a.client, baseReq as never, { sdk: Anthropic });
    check("a good response is used as is (one call)", a.calls.length === 1 && art.title.length > 0);
    const b = client([reply(rawArticle({ metaTitle: "x".repeat(90) })), reply(rawArticle())]);
    const art2 = await generateArticle(b.client, baseReq as never, { sdk: Anthropic });
    check("unusable output is retried once with the reason as feedback", b.calls.length === 2 && /meta title/.test(b.calls[1].user) && art2.title.length > 0);
    const c = client([reply(rawArticle({ metaTitle: "" })), reply(rawArticle({ metaTitle: "" }))]);
    await generateArticle(c.client, baseReq as never, { sdk: Anthropic }).then(() => check("two bad answers fail", false), (e) => check("two unusable answers fail with invalid_output (the queue retries later)", e instanceof GenerationError && e.code === "invalid_output"));
    const d = client([{ model: "x", stop_reason: "max_tokens", usage: { input_tokens: 1, output_tokens: 1 }, content: [] }]);
    await generateArticle(d.client, baseReq as never, { sdk: Anthropic }).then(() => check("truncation is reported", false), (e) => check("a truncated answer is reported as truncated, not retried in place", e instanceof GenerationError && e.code === "truncated" && d.calls.length === 1));
    const e2 = client([Anthropic.APIError.generate(429, { type: "error", error: { type: "rate_limit_error", message: "SECRET sk-ant-xxxx" } }, "SECRET sk-ant-xxxx", new Headers({ "retry-after": "42" }))]);
    await generateArticle(e2.client, baseReq as never, { sdk: Anthropic }).then(() => check("429 fails", false), (e) => check("a 429 becomes rate_limited with the wait time and never echoes the provider message", e instanceof GenerationError && e.code === "rate_limited" && e.retryAfterSeconds === 42 && !/SECRET|sk-ant/.test(e.message)));
    const e3 = client([reply("not an object")]);
    await generateArticle(e3.client, baseReq as never, { sdk: Anthropic, attempts: 1 }).then(() => check("malformed fails", false), (e) => check("malformed structured output is invalid_output", e instanceof GenerationError && e.code === "invalid_output"));
    await generateArticle(client([]).client, { ...baseReq, language: "xx" } as never, { sdk: Anthropic }).then(() => check("unknown language fails", false), (e) => check("a language the site does not support is refused before any call", e instanceof GenerationError && e.code === "invalid_input"));
    check("the default prompt forbids invented facts and untrusted instructions", /Do not invent/.test(DEFAULT_SYSTEM_PROMPT) && /never instructions/.test(DEFAULT_SYSTEM_PROMPT));
    const custom = buildArticlePrompt({ ...baseReq, config: { ...DEFAULT_SETTINGS.config, systemPrompt: "Custom rules from the CMS." } } as never);
    check("rules saved in the CMS replace the built-in prompt (no code change)", custom.system === "Custom rules from the CMS." && buildArticlePrompt(baseReq as never).system === DEFAULT_SYSTEM_PROMPT);
    const prompt = buildArticlePrompt({ ...baseReq, secondaryKeywords: ["maps"], config: { ...DEFAULT_SETTINGS.config, tone: "Warm", requiredSections: ["Key takeaways"], categories: ["A", "B"], ctaInstructions: "Book a demo" } } as never).user;
    check("tone, SEO, CTA, categories, required sections and keywords all reach the model", ["Warm", "Book a demo", "A | B", "Key takeaways", "maps", "local business visibility", "<language>English"].every((x) => prompt.includes(x)));
    check("the allowed links are the site's real pages", allowedLinks(DEFAULT_SETTINGS.config, "", "he").some((l) => l.href.startsWith("/he/")) && !allowedLinks(DEFAULT_SETTINGS.config, "", "he").some((l) => l.href.startsWith("/en/")));
    check("admin link rules are parsed and localized; junk lines are ignored", parseLinkRules("/en/pricing | when talking about cost\njavascript:alert(1)\nhttps://x.example/a\n//evil.example").length === 2 && allowedLinks({ internalLinkingRules: "/en/pricing | cost" }, "", "fr").some((l) => l.href === "/fr/pricing"));
    check("a link outside the allowed set is refused, a georepute.ai link is allowed", !isAllowedLinkFor(DEFAULT_SETTINGS.config, "en")("https://evil.example") && isAllowedLinkFor(DEFAULT_SETTINGS.config, "en")("https://www.georepute.ai/signup"));
  }

  section("Publish gate");
  {
    const post = (over: Partial<PublishCandidate> = {}): PublishCandidate => {
      const a = validate(rawArticle());
      return { locale: "en", slug: a.slug, title: a.title, excerpt: a.excerpt, metaTitle: a.metaTitle, metaDescription: a.metaDescription, keywords: a.keywords, category: a.category, blocks: a.blocks as never, faq: a.faq, ...over };
    };
    const opts: ValidationOptions = { isAllowedLink: isAllowedLinkFor(DEFAULT_SETTINGS.config, "en") };
    const codes = (over: Partial<PublishCandidate>, o = opts) => validateForPublish(post(over), o).filter((i) => i.severity === "error").map((i) => i.code);
    check("a complete article passes with no errors", codes({}).length === 0);
    check("missing title", codes({ title: "" }).includes("title_missing"));
    check("missing slug", codes({ slug: "" }).includes("slug_missing"));
    check("invalid slug", codes({ slug: "Not A Slug!" }).includes("slug_invalid"));
    check("missing meta title", codes({ metaTitle: "" }).includes("meta_title_missing"));
    check("missing meta description", codes({ metaDescription: "" }).includes("meta_description_missing"));
    check("empty content", codes({ blocks: [] }).includes("content_missing"));
    check("almost no content", codes({ blocks: [{ type: "paragraph", content: "Just a few words here." }] }).includes("content_short"));
    check("no heading structure", codes({ blocks: [{ type: "paragraph", content: para(30) }] }).includes("headings_missing"));
    check("a required heading that is missing", codes({}, { ...opts, requiredHeadings: ["Key takeaways"] } as never).includes("required_section_missing"));
    check("wrong language", codes({ locale: "he" }).includes("wrong_language"));
    check("placeholder text in the body", codes({ blocks: [...(post().blocks as never[]), { type: "paragraph", content: "Contact [your company name] today." }] }).includes("placeholder_text"));
    check("an AI refusal left in the text", codes({ blocks: [...(post().blocks as never[]), { type: "paragraph", content: "I'm sorry, but I cannot write that." }] }).includes("placeholder_text"));
    check("raw JSON left in the text", findPlaceholders('{"metaTitle": "x"}').length > 0);
    check("an invalid internal link", codes({ blocks: [...(post().blocks as never[]), { type: "paragraph", content: [{ type: "link", href: "/en/does-not-exist", content: [{ type: "text", text: "x", styles: {} }] }] }] }).includes("link_invalid"));
    check("a link to another language's page is invalid", codes({ blocks: [...(post().blocks as never[]), { type: "paragraph", content: [{ type: "link", href: "/fr/methodology", content: [{ type: "text", text: "x", styles: {} }] }] }] }).includes("link_invalid"));
    check("a too-short FAQ when the FAQ is required", codes({ faq: [] }, { ...opts, faqRequired: true }).includes("faq_missing"));
    const long = validateForPublish(post({ metaTitle: "x".repeat(90) }), opts);
    check("an over-long meta title is a warning, not a blocker", long.some((i) => i.code === "meta_title_long" && i.severity === "warning") && !long.some((i) => i.severity === "error"));
    check("status: problems mean needs review, whatever the switches say", decideStatus([{ severity: "error", code: "x", message: "" }], { requireReview: false, autoPublish: true }) === "needs_review");
    check("status: review required -> ready; auto-publish -> scheduled; neither -> ready", decideStatus([], { requireReview: true, autoPublish: true }) === "ready" && decideStatus([], { requireReview: false, autoPublish: true }) === "scheduled" && decideStatus([], { requireReview: false, autoPublish: false }) === "ready");
  }

  section("Localization (scripted model): body, FAQ, CTA, links and SEO fields");
  {
    const article = validate(rawArticle());
    const src = { title: article.title, excerpt: article.excerpt, category: article.category, tags: article.tags, blocks: article.blocks as unknown as ContentBlock[], faq: article.faq, metaTitle: article.metaTitle, metaDescription: article.metaDescription, keywords: article.keywords, slug: article.slug, primaryKeyword: "local business visibility" };
    const HE = "בדיקה מעשית של נראות העסק במנועי חיפוש ובמנועי בינה מלאכותית עוזרת להבין איפה הלקוחות מחפשים ומה הם מוצאים באמת ";
    const heFor = (markup: string) => {
      const plain = markup.replace(/\]\([^)\s]*\)/g, "]").replace(/[*_~`\[\]]/g, "");
      let body = HE.repeat(Math.max(1, Math.round(plain.length / HE.length))).trim();
      for (const m of markup.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) body += ` [קישור](${m[2]})`;
      for (const n of plain.match(/\d[\d.,]*/g) ?? []) body += ` ${n}`;
      // Names and the site's own terms must survive translation, exactly like a real translator would keep them.
      for (const name of ["GeoRepute", "Google", "ChatGPT"]) if (markup.includes(name)) body += ` ${name}`;
      if (/methodology/i.test(markup)) body += " מתודולוגיה";
      return body;
    };
    const seoOk = { metaTitle: "שיפור הנראות של עסק מקומי בגוגל", metaDescription: "מדריך מעשי לשיפור הנראות של עסק מקומי בגוגל ובמנועי בינה מלאכותית, עם התיקונים החשובים ביותר לשבוע הקרוב שלכם.", slug: "shipur-nireut-esek-mekomi", keywords: ["נראות עסק מקומי", "קידום מקומי", "פרופיל עסק בגוגל"] };
    const seoCalls: string[] = [];
    let seoScript: Raw[] = [seoOk];
    const client = {
      messages: {
        create: async (p: { system: string; messages: { content: string }[] }) => {
          const reply = (o: unknown) => ({ model: "fake", stop_reason: "end_turn", usage: { input_tokens: 5, output_tokens: 5 }, content: [{ type: "text", text: JSON.stringify(o) }] });
          if (p.system.includes("SEO specialist")) {
            seoCalls.push(p.messages[0].content);
            return reply(seoScript.shift() ?? seoOk);
          }
          if (p.system.includes("translation reviewer")) return reply({ issues: [] });
          const payload = JSON.parse(/<source[^>]*>\n([\s\S]*?)\n<\/source>/.exec(p.messages[0].content)![1]) as { units: { i: number; type: string; text: string }[] };
          return reply({
            title: "איך עסקים מקומיים משפרים את הנראות שלהם בגוגל",
            excerpt: "מבט מעשי על האופן שבו עסקים מקומיים מופיעים בגוגל ובתשובות של בינה מלאכותית, עם התיקונים הקטנים שחשובים ביותר.",
            category: "קידום מקומי",
            tags: ["קידום מקומי", "נראות"],
            units: payload.units.map((u) => ({ i: u.i, text: u.type === "heading" ? "כותרת מעשית על נראות" : heFor(u.text) })),
          });
        },
      },
    } as unknown as Anthropic;
    const opts = { from: "en", to: "he", model: "m", glossary: buildGlossary(), sdk: Anthropic, review: true };
    const out = (await localizeArticle(client, src, opts).catch((e: Error) => e)) as LocalizedArticle | Error;
    if (out instanceof Error) check("localization runs end to end", false, out.message);
    else {
      check("the localized article keeps the block structure and headings", out.blocks.length === src.blocks.length && out.blocks.filter((b) => b.type === "heading").length === src.blocks.filter((b) => b.type === "heading").length, `${out.blocks.length}/${src.blocks.length}`);
      check("the FAQ comes back with the same number of items, split from the body by position", out.faq.length === 3 && out.faq.every((f) => f.question && f.answer));
      check("the CTA (closing heading and paragraph) is localized with the body", out.blocks.at(-2)?.type === "heading" && out.blocks.at(-1)?.type === "paragraph" && /[֐-׿]/.test(JSON.stringify(out.blocks.at(-1))));
      check("site-relative links are rewritten to the target language's page", JSON.stringify(out.blocks).includes('"href":"/he/methodology"') && !JSON.stringify(out.blocks).includes('"href":"/en/'), JSON.stringify(out.blocks).match(/"href":"[^"]+"/g)?.join());
      check("SEO fields are written for the target language (own slug, meta title, description, keywords)", out.slug === "shipur-nireut-esek-mekomi" && /[֐-׿]/.test(out.metaTitle) && out.keywords.length === 3 && out.slug !== src.slug);
      check("the localization was verified by the deterministic checks and the review", out.report.status === "verified", JSON.stringify(out.report.issues.slice(0, 2)));
      check("model calls: translate + review + SEO = 3", out.calls === 3, String(out.calls));
      const noReview = await localizeArticle(client, src, { ...opts, review: false });
      check("with review switched off, one call is saved", noReview.calls === 2);
      seoScript = [{ ...seoOk, metaTitle: "x".repeat(99) }, seoOk];
      const retried = await localizeArticle(client, src, opts);
      check("unusable SEO fields are retried once with feedback", retried.slug === seoOk.slug && seoCalls.at(-1)!.includes("rejected"));
    }
    check("blocksToFaq / faqToBlocks round-trip", blocksToFaq(faqToBlocks(article.faq) as never).length === 3);
    check("a non-Latin slug with no Latin fallback is rejected (so the model is asked again)", (() => { try { validateSeo({ ...seoOk, slug: "עברית" }, "he", "איך משפרים נראות"); return false; } catch (e) { return e instanceof GenerationError && /slug/.test(e.message); } })());
    check("a good Latin slug is kept, an accented one is folded", validateSeo({ ...seoOk, slug: "Visibilidad-Négocio Local" }, "he", "x").slug === "visibilidad-negocio-local");
    check("locale rewriting touches only the language prefix", rewriteLocalePaths([{ type: "paragraph", content: [{ type: "link", href: "/en/platform?x=1", content: [] }, { type: "link", href: "https://en.example/en/x", content: [] }] }], "en", "es")[0].content?.toString() !== undefined && JSON.stringify(rewriteLocalePaths([{ type: "paragraph", content: [{ type: "link", href: "/en/platform?x=1", content: [] }, { type: "link", href: "https://www.georepute.ai/en/x", content: [] }] }], "en", "es")) === JSON.stringify([{ type: "paragraph", content: [{ type: "link", href: "/es/platform?x=1", content: [] }, { type: "link", href: "https://www.georepute.ai/en/x", content: [] }] }]));
  }

  section("The engine: planning, generating, localizing, publishing");
  {
    const t = setup({ articlesPerDay: 2, lookaheadDays: 3 });
    t.store.addTopics(10);
    const first = await t.tick();
    check("the first tick plans 3 days x 2 topics", first.planned === 6 && t.store.topics.filter((x) => x.scheduled_date).length === 6, JSON.stringify(first));
    check("each planned topic has one variant per language (from the site's list)", t.store.variants.length === 6 * LOCALES.length && t.store.topics.filter((x) => x.scheduled_date).every((x) => t.store.variants.filter((v) => v.topic_id === x.id).length === LOCALES.length));
    check("only one variant per topic is the canonical article", t.store.topics.filter((x) => x.scheduled_date).every((x) => t.store.variants.filter((v) => v.topic_id === x.id && v.is_source).length === 1));
    check("the tick did real work and stopped at its job cap", first.generated + first.localized === 40, `${first.generated}+${first.localized}`);
    const second = await t.tick();
    check("the next tick finishes the rest (42 jobs in total, nothing repeated)", first.generated + first.localized + second.generated + second.localized === 42 && t.f.calls.length === 42, String(t.f.calls.length));
    check("6 canonical articles were written, and 36 localizations, none more than once", t.f.calls.filter((c) => c.kind === "generate").length === 6 && t.f.calls.filter((c) => c.kind === "localize").length === 36);
    check("no localization started before its canonical article existed", t.f.calls.findIndex((c) => c.kind === "localize") > t.f.calls.findIndex((c) => c.kind === "generate") && t.f.calls.slice(0, 6).every((c) => c.kind === "generate"), t.f.calls.slice(0, 8).map((c) => c.kind[0]).join(""));
    check("with auto-publish on and review off, finished articles are scheduled, not yet live", t.store.v("scheduled").length === 42 && t.store.posts.every((p) => p.status === "draft"));
    check("every language version is its own post with its own slug", new Set(t.store.posts.map((p) => `${p.locale}/${p.slug}`)).size === 42);
    check("versions of one topic share a translation group", (() => { const g = new Map<string, Set<string>>(); for (const v of t.store.variants) { const topic = t.store.topics.find((x) => x.id === v.topic_id)!; g.set(topic.translation_group, (g.get(topic.translation_group) ?? new Set()).add(v.post_id!)); } return [...g.values()].every((s) => s.size === LOCALES.length); })());
    check("nothing is published before its time", (await t.tick(), t.store.posts.every((p) => p.status === "draft")));
    t.c.set("2026-09-26T09:05:00Z");
    const pub = await t.tick();
    check("at 09:00 the first article is published in every language (and only that one)", pub.published === LOCALES.length && t.store.posts.filter((p) => p.status === "published").length === LOCALES.length, String(pub.published));
    check("a topic whose every language is live becomes Completed, the others stay in progress", t.store.topics.filter((x) => x.status === "completed").length === 1 && t.store.topics.filter((x) => x.status === "queued" && x.scheduled_date).length === 5);
    check("the second slot (09:15) is not published early", t.store.v("published").every((v) => v.scheduled_at!.endsWith("09:00:00.000Z")));
    t.c.set("2026-09-26T09:20:00Z");
    await t.tick();
    check("later slots publish when their time comes", t.store.v("published").length === 2 * LOCALES.length);
    check("published posts carry the scheduled publication time", t.store.posts.filter((p) => p.status === "published").every((p) => p.publishedAt !== null));
    check("the heartbeat is recorded for the dashboard", t.store.settings.lastTickAt !== null && t.store.ticks.length >= 4);
    // Topics 7..10 were not planned: the window only holds 3 days.
    check("topics beyond the look-ahead wait in the queue (no over-generation)", t.store.topics.filter((x) => !x.scheduled_date && x.status === "queued").length === 4);
    t.c.set("2026-09-27T05:00:00Z");
    const next = await t.tick();
    check("the next day the window moves and new topics are planned", next.planned === 2, JSON.stringify(next));
  }

  section("Featured images (Unsplash)");
  {
    const photo = (id: string, over: Record<string, unknown> = {}) => ({
      urls: { regular: `https://images.unsplash.com/${id}?w=1080` },
      user: { name: `Photographer ${id}`, links: { html: `https://unsplash.com/@${id}` } },
      links: { html: `https://unsplash.com/photos/${id}`, download_location: `https://api.unsplash.com/photos/${id}/download` },
      ...over,
    });
    const requests: { url: string; auth: string | null }[] = [];
    const scripted = (results: unknown[], status = 200): typeof fetch =>
      (async (input: string | URL | Request, init?: RequestInit) => {
        requests.push({ url: String(input), auth: new Headers(init?.headers).get("authorization") });
        return new Response(JSON.stringify({ results }), { status });
      }) as typeof fetch;

    const finder = createUnsplashFinder({ accessKey: "KEY", appName: "app", fetchImpl: scripted([photo("a"), photo("b"), photo("c")]) });
    const img = await finder.find("shop window night", "topic-1");
    check("a photo is found with the API's own image URL (hotlinked, unchanged)", !!img && img.url.startsWith("https://images.unsplash.com/") && img.credit.url === img.url);
    check("the request is authorized with the access key and searches landscape photos", requests[0].auth === "Client-ID KEY" && requests[0].url.includes("orientation=landscape") && requests[0].url.includes("shop+window+night"));
    check("a download is reported to Unsplash for the chosen photo", requests.length === 2 && requests[1].url.endsWith("/download"));
    check("the credit links carry the UTM tags", !!img && img.credit.photographerUrl.includes("utm_source=app") && img.credit.photographerUrl.includes("utm_medium=referral") && img.credit.sourceUrl.includes("utm_source=app"));
    check("the same topic always gets the same photo", (await finder.find("shop window night", "topic-1"))?.url === img?.url);
    check("different topics spread over the results", new Set(await Promise.all(["t1", "t2", "t3", "t4", "t5", "t6"].map(async (s) => (await finder.find("x y", s))?.url))).size > 1);
    check("a photo from another host is never used", (await createUnsplashFinder({ accessKey: "K", appName: "a", fetchImpl: scripted([photo("a", { urls: { regular: "https://evil.example/a.jpg" } })]) }).find("q q", "s")) === null);
    check("rate limiting or an API error gives no image, not an exception", (await createUnsplashFinder({ accessKey: "K", appName: "a", fetchImpl: scripted([], 403) }).find("q q", "s")) === null);
    check("a network failure gives no image, not an exception", (await createUnsplashFinder({ accessKey: "K", appName: "a", fetchImpl: (async () => { throw new Error("down"); }) as typeof fetch }).find("q q", "s")) === null);
    check("no key means no request and no image", (await createUnsplashFinder({ accessKey: "", appName: "a", fetchImpl: scripted([photo("a")]) }).find("q q", "s")) === null);
    check("a credit is only shown for the image it was made for", !!img && creditFor(img.url, img.credit) !== null && creditFor("https://elsewhere/x.jpg", img.credit) === null && creditFor(img.url, { photographer: "x" }) === null);

    const stub: ImageFinder = { find: async (q) => ({ url: "https://images.unsplash.com/one", credit: { ...img!.credit, url: "https://images.unsplash.com/one" } }) };
    const t = setup({ articlesPerDay: 1, lookaheadDays: 1 });
    t.store.addTopics(1);
    const withImages = { ...t.deps, images: stub };
    await runTick(withImages, { trigger: "manual", budgetMs: 265_000 });
    check("the canonical article gets the featured image", t.store.posts.length > 0 && t.store.posts.some((p) => p.featuredImage === "https://images.unsplash.com/one" && p.featuredImageCredit?.photographer));
    check("every language version shares the source article's photo and credit", t.store.posts.length === LOCALES.length && t.store.posts.every((p) => p.featuredImage === "https://images.unsplash.com/one" && p.featuredImageCredit));

    const broken = setup({ articlesPerDay: 1, lookaheadDays: 1 });
    broken.store.addTopics(1);
    await runTick({ ...broken.deps, images: { find: async () => { throw new Error("boom"); } } }, { trigger: "manual", budgetMs: 265_000 });
    check("an image lookup that throws never fails the article", broken.store.posts.length === LOCALES.length && broken.store.v("scheduled").length === LOCALES.length && broken.store.posts.every((p) => !p.featuredImage));
  }

  section("Language modes");
  {
    const t = setup({ articlesPerDay: 7, languageMode: "rotate", lookaheadDays: 1 });
    t.store.addTopics(7);
    await t.tick();
    check("rotate: 7 articles a day is 7 pieces (not 49), one language each", t.store.variants.length === 7 && new Set(t.store.variants.map((v) => v.locale)).size === LOCALES.length && t.f.calls.every((c) => c.kind === "generate"));
    check("rotate: every piece is written directly in its own language (no localization step)", t.f.calls.filter((c) => c.kind === "localize").length === 0);
    const sub = setup({ articlesPerDay: 1, languages: ["en", "fr"], lookaheadDays: 1 });
    sub.store.addTopics(1);
    await sub.tick();
    check("a chosen subset of languages only produces those languages", sub.store.variants.map((v) => v.locale).join() === "en,fr");
    const de = setup({ articlesPerDay: 1, lookaheadDays: 1 });
    de.store.addTopics(1);
    await runTick({ ...de.deps, supported: [...LOCALES, "de"] }, { trigger: "manual", budgetMs: 265_000 });
    check("a language added to the site later is scheduled without any code change", de.store.variants.some((v) => v.locale === "de"));
  }

  section("Failures never lose a topic or stop the queue");
  {
    const t = setup({ articlesPerDay: 3, languages: ["en"], lookaheadDays: 1, maxAttempts: 3 });
    t.store.addTopics(3);
    t.f.failures.push(new GenerationError("invalid_output", "The draft was not usable: the title is 3 characters."));
    const r1 = await t.tick();
    const failedOnce = t.store.variants.find((v) => v.attempts === 1)!;
    check("a bad result is saved as a retry: message, code and attempt count kept, topic kept", failedOnce.status === "queued" && failedOnce.error_code === "invalid_output" && !!failedOnce.last_error && failedOnce.next_attempt_at !== null && r1.retried === 1);
    check("the other topics in the same tick were not blocked", r1.generated === 2 && t.store.v("scheduled").length === 2);
    check("the retry is delayed (back-off), not immediate", new Date(failedOnce.next_attempt_at!).getTime() > t.c.now().getTime());
    t.c.advance(10 * 60_000);
    await t.tick();
    check("after the back-off the retry succeeds automatically and the error is cleared", failedOnce && t.store.variants.find((v) => v.id === failedOnce.id)!.status === "scheduled" && t.store.variants.find((v) => v.id === failedOnce.id)!.last_error === null);

    const x = setup({ articlesPerDay: 1, languages: ["en"], lookaheadDays: 1, maxAttempts: 2 });
    x.store.addTopics(1);
    for (let i = 0; i < 2; i++) {
      x.f.failures.push(new GenerationError("invalid_output", "bad"));
      await x.tick();
      x.c.advance(30 * 60_000);
    }
    const dead = x.store.variants[0];
    check("after the maximum attempts it is Failed, with the error kept and the topic still in the database", dead.status === "failed" && dead.attempts === 2 && !!dead.last_error && x.store.topics.length === 1);
    check("a manual retry puts it back with a fresh count, then it succeeds", (await retryVariant(x.store, dead.id)).ok && x.store.variants[0].attempts === 0 && (await x.tick(), x.store.variants[0].status === "scheduled"));

    const rl = setup({ articlesPerDay: 3, languages: ["en"], lookaheadDays: 1 });
    rl.store.addTopics(3);
    rl.f.failures.push(new GenerationError("rate_limited", "slow down", 90));
    const r2 = await rl.tick();
    check("a rate limit re-queues the item, pauses all calls and stops the tick", r2.retried === 1 && rl.store.settings.backoffUntil !== null && r2.generated <= 2);
    const calls = rl.f.calls.length;
    const r3 = await rl.tick();
    check("while backing off, later ticks make no Claude calls at all", rl.f.calls.length === calls && !!r3.skipped);
    rl.c.advance(2 * 3600_000);
    await rl.tick();
    check("after the back-off everything resumes and completes", rl.store.v("scheduled").length === 3);
    check("back-off grows with each attempt and honours Retry-After", backoffSeconds("rate_limited", 1, 90) === 90 && backoffSeconds("rate_limited", 3, 10) === 240 && backoffSeconds("overloaded", 2) === 120 && backoffSeconds("invalid_output", 2) === 240);

    const cfg = setup({ articlesPerDay: 2, languages: ["en"], lookaheadDays: 1 });
    cfg.store.addTopics(2);
    cfg.f.failures.push(new GenerationError("not_configured", "The Claude API key was rejected."));
    const r4 = await cfg.tick();
    const held = cfg.store.variants.find((v) => v.error_code === "not_configured")!;
    check("a missing/rejected API key does not burn attempts: the item waits, calls stop for a while", held.status === "queued" && held.attempts === 0 && r4.error !== null && cfg.store.settings.backoffUntil !== null);

    const stale = setup({ articlesPerDay: 1, languages: ["en"], lookaheadDays: 1, maxAttempts: 2 });
    stale.store.addTopics(1);
    await stale.tick();
    const v = stale.store.variants[0];
    Object.assign(v, { status: "generating", locked_until: new Date(stale.c.now().getTime() - 1000).toISOString() });
    await stale.tick();
    check("a job that died mid-way (expired lease) is picked up again instead of hanging forever", stale.store.variants[0].attempts === 1 && ["queued", "scheduled"].includes(stale.store.variants[0].status));
  }

  section("Validation blocks broken content from going live");
  {
    const t = setup({ articlesPerDay: 1, languages: ["en"], lookaheadDays: 1 });
    t.store.addTopics(1);
    await t.tick();
    const post = t.store.posts[0];
    post.blocks = [...post.blocks, { type: "paragraph", content: "Call us at [your phone number] today." }];
    t.c.set("2026-09-26T09:30:00Z");
    const r = await t.tick();
    check("a post that fails the gate at publish time is held back as needs review, not published", r.published === 0 && t.store.variants[0].status === "needs_review" && post.status === "draft");
    const issues = (t.store.variants[0].validation as { issues: { code: string }[] }).issues;
    check("the reason is stored for the admin", issues.some((i) => i.code === "placeholder_text"));
    post.blocks = post.blocks.slice(0, -1);
    const ap = await approveVariant(t.store, t.store.variants[0].id);
    check("after the fix, approving re-checks it and schedules it", ap.ok && t.store.variants[0].status === "scheduled");
    await t.tick();
    check("...and it publishes on the next tick", t.store.variants[0].status === "published" && post.status === "published");
    check("a single-language topic is Completed once published, and cannot then be skipped", t.store.topics[0].status === "completed" && !(await skipTopic(t.store, t.store.topics[0].id)).ok);
    const again = await publishVariantNow(t.store, t.store.variants[0].id);
    check("publishing something already published is refused", !again.ok);
    check("unpublish takes it down, keeps it ready and reopens the topic", (await unpublishVariant(t.store, t.store.variants[0].id)).ok && post.status === "draft" && t.store.variants[0].status === "ready" && t.store.topics[0].status === "queued");
  }

  section("Review, pause, resume, switches");
  {
    const t = setup({ articlesPerDay: 1, languages: ["en", "fr"], lookaheadDays: 1, requireReview: true, autoPublish: true });
    t.store.addTopics(1);
    await t.tick();
    check("with human review required, generated articles wait as Ready", t.store.v("ready").length === 2 && t.store.v("scheduled").length === 0);
    t.c.set("2026-09-26T10:00:00Z");
    await t.tick();
    check("...and are never published without approval, even when their time has passed", t.store.posts.every((p) => p.status === "draft"));
    check("approving one schedules it and it publishes on the next tick", (await approveVariant(t.store, t.store.variants[0].id)).ok && (await t.tick(), t.store.variants[0].status === "published" && t.store.variants[1].status === "ready"));

    const p = setup({ articlesPerDay: 2, languages: ["en"], lookaheadDays: 1 });
    p.store.addTopics(2);
    await p.tick();
    p.store.settings = { ...p.store.settings, generationPaused: true };
    p.store.addTopics(2);
    p.c.set("2026-09-26T09:30:00Z");
    const before = p.f.calls.length;
    const paused = await p.tick();
    check("paused: no planning and no generation, but scheduled articles still publish", p.f.calls.length === before && paused.planned === 0 && paused.published === 2 && !!paused.skipped);
    p.store.settings = { ...p.store.settings, generationPaused: false };
    p.c.set("2026-09-27T05:00:00Z");
    const resumed = await p.tick();
    check("resumed: work continues where it stopped", resumed.planned >= 1 && resumed.generated >= 1);

    const off = setup({ enabled: false, articlesPerDay: 2, lookaheadDays: 1 });
    off.store.addTopics(2);
    const idle = await off.tick();
    check("switched off: nothing is planned, generated or published", idle.planned === 0 && off.f.calls.length === 0 && off.store.variants.length === 0);

    const manual = setup({ articlesPerDay: 1, languages: ["en"], lookaheadDays: 1, autoPublish: false, requireReview: false });
    manual.store.addTopics(1);
    await manual.tick();
    manual.c.set("2026-09-26T12:00:00Z");
    await manual.tick();
    check("auto-publish off: articles stay Ready and never go live by themselves", manual.store.variants[0].status === "ready" && manual.store.posts[0].status === "draft");
    check("...and can be published by hand", (await publishVariantNow(manual.store, manual.store.variants[0].id, manual.c.now())).ok && manual.store.posts[0].status === "published");
    manual.store.settings = { ...manual.store.settings, autoPublish: true };
    const other = setup({ articlesPerDay: 1, languages: ["en"], lookaheadDays: 1, autoPublish: false, requireReview: false });
    other.store.addTopics(1);
    await other.tick();
    other.store.settings = { ...other.store.settings, autoPublish: true };
    other.c.set("2026-09-26T10:00:00Z");
    await other.tick();
    check("turning auto-publish on later publishes what is already ready and due", other.store.variants[0].status === "published");
  }

  section("Not wasting Claude calls");
  {
    const t = setup({ articlesPerDay: 1, lookaheadDays: 1 });
    t.store.addTopics(1);
    await t.tick();
    await t.tick();
    const total = t.f.calls.length;
    check("a full topic costs exactly 1 article + one localization per other language", total === LOCALES.length && t.f.calls.filter((c) => c.kind === "generate").length === 1);
    await t.tick();
    await t.tick();
    check("ticks with nothing to do make no calls", t.f.calls.length === total);
    const fr = t.store.variants.find((v) => v.locale === "fr")!;
    check("regenerating ONE language re-queues only that language", (await regenerateVariant(t.store, fr.id)).ok && t.store.v("queued").length === 1 && t.store.v("queued")[0].locale === "fr");
    await t.tick();
    const added = t.f.calls.slice(total);
    check("...and costs exactly one localization call (no new article, no other language)", added.length === 1 && added[0].kind === "localize" && added[0].locale === "fr", JSON.stringify(added));
    check("the regenerated version reuses its post (no orphan drafts)", t.store.posts.length === LOCALES.length);
    const en = t.store.variants.find((v) => v.is_source)!;
    await regenerateVariant(t.store, en.id);
    const q = t.store.v("queued");
    check("regenerating the canonical article alone leaves the translations untouched", q.length === 1 && q[0].is_source);
    check("...unless the admin asks to cascade", (await regenerateVariant(t.store, en.id, true)).ok && t.store.v("queued").length === LOCALES.length);
    const failedFr = t.store.variants.find((v) => v.locale === "es")!;
    Object.assign(failedFr, { status: "failed", attempts: 3, last_error: "x" });
    const before = t.f.calls.length;
    await retryVariant(t.store, failedFr.id);
    await t.store.updateVariant(en.id, { status: "scheduled" });
    for (const v of t.store.variants) if (v.id !== failedFr.id) v.status = "scheduled";
    await t.tick();
    check("retrying one failed language calls Claude once, for that language only", t.f.calls.length - before === 1 && t.f.calls.at(-1)!.locale === "es");
    check("claims are exclusive: a second worker cannot take a running job", await (async () => { const v = t.store.variants[0]; v.status = "queued"; const a = await t.store.claim(v.id, "generating", 1000, t.c.now()); const b = await t.store.claim(v.id, "generating", 1000, t.c.now()); return !!a && b === null; })());
  }

  section("Queue controls");
  {
    const t = setup({ articlesPerDay: 2, languages: ["en", "fr"], lookaheadDays: 2 });
    t.store.addTopics(5);
    await t.tick();
    const topic = t.store.topics[0];
    check("skipping a topic stops all of its languages and keeps the topic", (await skipTopic(t.store, topic.id)).ok && t.store.topics[0].status === "skipped" && t.store.variants.filter((v) => v.topic_id === topic.id).every((v) => v.status === "skipped"));
    const created = t.store.variants.length;
    t.c.advance(1000);
    await t.tick();
    check("a skipped topic frees its slot: the next waiting topic is planned into it", t.store.topics[4].scheduled_date !== null && t.store.topics.filter((x) => x.scheduled_date && x.status === "queued").length === 4, String(t.store.topics[4].scheduled_date));
    check("restoring a skipped topic that had produced articles brings them back for review", (await restoreTopic(t.store, topic.id)).ok && t.store.topics[0].status === "queued" && t.store.variants.filter((v) => v.topic_id === topic.id).every((v) => v.status === "ready"));
    const v = t.store.variants.find((x) => x.status === "scheduled")!;
    check("rescheduling changes the publish time and rejects a bad date", (await rescheduleVariant(t.store, v.id, new Date("2026-10-05T09:00:00Z"))).ok && t.store.variants.find((x) => x.id === v.id)!.scheduled_at === "2026-10-05T09:00:00.000Z" && !(await rescheduleVariant(t.store, v.id, new Date("nope"))).ok);
    const lower = setup({ articlesPerDay: 5, languages: ["en"], lookaheadDays: 1 });
    lower.store.addTopics(5);
    await lower.tick();
    lower.store.settings = { ...lower.store.settings, articlesPerDay: 2 };
    for (const vv of lower.store.variants) Object.assign(vv, { status: "queued", post_id: null, attempts: 0 });
    lower.f.calls.length = 0;
    await lower.tick();
    check("lowering articles per day gives back the surplus that has not started", lower.store.topics.filter((x) => x.scheduled_date && x.status === "queued").length === 2, String(lower.store.topics.filter((x) => x.scheduled_date).length));
  }

  section("Security and safety");
  {
    const cron = readSafe("app/api/cron/blog-automation/route.ts");
    check("the cron route requires a bearer secret and fails closed when none is configured", /CRON_SECRET/.test(cron) && /timingSafeEqual/.test(cron) && /status: 503/.test(cron) && /status: 401|"Unauthorized", \{ status: 401 \}/.test(cron));
    check("the cron route does not reveal why a request was refused", !/(wrong|invalid|mismatch).*secret/i.test(cron));
    const admin = readSafe("lib/supabase/admin.ts");
    check("the service-role key lives only in the server-only client", /import "server-only"/.test(admin));
    const users = walkAll(".").filter((f) => /process.env.SUPABASE_SERVICE_ROLE_KEY|createSupabaseServiceClient/.test(readSafe(f)) && !/\.md$|\.example$|scripts[\\/]/.test(f));
    check("only the client factory and the cron route touch the service-role key", users.every((f) => /lib[\\/]supabase[\\/]admin\.ts$|blog-automation[\\/]route\.ts$/.test(f)), users.join(", "));
    const actions = readSafe("lib/actions/blogAutomation.ts");
    const exported = [...actions.matchAll(/export async function (\w+)/g)].map((m) => m[1]);
    const unguarded = exported.filter((name) => !/(?:withAdmin|requireAdmin)\(/.test(actions.slice(actions.indexOf(`export async function ${name}`), actions.indexOf(`export async function ${name}`) + 400)));
    check(`every admin server action re-checks admin status (${exported.length} actions)`, exported.length >= 9 && unguarded.length === 0, unguarded.join(", "));
    check("the client never imports the Claude key module", !walkAll("components").some((f) => /services\/claude|blogAutomationRunner/.test(readSafe(f))));
    const sql = readSafe("SUPABASE_SETUP.md");
    check("the automation tables are admin-only under RLS (no anon policy)", /alter table public\.blog_topics enable row level security/.test(sql) && !/on public\.blog_(topics|variants|automation_settings)[^;]*to anon/i.test(sql));
  }

  await live();
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
}

/**
 * Optional, costs money (about 5 real Claude calls): proves the API accepts the article schema, that a real
 * article passes the publish gate, and that real localizations into two languages verify and pass it too.
 * Run with:  npm run automation:check -- --live
 */
async function live() {
  if (!process.argv.includes("--live")) {
    console.log("\nLive check skipped. With ANTHROPIC_API_KEY set, `npm run automation:check -- --live` makes about 5 real Claude calls.");
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    console.log("\nLive check skipped: ANTHROPIC_API_KEY is not set (add it to .env.local).");
    return;
  }
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  const client = new Anthropic({ apiKey: key, ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}), timeout: 110_000, maxRetries: 1 });
  const model = process.env.ANTHROPIC_BLOG_MODEL?.trim() || "claude-opus-5";
  const translationModel = process.env.ANTHROPIC_TRANSLATION_MODEL?.trim() || model;
  const config = { ...DEFAULT_SETTINGS.config, length: "short" as const };
  console.log(`\nLive check (${model})`);
  mkdirSync("scripts/.output", { recursive: true });
  const report: Record<string, unknown> = {};
  type Fields = { title: string; slug: string; excerpt: string; category: string; metaTitle: string; metaDescription: string; keywords: string[]; blocks: unknown; faq: { question: string; answer: string }[] };
  const gate = (locale: string, a: Fields) =>
    validateForPublish(
      { locale, slug: a.slug, title: a.title, excerpt: a.excerpt, metaTitle: a.metaTitle, metaDescription: a.metaDescription, keywords: a.keywords, category: a.category, blocks: a.blocks as ContentBlock[], faq: a.faq },
      { isAllowedLink: isAllowedLinkFor(config, locale), faqRequired: false },
    ).filter((i) => i.severity === "error");
  try {
    const started = Date.now();
    const article = await generateArticle(client, { topic: "How to improve your local business visibility on Google", primaryKeyword: "local business visibility", secondaryKeywords: ["google business profile", "local seo"], language: "en", config }, { model, sdk: Anthropic });
    console.log(`  article: ${article.wordCount} words in ${Math.round((Date.now() - started) / 1000)}s. ${article.title}\n  meta: ${article.metaTitle} | ${article.metaDescription}\n  slug: ${article.slug}, faq: ${article.faq.length}, keywords: ${article.keywords.join(", ")}`);
    check("live: the article passes the publish gate", gate("en", article).length === 0, JSON.stringify(gate("en", article)));
    report.article = article;
    const src = { title: article.title, excerpt: article.excerpt, category: article.category, tags: article.tags, blocks: article.blocks as unknown as ContentBlock[], faq: article.faq, metaTitle: article.metaTitle, metaDescription: article.metaDescription, keywords: article.keywords, slug: article.slug, primaryKeyword: "local business visibility" };
    for (const to of ["he", "fr"]) {
      const t0 = Date.now();
      const loc = await localizeArticle(client, src, { from: "en", to, model: translationModel, glossary: buildGlossary(), sdk: Anthropic, review: true });
      console.log(`  ${to}: ${loc.report.status}, ${loc.calls} calls, ${Math.round((Date.now() - t0) / 1000)}s. ${loc.title}\n    meta: ${loc.metaTitle}\n    slug: ${loc.slug}`);
      check(`live: ${to} localization is verified`, loc.report.status === "verified", JSON.stringify(loc.report.issues.slice(0, 3)));
      check(`live: ${to} passes the publish gate`, gate(to, loc).length === 0, JSON.stringify(gate(to, loc)));
      check(`live: ${to} has its own slug and SEO fields`, loc.slug !== article.slug && loc.metaTitle !== article.metaTitle && loc.faq.length === article.faq.length);
      report[to] = loc;
    }
  } catch (e) {
    check("live: calls succeeded", false, e instanceof GenerationError ? `${e.code}: ${e.message}` : String(e));
  }
  const file = `scripts/.output/automation-check-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(report, null, 2), "utf-8");
  console.log(`  Full output written to ${file} for human review.`);
}

function readSafe(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
}
function walkAll(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => !["node_modules", ".next", ".git", ".claude", "docs"].includes(f))
    .flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walkAll(p) : /\.(ts|tsx|md|example)$/.test(f) ? [p] : [];
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
