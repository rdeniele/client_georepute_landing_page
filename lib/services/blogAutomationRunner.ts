import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { buildGlossary } from "@/lib/blog/glossary";
import { generateArticle } from "@/lib/blog/automation/article";
import { localizeArticle } from "@/lib/blog/automation/localize";
import { runTick, type AutomationAi } from "@/lib/blog/automation/worker";
import type { TickSummary } from "@/lib/blog/automation/config";
import { Anthropic, getAnthropicClient, getBlogModel, getTranslationModel } from "@/lib/services/claude";
import { SupabaseAutomationStore } from "@/lib/services/blogAutomation";
import { createUnsplashFinder } from "@/lib/blog/automation/images";
import { describeError } from "@/lib/utils/safeLog";

/**
 * The real Claude adapter. The client is created per call so a missing key surfaces as a normal
 * `not_configured` job error (handled by the worker, which pauses calls) instead of crashing the tick.
 */
export function createAutomationAi(): AutomationAi {
  const glossary = buildGlossary();
  return {
    generateArticle: (req, model) => generateArticle(getAnthropicClient(), req, { model: model || getBlogModel(), sdk: Anthropic }),
    localizeArticle: (source, o) =>
      localizeArticle(getAnthropicClient(), source, { ...o, model: o.model || getTranslationModel(), glossary, sdk: Anthropic }),
  };
}

/** Featured images come from Unsplash. Without UNSPLASH_ACCESS_KEY the automation simply writes articles without one. */
function createImageFinder() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  return accessKey ? createUnsplashFinder({ accessKey, appName: "georepute_blog" }) : undefined;
}

/** One bounded scheduler run. Called by the cron route (service client) and by the admin's "Run now" (their own session). */
export async function runAutomationTick(db: SupabaseClient<Database>, trigger: "cron" | "manual", budgetMs: number): Promise<TickSummary> {
  const summary = await runTick(
    {
      store: new SupabaseAutomationStore(db),
      ai: createAutomationAi(),
      images: createImageFinder(),
      defaultModels: { generation: getBlogModel(), translation: getTranslationModel() },
      // Codes and counts only: never article text, keys or provider messages.
      log: (message) => console.error(describeError(message)),
    },
    { trigger, budgetMs },
  );
  if (summary.published > 0) {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
  }
  revalidatePath("/admin/automation");
  return summary;
}
