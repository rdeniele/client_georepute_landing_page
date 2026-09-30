"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { addTopicAction, importTopicsAction } from "@/lib/actions/blogAutomation";
import { csvToTopics, rowsToTopics, type ParsedRows, type TopicInput } from "@/lib/blog/automation/topics";
import { Flow } from "@/components/admin/ui/kit";

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
        <h2>Add many topics at once</h2>
        <p className="auto-card__hint">A topic is one article idea. Put your ideas in a spreadsheet, one per row, and upload it. Hundreds or thousands are fine.</p>
        <Flow
          steps={[
            { title: "Get the template", text: "A ready-made spreadsheet with the right columns and three examples.", href: "/blog-topics-template.csv", download: true },
            { title: "Fill it in", text: "One topic per row. Only the Topic column is required; the rest makes the articles better." },
            { title: "Upload it here", text: "You see exactly what will be added before anything happens." },
          ]}
        />
        <details className="ui-more">
          <summary>What goes in each column?</summary>
          <dl className="ui-prose" style={{ marginTop: 8 }}>
            <dt>Topic (required)</dt>
            <dd>The article idea or working title, for example “How to get more customer reviews”.</dd>
            <dt>Primary keyword</dt>
            <dd>The main phrase people search for. The article is built around it. Example: “customer reviews”.</dd>
            <dt>Secondary keywords</dt>
            <dd>Related phrases, separated by semicolons.</dd>
            <dt>Category</dt>
            <dd>The group the article belongs to, such as “Reputation”.</dd>
            <dt>Search intent</dt>
            <dd>What the reader wants: to learn something (“informational”), to compare, or to buy (“commercial”).</dd>
            <dt>Notes</dt>
            <dd>Anything the AI should know: who it is for, what to include, links it may use.</dd>
          </dl>
          <p className="auto-meta">The column names can be in any order as long as the first row names them.</p>
        </details>

        <label className="auto-dropzone">
          <input ref={input} type="file" accept=".csv,.tsv,.txt,.xlsx,text/csv" onChange={onFile} disabled={importing} />
          <strong>{parsed ? parsed.fileName : "Click to choose your file"}</strong>
          <br />
          <span>A spreadsheet saved as CSV or Excel (.xlsx). Up to 5 MB and 5,000 rows.</span>
        </label>

        {error ? (
          <div className="admin-banner admin-banner--error" role="alert" style={{ marginTop: 14 }}>
            {error}
          </div>
        ) : null}

        {parsed ? (
          <div style={{ marginTop: 18 }}>
            <p className="auto-meta">
              <strong>{parsed.topics.length.toLocaleString("en-US")}</strong> topic{parsed.topics.length === 1 ? "" : "s"} found in your file
              {parsed.duplicates ? <>, {parsed.duplicates.toLocaleString("en-US")} repeated topic{parsed.duplicates === 1 ? "" : "s"} left out</> : null}
              {parsed.issues.length ? <>, <strong>{parsed.issues.length}</strong> row{parsed.issues.length === 1 ? "" : "s"} that cannot be used (listed below)</> : null}.
              {!parsed.header ? " There is no header row, so the columns are read in the standard order: Topic, Primary keyword, Secondary keywords, Category, Search intent, Notes." : null} Nothing is added until you press the button.
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
                    <th>Main phrase</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.topics.slice(0, 6).map((t, i) => (
                    <tr key={i}>
                      <td>{t.topic}</td>
                      <td>{t.primary_keyword ?? "—"}</td>
                      <td>{t.category ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {parsed.topics.length > 6 ? <p className="auto-meta">Showing the first 6 of {parsed.topics.length.toLocaleString("en-US")}.</p> : null}

            <div className="admin-field" style={{ marginTop: 16, maxWidth: 420 }}>
              <label htmlFor="import-status">What should happen to them?</label>
              <select id="import-status" value={status} onChange={(e) => setStatus(e.target.value as "queued" | "draft")} disabled={importing}>
                <option value="queued">Put them in the list to be written (recommended)</option>
                <option value="draft">Save them for later (I will decide when)</option>
              </select>
            </div>

            <button type="button" className="admin-btn admin-btn--primary" disabled={importing || parsed.topics.length === 0} onClick={runImport}>
              {importing ? "Adding…" : `Add ${parsed.topics.length.toLocaleString("en-US")} topic${parsed.topics.length === 1 ? "" : "s"}`}
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
            Added <strong>{result.inserted.toLocaleString("en-US")}</strong> topic{result.inserted === 1 ? "" : "s"}
            {result.duplicates ? `, skipped ${result.duplicates.toLocaleString("en-US")} that were already in the list` : ""}
            {result.invalid ? `, ${result.invalid} could not be used` : ""}. <strong>Next:</strong> go to the <Link href="/admin/automation">Overview</Link> and press <em>Start the Auto-Writer</em> if it is not on yet, or <Link href="/admin/automation/queue">see your articles</Link>.
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
        setMsg({ tone: "ok", text: "Added. It is now in your list." });
        router.refresh();
      } else setMsg({ tone: "error", text: res.error });
    });
  }

  return (
    <form className="auto-card" onSubmit={submit}>
      <h2>Or add just one topic</h2>
      <p className="auto-card__hint">For a single idea. Only the first box is required. The more you tell the AI, the better the article.</p>
      <div className="admin-field">
        <label htmlFor="m-topic">What is the article about?</label>
        <input id="m-topic" type="text" value={f.topic} onChange={set("topic")} required placeholder="How to improve your local business visibility on Google" />
      </div>
      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor="m-key">Main phrase people search for</label>
          <input id="m-key" type="text" value={f.primary_keyword} onChange={set("primary_keyword")} placeholder="local business visibility" />
        </div>
        <div className="admin-field">
          <label htmlFor="m-sec">Related phrases</label>
          <input id="m-sec" type="text" value={f.secondary_keywords} onChange={set("secondary_keywords")} placeholder="separate them with semicolons" />
        </div>
      </div>
      <div className="admin-row">
        <div className="admin-field">
          <label htmlFor="m-cat">Category</label>
          <input id="m-cat" type="text" value={f.category} onChange={set("category")} placeholder="Local SEO" />
        </div>
        <div className="admin-field">
          <label htmlFor="m-int">What does the reader want?</label>
          <input id="m-int" type="text" value={f.search_intent} onChange={set("search_intent")} placeholder="to learn something, to compare, to buy..." />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="m-notes">Instructions for the AI</label>
        <textarea id="m-notes" rows={3} value={f.notes} onChange={set("notes")} placeholder="Who is it for? What should it cover? Any web links you paste here are the only ones it may use." />
      </div>
      <div className="admin-field" style={{ maxWidth: 420 }}>
        <label htmlFor="m-status">What should happen to it?</label>
        <select id="m-status" value={status} onChange={(e) => setStatus(e.target.value as "queued" | "draft")}>
          <option value="queued">Put it in the list to be written</option>
          <option value="draft">Save it for later</option>
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
