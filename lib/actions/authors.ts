"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";
import { parseAuthorInput } from "@/lib/authors";
import { deleteAuthor, saveAuthor } from "@/lib/services/authors";
import { POST_LOCALES } from "@/lib/utils/postLocale";
import { describeError } from "@/lib/utils/safeLog";

export type AuthorActionResult = { ok: true } | { ok: false; error: string };

/**
 * Create or update an author. Admin-only (re-checked here: server actions are reachable by direct POST). Everything typed
 * is cleaned and bounded by `parseAuthorInput`; links and the photo must be https addresses.
 */
export async function saveAuthorAction(id: string | null, raw: Record<string, unknown>): Promise<AuthorActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseAuthorInput(raw, POST_LOCALES);
    if (!parsed.ok) return parsed;
    const res = await saveAuthor(supabase, id && /^[0-9a-f-]{36}$/i.test(id) ? id : null, parsed.value);
    if (!res.ok) return res;
    revalidatePath("/admin/authors");
    revalidatePath("/blog", "layout");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("You must be signed in")) return { ok: false, error: message };
    console.error("[authors] save failed:", describeError(error));
    return { ok: false, error: "The author could not be saved. Please try again." };
  }
}

export async function deleteAuthorAction(id: string): Promise<AuthorActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "That author no longer exists." };
    const res = await deleteAuthor(supabase, id);
    if (!res.ok) return res;
    revalidatePath("/admin/authors");
    revalidatePath("/blog", "layout");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("You must be signed in")) return { ok: false, error: message };
    console.error("[authors] delete failed:", describeError(error));
    return { ok: false, error: "The author could not be deleted. Please try again." };
  }
}
