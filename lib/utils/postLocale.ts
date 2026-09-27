import { LOCALES } from "@/lib/i18n";
import type { PostLocale } from "@/types/posts";

/** The languages a blog post can be written in: exactly the site's own languages (lib/i18n.ts). English is the default. */
export const POST_LOCALES: readonly PostLocale[] = LOCALES;

export function isPostLocale(value: unknown): value is PostLocale {
  return typeof value === "string" && (POST_LOCALES as readonly string[]).includes(value);
}

/** Reads a `?lang=` value or form field. Anything unknown means English. */
export function toPostLocale(value: unknown): PostLocale {
  return isPostLocale(value) ? value : "en";
}

/** Public path for a post or the blog index. English has no query string; every other language carries `?lang=`. */
export function blogPath(locale: PostLocale, slug?: string, extra?: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  if (locale !== "en") params.set("lang", locale);
  for (const [k, v] of Object.entries(extra ?? {})) if (v) params.set(k, v);
  const qs = params.toString();
  return `${slug ? `/blog/${slug}` : "/blog"}${qs ? `?${qs}` : ""}`;
}
