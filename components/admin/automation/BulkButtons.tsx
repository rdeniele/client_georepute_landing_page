"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bulkVariantAction, type BulkVariantOp } from "@/lib/actions/blogAutomation";

/** "Retry all failed" and "Approve all ready": the two bulk buttons an admin reaches for after a busy night. */
export function BulkButtons({ failed, ready }: { failed: number; ready: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [text, setText] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function run(op: BulkVariantOp, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    start(async () => {
      const res = await bulkVariantAction(op);
      setText(res.ok ? { tone: "ok", text: `Done: ${res.changed} updated${res.skipped ? `, ${res.skipped} still need you (open them to see why)` : ""}.` } : { tone: "error", text: res.error });
      router.refresh();
    });
  }

  return (
    <div className="auto-inline">
      <button type="button" className="admin-btn admin-btn--ghost" disabled={pending || failed === 0} onClick={() => run("retry_failed", `Try all ${failed} failed article${failed === 1 ? "" : "s"} again? Each one uses the AI again.`)}>
        Try all failed again ({failed})
      </button>
      <button type="button" className="admin-btn admin-btn--ghost" disabled={pending || ready === 0} onClick={() => run("approve_ready", `Approve all ${ready} article${ready === 1 ? "" : "s"} that ${ready === 1 ? "is" : "are"} ready? Each is checked once more, then goes live at its scheduled time.`)}>
        Approve everything that is ready ({ready})
      </button>
      {text ? <span className={text.tone === "error" ? "auto-count auto-count--over" : "auto-count"}>{text.text}</span> : null}
    </div>
  );
}
