"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { addTopicAction, importTopicsAction } from "@/lib/actions/blogAutomation";
import { csvToTopics, rowsToTopics, type ParsedRows, type TopicInput } from "@/lib/blog/automation/topics";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const CHUNK = 200;

type Parsed = ParsedRows & { fileName: string };
type Result = { inserted: number; duplicates: number; invalid: number };

/**
 * Bulk import (CSV or Excel) and manual entry. The file is read in the browser, so the admin sees exactly what
 * will be imported (and every row that will not, with the reason) before anything is sent. The server then
 * cleans and de-duplicates the rows again: the browser is never trusted.
 */
export function TopicImporter() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"queued" | "draft">("queued");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [importing, startImport] = useTransition();

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setResult(null);
    setParsed(null);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return setError("That file is larger than 5 MB. Split it into smaller files.");
    const name = file.name.toLowerCase();
    try {
      let out: ParsedRows;
      if (name.endsWith(".xlsx")) {
        // Loaded on demand: the spreadsheet reader is only downloaded when someone actually uploads an Excel file.
        const { readSheet } = await import("read-excel-file/browser");
        out = rowsToTopics((await readSheet(file)) as unknown[][]);
      } else if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
        out = csvToTopics(await file.text());
      } else if (name.endsWith(".xls")) {
        return setError("Old .xls files are not supported. Save the file as .xlsx or .csv and upload it again.");
      } else {
        return setError("Upload a .csv or .xlsx file.");
      }
      setParsed({ ...out, fileName: file.name });
    } catch {
      setError("That file could not be read. Check that it is a valid .csv or .xlsx file.");
    }
  }

  function runImport() {
    if (!parsed?.topics.length) return;
    const topics = parsed.topics;
    setError(null);
    setResult(null);
    startImport(async () => {
      const total: Result = { inserted: 0, duplicates: 0, invalid: 0 };
      setProgress({ done: 0, total: topics.length });
      for (let i = 0; i < topics.length; i += CHUNK) {
        const res = await importTopicsAction(topics.slice(i, i + CHUNK), status);
        if (!res.ok) {
          setError(`${res.error} ${total.inserted} topic${total.inserted === 1 ? " was" : "s were"} imported before this happened.`);
          setResult(total);
          setProgress(null);
          router.refresh();
          return;
        }
        total.inserted += res.inserted;
        total.duplicates += res.duplicates;
        total.invalid += res.invalid;
        setProgress({ done: Math.min(i + CHUNK, topics.length), total: topics.length });
      }
      setResult(total);
      setParsed(null);
      setProgress(null);
      if (input.current) input.current.value = "";
      router.refresh();
    });
  }

  return (
    <>
      <div className="auto-card">
        <h2>Import a list of topics</h2>
        <p className="auto-card__hint">
          A .csv or .xlsx file with one topic per row. Columns can be in any order if the first row names them: <strong>Topic</strong>, Primary keyword, Secondary keywords, Category, Search intent, Notes. Hundreds or thousands of rows are fine.{" "}
          <a href="/blog-topics-template.csv" download>
            Download a template
          </a>
          .
        </p>

        <label className="auto-dropzone">
          <input ref={input} type="file" accept=".csv,.tsv,.txt,.xlsx,text/csv" onChange={onFile} disabled={importing} />
          <strong>{parsed ? parsed.fileName : "Choose a file"}</strong>
          <br />
          <span>CSV or Excel (.xlsx), up to 5 MB and 5,000 rows</span>
        </label>

        {error ? (
          <div className="admin-banner admin-banner--error" role="alert" style={{ marginTop: 14 }}>
            {error}
          </div>
        ) : null}

        {parsed ? (
          <div style={{ marginTop: 18 }}>
            <p className="auto-meta">
              <strong>{parsed.topics.length.toLocaleString("en-US")}</strong> topic{parsed.topics.length === 1 ? "" : "s"} ready to import
              {parsed.duplicates ? <>, {parsed.duplicates.toLocaleString("en-US")} duplicate{parsed.duplicates === 1 ? "" : "s"} skipped</> : null}
              {parsed.issues.length ? <>, <strong>{parsed.issues.length}</strong> row{parsed.issues.length === 1 ? "" : "s"} with a problem</> : null}.
              {!parsed.header ? " No header row was found, so the columns are read in the standard order." : null}
            </p>

            {parsed.issues.length ? (
              <ul className="admin-translate__list">
                {parsed.issues.slice(0, 8).map((i, idx) => (
                  <li key={idx}>{i.row ? `Row ${i.row}: ` : ""}{i.message}</li>
                ))}
                {parsed.issues.length > 8 ? <li>and {parsed.issues.length - 8} more</li> : null}
              </ul>
            ) : null}

            {parsed.topics.length ? (
              <table className="admin-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Primary keyword</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.topics.slice(0, 6).map((t, i) => (
                    <tr key={i}>
                      <td>{t.topic}</td>
                      <td>{t.primary_keyword ?? "None"}</td>
                      <td>{t.category ?? "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {parsed.topics.length > 6 ? <p className="auto-meta">Showing 6 of {parsed.topics.length.toLocaleString("en-US")}.</p> : null}

            <div className="admin-field" style={{ marginTop: 16, maxWidth: 420 }}>
              <label htmlFor="import-status">After importing</label>
              <select id="import-status" value={status} onChange={(e) => setStatus(e.target.value as "queued" | "draft")} disabled={importing}>
                <option value="queued">Add to the queue (they will be scheduled automatically)</option>
                <option value="draft">Keep as drafts (I will queue them later)</option>
              </select>
            </div>

            <button type="button" className="admin-btn admin-btn--primary" disabled={importing || parsed.topics.length === 0} onClick={runImport}>
              {importing ? "Importing…" : `Import ${parsed.topics.length.toLocaleString("en-US")} topic${parsed.topics.length === 1 ? "" : "s"}`}
            </button>
            {progress ? (
              <div style={{ marginTop: 12 }}>
                <div className="auto-progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
                  <span style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                </div>
                <p className="auto-meta">
                  {progress.done.toLocaleString("en-US")} of {progress.total.toLocaleString("en-US")}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {result ? (
          <div className="auto-ok" role="status">
            Imported <strong>{result.inserted.toLocaleString("en-US")}</strong> topic{result.inserted === 1 ? "" : "s"}
            {result.duplicates ? `, skipped ${result.duplicates.toLocaleString("en-US")} that already existed` : ""}
            {result.invalid ? `, ${result.invalid} were not valid` : ""}. <Link href="/admin/automation/queue">Open the queue</Link>
          </div>
        ) : null}
      </div>

      <ManualTopic />
    </>
  );
}

function ManualTopic() {
  const router = useRouter();
  const empty = { topic: "", primary_keyword: "", secondary_keywords: "", category: "", search_intent: "", notes: "" };
  const [f, setF] = useState(empty);
  const [status, setStatus] = useState<"queued" | "draft">("queued");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const set = (k: keyof typeof empty) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((c) => ({ ...c, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await addTopicAction(f satisfies Partial<Record<keyof TopicInput, unknown>>, status);
      if (res.ok) {
        setF(empty);
        setMsg({ tone: "ok", text: "Topic added." });
        router.refresh();
      } else setMsg({ tone: "error", text: res.error });
    });
  }

  return (
    <form className="auto-card" onSubmit={submit}>
      <h2>Add one topic</h2>
      <p className="auto-card__hint">For a single idea. Everything except the topic is optional; the more Claude knows, the better the article.</p>
      <div className="admin-field">
        <label htmlFor="m-topic">Topic or working title</label>
        <input id="m-topic" type="text" value={f.topic} onChange={set("topic")} required placeholder="How to improve your local business visibility on Google" />
      </div>
      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor="m-key">Primary keyword</label>
          <input id="m-key" type="text" value={f.primary_keyword} onChange={set("primary_keyword")} placeholder="local business visibility" />
        </div>
        <div className="admin-field">
          <label htmlFor="m-sec">Secondary keywords</label>
          <input id="m-sec" type="text" value={f.secondary_keywords} onChange={set("secondary_keywords")} placeholder="separated by semicolons" />
        </div>
      </div>
      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor="m-cat">Category</label>
          <input id="m-cat" type="text" value={f.category} onChange={set("category")} placeholder="Local SEO" />
        </div>
        <div className="admin-field">
          <label htmlFor="m-int">Search intent</label>
          <input id="m-int" type="text" value={f.search_intent} onChange={set("search_intent")} placeholder="informational" />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="m-notes">Notes and instructions</label>
        <textarea id="m-notes" rows={3} value={f.notes} onChange={set("notes")} placeholder="Angle, audience, points to cover, links Claude may use" />
      </div>
      <div className="admin-field" style={{ maxWidth: 420 }}>
        <label htmlFor="m-status">After adding</label>
        <select id="m-status" value={status} onChange={(e) => setStatus(e.target.value as "queued" | "draft")}>
          <option value="queued">Add to the queue</option>
          <option value="draft">Keep as a draft</option>
        </select>
      </div>
      {msg ? (
        <div className={msg.tone === "error" ? "admin-banner admin-banner--error" : "auto-ok"} role={msg.tone === "error" ? "alert" : "status"}>
          {msg.text}
        </div>
      ) : null}
      <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
        {pending ? "Adding…" : "Add topic"}
      </button>
    </form>
  );
}
