/**
 * Sample report shown on /reports: a real, filled-out "AI Visibility Report"
 * GeoRepute generated for an actual business (not a mockup), with the
 * business name withheld for now, downloadable as-is. English only for now,
 * like most subpages; follows the same locale-pack shape (packs + getter)
 * used elsewhere in lib/subpages/ so adding translations later is a drop-in,
 * not a rewrite.
 */
import { normalizeLocale } from "@/lib/i18n";

export type SampleReport = {
  slug: string;
  /** Anonymous display name (real company name withheld for now). */
  name: string;
  /** Which report this is, shown on the card. */
  kind: string;
  /** Matches the report's own findings. */
  priority: "Critical" | "High" | "Medium";
  /** One-line scope of the report, e.g. "6 AI platforms · 124 queries analyzed". */
  meta: string;
  /** The compelling, non-summarizing intro shown before the PDF opens. */
  intro: string;
  file: string;
  sizeLabel: string;
  /** Plain-language reason the report reads the way it does. */
  explain: string;
  /** What was recomputed or reconciled before publishing (only checks that passed). */
  checked: string;
};

export type ReportsCopy = {
  crumb: string;
  eyebrow: string;
  title: string;
  lead: string;
  download: string;
  why: string;
  checkedLabel: string;
  note: string;
};

const en: ReportsCopy = {
  crumb: "Intelligence Reports",
  eyebrow: "See it before you ask for it",
  title: "One real business. The reports GeoRepute actually generated for it.",
  lead: "Not a mockup, not a demo dataset, the same reports a business or agency receives before a campaign launches. The business name is withheld; every score, every finding, every recommendation below is real.",
  download: "Download the full PDF",
  why: "Why this report reads this way",
  checkedLabel: "Checked before publishing",
  note: "Every figure quoted in these explanations was recomputed from the report's own data before publishing. All figures are directional.",
};

const packs: Partial<Record<string, ReportsCopy>> = { en };

export function getReportsCopy(locale: string): ReportsCopy {
  return packs[normalizeLocale(locale)] ?? en;
}

export const sampleReports: SampleReport[] = [
  {
    slug: "company-a",
    name: "Company A",
    kind: "AI Visibility Report",
    priority: "Critical",
    meta: "6 AI platforms · 124 queries analyzed",
    intro:
      "Ask six AI platforms who to trust in this category and this business never comes up, while a handful of competitors split nearly every answer. No traffic report or ad dashboard shows that, because the decision is made in the answer, before anyone visits a site. This is the view that shows where the shortlist is drawn without you.",
    file: "/reports/company-a-ai-visibility-report.pdf",
    sizeLabel: "15 pages",
    explain:
      "The score is 0 because none of the 124 answers collected from six AI engines named the brand. That is why the mention charts carry a note instead of data, and why every ranking is a ranking of competitors. A zero is a valid baseline: it is the starting point the plan is measured from.",
    checked:
      "Platform query counts add up to 124. Share of voice adds up to 100% and matches the mention counts. The average competitor figure recomputes. The Rank table had two rows out of order and was corrected.",
  },
  {
    slug: "company-a-search",
    name: "Company A",
    kind: "Search Performance Report",
    priority: "High",
    meta: "Google Search Console · last 30 days",
    intro:
      "Search Console says this site was seen 40 times in a month, and every one of the five queries behind that is the company's own name. Nobody is discovering it by looking for what it does. That is the difference between being found and being remembered, and no ranking report shows it.",
    file: "/reports/company-a-search-performance-report.pdf",
    sizeLabel: "5 pages",
    explain:
      "This is a small sample: 40 impressions and 3 clicks in 30 days. All five queries are the brand's own name or a misspelling of it, so people find the site only when they already know it. Average position is 12.3 because the exact name ranks near the top while some misspellings rank far lower, at 57 and 69.",
    checked:
      "Click-through rate recomputes from clicks and impressions (3 of 40 is 7.50%). The daily table adds up to the totals and its weighted position gives 12.3. Daily values are approximate. Page-level impressions can add up to more than the property total, which is how Search Console counts.",
  },
  {
    slug: "company-a-keyword-research",
    name: "Company A",
    kind: "Keyword Research Report",
    priority: "Medium",
    meta: "306 keywords · volume, CPC, competition, trend",
    intro:
      "About 10,660 searches a month sounds like a market, until one keyword holds nearly a quarter of it and 191 others get ten each. Demand is real but shallow, and the biggest terms are the cheapest to buy. That changes where a first budget should go, and no single keyword ranking would show it.",
    file: "/reports/company-a-keyword-research-report.pdf",
    sizeLabel: "12 pages",
    explain:
      "The list is broad, generic AI-search phrasing rather than category-specific searches, so demand is thin: most keywords sit at the lowest reported volume of 10. Volumes are rounded, close variants repeat each other, and only one keyword in five has cost data, which is why the 10,660 total is a ceiling, not a forecast.",
    checked:
      "All 306 keywords reconcile across volume bands, competition and trend. The volume bands add up to 10,660. Averages were recomputed from the export.",
  },
  {
    slug: "company-a-keyword-intelligence",
    name: "Company A",
    kind: "Keyword Intelligence Report",
    priority: "High",
    meta: "306 keywords scored · GEON and Paid scores",
    intro:
      "Of 306 keywords scored, three earn a recommendation to run ads and 254 are told to protect what exists. The verdict is not to spend more, it is to spend on three terms and leave the rest alone. That is a budget decision no keyword list makes on its own.",
    file: "/reports/company-a-keyword-intelligence-report.pdf",
    sizeLabel: "12 pages",
    explain:
      "The scores are low across the board: no keyword scores above 49 on GEON and 154 of 306 score under 10, so the verdict is to spend narrowly. Recommendation weighs more than Paid Score alone, which is why some keywords with a high Paid Score are marked Protect Organic and only three earn Run Ads.",
    checked:
      "The recommendation counts (254, 39, 10 and 3) add up to 306, and the score bands add up to 306. Averages were recomputed from the export.",
  },
  {
    slug: "war-room-politician-a",
    name: "Politician A",
    kind: "War Room Narrative Report",
    priority: "High",
    meta: "180-day window · 115 AI answers analyzed",
    intro:
      "Six AI engines know this public figure and describe them neutrally, yet the real exposure sits elsewhere: rival campaigns and worry about splitting the vote. A neutral answer today says little about where the narrative can turn. This report maps those pressure points before they reach the headlines.",
    file: "/reports/war-room-politician-a-report.pdf",
    sizeLabel: "5 pages",
    explain:
      "Six AI engines all recognize the subject and describe them neutrally, so AI visibility and authenticity score well. The exposure sits in the political narrative instead: rival campaigns and worry about splitting the vote drive the risk score of 62.9, while low discussion velocity explains the falling forecast.",
    checked:
      "The 115 answers add up across engines (20, 20, 20, 20, 20 and 15). Engine visibility matches the overview score, and the forecast figures match the overview. Five mismatched entries in the source landscape were removed.",
  },
  {
    slug: "company-a-decision-case",
    name: "Company A",
    kind: "Marketing Due Diligence Case",
    priority: "Critical",
    meta: "90-day window · 8 of 8 data sources",
    intro:
      "The verdict is NO-GO: do not scale. Competitors already own every one of the 14 buyer questions measured, and this brand is absent from all of them. This case shows what has to be true before a dollar of spend is justified, and what the first 90 days should prove.",
    file: "/reports/company-a-decision-case.pdf",
    sizeLabel: "29 pages",
    explain:
      "The verdict is NO-GO because three gates fail together: the Campaign Intelligence Score is 12 against a 40-point floor, and decision leakage and competitive exposure both read 100. Spending now would buy traffic into an unprepared position.",
    checked:
      "The Campaign Intelligence Score recomputes to about 12 from its stated weights, and the $4,270 to $42,700 opportunity range follows from 854 clicks at a 2.50% conversion rate and a $200 to $2,000 deal value.",
  },
];
