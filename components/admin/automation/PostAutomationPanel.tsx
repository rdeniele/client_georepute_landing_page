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
        Written by the AI Auto-Writer <StatusChip status={variant.status} />
      </h2>
      <p className="auto-meta">
        {topic ? <>Topic: <strong>{topic.topic}</strong>. </> : null}
        {variant.is_source ? "This is the original article; the other languages are translated from it. " : "Translated from the original article. "}
        {variant.scheduled_at ? <>Goes live <strong>{formatDateTime(variant.scheduled_at, timezone)}</strong>. </> : null}
        {variant.published_at ? <>Went live <strong>{formatDateTime(variant.published_at, timezone)}</strong>. </> : null}
        {meta.model ? <>Model: {meta.model}. </> : null}
      </p>
      {meta.imageConcept ? (
        <p className="auto-meta">
          <strong>Picture idea:</strong> {meta.imageConcept}
        </p>
      ) : null}
      {meta.linkOpportunities?.length ? (
        <p className="auto-meta">
          <strong>Pages it could link to:</strong> {meta.linkOpportunities.join(" · ")}
        </p>
      ) : null}
      {issues.length ? (
        <ul className="admin-translate__issues" style={{ marginTop: 10 }}>
          {issues.map((i, idx) => (
            <li key={idx} className={`admin-translate__issue admin-translate__issue--${i.severity === "error" ? "major" : "minor"}`}>
              <span className="admin-translate__sev">{i.severity === "error" ? "Must fix" : "Tip"}</span> {i.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="auto-meta">✓ It passed every check.</p>
      )}
      <p className="auto-meta">
        When you are done editing, approve or publish it from the <Link href={`/admin/automation/queue?q=${encodeURIComponent((topic?.topic ?? "").slice(0, 40))}`}>Articles list</Link>. It is checked again before it goes live.
      </p>
    </div>
  );
}
