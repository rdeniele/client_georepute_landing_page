/**
 * The automation engine: one `runTick` does a bounded slice of work and returns. It is called by the
 * scheduler (cron) every few minutes, or by an admin's "Run now". It never loops forever, never
 * waits for a browser, and keeps all durable state in the database, so any tick can be the last.
 *
 * Pipeline (each stage is its own step, so a failure in one cannot stop the others):
 *
 *   topics  -> PLAN      assign the next queued topics to publish days and create one variant per language
 *   variant -> GENERATE  write the canonical article with Claude (one call), store it as a draft post
 *   variant -> LOCALIZE  adapt the stored article into each other language (source must be ready)
 *   post    -> VALIDATE  deterministic publish gate; problems become "needs review", never a live post
 *   variant -> PUBLISH   at its scheduled time, and only if it still passes the gate
 *
 * The worker talks to two interfaces, `AutomationStore` (database) and `AutomationAi` (Claude), so the
 * whole state machine is tested offline with an in-memory store and a scripted model.
 */
import { LOCALES } from "@/lib/i18n";
import { GenerationError, type GenerationErrorCode } from "@/lib/blog/generation";
import type { BlogTopicRow, BlogVariantRow, VariantStatus } from "@/types/database.types";
import type { ContentBlock } from "@/types/blocks";
import type { FaqItem } from "@/types/posts";
import { isAllowedLinkFor, type ArticleRequest } from "./prompt";
import { hasBlockingIssues, validateForPublish, type Issue, type PublishCandidate } from "./validate";
import { assignTopics, dateInZone, addDays, planWindow } from "./schedule";
import type { AutomationSettings, TickSummary } from "./config";
import type { GeneratedArticle } from "./article";
import type { LocalizedArticle, SourceArticle } from "./localize";
import type { FeaturedImage, ImageCredit, ImageFinder } from "./images";

/* -------------------------------------------------------------------------- */
/* Interfaces                                                                 */
/* -------------------------------------------------------------------------- */

export type StoredPost = {
  id: string;
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  blocks: ContentBlock[];
  faq: FaqItem[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  featuredImage?: string | null;
  featuredImageCredit?: ImageCredit | null;
};

export type PostInput = Omit<StoredPost, "id" | "status" | "publishedAt"> & { translationGroup: string };

export type NewVariant = { locale: string; is_source: boolean; scheduled_at: string };

export type Job = {
  variant: BlogVariantRow;
  topic: BlogTopicRow;
  /** For a localization: the finished source article it is adapted from. */
  source: { variant: BlogVariantRow; post: StoredPost } | null;
};

export interface AutomationStore {
  getSettings(): Promise<AutomationSettings>;
  recordTick(summary: TickSummary): Promise<void>;
  setBackoff(until: Date | null): Promise<void>;
  tryPlanLease(ms: number, now: Date): Promise<boolean>;
  releasePlanLease(): Promise<void>;

  assignedCountsByDate(dates: string[]): Promise<Record<string, number>>;
  plannedTopicCount(): Promise<number>;
  nextQueuedTopics(limit: number): Promise<BlogTopicRow[]>;
  assignTopic(topicId: string, plan: { date: string; sourceLocale: string; planLocales: string[] }, variants: NewVariant[]): Promise<boolean>;
  /** Frees the last-queued topics on `date` beyond `keep`, but only ones whose work has not started. Returns how many were freed. */
  unassignExtra(date: string, keep: number): Promise<number>;
  /** Clears a topic's plan (day, languages, unstarted variants) so the planner slots it again. False if work on it has started. */
  unassignTopic(topicId: string): Promise<boolean>;

  reclaimStale(now: Date, maxAttempts: number): Promise<number>;
  runnableJobs(now: Date, limit: number): Promise<Job[]>;
  claim(variantId: string, status: "generating" | "localizing", leaseMs: number, now: Date): Promise<BlogVariantRow | null>;
  updateVariant(id: string, patch: Partial<BlogVariantRow>): Promise<void>;
  getVariant(id: string): Promise<BlogVariantRow | null>;
  getTopic(id: string): Promise<BlogTopicRow | null>;
  variantsOfTopic(topicId: string): Promise<BlogVariantRow[]>;
  updateTopic(id: string, patch: Partial<BlogTopicRow>): Promise<void>;
  listVariantsByStatus(status: VariantStatus, limit: number): Promise<BlogVariantRow[]>;
  dueVariants(now: Date, limit: number): Promise<BlogVariantRow[]>;

  getPost(id: string): Promise<StoredPost | null>;
  /** Creates or updates the draft post for a variant. The slug is made unique within its language. */
  savePost(existingId: string | null, input: PostInput): Promise<StoredPost>;
  /** Sets the featured image and its credit together. Never touches an image an editor already chose. */
  setFeaturedImage(postId: string, image: { url: string; credit: ImageCredit | null }): Promise<void>;
  publishPost(postId: string, at: Date): Promise<void>;
  unpublishPost(postId: string): Promise<void>;
}

export interface AutomationAi {
  generateArticle(req: ArticleRequest, model: string): Promise<GeneratedArticle>;
  localizeArticle(source: SourceArticle, o: { from: string; to: string; review: boolean; budgetMs: number; model: string }): Promise<LocalizedArticle>;
}

export type WorkerDeps = {
  store: AutomationStore;
  ai: AutomationAi;
  /** Optional: without it, articles are written without a featured image (an editor can add one). */
  images?: ImageFinder;
  now?: () => Date;
  supported?: readonly string[];
  /** Default models when the settings do not name one. */
  defaultModels?: { generation: string; translation: string };
  log?: (message: string) => void;
};

/**
 * A topic whose every language is published is "completed". It still counts against its day's capacity (the
 * articles are out), but it drops out of "in progress" and can no longer be skipped or re-planned.
 */
async function markCompletedIfDone(store: AutomationStore, topicId: string): Promise<void> {
  const variants = await store.variantsOfTopic(topicId);
  if (variants.some((v) => v.status === "published") && variants.every((v) => v.status === "published" || v.status === "skipped")) {
    await store.updateTopic(topicId, { status: "completed" });
  }
}

/* -------------------------------------------------------------------------- */
/* Pure decisions                                                             */
/* -------------------------------------------------------------------------- */

/** Codes that a later attempt can plausibly fix. */
const RETRYABLE = new Set<GenerationErrorCode>(["rate_limited", "overloaded", "timeout", "connection", "invalid_output", "truncated", "unknown"]);
/** Codes that mean the whole system cannot work right now (not just this article). */
const SYSTEMIC = new Set<GenerationErrorCode>(["not_configured", "billing"]);
const THROTTLED = new Set<GenerationErrorCode>(["rate_limited", "overloaded"]);

export function backoffSeconds(code: GenerationErrorCode, attempt: number, retryAfter?: number): number {
  const exp = 2 ** Math.max(0, attempt - 1);
  if (code === "rate_limited") return Math.min(3600, Math.max(retryAfter ?? 0, 60 * exp));
  if (code === "overloaded" || code === "connection" || code === "timeout") return Math.min(1800, 60 * exp);
  return Math.min(1800, 120 * attempt);
}

/** What a validated variant becomes. Problems never publish; review and auto-publish settings decide the rest. */
export function decideStatus(issues: Issue[], s: Pick<AutomationSettings, "requireReview" | "autoPublish">): VariantStatus {
  if (hasBlockingIssues(issues)) return "needs_review";
  if (s.requireReview) return "ready";
  return s.autoPublish ? "scheduled" : "ready";
}

function toCandidate(post: StoredPost): PublishCandidate {
  return {
    locale: post.locale,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    keywords: post.keywords,
    category: post.category,
    blocks: post.blocks,
    faq: post.faq,
  };
}

/** The publish gate for a stored post under the current settings. */
export function checkPost(post: StoredPost, s: AutomationSettings): Issue[] {
  return validateForPublish(toCandidate(post), {
    faqRequired: s.config.faq === "always",
    isAllowedLink: (href) => isAllowedLinkFor(s.config, post.locale)(href),
  });
}

const messageOf = (e: unknown) => (e instanceof GenerationError ? e.message : "The job failed unexpectedly.");


/* -------------------------------------------------------------------------- */
/* Tick                                                                       */
/* -------------------------------------------------------------------------- */

const MIN_SOURCE_MS = 120_000;
const MIN_LOCALIZATION_MS = 150_000;
const MAX_JOBS_PER_TICK = 40;

export type TickOptions = { trigger: "cron" | "manual"; budgetMs: number };

export async function runTick(deps: WorkerDeps, opts: TickOptions): Promise<TickSummary> {
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? (() => {});
  const supported = deps.supported ?? LOCALES;
  const store = deps.store;
  const started = now();
  const deadline = started.getTime() + opts.budgetMs;
  const summary: TickSummary = {
    at: started.toISOString(),
    trigger: opts.trigger,
    seconds: 0,
    planned: 0,
    generated: 0,
    localized: 0,
    published: 0,
    failed: 0,
    retried: 0,
    skipped: null,
    error: null,
  };

  const finish = async (): Promise<TickSummary> => {
    summary.seconds = Math.round((now().getTime() - started.getTime()) / 1000);
    await store.recordTick(summary).catch(() => {});
    return summary;
  };

  let settings: AutomationSettings;
  try {
    settings = await store.getSettings();
  } catch {
    summary.error = "Could not read the automation settings.";
    return summary;
  }
  if (!settings.enabled) {
    summary.skipped = "Automation is switched off.";
    return finish();
  }

  try {
    // 1. Publishing is independent of generation: it keeps working while generation is paused or backing off.
    summary.published += await publishDue(deps, settings, now());

    if (settings.generationPaused) {
      summary.skipped = "Generation is paused. Scheduled articles still publish.";
      return finish();
    }
    if (settings.backoffUntil && new Date(settings.backoffUntil).getTime() > now().getTime()) {
      summary.skipped = `Waiting until ${settings.backoffUntil} before calling Claude again.`;
      return finish();
    }

    // 2. Plan the next days.
    summary.planned += await planStep(deps, settings, supported);

    // 3. Generate and localize until the time budget is used.
    await workStep(deps, settings, summary, deadline);
  } catch (error) {
    // A bug or a database outage must not escape as an unhandled failure; the next tick starts clean.
    summary.error = error instanceof Error ? `Tick failed: ${error.name}` : "Tick failed.";
    log(`[blog-automation] ${summary.error}`);
  }
  return finish();
}

/* ------------------------------- publishing -------------------------------- */

async function publishDue(deps: WorkerDeps, s: AutomationSettings, now: Date): Promise<number> {
  const { store } = deps;
  if (!s.autoPublish) return 0;

  // Validated articles that were waiting only for the switches to allow it become scheduled.
  for (const v of await store.listVariantsByStatus("ready", 200)) {
    const approved = Boolean((v.meta as { approved?: boolean } | null)?.approved);
    if (!s.requireReview || approved) await store.updateVariant(v.id, { status: "scheduled" });
  }

  let published = 0;
  for (const v of await store.dueVariants(now, 100)) {
    if (!v.post_id) continue;
    const post = await store.getPost(v.post_id);
    if (!post) continue;
    const issues = checkPost(post, s);
    if (hasBlockingIssues(issues)) {
      await store.updateVariant(v.id, { status: "needs_review", validation: { issues, checkedAt: now.toISOString() } });
      continue;
    }
    const at = v.scheduled_at && new Date(v.scheduled_at) < now ? new Date(v.scheduled_at) : now;
    await store.publishPost(post.id, at);
    await store.updateVariant(v.id, { status: "published", published_at: now.toISOString(), validation: { issues, checkedAt: now.toISOString() } });
    await markCompletedIfDone(store, v.topic_id);
    published++;
  }
  return published;
}

/* -------------------------------- planning --------------------------------- */

async function planStep(deps: WorkerDeps, s: AutomationSettings, supported: readonly string[]): Promise<number> {
  const { store } = deps;
  const now = (deps.now ?? (() => new Date()))();
  if (!(await store.tryPlanLease(60_000, now))) return 0;
  try {
    const today = dateInZone(now, s.timezone);
    const dates = Array.from({ length: s.lookaheadDays }, (_, i) => addDays(today, i));
    let counts = await store.assignedCountsByDate(dates);

    // The per-day number was lowered: give back the surplus that has not started yet.
    let freed = 0;
    for (const date of dates) if ((counts[date] ?? 0) > s.articlesPerDay) freed += await store.unassignExtra(date, s.articlesPerDay);
    if (freed) counts = await store.assignedCountsByDate(dates);

    const days = planWindow(now, s, counts);
    const room = days.reduce((n, d) => n + d.free, 0);
    if (!room) return 0;

    const topics = await store.nextQueuedTopics(room);
    if (!topics.length) return 0;
    const ordinal = await store.plannedTopicCount();
    const assignments = assignTopics(topics.map((t) => t.id), days, s, ordinal, supported);

    let planned = 0;
    for (const a of assignments) {
      const when = a.scheduledAt.toISOString();
      const variants: NewVariant[] = [
        { locale: a.plan.source, is_source: true, scheduled_at: when },
        ...a.plan.targets.map((locale) => ({ locale, is_source: false, scheduled_at: when })),
      ];
      if (await store.assignTopic(a.topicId, { date: a.date, sourceLocale: a.plan.source, planLocales: [a.plan.source, ...a.plan.targets] }, variants)) planned++;
    }
    return planned;
  } finally {
    await store.releasePlanLease().catch(() => {});
  }
}

/* ------------------------------- generation -------------------------------- */

async function workStep(deps: WorkerDeps, s: AutomationSettings, summary: TickSummary, deadline: number): Promise<void> {
  const now = deps.now ?? (() => new Date());
  const { store } = deps;
  await store.reclaimStale(now(), s.maxAttempts);

  let stop = false;
  let started = 0;
  const attempted = new Set<string>();

  const worker = async (jobs: Job[]) => {
    while (!stop && started < MAX_JOBS_PER_TICK) {
      const job = jobs.shift();
      if (!job) return;
      const need = job.variant.is_source ? MIN_SOURCE_MS : MIN_LOCALIZATION_MS;
      if (deadline - now().getTime() < need) {
        stop = true;
        return;
      }
      const claimed = await store.claim(job.variant.id, job.variant.is_source ? "generating" : "localizing", need * 2 + 60_000, now());
      if (!claimed) continue; // another tick took it
      started++;
      const outcome = await runJob(deps, s, { ...job, variant: claimed }, deadline);
      if (outcome.kind === "generated") summary.generated++;
      else if (outcome.kind === "localized") summary.localized++;
      else if (outcome.kind === "retry") summary.retried++;
      else if (outcome.kind === "failed") summary.failed++;
      if (outcome.stop) {
        stop = true;
        if (outcome.reason) summary.error = outcome.reason;
      }
    }
  };

  for (let round = 0; round < 12 && !stop && started < MAX_JOBS_PER_TICK; round++) {
    if (deadline - now().getTime() < MIN_SOURCE_MS) break;
    const jobs = (await store.runnableJobs(now(), s.concurrency * 6)).filter((j) => !attempted.has(j.variant.id));
    if (!jobs.length) break;
    jobs.forEach((j) => attempted.add(j.variant.id));
    await Promise.all(Array.from({ length: Math.min(s.concurrency, jobs.length) }, () => worker(jobs)));
  }
}

type Outcome = { kind: "generated" | "localized" | "retry" | "failed" | "skipped"; stop?: boolean; reason?: string };

async function runJob(deps: WorkerDeps, s: AutomationSettings, job: Job, deadline: number): Promise<Outcome> {
  const now = deps.now ?? (() => new Date());
  const { store, ai } = deps;
  const models = deps.defaultModels ?? { generation: "", translation: "" };
  const { variant, topic } = job;
  const t0 = now().getTime();

  try {
    let post: StoredPost;
    let meta: Record<string, unknown>;
    let extra: Issue[] = [];
    // An admin can skip or reset an item while the model is working on it; in that case the result is discarded.
    const stillMine = async () => (await store.getVariant(variant.id))?.status === variant.status;

    if (variant.is_source) {
      const article = await ai.generateArticle(
        {
          topic: topic.topic,
          primaryKeyword: topic.primary_keyword,
          secondaryKeywords: topic.secondary_keywords,
          category: topic.category,
          searchIntent: topic.search_intent,
          notes: topic.notes,
          language: variant.locale,
          config: s.config,
        },
        s.config.generationModel || models.generation,
      );
      if (!(await stillMine())) return { kind: "skipped" };
      post = await store.savePost(variant.post_id, {
        locale: variant.locale,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        blocks: article.blocks as ContentBlock[],
        faq: article.faq,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        translationGroup: topic.translation_group,
      });
      const finder = deps.images;
      if (finder) await attachFeaturedImage(deps, post, () => finder.find(article.imageQuery, topic.id));
      meta = {
        ...(variant.meta as object | null),
        kind: "generation",
        model: article.model,
        usage: article.usage,
        wordCount: article.wordCount,
        imageConcept: article.imageConcept,
        linkOpportunities: article.linkOpportunities,
        cta: article.cta,
        seconds: Math.round((now().getTime() - t0) / 1000),
        approved: false,
      };
    } else {
      if (!job.source) throw new GenerationError("invalid_input", "The source article is missing.");
      const src = job.source.post;
      const localized = await ai.localizeArticle(
        {
          title: src.title,
          excerpt: src.excerpt,
          category: src.category,
          tags: src.tags,
          blocks: src.blocks,
          faq: src.faq,
          metaTitle: src.metaTitle,
          metaDescription: src.metaDescription,
          keywords: src.keywords,
          slug: src.slug,
          primaryKeyword: topic.primary_keyword,
        },
        {
          from: job.source.variant.locale,
          to: variant.locale,
          review: s.config.localizationReview,
          budgetMs: Math.max(60_000, Math.min(240_000, deadline - now().getTime() - 10_000)),
          model: s.config.translationModel || models.translation,
        },
      );
      if (!(await stillMine())) return { kind: "skipped" };
      post = await store.savePost(variant.post_id, {
        locale: variant.locale,
        slug: localized.slug,
        title: localized.title,
        excerpt: localized.excerpt,
        category: localized.category,
        tags: localized.tags,
        blocks: localized.blocks,
        faq: localized.faq,
        metaTitle: localized.metaTitle,
        metaDescription: localized.metaDescription,
        keywords: localized.keywords,
        translationGroup: topic.translation_group,
      });
      // Every language shows the same photo as the article it was adapted from.
      if (src.featuredImage) {
        await attachFeaturedImage(deps, post, async () => ({ url: src.featuredImage!, credit: src.featuredImageCredit ?? null }));
      }
      // Findings from the translation checks: serious ones hold the article back for a human.
      extra = localized.report.issues.map((i) => ({
        severity: i.severity === "minor" ? ("warning" as const) : ("error" as const),
        code: `translation_${i.kind}`,
        message: i.note,
      }));
      meta = {
        ...(variant.meta as object | null),
        kind: "localization",
        model: s.config.translationModel || models.translation,
        usage: localized.usage,
        calls: localized.calls,
        seconds: localized.seconds,
        translationStatus: localized.report.status,
        approved: false,
      };
    }

    const issues = [...checkPost(post, s), ...extra];
    const status = decideStatus(issues, s);
    await store.updateVariant(variant.id, {
      status,
      post_id: post.id,
      generated_at: now().toISOString(),
      last_error: null,
      error_code: null,
      next_attempt_at: null,
      locked_until: null,
      validation: { issues, checkedAt: now().toISOString() },
      meta: meta as never,
    });
    return { kind: variant.is_source ? "generated" : "localized" };
  } catch (error) {
    return handleFailure(deps, s, variant, error);
  }
}

/** A featured image is optional: whatever goes wrong here, the article still continues. */
async function attachFeaturedImage(deps: WorkerDeps, post: StoredPost, get: () => Promise<{ url: string; credit: ImageCredit | null } | FeaturedImage | null>): Promise<void> {
  if (post.featuredImage) return; // keep whatever an editor (or an earlier run) already set
  try {
    const image = await get();
    if (image) await deps.store.setFeaturedImage(post.id, image);
  } catch {
    // Missing column, API refusal, network: no image, no failure.
  }
}

async function handleFailure(deps: WorkerDeps, s: AutomationSettings, variant: BlogVariantRow, error: unknown): Promise<Outcome> {
  const now = (deps.now ?? (() => new Date()))();
  const { store } = deps;
  const code: GenerationErrorCode = error instanceof GenerationError ? error.code : "unknown";
  const message = messageOf(error);
  deps.log?.(`[blog-automation] ${variant.locale} job failed: ${code}`);

  // Not this article's fault: the key or the billing is wrong. Put it back untouched and stop calling Claude for a while.
  if (SYSTEMIC.has(code)) {
    const until = new Date(now.getTime() + 15 * 60_000);
    await store.updateVariant(variant.id, { status: "queued", locked_until: null, next_attempt_at: until.toISOString(), last_error: message, error_code: code });
    await store.setBackoff(until);
    return { kind: "retry", stop: true, reason: message };
  }

  const attempts = variant.attempts + 1;
  const retry = RETRYABLE.has(code) && attempts < s.maxAttempts;
  const wait = backoffSeconds(code, attempts, error instanceof GenerationError ? error.retryAfterSeconds : undefined);
  await store.updateVariant(
    variant.id,
    retry
      ? { status: "queued", attempts, locked_until: null, last_error: message, error_code: code, next_attempt_at: new Date(now.getTime() + wait * 1000).toISOString() }
      : { status: "failed", attempts, locked_until: null, last_error: message, error_code: code, next_attempt_at: null },
  );

  // Provider throttling affects every article, so pause all calls briefly instead of burning through the queue.
  if (THROTTLED.has(code)) {
    await store.setBackoff(new Date(now.getTime() + Math.max(60, wait) * 1000));
    return { kind: retry ? "retry" : "failed", stop: true, reason: message };
  }
  return { kind: retry ? "retry" : "failed" };
}

/* -------------------------------------------------------------------------- */
/* Manual operations (admin buttons)                                          */
/* -------------------------------------------------------------------------- */

export type OpResult = { ok: true } | { ok: false; error: string };
const ok: OpResult = { ok: true };
const no = (error: string): OpResult => ({ ok: false, error });

/** Puts a failed or stuck article back in the queue with a fresh retry count. Only this language is touched. */
export async function retryVariant(store: AutomationStore, id: string): Promise<OpResult> {
  const v = await store.getVariant(id);
  if (!v) return no("That item no longer exists.");
  if (v.status !== "failed" && v.status !== "needs_review") return no("Only failed or needs-review items can be retried.");
  await store.updateVariant(id, { status: "queued", attempts: 0, last_error: null, error_code: null, next_attempt_at: null, locked_until: null });
  return ok;
}

/**
 * Regenerates ONE language. For a translation this re-adapts it from the existing article (one localization, no new
 * article). For the canonical article it writes a new one; other languages are left alone unless `cascade` is set.
 */
export async function regenerateVariant(store: AutomationStore, id: string, cascade = false): Promise<OpResult> {
  const v = await store.getVariant(id);
  if (!v) return no("That item no longer exists.");
  if (v.status === "published") return no("Unpublish the article first, then regenerate it.");
  if (v.status === "generating" || v.status === "localizing") return no("This item is being generated right now.");
  const reset = { status: "queued" as const, attempts: 0, last_error: null, error_code: null, next_attempt_at: null, locked_until: null, validation: null };
  await store.updateVariant(id, reset);
  if (v.is_source && cascade) {
    for (const other of await store.variantsOfTopic(v.topic_id)) {
      if (other.id !== id && other.status !== "published" && other.status !== "skipped" && other.status !== "generating" && other.status !== "localizing") await store.updateVariant(other.id, reset);
    }
  }
  return ok;
}

export async function approveVariant(store: AutomationStore, id: string): Promise<OpResult> {
  const v = await store.getVariant(id);
  if (!v) return no("That item no longer exists.");
  if (v.status !== "ready" && v.status !== "needs_review") return no("Only articles that are ready or need review can be approved.");
  if (!v.post_id) return no("This item has no article yet.");
  const settings = await store.getSettings();
  const post = await store.getPost(v.post_id);
  if (!post) return no("The article no longer exists.");
  const issues = checkPost(post, settings);
  if (hasBlockingIssues(issues)) {
    await store.updateVariant(id, { status: "needs_review", validation: { issues, checkedAt: new Date().toISOString() } });
    return no(`It still has problems: ${issues.filter((i) => i.severity === "error").map((i) => i.message).slice(0, 2).join(" ")}`);
  }
  await store.updateVariant(id, {
    status: settings.autoPublish ? "scheduled" : "ready",
    validation: { issues, checkedAt: new Date().toISOString() },
    meta: { ...((v.meta as object | null) ?? {}), approved: true } as never,
  });
  return ok;
}

export async function publishVariantNow(store: AutomationStore, id: string, now = new Date()): Promise<OpResult> {
  const v = await store.getVariant(id);
  if (!v) return no("That item no longer exists.");
  if (v.status === "published") return no("Already published.");
  if (!v.post_id) return no("There is no article to publish yet.");
  const post = await store.getPost(v.post_id);
  if (!post) return no("The article no longer exists.");
  const issues = checkPost(post, await store.getSettings());
  if (hasBlockingIssues(issues)) {
    await store.updateVariant(id, { status: "needs_review", validation: { issues, checkedAt: now.toISOString() } });
    return no(`Not published: ${issues.filter((i) => i.severity === "error").map((i) => i.message).slice(0, 2).join(" ")}`);
  }
  await store.publishPost(post.id, now);
  await store.updateVariant(id, { status: "published", published_at: now.toISOString(), scheduled_at: v.scheduled_at ?? now.toISOString(), validation: { issues, checkedAt: now.toISOString() } });
  await markCompletedIfDone(store, v.topic_id);
  return ok;
}

export async function unpublishVariant(store: AutomationStore, id: string): Promise<OpResult> {
  const v = await store.getVariant(id);
  if (!v || !v.post_id) return no("That item no longer exists.");
  if (v.status !== "published") return no("It is not published.");
  await store.unpublishPost(v.post_id);
  await store.updateVariant(id, { status: "ready", published_at: null, meta: { ...((v.meta as object | null) ?? {}), approved: true } as never });
  const topic = await store.getTopic(v.topic_id);
  if (topic?.status === "completed") await store.updateTopic(topic.id, { status: "queued" });
  return ok;
}

export async function rescheduleVariant(store: AutomationStore, id: string, at: Date): Promise<OpResult> {
  const v = await store.getVariant(id);
  if (!v) return no("That item no longer exists.");
  if (Number.isNaN(at.getTime())) return no("That is not a valid date and time.");
  if (v.status === "published") return no("This article is already published.");
  await store.updateVariant(id, { scheduled_at: at.toISOString() });
  return ok;
}

/** Removes a topic from the pipeline without losing it (it can be restored). Started work on already-published articles is untouched. */
export async function skipTopic(store: AutomationStore, topicId: string): Promise<OpResult> {
  const topic = await store.getTopic(topicId);
  if (!topic) return no("That topic no longer exists.");
  if (topic.status === "completed") return no("This topic is already published.");
  for (const v of await store.variantsOfTopic(topicId)) {
    if (v.status !== "published" && v.status !== "skipped") await store.updateVariant(v.id, { status: "skipped", locked_until: null });
  }
  await store.updateTopic(topicId, { status: "skipped" });
  return ok;
}

/**
 * Puts a skipped topic back in the queue. Work that was never started is re-planned from scratch (new day, current settings);
 * articles that were already written come back as "ready" so a person confirms them again.
 */
export async function restoreTopic(store: AutomationStore, topicId: string): Promise<OpResult> {
  const topic = await store.getTopic(topicId);
  if (!topic) return no("That topic no longer exists.");
  if (topic.status !== "skipped") return no("Only skipped topics can be restored.");
  const variants = await store.variantsOfTopic(topicId);
  await store.updateTopic(topicId, { status: "queued" });
  if (!variants.some((v) => v.post_id)) {
    await store.unassignTopic(topicId);
    return ok;
  }
  for (const v of variants) {
    if (v.status !== "skipped") continue;
    await store.updateVariant(v.id, v.post_id ? { status: "ready", meta: { ...((v.meta as object | null) ?? {}), approved: false } as never } : { status: "queued", attempts: 0, last_error: null, error_code: null, next_attempt_at: null });
  }
  return ok;
}

