import { LOCALES, localizeNav } from "@/lib/i18n";
import type { BlogLanguage } from "./generation";
import type { GlossaryEntry } from "./translation";

/**
 * Terminology for blog translation between any of the site's seven languages,
 * taken from the site's own translated navigation so a blog post says
 * "Decision Reconstruction" the same way the rest of the site does in that
 * language. Deriving it (instead of hand-typing a second list) means it cannot
 * drift from lib/i18n.ts.
 *
 * Strict entries must appear in a translation when the source uses the term;
 * soft ones only produce a minor note.
 */
export function buildGlossary(): GlossaryEntry[] {
  const navs = LOCALES.map((l) => [l as BlogLanguage, localizeNav(l)] as const);
  const en = navs[0][1];
  const entries: GlossaryEntry[] = [];

  const add = (pick: (nav: typeof en) => string | undefined) => {
    const terms: Partial<Record<BlogLanguage, string>> = {};
    for (const [lang, nav] of navs) {
      const term = pick(nav);
      if (term) terms[lang] = term;
    }
    const distinct = new Set(Object.values(terms).map((t) => t.toLowerCase()));
    // A name that is the same in every language (a brand, or "Blog") is not a translation rule.
    if (terms.en && distinct.size > 1) entries.push({ terms, strict: true });
  };

  en.groups.forEach((group, gi) => group.items.forEach((_, ii) => add((nav) => nav.groups[gi]?.items[ii]?.name)));
  en.links.forEach((_, i) => add((nav) => nav.links[i]?.label));

  // Site-wide usage: the Hebrew copy never writes the acronym "AI" and always says "בינה מלאכותית".
  // These describe how the site writes Hebrew, so they only apply when translating from English into Hebrew.
  entries.push({ terms: { en: "artificial intelligence", he: "בינה מלאכותית" }, strict: true, from: ["en"], to: ["he"] });
  entries.push({ terms: { en: "AI", he: "בינה מלאכותית" }, strict: false, from: ["en"], to: ["he"] });

  // Longest source terms first so the model reads the most specific mapping first.
  return entries.sort((a, b) => Math.max(...Object.values(b.terms).map((t) => t.length)) - Math.max(...Object.values(a.terms).map((t) => t.length)));
}
