"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { topicsBulkAction, updateTopicAction, variantAction, type ActionResult, type TopicBulkOp, type VariantOp } from "@/lib/actions/blogAutomation";
import { STATUS_LABEL, asIssues, rollup } from "@/lib/blog/automation/labels";
import { toDateTimeLocal } from "@/lib/blog/automation/schedule";
import type { QueueTopic } from "@/lib/services/blogAutomation";
import { formatDateTime } from "@/lib/utils/format";
import { blogPath } from "@/lib/utils/postLocale";
import { StatusChip } from "./StatusChip";

type Variant = QueueTopic["variants"][number];

const meta = (v: Variant) => (v.meta && typeof v.meta === "object" ? (v.meta as { imageConcept?: string; model?: string; approved?: boolean }) : {});

/** The queue: one row per topic, expandable into one row per language. Every button calls a server action; nothing here does work itself. */
export function QueueTable({ rows, timezone, autoPublish }: { rows: QueueTopic[]; timezone: string; autoPublish: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  function settle(res: ActionResult<object>, okText?: string) {
    setMessage(res.ok ? (okText ? { tone: "ok", text: okText } : null) : { tone: "error", text: res.error });
    setBusyId(null);
    router.refresh();
  }

  function variant(id: string, op: VariantOp, when?: string, okText?: string) {
    setBusyId(id);
    start(async () => settle(await variantAction(id, op, when), okText));
  }

  function bulk(op: TopicBulkOp, confirmText?: string) {
    if (!selected.size) return;
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const res = await topicsBulkAction([...selected], op);
      if (res.ok) setSelected(new Set());
      settle(res, res.ok ? `${res.changed} topic${res.changed === 1 ? "" : "s"} updated.` : undefined);
    });
  }

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div>
      {message ? (
        <div className={message.tone === "error" ? "admin-banner admin-banner--error" : "auto-ok"} role={message.tone === "error" ? "alert" : "status"}>
          {message.text}
        </div>
      ) : null}

      {selected.size > 0 ? (
        <div className="auto-toolbar">
          <strong>{selected.size} selected</strong>
          <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => bulk("prioritize")}>
            Move to front
          </button>
          <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => bulk("queue")}>
            Queue drafts
          </button>
          <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => bulk("skip", "Skip the selected topics? Nothing will be generated or published for them until you restore them.")}>
            Skip
          </button>
          <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => bulk("restore")}>
            Restore
          </button>
          <button type="button" className="admin-btn admin-btn--danger auto-btn-sm" disabled={pending} onClick={() => bulk("delete", "Delete the selected topics? Topics with published articles are kept. This cannot be undone.")}>
            Delete
          </button>
        </div>
      ) : null}

      <div className="auto-queue">
        <div className="auto-queue__head" aria-hidden="true">
          <input type="checkbox" aria-label="Select all topics on this page" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))} />
          <span>Topic</span>
          <span>Languages</span>
          <span>Status</span>
          <span>Publishes</span>
          <span />
        </div>

        {rows.map((topic) => {
          const roll = rollup(topic, topic.variants);
          const first = topic.variants.find((v) => v.is_source) ?? topic.variants[0];
          const published = topic.variants.filter((v) => v.status === "published").length;
          const worst = topic.variants.find((v) => v.status === "failed" || v.status === "needs_review");
          return (
            <details key={topic.id} className="auto-topic">
              <summary>
                <input
                  type="checkbox"
                  aria-label={`Select ${topic.topic}`}
                  checked={selected.has(topic.id)}
                  onChange={() => toggle(topic.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="auto-topic__title">
                  {topic.topic}
                  <span className="auto-topic__sub">
                    {[topic.primary_keyword, topic.category].filter(Boolean).join(" · ") || "No keyword or category"}
                    {topic.status === "queued" && !topic.scheduled_date ? " · waiting to be planned" : ""}
                  </span>
                </span>
                <span className="auto-langs">
                  {topic.variants.length ? (
                    topic.variants.map((v) => (
                      <span key={v.id} className={`auto-lang auto-lang--${v.status}`} title={`${v.locale.toUpperCase()}: ${STATUS_LABEL[v.status]}`}>
                        {v.locale}
                      </span>
                    ))
                  ) : (
                    <span className="auto-meta">Not planned</span>
                  )}
                </span>
                <span>
                  <StatusChip label={roll.label} tone={roll.tone} />
                  {topic.variants.length > 1 && published > 0 && published < topic.variants.length ? <span className="auto-topic__sub">{published}/{topic.variants.length} live</span> : null}
                  {worst?.attempts ? <span className="auto-topic__sub">{worst.attempts} retr{worst.attempts === 1 ? "y" : "ies"}</span> : null}
                </span>
                <span>{first?.scheduled_at ? formatDateTime(first.scheduled_at, timezone) : "None"}</span>
                <span className="auto-topic__caret" aria-hidden="true">
                  ▸
                </span>
              </summary>

              <div className="auto-topic__body">
                <div className="auto-inline" style={{ marginTop: 12 }}>
                  <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" onClick={() => setEditing(editing === topic.id ? null : topic.id)}>
                    {editing === topic.id ? "Close editor" : "Edit topic"}
                  </button>
                  {topic.status === "skipped" ? (
                    <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => start(async () => settle(await topicsBulkAction([topic.id], "restore")))}>
                      Restore
                    </button>
                  ) : (
                    <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => window.confirm("Skip this topic? Nothing more will be generated or published for it.") && start(async () => settle(await topicsBulkAction([topic.id], "skip")))}>
                      Skip
                    </button>
                  )}
                  {topic.status === "draft" ? (
                    <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => start(async () => settle(await topicsBulkAction([topic.id], "queue")))}>
                      Add to queue
                    </button>
                  ) : null}
                  {!topic.scheduled_date && topic.status === "queued" ? (
                    <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" disabled={pending} onClick={() => start(async () => settle(await topicsBulkAction([topic.id], "prioritize")))}>
                      Move to front
                    </button>
                  ) : null}
                  <button type="button" className="admin-btn admin-btn--danger auto-btn-sm" disabled={pending} onClick={() => window.confirm(`Delete "${topic.topic}"? This cannot be undone.`) && start(async () => settle(await topicsBulkAction([topic.id], "delete")))}>
                    Delete
                  </button>
                </div>

                {editing === topic.id ? <TopicEditor topic={topic} onDone={(res) => { settle(res, res.ok ? "Topic saved. It applies to articles written from now on." : undefined); if (res.ok) setEditing(null); }} /> : null}

                {topic.notes || topic.search_intent || topic.secondary_keywords.length ? (
                  <p className="auto-meta">
                    {topic.secondary_keywords.length ? <>Secondary keywords: <strong>{topic.secondary_keywords.join(", ")}</strong>. </> : null}
                    {topic.search_intent ? <>Intent: <strong>{topic.search_intent}</strong>. </> : null}
                    {topic.notes ? <>Notes: {topic.notes}</> : null}
                  </p>
                ) : null}

                {topic.variants.length ? (
                  <table className="auto-variants">
                    <thead>
                      <tr>
                        <th>Language</th>
                        <th>Status</th>
                        <th>Generated</th>
                        <th>Scheduled</th>
                        <th>Published</th>
                        <th>Retries</th>
                        <th>Details</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topic.variants.map((v) => (
                        <VariantRow key={v.id} v={v} timezone={timezone} autoPublish={autoPublish} busy={busyId === v.id || pending} onAction={variant} />
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="auto-meta">This topic has not been planned yet. It is picked up in queue order once there is room in the schedule.</p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function VariantRow({ v, timezone, autoPublish, busy, onAction }: { v: Variant; timezone: string; autoPublish: boolean; busy: boolean; onAction: (id: string, op: VariantOp, when?: string, okText?: string) => void }) {
  const [when, setWhen] = useState(v.scheduled_at ? toDateTimeLocal(v.scheduled_at, timezone) : "");
  const [rescheduling, setRescheduling] = useState(false);
  const issues = asIssues(v.validation).filter((i) => i.severity === "error");
  const running = v.status === "generating" || v.status === "localizing";
  const m = meta(v);
  const btn = (label: string, op: VariantOp, opts: { primary?: boolean; confirm?: string; ok?: string } = {}) => (
    <button
      type="button"
      className={`admin-btn ${opts.primary ? "admin-btn--primary" : "admin-btn--ghost"} auto-btn-sm`}
      disabled={busy}
      onClick={() => {
        if (opts.confirm && !window.confirm(opts.confirm)) return;
        onAction(v.id, op, undefined, opts.ok);
      }}
    >
      {label}
    </button>
  );

  return (
    <tr>
      <td>
        <strong>{v.locale.toUpperCase()}</strong>
        {v.is_source ? <span className="auto-topic__sub">canonical</span> : null}
      </td>
      <td>
        <StatusChip status={v.status} />
      </td>
      <td>{v.generated_at ? formatDateTime(v.generated_at, timezone) : "None"}</td>
      <td>{v.scheduled_at ? formatDateTime(v.scheduled_at, timezone) : "None"}</td>
      <td>{v.published_at ? formatDateTime(v.published_at, timezone) : "None"}</td>
      <td>{v.attempts}</td>
      <td>
        {v.last_error && (v.status === "failed" || v.status === "queued") ? (
          <span className="auto-error">
            {v.error_code ? `${v.error_code}: ` : ""}
            {v.last_error}
          </span>
        ) : null}
        {v.status === "queued" && v.next_attempt_at && new Date(v.next_attempt_at).getTime() > Date.now() ? <span className="auto-topic__sub">retries {formatDateTime(v.next_attempt_at, timezone)}</span> : null}
        {issues.slice(0, 3).map((i, idx) => (
          <span key={idx} className="auto-issue">
            {i.message}
          </span>
        ))}
        {issues.length > 3 ? <span className="auto-issue">and {issues.length - 3} more</span> : null}
        {m.imageConcept ? <span className="auto-topic__sub">Image idea: {m.imageConcept}</span> : null}
      </td>
      <td>
        <div className="auto-inline">
          {v.post_id ? (
            <Link className="admin-btn admin-btn--ghost auto-btn-sm" href={`/admin/blogs/${v.post_id}/edit`}>
              Edit
            </Link>
          ) : null}
          {v.status === "published" && v.post ? (
            <a className="admin-btn admin-btn--ghost auto-btn-sm" href={blogPath(v.locale as never, v.post.slug)} target="_blank" rel="noreferrer">
              View live
            </a>
          ) : null}
          {v.status === "failed" ? btn("Retry", "retry", { primary: true, ok: "Queued for another attempt." }) : null}
          {v.status === "needs_review" ? btn(autoPublish ? "Approve & schedule" : "Approve", "approve", { primary: true }) : null}
          {v.status === "ready" ? btn(autoPublish ? "Approve & schedule" : "Approve", "approve", { primary: true }) : null}
          {v.post_id && v.status !== "published" && !running && v.status !== "skipped" ? btn("Publish now", "publish", { confirm: "Publish this article now?" }) : null}
          {v.status === "published" ? btn("Unpublish", "unpublish", { confirm: "Take this article off the blog?" }) : null}
          {!running && v.status !== "published" && v.status !== "skipped" && v.status !== "queued"
            ? btn(v.is_source ? "Regenerate" : "Regenerate this language", "regenerate", {
                confirm: v.post_id ? `Write this ${v.locale.toUpperCase()} version again? The current text is replaced.` : undefined,
                ok: "Queued to be written again.",
              })
            : null}
          {v.is_source && !running && v.status !== "published" && v.status !== "skipped" && v.status !== "queued"
            ? btn("Regenerate all languages", "regenerate_all", { confirm: "Write the article again and re-adapt every language that is not published yet? This uses one Claude call per language.", ok: "Queued." })
            : null}
          {v.status !== "published" && v.status !== "skipped" && !running ? (
            <button type="button" className="admin-btn admin-btn--ghost auto-btn-sm" onClick={() => setRescheduling((x) => !x)}>
              {rescheduling ? "Cancel" : "Change date"}
            </button>
          ) : null}
        </div>
        {rescheduling ? (
          <div className="auto-inline" style={{ marginTop: 8 }}>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label={`New publishing time (${timezone})`} />
            <button
              type="button"
              className="admin-btn admin-btn--primary auto-btn-sm"
              disabled={busy || !when}
              onClick={() => {
                onAction(v.id, "reschedule", when, "Publishing time changed.");
                setRescheduling(false);
              }}
            >
              Save ({timezone})
            </button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

function TopicEditor({ topic, onDone }: { topic: QueueTopic; onDone: (res: ActionResult<object>) => void }) {
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    topic: topic.topic,
    primary_keyword: topic.primary_keyword ?? "",
    secondary_keywords: topic.secondary_keywords.join("; "),
    category: topic.category ?? "",
    search_intent: topic.search_intent ?? "",
    notes: topic.notes ?? "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((c) => ({ ...c, [k]: e.target.value }));
  return (
    <form
      className="auto-card"
      style={{ marginTop: 12 }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => onDone(await updateTopicAction(topic.id, f)));
      }}
    >
      <div className="admin-field">
        <label htmlFor={`t-${topic.id}`}>Topic</label>
        <input id={`t-${topic.id}`} type="text" value={f.topic} onChange={set("topic")} required />
      </div>
      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor={`k-${topic.id}`}>Primary keyword</label>
          <input id={`k-${topic.id}`} type="text" value={f.primary_keyword} onChange={set("primary_keyword")} />
        </div>
        <div className="admin-field">
          <label htmlFor={`s-${topic.id}`}>Secondary keywords</label>
          <input id={`s-${topic.id}`} type="text" value={f.secondary_keywords} onChange={set("secondary_keywords")} placeholder="separated by semicolons" />
        </div>
      </div>
      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor={`c-${topic.id}`}>Category</label>
          <input id={`c-${topic.id}`} type="text" value={f.category} onChange={set("category")} />
        </div>
        <div className="admin-field">
          <label htmlFor={`i-${topic.id}`}>Search intent</label>
          <input id={`i-${topic.id}`} type="text" value={f.search_intent} onChange={set("search_intent")} placeholder="informational, commercial, ..." />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor={`n-${topic.id}`}>Notes for the writer</label>
        <textarea id={`n-${topic.id}`} rows={3} value={f.notes} onChange={set("notes")} />
        <span className="admin-field__hint">Changes apply to articles written from now on. Use Regenerate on an article to rewrite it.</span>
      </div>
      <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
        {pending ? "Saving…" : "Save topic"}
      </button>
    </form>
  );
}
