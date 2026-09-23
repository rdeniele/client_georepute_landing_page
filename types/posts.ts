import type { Database, PostLocale, PostStatus } from "./database.types";
import type { ContentBlock } from "./blocks";
import { textToBlocks } from "@/lib/utils/blocks";

export type { PostStatus };
export type { PostLocale };
export type { ContentBlock };

type PostRow = Omit<Database["public"]["Tables"]["posts"]["Row"], "content_blocks"> & {
  content_blocks: ContentBlock[] | null;
};

export type Post = PostRow;
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** A post joined with its author's display fields, as returned by the list/detail queries. */
export type PostWithAuthor = Post & {
  author: Pick<Profile, "id" | "full_name" | "email"> | null;
};

/** Shape the admin editor form works with; separate from the DB row so the UI never has to know column defaults. */
export type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content_blocks: ContentBlock[];
  featured_image: string;
  category: string;
  tags: string; // comma-separated in the form, split into an array before writing
  status: PostStatus;
  locale: PostLocale;
};

export const EMPTY_POST_FORM: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content_blocks: [],
  featured_image: "",
  category: "",
  tags: "",
  status: "draft",
  locale: "en",
};

export function postToFormValues(post: Post): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    // Falls back to converting the legacy plain-text `content` column into
    // starter paragraph blocks for posts saved before the block editor
    // existed, so opening them doesn't show an empty canvas.
    content_blocks: post.content_blocks && post.content_blocks.length > 0 ? post.content_blocks : textToBlocks(post.content),
    featured_image: post.featured_image ?? "",
    category: post.category ?? "",
    tags: post.tags.join(", "),
    status: post.status,
    locale: post.locale,
  };
}
