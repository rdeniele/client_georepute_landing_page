import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseAutomationStore, getAutomationStats, listQueue, type QueueTopic } from "@/lib/services/blogAutomation";
import { describeWorkload, resolveLanguages, type AutomationSettings } from "@/lib/blog/automation/config";
import { addDays, dateInZone, daySlots } from "@/lib/blog/automation/schedule";
import { STATUS_LABEL, rollup } from "@/lib/blog/automation/labels";
import { isServiceClientConfigured } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/utils/format";
import { AutomationControls } from "@/components/admin/automation/AutomationControls";
import { StatusChip } from "@/components/admin/automation/StatusChip";

// "Run now" executes one scheduler pass inside this page's request.
export const maxDuration = 300;

function SetupNeeded({ detail }: { detail: string }) {
  return (
    <div className="auto-card">
      <h2>One-time database setup needed</h2>
      <p className="auto-card__hint">
        The automation tables do not exist yet, so nothing can be queued. Run the SQL in <strong>SUPABASE_SETUP.md, Step 13</strong> in the Supabase SQL Editor, then reload this page.
      </p>
      <p className="auto-meta">Details: {detail}</p>
    </div>
  );
}

export default async function AutomationOverviewPage() {
  const supabase = await createSupabaseServerClient();
  const store = new SupabaseAutomationStore(supabase);

  let settings: AutomationSettings;
  let stats: Awaited<ReturnType<typeof getAutomationStats>>;
  let attention: QueueTopic[] = [];
  let upcoming: { date: string; planned: number }[] = [];
  try {
    settings = await store.getSettings();
    const today = dateInZone(new Date(), settings.timezone);
    const dates = Array.from({ length: Math.min(settings.lookaheadDays, 7) }, (_, i) => addDays(today, i));
    const [s, q, counts] = await Promise.all([getAutomationStats(supabase, settings), listQueue(supabase, { page: 1, filter: "attention" }), store.assignedCountsByDate(dates)]);
    stats = s;
    attention = q.rows.slice(0, 8);
    upcoming = dates.map((date) => ({ date, planned: counts[date] ?? 0 }));
  } catch (error) {
    return <SetupNeeded detail={error instanceof Error ? error.message : "unknown error"} />;
  }

  const now = Date.now();
  const backingOff = Boolean(settings.backoffUntil && new Date(settings.backoffUntil).getTime() > now);
  const state = !settings.enabled ? "off" : settings.generationPaused ? "paused" : backingOff ? "waiting" : "running";
  const workload = describeWorkload(settings);
  const langs = resolveLanguages(settings);
  const tick = settings.lastTickSummary;
  const minutesSinceTick = settings.lastTickAt ? Math.round((now - new Date(settings.lastTickAt).getTime()) / 60000) : null;
  const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  const schedulerConfigured = Boolean(process.env.CRON_SECRET?.trim()) && isServiceClientConfigured();
  const stale = settings.enabled && schedulerConfigured && (minutesSinceTick === null || minutesSinceTick > 20);

  const statCards: { label: string; value: number; tone?: "warn" | "bad" }[] = [
    { label: "Topics not started", value: stats.topicsQueued },
    { label: "Topics in progress", value: stats.topicsPlanned },
    { label: "Topics completed", value: stats.topicsCompleted },
    { label: "Articles generated", value: stats.generated },
    { label: "Articles published", value: stats.published },
    { label: "Waiting to publish", value: stats.waiting },
    { label: "Scheduled", value: stats.remainingScheduled },
    { label: "Needs review", value: stats.needsReview, tone: stats.needsReview ? "warn" : undefined },
    { label: "Failed", value: stats.failed, tone: stats.failed ? "bad" : undefined },
    { label: "Generated today", value: stats.generatedToday },
    { label: "Published today", value: stats.publishedToday },
    { label: "Retrying", value: stats.retrying },
    { label: "Writing now", value: stats.inProgress },
  ];

  return (
    <>
      <div className="auto-card">
        <div className="auto-status">
          <div>
            <div className="auto-status__state">
              <span className={`auto-dot ${state === "running" ? "auto-dot--on" : state === "paused" ? "auto-dot--paused" : state === "waiting" ? "auto-dot--wait" : ""}`} />
              {state === "running" ? "Running" : state === "paused" ? "Generation paused" : state === "waiting" ? "Waiting for Claude" : "Off"}
            </div>
            <p className="auto-meta">
              {state === "off" ? (
                <>Nothing is planned, written or published. Add topics, check the settings, then press <strong>Start Automation</strong>.</>
              ) : (
                <>
                  <strong>{settings.articlesPerDay}</strong> article{settings.articlesPerDay === 1 ? "" : "s"} per day at <strong>{settings.publishTime}</strong> ({settings.timezone}), in <strong>{langs.length}</strong> language{langs.length === 1 ? "" : "s"}.
                  {" "}Auto-publish is <strong>{settings.autoPublish ? "on" : "off"}</strong>, human review is <strong>{settings.requireReview ? "required" : "not required"}</strong>.
                  {settings.startDate ? <> Starts <strong>{settings.startDate}</strong>.</> : null}
                </>
              )}
            </p>
            {backingOff ? <p className="auto-meta">Claude asked us to slow down. Calls resume at {formatDateTime(settings.backoffUntil, settings.timezone)}.</p> : null}
          </div>
          <AutomationControls enabled={settings.enabled} paused={settings.generationPaused} waiting={backingOff} />
        </div>

        <p className="auto-meta">
          Scheduler: {settings.lastTickAt ? <>last ran <strong>{formatDateTime(settings.lastTickAt, settings.timezone)}</strong> ({tick?.trigger === "manual" ? "run by you" : "automatic"}
          {tick ? <>; planned {tick.planned}, written {tick.generated}, translated {tick.localized}, published {tick.published}, retry {tick.retried}, failed {tick.failed}</> : null})</> : <strong>has not run yet</strong>}.
        </p>
        {!aiConfigured ? <p className="auto-warn">The Claude API key is not configured on the server (ANTHROPIC_API_KEY). Nothing can be written until it is set.</p> : null}
        {!schedulerConfigured ? (
          <p className="auto-warn">
            The background scheduler is not set up (CRON_SECRET and SUPABASE_SERVICE_ROLE_KEY). Automation only advances when you press <strong>Run now</strong>. Setup takes five minutes: SUPABASE_SETUP.md, Step 13.
          </p>
        ) : null}
        {stale ? <p className="auto-warn">The scheduler has not run for {minutesSinceTick === null ? "as long as we can tell" : `${minutesSinceTick} minutes`}. Check that the cron job that calls /api/cron/blog-automation is still active.</p> : null}
        {tick?.error ? <p className="auto-warn">Last run: {tick.error}</p> : null}
      </div>

      <div className="auto-grid">
        {statCards.map((c) => (
          <div key={c.label} className={`admin-stat-card ${c.tone ? `auto-stat--${c.tone}` : ""}`}>
            <span className="admin-stat-card__value">{c.value.toLocaleString("en-US")}</span>
            <span className="admin-stat-card__label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="auto-card">
        <h2>What the schedule means</h2>
        <p className="auto-card__hint">{workload.sentence}</p>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Topics planned</th>
              <th>First article goes live</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((d) => {
              const skipped = settings.startDate && d.date < settings.startDate;
              return (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{skipped ? <span className="auto-meta">before the start date</span> : `${d.planned} of ${settings.articlesPerDay}`}</td>
                  <td>{skipped ? "None" : formatDateTime(daySlots(d.date, settings)[0].toISOString(), settings.timezone)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="auto-meta">
          Topics are planned {settings.lookaheadDays} day{settings.lookaheadDays === 1 ? "" : "s"} ahead so the articles are written well before they publish. The rest wait in the queue ({stats.topicsQueued.toLocaleString("en-US")} not started).
        </p>
      </div>

      <div className="auto-card">
        <h2>Needs attention</h2>
        {attention.length === 0 ? (
          <p className="auto-card__hint">Nothing failed and nothing is waiting for a fix.</p>
        ) : (
          <>
            <p className="auto-card__hint">These will not publish until you look at them.</p>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Problem</th>
                </tr>
              </thead>
              <tbody>
                {attention.map((t) => {
                  const bad = t.variants.filter((v) => v.status === "failed" || v.status === "needs_review");
                  return (
                    <tr key={t.id}>
                      <td className="admin-table__title">
                        <Link href={`/admin/automation/queue?filter=attention&q=${encodeURIComponent(t.topic.slice(0, 40))}`}>{t.topic}</Link>
                      </td>
                      <td>
                        {bad.map((v) => (
                          <span key={v.id} style={{ display: "inline-flex", gap: 6, marginInlineEnd: 10 }}>
                            <StatusChip status={v.status} label={`${v.locale.toUpperCase()} ${STATUS_LABEL[v.status]}`} />
                          </span>
                        ))}
                        <span className="auto-meta"> {rollup(t, t.variants).label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="auto-meta">
              <Link href="/admin/automation/queue?filter=attention">Open all items that need attention</Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}
