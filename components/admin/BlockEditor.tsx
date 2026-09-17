"use client";

import "@blocknote/mantine/style.css";
import { BlockNoteSchema, defaultBlockSpecs, type PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadBlogImage } from "@/lib/services/storage";
import type { ContentBlock } from "@/types/posts";

/**
 * Deliberately small: headings, paragraph, both list types, quote, divider
 * and image cover the MVP block set. More block types (gallery, video,
 * table, embed, code, FAQ) are a later phase — see the conversation this
 * was scoped in.
 */
export const blogEditorSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    quote: defaultBlockSpecs.quote,
    divider: defaultBlockSpecs.divider,
    image: defaultBlockSpecs.image,
  },
});

const EMPTY_DOCUMENT: PartialBlock<typeof blogEditorSchema.blockSchema>[] = [{ type: "paragraph" }];

/** Maps BlockNote's theming API onto this site's own CSS tokens, so the editor reads as part of the admin, not a bolted-on widget. */
const blogEditorTheme = {
  colors: {
    editor: { text: "var(--color-ink)", background: "transparent" },
    menu: { text: "var(--color-ink)", background: "var(--color-elevated)" },
    tooltip: { text: "var(--color-ink)", background: "var(--color-raised)" },
    hovered: { text: "var(--color-ink)", background: "var(--color-raised)" },
    selected: { text: "#fff", background: "var(--color-signal-core)" },
    disabled: { text: "var(--color-ink-faint)", background: "var(--color-raised)" },
    shadow: "var(--line)",
    border: "var(--line)",
    sideMenu: "var(--color-ink-faint)",
  },
  borderRadius: 6,
  fontFamily: "inherit",
};

export function BlockEditor({
  initialBlocks,
  onChange,
}: {
  initialBlocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const editor = useCreateBlockNote({
    schema: blogEditorSchema,
    initialContent: initialBlocks.length > 0 ? (initialBlocks as never) : EMPTY_DOCUMENT,
    uploadFile: async (file: File) => {
      const supabase = createSupabaseBrowserClient();
      const { publicUrl } = await uploadBlogImage(supabase, file);
      return publicUrl;
    },
  });

  return (
    <div className="admin-editor">
      <BlockNoteView
        editor={editor}
        theme={blogEditorTheme}
        onChange={() => onChange(editor.document as unknown as ContentBlock[])}
      />
    </div>
  );
}
