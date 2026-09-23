/**
 * Chrome copy for /blog and /blog/[slug] — the page shell text around
 * whatever post content the CMS holds (post title/body/category are the
 * author's own words and are never translated by this file). Same
 * locale-pack shape as lib/warRoom.ts and lib/subpages/briefing.ts.
 */
import { normalizeLocale } from "@/lib/i18n";

export type BlogChromeCopy = {
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  eyebrow: string;
  title: string;
  lead: string;
  recentLabel: string;
  recentTitle: string;
  allFilter: string;
  insightFallback: string;
  minRead: (n: number) => string;
  unavailableTitle: string;
  unavailableBody: string;
  emptyTitle: string;
  emptyBody: string;
  postUnavailableTitle: string;
  ctaTitle: string;
  ctaBody: string;
  startAnalysis: string;
  backToBlog: string;
};

const en: BlogChromeCopy = {
  metaTitle: "Blog | GeoRepute",
  metaDescription:
    "Notes on AI visibility, competitive intelligence and how strategic business decisions actually get made, from the GeoRepute team.",
  crumb: "Blog",
  eyebrow: "Insights",
  title: "From the GeoRepute team.",
  lead: "Notes on AI visibility, competitive intelligence and how strategic decisions actually get made.",
  recentLabel: "Latest",
  recentTitle: "Recent posts",
  allFilter: "All",
  insightFallback: "Insight",
  minRead: (n) => `${n} min read`,
  unavailableTitle: "Posts are temporarily unavailable",
  unavailableBody: "We couldn't reach the content service. Please try again shortly.",
  emptyTitle: "No posts published yet",
  emptyBody: "Check back soon, new posts will appear here as soon as they're published.",
  postUnavailableTitle: "This post is temporarily unavailable",
  ctaTitle: "See what GeoRepute sees about your business.",
  ctaBody: "A living intelligence layer that turns hundreds of signals into one strategic picture.",
  startAnalysis: "Start Analysis",
  backToBlog: "Back to Blog",
};

const he: BlogChromeCopy = {
  metaTitle: "בלוג | GeoRepute",
  metaDescription: "תובנות על נראות ב-AI, מודיעין תחרותי ואיך מתקבלות בפועל החלטות עסקיות אסטרטגיות, מצוות GeoRepute.",
  crumb: "בלוג",
  eyebrow: "תובנות",
  title: "מצוות GeoRepute.",
  lead: "תובנות על נראות ב-AI, מודיעין תחרותי ואיך מתקבלות בפועל החלטות אסטרטגיות.",
  recentLabel: "עדכני",
  recentTitle: "פוסטים אחרונים",
  allFilter: "הכול",
  insightFallback: "תובנה",
  minRead: (n) => `${n} דקות קריאה`,
  unavailableTitle: "הפוסטים אינם זמינים כרגע",
  unavailableBody: "לא הצלחנו להתחבר לשירות התוכן. נסו שוב בעוד רגע.",
  emptyTitle: "עדיין לא פורסמו פוסטים",
  emptyBody: "חזרו לבדוק בקרוב, פוסטים חדשים יופיעו כאן מיד עם פרסומם.",
  postUnavailableTitle: "הפוסט הזה אינו זמין כרגע",
  ctaTitle: "גלו מה GeoRepute רואה על העסק שלכם.",
  ctaBody: "שכבת מודיעין חיה ההופכת מאות איתותים לתמונה אסטרטגית אחת.",
  startAnalysis: "נתחו את העסק שלי",
  backToBlog: "חזרה לבלוג",
};

const packs: Partial<Record<string, BlogChromeCopy>> = { en, he };

/** English is the fallback until the other five locales are translated. */
export function getBlogChromeCopy(locale: string): BlogChromeCopy {
  return packs[normalizeLocale(locale)] ?? en;
}
