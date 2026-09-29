import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlogTopicRow, BlogVariantRow, Database, Json, PostLocale, TopicStatus, VariantStatus } from "@/types/database.types";
import type { ContentBlock } from "@/types/blocks";
import type { FaqItem } from "@/types/posts";
import { blocksToPlainText, textToBlocks } from "@/lib/utils/blocks";
import { slugFrom } from "@/lib/blog/generation";
import { DEFAULT_SETTINGS, settingsFromRow, settingsToRow, type AutomationSettings, type TickSummary } from "@/lib/blog/automation/config";
import { dateInZone, zonedTimeToUtc } from "@/lib/blog/automation/schedule";
import type { TopicInput } from "@/lib/blog/automation/topics";
import type { ImageCredit } from "@/lib/blog/automation/images";
import type { AutomationStore, Job, NewVariant, PostInput, StoredPost } from "@/lib/blog/automation/worker";

/**
 * Database access for the AI content automation. Like lib/services/posts.ts, every function runs as
 * whichever client the caller passes in: an admin's own session from the CMS (authorized by RLS), or the
 * server-only service client from the scheduler route (which has no browser session). Nothing here decides
 * who may call it; that is the caller's job (`requireAdmin()` or the cron secret).
 */

type Client = SupabaseClient<Database>;

function raise(action: string, error: { message: string } | null): never {
  throw new Error(`Failed to ${action}: ${error?.message ?? "unknown error"}`);
}

const iso = (d: Date) => d.toISOString();
const STARTED_STATUSES: VariantStatus[] = ["generating", "localizing", "needs_review", "ready", "scheduled", "published", "failed"];

function toStoredPost(row: Database["public"]["Tables"]["posts"]["Row"]): StoredPost {
  const blocks = (row.content_blocks as unknown as ContentBlock[] | null) ?? [];
  return {
    id: row.id,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category ?? "",
    tags: row.tags ?? [],
    blocks: blocks.length ? blocks : textToBlocks(row.content),
    faq: (row.faq as unknown as FaqItem[] | null) ?? [],
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    keywords: row.keywords ?? [],
    status: row.status,
    publishedAt: row.published_at,
    featuredImage: row.featured_image,
    featuredImageCredit: (row.featured_image_credit as unknown as ImageCredit | null) ?? null,
  };
}

export class SupabaseAutomationStore implements AutomationStore {
  constructor(private readonly db: Client) {}

  /* ------------------------------- settings -------------------------------- */

  async getSettings(): Promise<AutomationSettings> {
    const { data, error } = await this.db.from("blog_automation_settings").select("*").eq("id", 1).maybeSingle();
    if (error) raise("load automation settings", error);
    return settingsFromRow(data);
  }

  async saveSettings(settings: AutomationSettings): Promise<void> {
    const { error } = await this.db.from("blog_automation_settings").upsert({ id: 1, ...settingsToRow(settings) });
    if (error) raise("save automation settings", error);
  }

  async recordTick(summary: TickSummary): Promise<void> {
    const { error } = await this.db
      .from("blog_automation_settings")
      .update({ last_tick_at: summary.at, last_tick_summary: summary as unknown as Json })
      .eq("id", 1);
    if (error) raise("record the scheduler run", error);
  }

  async setBackoff(until: Date | null): Promise<void> {
    const { error } = await this.db.from("blog_automation_settings").update({ backoff_until: until ? iso(until) : null }).eq("id", 1);
    if (error) raise("set the backoff", error);
  }

  async tryPlanLease(ms: number, now: Date): Promise<boolean> {
    const { data, error } = await this.db
      .from("blog_automation_settings")
      .update({ plan_lock_until: iso(new Date(now.getTime() + ms)) })
      .eq("id", 1)
      .or(`plan_lock_until.is.null,plan_lock_until.lt.${iso(now)}`)
      .select("id");
    if (error) raise("take the planning lock", error);
    return (data ?? []).length > 0;
  }

  async releasePlanLease(): Promise<void> {
    await this.db.from("blog_automation_settings").update({ plan_lock_until: null }).eq("id", 1);
  }

  /* ------------------------------- planning -------------------------------- */

  async assignedCountsByDate(dates: string[]): Promise<Record<string, number>> {
    const entries = await Promise.all(
      dates.map(async (date) => {
        const { count, error } = await this.db.from("blog_topics").select("id", { count: "exact", head: true }).eq("scheduled_date", date).in("status", ["queued", "completed"]);
        if (error) raise("count planned topics", error);
        return [date, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries);
  }

  async plannedTopicCount(): Promise<number> {
    const { count, error } = await this.db.from("blog_topics").select("id", { count: "exact", head: true }).not("scheduled_date", "is", null);
    if (error) raise("count planned topics", error);
    return count ?? 0;
  }

  async nextQueuedTopics(limit: number): Promise<BlogTopicRow[]> {
    const { data, error } = await this.db
      .from("blog_topics")
      .select("*")
      .eq("status", "queued")
      .is("scheduled_date", null)
      .order("position", { ascending: true })
      .limit(limit);
    if (error) raise("load queued topics", error);
    return (data ?? []) as BlogTopicRow[];
  }

  async assignTopic(topicId: string, plan: { date: string; sourceLocale: string; planLocales: string[] }, variants: NewVariant[]): Promise<boolean> {
    // Compare-and-set: only a topic that is still unassigned can be taken, so two planners never plan the same topic.
    const { data, error } = await this.db
      .from("blog_topics")
      .update({ scheduled_date: plan.date, source_locale: plan.sourceLocale, plan_locales: plan.planLocales })
      .eq("id", topicId)
      .eq("status", "queued")
      .is("scheduled_date", null)
      .select("id");
    if (error) raise("plan a topic", error);
    if (!data?.length) return false;

    const { error: insertError } = await this.db
      .from("blog_variants")
      .upsert(variants.map((v) => ({ topic_id: topicId, ...v, status: "queued" as const })), { onConflict: "topic_id,locale", ignoreDuplicates: true });
    if (insertError) {
      await this.db.from("blog_topics").update({ scheduled_date: null, source_locale: null, plan_locales: [] }).eq("id", topicId);
      raise("create the language versions", insertError);
    }
    return true;
  }

  async unassignTopic(topicId: string): Promise<boolean> {
    const variants = await this.variantsOfTopic(topicId);
    if (variants.some((v) => v.post_id || v.attempts > 0 || STARTED_STATUSES.includes(v.status))) return false;
    const { error } = await this.db.from("blog_variants").delete().eq("topic_id", topicId);
    if (error) raise("clear a topic's plan", error);
    const { error: topicError } = await this.db.from("blog_topics").update({ scheduled_date: null, source_locale: null, plan_locales: [] }).eq("id", topicId);
    if (topicError) raise("clear a topic's plan", topicError);
    return true;
  }

  async unassignExtra(date: string, keep: number): Promise<number> {
    const { data, error } = await this.db
      .from("blog_topics")
      .select("id")
      .eq("scheduled_date", date)
      .eq("status", "queued")
      .order("position", { ascending: false });
    if (error) raise("load planned topics", error);
    let surplus = (data ?? []).length - keep;
    let freed = 0;
    for (const row of data ?? []) {
      if (surplus <= 0) break;
      if (await this.unassignTopic(row.id)) {
        freed++;
        surplus--;
      }
    }
    return freed;
  }

  /* -------------------------------- work ----------------------------------- */

  async reclaimStale(now: Date, maxAttempts: number): Promise<number> {
    const { data, error } = await this.db
      .from("blog_variants")
      .select("*")
      .in("status", ["generating", "localizing"])
      .or(`locked_until.is.null,locked_until.lt.${iso(now)}`)
      .limit(50);
    if (error) raise("look for stalled jobs", error);
    for (const v of (data ?? []) as BlogVariantRow[]) {
      const attempts = v.attempts + 1;
      await this.db
        .from("blog_variants")
        .update(
          attempts >= maxAttempts
            ? { status: "failed", attempts, locked_until: null, error_code: "timeout", last_error: "The job stopped responding and ran out of attempts." }
            : { status: "queued", attempts, locked_until: null, error_code: "timeout", last_error: "The job stopped responding; it will be retried." },
        )
        .eq("id", v.id)
        .in("status", ["generating", "localizing"]);
    }
    return (data ?? []).length;
  }

  async runnableJobs(now: Date, limit: number): Promise<Job[]> {
    const base = () => this.db.from("blog_variants").select("*").eq("status", "queued").or(`next_attempt_at.is.null,next_attempt_at.lte.${iso(now)}`).order("scheduled_at", { ascending: true, nullsFirst: false });
    const [sources, locals] = await Promise.all([base().eq("is_source", true).limit(limit * 2), base().eq("is_source", false).limit(limit * 10)]);
    if (sources.error) raise("load queued articles", sources.error);
    if (locals.error) raise("load queued translations", locals.error);
    const queued = [...((sources.data ?? []) as BlogVariantRow[]), ...((locals.data ?? []) as BlogVariantRow[])];
    if (!queued.length) return [];

    const topicIds = [...new Set(queued.map((v) => v.topic_id))];
    const [topicsRes, sourceRes] = await Promise.all([
      this.db.from("blog_topics").select("*").in("id", topicIds).eq("status", "queued").not("scheduled_date", "is", null),
      this.db.from("blog_variants").select("*").in("topic_id", topicIds).eq("is_source", true),
    ]);
    if (topicsRes.error) raise("load topics", topicsRes.error);
    if (sourceRes.error) raise("load source articles", sourceRes.error);
    const topics = new Map(((topicsRes.data ?? []) as BlogTopicRow[]).map((t) => [t.id, t]));
    const sourceOf = new Map(((sourceRes.data ?? []) as BlogVariantRow[]).map((v) => [v.topic_id, v]));

    // A translation can start only from a finished, usable source article.
    const usable: VariantStatus[] = ["ready", "scheduled", "published"];
    const postIds = [...new Set([...sourceOf.values()].filter((v) => usable.includes(v.status) && v.post_id).map((v) => v.post_id as string))];
    const posts = new Map<string, StoredPost>();
    if (postIds.length && queued.some((v) => !v.is_source)) {
      const { data, error } = await this.db.from("posts").select("*").in("id", postIds);
      if (error) raise("load source posts", error);
      for (const row of data ?? []) posts.set(row.id, toStoredPost(row));
    }

    const jobs: Job[] = [];
    for (const variant of queued) {
      const topic = topics.get(variant.topic_id);
      if (!topic) continue;
      if (variant.is_source) {
        jobs.push({ variant, topic, source: null });
        continue;
      }
      const src = sourceOf.get(variant.topic_id);
      const post = src?.post_id ? posts.get(src.post_id) : undefined;
      if (src && post && usable.includes(src.status)) jobs.push({ variant, topic, source: { variant: src, post } });
    }
    jobs.sort((a, b) => (a.variant.scheduled_at ?? "").localeCompare(b.variant.scheduled_at ?? "") || Number(b.variant.is_source) - Number(a.variant.is_source));
    return jobs.slice(0, limit);
  }

  async claim(variantId: string, status: "generating" | "localizing", leaseMs: number, now: Date): Promise<BlogVariantRow | null> {
    const { data, error } = await this.db
      .from("blog_variants")
      .update({ status, locked_until: iso(new Date(now.getTime() + leaseMs)) })
      .eq("id", variantId)
      .eq("status", "queued")
      .select("*");
    if (error) raise("claim a job", error);
    return ((data ?? [])[0] as BlogVariantRow | undefined) ?? null;
  }

  async updateVariant(id: string, patch: Partial<BlogVariantRow>): Promise<void> {
    const { error } = await this.db.from("blog_variants").update(patch).eq("id", id);
    if (error) raise("update an item", error);
  }

  async getVariant(id: string): Promise<BlogVariantRow | null> {
    const { data, error } = await this.db.from("blog_variants").select("*").eq("id", id).maybeSingle();
    if (error) raise("load an item", error);
    return (data as BlogVariantRow | null) ?? null;
  }

  async getTopic(id: string): Promise<BlogTopicRow | null> {
    const { data, error } = await this.db.from("blog_topics").select("*").eq("id", id).maybeSingle();
    if (error) raise("load a topic", error);
    return (data as BlogTopicRow | null) ?? null;
  }

  async variantsOfTopic(topicId: string): Promise<BlogVariantRow[]> {
    const { data, error } = await this.db.from("blog_variants").select("*").eq("topic_id", topicId).order("is_source", { ascending: false });
    if (error) raise("load a topic's items", error);
    return (data ?? []) as BlogVariantRow[];
  }

  async updateTopic(id: string, patch: Partial<BlogTopicRow>): Promise<void> {
    const { error } = await this.db.from("blog_topics").update(patch).eq("id", id);
    if (error) raise("update a topic", error);
  }

  async listVariantsByStatus(status: VariantStatus, limit: number): Promise<BlogVariantRow[]> {
    const { data, error } = await this.db.from("blog_variants").select("*").eq("status", status).order("scheduled_at", { ascending: true }).limit(limit);
    if (error) raise("load items", error);
    return (data ?? []) as BlogVariantRow[];
  }

  async dueVariants(now: Date, limit: number): Promise<BlogVariantRow[]> {
    const { data, error } = await this.db
      .from("blog_variants")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", iso(now))
      .order("scheduled_at", { ascending: true })
      .limit(limit);
    if (error) raise("load articles due for publishing", error);
    return (data ?? []) as BlogVariantRow[];
  }

  /* --------------------------------- posts --------------------------------- */

  async getPost(id: string): Promise<StoredPost | null> {
    const { data, error } = await this.db.from("posts").select("*").eq("id", id).maybeSingle();
    if (error) raise("load a post", error);
    return data ? toStoredPost(data) : null;
  }

  private async uniqueSlug(locale: string, wanted: string, ownId: string | null): Promise<string> {
    const base = slugFrom(wanted).slice(0, 80) || "article";
    for (let n = 1; n <= 30; n++) {
      const candidate = n === 1 ? base : `${base}-${n}`;
      let q = this.db.from("posts").select("id").eq("locale", locale as PostLocale).eq("slug", candidate);
      if (ownId) q = q.neq("id", ownId);
      const { data, error } = await q.limit(1);
      if (error) raise("check the slug", error);
      if (!data?.length) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  async savePost(existingId: string | null, input: PostInput): Promise<StoredPost> {
    const row = async (slug: string) => ({
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content: blocksToPlainText(input.blocks),
      content_blocks: input.blocks as unknown as Json,
      category: input.category || null,
      tags: input.tags,
      locale: input.locale as never,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      keywords: input.keywords,
      faq: input.faq as unknown as Json,
      translation_group: input.translationGroup,
    });

    if (existingId) {
      const existing = await this.getPost(existingId);
      if (existing?.status === "published") throw new Error("Refusing to overwrite a published post. Unpublish it first.");
      const { data, error } = await this.db.from("posts").update(await row(await this.uniqueSlug(input.locale, input.slug, existingId))).eq("id", existingId).select("*").single();
      if (error) raise("update the post", error);
      return toStoredPost(data);
    }

    // A concurrent insert can take the slug between the check and the insert; the unique index rejects it and we try the next suffix.
    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = await this.uniqueSlug(input.locale, attempt ? `${input.slug}-${Math.random().toString(36).slice(2, 6)}` : input.slug, null);
      const { data, error } = await this.db.from("posts").insert({ ...(await row(slug)), status: "draft", author_id: null }).select("*").single();
      if (!error) return toStoredPost(data);
      if (!/duplicate|unique/i.test(error.message)) raise("create the post", error);
    }
    throw new Error("Failed to create the post: the slug kept colliding.");
  }

  async setFeaturedImage(postId: string, image: { url: string; credit: ImageCredit | null }): Promise<void> {
    const { error } = await this.db
      .from("posts")
      .update({ featured_image: image.url, featured_image_credit: image.credit as unknown as Json })
      .eq("id", postId)
      .is("featured_image", null);
    if (error) raise("set the featured image", error);
  }

  async publishPost(postId: string, at: Date): Promise<void> {
    const { error } = await this.db.from("posts").update({ status: "published", published_at: iso(at) }).eq("id", postId);
    if (error) raise("publish the post", error);
  }

  async unpublishPost(postId: string): Promise<void> {
    const { error } = await this.db.from("posts").update({ status: "draft" }).eq("id", postId);
    if (error) raise("unpublish the post", error);
  }
}

/* -------------------------------------------------------------------------- */
/* Topics (CMS)                                                               */
/* -------------------------------------------------------------------------- */

/** Lower-cased topic texts that already exist, so an import can skip duplicates. Checked in chunks to keep URLs short. */
export async function existingTopicKeys(db: Client, topics: string[]): Promise<Set<string>> {
  const found = new Set<string>();
  for (let i = 0; i < topics.length; i += 100) {
    const chunk = topics.slice(i, i + 100);
    const { data, error } = await db.from("blog_topics").select("topic").in("topic", chunk);
    if (error) raise("check for duplicate topics", error);
    for (const row of data ?? []) found.add(row.topic.toLowerCase());
  }
  return found;
}

export async function insertTopics(db: Client, topics: TopicInput[], status: "draft" | "queued"): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < topics.length; i += 200) {
    const chunk = topics.slice(i, i + 200).map((t) => ({ ...t, status }));
    const { data, error } = await db.from("blog_topics").insert(chunk).select("id");
    if (error) raise("add topics", error);
    inserted += data?.length ?? 0;
  }
  return inserted;
}

/* -------------------------------------------------------------------------- */
/* Dashboard queries                                                          */
/* -------------------------------------------------------------------------- */

export type AutomationStats = {
  topicsTotal: number;
  topicsQueued: number; // waiting to be planned
  topicsPlanned: number;
  topicsCompleted: number;
  topicsSkipped: number;
  topicsDraft: number;
  generated: number;
  published: number;
  waiting: number; // ready + needs review + scheduled
  needsReview: number;
  ready: number;
  scheduled: number;
  failed: number;
  inProgress: number;
  retrying: number;
  generatedToday: number;
  publishedToday: number;
  remainingScheduled: number;
};

export async function getAutomationStats(db: Client, s: AutomationSettings, now = new Date()): Promise<AutomationStats> {
  const startOfToday = iso(zonedTimeToUtc(dateInZone(now, s.timezone), "00:00", s.timezone));
  const topics = (status?: TopicStatus, planned?: boolean) => {
    let q = db.from("blog_topics").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    if (planned === true) q = q.not("scheduled_date", "is", null);
    if (planned === false) q = q.is("scheduled_date", null);
    return q;
  };
  const variants = (statuses?: VariantStatus[]) => {
    const q = db.from("blog_variants").select("id", { count: "exact", head: true });
    return statuses ? q.in("status", statuses) : q;
  };
  const [tAll, tQueued, tPlanned, tCompleted, tSkipped, tDraft, gen, pub, review, ready, sched, failed, prog, retry, genToday, pubToday] = await Promise.all([
    topics(),
    topics("queued", false),
    topics("queued", true),
    topics("completed"),
    topics("skipped"),
    topics("draft"),
    db.from("blog_variants").select("id", { count: "exact", head: true }).not("generated_at", "is", null),
    variants(["published"]),
    variants(["needs_review"]),
    variants(["ready"]),
    variants(["scheduled"]),
    variants(["failed"]),
    variants(["generating", "localizing"]),
    db.from("blog_variants").select("id", { count: "exact", head: true }).eq("status", "queued").gt("attempts", 0),
    db.from("blog_variants").select("id", { count: "exact", head: true }).gte("generated_at", startOfToday),
    db.from("blog_variants").select("id", { count: "exact", head: true }).gte("published_at", startOfToday),
  ]);
  const n = (r: { count: number | null; error: { message: string } | null }) => {
    if (r.error) raise("load statistics", r.error);
    return r.count ?? 0;
  };
  return {
    topicsTotal: n(tAll),
    topicsQueued: n(tQueued),
    topicsPlanned: n(tPlanned),
    topicsCompleted: n(tCompleted),
    topicsSkipped: n(tSkipped),
    topicsDraft: n(tDraft),
    generated: n(gen),
    published: n(pub),
    waiting: n(review) + n(ready) + n(sched),
    needsReview: n(review),
    ready: n(ready),
    scheduled: n(sched),
    failed: n(failed),
    inProgress: n(prog),
    retrying: n(retry),
    generatedToday: n(genToday),
    publishedToday: n(pubToday),
    remainingScheduled: n(sched),
  };
}

export type QueueFilter = "all" | "unplanned" | "in_progress" | "attention" | "ready" | "scheduled" | "published" | "skipped" | "draft";

export type QueueTopic = BlogTopicRow & { variants: (BlogVariantRow & { post: { id: string; title: string; slug: string; status: string } | null })[] };

export const QUEUE_PAGE_SIZE = 25;

const FILTER_VARIANT_STATUSES: Partial<Record<QueueFilter, VariantStatus[]>> = {
  in_progress: ["generating", "localizing"],
  attention: ["failed", "needs_review"],
  ready: ["ready"],
  scheduled: ["scheduled"],
  published: ["published"],
};

export async function listQueue(db: Client, opts: { page: number; filter: QueueFilter; q?: string }): Promise<{ rows: QueueTopic[]; total: number }> {
  const from = (Math.max(1, opts.page) - 1) * QUEUE_PAGE_SIZE;
  const statuses = FILTER_VARIANT_STATUSES[opts.filter];
  // The variant filter joins through the topic, so a topic appears once however many of its languages match.
  let query = statuses
    ? db.from("blog_topics").select("*, blog_variants!inner(status)", { count: "exact" }).in("blog_variants.status", statuses)
    : db.from("blog_topics").select("*", { count: "exact" });
  if (opts.filter === "unplanned") query = query.eq("status", "queued").is("scheduled_date", null);
  if (opts.filter === "skipped") query = query.eq("status", "skipped");
  if (opts.filter === "draft") query = query.eq("status", "draft");
  const term = (opts.q ?? "").replace(/[%_,()\\]/g, " ").trim();
  if (term) query = query.ilike("topic", `%${term}%`);

  const { data, error, count } = await query.order("position", { ascending: true }).range(from, from + QUEUE_PAGE_SIZE - 1);
  if (error) raise("load the queue", error);
  const topics = ((data ?? []) as unknown as (BlogTopicRow & { blog_variants?: unknown })[]).map((t) => {
    const { blog_variants: _joined, ...row } = t;
    void _joined;
    return row as BlogTopicRow;
  });
  if (!topics.length) return { rows: [], total: count ?? 0 };

  const ids = topics.map((t) => t.id);
  const { data: variants, error: vError } = await db.from("blog_variants").select("*").in("topic_id", ids).order("is_source", { ascending: false });
  if (vError) raise("load the queue", vError);
  const postIds = [...new Set((variants ?? []).map((v) => v.post_id).filter((x): x is string => Boolean(x)))];
  const posts = new Map<string, { id: string; title: string; slug: string; status: string }>();
  if (postIds.length) {
    const { data: rows, error: pError } = await db.from("posts").select("id, title, slug, status").in("id", postIds);
    if (pError) raise("load the queue", pError);
    for (const p of rows ?? []) posts.set(p.id, p);
  }
  const byTopic = new Map<string, QueueTopic["variants"]>();
  for (const v of (variants ?? []) as BlogVariantRow[]) {
    const list = byTopic.get(v.topic_id) ?? [];
    list.push({ ...v, post: v.post_id ? (posts.get(v.post_id) ?? null) : null });
    byTopic.set(v.topic_id, list);
  }
  return { rows: topics.map((t) => ({ ...t, variants: byTopic.get(t.id) ?? [] })), total: count ?? 0 };
}

/** The automation state of the variants behind one post, for the post editor. Admin only (RLS). */
export async function getVariantForPost(db: Client, postId: string): Promise<{ variant: BlogVariantRow; topic: BlogTopicRow | null } | null> {
  const { data, error } = await db.from("blog_variants").select("*").eq("post_id", postId).maybeSingle();
  if (error) raise("load automation details", error);
  if (!data) return null;
  const { data: topic } = await db.from("blog_topics").select("*").eq("id", (data as BlogVariantRow).topic_id).maybeSingle();
  return { variant: data as BlogVariantRow, topic: (topic as BlogTopicRow | null) ?? null };
}

export { DEFAULT_SETTINGS };
