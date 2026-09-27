import Link from "next/link";
import { asIssues } from "@/lib/blog/automation/labels";
import type { BlogTopicRow, BlogVariantRow } from "@/types/database.types";
import { formatDateTime } from "@/lib/utils/format";
import { StatusChip } from "./StatusChip";

/** On the post editor: where an AI-written post is in the pipeline, and why it is (not) publishing. Read-only; the queue has the buttons. */
export function PostAutomationPanel({ variant, topic, timezone }: { variant: BlogVariantRow; topic: BlogTopicRow | null; timezone: string }) {
  const issues = asIssues(variant.validation);
  const meta = (variant.meta && typeof variant.meta === "object" ? variant.meta : {}) as { imageConcept?: string; model?: string; linkOpportunities?: string[]; translationStatus?: string };
  return (
    <div className="auto-card">
      <h2>
        Written by AI automation <StatusChip status={variant.status} />
      </h2>
      <p className="auto-meta">
        {topic ? <>Topic: <strong>{topic.topic}</strong>. </> : null}
        {variant.is_source ? "This is the canonical article the other languages are adapted from. " : "Adapted from the canonical article. "}
        {variant.scheduled_at ? <>Scheduled for <strong>{formatDateTime(variant.scheduled_at, timezone)}</strong>. </> : null}
        {variant.published_at ? <>Published <strong>{formatDateTime(variant.published_at, timezone)}</strong>. </> : null}
        {meta.model ? <>Model: {meta.model}. </> : null}
      </p>
      {meta.imageConcept ? (
        <p className="auto-meta">
          <strong>Featured image idea:</strong> {meta.imageConcept}
        </p>
      ) : null}
      {meta.linkOpportunities?.length ? (
        <p className="auto-meta">
          <strong>Link opportunities:</strong> {meta.linkOpportunities.join(" · ")}
        </p>
      ) : null}
      {issues.length ? (
        <ul className="admin-translate__issues" style={{ marginTop: 10 }}>
          {issues.map((i, idx) => (
            <li key={idx} className={`admin-translate__issue admin-translate__issue--${i.severity === "error" ? "major" : "minor"}`}>
              <span className="admin-translate__sev">{i.severity === "error" ? "Blocks publishing" : "Note"}</span> {i.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="auto-meta">All publish checks passed.</p>
      )}
      <p className="auto-meta">
        After editing, approve or publish it from the <Link href={`/admin/automation/queue?q=${encodeURIComponent((topic?.topic ?? "").slice(0, 40))}`}>content queue</Link>. Edits are checked again before it goes live.
      </p>
    </div>
  );
}
