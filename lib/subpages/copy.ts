/**
 * Copy for the explanatory and catalogue subpages, How It Works, Methodology,
 * the engines index and the marketplace. Taken from the live GeoRepute site;
 * nothing here is invented positioning.
 */

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
  },
  {
    slug: "content-intelligence",
    name: "Content Intelligence",
    short: "Content",
    question: "Whose language does the market use to describe your category?",
    body: "Whoever defines a category sets the criteria buyers evaluate against. This category measures how much of that definition you own, where it is fragile, and which of your genuine advantages the market never hears.",
    modules: 5, live: 0,
    chips: ["Narrative ownership", "Category definition", "Fragility"],
  },
  {
    slug: "market-intelligence",
    name: "Market Intelligence",
    short: "Market",
    question: "Is the market ready, and does the route to it hold?",
    body: "Timing, geography and distribution, the three conditions that decide whether a correct strategy executed today returns more than the same strategy executed in a year.",
    modules: 12, live: 0,
    chips: ["Demand maturation", "Buyer education", "Competitive density"],
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

export const CATEGORY_ROUTES = new Set(["ai-visibility-intelligence", "competitive-intelligence", "executive-intelligence"]);
