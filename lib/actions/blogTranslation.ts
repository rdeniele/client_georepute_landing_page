"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";
import { buildGlossary } from "@/lib/blog/glossary";
import { GenerationError } from "@/lib/blog/generation";
import {
  checkTranslation,
  translatePost,
  type SourcePost,
  type TranslatedPost,
  type TranslationReport,
} from "@/lib/blog/translation";
import { Anthropic, getAnthropicClient, getTranslationModel } from "@/lib/services/claude";
import { createPost, findPostBySlugAndLocale, getPostById } from "@/lib/services/posts";
import { withinBudget } from "@/lib/services/rateLimit";
import { textToBlocks } from "@/lib/utils/blocks";
import type { ContentBlock, Post, PostLocale } from "@/types/posts";

const LOCALES: PostLocale[] = ["en", "he"];
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
// A translated post is a few hundred KB at the very most; anything bigger is not a post.
const MAX_PAYLOAD_CHARS = 600_000;

export type TranslatePostResult =
  | { ok: true; translated: TranslatedPost; report: TranslationReport; target: PostLocale }
  | { ok: false; error: string; code: string; existingId?: string };

export type CreateTranslationResult = { ok: true; id: string } | { ok: false; error: string };

function toSource(post: Post): SourcePost {
  return {
    title: post.title,
    excerpt: post.excerpt ?? "",
    category: post.category ?? "",
    tags: post.tags ?? [],
    // Posts saved before the block editor existed only have plain text.
    blocks: post.content_blocks && post.content_blocks.length > 0 ? post.content_blocks : textToBlocks(post.content),
  };
}

function isLocale(v: unknown): v is PostLocale {
  return typeof v === "string" && (LOCALES as string[]).includes(v);
}

/**
 * Translates a saved post into the other language and returns the result plus
 * a verification report. Nothing is saved here: the admin reviews the report,
 * then calls createTranslationAction to store it as an unpublished draft.
 */
export async function translatePostAction(sourceId: string, target: PostLocale): Promise<TranslatePostResult> {
  try {
    const { supabase, profile } = await requireAdmin();
    if (!isLocale(target)) throw new GenerationError("invalid_input", "Choose English or Hebrew.");

    const post = await getPostById(supabase, String(sourceId));
    if (!post) throw new GenerationError("invalid_input", "That post no longer exists.");
    if (post.locale === target) throw new GenerationError("invalid_input", "The post is already in that language.");

    const existing = await findPostBySlugAndLocale(supabase, post.slug, target);
    if (existing) {
      return { ok: false, code: "exists", existingId: existing.id, error: "This post already has a translation in that language. Open it to edit it." };
    }

    const budget = withinBudget(`translate:${profile.id}`, MAX_PER_WINDOW, WINDOW_MS);
    if (!budget.ok) {
      throw new GenerationError(
        "rate_limited",
        `You have reached the limit of ${MAX_PER_WINDOW} translations per hour. Try again in about ${Math.ceil(budget.retryAfterSeconds / 60)} minutes.`,
        budget.retryAfterSeconds,
      );
    }

    const result = await translatePost(getAnthropicClient(), toSource(post), {
      from: post.locale,
      to: target,
      model: getTranslationModel(),
      glossary: buildGlossary(),
      sdk: Anthropic,
    });
    return { ok: true, translated: result.translated, report: result.report, target };
  } catch (error) {
    if (error instanceof GenerationError) {
      console.error(`[blog-translation] ${error.code}`);
      return { ok: false, error: error.message, code: error.code };
    }
    if (error instanceof Error && error.message.startsWith("You must be signed in")) {
      return { ok: false, error: error.message, code: "auth" };
    }
    console.error("[blog-translation] unexpected", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "Translation failed unexpectedly. Try again.", code: "unknown" };
  }
}

/**
 * Stores a reviewed translation as an unpublished draft with the same slug in
 * the other language. The submitted content is re-checked against the source
 * here: the browser is not trusted, so structure, numbers, links and names are
 * verified again before anything is written.
 */
export async function createTranslationAction(input: {
  sourceId: string;
  target: PostLocale;
  translated: TranslatedPost;
  /** True when the report was "needs review". The admin must confirm they will read the flagged parts. */
  needsReview: boolean;
  acknowledged: boolean;
}): Promise<CreateTranslationResult> {
  try {
    const { supabase, profile } = await requireAdmin();
    const { sourceId, target, translated } = input;
    if (!isLocale(target)) return { ok: false, error: "Choose English or Hebrew." };
    if (
      !translated ||
      typeof translated.title !== "string" ||
      typeof translated.excerpt !== "string" ||
      typeof translated.category !== "string" ||
      !Array.isArray(translated.tags) ||
      !Array.isArray(translated.blocks) ||
      JSON.stringify(translated).length > MAX_PAYLOAD_CHARS
    ) {
      return { ok: false, error: "The translation is malformed. Translate the post again." };
    }

    const post = await getPostById(supabase, String(sourceId));
    if (!post) return { ok: false, error: "That post no longer exists." };
    if (post.locale === target) return { ok: false, error: "The post is already in that language." };
    if (await findPostBySlugAndLocale(supabase, post.slug, target)) {
      return { ok: false, error: "A translation already exists in that language." };
    }

    const { issues } = checkTranslation(toSource(post), translated, { from: post.locale, to: target, glossary: buildGlossary() });
    const critical = issues.filter((i) => i.severity === "critical");
    if (critical.length) {
      return { ok: false, error: `The translation failed validation (${critical.length} critical problem${critical.length === 1 ? "" : "s"}, for example: ${critical[0].note}). Translate the post again.` };
    }
    const major = issues.some((i) => i.severity === "major");
    if ((major || input.needsReview) && !input.acknowledged) {
      return { ok: false, error: "Confirm that you will review the flagged issues before saving this translation." };
    }

    const created = await createPost(
      supabase,
      {
        title: translated.title.trim(),
        slug: post.slug,
        excerpt: translated.excerpt.trim(),
        content_blocks: translated.blocks as ContentBlock[],
        // Not copied: deleting either post would delete the shared image from storage for the other.
        featured_image: "",
        category: translated.category.trim(),
        tags: translated.tags.join(", "),
        status: "draft",
        locale: target,
      },
      profile.id,
    );

    revalidatePath("/admin/blogs");
    return { ok: true, id: created.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("You must be signed in")) return { ok: false, error: message };
    if (/duplicate|unique/i.test(message)) return { ok: false, error: "A post with this slug already exists in that language." };
    console.error("[blog-translation] create failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "Could not save the translation. Try again." };
  }
}
