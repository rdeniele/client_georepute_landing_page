import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QUEUE_PAGE_SIZE, SupabaseAutomationStore, getAutomationStats, listQueue, type QueueFilter } from "@/lib/services/blogAutomation";
import { QueueTable } from "@/components/admin/automation/QueueTable";
import { BulkButtons } from "@/components/admin/automation/BulkButtons";
import { Callout, EmptyState } from "@/components/admin/ui/kit";
import { STATUS_HELP, STATUS_LABEL } from "@/lib/blog/automation/labels";
import type { VariantStatus } from "@/types/database.types";

export const maxDuration = 60;

const FILTERS: { id: QueueFilter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "unplanned", label: "Waiting" },
  { id: "in_progress", label: "Being written" },
  { id: "attention", label: "Needs your attention" },
  { id: "ready", label: "Ready for your OK" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Live" },
  { id: "draft", label: "Saved for later" },
  { id: "skipped", label: "Left out" },
];

function href(filter: string, page: number, q: string) {
  const p = new URLSearchParams();
  if (filter !== "all") p.set("filter", filter);
  if (page > 1) p.set("page", String(page));
  if (q) p.set("q", q);
  const s = p.toString();
  return `/admin/automation/queue${s ? `?${s}` : ""}`;
}

export default async function QueuePage({ searchParams }: { searchParams: Promise<{ page?: string; filter?: string; q?: string }> }) {
  const params = await searchParams;
  const filter = (FILTERS.find((f) => f.id === params.filter)?.id ?? "all") as QueueFilter;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const q = (params.q ?? "").slice(0, 80);

  const supabase = await createSupabaseServerClient();
  let data: Awaited<ReturnType<typeof listQueue>>;
  let settings;
  let stats;
  try {
    settings = await new SupabaseAutomationStore(supabase).getSettings();
    [data, stats] = await Promise.all([listQueue(supabase, { page, filter, q }), getAutomationStats(supabase, settings)]);
  } catch (error) {
    return (
      <Callout tone="error" title="Could not load the articles" action={{ label: "See how to fix", href: "/admin/help#database" }}>
        {error instanceof Error ? error.message : "Unknown error."} If the database setup (SUPABASE_SETUP.md, Step 13) has not been done yet, do that first.
      </Callout>
    );
  }

  const pages = Math.max(1, Math.ceil(data.total / QUEUE_PAGE_SIZE));

  return (
    <>
      <p className="auto-card__hint">
        Every topic you added, and the article written for it in each language. Click a row to open it. Use the tabs to see only what needs you.
      </p>

      <div className="auto-filters" role="navigation" aria-label="Show only">
        {FILTERS.map((f) => (
          <Link key={f.id} href={href(f.id, 1, q)} aria-current={f.id === filter ? "true" : undefined}>
            {f.label}
          </Link>
        ))}
        <form action="/admin/automation/queue" method="get">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <input type="search" name="q" defaultValue={q} placeholder="Search by topic" aria-label="Search by topic" />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Search
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 16 }}>
        <BulkButtons failed={stats.failed} ready={stats.ready} />
      </div>

      {data.rows.length === 0 ? (
        data.total === 0 && filter === "all" && !q ? (
          <EmptyState title="No topics yet" actions={[{ label: "Add topics", href: "/admin/automation/topics", primary: true }]}>
            A topic is one article idea. Add a few, then turn the Auto-Writer on from the Overview page, and the articles appear here.
          </EmptyState>
        ) : filter === "attention" && !q ? (
          <EmptyState title="Nothing needs you right now">Every article is either fine or still being worked on.</EmptyState>
        ) : (
          <EmptyState title="Nothing matches" actions={[{ label: "Show everything", href: "/admin/automation/queue", primary: true }]}>
            Try another tab or a different word.
          </EmptyState>
        )
      ) : (
        <QueueTable rows={data.rows} timezone={settings.timezone} autoPublish={settings.autoPublish} />
      )}

      <details className="ui-more" style={{ marginTop: 24 }}>
        <summary>What do the statuses mean?</summary>
        <dl className="ui-prose" style={{ marginTop: 8 }}>
          {(["queued", "generating", "localizing", "ready", "scheduled", "published", "needs_review", "failed", "skipped"] as VariantStatus[]).map((s) => (
            <div key={s}>
              <dt>{STATUS_LABEL[s]}</dt>
              <dd>{STATUS_HELP[s]}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="auto-pager">
        <span>
          {data.total.toLocaleString("en-US")} topic{data.total === 1 ? "" : "s"} · page {page} of {pages}
        </span>
        <span className="auto-inline">
          {page > 1 ? (
            <Link className="admin-btn admin-btn--ghost" href={href(filter, page - 1, q)}>
              Previous
            </Link>
          ) : null}
          {page < pages ? (
            <Link className="admin-btn admin-btn--ghost" href={href(filter, page + 1, q)}>
              Next
            </Link>
          ) : null}
        </span>
      </div>
    </>
  );
}
