/**
 * Copy for the explanatory and catalogue subpages, How It Works, Methodology,
 * the engines index and the marketplace. Taken from the live GeoRepute site;
 * nothing here is invented positioning.
 *
 * English objects below (`howItWorks`, `methodology`, `marketplace`,
 * `categories`) remain the default/fallback data, unchanged in shape, so
 * existing importers (numeric fields, slugs, hrefs, `live`/`built` flags)
 * keep working exactly as before. Hebrew counterparts live further down the
 * file as full parallel objects (index-aligned to the English arrays) behind
 * `getHowItWorksCopy` / `getMethodologyCopy` / `getMarketplaceCopy` /
 * `getCategoriesCopy`, following the same `packs` / `normalizeLocale` / `?? en`
 * pattern used in `lib/warRoom.ts`.
 */

import { normalizeLocale } from "../i18n";

/* --------------------------------------------------------------------------
   How it works, the closed loop
   ----------------------------------------------------------------------- */

export const howItWorks = {
  eyebrow: "The GeoRepute closed loop",
  title: "From intelligence to execution. From execution back to intelligence.",
  lead: "GeoRepute doesn’t just analyze what is happening. It understands why it is happening, decides what needs to change, executes the strategy, measures what changed, and uses the result to decide what happens next.",
  disconnected: {
    eyebrow: "The disconnected model",
    title: "Most businesses operate through disconnected systems.",
    pieces: [
      "One platform measures Google.",
      "Another monitors AI.",
      "Another analyzes competitors.",
      "Someone builds the strategy.",
      "Someone else creates the content.",
      "Another system distributes it.",
      "Analytics measures what happened afterward.",
    ],
    body: "Different systems. Different teams. Different datasets. Different objectives. And often no direct connection between the original diagnosis and the final result.",
    fragmented: ["Research", "Strategy", "Agency", "Content", "Distribution", "Analytics", "Meeting", "New strategy"],
    connected: ["Intelligence", "Decision", "Execution", "Measurement", "Learning", "Correction"],
  },
  phases: [
    {
      key: "plan", n: "01", name: "Plan",
      title: "Understand the reality before deciding what to do.",
      body: "Every cycle begins with deep diagnosis. GeoRepute scans and connects intelligence across the business, its competitors, its market and the digital environments influencing customer decisions.",
      listLabel: "The system analyzes signals across",
      list: ["AI Engines", "Google", "Search", "Competitors", "Market", "Digital Presence", "Authority", "Trust", "Narratives", "Content", "Customer Questions", "Decision Journeys", "Digital Sources", "Languages", "Connected Business Data"],
      question: "What does the market actually understand about your business?",
      determines: [
        "What AI engines know about it",
        "When AI recommends it, and when it doesn’t",
        "What Google shows at critical moments",
        "Which questions influence the buying decision",
        "Which competitors receive the decision instead",
        "Where trust and authority are missing",
      ],
      contrast: ["What should we post this month?", "Which measurable signal should move if the strategy works?"],
    },
    {
      key: "do", n: "02", name: "Do",
      title: "Don’t create what the business wants to say. Create what the customer needs to encounter.",
      body: "This is where intelligence becomes execution. GeoRepute does not start with a blank content calendar. It starts with the gaps discovered during Plan, then generates the required content and media and publishes it across the connected digital assets of the business.",
      listLabel: "Published across connected digital assets",
      list: ["Website", "Social platforms", "Articles", "Business profiles", "Content environments", "Connected publishing channels"],
      question: "What must the customer encounter to decide differently?",
      determines: [
        "Which questions need to be answered",
        "Which narratives need to be created, strengthened or corrected",
        "Which trust signals need to exist",
        "Which audience needs to encounter it, in which language",
        "At which stage of the decision journey",
        "On which digital property, and in what sequence",
      ],
      contrast: ["Content is the strategy.", "Content is the execution layer of the intelligence."],
    },
    {
      key: "check", n: "03", name: "Check",
      title: "Don’t measure what was published. Measure what changed.",
      body: "Publishing is not success. Views are not success. After execution, GeoRepute returns to the environment and measures it again, checking whether the targeted signals actually moved.",
      listLabel: "The system compares",
      list: ["Before", "Action", "After"],
      question: "Did the signals this action was built to move actually move?",
      determines: [
        "Did AI understanding change?",
        "Did recommendation presence increase?",
        "Did the business enter decisions where it was previously absent?",
        "Did authority strengthen and trust improve?",
        "Did the competitive gap narrow?",
        "Is the same competitor still receiving the decision?",
      ],
      contrast: ["Completing the action.", "Moving the signal the action was created to move."],
    },
    {
      key: "act", n: "04", name: "Act",
      title: "The result becomes the intelligence for the next decision.",
      body: "The market has now changed, so the strategy cannot remain static. GeoRepute feeds the new results back into its intelligence layer. What works is reinforced. What fails to move is changed. New opportunities enter the plan.",
      listLabel: "GeoRepute can adjust",
      list: ["Strategy", "Priorities", "Narratives", "Messages", "Content", "Media", "Distribution", "Channels", "Timing", "Target signals", "The next actions"],
      question: "What should happen next, and why?",
      determines: ["What worked.", "What didn’t.", "What moved.", "What didn’t move enough.", "What competitors changed.", "What should happen next."],
      contrast: ["A strategy built once.", "A strategy that re-decides every cycle."],
    },
  ],
  beforeAfter: [
    { signal: "AI Recognition", before: 38, after: 51, target: 55, unit: "" },
    { signal: "Authority", before: 28, after: 39, target: 45, unit: "" },
    { signal: "Decision Presence", before: 7, after: 14, target: 19, unit: "%" },
    { signal: "Recommendation Share", before: 4.2, after: 8.1, target: 11, unit: "%" },
    { signal: "Narrative Ownership", before: 12, after: 18, target: 24, unit: "%" },
  ],
  beforeAfterNote: "Illustrative movement across one cycle. Demonstration data, not a customer result.",
  loop: [
    { name: "Understand", body: "Deep diagnosis of the business, market, competitors and decision environment." },
    { name: "Decide", body: "Turn intelligence into a strategy aligned with defined objectives." },
    { name: "Create", body: "Generate the content and media required by the strategy." },
    { name: "Distribute", body: "Publish across connected digital assets and channels." },
    { name: "Measure", body: "Re-scan the environment and measure what actually changed." },
    { name: "Learn", body: "Understand which actions moved the targeted signals and which did not." },
    { name: "Correct", body: "Adjust strategy, content, distribution and priorities." },
  ],
  brain: {
    eyebrow: "Not another content engine",
    title: "The content is an output. The intelligence is the brain.",
    body: "GeoRepute is not designed to produce more content. It is designed to determine what needs to exist in the market to influence the next decision.",
    sometimes: ["Content", "Authority", "Evidence", "A narrative correction", "Answering questions customers cannot resolve", "Strengthening a digital property", "Closing a competitive gap"],
  },
  difference: [
    ["Analytics", "tells you what happened."],
    ["Intelligence", "tells you why."],
    ["Strategy", "tells you what should change."],
    ["Execution", "makes the change."],
    ["Measurement", "tells you whether it worked."],
  ],
  living: {
    title: "From a snapshot to a living strategy.",
    body: "Markets move. Competitors move. Customer questions change. Google changes. AI systems change. A strategy built once cannot continuously respond to a market that never stops moving. GeoRepute turns strategy from a static document into a living system.",
    verbs: ["Observes", "Understands", "Decides", "Executes", "Measures", "Learns", "Adapts"],
  },
  cta: {
    title: "See the closed loop in action.",
    body: "Don’t just see another dashboard. See how GeoRepute moves from intelligence to strategy, from strategy to execution, and from execution back into measurable intelligence.",
  },
  ui: {
    heroAriaLabel: "Plan, do, check, act, one continuous loop",
    repeatBadge: "Repeat",
    repeatNote: "The output of one cycle becomes the intelligence of the next.",
    crumb: "How it works",
    heroTitle: ["From intelligence to execution.", "From execution back to intelligence."] as [string, string],
    ctaDemo: "Book a Live Demo",
    ctaWalkLoop: "Walk the loop",
    fragmentedLabel: "The traditional model is fragmented",
    connectedLabel: "GeoRepute closes the gap",
    connectClaim: "GeoRepute connects the entire decision cycle.",
    compareFoot: "The same intelligence that identifies the problem guides the strategy. The execution is measured against the original objective. And the result determines what the system does next.",
    pdca: "Plan → Do → Check → Act → Repeat",
    questionLabel: "The question",
    baLabel: "Before → Action → After",
    baLegend: ["Before", "After", "Target"] as [string, string, string],
    cycleLabel: "The closed loop",
    cycleTitle: "One system. One continuous learning cycle.",
    cycleBody: "Every cycle makes the next cycle more informed.",
    cycleReturn: "Correct feeds straight back into Understand.",
    diffLabel: "The difference",
    diffFoot: "GeoRepute connects all five, and runs the cycle again.",
    livingLabel: "From a snapshot to a living strategy",
    ctaEyebrow: "See it run",
    ctaMissionControl: "Open Mission Control",
  },
};

/* --------------------------------------------------------------------------
   Methodology, GEON framework
   ----------------------------------------------------------------------- */

export const methodology = {
  eyebrow: "Methodology",
  title: "The stronger the claim, the stronger the evidence path must be.",
  lead: "Every conclusion in this system can be traced to a date, a source, an engine, a prompt or a connected dataset. This page states how, and where the boundaries are.",
  version: "Methodology version GEON-2.4 · observed 2026-07-31",
  vectors: [
    { name: "Visibility", weight: 0.25, score: 34, body: "How consistently the business appears across AI and digital environments." },
    { name: "Authority", weight: 0.3, score: 28, body: "Whether the business is recognized as a credible expert or category leader." },
    { name: "Context", weight: 0.1, score: 61, body: "Whether systems understand what the business does, who it serves and when to recommend it." },
    { name: "Trust", weight: 0.2, score: 44, body: "The strength of reputation, validation and proof surrounding the business." },
    { name: "Consistency", weight: 0.075, score: 57, body: "Whether the same accurate story appears across channels, markets and languages." },
    { name: "Market Fit", weight: 0.075, score: 72, body: "How closely positioning matches customer demand and buying intent." },
  ],
  evidence: [
    { name: "Public AI responses", body: "Answers observed from six engines against a fixed question set, recorded with engine, date and full response." },
    { name: "Third-party search and market data", body: "Keyword volume, organic position, competition and cost per click." },
    { name: "Connected first-party analytics", body: "Search Console and Analytics, where the customer connects them. Improves confidence; never required." },
    { name: "Public competitor information", body: "Published positions, citations and the sources engines reach for when recommending a competitor." },
    { name: "Public content, reputation and trust signals", body: "Independent validation, review corpora and cross-source consistency." },
    { name: "Customer-configured business assumptions", body: "Average deal value, conversion rates and revenue split by decision stage. Always labelled as customer-provided." },
    { name: "Historical GeoRepute scans and action outcomes", body: "Prior observations and whether an executed action moved the signal it targeted." },
  ],
  financial: {
    formula: ["Demand", "Decision Gap", "Estimated Conversion", "Average Deal Value"],
    rules: [
      "All values are shown as ranges, never as point estimates.",
      "No value is described as confirmed lost revenue.",
      "Every model exposes its assumptions and data boundaries.",
      "Connected first-party conversion data improves confidence.",
      "Prediction is withheld when history is insufficient.",
      "Every exported brief carries methodology and limitation language.",
    ],
    economics: [
      ["Blended CPC", "$8.42"],
      ["Break-even CPC", "$6.13"],
      ["Above break-even", "16 of 20"],
    ],
    economicsNote: "Break-even is average order value × gross margin × site conversion. Paid dependency is classified from the ratio of blended CPC to break-even, it is derived, never asserted.",
  },
  limitations: [
    "AI engine answers vary between runs and between users. Observations are point-in-time samples, not guarantees of what any individual buyer sees.",
    "Commercial exposure is a directional model built on customer-configured assumptions. It is useful for prioritisation and is not an audited financial statement.",
    "Attribution between an executed action and a signal movement is correlational. The system records both and reports the relationship; it does not claim causation.",
    "Competitor authority counts reflect sources engines cite publicly. A competitor may hold private advantages this system cannot observe.",
    "Where history is insufficient, predictive conclusions are withheld rather than estimated.",
  ],
  ui: {
    crumb: "Methodology",
    heroTitle: ["The stronger the claim,", "the stronger the evidence path must be."] as [string, string],
    toc: ["The GEON framework", "Where observations come from", "Confidence", "Financial model", "Limitations"] as [string, string, string, string, string],
    traceLabels: ["Date", "Source", "Engine", "Prompt", "Dataset"] as [string, string, string, string, string],
    sec1Label: "The GEON framework",
    sec1Title: "Six vectors, one published weighting.",
    sec1Body: "The Decision Health Index is a weighted function of these six vectors, not a score assigned by judgement. The weighting is published so the index can be recomputed independently. Move any vector to see how.",
    weightsAria: "Published vector weights",
    sec1Note: "Observed values are from the demonstration environment (Ironvale Supply). The weights are the published GEON-2.4 weights.",
    sec2Label: "Evidence",
    sec2Title: "Where the observations come from.",
    sec3Label: "Confidence",
    sec3Title: "Every conclusion carries its own confidence.",
    sec3Body: "Confidence is attached to the individual conclusion, not to the product. Two findings in the same readout can carry different confidence, and they frequently do.",
    sec4Label: "Financial model",
    sec4Title: "Directional, ranged, and never described as confirmed.",
    economicsLabel: "Search economics, derived",
    breakEvenLabel: "Break-even",
    blendedLabel: "Blended",
    sec5Label: "Limitations",
    sec5Title: "What this system cannot tell you.",
    btnMissionControl: "Open Mission Control",
    btnEngines: "See the engines",
    ctaEyebrow: "Audit it yourself",
    ctaTitle: "Every number on this site opens its evidence.",
    ctaBody: "Start from a decision and follow any figure back to the engine, the question and the date it was observed.",
    btnReconstruct: "Reconstruct a decision",
  },
};

/* --------------------------------------------------------------------------
   Intelligence engines index
   ----------------------------------------------------------------------- */

export const enginesIndex = {
  eyebrow: "Intelligence engines",
  title: "Twelve intelligence engines. One operating system.",
  lead: "Each engine answers a board-level business question, produces a connected intelligence readout and routes the user into action. Not a feature list, a set of questions the business needs answered.",
  built: [
    { href: "/en/engines/ai-recognition", name: "AI Recognition Intelligence", question: "Do AI engines understand who the business is and when it should be considered?", finding: "Three of six AI engines misidentify what Ironvale sells, and one does not recognise it as a distinct business at all.", modules: ["Recognition by engine", "Entity understanding", "Category association", "Confusion detection"], stat: "3 of 6", statLabel: "engines misidentify the business" },
    { href: "/en/engines/google-vs-ai", name: "Google vs AI Visibility Intelligence", question: "Does the business exist consistently across traditional search and AI-mediated discovery?", finding: "Eleven of twenty tracked commercial keywords sit outside the Google top ten and receive no AI recommendation, the decision happens on neither surface.", modules: ["Google position", "AI recommendation presence", "Gap classification", "Recoverable search"], stat: "11 of 20", statLabel: "keywords invisible on both surfaces" },
    { href: "/en/engines/competitor-decision", name: "Competitor Decision Intelligence", question: "Where do competitors receive the decision before the business receives the lead?", finding: "Cindermark receives 31% of all AI recommendations across the tracked decision set; Ironvale receives 4.2%.", modules: ["Recommendation share", "Winning prompts", "Decision-stage control", "Authority drivers"], stat: "31% vs 4.2%", statLabel: "recommendation share" },
    { href: "/en/engines/action", name: "Action Intelligence", question: "What must happen next, by whom and by when?", finding: "Six interventions are prioritised; the first two address authority evidence and supplier-comparison coverage.", modules: ["Action", "Evidence", "Expected impact", "Confidence"], stat: "6", statLabel: "prioritised interventions" },
  ],
  further: [
    { name: "AI Search Presence", question: "Is the business present when customers ask AI whom to choose?" },
    { name: "Search Economics", question: "When does paid search become structurally inefficient?" },
    { name: "Narrative Intelligence", question: "When the market explains the category, whose language does it use?" },
    { name: "Trust and Authority Diagnostics", question: "Is the business visible but still unsafe to recommend?" },
    { name: "Opportunity and Revenue Intelligence", question: "Which gap is commercially meaningful enough to fix first?" },
    { name: "Strategic Timing Intelligence", question: "Is the market ready, and how long is the window open?" },
    { name: "Distribution Intelligence", question: "Does the route to market strengthen the brand or transfer power to intermediaries?" },
    { name: "Global Market Intelligence", question: "How does the business change across countries, languages and markets?" },
  ],
};

/* --------------------------------------------------------------------------
   Marketplace
   ----------------------------------------------------------------------- */

export type Module = { name: string; question: string; body: string; live: boolean };
export type Offer = { tier: string; name: string; question: string; scope: string; delivery: string };

export type Category = {
  slug: string;
  name: string;
  short: string;
  question: string;
  body: string;
  modules: number;
  live: number;
  chips: string[];
  detail?: {
    modules: Module[];
    offers: Offer[];
    engines: { name: string; question: string; built: boolean; href?: string }[];
  };
};

export const marketplace = {
  eyebrow: "The intelligence ecosystem",
  title: "Whatever the business question, there is already intelligence built for it.",
  lead: "Seven categories of decision intelligence, each holding the models that answer one kind of commercial question. Most of them measure things a business has never been able to see.",
  stats: [
    { value: 7, label: "Intelligence categories" },
    { value: 61, label: "Intelligence modules" },
    { value: 12, label: "Engines beneath them" },
  ],
  triad: [
    { name: "Evidence", body: "Every claim carries the observation behind it: which engine, which question, which date. A conclusion you cannot audit is an opinion." },
    { name: "Analysis", body: "What the evidence means commercially, what is causing it, and how confident the model can honestly be. Limits are stated, never implied." },
    { name: "Recommendation", body: "What to do, who owns it, by when, and what signal should move as a result. Verified afterwards against what actually moved." },
  ],
  ui: {
    crumb: "Marketplace",
    heroTitle: ["Whatever the business question,", "there is already intelligence built for it."] as [string, string],
    ctaStart: "Start with your question",
    ctaHow: "How the models work",
    sec1Label: "Seven categories",
    sec1Title: "Start with the question you actually have.",
    sec1Body: "Each category opens into the modules underneath it. Every module answers one business question and returns evidence, an analysis and a recommendation, never a figure on its own.",
    modulesWord: "modules",
    liveInDemo: "live in demo",
    inPlatform: "in platform",
    explore: "Explore",
    availableInPlatform: "Available in platform",
    sec2Label: "What you are buying",
    sec2TitleLead: "The document is the output.",
    sec2TitleEm: "The intelligence is the product.",
    ctaEyebrow: "See it run",
    ctaTitle: "Watch a module answer a question live.",
    ctaSeeModule: "See a module run live",
    ctaMonitor: "Monitor continuously instead",
    ringLabel: (total: number, live: number, categoriesCount: number) =>
      `${categoriesCount} intelligence categories, ${total} modules, ${live} live in this demo`,
    catCtaBuy: "Buy this intelligence",
    catCtaBrowse: "Browse the modules",
    catSec1Title: "Every module answers one question.",
    catSec1Body: "Each returns the evidence behind its answer, what that answer means commercially, and what should change as a result.",
    catSec2Label: "Buy this intelligence",
    catSec2Title: "Take one question, or take the whole category.",
    catSec2Body: "Each purchase states what it examines, what it needs from you, how confident it can be and how it is delivered. No sales call is required to find any of that out.",
    deliveryLabel: "Delivery",
    startPrefix: "Start",
    catSec3Label: "Underneath",
    catSec3TitleOne: "One engine produces this category.",
    catSec3TitleMany: (n: number) => `${n} engines produce this category.`,
    catSec3Body: "Engines are the machinery, not the offer. Nothing above required you to know one existed.",
    builtPill: "Built",
    openEngine: "Open the engine",
    inPlatformPill: "In platform",
    otherCategories: "Other intelligence categories",
    allCategories: "All categories",
    catCtaEyebrow: "Not sure where to start",
    catCtaTitle: "Start with a decision, then open the intelligence behind it.",
    catCtaStart: "Start Analysis",
    catCtaReconstruct: "Reconstruct a decision",
    enginesUnderneath: (n: number) => (n === 1 ? "1 engine underneath" : `${n} engines underneath`),
    liveInDemoCount: (n: number) => `${n} live in demo`,
    inPlatformCount: (n: number) => `${n} in platform`,
  },
};

export const categories: Category[] = [
  {
    slug: "ai-visibility-intelligence",
    name: "AI Visibility Intelligence",
    short: "AI visibility",
    question: "Does AI know the business exists, and what does it think it is?",
    body: "Whether AI systems hold an accurate, current and unambiguous record of the business, and whether that record survives into the answers buyers receive. Everything else is downstream of this.",
    modules: 12, live: 7,
    chips: ["Recognition by engine", "Entity understanding", "Category association"],
    detail: {
      modules: [
        { name: "Recognition by engine", question: "Which AI systems know the business exists, and which do not?", body: "Recognition is never uniform. A business can be well understood by one engine and structurally invisible to another that a different half of its buyers use.", live: true },
        { name: "Entity understanding", question: "Does AI understand what the business actually does?", body: "The distance between what a company says it is and what machines have independently concluded it is, usually wider than any executive expects.", live: true },
        { name: "Category association", question: "When a buyer describes a need, is the business in the set AI considers?", body: "Whether the business is filed under the categories buyers actually ask about, or under one that is accurate but that nobody searches.", live: true },
        { name: "Confusion detection", question: "Is AI confusing the business with someone else?", body: "Name collisions, merged records and mistaken identities, a single unresolved conflation can remove a business from every answer in its category.", live: true },
        { name: "Outdated knowledge", question: "Is AI describing a version of the business that no longer exists?", body: "Discontinued lines, closed locations, former ownership and superseded positioning still being repeated to buyers as current fact.", live: true },
        { name: "Source influence", question: "Which sources are shaping what AI believes about the business?", body: "The small set of pages that disproportionately determine every answer given, frequently including a directory nobody at the company knows exists.", live: true },
        { name: "Recognition decay", question: "Is the business becoming less recognised over time?", body: "Recognition erodes when competitors keep publishing and you stop. Decay is measurable for months before it shows up as absence.", live: true },
        { name: "Prompt coverage", question: "Across the questions buyers actually ask, how often does the business appear at all?", body: "Coverage measured against real buying questions rather than keywords, the difference between being findable and being present.", live: false },
        { name: "Missed prompts", question: "Which specific buying questions complete without the business ever being named?", body: "The exact questions where a decision was made and the business was not in the room. These are not lost leads; no lead was ever created.", live: false },
        { name: "Citations", question: "When AI cites a source to justify an answer, is any of it yours?", body: "Being mentioned and being cited are different commercial positions. Only one of them survives into the next answer the system gives.", live: false },
        { name: "Recommendation share", question: "Of all the recommendations made in this category, what share names the business?", body: "A market-share figure for a market nobody is currently measuring, recommendations issued, not clicks received.", live: false },
        { name: "Decision stage", question: "At which point in the buying journey does presence collapse?", body: "Losses concentrate at one stage rather than spreading evenly. Locating that stage tells you where intervention returns, and where it returns nothing.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "AI Recognition Scan", question: "Do AI engines understand who the business is and what it offers?", scope: "6 AI engines · entity and category association · 1 market", delivery: "After scan completion, typically under 20 minutes" },
        { tier: "Snapshot", name: "AI Search Presence Scan", question: "Is the business visible when customers ask for recommendations?", scope: "6 AI engines · 24 decision questions · 5 decision stages", delivery: "After scan completion, typically under 30 minutes" },
        { tier: "Advanced", name: "Decision Journey Diagnostic", question: "Where does the business disappear during the buyer decision process?", scope: "6 AI engines · 24 questions · 5 stages · 4 competitors", delivery: "After scan completion, typically under 60 minutes" },
      ],
      engines: [
        { name: "AI Recognition Intelligence", question: "Do AI engines understand who the business is and when it should be considered?", built: true, href: "/en/engines/ai-recognition" },
        { name: "AI Search Presence", question: "Is the business present when customers ask AI whom to choose?", built: false },
      ],
    },
  },
  {
    slug: "search-intelligence",
    name: "Search Intelligence",
    short: "Search",
    question: "Do the two discovery surfaces agree, and what is the gap costing?",
    body: "Traditional search and AI-mediated discovery are separate commercial assets that fail independently. This category measures each, classifies every gap between them, and prices what closing the gap is worth.",
    modules: 12, live: 0,
    chips: ["Google position", "AI recommendation presence", "Gap classification"],
    detail: {
      modules: [
        { name: "Google position", question: "Where does the business actually rank for the keywords that drive a buying decision?", body: "Position tracked against real commercial keywords, not vanity terms nobody searches when they are close to choosing.", live: false },
        { name: "AI recommendation presence", question: "When AI engines answer the same buying questions, is the business named?", body: "The second discovery surface, measured on its own terms rather than assumed to follow wherever Google leads.", live: false },
        { name: "Gap classification", question: "Where the two surfaces disagree, what kind of gap is it?", body: "A structural gap and a recoverable one look identical from the outside. Only one of them is worth spending on.", live: false },
        { name: "Recoverable search value", question: "Of the visibility currently being lost, how much can realistically be won back?", body: "Not every gap closes with effort. This separates the ones that will from the ones that will not, before budget is committed.", live: false },
        { name: "Paid dependency", question: "How much of current visibility is rented rather than owned?", body: "Visibility that disappears the moment spend stops is a different asset, and a different risk, from visibility that compounds.", live: false },
        { name: "Featured result capture", question: "When Google surfaces an AI Overview or featured snippet, does it draw from the business?", body: "The position above position one, increasingly where the decision is actually made before a click ever happens.", live: false },
        { name: "Branded vs non-branded split", question: "Is visibility coming from people who already know the name, or from people discovering it?", body: "A business that only ranks on its own name is not being found, it is being confirmed. The two require completely different work.", live: false },
        { name: "Local presence", question: "Where the decision is local, does the business appear in the map pack and in local AI answers?", body: "Local buying questions resolve differently to global ones, and are measured separately here rather than assumed to follow the same pattern.", live: false },
        { name: "Query intent alignment", question: "Is the business ranking for the questions buyers actually ask, or for adjacent terms that never convert?", body: "Rank tracking without intent classification counts a lot of irrelevant wins.", live: false },
        { name: "SERP volatility", question: "How stable is the current position, and is it trending up or down?", body: "A ranking captured once tells you where things stand. Tracked over time it tells you whether to act now or later.", live: false },
        { name: "Conversational coverage", question: "When a buying question is asked conversationally rather than as a keyword, does the business still surface?", body: "Search behaviour is shifting toward full questions. Keyword-shaped visibility does not automatically transfer.", live: false },
        { name: "Cross-surface consistency", question: "Does the business say the same thing about itself on indexed pages as AI engines have learned from elsewhere?", body: "Disagreement between what a business publishes and what machines have concluded independently erodes both surfaces at once.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "Search Visibility Scan", question: "Where does the business actually stand across Google and AI search for its core buying keywords?", scope: "Google + 6 AI engines · 20 keywords · gap classification", delivery: "After scan completion, typically under 30 minutes" },
        { tier: "Advanced", name: "Search Gap Diagnostic", question: "Which specific gaps between Google and AI are costing the most, and which are recoverable?", scope: "Google + 6 AI engines · 20 keywords · recoverable-value modelling", delivery: "After scan completion, typically under 60 minutes" },
      ],
      engines: [
        { name: "AI Search Presence", question: "Is the business present when customers ask AI whom to choose?", built: false },
        { name: "Search Economics", question: "When does paid search become structurally inefficient?", built: false },
      ],
    },
  },
  {
    slug: "competitive-intelligence",
    name: "Competitive Intelligence",
    short: "Competitive",
    question: "Who receives the decision instead, and what do they have?",
    body: "Not who ranks above you, who gets recommended when a buyer asks a machine whom to choose. The useful output is never the share figure; it is the specific evidence a competitor supplies that you do not.",
    modules: 7, live: 7,
    chips: ["Recommendation share", "Winning prompts", "Decision-stage control"],
    detail: {
      modules: [
        { name: "Recommendation share", question: "Who is being recommended instead of the business, and how often?", body: "Share of decisions rather than share of traffic, measured where the choice is actually made rather than where it is later recorded.", live: true },
        { name: "Winning prompts", question: "Which specific questions does each competitor own?", body: "The named questions a rival wins every time, which is what converts a vague sense of losing into a finite list of things to go and fix.", live: true },
        { name: "Decision-stage control", question: "At which stage does each competitor take control?", body: "Some rivals win early by shaping the criteria; others win late at vendor selection. The counter-move is completely different for each.", live: true },
        { name: "Authority drivers", question: "What specifically makes a competitor recommendable?", body: "The individual assets a machine reaches for when it justifies choosing them: publications, comparisons, specifications, verified outcomes.", live: true },
        { name: "Source advantage", question: "How much more evidence supports them than supports us?", body: "A countable ratio of independent sources, which turns an abstract brand gap into a publishing programme with a known scope and cost.", live: true },
        { name: "Narrative control", question: "Whose framing do machines use when they explain the category?", body: "Whether buyers are evaluating against criteria a competitor published, which quietly decides the outcome before anyone is compared.", live: true },
        { name: "Vulnerability", question: "Where is the leading competitor actually weak?", body: "The questions a dominant rival does not answer, does not cover, or answers badly, the cheapest available places to take share.", live: true },
      ],
      offers: [
        { tier: "Snapshot", name: "Competitor Recommendation Scan", question: "Who is recommended instead, where and why?", scope: "6 AI engines · 24 decision questions · 4 competitors", delivery: "After scan completion, typically under 30 minutes" },
        { tier: "Strategic", name: "Competitive Position Assessment", question: "Why do competitors capture the decision?", scope: "6 AI engines · 24 questions · 4 competitors · citation analysis", delivery: "After scan completion, typically under 60 minutes" },
      ],
      engines: [
        { name: "Competitor Decision Intelligence", question: "Where do competitors receive the decision before the business receives the lead?", built: true, href: "/en/engines/competitor-decision" },
      ],
    },
  },
  {
    slug: "trust-intelligence",
    name: "Trust Intelligence",
    short: "Trust",
    question: "Is the business safe to recommend?",
    body: "Visibility creates attention; trust creates selection. A business can be perfectly visible and still be filtered out at the moment a system has to stand behind naming it first.",
    modules: 4, live: 0,
    chips: ["Independent validation", "Source authority", "Reputation consistency"],
    detail: {
      modules: [
        { name: "Independent validation", question: "Does evidence outside the business's own channels support what it claims about itself?", body: "Claims made by a business about itself carry less weight, to a machine or a buyer, than the same claim made by someone else.", live: false },
        { name: "Source authority", question: "How much of what AI and Google know about the business comes from sources they treat as credible?", body: "The same fact, published by a trusted source versus an unknown one, does not carry the same weight into an answer.", live: false },
        { name: "Reputation consistency", question: "Does the picture of the business agree across review platforms, press and AI-held knowledge, or does it fracture?", body: "A system faced with conflicting signals about the same business tends to hedge, or say nothing at all.", live: false },
        { name: "Risk signals", question: "Are there unresolved complaints, disputes or negative signals a system would weigh before recommending the business first?", body: "Visibility gets a business considered. Unresolved risk signals are frequently what gets it filtered back out.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "Trust and Authority Scan", question: "Is the business currently in a state a system is willing to recommend from?", scope: "6 AI engines · review and press source audit · reputation consistency check", delivery: "After scan completion, typically under 30 minutes" },
      ],
      engines: [
        { name: "Trust and Authority Diagnostics", question: "Is the business visible but still unsafe to recommend?", built: false },
      ],
    },
  },
  {
    slug: "content-intelligence",
    name: "Content Intelligence",
    short: "Content",
    question: "Whose language does the market use to describe your category?",
    body: "Whoever defines a category sets the criteria buyers evaluate against. This category measures how much of that definition you own, where it is fragile, and which of your genuine advantages the market never hears.",
    modules: 5, live: 0,
    chips: ["Narrative ownership", "Category definition", "Fragility"],
    detail: {
      modules: [
        { name: "Narrative ownership", question: "When AI explains what this category is, whose framing does it repeat?", body: "Category explanations get generated from somewhere. Usually from whoever published the clearest version first.", live: false },
        { name: "Category definition", question: "Are the criteria buyers evaluate against the ones the business actually wins on?", body: "A business can be excellent by its own criteria and invisible by the market's, if it never contested which criteria apply.", live: false },
        { name: "Fragility", question: "How dependent is the current narrative on a small number of sources that could change or disappear?", body: "A category definition resting on two or three pages is one content refresh away from shifting underneath the business.", live: false },
        { name: "Message gaps", question: "Which genuine advantages does the business have that never make it into how the market describes the category?", body: "Real differentiators that were never published do not exist as far as a machine forming an answer is concerned.", live: false },
        { name: "Content coverage", question: "Across the questions that shape the category narrative, how much of the answer space does the business's own content occupy?", body: "Coverage measured against the actual questions the narrative gets built from, not against a generic content calendar.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "Narrative Ownership Scan", question: "Whose language is defining the category, and where is the business's own story missing from it?", scope: "6 AI engines · category-definition audit · message-gap analysis", delivery: "After scan completion, typically under 30 minutes" },
      ],
      engines: [
        { name: "Narrative Intelligence", question: "When the market explains the category, whose language does it use?", built: false },
      ],
    },
  },
  {
    slug: "market-intelligence",
    name: "Market Intelligence",
    short: "Market",
    question: "Is the market ready, and does the route to it hold?",
    body: "Timing, geography and distribution, the three conditions that decide whether a correct strategy executed today returns more than the same strategy executed in a year.",
    modules: 12, live: 0,
    chips: ["Demand maturation", "Buyer education", "Competitive density"],
    detail: {
      modules: [
        { name: "Demand maturation", question: "Is buyer demand in this category still forming, accelerating, or already saturated?", body: "The same strategy executed at each of these three stages returns a completely different result.", live: false },
        { name: "Buyer education", question: "Do buyers already understand the category, or does the business still have to teach the need before it can sell the answer?", body: "A market that hasn't been educated yet is not a slow market, it is a different, earlier job.", live: false },
        { name: "Competitive density", question: "How many credible alternatives is a buyer weighing before this business is even considered?", body: "Density changes what wins. In a crowded field, being correct is not enough; being first-considered is.", live: false },
        { name: "Window timing", question: "Is there a specific period in which entering or expanding returns more than acting a year from now?", body: "Timing windows close. Entering correctly a year late frequently returns less than entering imperfectly on time.", live: false },
        { name: "Distribution power", question: "Does the current route to market strengthen the business's own brand, or transfer the relationship to an intermediary?", body: "Every channel that sits between the business and the buyer takes something, usually the relationship, sometimes the margin.", live: false },
        { name: "Channel dependency", question: "How much of current demand runs through a small number of channels the business does not control?", body: "Concentration risk in distribution behaves exactly like concentration risk anywhere else, quietly until the channel changes its terms.", live: false },
        { name: "Geographic spread", question: "Where is demand concentrated, and where is the business investing attention that demand doesn't support?", body: "Effort and demand frequently point in different directions; this is where that gap gets measured, not assumed.", live: false },
        { name: "Market entry readiness", question: "Before expanding into a new market, does the evidence say the category, language and buyer behaviour are ready for it?", body: "Readiness assessed against evidence from the target market, not extrapolated from performance in the market the business already knows.", live: false },
        { name: "Cross-market consistency", question: "Does the business appear the same way across countries and languages, or does the picture fragment at the border?", body: "A business that is well understood at home and unrecognisable abroad has an expansion problem, not just a translation one.", live: false },
        { name: "Saturation signal", question: "Is competitive density in this market still rising, or has it plateaued?", body: "The direction of travel matters as much as the current level, it determines whether the window is opening or closing.", live: false },
        { name: "Localization gap", question: "Where language or cultural context is missing, is the business being filtered out before it is even evaluated?", body: "Some losses happen at consideration, not comparison, the business was never in the set to begin with.", live: false },
        { name: "Expansion sequencing", question: "If multiple markets are candidates for expansion, which one returns first?", body: "A ranked sequence built from readiness and window timing, rather than from which market feels most familiar.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "Market Readiness Scan", question: "Is this market ready for the business to enter or expand now, or is the window still forming?", scope: "6 AI engines · demand maturation · competitive density · 1 market", delivery: "After scan completion, typically under 30 minutes" },
        { tier: "Strategic", name: "Expansion Sequencing Assessment", question: "Across multiple candidate markets, which should the business enter first, and in what order?", scope: "6 AI engines · up to 4 candidate markets · distribution and localization audit", delivery: "After scan completion, typically under 60 minutes" },
      ],
      engines: [
        { name: "Strategic Timing Intelligence", question: "Is the market ready, and how long is the window open?", built: false },
        { name: "Distribution Intelligence", question: "Does the route to market strengthen the brand or transfer power to intermediaries?", built: false },
        { name: "Global Market Intelligence", question: "How does the business change across countries, languages and markets?", built: false },
      ],
    },
  },
  {
    slug: "executive-intelligence",
    name: "Executive Intelligence",
    short: "Executive",
    question: "What is it worth, and what happens next?",
    body: "Where diagnosis becomes a decision. Every gap is priced as a directional range, ranked against every other gap, assigned an owner and a deadline, and then measured after execution to confirm the signal moved.",
    modules: 9, live: 4,
    chips: ["Action Center", "Priority Queue", "30/60/90-Day Roadmap"],
    detail: {
      modules: [
        { name: "Action Center", question: "What should the business do, in what order?", body: "Every finding converted into an intervention with an owner, a deadline and a stated expected movement, or dropped, if it cannot be.", live: true },
        { name: "Priority Queue", question: "Which intervention returns most, and what is currently blocked?", body: "Ranking by exposure, confidence, effort and dependency, so effort does not go into work that cannot move until something else lands.", live: true },
        { name: "30/60/90-Day Roadmap", question: "What lands this month, this quarter, and this year?", body: "A sequence built from what each intervention actually depends on, rather than from a calendar someone divided into thirds.", live: true },
        { name: "Impact Tracker", question: "Did the work move the signal it was supposed to move?", body: "Measured change against the predicted change, including the interventions that did not work, which is the only way the model earns trust.", live: true },
        { name: "Decision volume", question: "How many buying decisions are actually in play?", body: "The size of the decision market itself, counted in decisions rather than in searches, sessions or impressions.", live: false },
        { name: "Deal value", question: "What is one of those decisions worth to the business?", body: "Value per decision by stage and question type, so a high-volume gap is not automatically ranked above a low-volume, high-value one.", live: false },
        { name: "Conversion assumptions", question: "What has to be true for this estimate to hold?", body: "Every assumption behind an exposure figure, stated and editable, because a number whose assumptions are hidden cannot be argued with or trusted.", live: false },
        { name: "Time to impact", question: "How long before an intervention shows up in the numbers?", body: "The lag between doing the work and seeing the movement, which is what stops a working programme from being cancelled a month too early.", live: false },
        { name: "Opportunity range", question: "What is the gap worth, and how confident can we be?", body: "A directional range with its confidence stated, never a single confident figure, and never described as confirmed lost revenue.", live: false },
      ],
      offers: [
        { tier: "Executive", name: "Executive Intelligence Brief", question: "What is the complete management position on risk, opportunity, timing and action?", scope: "6 AI engines · 24 questions · 20 keywords · 4 competitors · full GEON assessment", delivery: "Expert-reviewed, within 3 business days" },
      ],
      engines: [
        { name: "Action Intelligence", question: "What must happen next, by whom and by when?", built: true, href: "/en/engines/action" },
        { name: "Opportunity and Revenue Intelligence", question: "Which gap is commercially meaningful enough to fix first?", built: false },
      ],
    },
  },
];

export const CATEGORY_ROUTES = new Set([
  "ai-visibility-intelligence",
  "search-intelligence",
  "competitive-intelligence",
  "trust-intelligence",
  "content-intelligence",
  "market-intelligence",
  "executive-intelligence",
]);

/* ============================================================================
   Hebrew locale pack

   Full parallel objects, index-aligned to the English consts above. Slugs,
   hrefs, `live`/`built` flags, `modules`/`live` counts and offer `tier`
   values (used as CSS class names, e.g. `cat-offer--${tier.toLowerCase()}`)
   are intentionally identical to the English data; only human-readable
   prose is translated. Consumers keep importing `howItWorks` / `methodology`
   / `marketplace` / `categories` for English; page components call the
   locale-aware getters below (same `packs` / `normalizeLocale` / `?? en`
   pattern as lib/warRoom.ts and lib/subpages/briefing.ts).
   ========================================================================= */

const howItWorksHe: typeof howItWorks = {
  eyebrow: "הלולאה הסגורה של GeoRepute",
  title: "ממודיעין לביצוע. ומביצוע בחזרה למודיעין.",
  lead: "GeoRepute לא רק מנתחת מה קורה. היא מבינה למה זה קורה, מחליטה מה צריך להשתנות, מבצעת את האסטרטגיה, מודדת מה השתנה, ומשתמשת בתוצאה כדי להחליט מה קורה הלאה.",
  disconnected: {
    eyebrow: "המודל המנותק",
    title: "רוב העסקים פועלים דרך מערכות מנותקות.",
    pieces: [
      "פלטפורמה אחת מודדת את Google.",
      "פלטפורמה אחרת עוקבת אחר בינה מלאכותית.",
      "פלטפורמה נוספת מנתחת מתחרים.",
      "מישהו בונה את האסטרטגיה.",
      "מישהו אחר יוצר את התוכן.",
      "מערכת נוספת מפיצה אותו.",
      "אנליטיקה מודדת מה קרה אחר כך.",
    ],
    body: "מערכות שונות. צוותים שונים. מערכי נתונים שונים. מטרות שונות. ולעיתים קרובות אין שום קשר ישיר בין האבחון המקורי לתוצאה הסופית.",
    fragmented: ["מחקר", "אסטרטגיה", "סוכנות", "תוכן", "הפצה", "אנליטיקה", "ישיבה", "אסטרטגיה חדשה"],
    connected: ["מודיעין", "החלטה", "ביצוע", "מדידה", "למידה", "תיקון"],
  },
  phases: [
    {
      key: "plan", n: "01", name: "תכנון",
      title: "להבין את המציאות לפני שמחליטים מה לעשות.",
      body: "כל מחזור מתחיל באבחון מעמיק. GeoRepute סורקת ומחברת מודיעין על העסק, המתחרים שלו, השוק שלו והסביבות הדיגיטליות שמשפיעות על החלטות הלקוחות.",
      listLabel: "המערכת מנתחת אותות על פני",
      list: ["מנועי בינה מלאכותית", "Google", "חיפוש", "מתחרים", "שוק", "נוכחות דיגיטלית", "סמכות", "אמון", "נרטיבים", "תוכן", "שאלות לקוחות", "מסעות ההחלטה", "מקורות דיגיטליים", "שפות", "נתוני עסק מחוברים"],
      question: "מה השוק באמת מבין על העסק שלכם?",
      determines: [
        "מה מנועי הבינה המלאכותית יודעים עליו",
        "מתי הבינה המלאכותית ממליצה עליו, ומתי לא",
        "מה Google מציג ברגעים הקריטיים",
        "אילו שאלות משפיעות על החלטת הרכישה",
        "אילו מתחרים מקבלים את ההחלטה במקום זאת",
        "היכן חסרים אמון וסמכות",
      ],
      contrast: ["מה נפרסם החודש?", "איזה אות מדיד אמור לזוז אם האסטרטגיה עובדת?"],
    },
    {
      key: "do", n: "02", name: "ביצוע",
      title: "לא ליצור את מה שהעסק רוצה להגיד. ליצור את מה שהלקוח צריך לפגוש.",
      body: "כאן המודיעין הופך לביצוע. GeoRepute לא מתחילה מלוח תוכן ריק. היא מתחילה מהפערים שהתגלו בשלב התכנון, ואז יוצרת את התוכן והמדיה הנדרשים ומפרסמת אותם על פני הנכסים הדיגיטליים המחוברים של העסק.",
      listLabel: "מתפרסם על פני נכסים דיגיטליים מחוברים",
      list: ["אתר האינטרנט", "פלטפורמות חברתיות", "מאמרים", "פרופילי עסק", "סביבות תוכן", "ערוצי פרסום מחוברים"],
      question: "מה הלקוח חייב לפגוש כדי להחליט אחרת?",
      determines: [
        "אילו שאלות צריך לענות עליהן",
        "אילו נרטיבים צריך ליצור, לחזק או לתקן",
        "אילו אותות אמון צריכים להתקיים",
        "איזה קהל צריך לפגוש בכך, ובאיזו שפה",
        "באיזה שלב במסע ההחלטה",
        "באיזה נכס דיגיטלי, ובאיזה רצף",
      ],
      contrast: ["התוכן הוא האסטרטגיה.", "התוכן הוא שכבת הביצוע של המודיעין."],
    },
    {
      key: "check", n: "03", name: "בדיקה",
      title: "לא למדוד מה פורסם. למדוד מה השתנה.",
      body: "פרסום הוא לא הצלחה. צפיות הן לא הצלחה. לאחר הביצוע, GeoRepute חוזרת לסביבה ומודדת אותה שוב, ובודקת האם האותות שהיו ממוקדים אכן זזו.",
      listLabel: "המערכת משווה",
      list: ["לפני", "פעולה", "אחרי"],
      question: "האם האותות שהפעולה נבנתה כדי להזיז אכן זזו?",
      determines: [
        "האם ההבנה של הבינה המלאכותית השתנתה?",
        "האם נוכחות ההמלצות עלתה?",
        "האם העסק נכנס להחלטות שבהן נעדר בעבר?",
        "האם הסמכות התחזקה והאמון השתפר?",
        "האם הפער התחרותי הצטמצם?",
        "האם אותו מתחרה עדיין מקבל את ההחלטה?",
      ],
      contrast: ["השלמת הפעולה.", "הזזת האות שהפעולה נוצרה כדי להזיז."],
    },
    {
      key: "act", n: "04", name: "פעולה",
      title: "התוצאה הופכת למודיעין עבור ההחלטה הבאה.",
      body: "השוק כבר השתנה, ולכן האסטרטגיה לא יכולה להישאר סטטית. GeoRepute מזינה את התוצאות החדשות בחזרה לשכבת המודיעין שלה. מה שעובד מתחזק. מה שלא זז משתנה. הזדמנויות חדשות נכנסות לתכנית.",
      listLabel: "GeoRepute יכולה להתאים",
      list: ["אסטרטגיה", "סדרי עדיפויות", "נרטיבים", "מסרים", "תוכן", "מדיה", "הפצה", "ערוצים", "תזמון", "אותות יעד", "הפעולות הבאות"],
      question: "מה צריך לקרות הלאה, ומדוע?",
      determines: ["מה עבד.", "מה לא עבד.", "מה זז.", "מה לא זז מספיק.", "מה המתחרים שינו.", "מה צריך לקרות הלאה."],
      contrast: ["אסטרטגיה שנבנתה פעם אחת.", "אסטרטגיה שמחליטה מחדש בכל מחזור."],
    },
  ],
  beforeAfter: [
    { signal: "זיהוי בינה מלאכותית", before: 38, after: 51, target: 55, unit: "" },
    { signal: "סמכות", before: 28, after: 39, target: 45, unit: "" },
    { signal: "נוכחות בהחלטה", before: 7, after: 14, target: 19, unit: "%" },
    { signal: "נתח המלצות", before: 4.2, after: 8.1, target: 11, unit: "%" },
    { signal: "בעלות נרטיבית", before: 12, after: 18, target: 24, unit: "%" },
  ],
  beforeAfterNote: "תנועה להמחשה על פני מחזור אחד. נתוני הדגמה, לא תוצאת לקוח.",
  loop: [
    { name: "הבנה", body: "אבחון מעמיק של העסק, השוק, המתחרים וסביבת קבלת ההחלטות." },
    { name: "החלטה", body: "הפיכת מודיעין לאסטרטגיה שמותאמת למטרות מוגדרות." },
    { name: "יצירה", body: "יצירת התוכן והמדיה שהאסטרטגיה דורשת." },
    { name: "הפצה", body: "פרסום על פני נכסים דיגיטליים וערוצים מחוברים." },
    { name: "מדידה", body: "סריקה מחדש של הסביבה ומדידת מה שבאמת השתנה." },
    { name: "למידה", body: "הבנת אילו פעולות הזיזו את האותות הממוקדים ואילו לא." },
    { name: "תיקון", body: "התאמת האסטרטגיה, התוכן, ההפצה וסדרי העדיפויות." },
  ],
  brain: {
    eyebrow: "לא עוד מנוע תוכן",
    title: "התוכן הוא תפוקה. המודיעין הוא המוח.",
    body: "GeoRepute לא נועדה לייצר עוד תוכן. היא נועדה לקבוע מה צריך להתקיים בשוק כדי להשפיע על ההחלטה הבאה.",
    sometimes: ["תוכן", "סמכות", "ראיות", "תיקון נרטיבי", "מענה לשאלות שלקוחות לא מצליחים לפתור", "חיזוק נכס דיגיטלי", "סגירת פער תחרותי"],
  },
  difference: [
    ["אנליטיקה", "אומרת לכם מה קרה."],
    ["מודיעין", "אומר לכם למה."],
    ["אסטרטגיה", "אומרת לכם מה צריך להשתנות."],
    ["ביצוע", "מבצע את השינוי."],
    ["מדידה", "אומרת לכם אם זה עבד."],
  ],
  living: {
    title: "מתמונת מצב לאסטרטגיה חיה.",
    body: "שווקים זזים. מתחרים זזים. שאלות הלקוחות משתנות. Google משתנה. מערכות בינה מלאכותית משתנות. אסטרטגיה שנבנתה פעם אחת לא יכולה להגיב ברציפות לשוק שלעולם לא מפסיק לזוז. GeoRepute הופכת את האסטרטגיה ממסמך סטטי למערכת חיה.",
    verbs: ["צופה", "מבינה", "מחליטה", "מבצעת", "מודדת", "לומדת", "מסתגלת"],
  },
  cta: {
    title: "צפו בלולאה הסגורה בפעולה.",
    body: "אל תסתפקו בעוד דשבורד. ראו איך GeoRepute עוברת ממודיעין לאסטרטגיה, מאסטרטגיה לביצוע, ומביצוע בחזרה למודיעין מדיד.",
  },
  ui: {
    heroAriaLabel: "תכנון, ביצוע, בדיקה, פעולה, לולאה רציפה אחת",
    repeatBadge: "חוזר",
    repeatNote: "התוצאה של מחזור אחד הופכת למודיעין של המחזור הבא.",
    crumb: "איך זה עובד",
    heroTitle: ["ממודיעין לביצוע.", "ומביצוע בחזרה למודיעין."],
    ctaDemo: "קבעו הדגמה חיה",
    ctaWalkLoop: "עברו על הלולאה",
    fragmentedLabel: "המודל המסורתי מפוצל",
    connectedLabel: "GeoRepute סוגרת את הפער",
    connectClaim: "GeoRepute מחברת את כל מחזור קבלת ההחלטות.",
    compareFoot: "אותו מודיעין שמזהה את הבעיה מנחה את האסטרטגיה. הביצוע נמדד מול המטרה המקורית. והתוצאה קובעת מה המערכת עושה הלאה.",
    pdca: "תכנון ← ביצוע ← בדיקה ← פעולה ← חזרה",
    questionLabel: "השאלה",
    baLabel: "לפני ← פעולה ← אחרי",
    baLegend: ["לפני", "אחרי", "יעד"],
    cycleLabel: "הלולאה הסגורה",
    cycleTitle: "מערכת אחת. מחזור למידה רציף אחד.",
    cycleBody: "כל מחזור הופך את המחזור הבא למיודע יותר.",
    cycleReturn: "תיקון חוזר ישירות אל הבנה.",
    diffLabel: "ההבדל",
    diffFoot: "GeoRepute מחברת בין כל חמשת השלבים, ומריצה את המחזור שוב.",
    livingLabel: "מתמונת מצב לאסטרטגיה חיה",
    ctaEyebrow: "צפו בזה בפעולה",
    ctaMissionControl: "פתחו את מרכז הבקרה",
  },
};

const methodologyHe: typeof methodology = {
  eyebrow: "מתודולוגיה",
  title: "ככל שהטענה חזקה יותר, כך מסלול הראיות שלה חייב להיות חזק יותר.",
  lead: "כל מסקנה במערכת הזו ניתנת למעקב עד לתאריך, מקור, מנוע, שאילתה או מערך נתונים מחובר. עמוד זה מסביר איך, והיכן נמצאים הגבולות.",
  version: "גרסת מתודולוגיה GEON-2.4 · נצפה ב-31.07.2026",
  vectors: [
    { name: "נראות", weight: 0.25, score: 34, body: "באיזו עקביות העסק מופיע במערכות בינה מלאכותית ובסביבות דיגיטליות." },
    { name: "סמכות", weight: 0.3, score: 28, body: "האם העסק מוכר כמומחה אמין או כמוביל בקטגוריה." },
    { name: "הקשר", weight: 0.1, score: 61, body: "האם המערכות מבינות מה העסק עושה, את מי הוא משרת ומתי להמליץ עליו." },
    { name: "אמון", weight: 0.2, score: 44, body: "עוצמת המוניטין, האימות וההוכחות סביב העסק." },
    { name: "עקביות", weight: 0.075, score: 57, body: "האם אותו סיפור מדויק מופיע בכל הערוצים, השווקים והשפות." },
    { name: "התאמה לשוק", weight: 0.075, score: 72, body: "עד כמה המיצוב תואם את הביקוש ואת כוונת הרכישה של הלקוחות." },
  ],
  evidence: [
    { name: "תשובות בינה מלאכותית פומביות", body: "תשובות שנצפו משישה מנועים מול מערך שאלות קבוע, מתועדות עם מנוע, תאריך ותשובה מלאה." },
    { name: "נתוני חיפוש ושוק מצד שלישי", body: "נפח מילות מפתח, מיקום אורגני, תחרות ועלות לקליק." },
    { name: "אנליטיקה מחוברת מהצד הראשון", body: "Search Console ו-Analytics, כאשר הלקוח מחבר אותם. משפר את רמת הביטחון; אף פעם לא נדרש." },
    { name: "מידע פומבי על מתחרים", body: "עמדות שפורסמו, ציטוטים והמקורות שהמנועים פונים אליהם כשהם ממליצים על מתחרה." },
    { name: "תוכן פומבי, מוניטין ואותות אמון", body: "אימות בלתי תלוי, מאגרי ביקורות ועקביות בין מקורות." },
    { name: "הנחות עסקיות שהוגדרו על ידי הלקוח", body: "ערך עסקה ממוצע, שיעורי המרה וחלוקת הכנסות לפי שלב ההחלטה. תמיד מסומן כנתון שסופק על ידי הלקוח." },
    { name: "סריקות היסטוריות של GeoRepute ותוצאות פעולה", body: "תצפיות קודמות והאם פעולה שבוצעה הזיזה את האות שאליו כוונה." },
  ],
  financial: {
    formula: ["ביקוש", "פער החלטה", "המרה משוערת", "ערך עסקה ממוצע"],
    rules: [
      "כל הערכים מוצגים כטווחים, לעולם לא כאומדן נקודתי.",
      "אף ערך לא מתואר כהכנסה אבודה מאושרת.",
      "כל מודל חושף את ההנחות וגבולות הנתונים שלו.",
      "נתוני המרה מחוברים מהצד הראשון משפרים את רמת הביטחון.",
      "תחזית נמנעת כאשר ההיסטוריה אינה מספקת.",
      "כל תדריך שמיוצא נושא ניסוח מתודולוגיה ומגבלות.",
    ],
    economics: [
      ["עלות לקליק ממוצעת משוקללת", "$8.42"],
      ["עלות לקליק לאיזון", "$6.13"],
      ["מעל נקודת האיזון", "16 מתוך 20"],
    ],
    economicsNote: "נקודת האיזון היא ערך הזמנה ממוצע × רווח גולמי × שיעור המרה באתר. תלות בתשלום מסווגת מיחס עלות הקליק המשוקללת לנקודת האיזון, היא נגזרת, ולעולם לא נטענת כעובדה.",
  },
  limitations: [
    "תשובות מנועי הבינה המלאכותית משתנות בין הרצות ובין משתמשים. התצפיות הן דגימות נקודתיות בזמן, לא הבטחה למה שקונה מסוים רואה בפועל.",
    "חשיפה מסחרית היא מודל כיווני שנבנה על הנחות שהוגדרו על ידי הלקוח. הוא שימושי לתעדוף ואינו דוח כספי מבוקר.",
    "הקשר בין פעולה שבוצעה לתנועת אות הוא קורלטיבי. המערכת מתעדת את שניהם ומדווחת על הקשר ביניהם; היא אינה טוענת לסיבתיות.",
    "ספירת הסמכות של המתחרים משקפת מקורות שהמנועים מצטטים בפומבי. למתחרה עשויים להיות יתרונות פרטיים שהמערכת אינה יכולה לצפות בהם.",
    "כאשר ההיסטוריה אינה מספקת, מסקנות חזויות נמנעות במקום להיאמד.",
  ],
  ui: {
    crumb: "מתודולוגיה",
    heroTitle: ["ככל שהטענה חזקה יותר,", "כך מסלול הראיות שלה חייב להיות חזק יותר."],
    toc: ["מסגרת GEON", "מהיכן מגיעות התצפיות", "רמת ביטחון", "מודל פיננסי", "מגבלות"],
    traceLabels: ["תאריך", "מקור", "מנוע", "שאילתה", "מערך נתונים"],
    sec1Label: "מסגרת GEON",
    sec1Title: "שישה וקטורים, משקל אחד מפורסם.",
    sec1Body: "מדד בריאות ההחלטה (DHI) הוא פונקציה משוקללת של שישה הווקטורים הללו, לא ציון שנקבע לפי שיקול דעת. המשקלול מפורסם כדי שהמדד יוכל להיות מחושב מחדש באופן עצמאי. הזיזו כל וקטור כדי לראות איך.",
    weightsAria: "משקלי הווקטורים המפורסמים",
    sec1Note: "הערכים שנצפו מגיעים מסביבת ההדגמה (Ironvale Supply). המשקלים הם משקלי GEON-2.4 המפורסמים.",
    sec2Label: "ראיות",
    sec2Title: "מהיכן מגיעות התצפיות.",
    sec3Label: "רמת ביטחון",
    sec3Title: "לכל מסקנה יש רמת ביטחון משלה.",
    sec3Body: "רמת הביטחון מיוחסת למסקנה הבודדת, לא למוצר. שני ממצאים באותה תוצאה יכולים לשאת רמות ביטחון שונות, ולעיתים קרובות כך קורה.",
    sec4Label: "מודל פיננסי",
    sec4Title: "כיווני, בטווחים, ולעולם לא מתואר כמאושר.",
    economicsLabel: "כלכלת חיפוש, נגזרת",
    breakEvenLabel: "נקודת איזון",
    blendedLabel: "ממוצע משוקלל",
    sec5Label: "מגבלות",
    sec5Title: "מה המערכת הזו לא יכולה לספר לכם.",
    btnMissionControl: "פתחו את מרכז הבקרה",
    btnEngines: "ראו את המנועים",
    ctaEyebrow: "בדקו זאת בעצמכם",
    ctaTitle: "כל מספר באתר הזה פותח את הראיות שמאחוריו.",
    ctaBody: "התחילו מהחלטה ועקבו אחר כל נתון בחזרה למנוע, לשאלה ולתאריך שבו הוא נצפה.",
    btnReconstruct: "שחזרו החלטה",
  },
};

const marketplaceHe: typeof marketplace = {
  eyebrow: "אקוסיסטם המודיעין",
  title: "תהיה השאלה העסקית אשר תהיה, כבר קיים מודיעין שנבנה בשבילה.",
  lead: "שבע קטגוריות של מודיעין החלטות, כל אחת מחזיקה את המודלים שעונים על סוג אחד של שאלה מסחרית. רוב חלקן מודדות דברים שעסק מעולם לא היה מסוגל לראות.",
  stats: [
    { value: 7, label: "קטגוריות מודיעין" },
    { value: 61, label: "מודולי מודיעין" },
    { value: 12, label: "מנועים מתחתיהן" },
  ],
  triad: [
    { name: "ראיות", body: "כל טענה נושאת את התצפית שמאחוריה: איזה מנוע, איזו שאלה, איזה תאריך. מסקנה שאי אפשר לבקר היא סתם דעה." },
    { name: "ניתוח", body: "מה הראיות אומרות מבחינה מסחרית, מה גורם להן, ועד כמה המודל יכול להיות בטוח באמת. המגבלות מוצהרות, לעולם לא רק מרומזות." },
    { name: "המלצה", body: "מה לעשות, מי אחראי, עד מתי, ואיזה אות אמור לזוז כתוצאה מכך. מאומת בדיעבד מול מה שבאמת זז." },
  ],
  ui: {
    crumb: "שוק המודיעין",
    heroTitle: ["תהיה השאלה העסקית אשר תהיה,", "כבר קיים מודיעין שנבנה בשבילה."],
    ctaStart: "התחילו מהשאלה שלכם",
    ctaHow: "איך המודלים עובדים",
    sec1Label: "שבע קטגוריות",
    sec1Title: "התחילו מהשאלה שבאמת יש לכם.",
    sec1Body: "כל קטגוריה נפתחת אל המודולים שמתחתיה. כל מודול עונה על שאלה עסקית אחת ומחזיר ראיות, ניתוח והמלצה, לעולם לא מספר בפני עצמו.",
    modulesWord: "מודולים",
    liveInDemo: "פעיל בהדגמה",
    inPlatform: "בפלטפורמה",
    explore: "גלו עוד",
    availableInPlatform: "זמין בפלטפורמה",
    sec2Label: "מה אתם קונים",
    sec2TitleLead: "המסמך הוא התפוקה.",
    sec2TitleEm: "המודיעין הוא המוצר.",
    ctaEyebrow: "צפו בזה בפעולה",
    ctaTitle: "צפו במודול עונה על שאלה בזמן אמת.",
    ctaSeeModule: "צפו במודול רץ בזמן אמת",
    ctaMonitor: "או עקבו באופן רציף",
    ringLabel: (total: number, live: number, categoriesCount: number) =>
      `${categoriesCount} קטגוריות מודיעין, ${total} מודולים, ${live} פעילים בהדגמה זו`,
    catCtaBuy: "רכשו את המודיעין הזה",
    catCtaBrowse: "עיינו במודולים",
    catSec1Title: "כל מודול עונה על שאלה אחת.",
    catSec1Body: "כל מודול מחזיר את הראיות שמאחורי התשובה שלו, מה התשובה אומרת מבחינה מסחרית, ומה צריך להשתנות כתוצאה מכך.",
    catSec2Label: "רכשו את המודיעין הזה",
    catSec2Title: "קחו שאלה אחת, או את כל הקטגוריה.",
    catSec2Body: "כל רכישה מציינת מה היא בודקת, מה היא צריכה מכם, עד כמה היא יכולה להיות בטוחה וכיצד היא נמסרת. אין צורך בשיחת מכירה כדי לברר את זה.",
    deliveryLabel: "אספקה",
    startPrefix: "התחילו",
    catSec3Label: "מתחת לפני השטח",
    catSec3TitleOne: "מנוע אחד מפיק את הקטגוריה הזו.",
    catSec3TitleMany: (n: number) => `${n} מנועים מפיקים את הקטגוריה הזו.`,
    catSec3Body: "המנועים הם המכונות, לא ההצעה. שום דבר למעלה לא דרש מכם לדעת שהם קיימים.",
    builtPill: "פעיל",
    openEngine: "פתחו את המנוע",
    inPlatformPill: "בפלטפורמה",
    otherCategories: "קטגוריות מודיעין נוספות",
    allCategories: "כל הקטגוריות",
    catCtaEyebrow: "לא בטוחים מאיפה להתחיל",
    catCtaTitle: "התחילו מהחלטה, ואז פתחו את המודיעין שמאחוריה.",
    catCtaStart: "התחילו ניתוח",
    catCtaReconstruct: "שחזרו החלטה",
    enginesUnderneath: (n: number) => (n === 1 ? "מנוע אחד מתחת לפני השטח" : `${n} מנועים מתחת לפני השטח`),
    liveInDemoCount: (n: number) => `${n} פעיל בהדגמה`,
    inPlatformCount: (n: number) => `${n} בפלטפורמה`,
  },
};

const categoriesHe: Category[] = [
  {
    slug: "ai-visibility-intelligence",
    name: "מודיעין נראות בבינה מלאכותית",
    short: "נראות בינה מלאכותית",
    question: "האם הבינה המלאכותית יודעת שהעסק קיים, ומה היא חושבת שהוא?",
    body: "האם למערכות הבינה המלאכותית יש רשומה מדויקת, עדכנית וחד-משמעית של העסק, והאם הרשומה הזו שורדת אל תוך התשובות שהקונים מקבלים. כל השאר נגזר מכך.",
    modules: 12, live: 7,
    chips: ["זיהוי לפי מנוע", "הבנת הישות", "שיוך קטגוריה"],
    detail: {
      modules: [
        { name: "זיהוי לפי מנוע", question: "אילו מערכות בינה מלאכותית יודעות שהעסק קיים, ואילו לא?", body: "הזיהוי אף פעם לא אחיד. עסק יכול להיות מובן היטב על ידי מנוע אחד ובלתי נראה באופן מבני עבור מנוע אחר שבו משתמש חצי אחר של הקונים שלו.", live: true },
        { name: "הבנת הישות", question: "האם הבינה המלאכותית מבינה מה העסק באמת עושה?", body: "המרחק בין מה שחברה אומרת שהיא לבין מה שמכונות הסיקו באופן עצמאי שהיא, בדרך כלל רחב יותר ממה שכל מנהל מצפה לו.", live: true },
        { name: "שיוך קטגוריה", question: "כשקונה מתאר צורך, האם העסק נמצא בקבוצה שהבינה המלאכותית שוקלת?", body: "האם העסק מסווג תחת הקטגוריות שקונים באמת שואלים עליהן, או תחת קטגוריה שמדויקת אך איש אינו מחפש אותה.", live: true },
        { name: "זיהוי בלבול", question: "האם הבינה המלאכותית מבלבלת בין העסק לבין מישהו אחר?", body: "התנגשויות שמות, רשומות ממוזגות וזהויות מוטעות, בלבול אחד שלא נפתר יכול להסיר עסק מכל תשובה בקטגוריה שלו.", live: true },
        { name: "ידע מיושן", question: "האם הבינה המלאכותית מתארת גרסה של העסק שכבר לא קיימת?", body: "קווי מוצרים שהופסקו, סניפים שנסגרו, בעלות קודמת ומיצוב מיושן, ממשיכים להיות מוצגים לקונים כעובדה נוכחית.", live: true },
        { name: "השפעת מקורות", question: "אילו מקורות מעצבים את מה שהבינה המלאכותית מאמינה לגבי העסק?", body: "קבוצה קטנה של דפים שקובעת באופן לא פרופורציונלי כל תשובה שניתנת, לעיתים קרובות כולל מדריך עסקים שאיש בחברה לא יודע שקיים.", live: true },
        { name: "התדרדרות זיהוי", question: "האם העסק הופך פחות מזוהה עם הזמן?", body: "הזיהוי נשחק כאשר מתחרים ממשיכים לפרסם ואתם מפסיקים. ההתדרדרות מדידה חודשים לפני שהיא מתבטאת כהיעדרות.", live: true },
        { name: "כיסוי שאילתות", question: "מתוך השאלות שקונים באמת שואלים, באיזו תדירות העסק מופיע בכלל?", body: "כיסוי שנמדד מול שאלות רכישה אמיתיות ולא מילות מפתח, ההבדל בין להיות ניתן לאיתור לבין להיות נוכח.", live: false },
        { name: "שאילתות שהוחמצו", question: "אילו שאלות רכישה ספציפיות מסתיימות מבלי שהעסק אי פעם נזכר בשם?", body: "השאלות המדויקות שבהן התקבלה החלטה והעסק לא היה בחדר. אלו אינם לידים שאבדו; אף ליד לא נוצר מלכתחילה.", live: false },
        { name: "ציטוטים", question: "כשהבינה המלאכותית מצטטת מקור כדי להצדיק תשובה, האם משהו מזה שלכם?", body: "להיות מוזכרים ולהיות מצוטטים הם עמדות מסחריות שונות. רק אחת מהן שורדת אל התשובה הבאה שהמערכת נותנת.", live: false },
        { name: "נתח המלצות", question: "מתוך כל ההמלצות שניתנו בקטגוריה הזו, איזה נתח מזכיר את העסק בשם?", body: "נתון נתח שוק עבור שוק שאיש כרגע לא מודד, המלצות שניתנו, לא קליקים שהתקבלו.", live: false },
        { name: "שלב ההחלטה", question: "באיזו נקודה במסע הרכישה הנוכחות קורסת?", body: "האובדן מתרכז בשלב אחד ולא מתפזר באופן שווה. איתור השלב הזה מראה לכם היכן ההתערבות משתלמת, והיכן היא לא מניבה דבר.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "סריקת זיהוי בינה מלאכותית", question: "האם מנועי הבינה המלאכותית מבינים מי העסק ומה הוא מציע?", scope: "6 מנועי בינה מלאכותית · שיוך ישות וקטגוריה · שוק אחד", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-20 דקות" },
        { tier: "Snapshot", name: "סריקת נוכחות בחיפוש בינה מלאכותית", question: "האם העסק נראה כשלקוחות מבקשים המלצות?", scope: "6 מנועי בינה מלאכותית · 24 שאלות החלטה · 5 שלבי החלטה", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-30 דקות" },
        { tier: "Advanced", name: "אבחון מסע ההחלטה", question: "היכן העסק נעלם במהלך תהליך ההחלטה של הקונה?", scope: "6 מנועי בינה מלאכותית · 24 שאלות · 5 שלבים · 4 מתחרים", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות משעה" },
      ],
      engines: [
        { name: "מודיעין זיהוי בינה מלאכותית", question: "האם מנועי הבינה המלאכותית מבינים מי העסק ומתי יש לשקול אותו?", built: true, href: "/en/engines/ai-recognition" },
        { name: "נוכחות בחיפוש בינה מלאכותית", question: "האם העסק נוכח כשלקוחות שואלים בינה מלאכותית את מי לבחור?", built: false },
      ],
    },
  },
  {
    slug: "search-intelligence",
    name: "מודיעין חיפוש",
    short: "חיפוש",
    question: "האם שני משטחי הגילוי מסכימים, וכמה עולה הפער?",
    body: "חיפוש מסורתי וגילוי מתווך בינה מלאכותית הם נכסים מסחריים נפרדים שנכשלים באופן עצמאי. הקטגוריה הזו מודדת כל אחד מהם, מסווגת כל פער ביניהם, ומתמחרת כמה שווה לסגור את הפער.",
    modules: 12, live: 0,
    chips: ["מיקום ב-Google", "נוכחות המלצות בינה מלאכותית", "סיווג פערים"],
    detail: {
      modules: [
        { name: "מיקום ב-Google", question: "היכן העסק באמת מדורג עבור מילות המפתח שמניעות החלטת רכישה?", body: "המיקום נמדד מול מילות מפתח מסחריות אמיתיות, לא מונחי יוקרה שאיש לא מחפש כשהוא קרוב לבחירה.", live: false },
        { name: "נוכחות המלצות בינה מלאכותית", question: "כשמנועי בינה מלאכותית עונים על אותן שאלות רכישה, האם העסק נזכר בשם?", body: "משטח הגילוי השני, נמדד לפי הכללים שלו ולא מתוך הנחה שהוא הולך אחרי Google.", live: false },
        { name: "סיווג פערים", question: "היכן ששני המשטחים לא מסכימים, איזה סוג פער זה?", body: "פער מבני ופער בר-שיקום נראים זהים מבחוץ. רק אחד מהם שווה השקעה.", live: false },
        { name: "ערך חיפוש בר-שיקום", question: "מתוך הנראות שכרגע אובדת, כמה ניתן באופן ריאלי להחזיר?", body: "לא כל פער נסגר במאמץ. זה מפריד בין אלו שכן לבין אלו שלא, לפני שהתקציב מוקצה.", live: false },
        { name: "תלות בתשלום", question: "כמה מהנראות הנוכחית שכורה ולא בבעלות?", body: "נראות שנעלמת ברגע שההוצאה נפסקת היא נכס שונה, וסיכון שונה, מנראות שמצטברת.", live: false },
        { name: "לכידת תוצאה מומלצת", question: "כשGoogle מציג סקירת בינה מלאכותית או קטע מומלץ, האם הוא שואב מהעסק?", body: "המיקום מעל מיקום ראשון, במידה גוברת המקום שבו ההחלטה למעשה מתקבלת עוד לפני שקליק מתרחש.", live: false },
        { name: "פילוח לפי מיתוג", question: "האם הנראות מגיעה מאנשים שכבר מכירים את השם, או מאנשים שמגלים אותו?", body: "עסק שמדורג רק על שמו שלו לא מתגלה, הוא מאומת. שני הדברים דורשים עבודה שונה לחלוטין.", live: false },
        { name: "נוכחות מקומית", question: "כשההחלטה מקומית, האם העסק מופיע בחבילת המפות ובתשובות בינה מלאכותית מקומיות?", body: "שאלות רכישה מקומיות נפתרות אחרת משאלות גלובליות, ונמדדות כאן בנפרד במקום מתוך הנחה שהן עוקבות אחר אותה תבנית.", live: false },
        { name: "התאמת כוונת השאילתה", question: "האם העסק מדורג עבור השאלות שקונים באמת שואלים, או עבור מונחים סמוכים שלעולם לא ממירים?", body: "מעקב דירוג ללא סיווג כוונה סופר הרבה ניצחונות לא רלוונטיים.", live: false },
        { name: "תנודתיות בתוצאות החיפוש", question: "עד כמה יציב המיקום הנוכחי, והאם המגמה עולה או יורדת?", body: "דירוג שנלכד פעם אחת אומר לכם איפה הדברים עומדים. במעקב לאורך זמן הוא אומר לכם אם לפעול עכשיו או מאוחר יותר.", live: false },
        { name: "כיסוי שיחתי", question: "כששאלת רכישה נשאלת בצורה שיחתית ולא כמילת מפתח, האם העסק עדיין עולה?", body: "התנהגות החיפוש עוברת לכיוון שאלות מלאות. נראות שמבוססת על מילות מפתח לא עוברת אוטומטית.", live: false },
        { name: "עקביות בין משטחים", question: "האם העסק אומר את אותו הדבר על עצמו בדפים מאונדקסים כפי שמנועי בינה מלאכותית למדו ממקומות אחרים?", body: "אי-התאמה בין מה שעסק מפרסם לבין מה שמכונות הסיקו באופן עצמאי שוחקת את שני המשטחים בו-זמנית.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "סריקת נראות בחיפוש", question: "היכן העסק באמת עומד ב-Google ובחיפוש בינה מלאכותית עבור מילות המפתח המרכזיות שלו?", scope: "Google + 6 מנועי בינה מלאכותית · 20 מילות מפתח · סיווג פערים", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-30 דקות" },
        { tier: "Advanced", name: "אבחון פערי חיפוש", question: "אילו פערים ספציפיים בין Google לבינה מלאכותית עולים הכי הרבה, ואילו ניתנים לשיקום?", scope: "Google + 6 מנועי בינה מלאכותית · 20 מילות מפתח · מידול ערך בר-שיקום", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות משעה" },
      ],
      engines: [
        { name: "נוכחות בחיפוש בינה מלאכותית", question: "האם העסק נוכח כשלקוחות שואלים בינה מלאכותית את מי לבחור?", built: false },
        { name: "כלכלת חיפוש", question: "מתי חיפוש ממומן הופך ללא יעיל באופן מבני?", built: false },
      ],
    },
  },
  {
    slug: "competitive-intelligence",
    name: "מודיעין תחרותי",
    short: "תחרותי",
    question: "מי מקבל את ההחלטה במקום זאת, ומה יש לו?",
    body: "לא מי מדורג מעליכם, אלא מי מקבל המלצה כשקונה שואל מכונה את מי לבחור. התפוקה השימושית לעולם אינה נתון הנתח; היא הראיות הספציפיות שמתחרה מספק ושאתם לא.",
    modules: 7, live: 7,
    chips: ["נתח המלצות", "שאילתות מנצחות", "שליטה בשלב ההחלטה"],
    detail: {
      modules: [
        { name: "נתח המלצות", question: "מי מקבל המלצה במקום העסק, ובאיזו תדירות?", body: "נתח מתוך ההחלטות ולא נתח מתוך התנועה, נמדד היכן שהבחירה באמת מתקבלת ולא היכן שהיא מתועדת מאוחר יותר.", live: true },
        { name: "שאילתות מנצחות", question: "אילו שאלות ספציפיות כל מתחרה מחזיק?", body: "השאלות בשם שבהן יריב מנצח בכל פעם, וזה מה שהופך תחושה מעורפלת של הפסד לרשימה סופית של דברים לתקן.", live: true },
        { name: "שליטה בשלב ההחלטה", question: "באיזה שלב כל מתחרה תופס שליטה?", body: "יריבים מסוימים מנצחים מוקדם על ידי עיצוב הקריטריונים; אחרים מנצחים מאוחר בבחירת הספק. הפעולה הנגדית שונה לחלוטין עבור כל אחד.", live: true },
        { name: "מניעי סמכות", question: "מה בדיוק הופך מתחרה למומלץ?", body: "הנכסים הבודדים שמכונה פונה אליהם כשהיא מצדיקה את הבחירה בהם: פרסומים, השוואות, מפרטים, תוצאות מאומתות.", live: true },
        { name: "יתרון מקורות", question: "כמה יותר ראיות תומכות בהם מאשר בנו?", body: "יחס ניתן לספירה של מקורות בלתי תלויים, שהופך פער מותג מופשט לתוכנית פרסום עם היקף ועלות ידועים.", live: true },
        { name: "שליטה נרטיבית", question: "של מי המסגור שמכונות משתמשות בו כשהן מסבירות את הקטגוריה?", body: "האם קונים מעריכים מול קריטריונים שמתחרה פרסם, מה שקובע בשקט את התוצאה עוד לפני שמישהו הושווה.", live: true },
        { name: "פגיעות", question: "היכן המתחרה המוביל באמת חלש?", body: "השאלות שיריב דומיננטי לא עונה עליהן, לא מכסה, או עונה עליהן גרוע, המקומות הזולים ביותר הזמינים לתפוס נתח.", live: true },
      ],
      offers: [
        { tier: "Snapshot", name: "סריקת המלצות מתחרים", question: "מי מקבל המלצה במקום זאת, היכן ומדוע?", scope: "6 מנועי בינה מלאכותית · 24 שאלות החלטה · 4 מתחרים", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-30 דקות" },
        { tier: "Strategic", name: "הערכת מיצוב תחרותי", question: "מדוע מתחרים לוכדים את ההחלטה?", scope: "6 מנועי בינה מלאכותית · 24 שאלות · 4 מתחרים · ניתוח ציטוטים", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות משעה" },
      ],
      engines: [
        { name: "מודיעין החלטת המתחרה", question: "היכן מתחרים מקבלים את ההחלטה לפני שהעסק מקבל את הליד?", built: true, href: "/en/engines/competitor-decision" },
      ],
    },
  },
  {
    slug: "trust-intelligence",
    name: "מודיעין אמון",
    short: "אמון",
    question: "האם העסק בטוח להמלצה?",
    body: "נראות יוצרת תשומת לב; אמון יוצר בחירה. עסק יכול להיות נראה בצורה מושלמת ועדיין להיות מסונן ברגע שמערכת צריכה לעמוד מאחורי הזכרתו ראשון.",
    modules: 4, live: 0,
    chips: ["אימות בלתי תלוי", "סמכות מקורות", "עקביות מוניטין"],
    detail: {
      modules: [
        { name: "אימות בלתי תלוי", question: "האם ראיות מחוץ לערוצי העסק שלו תומכות במה שהוא טוען על עצמו?", body: "טענות שעסק אומר על עצמו נושאות פחות משקל, עבור מכונה או קונה, מאותה טענה שנאמרת על ידי מישהו אחר.", live: false },
        { name: "סמכות מקורות", question: "כמה ממה שבינה מלאכותית ו-Google יודעים על העסק מגיע ממקורות שהם מתייחסים אליהם כאמינים?", body: "אותה עובדה, שפורסמה על ידי מקור מהימן לעומת מקור לא ידוע, לא נושאת את אותו משקל בתוך תשובה.", live: false },
        { name: "עקביות מוניטין", question: "האם התמונה של העסק עקבית בפלטפורמות ביקורות, בעיתונות ובידע שמוחזק על ידי בינה מלאכותית, או שהיא מתפצלת?", body: "מערכת שניצבת מול אותות סותרים על אותו עסק נוטה להיזהר, או לא לומר דבר בכלל.", live: false },
        { name: "אותות סיכון", question: "האם קיימות תלונות, מחלוקות או אותות שליליים שלא נפתרו שמערכת הייתה שוקלת לפני שהיא ממליצה על העסק ראשון?", body: "נראות גורמת לעסק להישקל. אותות סיכון שלא נפתרו הם לעיתים קרובות מה שגורם לו להיות מסונן החוצה שוב.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "סריקת אמון וסמכות", question: "האם העסק נמצא כרגע במצב שממנו מערכת מוכנה להמליץ?", scope: "6 מנועי בינה מלאכותית · ביקורת מקורות ביקורות ועיתונות · בדיקת עקביות מוניטין", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-30 דקות" },
      ],
      engines: [
        { name: "אבחון אמון וסמכות", question: "האם העסק נראה אך עדיין לא בטוח להמלצה?", built: false },
      ],
    },
  },
  {
    slug: "content-intelligence",
    name: "מודיעין תוכן",
    short: "תוכן",
    question: "באיזו שפה השוק משתמש כדי לתאר את הקטגוריה שלכם?",
    body: "מי שמגדיר קטגוריה קובע את הקריטריונים שלפיהם קונים מעריכים. הקטגוריה הזו מודדת כמה מהגדרה זו בבעלותכם, היכן היא שברירית, ואילו מהיתרונות האמיתיים שלכם השוק אף פעם לא שומע.",
    modules: 5, live: 0,
    chips: ["בעלות נרטיבית", "הגדרת קטגוריה", "שבריריות"],
    detail: {
      modules: [
        { name: "בעלות נרטיבית", question: "כשבינה מלאכותית מסבירה מה הקטגוריה הזו, את המסגור של מי היא חוזרת עליו?", body: "הסברי קטגוריה נוצרים ממקור כלשהו. בדרך כלל ממי שפרסם ראשון את הגרסה הברורה ביותר.", live: false },
        { name: "הגדרת קטגוריה", question: "האם הקריטריונים שקונים מעריכים לפיהם הם אלו שהעסק באמת מנצח בהם?", body: "עסק יכול להיות מצוין לפי הקריטריונים שלו ובלתי נראה לפי אלו של השוק, אם הוא מעולם לא ערער על אילו קריטריונים חלים.", live: false },
        { name: "שבריריות", question: "עד כמה הנרטיב הנוכחי תלוי במספר קטן של מקורות שעלולים להשתנות או להיעלם?", body: "הגדרת קטגוריה שנשענת על שני או שלושה דפים נמצאת רק עדכון תוכן אחד מלהזיז את הקרקע מתחת לעסק.", live: false },
        { name: "פערי מסרים", question: "אילו יתרונות אמיתיים יש לעסק שאף פעם לא מגיעים לאופן שבו השוק מתאר את הקטגוריה?", body: "יתרונות ייחודיים אמיתיים שמעולם לא פורסמו אינם קיימים מבחינת מכונה שמגבשת תשובה.", live: false },
        { name: "כיסוי תוכן", question: "מתוך השאלות שמעצבות את נרטיב הקטגוריה, כמה ממרחב התשובות תופס התוכן של העסק עצמו?", body: "כיסוי שנמדד מול השאלות בפועל שמהן נבנה הנרטיב, לא מול לוח תוכן גנרי.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "סריקת בעלות נרטיבית", question: "באיזו שפה משתמשים כדי להגדיר את הקטגוריה, והיכן הסיפור של העסק עצמו חסר ממנה?", scope: "6 מנועי בינה מלאכותית · ביקורת הגדרת קטגוריה · ניתוח פערי מסרים", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-30 דקות" },
      ],
      engines: [
        { name: "מודיעין נרטיבי", question: "כשהשוק מסביר את הקטגוריה, באיזו שפה הוא משתמש?", built: false },
      ],
    },
  },
  {
    slug: "market-intelligence",
    name: "מודיעין שוק",
    short: "שוק",
    question: "האם השוק מוכן, והאם הדרך אליו מחזיקה מעמד?",
    body: "תזמון, גיאוגרפיה והפצה, שלושת התנאים שקובעים האם אסטרטגיה נכונה שמבוצעת היום מניבה יותר מאותה אסטרטגיה שתבוצע בעוד שנה.",
    modules: 12, live: 0,
    chips: ["הבשלת ביקוש", "חינוך קונים", "צפיפות תחרותית"],
    detail: {
      modules: [
        { name: "הבשלת ביקוש", question: "האם ביקוש הקונים בקטגוריה הזו עדיין מתגבש, מואץ, או כבר רווי?", body: "אותה אסטרטגיה שמבוצעת בכל אחד משלושת השלבים הללו מניבה תוצאה שונה לחלוטין.", live: false },
        { name: "חינוך קונים", question: "האם הקונים כבר מבינים את הקטגוריה, או שהעסק עדיין צריך ללמד את הצורך לפני שהוא יכול למכור את הפתרון?", body: "שוק שעדיין לא חונך אינו שוק איטי, זו עבודה שונה ומוקדמת יותר.", live: false },
        { name: "צפיפות תחרותית", question: "כמה חלופות אמינות קונה שוקל לפני שהעסק הזה בכלל נשקל?", body: "צפיפות משנה מה מנצח. בשדה צפוף, להיות נכון לא מספיק; להיות נשקל ראשון כן.", live: false },
        { name: "תזמון החלון", question: "האם יש תקופה ספציפית שבה כניסה או התרחבות מניבות יותר מפעולה בעוד שנה?", body: "חלונות תזמון נסגרים. כניסה נכונה באיחור של שנה לעיתים קרובות מניבה פחות מכניסה לא מושלמת בזמן.", live: false },
        { name: "כוח הפצה", question: "האם הדרך הנוכחית לשוק מחזקת את המותג של העסק עצמו, או מעבירה את הקשר למתווך?", body: "כל ערוץ שנמצא בין העסק לקונה לוקח משהו, בדרך כלל את הקשר, לפעמים את המרווח.", live: false },
        { name: "תלות בערוץ", question: "כמה מהביקוש הנוכחי עובר דרך מספר קטן של ערוצים שהעסק לא שולט בהם?", body: "סיכון ריכוז בהפצה מתנהג בדיוק כמו סיכון ריכוז בכל מקום אחר, בשקט עד שהערוץ משנה את התנאים שלו.", live: false },
        { name: "פריסה גיאוגרפית", question: "היכן הביקוש מרוכז, והיכן העסק משקיע תשומת לב שהביקוש לא תומך בה?", body: "מאמץ וביקוש לעיתים קרובות מצביעים לכיוונים שונים; כאן הפער הזה נמדד, לא מונח כהנחה.", live: false },
        { name: "מוכנות לכניסה לשוק", question: "לפני התרחבות לשוק חדש, האם הראיות אומרות שהקטגוריה, השפה והתנהגות הקונים מוכנות לכך?", body: "המוכנות נבחנת מול ראיות מהשוק היעד, ולא נגזרת מביצועים בשוק שהעסק כבר מכיר.", live: false },
        { name: "עקביות בין שווקים", question: "האם העסק נראה באותו אופן במדינות ושפות שונות, או שהתמונה מתפצלת בגבול?", body: "עסק שמובן היטב בבית ובלתי מזוהה בחו״ל סובל מבעיית התרחבות, לא רק מבעיית תרגום.", live: false },
        { name: "אות רוויה", question: "האם הצפיפות התחרותית בשוק הזה עדיין עולה, או שהיא הגיעה למישור?", body: "כיוון המגמה חשוב כמו הרמה הנוכחית, הוא קובע האם החלון נפתח או נסגר.", live: false },
        { name: "פער לוקליזציה", question: "כשחסר הקשר שפתי או תרבותי, האם העסק מסונן החוצה עוד לפני שהוא בכלל נבחן?", body: "חלק מההפסדים קורים בשלב השיקול, לא ההשוואה, העסק מעולם לא היה בקבוצה מלכתחילה.", live: false },
        { name: "רצף התרחבות", question: "אם כמה שווקים הם מועמדים להתרחבות, איזה מהם מניב תשואה ראשון?", body: "רצף מדורג שנבנה מתוך מוכנות ותזמון חלון, ולא מתוך איזה שוק מרגיש הכי מוכר.", live: false },
      ],
      offers: [
        { tier: "Snapshot", name: "סריקת מוכנות שוק", question: "האם השוק הזה מוכן שהעסק ייכנס אליו או יתרחב אליו עכשיו, או שהחלון עדיין מתגבש?", scope: "6 מנועי בינה מלאכותית · הבשלת ביקוש · צפיפות תחרותית · שוק אחד", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות מ-30 דקות" },
        { tier: "Strategic", name: "הערכת רצף התרחבות", question: "מתוך כמה שווקים מועמדים, לאיזה מהם העסק צריך להיכנס ראשון, ובאיזה סדר?", scope: "6 מנועי בינה מלאכותית · עד 4 שווקים מועמדים · ביקורת הפצה ולוקליזציה", delivery: "לאחר השלמת הסריקה, בדרך כלל תוך פחות משעה" },
      ],
      engines: [
        { name: "מודיעין תזמון אסטרטגי", question: "האם השוק מוכן, וכמה זמן החלון פתוח?", built: false },
        { name: "מודיעין הפצה", question: "האם הדרך לשוק מחזקת את המותג או מעבירה כוח למתווכים?", built: false },
        { name: "מודיעין שוק גלובלי", question: "איך העסק משתנה במדינות, שפות ושווקים שונים?", built: false },
      ],
    },
  },
  {
    slug: "executive-intelligence",
    name: "מודיעין הנהלה",
    short: "הנהלה",
    question: "כמה זה שווה, ומה קורה הלאה?",
    body: "היכן שאבחון הופך להחלטה. כל פער מתומחר כטווח כיווני, מדורג מול כל פער אחר, מקבל אחראי ומועד יעד, ולאחר מכן נמדד לאחר הביצוע כדי לאשר שהאות זז.",
    modules: 9, live: 4,
    chips: ["מרכז פעולה", "תור עדיפויות", "מפת דרכים ל-30/60/90 יום"],
    detail: {
      modules: [
        { name: "מרכז פעולה", question: "מה העסק צריך לעשות, באיזה סדר?", body: "כל ממצא הופך להתערבות עם אחראי, מועד יעד ותנועה צפויה מוצהרת, או נגרע, אם אי אפשר.", live: true },
        { name: "תור עדיפויות", question: "איזו התערבות מניבה הכי הרבה, ומה כרגע חסום?", body: "דירוג לפי חשיפה, רמת ביטחון, מאמץ ותלות, כך שהמאמץ לא הולך לעבודה שלא יכולה לזוז עד שמשהו אחר נופל למקומו.", live: true },
        { name: "מפת דרכים ל-30/60/90 יום", question: "מה נופל למקומו החודש, ברבעון הזה, ובשנה הזו?", body: "רצף שנבנה ממה שכל התערבות באמת תלויה בו, ולא מלוח שנה שמישהו חילק לשלישים.", live: true },
        { name: "מעקב השפעה", question: "האם העבודה הזיזה את האות שהיא הייתה אמורה להזיז?", body: "שינוי נמדד מול השינוי החזוי, כולל ההתערבויות שלא עבדו, וזו הדרך היחידה שבה המודל זוכה באמון.", live: true },
        { name: "נפח החלטות", question: "כמה החלטות רכישה באמת בתמונה?", body: "גודל שוק ההחלטות עצמו, נספר בהחלטות ולא בחיפושים, סשנים או חשיפות.", live: false },
        { name: "ערך עסקה", question: "כמה שווה אחת מההחלטות האלו לעסק?", body: "ערך לכל החלטה לפי שלב וסוג שאלה, כך שפער בנפח גבוה לא מדורג אוטומטית מעל פער בנפח נמוך אך בערך גבוה.", live: false },
        { name: "הנחות המרה", question: "מה חייב להיות נכון כדי שהאומדן הזה יחזיק מעמד?", body: "כל הנחה שמאחורי נתון חשיפה, מוצהרת וניתנת לעריכה, כי מספר שההנחות שלו מוסתרות אי אפשר להתווכח איתו או לסמוך עליו.", live: false },
        { name: "זמן להשפעה", question: "כמה זמן עד שהתערבות מופיעה במספרים?", body: "הפער בין ביצוע העבודה לראיית התנועה, וזה מה שמונע מתוכנית שעובדת להתבטל חודש מוקדם מדי.", live: false },
        { name: "טווח הזדמנות", question: "כמה הפער שווה, ועד כמה ניתן להיות בטוחים?", body: "טווח כיווני עם רמת ביטחון מוצהרת, לעולם לא מספר בודד ובטוח, ולעולם לא מתואר כהכנסה אבודה מאושרת.", live: false },
      ],
      offers: [
        { tier: "Executive", name: "תדריך מודיעין הנהלה", question: "מהי העמדה הניהולית המלאה לגבי סיכון, הזדמנות, תזמון ופעולה?", scope: "6 מנועי בינה מלאכותית · 24 שאלות · 20 מילות מפתח · 4 מתחרים · הערכת GEON מלאה", delivery: "נבדק על ידי מומחה, תוך 3 ימי עסקים" },
      ],
      engines: [
        { name: "מודיעין פעולה", question: "מה צריך לקרות הלאה, מי אחראי, ועד מתי?", built: true, href: "/en/engines/action" },
        { name: "מודיעין הזדמנויות והכנסות", question: "איזה פער משמעותי מספיק מסחרית כדי לתקן אותו ראשון?", built: false },
      ],
    },
  },
];

const howItWorksPacks: Partial<Record<string, typeof howItWorks>> = { en: howItWorks, he: howItWorksHe };
const methodologyPacks: Partial<Record<string, typeof methodology>> = { en: methodology, he: methodologyHe };
const marketplacePacks: Partial<Record<string, typeof marketplace>> = { en: marketplace, he: marketplaceHe };
const categoriesPacks: Partial<Record<string, Category[]>> = { en: categories, he: categoriesHe };

/** English is the fallback until the other five locales are translated. */
export function getHowItWorksCopy(locale: string): typeof howItWorks {
  return howItWorksPacks[normalizeLocale(locale)] ?? howItWorks;
}

export function getMethodologyCopy(locale: string): typeof methodology {
  return methodologyPacks[normalizeLocale(locale)] ?? methodology;
}

export function getMarketplaceCopy(locale: string): typeof marketplace {
  return marketplacePacks[normalizeLocale(locale)] ?? marketplace;
}

export function getCategoriesCopy(locale: string): Category[] {
  return categoriesPacks[normalizeLocale(locale)] ?? categories;
}
