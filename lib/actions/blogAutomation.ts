"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";
import { normalizeSettings, type AutomationSettings, type TickSummary } from "@/lib/blog/automation/config";
import { zonedTimeToUtc } from "@/lib/blog/automation/schedule";
import { cleanTopic, type TopicInput } from "@/lib/blog/automation/topics";
import {
  approveVariant,
  publishVariantNow,
  regenerateVariant,
  rescheduleVariant,
  restoreTopic,
  retryVariant,
  skipTopic,
  unpublishVariant,
  type OpResult,
} from "@/lib/blog/automation/worker";
import { SupabaseAutomationStore, existingTopicKeys, insertTopics } from "@/lib/services/blogAutomation";
import { runAutomationTick } from "@/lib/services/blogAutomationRunner";
import { isServiceClientConfigured } from "@/lib/supabase/admin";
import { withinBudget } from "@/lib/services/rateLimit";
import { describeError } from "@/lib/utils/safeLog";

/**
 * Every function here is reachable by a direct POST, so each one re-checks that the caller is an admin
 * (`withAdmin` -> `requireAdmin`) before doing anything, exactly like lib/actions/posts.ts. Inputs from the
 * browser are treated as untrusted and re-validated here.
 */

export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

type Ctx = { supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"]; store: SupabaseAutomationStore; profileId: string };

async function withAdmin<T extends object = object>(fn: (ctx: Ctx) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    const { supabase, profile } = await requireAdmin();
    return await fn({ supabase, store: new SupabaseAutomationStore(supabase), profileId: profile.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("You must be signed in")) return { ok: false, error: message };
    console.error("[blog-automation] action failed:", describeError(error));
    // Data-layer errors are written to be readable ("Failed to load the queue: ..."); anything else is generic.
    return { ok: false, error: /^Failed to /.test(message) ? message : "Something went wrong. Try again." };
  }
}

function done(paths: string[] = []): { ok: true } {
  for (const p of ["/admin/automation", "/admin/automation/queue", ...paths]) revalidatePath(p);
  return { ok: true };
}
const fromOp = (r: OpResult): ActionResult => (r.ok ? done(["/blog"]) : { ok: false, error: r.error });

/* -------------------------------------------------------------------------- */
/* Settings and run state                                                     */
/* -------------------------------------------------------------------------- */

export type SettingsInput = Partial<Omit<AutomationSettings, "backoffUntil" | "lastTickAt" | "lastTickSummary">>;

export async function saveSettingsAction(input: SettingsInput): Promise<ActionResult> {
  return withAdmin(async ({ store }) => {
    const previous = await store.getSettings();
    // The runtime fields are not editable from the browser; normalizeSettings keeps the previous ones.
    await store.saveSettings(normalizeSettings(input as never, previous));
    return done(["/admin/automation/settings"]);
  });
}

export type AutomationOp = "start" | "stop" | "pause" | "resume" | "clear_backoff";

/** "Start Automation" and its siblings. Start refuses to switch on a system that cannot possibly work. */
export async function setAutomationStateAction(op: AutomationOp): Promise<ActionResult<{ warnings: string[] }>> {
  return withAdmin(async ({ store }) => {
    const s = await store.getSettings();
    const warnings: string[] = [];
    if (op === "start") {
      if (!process.env.ANTHROPIC_API_KEY?.trim()) return { ok: false, error: "The Claude API key is not configured on the server (ANTHROPIC_API_KEY), so nothing could be generated." };
      if (!process.env.CRON_SECRET?.trim() || !isServiceClientConfigured()) {
        warnings.push("The background scheduler is not configured yet (CRON_SECRET and SUPABASE_SERVICE_ROLE_KEY). Automation is on, but it only runs when you press Run now. See SUPABASE_SETUP.md, Step 13.");
      }
      await store.saveSettings({ ...s, enabled: true, generationPaused: false });
    } else if (op === "stop") await store.saveSettings({ ...s, enabled: false });
    else if (op === "pause") await store.saveSettings({ ...s, generationPaused: true });
    else if (op === "resume") await store.saveSettings({ ...s, generationPaused: false });
    else if (op === "clear_backoff") await store.setBackoff(null);
    else return { ok: false, error: "Unknown action." };
    return { ...done(), warnings };
  });
}

/** Runs one scheduler slice right now, as the signed-in admin. Bounded and rate limited; the scheduler does the same on its own. */
export async function runTickNowAction(): Promise<ActionResult<{ summary: TickSummary }>> {
  return withAdmin(async ({ supabase, profileId }) => {
    const budget = withinBudget(`automation-run:${profileId}`, 12, 60 * 60 * 1000);
    if (!budget.ok) return { ok: false, error: `Too many manual runs. Try again in about ${Math.ceil(budget.retryAfterSeconds / 60)} minutes.` };
    const summary = await runAutomationTick(supabase, "manual", 240_000);
    return { ...done(["/blog"]), summary };
  });
}

/* -------------------------------------------------------------------------- */
/* Topics                                                                     */
/* -------------------------------------------------------------------------- */

const MAX_IMPORT_PER_CALL = 500;

export async function addTopicAction(input: Partial<Record<keyof TopicInput, unknown>>, status: "draft" | "queued"): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const topic = cleanTopic(input);
    if (typeof topic === "string") return { ok: false, error: topic };
    if ((await existingTopicKeys(supabase, [topic.topic])).has(topic.topic.toLowerCase())) return { ok: false, error: "That topic is already in the queue." };
    await insertTopics(supabase, [topic], status === "draft" ? "draft" : "queued");
    return done(["/admin/automation/topics"]);
  });
}

/** Imports rows the browser parsed from CSV/Excel, in chunks. The browser is not trusted: every row is cleaned and de-duplicated again here. */
export async function importTopicsAction(rows: Partial<Record<keyof TopicInput, unknown>>[], status: "draft" | "queued"): Promise<ActionResult<{ inserted: number; duplicates: number; invalid: number }>> {
  return withAdmin(async ({ supabase }) => {
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "There is nothing to import." };
    if (rows.length > MAX_IMPORT_PER_CALL) return { ok: false, error: `Import at most ${MAX_IMPORT_PER_CALL} topics per request.` };
    const cleaned: TopicInput[] = [];
    let invalid = 0;
    for (const row of rows) {
      const t = cleanTopic(row ?? {});
      if (typeof t === "string") invalid++;
      else cleaned.push(t);
    }
    const existing = await existingTopicKeys(supabase, cleaned.map((t) => t.topic));
    const seen = new Set<string>();
    const fresh = cleaned.filter((t) => {
      const key = t.topic.toLowerCase();
      if (existing.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const inserted = fresh.length ? await insertTopics(supabase, fresh, status === "draft" ? "draft" : "queued") : 0;
    return { ...done(["/admin/automation/topics"]), inserted, duplicates: cleaned.length - fresh.length, invalid };
  });
}

export async function updateTopicAction(id: string, input: Partial<Record<keyof TopicInput, unknown>>): Promise<ActionResult> {
  return withAdmin(async ({ store }) => {
    const topic = cleanTopic(input);
    if (typeof topic === "string") return { ok: false, error: topic };
    if (!(await store.getTopic(String(id)))) return { ok: false, error: "That topic no longer exists." };
    await store.updateTopic(String(id), topic);
    return done();
  });
}

export type TopicBulkOp = "skip" | "restore" | "delete" | "queue" | "prioritize";

export async function topicsBulkAction(ids: string[], op: TopicBulkOp): Promise<ActionResult<{ changed: number }>> {
  return withAdmin(async ({ supabase, store }) => {
    const list = [...new Set((Array.isArray(ids) ? ids : []).map(String))].slice(0, 500);
    if (!list.length) return { ok: false, error: "Select at least one topic." };
    let changed = 0;

    if (op === "skip" || op === "restore") {
      for (const id of list) {
        const r = op === "skip" ? await skipTopic(store, id) : await restoreTopic(store, id);
        if (r.ok) changed++;
      }
    } else if (op === "queue") {
      const { data, error } = await supabase.from("blog_topics").update({ status: "queued" }).in("id", list).eq("status", "draft").select("id");
      if (error) return { ok: false, error: "Failed to queue the topics." };
      changed = data?.length ?? 0;
    } else if (op === "delete") {
      // A topic with a published article is history; keep it (skip it instead of deleting).
      const { data: published, error: pe } = await supabase.from("blog_variants").select("topic_id").in("topic_id", list).eq("status", "published");
      if (pe) return { ok: false, error: "Failed to check the topics." };
      const keep = new Set((published ?? []).map((v) => v.topic_id));
      const deletable = list.filter((id) => !keep.has(id));
      if (deletable.length) {
        const { data, error } = await supabase.from("blog_topics").delete().in("id", deletable).select("id");
        if (error) return { ok: false, error: "Failed to delete the topics." };
        changed = data?.length ?? 0;
      }
      if (keep.size && !changed) return { ok: false, error: "Topics with published articles cannot be deleted. Skip them instead." };
    } else if (op === "prioritize") {
      // Move to the front of the queue, keeping the selected topics in their current order.
      const { data: first } = await supabase.from("blog_topics").select("position").order("position", { ascending: true }).limit(1);
      const base = (first?.[0]?.position ?? 1) - list.length - 1;
      const { data: chosen } = await supabase.from("blog_topics").select("id, position").in("id", list).is("scheduled_date", null).order("position", { ascending: true });
      for (const [i, row] of (chosen ?? []).entries()) {
        const { error } = await supabase.from("blog_topics").update({ position: base + i }).eq("id", row.id);
        if (!error) changed++;
      }
    } else return { ok: false, error: "Unknown action." };

    return { ...done(["/admin/automation/topics"]), changed };
  });
}

/* -------------------------------------------------------------------------- */
/* Articles (one row per topic and language)                                  */
/* -------------------------------------------------------------------------- */

export type VariantOp = "retry" | "regenerate" | "regenerate_all" | "approve" | "publish" | "unpublish" | "reschedule";

/** `when` is a local date and time ("2026-10-01T09:30") in the automation's time zone, only used by "reschedule". */
export async function variantAction(id: string, op: VariantOp, when?: string): Promise<ActionResult> {
  return withAdmin(async ({ store }) => {
    const vid = String(id);
    switch (op) {
      case "retry":
        return fromOp(await retryVariant(store, vid));
      case "regenerate":
        return fromOp(await regenerateVariant(store, vid, false));
      case "regenerate_all":
        return fromOp(await regenerateVariant(store, vid, true));
      case "approve":
        return fromOp(await approveVariant(store, vid));
      case "publish":
        return fromOp(await publishVariantNow(store, vid));
      case "unpublish":
        return fromOp(await unpublishVariant(store, vid));
      case "reschedule": {
        const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(String(when ?? ""));
        if (!m) return { ok: false, error: "Choose a date and time." };
        const { timezone } = await store.getSettings();
        return fromOp(await rescheduleVariant(store, vid, zonedTimeToUtc(m[1], m[2], timezone)));
      }
      default:
        return { ok: false, error: "Unknown action." };
    }
  });
}

export type BulkVariantOp = "retry_failed" | "approve_ready";

/** Retries every failed article, or approves every article that is ready and passed all checks. Capped so one click stays quick. */
export async function bulkVariantAction(op: BulkVariantOp): Promise<ActionResult<{ changed: number; skipped: number }>> {
  return withAdmin(async ({ store }) => {
    let changed = 0;
    let skipped = 0;
    if (op === "retry_failed") {
      for (const v of await store.listVariantsByStatus("failed", 300)) (await retryVariant(store, v.id)).ok ? changed++ : skipped++;
    } else if (op === "approve_ready") {
      for (const v of await store.listVariantsByStatus("ready", 300)) (await approveVariant(store, v.id)).ok ? changed++ : skipped++;
    } else return { ok: false, error: "Unknown action." };
    return { ...done(["/blog"]), changed, skipped };
  });
}
