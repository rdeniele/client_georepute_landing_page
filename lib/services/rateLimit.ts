import "server-only";
import { createBudget } from "@/lib/utils/rateLimitCore";

/** Shared soft budget for expensive or abusable server actions (AI generation and translation, the public meeting form). */
export const withinBudget = createBudget();
