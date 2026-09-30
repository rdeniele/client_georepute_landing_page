"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runTickNowAction, setAutomationStateAction, type AutomationOp } from "@/lib/actions/blogAutomation";

type Feedback = { tone: "ok" | "warn" | "error"; text: string } | null;

/**
 * Start / pause / resume / stop, and "Run now". None of these keep the browser involved in the work: they change a
 * switch in the database (the scheduler does the rest, whether or not this page is open) or run one bounded pass.
 */
export function AutomationControls({ enabled, paused, waiting }: { enabled: boolean; paused: boolean; waiting: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [running, startRun] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      setElapsed(0);
      timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  function change(op: AutomationOp) {
    setFeedback(null);
    start(async () => {
      const res = await setAutomationStateAction(op);
      if (!res.ok) setFeedback({ tone: "error", text: res.error });
      else if (res.warnings.length) setFeedback({ tone: "warn", text: res.warnings.join(" ") });
      else setFeedback(null);
      router.refresh();
    });
  }

  function runNow() {
    setFeedback(null);
    startRun(async () => {
      const res = await runTickNowAction();
      if (!res.ok) setFeedback({ tone: "error", text: res.error });
      else {
        const s = res.summary;
        const parts = [`${s.planned} lined up`, `${s.generated} written`, `${s.localized} translated`, `${s.published} published`];
        if (s.retried) parts.push(`${s.retried} will be retried`);
        if (s.failed) parts.push(`${s.failed} failed`);
        setFeedback({ tone: s.error || s.failed ? "warn" : "ok", text: `Done in ${s.seconds} seconds: ${parts.join(", ")}.${s.skipped ? ` ${s.skipped}` : ""}${s.error ? ` ${s.error}` : ""}` });
      }
      router.refresh();
    });
  }

  const busy = pending || running;
  return (
    <div>
      <div className="auto-actions">
        {!enabled ? (
          <button type="button" className="admin-btn admin-btn--primary" disabled={busy} onClick={() => change("start")}>
            Start the Auto-Writer
          </button>
        ) : (
          <>
            {paused ? (
              <button type="button" className="admin-btn admin-btn--primary" disabled={busy} onClick={() => change("resume")}>
                Resume writing
              </button>
            ) : (
              <button type="button" className="admin-btn admin-btn--ghost" disabled={busy} onClick={() => change("pause")}>
                Pause writing
              </button>
            )}
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              disabled={busy}
              onClick={() => {
                if (window.confirm("Turn the Auto-Writer off? Nothing will be written or published until you start it again. Articles already published stay live.")) change("stop");
              }}
            >
              Turn off
            </button>
          </>
        )}
        {enabled && waiting ? (
          <button type="button" className="admin-btn admin-btn--ghost" disabled={busy} onClick={() => change("clear_backoff")}>
            Try again now
          </button>
        ) : null}
        <button type="button" className="admin-btn admin-btn--ghost" disabled={busy || !enabled} onClick={runNow} title={enabled ? "Do one round of work right now (write, translate and publish whatever is due) instead of waiting for the next automatic run" : "Start the Auto-Writer first"}>
          {running ? `Working… ${elapsed}s` : "Write now"}
        </button>
      </div>
      {running ? <p className="auto-meta">This can take a few minutes while the AI writes. Please keep this tab open until it finishes.</p> : null}
      {feedback ? (
        <div className={feedback.tone === "error" ? "admin-banner admin-banner--error" : feedback.tone === "warn" ? "auto-warn" : "auto-ok"} role={feedback.tone === "error" ? "alert" : "status"}>
          {feedback.text}
        </div>
      ) : null}
    </div>
  );
}
