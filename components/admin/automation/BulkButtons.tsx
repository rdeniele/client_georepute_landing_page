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
      setText(res.ok ? { tone: "ok", text: `${res.changed} updated${res.skipped ? `, ${res.skipped} still have problems` : ""}.` } : { tone: "error", text: res.error });
      router.refresh();
    });
  }

  return (
    <div className="auto-inline">
      <button type="button" className="admin-btn admin-btn--ghost" disabled={pending || failed === 0} onClick={() => run("retry_failed", `Retry all ${failed} failed articles? Each uses Claude again.`)}>
        Retry all failed ({failed})
      </button>
      <button type="button" className="admin-btn admin-btn--ghost" disabled={pending || ready === 0} onClick={() => run("approve_ready", `Approve all ${ready} ready articles? They will be scheduled to publish (each is checked again first).`)}>
        Approve all ready ({ready})
      </button>
      {text ? <span className={text.tone === "error" ? "auto-count auto-count--over" : "auto-count"}>{text.text}</span> : null}
    </div>
  );
}
