/**
 * A block from the admin post editor (components/admin/BlockEditor.tsx,
 * built on BlockNote). Deliberately loose rather than importing BlockNote's
 * own generic `Block<...>` type — this shape only needs to round-trip
 * through JSON storage and a small public renderer
 * (components/blog/BlockRenderer.tsx); BlockNote's own strict typing is kept
 * internal to the editor component.
 *
 * Lives in its own module (rather than types/posts.ts) so lib/utils/blocks.ts
 * can import it without a circular dependency.
 */
export type ContentBlock = {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: ContentBlock[];
};
