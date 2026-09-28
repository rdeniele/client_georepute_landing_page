"use client";

import { useEffect, useState } from "react";
import {
  DEBUG_LOG_EVENT,
  clearDebugLog,
  debugLog,
  isDebugEnabled,
  readDebugLog,
  syncDebugFlagFromUrl,
  type DebugEntry,
} from "@/lib/debugLog";

/**
 * Opt-in diagnostic overlay for the "page goes blank after switching tabs"
 * reports. Invisible to every ordinary visitor: it only renders after this
 * browser has visited once with `?debug=1` in the URL (persisted in
 * localStorage from then on; `?debug=0` turns it back off).
 *
 * It logs visibility/pageshow transitions and any uncaught error or
 * rejection with a timestamp, live, in a small corner readout — so the next
 * time this happens, a screenshot of the HUD shows the actual sequence of
 * browser events instead of just the blank result.
 */
export function DebugHUD() {
  const [enabled, setEnabled] = useState(false);
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    syncDebugFlagFromUrl();
    if (!isDebugEnabled()) return;
    setEnabled(true);
    setEntries(readDebugLog());

    const onLog = (e: Event) => setEntries((e as CustomEvent<DebugEntry[]>).detail);
    window.addEventListener(DEBUG_LOG_EVENT, onLog);

    const onVisibility = () => debugLog(`visibilitychange hidden=${document.hidden}`);
    document.addEventListener("visibilitychange", onVisibility);

    const onPageShow = (e: PageTransitionEvent) => debugLog(`pageshow persisted=${e.persisted}`);
    window.addEventListener("pageshow", onPageShow);
    const onPageHide = (e: PageTransitionEvent) => debugLog(`pagehide persisted=${e.persisted}`);
    window.addEventListener("pagehide", onPageHide);

    const onError = (e: ErrorEvent) => debugLog(`error: ${e.message}`.slice(0, 160));
    window.addEventListener("error", onError);
    const onRejection = (e: PromiseRejectionEvent) => debugLog(`unhandledrejection: ${String(e.reason)}`.slice(0, 160));
    window.addEventListener("unhandledrejection", onRejection);

    debugLog(`HUD mounted path=${window.location.pathname}`);

    return () => {
      window.removeEventListener(DEBUG_LOG_EVENT, onLog);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!enabled) return null;

  const base: React.CSSProperties = {
    position: "fixed",
    bottom: 8,
    insetInlineEnd: 8,
    zIndex: 999999,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#7CFC9A",
    background: "rgba(6, 8, 20, 0.92)",
    border: "1px solid rgba(124, 252, 154, 0.35)",
    borderRadius: 8,
    boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ ...base, padding: "6px 10px", cursor: "pointer" }}>
        debug
      </button>
    );
  }

  return (
    <div style={{ ...base, width: 260, maxHeight: 220, padding: 8, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <strong>georepute debug</strong>
        <span style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => clearDebugLog()}
            style={{ color: "#7CFC9A", background: "transparent", border: "none", cursor: "pointer", fontSize: 10 }}
          >
            clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ color: "#7CFC9A", background: "transparent", border: "none", cursor: "pointer", fontSize: 10 }}
          >
            ×
          </button>
        </span>
      </div>
      <div style={{ overflowY: "auto" }}>
        {entries.length === 0 ? (
          <div style={{ opacity: 0.6 }}>waiting for events…</div>
        ) : (
          entries
            .slice(-14)
            .reverse()
            .map((e, i) => (
              <div key={`${e.t}-${i}`} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {new Date(e.t).toLocaleTimeString()} {e.msg}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
