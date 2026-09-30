/**
 * Pictures inside an article (not the featured image).
 *
 * The model plans them (which section, what to search for, what the photo should be described as); this code finds the
 * photos, places them and writes the blocks. Pure logic with an injected image finder, so it is testable offline.
 *
 * Storage. An article body is BlockNote blocks, and BlockNote's image block has only `url`, `caption`, `name`,
 * `showPreview` (no alt text, no credit). Those are the props that survive a round trip through the editor, so:
 *   - `caption`  the visible credit line, in the article's language ("Photo by Jane Doe on Unsplash").
 *   - `name`     a small JSON object: { alt, by, byUrl }. `alt` is the description for screen readers and search
 *                engines, `by`/`byUrl` are the photographer, used to link the credit as Unsplash's guidelines require.
 * A picture added by hand in the editor has a plain file name in `name` and no JSON; every reader below tolerates that.
 */
import type { ContentBlock } from "@/types/blocks";
import type { FeaturedImage, ImageFinder } from "./images";
import { chartAlt, chartCaption, chartDataUri, chartTexts, parseChartSpec, withChartTexts, type ChartSpec, type PlannedChart } from "./charts";

/** Credit line per language. `{name}` is the photographer. Localization rewrites the caption from this, never translates it. */
export const PHOTO_CREDIT: Record<string, string> = {
  en: "Photo by {name} on Unsplash",
  he: "צילום: {name}, Unsplash",
  ar: "تصوير: {name} عبر Unsplash",
  ru: "Фото: {name}, Unsplash",
  fr: "Photo de {name} sur Unsplash",
  es: "Foto de {name} en Unsplash",
  pt: "Foto de {name} no Unsplash",
};

export const photoCaption = (locale: string, name: string) => (PHOTO_CREDIT[locale] ?? PHOTO_CREDIT.en).replace("{name}", name);

export type PlannedImage = { heading: string; query: string; alt: string };
export type ImageMeta = { alt: string; by: string; byUrl: string; /** Present when the picture is a chart or diagram drawn by us (see charts.ts). */ chart?: ChartSpec };

const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((n: { text?: unknown; content?: unknown }) => (typeof n?.text === "string" ? n.text : textOf(n?.content))).join("");
}

/** Reads an image block's description and photographer. A hand-added picture (plain file name) falls back to its caption. */
export function readImageMeta(block: ContentBlock): ImageMeta {
  const props = (block.props ?? {}) as { name?: unknown; caption?: unknown };
  const caption = typeof props.caption === "string" ? props.caption : "";
  if (typeof props.name === "string" && props.name.trim().startsWith("{")) {
    try {
      const j = JSON.parse(props.name) as Partial<ImageMeta>;
      return {
        alt: typeof j.alt === "string" && j.alt.trim() ? j.alt.trim() : caption,
        by: typeof j.by === "string" ? j.by : "",
        byUrl: typeof j.byUrl === "string" ? j.byUrl : "",
        chart: parseChartSpec((j as { chart?: unknown }).chart) ?? undefined,
      };
    } catch {
      // Not ours: fall through.
    }
  }
  return { alt: caption, by: "", byUrl: "" };
}

/** The block for one photo. Credit and alt travel in the supported props (see the file comment). */
export function imageBlock(o: { image: FeaturedImage; alt: string; locale: string }): ContentBlock {
  const { credit } = o.image;
  const meta: ImageMeta = { alt: o.alt, by: credit.photographer, byUrl: credit.photographerUrl };
  return {
    type: "image",
    props: { url: o.image.url, caption: photoCaption(o.locale, credit.photographer), name: JSON.stringify(meta), showPreview: true },
  };
}

/** Where a picture goes: after the first paragraph under the heading, so the section's direct answer stays first. */
export function insertAfterHeading(blocks: ContentBlock[], heading: string, picture: ContentBlock): ContentBlock[] | null {
  const want = norm(heading);
  const at = blocks.findIndex((b) => b.type === "heading" && norm(textOf(b.content)) === want);
  if (at < 0) return null;
  const next = blocks[at + 1];
  const insertAt = next && next.type === "paragraph" ? at + 2 : at + 1;
  return [...blocks.slice(0, insertAt), picture, ...blocks.slice(insertAt)];
}

export const imageBlocks = (blocks: ContentBlock[]) => blocks.filter((b) => b.type === "image");
export const imageUrls = (blocks: ContentBlock[]): string[] =>
  imageBlocks(blocks)
    .map((b) => (b.props as { url?: unknown } | undefined)?.url)
    .filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u));

/**
 * Finds a different photo for each planned picture. Two pictures in one article never show the same photo, and none
 * repeats the featured image: a search that returns an already-used photo is retried with another seed.
 */
export async function findSectionImages(
  finder: ImageFinder,
  plan: PlannedImage[],
  o: { seed: string; avoid?: string[] },
): Promise<{ plan: PlannedImage; image: FeaturedImage }[]> {
  const used = new Set(o.avoid ?? []);
  const out: { plan: PlannedImage; image: FeaturedImage }[] = [];
  for (const [i, p] of plan.entries()) {
    for (const tag of ["", ":1", ":2"]) {
      let image: FeaturedImage | null = null;
      try {
        image = await finder.find(p.query, `${o.seed}:${i}${tag}`);
      } catch {
        image = null;
      }
      if (!image) break; // nothing for this search: retrying the same query will not help
      if (used.has(image.url)) continue;
      used.add(image.url);
      out.push({ plan: p, image });
      break;
    }
  }
  return out;
}

/** Places every found picture. A picture whose heading cannot be found is skipped, never forced somewhere. */
export function placeImages(blocks: ContentBlock[], found: { plan: PlannedImage; image: FeaturedImage }[], locale: string): { blocks: ContentBlock[]; placed: number } {
  let out = blocks;
  let placed = 0;
  for (const f of found) {
    const next = insertAfterHeading(out, f.plan.heading, imageBlock({ image: f.image, alt: f.plan.alt, locale }));
    if (next) {
      out = next;
      placed++;
    }
  }
  return { blocks: out, placed };
}

/** The block for a chart or diagram. The data rides along in `name` so it can be redrawn in another language. */
export function chartBlock(o: { spec: ChartSpec; locale: string }): ContentBlock {
  const meta = { alt: chartAlt(o.spec, o.locale), chart: o.spec };
  return { type: "image", props: { url: chartDataUri(o.spec, o.locale), caption: chartCaption(o.spec, o.locale), name: JSON.stringify(meta), showPreview: true } };
}

/** Places charts the same way as photos (after the first paragraph of the section). A chart whose heading is missing is skipped. */
export function placeCharts(blocks: ContentBlock[], charts: PlannedChart[], locale: string): { blocks: ContentBlock[]; placed: number } {
  let out = blocks;
  let placed = 0;
  for (const c of charts) {
    const next = insertAfterHeading(out, c.heading, chartBlock({ spec: c.spec, locale }));
    if (next) {
      out = next;
      placed++;
    }
  }
  return { blocks: out, placed };
}

/**
 * What must be translated for each picture, in document order: a photo has one text (its description), a chart has its
 * title, its labels or steps and its source. Numbers and units are never translated.
 */
export function imageTexts(blocks: ContentBlock[]): string[][] {
  return imageBlocks(blocks).map((b) => {
    const m = readImageMeta(b);
    return m.chart ? chartTexts(m.chart) : [m.alt];
  });
}

/**
 * The same document with each picture's texts replaced (same order as `imageTexts`) and its credit or caption rewritten in
 * `locale`. Photos keep their photo and photographer; charts are redrawn from their data in the target language and direction.
 */
export function applyImageTexts(blocks: ContentBlock[], texts: string[][], locale: string): ContentBlock[] {
  let i = 0;
  return blocks.map((b) => {
    if (b.type !== "image") return b;
    const meta = readImageMeta(b);
    const mine = texts[i++] ?? [];
    if (meta.chart) return chartBlock({ spec: withChartTexts(meta.chart, mine), locale });
    const alt = mine[0]?.trim() || meta.alt;
    const props = { ...((b.props ?? {}) as Record<string, unknown>) };
    if (meta.by) {
      props.caption = photoCaption(locale, meta.by);
      props.name = JSON.stringify({ alt, by: meta.by, byUrl: meta.byUrl } satisfies ImageMeta);
    } else if (typeof props.caption === "string" && props.caption.trim()) {
      // A picture added by hand: its caption is its description, so the translated description is its new caption.
      props.caption = alt;
    }
    return { ...b, props };
  });
}
