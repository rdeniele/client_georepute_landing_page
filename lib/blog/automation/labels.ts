/**
 * Human wording and roll-ups for the queue UI. Pure, shared by server pages and client tables.
 */
import type { BlogTopicRow, BlogVariantRow, VariantStatus } from "@/types/database.types";
import type { Issue } from "./validate";

/** The publish-gate findings stored on a variant (`validation.issues`), safely typed. */
export const asIssues = (v: unknown): Issue[] => {
  const raw = v && typeof v === "object" ? (v as { issues?: unknown }).issues : null;
  return Array.isArray(raw) ? (raw as Issue[]) : [];
};

export const STATUS_LABEL: Record<VariantStatus, string> = {
  queued: "Queued",
  generating: "Generating",
  localizing: "Translating",
  needs_review: "Needs review",
  ready: "Ready",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
  skipped: "Skipped",
};

/** One line explaining what each status means and what happens next, shown as a tooltip. */
export const STATUS_HELP: Record<VariantStatus, string> = {
  queued: "Waiting for the scheduler (or for a retry time).",
  generating: "Claude is writing the article right now.",
  localizing: "Claude is adapting the article into this language right now.",
  needs_review: "It did not pass the checks, or the translation was flagged. It will not publish until you fix and approve it.",
  ready: "Written and checked. Waiting for your approval or for you to publish it.",
  scheduled: "Approved. It publishes by itself at its scheduled time.",
  published: "Live on the blog.",
  failed: "All automatic attempts failed. Retry it, or read the error.",
  skipped: "Skipped. It will not be generated or published.",
};

export type TopicRollup = { label: string; tone: VariantStatus | "draft" | "unplanned" | "generated" };

/**
 * The single status shown for a topic. The most urgent state among its languages wins, so a topic with one
 * failed language reads "Failed" even if the others are fine.
 */
export function rollup(topic: Pick<BlogTopicRow, "status" | "scheduled_date">, variants: Pick<BlogVariantRow, "status" | "is_source">[]): TopicRollup {
  if (topic.status === "skipped") return { label: "Skipped", tone: "skipped" };
  if (topic.status === "draft") return { label: "Draft", tone: "draft" };
  if (!variants.length) return { label: "Queued", tone: topic.scheduled_date ? "queued" : "unplanned" };
  const has = (...s: VariantStatus[]) => variants.some((v) => s.includes(v.status));
  if (has("failed")) return { label: "Failed", tone: "failed" };
  if (has("needs_review")) return { label: "Needs review", tone: "needs_review" };
  if (has("generating")) return { label: "Generating", tone: "generating" };
  if (has("localizing")) return { label: "Translation in progress", tone: "localizing" };
  if (has("queued")) {
    const sourceDone = variants.some((v) => v.is_source && v.status !== "queued");
    return sourceDone ? { label: "Generated", tone: "generated" } : { label: "Queued", tone: "queued" };
  }
  if (has("ready")) return { label: "Ready", tone: "ready" };
  if (has("scheduled")) return { label: "Scheduled", tone: "scheduled" };
  if (variants.every((v) => v.status === "published")) return { label: "Published", tone: "published" };
  return { label: "Skipped", tone: "skipped" };
}
