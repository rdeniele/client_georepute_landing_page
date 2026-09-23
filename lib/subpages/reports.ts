/**
 * Sample reports shown on /reports — real, filled-out "Marketing Due
 * Diligence" reports GeoRepute generated for three actual domains (not
 * mockups), downloadable as-is. English only for now, like most subpages;
 * follows the same locale-pack shape (packs + getter) used elsewhere in
 * lib/subpages/ so adding translations later is a drop-in, not a rewrite.
 */
import { normalizeLocale } from "@/lib/i18n";

export type SampleReport = {
  slug: string;
  domain: string;
  /** Matches the report's own cover page. */
  priority: "Critical" | "Medium";
  dataCoverage: string;
  analysisWindow: string;
  /** The compelling, non-summarizing intro shown before the PDF opens. */
  intro: string;
  file: string;
  sizeLabel: string;
};

export type ReportsCopy = {
  crumb: string;
  eyebrow: string;
  title: string;
  lead: string;
  download: string;
  meta: (coverage: string, window: string) => string;
};

const en: ReportsCopy = {
  crumb: "Intelligence Reports",
  eyebrow: "See it before you ask for it",
  title: "Three real businesses. The reports GeoRepute actually generated for them.",
  lead: "Not mockups, not a demo dataset, the same Marketing Due Diligence report a business or agency receives before a campaign launches. Every score, every finding, every recommendation below is real.",
  download: "Download the full PDF",
  meta: (coverage, window) => `${coverage} sources · ${window} analysis window`,
};

const packs: Partial<Record<string, ReportsCopy>> = { en };

export function getReportsCopy(locale: string): ReportsCopy {
  return packs[normalizeLocale(locale)] ?? en;
}

export const sampleReports: SampleReport[] = [
  {
    slug: "georepute-ai",
    domain: "georepute.ai",
    priority: "Critical",
    dataCoverage: "8 / 8",
    analysisWindow: "90 days",
    intro:
      "Most marketing reports describe what a website did last month. This one shows what AI systems tell a real buyer asking who to trust, and today the answer is not georepute.ai. That gap never appears in traffic or ad metrics, only as a decision already made before the business enters the conversation. That is the picture budget decisions are missing.",
    file: "/reports/georepute-ai-marketing-due-diligence.pdf",
    sizeLabel: "46 pages",
  },
  {
    slug: "mochi-co-il",
    domain: "mochi.co.il",
    priority: "Medium",
    dataCoverage: "8 / 8",
    analysisWindow: "90 days",
    intro:
      "Most brands assume Google visibility and AI visibility tell the same story. Mochi's do not: this analysis shows where the brand is winning the conversation AI has with potential customers, and where that lead is at risk if nothing reinforces it. That is a different question than most marketing reports answer, which strength to defend before a competitor notices.",
    file: "/reports/mochi-co-il-marketing-due-diligence.pdf",
    sizeLabel: "31 pages",
  },
  {
    slug: "puzzlax-com",
    domain: "puzzlax.com",
    priority: "Critical",
    dataCoverage: "5 / 8",
    analysisWindow: "90 days",
    intro:
      "When a buyer asks AI for a tool like this, it is never mentioned, not once, across every question that shapes the decision. Category leaders already own that conversation, so the choice is being made somewhere the brand has no presence at all. That is not a keyword gap; it is a category priced out before spending a dollar.",
    file: "/reports/puzzlax-com-marketing-due-diligence.pdf",
    sizeLabel: "32 pages",
  },
];
