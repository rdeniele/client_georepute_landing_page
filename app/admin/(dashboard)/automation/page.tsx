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
import { Callout, EmptyState, Flow } from "@/components/admin/ui/kit";

// "Write now" executes one scheduler pass inside this page's request.
export const maxDuration = 300;

function SetupNeeded({ detail }: { detail: string }) {
  return (
    <Callout tone="warn" title="One quick setup step is needed before you can use the Auto-Writer" action={{ label: "See how", href: "/admin/help#database" }}>
      The database tables it uses do not exist yet. Someone who manages the database needs to run the SQL in <strong>SUPABASE_SETUP.md, Step 13</strong> once, then reload this page.
      <div className="auto-meta">Technical detail: {detail}</div>
    </Callout>
  );
}

/** Who approves what, in the words used in Settings and Help. */
function approvalMode(s: Pick<AutomationSettings, "requireReview" | "autoPublish">): { name: string; sentence: string } {
  if (s.requireReview && s.autoPublish) return { name: "Ask me first", sentence: "Each article waits for your OK, then goes live at its scheduled time." };
  if (!s.requireReview && s.autoPublish) return { name: "Fully automatic", sentence: "Articles that pass every check go live by themselves at their scheduled time." };
  return { name: "I publish by hand", sentence: "Articles are written and checked, but never go live until you publish them yourself." };
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
  // A rejected key or a billing problem pauses calls the same way a rate limit does, but "the AI asked us to slow down" would be the wrong explanation.
  const configIssue = Boolean(tick?.error && /rejected|not configured|billing|workspace/i.test(tick.error));
  const minutesSinceTick = settings.lastTickAt ? Math.round((now - new Date(settings.lastTickAt).getTime()) / 60000) : null;
  const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  const photosConfigured = Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim());
  const schedulerConfigured = Boolean(process.env.CRON_SECRET?.trim()) && isServiceClientConfigured();
  const stale = settings.enabled && schedulerConfigured && (minutesSinceTick === null || minutesSinceTick > 20);
  const mode = approvalMode(settings);
  const needYou = stats.needsReview + stats.failed;

  const stateName = { running: "On", paused: "Paused", waiting: "Waiting for the AI", off: "Off" }[state];

  const allNumbers: { label: string; value: number; tone?: "warn" | "bad" }[] = [
    { label: "Topics waiting", value: stats.topicsQueued },
    { label: "Topics lined up", value: stats.topicsPlanned },
    { label: "Topics finished", value: stats.topicsCompleted },
    { label: "Articles written", value: stats.generated },
    { label: "Live on the website", value: stats.published },
    { label: "Waiting to go live", value: stats.waiting },
    { label: "Scheduled", value: stats.remainingScheduled },
    { label: "Need your attention", value: stats.needsReview, tone: stats.needsReview ? "warn" : undefined },
    { label: "Failed", value: stats.failed, tone: stats.failed ? "bad" : undefined },
    { label: "Written today", value: stats.generatedToday },
    { label: "Published today", value: stats.publishedToday },
    { label: "Will be retried", value: stats.retrying },
    { label: "Being written now", value: stats.inProgress },
  ];

  return (
    <>
      {needYou > 0 ? (
        <Callout tone="warn" title={`${needYou.toLocaleString("en-US")} article${needYou === 1 ? " needs" : "s need"} your attention`} action={{ label: "Show me", href: "/admin/automation/queue?filter=attention" }}>
          They will not go live until you open them and fix or retry them. Each one says what is wrong.
        </Callout>
      ) : null}

      {!aiConfigured ? (
        <Callout tone="error" title="The AI is not connected yet" action={{ label: "How to connect it", href: "/admin/help#ai-key" }}>
          Nothing can be written until the AI key is saved on the server.
        </Callout>
      ) : null}
      {!schedulerConfigured ? (
        <Callout tone="warn" title="It only works when you press “Write now”" action={{ label: "How to fix", href: "/admin/help#scheduler" }}>
          The background scheduler is not set up, so nothing is written or published by itself. It is a five-minute, one-time job for whoever manages the hosting.
        </Callout>
      ) : null}
      {stale ? (
        <Callout tone="warn" title="The automatic runs seem to have stopped" action={{ label: "How to check", href: "/admin/help#scheduler" }}>
          The last automatic run was {minutesSinceTick === null ? "never" : `${minutesSinceTick} minutes ago`}. Check that the scheduled job that calls <code>/api/cron/blog-automation</code> is still active.
        </Callout>
      ) : null}
      {tick?.error ? (
        <Callout tone="warn" title="The last run had a problem">
          {tick.error}
        </Callout>
      ) : null}
      {aiConfigured && !photosConfigured ? (
        <Callout tone="info" title="Articles will not get photos yet" action={{ label: "Turn on photos", href: "/admin/help#photos" }}>
          Photos are optional. Without an Unsplash key, articles show a plain branded banner instead.
        </Callout>
      ) : null}

      <div className="ui-hero">
        <div>
          <div className="ui-hero__state">
            <span className={`auto-dot ${state === "running" ? "auto-dot--on" : state === "paused" ? "auto-dot--paused" : state === "waiting" ? "auto-dot--wait" : ""}`} />
            {stateName}
          </div>
          {state === "off" ? (
            <p>
              The Auto-Writer is off, so nothing is being written or published. To start: <Link href="/admin/automation/topics">add some topics</Link>, look at the{" "}
              <Link href="/admin/automation/settings">settings</Link>, then press <strong>Start the Auto-Writer</strong>.
            </p>
          ) : (
            <>
              <p>
                Every day it lines up <strong>{settings.articlesPerDay}</strong> article{settings.articlesPerDay === 1 ? "" : "s"} in <strong>{langs.length}</strong> language
                {langs.length === 1 ? "" : "s"} and publishes the first at <strong>{settings.publishTime}</strong> ({settings.timezone}).
                {settings.startDate ? <> It starts on <strong>{settings.startDate}</strong>.</> : null}
              </p>
              <p>
                <strong>{mode.name}:</strong> {mode.sentence} <Link href="/admin/automation/settings">Change this</Link>
              </p>
            </>
          )}
          {state === "paused" ? <p>Writing is paused. Articles already written can still go live. Press <strong>Resume writing</strong> to continue.</p> : null}
          {backingOff ? (
            <p>
              {configIssue ? "Calls to the AI are paused because of a setup problem." : "The AI asked us to slow down."} It tries again at {formatDateTime(settings.backoffUntil, settings.timezone)}.
            </p>
          ) : null}
        </div>
        <AutomationControls enabled={settings.enabled} paused={settings.generationPaused} waiting={backingOff} />
      </div>

      <h2 className="admin-section-title">How it works, and where things are now</h2>
      <Flow
        steps={[
          { title: "You add topics", text: "A list of article ideas. One line each.", count: stats.topicsQueued, countLabel: "waiting their turn", href: "/admin/automation/topics" },
          { title: "The AI writes them", text: "It writes each article, then translates it into your other languages.", count: stats.inProgress, countLabel: "being written now", href: "/admin/automation/queue?filter=in_progress" },
          { title: "You check and approve", text: mode.name === "Fully automatic" ? "Optional: articles that pass every check skip this step." : "Read each one, edit if you like, press Approve.", count: stats.ready, countLabel: "ready for your OK", href: "/admin/automation/queue?filter=ready" },
          { title: "It goes live", text: "Published on the website at the scheduled time.", count: stats.published, countLabel: "live so far", href: "/admin/automation/queue?filter=published" },
        ]}
      />

      <div className="auto-card">
        <h2>What happens next</h2>
        <p className="auto-card__hint">{workload.sentence}</p>
        {stats.topicsQueued === 0 && stats.topicsPlanned === 0 ? (
          <EmptyState title="There is nothing to write yet" actions={[{ label: "Add topics", href: "/admin/automation/topics", primary: true }]}>
            Add a few topics and they will show up here with the day each one goes live.
          </EmptyState>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Articles lined up</th>
                <th>First one goes live</th>
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
        )}
        <p className="auto-meta">
          Topics are lined up {settings.lookaheadDays} day{settings.lookaheadDays === 1 ? "" : "s"} ahead so each article is written well before it goes live. The other{" "}
          {stats.topicsQueued.toLocaleString("en-US")} wait their turn.
        </p>
        {settings.lastTickAt ? (
          <p className="auto-meta">
            Last round of work: {formatDateTime(settings.lastTickAt, settings.timezone)} ({tick?.trigger === "manual" ? "you pressed Write now" : "automatic"}
            {tick ? `; ${tick.generated} written, ${tick.localized} translated, ${tick.published} published` : ""}).
          </p>
        ) : (
          <p className="auto-meta">It has not done any work yet.</p>
        )}
      </div>

      {needYou > 0 && attention.length > 0 ? (
        <div className="auto-card">
          <h2>Articles that need you</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>What is wrong</th>
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
                          <StatusChip status={v.status} label={`${v.locale.toUpperCase()}: ${STATUS_LABEL[v.status]}`} />
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
            <Link href="/admin/automation/queue?filter=attention">Open all of them</Link>
          </p>
        </div>
      ) : null}

      <details className="ui-more">
        <summary>Show all the numbers</summary>
        <div className="auto-grid" style={{ marginTop: 12 }}>
          {allNumbers.map((c) => (
            <div key={c.label} className={`admin-stat-card ${c.tone ? `auto-stat--${c.tone}` : ""}`}>
              <span className="admin-stat-card__value">{c.value.toLocaleString("en-US")}</span>
              <span className="admin-stat-card__label">{c.label}</span>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
