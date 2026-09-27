import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QUEUE_PAGE_SIZE, SupabaseAutomationStore, getAutomationStats, listQueue, type QueueFilter } from "@/lib/services/blogAutomation";
import { QueueTable } from "@/components/admin/automation/QueueTable";
import { BulkButtons } from "@/components/admin/automation/BulkButtons";

export const maxDuration = 60;

const FILTERS: { id: QueueFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unplanned", label: "Not started" },
  { id: "in_progress", label: "Writing now" },
  { id: "attention", label: "Needs attention" },
  { id: "ready", label: "Ready" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "skipped", label: "Skipped" },
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
      <div className="admin-banner admin-banner--error" role="alert">
        Could not load the queue{error instanceof Error ? `: ${error.message}` : "."} If you have not run the SQL in SUPABASE_SETUP.md, Step 13, do that first.
      </div>
    );
  }

  const pages = Math.max(1, Math.ceil(data.total / QUEUE_PAGE_SIZE));

  return (
    <>
      <div className="auto-filters" role="navigation" aria-label="Filter the queue">
        {FILTERS.map((f) => (
          <Link key={f.id} href={href(f.id, 1, q)} aria-current={f.id === filter ? "true" : undefined}>
            {f.label}
          </Link>
        ))}
        <form action="/admin/automation/queue" method="get">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <input type="search" name="q" defaultValue={q} placeholder="Search topics" aria-label="Search topics" />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Search
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 16 }}>
        <BulkButtons failed={stats.failed} ready={stats.ready} />
      </div>

      {data.rows.length === 0 ? (
        <div className="auto-card auto-empty">
          {data.total === 0 && filter === "all" && !q ? (
            <>
              <p>No topics yet.</p>
              <Link className="admin-btn admin-btn--primary" href="/admin/automation/topics">
                Add topics
              </Link>
            </>
          ) : (
            <p>No topics match this filter.</p>
          )}
        </div>
      ) : (
        <QueueTable rows={data.rows} timezone={settings.timezone} autoPublish={settings.autoPublish} />
      )}

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
