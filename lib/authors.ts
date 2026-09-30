/**
 * Article authors: who wrote it, shown to readers and to search engines.
 *
 * Search engines and AI answers weigh who is behind an article (E-E-A-T: experience, expertise, authoritativeness, trust), and
 * readers want to know too. So every article shows an author box and a "more from this author" list, and its structured data
 * names the author. Posts written by the AI Auto-Writer, or with no author chosen, use the default author (set in Admin >
 * Authors) or, if none exists, the built-in GeoRepute Editorial Team below. No invented people, ever.
 *
 * Pure logic with no imports beyond types, so scripts can test it offline.
 */
import type { AuthorRow } from "@/types/database.types";

export type AuthorLink = { label: string; url: string };
export type Author = {
  /** null for the built-in team author (it is not a database row). */
  id: string | null;
  slug: string;
  name: string;
  jobTitle: string;
  bio: string;
  avatarUrl: string | null;
  links: AuthorLink[];
  isTeam: boolean;
  /** The author that posts with no author of their own (and all AI-written posts) are shown under. */
  isDefault: boolean;
};

export const AUTHOR_LIMITS = { name: 80, jobTitle: 80, bio: 600, links: 4, label: 30 } as const;

/** What the built-in team author says about itself, in each site language. Describes what the blog does; claims nothing else. */
const TEAM: Record<string, { jobTitle: string; bio: string }> = {
  en: { jobTitle: "Editorial team", bio: "The GeoRepute team writes about how businesses are seen by Google and by AI engines, and what to do about it. Every article is practical: it explains the idea, shows what to check and says what to do next." },
  he: { jobTitle: "צוות התוכן", bio: "צוות GeoRepute כותב על האופן שבו עסקים נראים בגוגל ובמנועי בינה מלאכותית, ועל מה כדאי לעשות בעניין. כל מאמר הוא מעשי: הוא מסביר את הרעיון, מראה מה לבדוק ואומר מה לעשות בהמשך." },
  ar: { jobTitle: "فريق التحرير", bio: "يكتب فريق GeoRepute عن الطريقة التي ترى بها Google ومحركات الذكاء الاصطناعي الأعمال التجارية، وعمّا ينبغي فعله حيال ذلك. كل مقال عملي: يشرح الفكرة، ويبيّن ما يجب فحصه، ويوضح الخطوة التالية." },
  ru: { jobTitle: "Редакция", bio: "Команда GeoRepute пишет о том, как бизнес видят Google и ИИ-движки, и о том, что с этим делать. Каждая статья практична: она объясняет идею, показывает, что проверить, и подсказывает следующий шаг." },
  fr: { jobTitle: "Équipe éditoriale", bio: "L'équipe GeoRepute écrit sur la façon dont les entreprises sont vues par Google et par les moteurs d'IA, et sur ce qu'il faut faire. Chaque article est pratique : il explique l'idée, montre quoi vérifier et indique la prochaine étape." },
  es: { jobTitle: "Equipo editorial", bio: "El equipo de GeoRepute escribe sobre cómo ven Google y los motores de IA a las empresas, y sobre qué hacer al respecto. Cada artículo es práctico: explica la idea, muestra qué revisar e indica el siguiente paso." },
  pt: { jobTitle: "Equipe editorial", bio: "A equipe da GeoRepute escreve sobre como as empresas são vistas pelo Google e pelos mecanismos de IA, e sobre o que fazer a respeito. Cada artigo é prático: explica a ideia, mostra o que verificar e indica o próximo passo." },
};

export const TEAM_NAME = "GeoRepute Editorial Team";

export function teamAuthor(locale: string): Author {
  const t = TEAM[locale] ?? TEAM.en;
  return { id: null, slug: "georepute-editorial-team", name: TEAM_NAME, jobTitle: t.jobTitle, bio: t.bio, avatarUrl: null, links: [], isTeam: true, isDefault: true };
}

const isHttps = (u: unknown): u is string => {
  if (typeof u !== "string") return false;
  try {
    return new URL(u).protocol === "https:";
  } catch {
    return false;
  }
};

/** Links from the database, kept only if they are https addresses with a label. Anything else is dropped, never rendered. */
export function cleanLinks(raw: unknown): AuthorLink[] {
  return (Array.isArray(raw) ? raw : [])
    .map((l) => ({ label: String((l as { label?: unknown })?.label ?? "").trim().slice(0, AUTHOR_LIMITS.label), url: String((l as { url?: unknown })?.url ?? "").trim() }))
    .filter((l) => l.label && isHttps(l.url))
    .slice(0, AUTHOR_LIMITS.links);
}

/** A stored author, as shown in `locale`: the bio written for that language if there is one, otherwise the main bio. */
export function authorFromRow(row: AuthorRow, locale: string): Author {
  const i18n = row.bio_i18n && typeof row.bio_i18n === "object" && !Array.isArray(row.bio_i18n) ? (row.bio_i18n as Record<string, unknown>) : {};
  const local = typeof i18n[locale] === "string" ? (i18n[locale] as string).trim() : "";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    jobTitle: (row.job_title ?? "").trim(),
    bio: local || (row.bio ?? "").trim(),
    avatarUrl: isHttps(row.avatar_url) ? row.avatar_url : null,
    links: cleanLinks(row.links),
    isTeam: false,
    isDefault: row.is_default === true,
  };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0]?.toUpperCase() ?? "")
    .join("");
}

/** Cleans what an admin typed into the author form. Returns the row to store, or the reason it cannot be stored. */
export function parseAuthorInput(raw: Record<string, unknown>, locales: readonly string[]): { ok: true; value: Omit<AuthorRow, "id" | "created_at" | "slug"> & { slug: string } } | { ok: false; error: string } {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  const name = s(raw.name, AUTHOR_LIMITS.name);
  if (name.length < 2) return { ok: false, error: "Write the author's name (at least 2 letters)." };
  const avatar = s(raw.avatar_url, 500);
  if (avatar && !isHttps(avatar)) return { ok: false, error: "The photo address must start with https://" };
  const links = (Array.isArray(raw.links) ? raw.links : []).filter((l) => (l as { url?: unknown })?.url || (l as { label?: unknown })?.label);
  for (const l of links) {
    const url = s((l as { url?: unknown }).url, 500);
    if (!isHttps(url)) return { ok: false, error: `“${url || "(empty)"}” is not a web address. Links must start with https://` };
    if (!s((l as { label?: unknown }).label, AUTHOR_LIMITS.label)) return { ok: false, error: "Give each link a short name, for example LinkedIn." };
  }
  const i18nIn = raw.bio_i18n && typeof raw.bio_i18n === "object" ? (raw.bio_i18n as Record<string, unknown>) : {};
  const bio_i18n: Record<string, string> = {};
  for (const l of locales) {
    const b = s(i18nIn[l], AUTHOR_LIMITS.bio);
    if (b) bio_i18n[l] = b;
  }
  const slugSource = s(raw.slug, 60) || name;
  const slug = slugSource
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return {
    ok: true,
    value: {
      slug: slug || `author-${Date.now().toString(36)}`,
      name,
      job_title: s(raw.job_title, AUTHOR_LIMITS.jobTitle) || null,
      bio: s(raw.bio, AUTHOR_LIMITS.bio) || null,
      bio_i18n,
      avatar_url: avatar || null,
      links: cleanLinks(links),
      is_default: raw.is_default === true,
    },
  };
}
