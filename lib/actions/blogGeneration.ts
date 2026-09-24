"use server";

import { requireAdmin } from "./guard";
import {
  GenerationError,
  generateBlogDraft,
  validateInput,
  type BlogGenerationInput,
  type GeneratedDraft,
  type GenerationErrorCode,
} from "@/lib/blog/generation";
import { Anthropic, getAnthropicClient, getBlogModel } from "@/lib/services/claude";
import { withinBudget } from "@/lib/services/rateLimit";

export type GenerateDraftResult =
  | { ok: true; draft: GeneratedDraft }
  | { ok: false; error: string; code: GenerationErrorCode; retryAfterSeconds?: number };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 12;

/**
 * Writes a first draft with Claude. Admin-only (re-checked here, since server
 * actions are reachable by direct POST). Returns the draft to the editor; it is
 * never saved or published from here. The admin reviews, edits and saves.
 */
export async function generateDraftAction(rawInput: BlogGenerationInput): Promise<GenerateDraftResult> {
  try {
    const { profile } = await requireAdmin();
    const input = validateInput(rawInput);

    const budget = withinBudget(`generate:${profile.id}`, MAX_PER_WINDOW, WINDOW_MS);
    if (!budget.ok) {
      throw new GenerationError(
        "rate_limited",
        `You have reached the limit of ${MAX_PER_WINDOW} generated drafts per hour. Try again in about ${Math.ceil(budget.retryAfterSeconds / 60)} minutes.`,
        budget.retryAfterSeconds,
      );
    }

    const draft = await generateBlogDraft(getAnthropicClient(), input, { model: getBlogModel(), sdk: Anthropic });
    return { ok: true, draft };
  } catch (error) {
    if (error instanceof GenerationError) {
      // Codes only: never log the input, the key, or raw provider messages.
      console.error(`[blog-generation] ${error.code}`);
      return { ok: false, error: error.message, code: error.code, retryAfterSeconds: error.retryAfterSeconds };
    }
    if (error instanceof Error && error.message.startsWith("You must be signed in")) {
      return { ok: false, error: error.message, code: "not_configured" };
    }
    console.error("[blog-generation] unexpected", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "Draft generation failed unexpectedly. Try again.", code: "unknown" };
  }
}
