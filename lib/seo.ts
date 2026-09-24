import type { Metadata } from "next";
import { LOCALES, getLocaleCopy, localizeNav, localizePath, normalizeLocale } from "@/lib/i18n";

/**
 * Per-page metadata for the localized site. Titles and descriptions come from
 * each page's own lead copy (English) and, where the header nav already has a
 * translation for a page, from that translation; other locales fall back to
 * the English page name with the locale's own site description.
 */

const SITE_NAME = "GeoRepute";

// A page that sets its own openGraph/twitter replaces the parent's wholesale (including the
// file-convention images from app/), so the share image and card type are repeated here.
const OG_IMAGE = [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "GeoRepute: Strategic Business Intelligence Infrastructure" }];
const TWITTER_IMAGE = ["/twitter-image.png"];

type PageMeta = { title: string; description: string };

/** Keyed by the route slug used in app/[locale]/[...slug]/page.tsx. */
export const PAGE_META: Record<string, PageMeta> = {
  "election-intelligence": {
    title: "War Room: Election Intelligence",
    description: "Real-time decision intelligence for municipal, regional, national and global elections.",
  },
  "how-it-works": {
    title: "How It Works",
    description: "From intelligence to execution and back again: GeoRepute understands why, decides what to change, executes, measures and improves.",
  },
  methodology: {
    title: "Methodology",
    description: "Every conclusion traces to a date, a source, an engine, a prompt or a connected dataset. How GeoRepute states its evidence, and where the limits are.",
  },
  signin: { title: "Sign In", description: "Enter the GeoRepute demonstration workspace." },
  briefing: {
    title: "Schedule a Meeting",
    description: "Tell us a bit about your business and we'll get back to you to find a time.",
  },
  privacy: {
    title: "Privacy Policy",
    description: "What the GeoRepute marketing site collects, what it stores in your browser, and how to have it removed.",
  },
  reports: {
    title: "Intelligence Reports",
    description: "Real, anonymized reports GeoRepute generated for actual businesses: AI visibility, search performance, keyword intelligence and more.",
  },
  "app/mission-control": {
    title: "Executive Mission Control",
    description: "Ten measures, one decision position, each opening its evidence and the intervention it implies.",
  },
  "app/reconstruct": {
    title: "Decision Reconstruction",
    description: "Enter a domain and a commercial question, then see what each surface understood and who received the decision instead.",
  },
  "app/campaign-readiness": {
    title: "Campaign Readiness",
    description: "Should we launch this campaign today? An assessment of whether the business, not the creative, can convert the demand.",
  },
  "app/narrative": {
    title: "Narrative Intelligence",
    description: "What story is the market telling about the business? Which accounts are active, who owns them, and which decide whether it is chosen.",
  },
  "app/actions": {
    title: "Strategic Action Center",
    description: "Every intervention names an owner, a deadline, the signal it should move and how that movement will be verified.",
  },
  engines: {
    title: "Intelligence Engines",
    description: "Twelve intelligence engines, each answering a board-level business question and routing the user into action.",
  },
  "engines/ai-recognition": {
    title: "AI Recognition",
    description: "What each of six AI engines currently believes your business is, and where that belief is wrong.",
  },
  "engines/google-vs-ai": {
    title: "Google vs AI Visibility",
    description: "Google rank and AI recommendation fail independently. See every commercial question plotted on both surfaces.",
  },
  "engines/competitor-decision": {
    title: "Competitor Decision",
    description: "Not who ranks above you: who gets recommended when a buyer asks a machine whom to choose, and on what evidence.",
  },
  "engines/action": {
    title: "Action Intelligence",
    description: "Every intervention names an owner, a deadline, the signal it should move and how that movement will be verified.",
  },
  marketplace: {
    title: "Intelligence Marketplace",
    description: "Seven categories of decision intelligence, each holding the models that answer one kind of commercial question.",
  },
  "marketplace/category/ai-visibility-intelligence": {
    title: "AI Visibility Intelligence",
    description: "Whether AI systems hold an accurate, current record of the business, and whether it survives into the answers buyers receive.",
  },
  "marketplace/category/search-intelligence": {
    title: "Search Intelligence",
    description: "Traditional search and AI discovery fail independently. Measure each, classify every gap and price what it costs.",
  },
  "marketplace/category/competitive-intelligence": {
    title: "Competitive Intelligence",
    description: "Who gets recommended when a buyer asks a machine whom to choose, and the specific evidence they hold that you lack.",
  },
  "marketplace/category/trust-intelligence": {
    title: "Trust Intelligence",
    description: "Visibility creates attention; trust creates selection. Is the business safe for a system to recommend?",
  },
  "marketplace/category/content-intelligence": {
    title: "Content Intelligence",
    description: "Whoever defines a category sets the criteria buyers use. Measure how much of that definition you own.",
  },
  "marketplace/category/market-intelligence": {
    title: "Market Intelligence",
    description: "Timing, geography and distribution: whether the market is ready and the route to it holds.",
  },
  "marketplace/category/executive-intelligence": {
    title: "Executive Intelligence",
    description: "Where diagnosis becomes a decision: every gap priced as a directional range, ranked, owned and measured.",
  },
};

/** hreflang alternates for one path across every locale, plus x-default pointing at English. */
function alternatesFor(path: string, locale: string): NonNullable<Metadata["alternates"]> {
  const suffix = path ? `/${path}` : "";
  return {
    canonical: `/${locale}${suffix}`,
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${suffix}`])),
      "x-default": `/en${suffix}`,
    },
  };
}

/** Localized name and description for a nav-linked page, when the header already translates it. */
function localizedNavEntry(locale: string, slug: string): { name?: string; desc?: string } {
  const loc = normalizeLocale(locale);
  const nav = localizeNav(loc);
  const href = localizePath(`/en/${slug}`, loc);
  for (const group of nav.groups) {
    const hit = group.items.find((i) => i.href === href);
    if (hit) return { name: hit.name, desc: hit.desc };
  }
  const link = nav.links.find((l) => l.href === href);
  return link ? { name: link.label } : {};
}

export function pageMetadata(locale: string, slug: string): Metadata {
  const loc = normalizeLocale(locale);
  const en = PAGE_META[slug];
  const copy = getLocaleCopy(loc);
  const local = loc === "en" ? {} : localizedNavEntry(loc, slug);

  const name = local.name || en?.title || SITE_NAME;
  // English keeps the hand-written description; other locales prefer a translated nav description,
  // then their own site description. (A wrong-language description is worse than a generic one.)
  const description = loc === "en" ? en?.description : local.desc || copy.hero.supporting;
  const title = `${name} | ${SITE_NAME}`;
  const path = slug;

  return {
    title,
    description,
    alternates: alternatesFor(path, loc),
    openGraph: { title, description, url: `/${loc}/${path}`, siteName: SITE_NAME, type: "website", locale: loc, images: OG_IMAGE },
    twitter: { card: "summary_large_image", title, description, images: TWITTER_IMAGE },
  };
}

export function homeMetadata(locale: string): Metadata {
  const loc = normalizeLocale(locale);
  const copy = getLocaleCopy(loc);
  const title = `${SITE_NAME} | ${copy.hero.eyebrow}`;
  const description = copy.hero.supporting;
  return {
    title: { absolute: title },
    description,
    alternates: alternatesFor("", loc),
    openGraph: { title, description, url: `/${loc}`, siteName: SITE_NAME, type: "website", locale: loc, images: OG_IMAGE },
    twitter: { card: "summary_large_image", title, description, images: TWITTER_IMAGE },
  };
}
