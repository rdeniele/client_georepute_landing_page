/**
 * Link targets from user-authored content (the blog editor) are untrusted: a
 * `javascript:` or `data:` URL in an <a href> runs script when clicked. Only
 * these forms are allowed: http(s), mailto, tel, and site-relative or in-page
 * links. Everything else is rejected so the caller can render plain text.
 */
export function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  // Browsers drop whitespace and control characters before reading the scheme, so they are dropped
  // here too: "java<TAB>script:" must not slip past the check.
  let value = "";
  for (const ch of href) {
    const code = ch.charCodeAt(0);
    if (code > 0x20 && !(code >= 0x7f && code <= 0x9f)) value += ch;
  }
  if (!value) return null;
  if (/^(https?:|mailto:|tel:)/i.test(value)) return href.trim();
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//"))) return href.trim();
  return null;
}
