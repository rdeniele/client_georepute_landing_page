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
  queued: "Waiting",
  generating: "Being written",
  localizing: "Being translated",
  needs_review: "Needs your attention",
  ready: "Ready for your OK",
  scheduled: "Scheduled",
  published: "Live",
  failed: "Failed",
  skipped: "Skipped",
};

/** One plain sentence saying what each status means and what happens next, shown as a tooltip and on the Auto-Writer overview. */
export const STATUS_HELP: Record<VariantStatus, string> = {
  queued: "In the list, waiting for its turn. Nothing to do.",
  generating: "The AI is writing this article right now. Nothing to do.",
  localizing: "The AI is translating this article right now. Nothing to do.",
  needs_review: "A check found a problem, so this will not go live until you fix it or write it again. Open it to see what.",
  ready: "Written and checked. Read it, then press Approve (or edit it first).",
  scheduled: "Approved. It goes live by itself at the time shown.",
  published: "On your website.",
  failed: "The AI could not finish this after several tries. Press Retry, or open it to see why.",
  skipped: "You chose to leave this one out. You can bring it back.",
};

export type TopicRollup = { label: string; tone: VariantStatus | "draft" | "unplanned" | "generated" };

/**
 * The single status shown for a topic. The most urgent state among its languages wins, so a topic with one
 * failed language reads "Failed" even if the others are fine.
 */
export function rollup(topic: Pick<BlogTopicRow, "status" | "scheduled_date">, variants: Pick<BlogVariantRow, "status" | "is_source">[]): TopicRollup {
  if (topic.status === "skipped") return { label: "Skipped", tone: "skipped" };
  if (topic.status === "draft") return { label: "Saved for later", tone: "draft" };
  if (!variants.length) return { label: "Waiting", tone: topic.scheduled_date ? "queued" : "unplanned" };
  const has = (...s: VariantStatus[]) => variants.some((v) => s.includes(v.status));
  if (has("failed")) return { label: "Failed", tone: "failed" };
  if (has("needs_review")) return { label: "Needs your attention", tone: "needs_review" };
  if (has("generating")) return { label: "Being written", tone: "generating" };
  if (has("localizing")) return { label: "Being translated", tone: "localizing" };
  if (has("queued")) {
    const sourceDone = variants.some((v) => v.is_source && v.status !== "queued");
    return sourceDone ? { label: "Written, translating next", tone: "generated" } : { label: "Waiting", tone: "queued" };
  }
  if (has("ready")) return { label: "Ready for your OK", tone: "ready" };
  if (has("scheduled")) return { label: "Scheduled", tone: "scheduled" };
  if (variants.every((v) => v.status === "published")) return { label: "Live", tone: "published" };
  return { label: "Skipped", tone: "skipped" };
}
