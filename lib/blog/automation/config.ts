/**
 * Automation settings: what the admin can change from the CMS without touching code.
 *
 * Pure module (no `server-only`, no runtime imports beyond the site's own language list) so the
 * worker, the settings form and the offline tests all read the same rules.
 *
 * Languages are never hard-coded here. "All languages" is stored as `null` and resolved against
 * `LOCALES` (lib/i18n.ts) every time it is used, so a language added to the site is picked up by
 * the next planning run with no change to this code or to the database.
 */
import { LOCALES } from "@/lib/i18n";
import { BLOG_LENGTHS, type BlogLength } from "@/lib/blog/generation";
import type { AutomationSettingsRow, Json } from "@/types/database.types";

export const MAX_ARTICLES_PER_DAY = 100;
export const MAX_LOOKAHEAD_DAYS = 30;

export type LanguageMode = "all_languages" | "rotate";
export type FaqMode = "auto" | "always" | "never";

/** Everything that shapes the *content* (as opposed to the schedule). All of it feeds the prompt; none of it is code. */
export type ContentConfig = {
  /** Allowed categories. Empty means the model may choose. */
  categories: string[];
  length: BlogLength;
  tone: string;
  seoInstructions: string;
  ctaInstructions: string;
  /** One rule per line: `/path | when to link here`. Also the only internal links an article may contain. */
  internalLinkingRules: string;
  /** Sections every article must have, for example "Key takeaways". */
  requiredSections: string[];
  faq: FaqMode;
  /** Pictures placed inside each article (not counting the featured image). 0 means none. */
  inlineImages: number;
  /** Charts and diagrams drawn inside each article. 0 means none. */
  charts: number;
  /** The generation rules. Empty means the built-in default (lib/blog/automation/prompt.ts). */
  systemPrompt: string;
  /** Empty means the server default (ANTHROPIC_BLOG_MODEL / ANTHROPIC_TRANSLATION_MODEL). */
  generationModel: string;
  translationModel: string;
  /** Run the independent bilingual review on every localization. Costs one more model call per language. */
  localizationReview: boolean;
};

export type AutomationSettings = {
  /** Master switch. Off means the scheduler does nothing at all (no planning, generating or publishing). */
  enabled: boolean;
  generationPaused: boolean;
  autoPublish: boolean;
  requireReview: boolean;
  articlesPerDay: number;
  languageMode: LanguageMode;
  sourceLocale: string;
  /** null = every language the site supports. */
  languages: string[] | null;
  /** YYYY-MM-DD in `timezone`, or null for "as soon as possible". */
  startDate: string | null;
  /** HH:MM in `timezone`. */
  publishTime: string;
  timezone: string;
  spreadMinutes: number;
  lookaheadDays: number;
  maxAttempts: number;
  concurrency: number;
  config: ContentConfig;
  backoffUntil: string | null;
  lastTickAt: string | null;
  lastTickSummary: TickSummary | null;
};

export type TickSummary = {
  at: string;
  trigger: "cron" | "manual";
  seconds: number;
  planned: number;
  generated: number;
  localized: number;
  published: number;
  failed: number;
  retried: number;
  skipped: string | null;
  error: string | null;
};

export const MAX_INLINE_IMAGES = 4;
export const MAX_CHARTS = 2;

export const DEFAULT_CONFIG: ContentConfig = {
  categories: [],
  length: "medium",
  tone: "Clear, practical and confident. Written for business owners and marketers, not for specialists.",
  seoInstructions:
    "Put the primary keyword in the title, the meta title, the first 100 words and at least one H2. Use secondary keywords where they fit naturally. Never stuff keywords.",
  ctaInstructions: "Close by inviting the reader to see how GeoRepute shows how their business is seen by Google and by AI engines.",
  internalLinkingRules: "",
  requiredSections: [],
  faq: "auto",
  inlineImages: 2,
  charts: 1,
  systemPrompt: "",
  generationModel: "",
  translationModel: "",
  localizationReview: true,
};

export const DEFAULT_SETTINGS: AutomationSettings = {
  enabled: false,
  generationPaused: false,
  autoPublish: false,
  requireReview: true,
  articlesPerDay: 1,
  languageMode: "all_languages",
  sourceLocale: "en",
  languages: null,
  startDate: null,
  publishTime: "09:00",
  timezone: "UTC",
  spreadMinutes: 15,
  lookaheadDays: 3,
  maxAttempts: 3,
  concurrency: 2,
  config: DEFAULT_CONFIG,
  backoffUntil: null,
  lastTickAt: null,
  lastTickSummary: null,
};

/* -------------------------------------------------------------------------- */
/* Coercion                                                                   */
/* -------------------------------------------------------------------------- */

const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};
const text = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const list = (v: unknown, maxItems: number, maxLen: number): string[] => {
  const raw = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[\n,]/) : [];
  return [...new Set(raw.map((x) => String(x).trim().slice(0, maxLen)).filter(Boolean))].slice(0, maxItems);
};

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function normalizeConfig(raw: unknown): ContentConfig {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_CONFIG;
  return {
    categories: list(c.categories, 40, 60),
    length: typeof c.length === "string" && c.length in BLOG_LENGTHS ? (c.length as BlogLength) : d.length,
    tone: text(c.tone, 600, d.tone),
    seoInstructions: text(c.seoInstructions, 2000, d.seoInstructions),
    ctaInstructions: text(c.ctaInstructions, 1000, d.ctaInstructions),
    internalLinkingRules: text(c.internalLinkingRules, 4000),
    requiredSections: list(c.requiredSections, 12, 80),
    faq: c.faq === "always" || c.faq === "never" || c.faq === "auto" ? c.faq : d.faq,
    inlineImages: clampInt(c.inlineImages, 0, MAX_INLINE_IMAGES, d.inlineImages),
    charts: clampInt(c.charts, 0, MAX_CHARTS, d.charts),
    systemPrompt: text(c.systemPrompt, 20000),
    generationModel: text(c.generationModel, 80),
    translationModel: text(c.translationModel, 80),
    localizationReview: bool(c.localizationReview, d.localizationReview),
  };
}

/**
 * Cleans a partial settings object from a form, an import or a database row. Unknown or out-of-range
 * values fall back to the previous value, never to something unsafe (for example, an invalid
 * time zone can never reach the scheduler).
 */
export function normalizeSettings(
  raw: Partial<Record<keyof AutomationSettings, unknown>>,
  previous: AutomationSettings = DEFAULT_SETTINGS,
  supported: readonly string[] = LOCALES,
): AutomationSettings {
  const p = previous;
  const languages =
    raw.languages === undefined
      ? p.languages
      : Array.isArray(raw.languages)
        ? [...new Set(raw.languages.map(String))].filter((l) => supported.includes(l))
        : null;
  const sourceRaw = typeof raw.sourceLocale === "string" ? raw.sourceLocale : p.sourceLocale;
  const time = typeof raw.publishTime === "string" && /^([01]\d|2[0-3]):[0-5]\d/.test(raw.publishTime) ? raw.publishTime.slice(0, 5) : p.publishTime;
  const tz = typeof raw.timezone === "string" && isValidTimeZone(raw.timezone) ? raw.timezone : p.timezone;
  const start = raw.startDate === undefined ? p.startDate : typeof raw.startDate === "string" && isValidDate(raw.startDate) ? raw.startDate : null;

  const next: AutomationSettings = {
    enabled: bool(raw.enabled, p.enabled),
    generationPaused: bool(raw.generationPaused, p.generationPaused),
    autoPublish: bool(raw.autoPublish, p.autoPublish),
    requireReview: bool(raw.requireReview, p.requireReview),
    articlesPerDay: clampInt(raw.articlesPerDay, 1, MAX_ARTICLES_PER_DAY, p.articlesPerDay),
    languageMode: raw.languageMode === "rotate" || raw.languageMode === "all_languages" ? raw.languageMode : p.languageMode,
    sourceLocale: supported.includes(sourceRaw) ? sourceRaw : "en",
    languages: languages && languages.length ? languages : languages === null ? null : p.languages,
    startDate: start,
    publishTime: time,
    timezone: tz,
    spreadMinutes: clampInt(raw.spreadMinutes, 0, 240, p.spreadMinutes),
    lookaheadDays: clampInt(raw.lookaheadDays, 1, MAX_LOOKAHEAD_DAYS, p.lookaheadDays),
    maxAttempts: clampInt(raw.maxAttempts, 1, 8, p.maxAttempts),
    concurrency: clampInt(raw.concurrency, 1, 4, p.concurrency),
    config: raw.config === undefined ? p.config : normalizeConfig({ ...p.config, ...(raw.config as object) }),
    backoffUntil: p.backoffUntil,
    lastTickAt: p.lastTickAt,
    lastTickSummary: p.lastTickSummary,
  };
  // The canonical language must be one that is actually published, otherwise a whole article is written for nothing.
  const resolved = resolveLanguages(next, supported);
  if (!resolved.includes(next.sourceLocale)) next.sourceLocale = resolved[0];
  return next;
}

/* -------------------------------------------------------------------------- */
/* Database rows                                                              */
/* -------------------------------------------------------------------------- */

export function settingsFromRow(row: AutomationSettingsRow | null | undefined, supported: readonly string[] = LOCALES): AutomationSettings {
  if (!row) return DEFAULT_SETTINGS;
  const summary = row.last_tick_summary && typeof row.last_tick_summary === "object" ? (row.last_tick_summary as unknown as TickSummary) : null;
  const base = normalizeSettings(
    {
      enabled: row.enabled,
      generationPaused: row.generation_paused,
      autoPublish: row.auto_publish,
      requireReview: row.require_review,
      articlesPerDay: row.articles_per_day,
      languageMode: row.language_mode,
      sourceLocale: row.source_locale,
      languages: row.languages,
      startDate: row.start_date,
      publishTime: row.publish_time,
      timezone: row.timezone,
      spreadMinutes: row.spread_minutes,
      lookaheadDays: row.lookahead_days,
      maxAttempts: row.max_attempts,
      concurrency: row.concurrency,
      config: row.content_config,
    },
    DEFAULT_SETTINGS,
    supported,
  );
  return { ...base, backoffUntil: row.backoff_until, lastTickAt: row.last_tick_at, lastTickSummary: summary };
}

/** The columns an admin can change. Runtime state (locks, backoff, heartbeat) is never written from here. */
export function settingsToRow(s: AutomationSettings): Partial<AutomationSettingsRow> {
  return {
    enabled: s.enabled,
    generation_paused: s.generationPaused,
    auto_publish: s.autoPublish,
    require_review: s.requireReview,
    articles_per_day: s.articlesPerDay,
    language_mode: s.languageMode,
    source_locale: s.sourceLocale,
    languages: s.languages,
    start_date: s.startDate,
    publish_time: s.publishTime,
    timezone: s.timezone,
    spread_minutes: s.spreadMinutes,
    lookahead_days: s.lookaheadDays,
    max_attempts: s.maxAttempts,
    concurrency: s.concurrency,
    content_config: s.config as unknown as Json,
  };
}

/* -------------------------------------------------------------------------- */
/* Derived values                                                             */
/* -------------------------------------------------------------------------- */

/** The languages articles are published in, in the site's own order. `null` means every supported language. */
export function resolveLanguages(s: Pick<AutomationSettings, "languages" | "sourceLocale">, supported: readonly string[] = LOCALES): string[] {
  const chosen = s.languages === null ? [...supported] : supported.filter((l) => s.languages?.includes(l));
  return chosen.length ? chosen : [supported.includes(s.sourceLocale) ? s.sourceLocale : supported[0]];
}

export type Workload = {
  languages: string[];
  topicsPerDay: number;
  /** Individual language versions published per day. */
  piecesPerDay: number;
  /** Rough number of Claude calls per day (generation, localization, meta, review). */
  callsPerDay: number;
  sentence: string;
};

/**
 * What the schedule really means, in numbers. The most misleading setting would be "100 per day" if an admin
 * read it as pieces and got 700, or the other way round, so the settings page shows this next to the field.
 */
export function describeWorkload(s: AutomationSettings, supported: readonly string[] = LOCALES): Workload {
  const languages = resolveLanguages(s, supported);
  const n = languages.length;
  const topics = s.articlesPerDay;
  const perLocalization = s.config.localizationReview ? 3 : 2; // translate, (review), SEO metadata
  if (s.languageMode === "rotate" || n === 1) {
    return {
      languages,
      topicsPerDay: topics,
      piecesPerDay: topics,
      callsPerDay: topics,
      sentence: `${topics} article${topics === 1 ? "" : "s"} per day, each written directly in one language, taking turns across ${n} language${n === 1 ? "" : "s"}. That is ${topics} piece${topics === 1 ? "" : "s"} per day and about ${topics} AI request${topics === 1 ? "" : "s"}.`,
    };
  }
  const pieces = topics * n;
  const calls = topics + topics * (n - 1) * perLocalization;
  return {
    languages,
    topicsPerDay: topics,
    piecesPerDay: pieces,
    callsPerDay: calls,
    sentence: `${topics} topic${topics === 1 ? "" : "s"} per day, each published in ${n === 2 ? "both" : `all ${n}`} languages. That is ${pieces} pieces per day and about ${calls} AI requests (1 to write, ${perLocalization} per translation).`,
  };
}
