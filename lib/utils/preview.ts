/**
 * Builds a shareable draft preview URL. Safe to call from both server and
 * client code — `NEXT_PUBLIC_SITE_URL` is inlined into the client bundle at
 * build time, same as any other `NEXT_PUBLIC_*` var.
 */
export function getPreviewUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/blog/preview/${token}`;
}
