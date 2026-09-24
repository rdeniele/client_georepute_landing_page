import type { ReactNode } from "react";
import type { ContentBlock } from "@/types/posts";
import { safeHref } from "@/lib/utils/safeHref";

type InlineNode = {
  type?: string;
  text?: string;
  href?: string;
  content?: unknown;
  styles?: Record<string, unknown>;
};

function renderInline(content: unknown): ReactNode {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return null;

  return content.map((raw, i) => {
    const node = raw as InlineNode;
    if (!node || typeof node !== "object") return null;

    if (node.type === "link") {
      // Editor content is untrusted: a javascript: or data: URL would run script on click, so only
      // http(s), mailto, tel and site-relative links become anchors. Anything else keeps its text.
      const href = safeHref(node.href);
      if (!href) return <span key={i}>{renderInline(node.content)}</span>;
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer">
          {renderInline(node.content)}
        </a>
      );
    }

    if (node.type === "text") {
      const styles = node.styles ?? {};
      let text: ReactNode = node.text ?? "";
      if (styles.code) text = <code>{text}</code>;
      if (styles.strike) text = <s>{text}</s>;
      if (styles.underline) text = <u>{text}</u>;
      if (styles.italic) text = <em>{text}</em>;
      if (styles.bold) text = <strong>{text}</strong>;
      return <span key={i}>{text}</span>;
    }

    return null;
  });
}

function renderBlock(block: ContentBlock, key: number): ReactNode {
  switch (block.type) {
    case "heading": {
      const level = Number((block.props as { level?: number } | undefined)?.level) || 2;
      // Clamped to h2–h4: the article's own H1 is the post title, and h5/h6 have no distinct style here.
      const Tag = (level <= 2 ? "h2" : level === 3 ? "h3" : "h4") as "h2" | "h3" | "h4";
      return <Tag key={key}>{renderInline(block.content)}</Tag>;
    }
    case "paragraph":
      return <p key={key}>{renderInline(block.content)}</p>;
    case "quote":
      return <blockquote key={key}>{renderInline(block.content)}</blockquote>;
    case "divider":
      return <hr key={key} />;
    case "bulletListItem":
      return <li key={key}>{renderInline(block.content)}</li>;
    case "numberedListItem":
      return <li key={key}>{renderInline(block.content)}</li>;
    case "image": {
      const props = (block.props ?? {}) as { url?: string; caption?: string };
      if (!props.url) return null;
      return (
        <figure key={key} className="blog-article__image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.url} alt={props.caption ?? ""} loading="lazy" />
          {props.caption ? <figcaption>{props.caption}</figcaption> : null}
        </figure>
      );
    }
    default:
      return null;
  }
}

/**
 * Renders the block-editor content (components/admin/BlockEditor.tsx) as
 * plain HTML for public readers, without shipping BlockNote's editor JS to
 * them. Consecutive list-item blocks of the same type are grouped into a
 * single <ul>/<ol> — BlockNote stores each list item as its own top-level
 * block, it doesn't nest them under a list block.
 */
export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulletListItem" || block.type === "numberedListItem") {
      const listType = block.type;
      const items: ReactNode[] = [];
      while (i < blocks.length && blocks[i].type === listType) {
        items.push(renderBlock(blocks[i], i));
        i++;
      }
      const ListTag = listType === "bulletListItem" ? "ul" : "ol";
      nodes.push(<ListTag key={`list-${i}`}>{items}</ListTag>);
      continue;
    }

    nodes.push(renderBlock(block, i));
    i++;
  }

  return <>{nodes}</>;
}
