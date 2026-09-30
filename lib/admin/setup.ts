import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { isServiceClientConfigured } from "@/lib/supabase/admin";

/**
 * What is and is not set up, in one place, so the Home checklist and the Auto-Writer overview never disagree.
 * Reads environment presence only (never the values) and a few counts. Every database read is optional: a missing
 * table means "not set up yet", never an error page.
 */
export type SetupState = {
  /** The AI key is set on the server. */
  aiKey: boolean;
  /** Automatic photos are switched on (an Unsplash key exists). */
  photos: boolean;
  /** The background scheduler can run by itself (cron secret and service key). */
  scheduler: boolean;
  /** The Auto-Writer tables exist. */
  automationTables: boolean;
  posts: number;
  published: number;
  topics: number;
};

export async function getSetupState(supabase: SupabaseClient<Database>): Promise<SetupState> {
  const count = async (table: "posts" | "blog_topics", status?: "published"): Promise<number | null> => {
    try {
      let q = supabase.from(table).select("id", { count: "exact", head: true });
      if (status) q = q.eq("status", status);
      const { count: n, error } = await q;
      return error ? null : (n ?? 0);
    } catch {
      return null;
    }
  };
  const [posts, published, topics] = await Promise.all([count("posts"), count("posts", "published"), count("blog_topics")]);
  return {
    aiKey: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    photos: Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim()),
    scheduler: Boolean(process.env.CRON_SECRET?.trim()) && isServiceClientConfigured(),
    automationTables: topics !== null,
    posts: posts ?? 0,
    published: published ?? 0,
    topics: topics ?? 0,
  };
}
