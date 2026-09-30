"use server";

import { requireAdmin } from "./guard";
import { GenerationError, type GenerationErrorCode } from "@/lib/blog/generation";
import { optimizePost, type OptimizeResult } from "@/lib/blog/optimize";
import { Anthropic, getAnthropicClient, getBlogModel } from "@/lib/services/claude";
import { withinBudget } from "@/lib/services/rateLimit";

export type OptimizeSeoResult = { ok: true; result: OptimizeResult } | { ok: false; error: string; code: GenerationErrorCode };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
// An article of a few thousand words is far below this; anything bigger is not a post.
const MAX_PAYLOAD_CHARS = 400_000;

/**
 * SEO assistant for hand-written posts. Admin-only (re-checked here, since server actions are reachable by direct POST).
 * Returns suggestions to the editor; nothing is saved or published from here.
 */
export async function optimizeSeoAction(rawInput: unknown): Promise<OptimizeSeoResult> {
  try {
    const { profile } = await requireAdmin();
    if (JSON.stringify(rawInput ?? null).length > MAX_PAYLOAD_CHARS) throw new GenerationError("invalid_input", "This post is too large for the SEO assistant.");

    const budget = withinBudget(`optimize:${profile.id}`, MAX_PER_WINDOW, WINDOW_MS);
    if (!budget.ok) {
      throw new GenerationError(
        "rate_limited",
        `You have reached the limit of ${MAX_PER_WINDOW} SEO assistant runs per hour. Try again in about ${Math.ceil(budget.retryAfterSeconds / 60)} minutes.`,
        budget.retryAfterSeconds,
      );
    }

    const result = await optimizePost(getAnthropicClient(), rawInput, { model: getBlogModel(), sdk: Anthropic });
    return { ok: true, result };
  } catch (error) {
    if (error instanceof GenerationError) {
      // Codes only: never log the article, the key, or raw provider messages.
      console.error(`[blog-optimize] ${error.code}`);
      return { ok: false, error: error.message, code: error.code };
    }
    if (error instanceof Error && error.message.startsWith("You must be signed in")) return { ok: false, error: error.message, code: "not_configured" };
    console.error("[blog-optimize] unexpected", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "The SEO assistant failed unexpectedly. Try again.", code: "unknown" };
  }
}
