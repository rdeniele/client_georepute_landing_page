import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_BLOG_MODEL, GenerationError } from "@/lib/blog/generation";

/**
 * The only place ANTHROPIC_API_KEY is read. `server-only` makes the build fail
 * if anything that reaches the browser ever imports this file, so the key
 * cannot leak into client bundles. There is deliberately no NEXT_PUBLIC_ variant.
 */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new GenerationError(
      "not_configured",
      "Draft generation is not configured. Set ANTHROPIC_API_KEY in the server environment.",
    );
  }
  // Only needed when the key is not tied to a workspace (the API then answers 400 asking for this header).
  // Creating the key inside a workspace in the Anthropic Console avoids needing it.
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  return new Anthropic({
    apiKey,
    ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}),
    // Keeps worst case (one retry) well inside the 300s route limit set on the admin post pages.
    timeout: 110_000,
    maxRetries: 1,
  });
}

/** Optional override so the model can be changed without a deploy of new code. */
export function getBlogModel(): string {
  return process.env.ANTHROPIC_BLOG_MODEL?.trim() || DEFAULT_BLOG_MODEL;
}

/**
 * Model used for blog translation (and its independent review). Defaults to the
 * blog model. Accuracy matters more than cost here, so prefer the strongest
 * model you can afford before overriding it.
 */
export function getTranslationModel(): string {
  return process.env.ANTHROPIC_TRANSLATION_MODEL?.trim() || getBlogModel();
}

export { Anthropic };
