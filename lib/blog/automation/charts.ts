/**
 * Charts and diagrams inside articles, drawn by our own code as SVG.
 *
 * Why SVG in an image block: the article body is BlockNote blocks and the editor only knows its built-in block types. An image
 * block whose address is a small `data:image/svg+xml` picture works in the editor and on the public page with no new block
 * type, no new database column and no script (an SVG shown through <img> can never run code). The chart's data travels with the
 * block (see inlineImages.ts), so it can be redrawn in another language.
 *
 * Honesty. The model is asked to plan charts; it is never trusted with facts. A bar chart counts as real data only if it names a
 * source AND every one of its numbers appears in the topic or the brief the admin supplied. Anything else is drawn with an
 * "Illustrative example, not real data" badge inside the picture itself, so the label cannot be cropped or lost when the
 * picture is copied. Process diagrams carry no numbers and need no label.
 */

import { localeDirections } from "@/lib/i18n";

export type BarSpec = { kind: "bar"; title: string; unit: string; items: { label: string; value: number }[]; illustrative: boolean; source: string };
export type ProcessSpec = { kind: "process"; title: string; steps: string[] };
export type ChartSpec = BarSpec | ProcessSpec;
export type PlannedChart = { heading: string; spec: ChartSpec };

export const CHART_WORDS: Record<string, { bar: string; process: string; illustrative: string; source: string }> = {
  en: { bar: "Bar chart", process: "Process diagram", illustrative: "Illustrative example, not real data", source: "Source" },
  he: { bar: "תרשים עמודות", process: "תרשים תהליך", illustrative: "דוגמה להמחשה בלבד, לא נתונים אמיתיים", source: "מקור" },
  ar: { bar: "مخطط شريطي", process: "مخطط العملية", illustrative: "مثال توضيحي وليس بيانات حقيقية", source: "المصدر" },
  ru: { bar: "Столбчатая диаграмма", process: "Схема процесса", illustrative: "Пример для иллюстрации, не реальные данные", source: "Источник" },
  fr: { bar: "Graphique à barres", process: "Schéma du processus", illustrative: "Exemple illustratif, pas des données réelles", source: "Source" },
  es: { bar: "Gráfico de barras", process: "Diagrama del proceso", illustrative: "Ejemplo ilustrativo, no son datos reales", source: "Fuente" },
  pt: { bar: "Gráfico de barras", process: "Diagrama do processo", illustrative: "Exemplo ilustrativo, não são dados reais", source: "Fonte" },
};
const words = (locale: string) => CHART_WORDS[locale] ?? CHART_WORDS.en;
/** Direction comes from the site's own language settings (lib/i18n.ts), never from a list kept here. */
export const isRtl = (locale: string) => (localeDirections as Record<string, string>)[locale] === "rtl";

export const CHART_LIMITS = { barItems: [2, 6], steps: [3, 6], label: 40, step: 60, title: 90, unit: 12, source: 80 } as const;

/* -------------------------------------------------------------------------- */
/* Reading and checking a spec                                                */
/* -------------------------------------------------------------------------- */

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");

/** Parses a stored or model-supplied spec defensively. Returns null unless it is a drawable, in-limits chart. */
export function parseChartSpec(raw: unknown): ChartSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = clean(r.title, CHART_LIMITS.title);
  if (title.length < 3) return null;
  if (r.kind === "process") {
    const steps = (Array.isArray(r.steps) ? r.steps : []).map((s) => clean(s, CHART_LIMITS.step)).filter((s) => s.length >= 2);
    return steps.length >= CHART_LIMITS.steps[0] && steps.length <= CHART_LIMITS.steps[1] ? { kind: "process", title, steps } : null;
  }
  if (r.kind === "bar") {
    const items = (Array.isArray(r.items) ? r.items : [])
      .map((i) => ({ label: clean((i as { label?: unknown })?.label, CHART_LIMITS.label), value: Number((i as { value?: unknown })?.value) }))
      .filter((i) => i.label.length >= 1 && Number.isFinite(i.value) && i.value >= 0 && i.value <= 1e9);
    if (items.length < CHART_LIMITS.barItems[0] || items.length > CHART_LIMITS.barItems[1] || items.every((i) => i.value === 0)) return null;
    return { kind: "bar", title, unit: clean(r.unit, CHART_LIMITS.unit), items, illustrative: r.illustrative !== false, source: clean(r.source, CHART_LIMITS.source) };
  }
  return null;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));
/** A value with its unit: "82%" stays tight, but a unit written in words ("days", "h") is separated by a space. */
const withUnit = (n: number, unit: string) => `${fmt(n)}${unit && /^\p{L}/u.test(unit) ? " " : ""}${unit}`;

/**
 * The honesty rule. A bar chart is "real data" only with a named source and when every number in it appears in `evidence`
 * (the topic, the notes and keywords the admin wrote). Otherwise it is forced to illustrative and its source is dropped.
 */
export function enforceHonesty(spec: ChartSpec, evidence: string): ChartSpec {
  if (spec.kind !== "bar") return spec;
  const sourced = !!spec.source && spec.items.every((i) => new RegExp(`(?<![\\d.,])${escapeRegExp(fmt(i.value))}(?![\\d])`).test(evidence));
  return sourced ? { ...spec, illustrative: false } : { ...spec, illustrative: true, source: "" };
}

/** The text of a chart that needs translating, in a fixed order. Numbers and the unit are never translated. */
export function chartTexts(spec: ChartSpec): string[] {
  return spec.kind === "bar" ? [spec.title, ...spec.items.map((i) => i.label), ...(spec.source ? [spec.source] : [])] : [spec.title, ...spec.steps];
}

/** Puts translated texts (same order as `chartTexts`) back into a spec. Missing entries keep the original wording. */
export function withChartTexts(spec: ChartSpec, texts: string[]): ChartSpec {
  const t = (i: number, fallback: string) => clean(texts[i], 200) || fallback;
  if (spec.kind === "bar") {
    return { ...spec, title: t(0, spec.title), items: spec.items.map((it, i) => ({ ...it, label: t(1 + i, it.label) })), source: spec.source ? t(1 + spec.items.length, spec.source) : "" };
  }
  return { ...spec, title: t(0, spec.title), steps: spec.steps.map((s, i) => t(1 + i, s)) };
}

/* -------------------------------------------------------------------------- */
/* Words a screen reader hears                                                */
/* -------------------------------------------------------------------------- */

export function chartAlt(spec: ChartSpec, locale: string): string {
  const w = words(locale);
  if (spec.kind === "process") return `${w.process}: ${spec.title}. ${spec.steps.map((s, i) => `${i + 1}. ${s}`).join(" ")}`;
  const data = spec.items.map((i) => `${i.label}: ${withUnit(i.value, spec.unit)}`).join("; ");
  return `${w.bar}: ${spec.title}. ${data}.${spec.illustrative ? ` ${w.illustrative}.` : spec.source ? ` ${w.source}: ${spec.source}.` : ""}`;
}

export function chartCaption(spec: ChartSpec, locale: string): string {
  const w = words(locale);
  if (spec.kind === "bar") return spec.illustrative ? w.illustrative : spec.source ? `${w.source}: ${spec.source}` : "";
  return "";
}

/* -------------------------------------------------------------------------- */
/* Drawing                                                                    */
/* -------------------------------------------------------------------------- */

const W = 760;
const PAD = 32;
const INK = "#0C1134";
const MUTED = "#4A4F75";
const BG = "#F6F4FF";
const BRAND = "#744BD1";
const TRACK = "#E4DDFA";
const FONT = "'Segoe UI', 'Noto Sans', 'Noto Sans Hebrew', 'Noto Sans Arabic', Arial, sans-serif";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/** Greedy word wrap by character count (a fair stand-in for width at a fixed font size). */
function wrap(text: string, perLine: number, maxLines: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > perLine) {
      out.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  if (out.length > maxLines) {
    out.length = maxLines;
    out[maxLines - 1] = `${out[maxLines - 1].replace(/[\s.,;:]+$/, "")}…`;
  }
  return out;
}

export function renderChartSvg(spec: ChartSpec, locale: string): string {
  const rtl = isRtl(locale);
  const w = words(locale);
  const anchor = rtl ? "end" : "start"; // where text sits on screen: right edge for right-to-left languages
  const edge = rtl ? W - PAD : PAD;
  const dir = rtl ? "rtl" : "ltr";
  // `a` is where the text sits on screen ("end" = its right edge is at x). SVG's text-anchor is relative to the text direction:
  // in a right-to-left chart "start" is the right edge, so the visual anchor is flipped for those languages.
  const text = (x: number, y: number, size: number, fill: string, body: string, weight = 400, a = anchor) => {
    const svgAnchor = a === "middle" ? "middle" : rtl ? (a === "end" ? "start" : "end") : a;
    return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${svgAnchor}" direction="${dir}" font-family="${FONT}">${esc(body)}</text>`;
  };

  const titleLines = wrap(spec.title, 44, 2);
  let y = PAD + 22;
  const parts: string[] = [];
  for (const line of titleLines) {
    parts.push(text(edge, y, 26, INK, line, 700));
    y += 34;
  }
  y += 10;

  if (spec.kind === "bar") {
    const max = Math.max(...spec.items.map((i) => i.value));
    const valueRoom = 130;
    const track = W - 2 * PAD - valueRoom;
    for (const item of spec.items) {
      const barW = Math.max(6, Math.round((item.value / max) * track));
      const x = rtl ? W - PAD - barW : PAD;
      const trackX = rtl ? W - PAD - track : PAD;
      parts.push(text(edge, y + 16, 21, INK, wrap(item.label, 50, 1)[0]));
      parts.push(`<rect x="${trackX}" y="${y + 26}" width="${track}" height="24" rx="12" fill="${TRACK}"/>`);
      parts.push(`<rect x="${x}" y="${y + 26}" width="${barW}" height="24" rx="12" fill="${BRAND}"/>`);
      // The value sits just past the end of the track: to its right (left-to-right) or to its left (right-to-left).
      parts.push(text(rtl ? PAD + valueRoom - 18 : PAD + track + 18, y + 45, 21, INK, withUnit(item.value, spec.unit), 700, rtl ? "end" : "start"));
      y += 70;
    }
    if (spec.illustrative) {
      parts.push(`<rect x="${PAD}" y="${y}" width="${W - 2 * PAD}" height="34" rx="8" fill="#FBEBD7"/>`);
      parts.push(text(W / 2, y + 23, 17, "#7A4310", w.illustrative, 600, "middle"));
      y += 44;
    } else if (spec.source) {
      parts.push(text(edge, y + 18, 16, MUTED, `${w.source}: ${wrap(spec.source, 70, 1)[0]}`));
      y += 34;
    }
  } else {
    const cx = rtl ? W - PAD - 22 : PAD + 22;
    spec.steps.forEach((step, i) => {
      const boxX = rtl ? PAD : PAD + 60;
      const boxW = W - 2 * PAD - 60;
      if (i < spec.steps.length - 1) parts.push(`<line x1="${cx}" y1="${y + 46}" x2="${cx}" y2="${y + 70}" stroke="${BRAND}" stroke-width="3" stroke-linecap="round"/>`);
      parts.push(`<circle cx="${cx}" cy="${y + 24}" r="22" fill="${BRAND}"/>`);
      parts.push(text(cx, y + 32, 22, "#FFFFFF", String(i + 1), 700, "middle"));
      parts.push(`<rect x="${boxX}" y="${y}" width="${boxW}" height="48" rx="12" fill="#FFFFFF" stroke="${TRACK}" stroke-width="2"/>`);
      parts.push(text(rtl ? boxX + boxW - 18 : boxX + 18, y + 31, 20, INK, wrap(step, 52, 1)[0]));
      y += 72;
    });
  }

  const height = y + PAD - 8;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}" width="${W}" height="${height}" role="img"><rect width="${W}" height="${height}" rx="18" fill="${BG}"/>${parts.join("")}</svg>`;
}

/** The address an image block stores. Only ever contains a picture our own code drew. */
export function chartDataUri(spec: ChartSpec, locale: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(renderChartSvg(spec, locale), "utf-8").toString("base64")}`;
}

/** True for the pictures above (and nothing else): the renderer's allow-list for data addresses. */
export const isChartDataUri = (u: unknown): u is string => typeof u === "string" && u.length < 250_000 && /^data:image\/svg\+xml;base64,[A-Za-z0-9+/]+={0,2}$/.test(u);
