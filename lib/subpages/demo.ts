/**
 * The seeded demonstration environment every product subpage reads from.
 *
 * Source: the live GeoRepute site (geo-marketing-virid.vercel.app), which runs
 * one seeded organisation, Ironvale Supply, a US Midwest MRO distributor, so
 * every figure stays verifiable against the published methodology. Nothing
 * here is a customer result; pages that render it carry `DEMO_NOTE`.
 */

import { normalizeLocale } from "../i18n";

export const DEMO_NOTE =
  "Demonstration environment, seeded organisation Ironvale Supply. Illustrative data, not a customer result.";

const DEMO_NOTE_HE =
  "סביבת הדגמה, ארגון לדוגמה Ironvale Supply. נתונים להמחשה, לא תוצאת לקוח.";

const demoNotePacks: Partial<Record<string, string>> = { en: DEMO_NOTE, he: DEMO_NOTE_HE };

/** English is the fallback until the other five locales are translated. */
export function getDemoNote(locale: string): string {
  return demoNotePacks[normalizeLocale(locale)] ?? DEMO_NOTE;
}

export type Confidence = "high" | "medium" | "directional" | "insufficient";

export const CONFIDENCE: Record<Confidence, { mark: string; label: string; detail: string }> = {
  high: { mark: "●", label: "High confidence", detail: "Multiple current and reliable evidence sources support the conclusion." },
  medium: { mark: "◐", label: "Medium confidence", detail: "Evidence is meaningful but partially estimated or incomplete." },
  directional: { mark: "◔", label: "Directional", detail: "Useful for prioritization, not an audited or verified fact." },
  insufficient: { mark: "○", label: "Insufficient history", detail: "The platform must withhold predictive conclusions until enough evidence exists." },
};

const CONFIDENCE_HE: Record<Confidence, { mark: string; label: string; detail: string }> = {
  high: { mark: "●", label: "רמת ביטחון גבוהה", detail: "מספר מקורות ראיות עדכניים ואמינים תומכים במסקנה." },
  medium: { mark: "◐", label: "רמת ביטחון בינונית", detail: "הראיות משמעותיות אך חלקן מוערכות או לא שלמות." },
  directional: { mark: "◔", label: "כיווני", detail: "שימושי לתעדוף, לא עובדה מבוקרת או מאומתת." },
  insufficient: { mark: "○", label: "היסטוריה לא מספקת", detail: "הפלטפורמה חייבת להימנע ממסקנות חזויות עד שיהיו מספיק ראיות." },
};

const confidencePacks: Partial<Record<string, Record<Confidence, { mark: string; label: string; detail: string }>>> = {
  en: CONFIDENCE,
  he: CONFIDENCE_HE,
};

/** English is the fallback until the other five locales are translated. */
export function getConfidence(locale: string): Record<Confidence, { mark: string; label: string; detail: string }> {
  return confidencePacks[normalizeLocale(locale)] ?? CONFIDENCE;
}

export type Trend = "up" | "down" | "stable";

/* --------------------------------------------------------------------------
   AI recognition, what each engine believes
   ----------------------------------------------------------------------- */

export type EngineStatus = "resolved" | "wrong" | "unresolved";

export const recognition: {
  engine: "chatgpt" | "claude" | "gemini" | "perplexity" | "copilot" | "grok";
  name: string;
  score: number;
  status: EngineStatus;
  presence: number;
  believes: string;
  note?: string;
}[] = [
  { engine: "perplexity", name: "Perplexity", score: 58, status: "resolved", presence: 8.3, believes: "Midwest industrial fastener and MRO distributor" },
  { engine: "claude", name: "Claude", score: 47, status: "resolved", presence: 8.3, believes: "An MRO and fastener distributor serving manufacturers" },
  { engine: "chatgpt", name: "ChatGPT", score: 41, status: "wrong", presence: 4.2, believes: "A regional industrial supplier in the US Midwest", note: "Describes Ironvale as a hardware retailer rather than an MRO distributor, which removes it from supplier-evaluation answers." },
  { engine: "copilot", name: "Copilot", score: 38, status: "wrong", presence: 4.2, believes: "Industrial supply company, category association incomplete", note: "Knows the company exists but not which product categories it carries, so it is omitted from specification-led questions." },
  { engine: "gemini", name: "Gemini", score: 24, status: "unresolved", presence: 0, believes: "Unclear, associates the name with unrelated businesses", note: "Conflates Ironvale Supply with a same-named logistics firm, so category association fails entirely." },
  { engine: "grok", name: "Grok", score: 21, status: "unresolved", presence: 0, believes: "Not recognized as a distinct business entity", note: "No stable entity record. Answers reference the category without naming Ironvale at all." },
];

export const STATUS_LABEL: Record<EngineStatus, string> = {
  resolved: "Resolved",
  wrong: "Wrong entity",
  unresolved: "Not resolved",
};

/* --------------------------------------------------------------------------
   Google vs AI, the twenty tracked commercial questions
   ----------------------------------------------------------------------- */

export type GapClass = "compound" | "strategic" | "recoverable" | "aligned";

export const GAP_LABEL: Record<GapClass, { label: string; detail: string }> = {
  compound: { label: "Compound blind spot", detail: "Absent from both surfaces on high-value questions. The most expensive class of gap." },
  strategic: { label: "Strategic blind spot", detail: "Absent from AI answers on a lower-volume question, with no top-ten Google position to fall back on." },
  recoverable: { label: "Recoverable search", detail: "Ranking in Google but absent from AI answers. Existing authority is not reaching the AI surface." },
  aligned: { label: "Aligned", detail: "Visible in Google and recommended by AI. No action required." },
};

/** position: null = not in top 100 */
export const keywords: { q: string; volume: number; position: number | null; ai: boolean; gap: GapClass }[] = [
  { q: "industrial fastener supplier", volume: 320, position: null, ai: false, gap: "compound" },
  { q: "mro distributor", volume: 260, position: 14, ai: false, gap: "compound" },
  { q: "grade 8 bolts bulk", volume: 210, position: 3, ai: false, gap: "recoverable" },
  { q: "hydraulic fittings supplier", volume: 190, position: 22, ai: false, gap: "compound" },
  { q: "fastener distributor midwest", volume: 170, position: 2, ai: true, gap: "aligned" },
  { q: "vendor managed inventory mro", volume: 150, position: 31, ai: false, gap: "compound" },
  { q: "industrial supply company", volume: 140, position: null, ai: false, gap: "compound" },
  { q: "bulk fasteners chicago", volume: 130, position: 7, ai: false, gap: "recoverable" },
  { q: "maintenance repair operations supplier", volume: 120, position: 18, ai: false, gap: "strategic" },
  { q: "stainless steel fasteners supplier", volume: 110, position: 5, ai: false, gap: "recoverable" },
  { q: "same day fastener shipping", volume: 95, position: 12, ai: false, gap: "strategic" },
  { q: "mro supply agreement", volume: 90, position: 9, ai: false, gap: "recoverable" },
  { q: "industrial distributor fill rate", volume: 85, position: 26, ai: false, gap: "strategic" },
  { q: "fastener sourcing best practices", volume: 80, position: 3, ai: true, gap: "aligned" },
  { q: "plant maintenance supplies", volume: 75, position: null, ai: false, gap: "strategic" },
  { q: "anchor bolts supplier", volume: 70, position: 6, ai: false, gap: "recoverable" },
  { q: "industrial supply near me", volume: 65, position: 19, ai: false, gap: "strategic" },
  { q: "mro consolidation vendor", volume: 60, position: 34, ai: false, gap: "strategic" },
  { q: "fastener catalog request", volume: 50, position: 8, ai: false, gap: "recoverable" },
  { q: "industrial supply account setup", volume: 40, position: 1, ai: true, gap: "aligned" },
];

/* --------------------------------------------------------------------------
   Competitor decision, recommendation share across 24 decision questions
   ----------------------------------------------------------------------- */

export const competitors: { name: string; share: number; sources: number; stage: string; why: string; you?: boolean }[] = [
  { name: "Cindermark Industrial", share: 31, sources: 21, stage: "Supplier Evaluation", why: "Cited by three independent trade publications and maintains a public supplier-comparison library. Engines reach for that evidence when a buyer asks whom to choose." },
  { name: "Hollowpine Supply Co", share: 18, sources: 14, stage: "Solution Evaluation", why: "Publishes specification guidance that engines treat as category-defining language." },
  { name: "Greyfen Industrial", share: 11, sources: 9, stage: "Research", why: "Owns early-stage research questions, entering the decision before evaluation begins." },
  { name: "Ashcombe Trade Group", share: 7, sources: 6, stage: "Purchase Decision", why: "Named on procurement checklists that engines cite at the point of purchase." },
  { name: "Ironvale Supply", share: 4.2, sources: 3, stage: "None", why: "Supplies engines with almost nothing independent to cite. The lead never reaches the CRM because the decision resolved before contact.", you: true },
];

/* --------------------------------------------------------------------------
   Interventions, shared by Action Intelligence, the Action Center,
   Mission Control and Campaign Readiness
   ----------------------------------------------------------------------- */

export type Urgency = "Immediate" | "This quarter" | "Monitor";

export type Intervention = {
  id: string;
  title: string;
  why: string;
  urgency: Urgency;
  confidence: Confidence;
  horizon: 30 | 60 | 90;
  impact: string;
  effort: "low" | "medium" | "high";
  owner: string;
  deadline: string;
  metric: string;
  blockedBy?: string;
};

export const interventions: Intervention[] = [
  {
    id: "entity",
    title: "Publish a canonical entity description and propagate identical category language to trade directories and structured data.",
    why: "Three of six engines misclassify what Ironvale sells. No content investment can move an answer while the entity record is wrong.",
    urgency: "Immediate", confidence: "high", horizon: 30,
    impact: "Average recognition score 38 → 55", effort: "low", owner: "Head of Digital", deadline: "Sep 30, 2026",
    metric: "Category association correct on 5 of 6 engines",
  },
  {
    id: "gemini",
    title: "Resolve the Gemini entity conflation with the same-named logistics firm.",
    why: "Gemini recognises Ironvale at 24 of 100 and recommends it in zero questions. The cause is a disambiguation failure, not a content gap.",
    urgency: "Immediate", confidence: "medium", horizon: 30,
    impact: "Gemini recognition 24 → 45", effort: "low", owner: "Head of Digital", deadline: "Sep 15, 2026",
    metric: "Gemini resolves the correct entity on 4 of 6 category questions",
  },
  {
    id: "authority",
    title: "Strengthen independent authority evidence and supplier-comparison coverage.",
    why: "Authority is the lowest GEON vector at 28 and carries the heaviest index weight. It is the constraint holding recognition, recommendation share and coverage down.",
    urgency: "Immediate", confidence: "high", horizon: 90,
    impact: "Supplier-evaluation coverage 7% → 19%", effort: "high", owner: "VP Marketing", deadline: "Nov 30, 2026",
    metric: "Independent source count 3 → 12",
  },
  {
    id: "paid",
    title: "Reallocate paid spend from keywords with a viable organic replacement path.",
    why: "Blended CPC runs above break-even. Paid is renting positions that authority would hold, and the cost rises with competitive density.",
    urgency: "This quarter", confidence: "high", horizon: 60,
    impact: "Keywords above break-even CPC 13 → 7 of 20", effort: "medium", owner: "Demand Gen Manager", deadline: "Oct 15, 2026",
    metric: "Blended CPC below break-even on reallocated set",
  },
  {
    id: "comparison",
    title: "Build supplier-comparison content against the six highest-volume missed decision questions.",
    why: "Nineteen of twenty-four decisions complete without the brand. These six carry the largest share of decision-stage demand.",
    urgency: "This quarter", confidence: "high", horizon: 60,
    impact: "Questions with presence 5 → 12 of 24", effort: "medium", owner: "Content Lead", deadline: "Nov 15, 2026",
    metric: "Presence on 12 of 24 tracked questions",
  },
  {
    id: "narrative",
    title: "Publish an evaluation framework that makes regional response time a first-class selection criterion.",
    why: "Engines describe the category in a competitor’s language. Ironvale’s strongest differentiator is absent from every category description.",
    urgency: "Monitor", confidence: "directional", horizon: 90,
    impact: "Narrative ownership 12% → 24%", effort: "medium", owner: "Head of Brand", deadline: "Dec 31, 2026",
    metric: "Response time cited among the first three criteria by 3 of 6 engines",
  },
];

/* --------------------------------------------------------------------------
   Mission Control
   ----------------------------------------------------------------------- */

export const measures: { key: string; name: string; value: string; unit?: string; note: string; trend: Trend; confidence: Confidence; href?: string }[] = [
  { key: "dhi", name: "Decision Health Index", value: "41", unit: "/100", note: "Weighted across six GEON vectors. Authority at 28 is the binding constraint.", trend: "down", confidence: "high", href: "/en/methodology" },
  { key: "exposure", name: "Revenue Exposure", value: "$3.2k–6.2k", unit: "/mo", note: "Demand × decision gap × estimated conversion × average deal value. Directional estimate, not confirmed lost revenue.", trend: "stable", confidence: "directional" },
  { key: "recognition", name: "AI Recognition Position", value: "38", unit: "/100", note: "Average entity understanding across six engines. Three misidentify the category.", trend: "stable", confidence: "high", href: "/en/engines/ai-recognition" },
  { key: "gap", name: "Google vs AI Gap", value: "11", unit: "/20", note: "Keywords absent from AI answers and outside the Google top ten. The decision happens on neither surface.", trend: "down", confidence: "high", href: "/en/engines/google-vs-ai" },
  { key: "presence", name: "Decision Presence", value: "7%", note: "Supplier-evaluation coverage. 19 of 24 decisions complete without the brand.", trend: "down", confidence: "high" },
  { key: "capture", name: "Competitive Capture", value: "31.0%", note: "Cindermark Industrial receives the recommendation. Ironvale receives 4.2%.", trend: "down", confidence: "high", href: "/en/engines/competitor-decision" },
  { key: "narrative", name: "Narrative Ownership", value: "12%", note: "Share of the language engines use to define the category. The criteria cited first are a competitor’s.", trend: "down", confidence: "medium", href: "/en/app/narrative" },
  { key: "trust", name: "Trust Readiness", value: "44", unit: "/100", note: "3 independent sources against a category median of 14.", trend: "stable", confidence: "high" },
  { key: "paid", name: "Paid Dependency", value: "High", note: "Blended CPC runs above break-even. Paid is renting the positions authority would hold.", trend: "down", confidence: "high" },
  { key: "timing", name: "Strategic Timing Window", value: "7", unit: "months", note: "Emerging market at 63/100 readiness. Query maturity accelerating.", trend: "down", confidence: "medium" },
];

export const causalChain: { label: string; value: string; detail: string }[] = [
  { label: "ChatGPT supplier recommendation presence", value: "4.2%", detail: "The most-used engine puts Ironvale forward in one of twenty-four decision questions." },
  { label: "Supplier-evaluation coverage", value: "7%", detail: "The stage that decides 60% of revenue carries under 15% of query volume, so the weakness is invisible to volume-led tooling." },
  { label: "Independent authority evidence", value: "Weak", detail: "Engines cannot corroborate a recommendation from three sources when the category median is fourteen." },
  { label: "Competitor recommendation share", value: "31.0%", detail: "The recommendation goes to Cindermark Industrial, the supplier engines can support with evidence." },
  { label: "Paid dependency", value: "High", detail: "Paid search is bought to cover the questions authority no longer wins." },
  { label: "Directional commercial exposure", value: "$3,200 – $6,200 / mo", detail: "Demand × decision gap × estimated conversion × average deal value. A range, never a confirmed figure." },
];

export type FeedKind = "risk" | "gain" | "market";

export const feed: { kind: FeedKind; type: string; delta?: string; date: string; title: string; detail: string; severity?: "High" | "Medium" }[] = [
  { kind: "risk", type: "Competitor surge", delta: "↑ +2 questions", date: "Jul 31", severity: "High", title: "Cindermark Industrial gained the first recommendation on two more supplier questions", detail: "Cindermark now leads four of seven supplier-evaluation answers, up from two. Both new wins cite a trade publication added in June." },
  { kind: "risk", type: "Search cost spike", delta: "↑ +8% CPC", date: "Jul 31", severity: "Medium", title: "Blended CPC moved further above break-even", detail: "“industrial supply company” rose to $11.00 with no organic position in the top 100. Paid is covering a question authority does not reach." },
  { kind: "market", type: "Timing window", delta: "↑ +8% QoQ", date: "Jul 31", title: "Competitive density rose 8% quarter over quarter", detail: "The window remains open but is narrowing. Displacement cost rises once engines settle on a stable answer set." },
  { kind: "risk", type: "Citation lost", delta: "↓ 3 → 0 citations", date: "Jul 30", title: "Perplexity stopped citing the Ironvale capability page", detail: "The page was cited on three questions in June and none in July. Perplexity now resolves the same questions to competitor sources." },
  { kind: "risk", type: "Narrative risk", date: "Jul 30", title: "Engines adopted a competitor’s evaluation criteria", detail: "Fill rate and catalogue breadth are now cited first when engines explain how to choose a distributor. Regional response time is not referenced." },
  { kind: "gain", type: "Recommendation gained", delta: "↑ +1 question", date: "Jul 29", title: "Claude began recommending Ironvale for regional distributor questions", detail: "First recommendation on “Top rated industrial supply vendors near Chicago”. Regional specificity is the differentiator the answer cites." },
  { kind: "risk", type: "Trust signal decayed", date: "Jul 28", title: "Category description diverged across two trade directories", detail: "Two directories now describe Ironvale differently from its own site. Inconsistency is the mechanism behind entity confusion on ChatGPT and Copilot." },
  { kind: "market", type: "New decision question", delta: "↑ 25 searches/mo", date: "Jul 27", title: "A new supplier-evaluation question entered the tracked set", detail: "“Which MRO supplier has the best fill rate?” appeared with measurable volume. Ironvale is absent from every engine answering it." },
  { kind: "gain", type: "Regional opportunity", date: "Jul 26", title: "Midwest regional questions show weaker competitive density", detail: "Questions naming a Midwest location carry lower competitor control than national equivalents, the cheapest available entry point." },
];

/* --------------------------------------------------------------------------
   Campaign readiness
   ----------------------------------------------------------------------- */

export const readiness = {
  campaign: { name: "Q4 Midwest demand generation", launch: "Sep 1, 2026", duration: "6 months", channels: "Paid search · Paid social · Trade media · Content syndication" },
  score: 32,
  verdict: "Delay the campaign. Fix authority first.",
  dimensions: [
    {
      key: "ai", name: "AI readiness", score: 40, weight: 22, state: "Blocking", question: "Do AI engines understand and recommend this business?",
      findings: [
        ["AI recognition", "38/100", "Across six engines, the business is understood at 38 of 100. Advertising cannot correct a record it does not touch."],
        ["AI recommendation coverage", "4.2%", "6 recommendation events across 144 answer slots. A buyer who asks an assistant for suppliers almost never hears this name."],
        ["Entity understanding", "2 of 6 correct", "4 engines hold a wrong or missing record, one conflates the business with a same-named logistics firm."],
        ["Engine consistency", "37-point spread", "Recognition ranges from 21 to 58. The campaign would reach buyers whose assistants disagree about what this business is."],
      ],
      ifLaunched: "Campaign attention drives buyers to verify the business through an assistant that cannot describe it correctly. The spend creates the demand and a competitor collects it.",
    },
    {
      key: "authority", name: "Authority readiness", score: 11, weight: 20, state: "Primary constraint", question: "Is there enough evidence for AI to recommend this business?",
      findings: [
        ["Independent authority sources", "3", "3 independent sources can verify this business. The category median is 14."],
        ["Third-party validation", "Weak", "Every claim traces back to the company’s own website. Systems treat self-description as a claim rather than as evidence."],
        ["Industry references", "0 of 3 publications", "The three trade publications engines cite most for this category carry no coverage of the business at all."],
        ["Authority gap", "7× behind", "Cindermark Industrial holds 21 sources against 3. Advertising does not close an evidence gap; publishing and validation do."],
      ],
      ifLaunched: "The campaign generates consideration the business cannot survive. Buyers who check will find nothing independent, and the check happens after the click is paid for.",
    },
    {
      key: "trust", name: "Trust readiness", score: 41, weight: 15, state: "Blocking", question: "Is this business safe to recommend to a buyer?",
      findings: [
        ["Reputation", "44/100", "Reputation reads 44 of 100 while market fit reads 72. The offer is right; the proof around it is not."],
        ["Trust signals", "1 of 5 present", "Certifications, named customers, verified outcomes and specification references are absent from the public record."],
        ["External validation", "3 sources", "Independent corroboration is what lets a system name a supplier first rather than hedge across several."],
        ["Brand credibility", "57/100", "The category description differs between the website and two trade directories, which reads to a machine as an unreliable record."],
      ],
      ifLaunched: "Paid acquisition buys attention that trust has to convert. Without it the campaign raises awareness for the category and the best-verified supplier in it wins.",
    },
    {
      key: "google", name: "Google readiness", score: 41, weight: 12, state: "Blocking", question: "Can buyers find this business through traditional search?",
      findings: [
        ["Commercial keyword coverage", "9 of 20", "9 of 20 commercial questions place in the top ten. The rest are reachable only by paying for the click."],
        ["Google visibility", "38% of demand", "Weighted by search volume rather than by keyword count, so a strong position on a question nobody asks does not flatter the figure."],
        ["Technical SEO status", "No blocking faults", "Crawlability, indexation and canonicalisation carry no faults that would prevent a campaign landing page from ranking."],
        ["Organic opportunity", "6 questions", "6 questions already rank but never reach an AI answer. These are the cheapest positions available and need publishing, not budget."],
      ],
      ifLaunched: "Paid search carries the entire commercial keyword set alone, at a blended cost already above break-even, for as long as the campaign runs.",
    },
    {
      key: "narrative", name: "Narrative readiness", score: 36, weight: 11, state: "Blocking", question: "Does the market understand what this business stands for?",
      findings: [
        ["Category clarity", "Contested", "Machines describe this category using a competitor’s specification framing, so buyers arrive already evaluating against someone else’s criteria."],
        ["Messaging alignment", "Misaligned", "The campaign leads with same-day regional delivery. No public source currently associates that capability with this business."],
        ["AI narrative", "12% owned", "The business owns 12% of the language engines use to define this category."],
        ["Public narrative", "Fragmented", "No single consistent story exists in the public record for a campaign to reinforce, so each impression starts the explanation over."],
      ],
      ifLaunched: "Campaign messaging contradicts what the market already believes. Spend is consumed correcting the record instead of creating demand.",
    },
    {
      key: "competitor", name: "Competitor readiness", score: 15, weight: 10, state: "Blocking", question: "What position are we launching into?",
      findings: [
        ["Competitor authority", "21 sources", "Cindermark Industrial can be corroborated 7× more readily. That advantage compounds while no counter-programme runs."],
        ["Competitor recommendation share", "31%", "Cindermark Industrial receives 31% of recommendations against 4.2%. Launching now advertises into a decision they control."],
        ["Competitive gap", "4 ahead", "4 of 4 tracked competitors currently receive more recommendations than this business."],
        ["Market leaders", "Supplier Evaluation", "The leader is strongest at exactly the stage this campaign is intended to influence, which is where displacement is most expensive."],
      ],
      ifLaunched: "The campaign raises category demand that the best-evidenced supplier absorbs. Competitor share can rise as a direct result of this spend.",
    },
    {
      key: "website", name: "Website and conversion readiness", score: 48, weight: 10, state: "At risk", question: "Can the destination convert the intent this campaign buys?",
      findings: [
        ["Landing page quality", "3 of 7 pages", "Three of the seven pages this campaign would drive to state what the business sells above the fold. The rest open with company history."],
        ["Decision support", "Absent", "No comparison table, specification guidance or selection criteria exists on any destination page."],
        ["Commercial messaging", "Partial", "Same-day regional delivery, the strongest differentiator, appears on one page and in no page title."],
        ["Conversion readiness", "Quote form only", "A single quote form serves every stage. There is no path for a buyer who is still comparing suppliers."],
      ],
      ifLaunched: "Every click is paid for twice: once to acquire it, and again to reacquire the buyer who arrived, found nothing to evaluate with, and left to compare elsewhere.",
    },
  ],
  stages: [
    { name: "Research", coverage: 3, questions: 6, seenBy: "Invisible to every conventional measurement tool." },
    { name: "Concerns", coverage: 0, questions: 3, seenBy: "Invisible to every conventional measurement tool." },
    { name: "Solution Evaluation", coverage: 7, questions: 5, seenBy: "Invisible to every conventional measurement tool." },
    { name: "Supplier Evaluation", coverage: 7, questions: 7, seenBy: "Visible to SEO platforms." },
    { name: "Purchase Decision", coverage: 0, questions: 3, seenBy: "Visible to SEO platforms, Analytics, CRM." },
  ],
  risks: [
    { value: "19 of 24", label: "Commercial decisions that already complete without this business appearing. A campaign increases how many of these happen, not how many are won." },
    { value: "2 stages", label: "Uncovered. Return depends on buyers completing a journey the business is absent from at these stages." },
    { value: "60%", label: "The share of revenue arriving through supplier evaluation, the stage where presence is currently lowest and the campaign has least leverage." },
  ],
};

/* --------------------------------------------------------------------------
   Narrative intelligence
   ----------------------------------------------------------------------- */

export type Stance = "adverse" | "favourable" | "neutral";

export const narratives: { quote: string; stance: Stance; motion: string; reach: number; owner: string; detail: string; seen: string }[] = [
  { quote: "Fill rate and catalogue breadth are how you choose a distributor.", stance: "adverse", motion: "Growing", reach: 31, owner: "Cindermark Industrial", detail: "The dominant evaluation framing, and it is a competitor’s. Buyers arrive already scoring suppliers on the two criteria where a national distributor wins by default.", seen: "All six engines, Trade publications" },
  { quote: "Specification depth separates serious suppliers from resellers.", stance: "adverse", motion: "Steady", reach: 18, owner: "Hollowpine Supply Co", detail: "Published first by a competitor, so it became the vocabulary engines learned. It positions this business as a reseller by omission rather than by argument.", seen: "ChatGPT, Claude, Specification guides" },
  { quote: "Consolidating MRO suppliers reduces cost and administrative load.", stance: "adverse", motion: "Steady", reach: 14, owner: "Shared", detail: "Favours whichever supplier is already largest. A regional specialist is read as the thing being consolidated away rather than the one consolidating.", seen: "All six engines, Procurement publications" },
  { quote: "Single-source supplier dependency is an operational risk.", stance: "favourable", motion: "Steady", reach: 11, owner: "Unclaimed", detail: "Directly contradicts the consolidation narrative and favours a strong secondary supplier. Neither this business nor any competitor has claimed it.", seen: "Perplexity, Copilot, Risk guidance" },
  { quote: "Regional distributors deliver faster than national ones.", stance: "favourable", motion: "Emerging", reach: 9, owner: "Unclaimed", detail: "The single narrative that most favours this business, and nobody owns it. Same-day regional delivery is a genuine capability no public source attaches to it.", seen: "Trade forums, Perplexity, Buyer discussion" },
  { quote: "Regional suppliers cannot support multi-plant operations.", stance: "adverse", motion: "Emerging", reach: 7, owner: "Cindermark Industrial", detail: "The most dangerous emerging narrative on this list. It is not yet dominant and it is factually contestable, which means it is still cheap to answer.", seen: "Gemini, Copilot, Comparison content" },
  { quote: "Midwest fastener pricing is broadly comparable across suppliers.", stance: "neutral", motion: "Steady", reach: 6, owner: "Shared", detail: "Neutral on its face, but it removes price as a differentiator and pushes the decision onto evidence, which is the axis this business currently loses on.", seen: "Aggregator pages, Grok" },
  { quote: "Ironvale Supply is a hardware retailer.", stance: "adverse", motion: "Declining", reach: 4, owner: "Ironvale Supply", detail: "A factual error, carried by one engine, that removes the business from every supplier-evaluation answer it appears in. Declining, but not yet corrected.", seen: "ChatGPT" },
];

export const competitorStories: { name: string; share: number; story: string; strength: string; weakness: string; opportunity: string }[] = [
  { name: "Cindermark Industrial", share: 31, story: "The safe national choice with published comparisons.", strength: "Owns the evaluation criteria itself. Engines cite its comparison library when explaining how to choose a supplier at all.", weakness: "Its case rests on breadth and fill rate. It has no response prepared on response time or regional service depth.", opportunity: "Its own framing concedes that speed is a separate axis. A published response-time standard splits the criterion it defined." },
  { name: "Hollowpine Supply Co", share: 18, story: "The technical authority on specification.", strength: "Its specification guidance became the category’s default vocabulary because it published first, not because it is more correct.", weakness: "Specification depth does not answer availability. It is largely absent from questions about delivery and continuity.", opportunity: "Its vocabulary can be adopted and extended rather than fought. Speaking its language while adding availability outflanks it." },
  { name: "Greyfen Industrial", share: 11, story: "The educator that reaches buyers first.", strength: "Enters the decision at research, before evaluation criteria exist, and shapes them by arriving early.", weakness: "Thin at the point of purchase. Rarely named when a buyer asks whom to actually choose.", opportunity: "Research-stage presence is uncontested at the point where education becomes a shortlist." },
  { name: "Ashcombe Trade Group", share: 7, story: "The procurement-checklist incumbent.", strength: "Named on procurement documentation that engines cite at the moment of purchase.", weakness: "Almost no presence earlier in the journey. Its position is administrative rather than argued.", opportunity: "A checklist position is winnable through documentation rather than through reputation." },
];

export const unownedStories: { title: string; detail: string; influence: "High" | "Medium" | "Low"; competition: "None" | "Low" | "Medium" | "Contested" }[] = [
  { title: "Response time as a supplier selection criterion", detail: "No competitor has claimed it, engines have no vocabulary for it, and it is the capability this business actually leads on.", influence: "High", competition: "None" },
  { title: "The strategic case for a strong secondary supplier", detail: "Directly counters the consolidation narrative and reframes regional scale as risk management rather than as a limitation.", influence: "High", competition: "None" },
  { title: "Verification and provenance in fastener sourcing", detail: "An active media story with no supplier voice attached. Commenting converts a category-level trust concern into a reason to choose a specific supplier.", influence: "High", competition: "Low" },
  { title: "Supply continuity under tariff volatility", detail: "Regional inventory depth is the natural expert position on a story publications are actively looking for sources on.", influence: "Medium", competition: "Low" },
  { title: "Vendor-managed inventory for mid-market plants", detail: "A service already operated but never publicly associated with the business. One competitor is quoted in three of four pieces on it.", influence: "Medium", competition: "Contested" },
];
