export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];

export const localeNames: Record<Locale, string> = { en: "English" };

export const localeDirections: Record<Locale, "ltr" | "rtl"> = { en: "ltr" };

/**
 * Text-only translation packs.
 *
 * Every array here is index-aligned to the matching array in `lib/content.ts`
 * (ids, hrefs, feeds, positions, numeric values stay in content.ts and never
 * change per locale). Components zip the two by index when rendering, e.g.
 * `base.items.map((item, i) => ({ ...item, ...copy.items[i] }))`.
 */

type Item2 = { name: string; q: string };
type Stage3 = { label: string; title: string; detail: string };
type GraphNode = { name: string; kind: string; detail: string; evidence: [string, string, string] };
type ActionItem = { title: string; measure: string; owner: string; horizon: string };

export type Copy = {
  nav: Record<string, string>;
  navItems: Record<string, { name: string; desc: string }>;
  navFeature: { eyebrow: string; title: string; desc: string; cta: string };
  hero: {
    eyebrow: string;
    headlineWords: readonly [string, string, string];
    tagline: string;
    typewriterPhrases: readonly string[];
    supporting: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    scrollHint: string;
  };
  scrollRail: readonly string[];
  heroPanel: { title: string; surfaces: string; signals: string; position: string; state: string };
  capabilityValues: readonly string[];
  capabilityLabels: readonly string[];
  platformsLabel: string;
  differentiation: { eyebrow: string; negations: readonly string[]; title: string; body: string };
  platformFlow: { label: string; headline: string; steps: readonly string[] };
  valueAreas: {
    label: string;
    headline: string;
    supporting: string;
    exploreCta: string;
    business: { title: string; items: readonly string[] };
    clients: { title: string; items: readonly string[] };
  };
  invisible: {
    label: string;
    headline: string;
    body: string;
    pullLead: string;
    pullEmphasis: string;
    timeline: readonly string[];
    visibleLabel: string;
    invisibleLabel: string;
    notMeasured: string;
  };
  signals: { label: string; headline: string; body: string; items: readonly Item2[]; signalCursor: string };
  reconstruction: {
    label: string;
    headline: string;
    sampleNote: string;
    query: string;
    commercialQuestion: string;
    stages: readonly Stage3[];
  };
  blindSpot: {
    label: string;
    headline: string;
    body: string;
    alreadyDecided: string;
    axisLabel: string;
    traditionalTitle: string;
    traditionalSteps: readonly string[];
    georeputeTitle: string;
    georeputeSteps: readonly string[];
  };
  engines: {
    label: string;
    headline: string;
    body: string;
    items: readonly Item2[];
    feedsPrefix: string;
    engineSingular: string;
    enginePlural: string;
    idle: string;
    idleHint: string;
    sourceCursor: string;
    focusCursor: string;
  };
  loop: {
    label: string;
    headline: string;
    body: string;
    details: readonly string[];
    everyCycle: string;
    returnsBetter: string;
  };
  decisionGraph: {
    label: string;
    headline: string;
    body: string;
    barLabel: string;
    allPaths: string;
    isolating: string;
    nodesLabel: string;
    edgesLabel: string;
    nodes: readonly GraphNode[];
    supportingEvidence: string;
    noNodeSelected: string;
    noNodeHint: string;
    isolateCursor: string;
  };
  executive: {
    label: string;
    headline: string;
    body: string;
    sampleNote: string;
    positionLabel: string;
    positionState: string;
    measureNames: readonly string[];
    outOf100: string;
  };
  actionPlan: {
    label: string;
    headline: string;
    body: string;
    movesLabel: string;
    ownerLabel: string;
    horizonLabel: string;
    items: readonly ActionItem[];
  };
  finalCta: {
    label: string;
    headline: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    ctaSupporting: string;
  };
  infrastructure: {
    label: string;
    headline: string;
    items: readonly [string, string, string, string, string];
  };
  tryTool: {
    label: string;
    headline: string;
    body: string;
    placeholder: string;
    submitCta: string;
    analyzing: string;
    resultsLabel: string;
    measureNames: readonly [string, string, string, string];
    sampleNote: string;
    unlockHeadline: string;
    unlockBody: string;
    unlockCta: string;
  };
  footer: {
    tagline: string;
    note: string;
    poweredBy: string;
    product: string;
    intelligence: string;
    methodology: string;
    company: string;
    ecosystem: string;
    ecoGintex: string;
    ecoCopyup: string;
    ecoOnlinePerception: string;
    geon: string;
    evidence: string;
    confidence: string;
    financial: string;
    limits: string;
    privacy: string;
    bookDemo: string;
    emailUs: string;
    whatsapp: string;
    disclaimer: string;
    iconCredit: string;
    trademarks: string;
    demoNote: string;
    rights: string;
  };
};

const SIGNAL_NAMES_EN = [
  "AI Recognition", "Google Visibility", "AI Visibility", "Authority", "Trust",
  "Context", "Consistency", "Market Fit", "Competitive Position", "Narrative Alignment",
] as const;

const en: Copy = {
  nav: { cta: "Analyze My Business", reports: "Intelligence Reports" },
  navItems: {},
  navFeature: { eyebrow: "Signature experience", title: "Reconstruct the decision.", desc: "Ten surfaces, one commercial question, from what each engine understood to what must change next.", cta: "Open the reconstruction" },
  hero: {
    eyebrow: "Strategic Business Intelligence Infrastructure",
    headlineWords: ["Every business", "should have its own", "intelligence center."],
    tagline: "From market intelligence to the next move.",
    typewriterPhrases: ["See the whole board.", "Understand what is changing.", "Identify what others miss.", "Know the next move."],
    supporting: "Understand your business, market and competitors. See how customers are being influenced across Google and AI. Identify where opportunities are being missed, then turn the intelligence into a prioritized strategy and actionable work plan.",
    primaryCta: { label: "Analyze My Business", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "Get in touch", href: "mailto:georepute@gmail.com" },
    scrollHint: "Enter the system",
  },
  scrollRail: ["Enter", "Difference", "Platform", "Executive", "Infrastructure", "Analyze"],
  heroPanel: { title: "Decision environment", surfaces: "Surfaces watched", signals: "Signals resolved", position: "Decision position", state: "Reconstructing" },
  capabilityValues: ["100+", "Google + 6 AI Engines", "7 Languages", "Continuous PDCA"],
  capabilityLabels: ["Business & Marketing Analyses", "Search & AI Intelligence", "Local & International Market Research", "Execution, Measurement & Improvement"],
  platformsLabel: "Market, Business, Search & AI Intelligence, connected in one platform",
  differentiation: {
    eyebrow: "Not another tool. Intelligence that stays.",
    negations: ["Not another dashboard.", "Not another isolated report.", "Not another guess dressed as a decision."],
    title: "People can change. The business intelligence remains.",
    body: "Every analysis, decision, action and outcome strengthens the intelligence over time.",
  },
  platformFlow: {
    label: "How the platform works",
    headline: "From research to results, in one working system.",
    steps: ["Research", "Intelligence", "Opportunity", "Decision", "Strategy", "Work Plan", "Execution", "Measurement", "Improvement"],
  },
  valueAreas: {
    label: "One platform, two connected use cases",
    headline: "Built for marketing agencies and the people responsible for growth.",
    supporting: "Understand any business, market and competitive environment before deciding where to invest, what to change and what to do next.",
    exploreCta: "Explore the Platform",
    business: {
      title: "For Your Business",
      items: ["Research your own market", "Identify new prospects and target audiences", "Improve positioning and sales conversations", "Build stronger proposals", "Find new services and business opportunities", "Reduce manual research time", "Support business development and expansion"],
    },
    clients: {
      title: "For Your Clients",
      items: ["Understand the client's business and market", "Benchmark them against competitors", "Analyze demand and target audiences", "Identify missed opportunities", "Understand Google, SEO and AI presence", "Identify where to invest and where not to invest", "Build strategy and an actionable work plan", "Execute recommendations", "Measure progress", "Continuously improve"],
    },
  },
  invisible: {
    label: "The invisible decision",
    headline: "Your analytics start after the decision has already been shaped.",
    body: "By the time a visit is recorded, the customer has already asked a question, been given an interpretation, weighed evidence, and compared you against alternatives. Every platform you run measures what happens next. None of them measure that.",
    pullLead: "Traditional platforms optimize channels.",
    pullEmphasis: "GeoRepute reconstructs decisions.",
    timeline: ["Question asked", "Interpretation formed", "Evidence weighed", "Alternatives compared", "Recommendation made", "Decision taken", "Visit recorded"],
    visibleLabel: "Where your analytics begin",
    invisibleLabel: "Where the decision is actually made",
    notMeasured: "not measured",
  },
  signals: {
    label: "See the signals",
    headline: "Ten measures. One decision position. Each opening its evidence.",
    body: "Every signal below is measured independently, then resolved into a single position on whether your business is in a state to win the decision.",
    items: [
      { name: "AI Recognition", q: "Do AI engines understand who the business is?" },
      { name: "Google Visibility", q: "Is the business present where conventional search still decides?" },
      { name: "AI Visibility", q: "Does it exist consistently across both discovery surfaces?" },
      { name: "Authority", q: "Does independent evidence support the claims being made?" },
      { name: "Trust", q: "Does the market treat the business as safe to pick?" },
      { name: "Context", q: "Is the business understood in the right category and use case?" },
      { name: "Consistency", q: "Does every surface describe the same entity the same way?" },
      { name: "Market Fit", q: "Is demand moving toward what the business actually sells?" },
      { name: "Competitive Position", q: "Who receives the decision instead, and why?" },
      { name: "Narrative Alignment", q: "What story is the market telling, and how is it influencing decisions?" },
    ],
    signalCursor: "Signal",
  },
  reconstruction: {
    label: "Watch a decision form",
    headline: "Enter a domain, pick a commercial question, watch the decision rebuild.",
    sampleNote: "Worked example: illustrative reconstruction, not customer data.",
    query: "Which industrial fastener suppliers are most reliable in the Midwest?",
    commercialQuestion: "Commercial question",
    stages: [
      { label: "Question", title: "A commercial question enters the system", detail: "Not a keyword. A decision with a buyer, a budget and a deadline behind it." },
      { label: "AI interpretation", title: "The engine decides what the question means", detail: "'Reliable' is resolved into on-time delivery, certification depth, and stocking consistency; before any supplier is considered." },
      { label: "Evidence", title: "Independent sources are weighed", detail: "Third-party evidence outranks self-published claims. Businesses without it are not disqualified; they are never assembled into the answer." },
      { label: "Competitive context", title: "Alternatives enter and compete for the answer", detail: "Every business in the category is assessed against the same criteria at once. Who receives the decision instead, and why?" },
      { label: "Recommendation", title: "A named answer is produced", detail: "One to three businesses are named. Everyone else is absent from the decision entirely." },
      { label: "Decision", title: "The decision was made before the click", detail: "It was not created at the final step. It was assembled out of every signal that came before it; that is the part your analytics never saw." },
    ],
  },
  blindSpot: {
    label: "The blind spot",
    headline: "Two different maps of the same customer.",
    body: "One begins when the decision is already over. The other begins when it starts.",
    alreadyDecided: "Already decided before the first measurable event",
    axisLabel: "One decision, left to right",
    traditionalTitle: "Conventional analytics",
    traditionalSteps: ["Visit", "Click", "Lead", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["Question", "Consideration", "Recommendation", "Decision", "Outcome"],
  },
  engines: {
    label: "The intelligence engines",
    headline: "Twelve engines. One connected system.",
    body: "Each engine answers a question the others depend on. Nine of the core engines are mapped here; focus one to see what it feeds.",
    items: [
      { name: "AI Recognition", q: "Do AI engines understand who the business is?" },
      { name: "Google vs AI Visibility", q: "Does it exist consistently across both discovery surfaces?" },
      { name: "Competitor Decision", q: "Who receives the decision instead, and why?" },
      { name: "Authority", q: "Does independent evidence support the claims being made?" },
      { name: "Trust", q: "Does the market treat the business as safe to pick?" },
      { name: "Context", q: "Is the business understood in the right category?" },
      { name: "Narrative Intelligence", q: "What story is the market telling, and how is it influencing decisions?" },
      { name: "Action Intelligence", q: "What must happen next, by whom and by when?" },
      { name: "Executive Intelligence", q: "Ten measures, one decision position, each opening its evidence." },
    ],
    feedsPrefix: "Feeds",
    engineSingular: "engine",
    enginePlural: "engines",
    idle: "Idle",
    idleHint: "Focus an engine to isolate what it feeds.",
    sourceCursor: "Source",
    focusCursor: "Focus",
  },
  loop: {
    label: "The closed loop",
    headline: "Intelligence that compounds instead of expiring.",
    body: "Continuous PDCA measurement. Every cycle returns to the network better informed than the last.",
    details: ["Understand reality.", "Execute interventions.", "Measure what changed.", "Decide what happens next."],
    everyCycle: "Every cycle",
    returnsBetter: "returns better informed",
  },
  decisionGraph: {
    label: "The decision graph",
    headline: "The environment, made inspectable.",
    body: "Focus any node to isolate what connects to it. Unrelated paths dim; supporting evidence resolves.",
    barLabel: "Decision graph",
    allPaths: "All paths",
    isolating: "Isolating",
    nodesLabel: "nodes",
    edgesLabel: "edges",
    nodes: [
      { name: "Input", kind: "Signal", detail: "The commercial question, the market it enters, and who is asking it.", evidence: ["Query intent class", "Buyer stage", "Category boundary"] },
      { name: "Interpretation", kind: "Model", detail: "How AI engines resolve ambiguous language into concrete criteria.", evidence: ["Criteria extraction", "Entity resolution", "Category mapping"] },
      { name: "Market", kind: "Environment", detail: "Demand direction, narrative pressure, and who else is competing for the answer.", evidence: ["Narrative movement", "Demand shift", "Competitive density"] },
      { name: "Channel", kind: "Surface", detail: "Google and six AI engines: the surfaces where the answer is assembled.", evidence: ["Google presence", "AI engine coverage", "Surface consistency"] },
      { name: "Outcome", kind: "Result", detail: "Whether the business is named, considered, or absent from the decision.", evidence: ["Named rate", "Consideration set", "Absence cause"] },
      { name: "Action", kind: "Intervention", detail: "Prioritised interventions with owners, deadlines and measurement.", evidence: ["Owner assigned", "Deadline set", "Measurement bound"] },
    ],
    supportingEvidence: "Supporting evidence",
    noNodeSelected: "No node selected",
    noNodeHint: "Focus any node to isolate what connects to it and open its evidence.",
    isolateCursor: "Isolate",
  },
  executive: {
    label: "Executive intelligence",
    headline: "Ten measures, one decision position.",
    body: "Each measure opens its own evidence. The position is what the board actually asks for.",
    sampleNote: "Sample reading: illustrative values shown to demonstrate the interface.",
    positionLabel: "Decision position",
    positionState: "Contested",
    measureNames: SIGNAL_NAMES_EN,
    outOf100: "out of 100",
  },
  actionPlan: {
    label: "From insight to action",
    headline: "Prioritised interventions with owners, deadlines and measurement.",
    body: "The system does not stop at analysis. It resolves into a sequence someone can be held to.",
    movesLabel: "Moves",
    ownerLabel: "Owner",
    horizonLabel: "Horizon",
    items: [
      { title: "Strengthen independent authority evidence", measure: "Authority", owner: "Strategy", horizon: "30 days" },
      { title: "Publish canonical entity description", measure: "Consistency", owner: "Content", horizon: "14 days" },
      { title: "Resolve entity confusion across surfaces", measure: "AI Recognition", owner: "Technical", horizon: "21 days" },
      { title: "Build comparison content against named alternatives", measure: "Competitive Position", owner: "Content", horizon: "45 days" },
      { title: "Reallocate paid spend toward contested decisions", measure: "Market Fit", owner: "Media", horizon: "30 days" },
    ],
  },
  finalCta: {
    label: "Analyze my business",
    headline: "The decision is already happening.",
    body: "GeoRepute shows you where it happens, why it moves, and what to change next.",
    primaryCta: "Analyze My Business",
    secondaryCta: "Book a Live Demo",
    ctaSupporting: "Start with a complete business, market, competitor, Google and AI analysis. GeoRepute turns the findings into opportunities, priorities, strategy and an actionable work plan.",
  },
  tryTool: {
    label: "Try it on your business",
    headline: "See how AI engines talk about you.",
    body: "Enter a business name and watch the same measures the platform tracks resolve in real time.",
    placeholder: "Enter a business name…",
    submitCta: "Run Analysis",
    analyzing: "Reading AI engines…",
    resultsLabel: "Preview for",
    measureNames: ["AI Recognition", "Google vs AI Visibility Gap", "Competitor Advantage", "Decision Position"],
    sampleNote: "Illustrative preview, the full report runs live on the platform.",
    unlockHeadline: "This is the preview.",
    unlockBody: "Create a free account to run the real analysis on your business.",
    unlockCta: "Unlock My Full Report",
  },
  infrastructure: {
    label: "Platform infrastructure",
    headline: "Built on a Complete Intelligence Infrastructure",
    items: [
      "100+ Business & Marketing Analyses",
      "Google + 6 AI Engines",
      "7 Languages",
      "Continuous PDCA Measurement",
      "12 Connected Intelligence Engines",
    ],
  },
  footer: {
    tagline: "The intelligence & execution layer for modern agencies.",
    note: "Traditional platforms optimize channels. GeoRepute reconstructs decisions.",
    poweredBy: "Powered by Gintex",
    product: "Product",
    intelligence: "Intelligence",
    methodology: "Methodology",
    company: "Company",
    ecosystem: "Ecosystem",
    ecoGintex: "The group behind GeoRepute.",
    ecoCopyup: "Content and media execution.",
    ecoOnlinePerception: "Perception measurement.",
    geon: "The GEON framework",
    evidence: "Evidence sources",
    confidence: "Confidence model",
    financial: "Financial model",
    limits: "Limitations",
    privacy: "Privacy Policy",
    bookDemo: "Book a live demo",
    emailUs: "Email us",
    whatsapp: "WhatsApp",
    disclaimer: "Directional modelling. Commercial figures are estimates for prioritisation, not audited financial statements. Every model exposes its assumptions and data boundaries.",
    iconCredit: "Interface icons: Phosphor Icons (MIT license).",
    trademarks: "Google, ChatGPT, Gemini, Claude, Perplexity, Copilot and Grok are trademarks of their respective owners. Their names and simplified marks appear only to identify the systems GeoRepute measures and do not imply affiliation or endorsement.",
    demoNote: "Demonstration environment · Seeded data",
    rights: "All rights reserved.",
  },
};

export { SIGNAL_NAMES_EN };
export const translations: Record<Locale, Copy> = { en };

export function normalizeLocale(value?: string): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : "en";
}

export function getLocaleCopy(locale: string): Copy {
  return translations[normalizeLocale(locale)];
}

export function localizePath(path: string, locale: Locale) {
  return path.replace(/^\/en(?=\/|$)/, `/${locale}`);
}
