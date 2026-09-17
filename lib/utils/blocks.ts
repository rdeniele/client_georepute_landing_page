import type { ContentBlock } from "@/types/blocks";

/**
 * Extracts plain text from a block's inline content, which is either a bare
 * string (BlockNote's shorthand for a single unstyled run) or an array of
 * styled-text/link nodes.
 */
function inlineToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const item = node as { type?: string; text?: string; content?: unknown };
      if (item.type === "link") return inlineToText(item.content);
      if (typeof item.text === "string") return item.text;
      return "";
    })
    .join("");
}

/**
 * Derives a plain-text mirror of the block content, used for the JSON-LD
 * description fallback, excerpt fallback and anywhere else that still wants
 * a plain string (search indexing, RSS, etc). Kept in sync with
 * `content_blocks` on every save — see `toInsert` in lib/services/posts.ts.
 */
export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => inlineToText(block.content))
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Converts legacy plain-text content (posts created before the block editor
 * existed) into a starter set of paragraph blocks, so opening an old post in
 * the new editor shows its text instead of an empty canvas.
 */
export function textToBlocks(content: string): ContentBlock[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", content: text }));
}

/**
 * Finds the first image block's URL in a post's content — used as the blog
 * card thumbnail when the author uploaded an image into the body but never
 * set a separate featured image. Both images live in the same `blog-images`
 * bucket either way (see lib/services/storage.ts), this just picks whichever
 * one the author already has.
 */
export function getFirstContentImage(blocks: ContentBlock[] | null | undefined): string | null {
  if (!blocks) return null;
  for (const block of blocks) {
    if (block.type === "image") {
      const url = (block.props as { url?: string } | undefined)?.url;
      if (url) return url;
    }
  }
  return null;
}
