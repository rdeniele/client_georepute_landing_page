import { localizeNav } from "@/lib/i18n";
import type { GlossaryEntry } from "./translation";

/**
 * English <-> Hebrew terminology for blog translation, taken from the site's
 * own translated navigation so a blog post says "Decision Reconstruction" the
 * same way the rest of the site does. Deriving it (instead of hand-typing a
 * second list) means it cannot drift from lib/i18n.ts.
 *
 * Strict entries must appear in a translation when the source uses the term;
 * soft ones only produce a minor note.
 */
export function buildGlossary(): GlossaryEntry[] {
  const en = localizeNav("en");
  const he = localizeNav("he");
  const entries: GlossaryEntry[] = [];

  en.groups.forEach((group, gi) => {
    const heGroup = he.groups[gi];
    if (!heGroup) return;
    group.items.forEach((item, ii) => {
      const hebrew = heGroup.items[ii]?.name;
      if (item.name && hebrew && item.name !== hebrew) entries.push({ en: item.name, he: hebrew, strict: true });
    });
  });
  en.links.forEach((link, i) => {
    const hebrew = he.links[i]?.label;
    // The blog link stays "Blog" in every language, so it is not a translation.
    if (link.label && hebrew && link.label !== hebrew) entries.push({ en: link.label, he: hebrew, strict: true });
  });

  // Site-wide usage: the Hebrew copy never writes the acronym "AI" and always says "בינה מלאכותית".
  // These describe how the site writes Hebrew, so they only apply English -> Hebrew.
  entries.push({ en: "artificial intelligence", he: "בינה מלאכותית", strict: true, dir: "en-he" });
  entries.push({ en: "AI", he: "בינה מלאכותית", strict: false, dir: "en-he" });

  // Longest source terms first so the model reads the most specific mapping first.
  return entries.sort((a, b) => b.en.length - a.en.length);
}
