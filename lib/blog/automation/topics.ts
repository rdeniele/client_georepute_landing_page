/**
 * Topic input: CSV/Excel rows and manual entries become clean topic records.
 *
 * Pure and dependency free so the same code runs in the browser (preview and validation before
 * anything is uploaded) and on the server (which re-validates everything: the browser is never trusted).
 * Excel files are read in the browser by `read-excel-file`; this file only sees rows of cells.
 */

export type TopicInput = {
  topic: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  category: string | null;
  search_intent: string | null;
  notes: string | null;
};

export type ImportIssue = { row: number; message: string };
export type ParsedRows = { topics: TopicInput[]; issues: ImportIssue[]; duplicates: number; header: boolean };

export const TOPIC_LIMITS = { topic: [8, 500], keyword: 120, category: 60, intent: 300, notes: 2000, maxRows: 5000 } as const;

const ALIASES: Record<keyof TopicInput, string[]> = {
  topic: ["topic", "topics", "title", "subject", "article", "article topic", "blog topic", "post", "post title", "idea"],
  primary_keyword: ["primary keyword", "main keyword", "focus keyword", "keyword", "primary_keyword", "target keyword"],
  secondary_keywords: ["secondary keywords", "secondary keyword", "secondary_keywords", "keywords", "related keywords", "supporting keywords"],
  category: ["category", "categories", "content category", "topic category", "section"],
  search_intent: ["search intent", "intent", "search_intent", "user intent"],
  notes: ["notes", "note", "instructions", "brief", "comments", "description", "extra instructions"],
};

/** A looser reading of a column name, used only when no exact synonym matched ("Content Topic", "Main Keyword (SEO)"). */
const LOOSE: Record<keyof TopicInput, RegExp> = {
  topic: /\b(topic|title|subject)s?\b/,
  primary_keyword: /^(?!.*\b(secondary|related|supporting|additional|other)\b).*\bkeyword\b/,
  secondary_keywords: /\b(secondary|related|supporting|additional|other)\b.*\bkeywords?\b|\bkeywords\b/,
  category: /\bcategor(y|ies)\b/,
  search_intent: /\bintent\b/,
  notes: /\b(notes?|instructions?|brief|comments?|description)\b/,
};

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
// Control characters (except tab/newline) and bidi overrides have no business in a topic.
const scrub = (s: unknown) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F​-‏‪-‮⁠-⁩﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** RFC 4180 CSV parser with delimiter detection (comma, semicolon or tab, as Excel exports vary by region). */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in counts) counts[ch as keyof typeof counts]++;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const delimiter = best[1] > 0 ? best[0] : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Validates and normalizes one topic. Returns an error message instead of throwing so a bad row never blocks the good ones. */
export function cleanTopic(raw: Partial<Record<keyof TopicInput, unknown>>): TopicInput | string {
  const topic = scrub(raw.topic);
  const [min, max] = TOPIC_LIMITS.topic;
  if (topic.length < min) return `The topic is too short (at least ${min} characters).`;
  if (topic.length > max) return `The topic is too long (at most ${max} characters). Put extra detail in the notes.`;

  const one = (v: unknown, limit: number) => {
    const s = scrub(v).slice(0, limit);
    return s || null;
  };
  const secondaryRaw = Array.isArray(raw.secondary_keywords) ? raw.secondary_keywords : String(raw.secondary_keywords ?? "").split(/[;|,\n]/);
  const secondary = [...new Set(secondaryRaw.map((k) => scrub(k).slice(0, TOPIC_LIMITS.keyword)).filter(Boolean))].slice(0, 12);
  const notes = String(raw.notes ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F​-‏‪-‮⁠-⁩﻿]/g, "").trim().slice(0, TOPIC_LIMITS.notes);

  return {
    topic,
    primary_keyword: one(raw.primary_keyword, TOPIC_LIMITS.keyword),
    secondary_keywords: secondary,
    category: one(raw.category, TOPIC_LIMITS.category),
    search_intent: one(raw.search_intent, TOPIC_LIMITS.intent),
    notes: notes || null,
  };
}

const DEFAULT_ORDER: (keyof TopicInput)[] = ["topic", "primary_keyword", "secondary_keywords", "category", "search_intent", "notes"];

/**
 * Turns sheet rows into topics. A header row is detected by its column names (in any order, with common
 * synonyms); without one, a single column is a plain list of topics and several columns are read in the
 * documented order: topic, primary keyword, secondary keywords, category, search intent, notes.
 */
export function rowsToTopics(rows: unknown[][], existing: ReadonlySet<string> = new Set()): ParsedRows {
  const issues: ImportIssue[] = [];
  const cells = rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : c instanceof Date ? c.toISOString().slice(0, 10) : String(c))));
  if (!cells.length) return { topics: [], issues: [{ row: 0, message: "The file has no rows." }], duplicates: 0, header: false };

  const headerCells = cells[0].map(norm);
  const map: Partial<Record<keyof TopicInput, number>> = {};
  for (const key of Object.keys(ALIASES) as (keyof TopicInput)[]) {
    // Exact synonyms first, then a looser reading of the column name ("Content Topic", "Main Keyword (SEO)").
    let idx = headerCells.findIndex((h) => ALIASES[key].includes(h));
    // Only short cells can be column names; a long first cell is a topic that happens to contain the word "topic".
    if (idx < 0) idx = headerCells.findIndex((h) => h.length <= 40 && h.split(" ").length <= 4 && LOOSE[key].test(h));
    if (idx >= 0) map[key] = idx;
  }
  // "keyword" alone is the primary keyword, but if only "keywords" exists it is the secondary list; never claim one column twice.
  const claimed = new Set<number>();
  for (const key of ["topic", "primary_keyword", "category", "search_intent", "notes", "secondary_keywords"] as const) {
    const idx = map[key];
    if (idx === undefined) continue;
    if (claimed.has(idx)) delete map[key];
    else claimed.add(idx);
  }
  const header = map.topic !== undefined;
  if (!header) {
    DEFAULT_ORDER.forEach((key, i) => {
      if (i < Math.max(...cells.map((r) => r.length))) map[key] = i;
    });
  }

  const start = header ? 1 : 0;
  if (cells.length - start > TOPIC_LIMITS.maxRows) {
    issues.push({ row: 0, message: `The file has ${cells.length - start} rows. Import at most ${TOPIC_LIMITS.maxRows} at a time.` });
    return { topics: [], issues, duplicates: 0, header };
  }

  const seen = new Set<string>();
  const topics: TopicInput[] = [];
  let duplicates = 0;
  for (let i = start; i < cells.length; i++) {
    const r = cells[i];
    const pick = (key: keyof TopicInput) => (map[key] === undefined ? "" : (r[map[key] as number] ?? ""));
    const cleaned = cleanTopic({
      topic: pick("topic"),
      primary_keyword: pick("primary_keyword"),
      secondary_keywords: pick("secondary_keywords"),
      category: pick("category"),
      search_intent: pick("search_intent"),
      notes: pick("notes"),
    });
    if (typeof cleaned === "string") {
      issues.push({ row: i + 1, message: cleaned });
      continue;
    }
    const key = cleaned.topic.toLowerCase();
    if (seen.has(key) || existing.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    topics.push(cleaned);
  }
  return { topics, issues, duplicates, header };
}

export function csvToTopics(text: string, existing?: ReadonlySet<string>): ParsedRows {
  return rowsToTopics(parseCsv(text), existing);
}
