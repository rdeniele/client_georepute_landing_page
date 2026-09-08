/**
 * Single source of truth for page copy.
 *
 * Positioning, module names, engine names and capability figures are taken
 * from the live GeoRepute site. Anything illustrative (the sample decision
 * reconstruction, the sample measure readings) is marked `sample: true` and
 * is labelled as a worked example in the UI; it is never presented as a
 * customer result.
 */

/**
 * Navigation mirrors the live site's structure, labels and destinations
 * verbatim; three mega-menu groups, two direct links, sign-in and the primary
 * CTA. Paths are the live site's own routes so this header drops straight into
 * the rebuilt app.
 */
export const nav = {
  brand: { name: "GeoRepute", sub: "Powered by Gintex", href: "/en" },
  groups: [
    {
      id: "platform",
      label: "Platform",
      items: [
        {
          name: "Executive Mission Control",
          desc: "Ten measures, one decision position, each opening its evidence.",
          href: "/en/app/mission-control",
        },
        {
          name: "Decision Reconstruction",
          desc: "Enter a domain, pick a commercial question, watch the decision rebuild.",
          href: "/en/app/reconstruct",
        },
        {
          name: "Campaign Readiness",
          desc: "Should we launch this campaign today? Assesses the business, not the campaign.",
          href: "/en/app/campaign-readiness",
        },
        {
          name: "Narrative Intelligence",
          desc: "What story is the market telling, and how is it influencing decisions?",
          href: "/en/app/narrative",
        },
        {
          name: "Strategic Action Center",
          desc: "Prioritised interventions with owners, deadlines and measurement.",
          href: "/en/app/actions",
        },
        {
          name: "Election Intelligence",
          desc: "Which narratives are moving the electorate, who is carrying them, and what must change.",
          href: "/en/election-intelligence",
        },
      ],
      feature: {
        eyebrow: "Signature experience",
        title: "Reconstruct the decision.",
        desc: "Ten surfaces, one commercial question, from what each engine understood to what must change next.",
        cta: "Open the reconstruction",
        href: "/en/app/reconstruct",
      },
    },
    {
      id: "engines",
      label: "Intelligence Engines",
      items: [
        {
          name: "AI Recognition",
          desc: "Do AI engines understand who the business is?",
          href: "/en/engines/ai-recognition",
        },
        {
          name: "Google vs AI Visibility",
          desc: "Does it exist consistently across both discovery surfaces?",
          href: "/en/engines/google-vs-ai",
        },
        {
          name: "Competitor Decision",
          desc: "Who receives the decision instead, and why?",
          href: "/en/engines/competitor-decision",
        },
        {
          name: "Action Intelligence",
          desc: "What must happen next, by whom and by when?",
          href: "/en/engines/action",
        },
      ],
      more: { label: "See all twelve engines", href: "/en/engines" },
    },
    {
      id: "marketplace",
      label: "Marketplace",
      items: [
        {
          name: "AI Visibility Intelligence",
          desc: "Does AI know the business exists, and what does it think it is?",
          href: "/en/marketplace/category/ai-visibility-intelligence",
        },
        {
          name: "Competitive Intelligence",
          desc: "Who receives the decision instead, and what do they have?",
          href: "/en/marketplace/category/competitive-intelligence",
        },
        {
          name: "Executive Intelligence",
          desc: "What is it worth, and what happens next?",
          href: "/en/marketplace/category/executive-intelligence",
        },
      ],
      more: { label: "See the full intelligence ecosystem", href: "/en/marketplace" },
    },
  ],
  links: [
    { label: "How It Works", href: "/en/how-it-works" },
    { label: "Methodology", href: "/en/methodology" },
  ],
  signIn: { label: "Sign In", href: "/en/signin" },
  cta: { label: "Start Analysis", href: "https://www.georepute.ai/signup" },
} as const;

export const hero = {
  eyebrow: "The intelligence & execution layer for modern agencies",
  headlineLead: "See where your business is",
  emphasis: ["Recognized.", "Recommended.", "Chosen."],
  supporting:
    "GeoRepute maps the decision environment around your business: across AI, search, reputation, competitors, and the signals that influence what customers choose.",
  primaryCta: { label: "Analyze My Business", href: "https://www.georepute.ai/signup" },
  secondaryCta: { label: "Explore the Intelligence", href: "#signals" },
  scrollHint: "Enter the system",
} as const;

/** Nodes orbiting the intelligence core in the hero scene. */
export const heroNodes = [
  "AI Engines",
  "Google",
  "Search",
  "Reputation",
  "Authority",
  "Competitors",
  "Content",
  "Market",
  "Customer",
  "Decisions",
] as const;

export const invisibleDecision = {
  index: "02",
  label: "The invisible decision",
  headline: "Your analytics start after the decision has already been shaped.",
  body: "By the time a visit is recorded, the customer has already asked a question, been given an interpretation, weighed evidence, and compared you against alternatives. Every platform you run measures what happens next. None of them measure that.",
  pullLead: "Traditional platforms optimize channels.",
  pullEmphasis: "GeoRepute reconstructs decisions.",
  timeline: [
    { t: "Question asked", visible: false },
    { t: "Interpretation formed", visible: false },
    { t: "Evidence weighed", visible: false },
    { t: "Alternatives compared", visible: false },
    { t: "Recommendation made", visible: false },
    { t: "Decision taken", visible: false },
    { t: "Visit recorded", visible: true },
  ],
  visibleLabel: "Where your analytics begin",
  invisibleLabel: "Where the decision is actually made",
} as const;

export const signals = {
  index: "03",
  label: "See the signals",
  headline: "Ten measures. One decision position. Each opening its evidence.",
  body: "Every signal below is measured independently, then resolved into a single position on whether your business is in a state to win the decision.",
  items: [
    {
      name: "AI Recognition",
      q: "Do AI engines understand who the business is?",
    },
    {
      name: "Google Visibility",
      q: "Is the business present where conventional search still decides?",
    },
    {
      name: "AI Visibility",
      q: "Does it exist consistently across both discovery surfaces?",
    },
    {
      name: "Authority",
      q: "Does independent evidence support the claims being made?",
    },
    { name: "Trust", q: "Does the market treat the business as safe to pick?" },
    {
      name: "Context",
      q: "Is the business understood in the right category and use case?",
    },
    {
      name: "Consistency",
      q: "Does every surface describe the same entity the same way?",
    },
    {
      name: "Market Fit",
      q: "Is demand moving toward what the business actually sells?",
    },
    {
      name: "Competitive Position",
      q: "Who receives the decision instead, and why?",
    },
    {
      name: "Narrative Alignment",
      q: "What story is the market telling, and how is it influencing decisions?",
    },
  ],
} as const;

export const reconstruction = {
  index: "04",
  label: "Watch a decision form",
  headline: "Enter a domain, pick a commercial question, watch the decision rebuild.",
  sample: true,
  sampleNote: "Worked example: illustrative reconstruction, not customer data.",
  query: "Which industrial fastener suppliers are most reliable in the Midwest?",
  stages: [
    {
      key: "question",
      label: "Question",
      title: "A commercial question enters the system",
      detail:
        "Not a keyword. A decision with a buyer, a budget and a deadline behind it.",
    },
    {
      key: "interpretation",
      label: "AI interpretation",
      title: "The engine decides what the question means",
      detail:
        "'Reliable' is resolved into on-time delivery, certification depth, and stocking consistency; before any supplier is considered.",
    },
    {
      key: "evidence",
      label: "Evidence",
      title: "Independent sources are weighed",
      detail:
        "Third-party evidence outranks self-published claims. Businesses without it are not disqualified; they are never assembled into the answer.",
    },
    {
      key: "comparison",
      label: "Competitive context",
      title: "Alternatives enter and compete for the answer",
      detail:
        "Every business in the category is assessed against the same criteria at once. Who receives the decision instead, and why?",
    },
    {
      key: "recommendation",
      label: "Recommendation",
      title: "A named answer is produced",
      detail:
        "One to three businesses are named. Everyone else is absent from the decision entirely.",
    },
    {
      key: "outcome",
      label: "Decision",
      title: "The decision was made before the click",
      detail:
        "It was not created at the final step. It was assembled out of every signal that came before it; that is the part your analytics never saw.",
    },
  ],
} as const;

export const blindSpot = {
  index: "05",
  label: "The blind spot",
  headline: "Two different maps of the same customer.",
  body: "One begins when the decision is already over. The other begins when it starts.",
  traditional: {
    title: "Conventional analytics",
    steps: ["Visit", "Click", "Lead", "CRM"],
  },
  georepute: {
    title: "GeoRepute",
    steps: [
      "Question",
      "Consideration",
      "Recommendation",
      "Decision",
      "Outcome",
    ],
  },
} as const;

export const engines = {
  index: "06",
  label: "The intelligence engines",
  headline: "Twelve engines. One connected system.",
  body: "Each engine answers a question the others depend on. Nine of the core engines are mapped here; focus one to see what it feeds.",
  items: [
    {
      id: "recognition",
      name: "AI Recognition",
      q: "Do AI engines understand who the business is?",
      feeds: ["visibility", "context", "narrative"],
    },
    {
      id: "visibility",
      name: "Google vs AI Visibility",
      q: "Does it exist consistently across both discovery surfaces?",
      feeds: ["competitor", "executive"],
    },
    {
      id: "competitor",
      name: "Competitor Decision",
      q: "Who receives the decision instead, and why?",
      feeds: ["action", "executive"],
    },
    {
      id: "authority",
      name: "Authority",
      q: "Does independent evidence support the claims being made?",
      feeds: ["recognition", "trust"],
    },
    {
      id: "trust",
      name: "Trust",
      q: "Does the market treat the business as safe to pick?",
      feeds: ["executive"],
    },
    {
      id: "context",
      name: "Context",
      q: "Is the business understood in the right category?",
      feeds: ["competitor", "narrative"],
    },
    {
      id: "narrative",
      name: "Narrative Intelligence",
      q: "What story is the market telling, and how is it influencing decisions?",
      feeds: ["action"],
    },
    {
      id: "action",
      name: "Action Intelligence",
      q: "What must happen next, by whom and by when?",
      feeds: ["executive"],
    },
    {
      id: "executive",
      name: "Executive Intelligence",
      q: "Ten measures, one decision position, each opening its evidence.",
      feeds: ["recognition"],
    },
  ],
} as const;

export const loop = {
  index: "07",
  label: "The closed loop",
  headline: "Intelligence that compounds instead of expiring.",
  body: "Continuous PDCA measurement. Every cycle returns to the network better informed than the last.",
  stages: [
    { key: "PLAN", title: "Plan", detail: "Understand reality." },
    { key: "DO", title: "Do", detail: "Execute interventions." },
    { key: "CHECK", title: "Check", detail: "Measure what changed." },
    { key: "ACT", title: "Act", detail: "Decide what happens next." },
  ],
} as const;

export const decisionGraph = {
  index: "08",
  label: "The decision graph",
  headline: "The environment, made inspectable.",
  body: "Focus any node to isolate what connects to it. Unrelated paths dim; supporting evidence resolves.",
  nodes: [
    {
      id: "input",
      name: "Input",
      kind: "Signal",
      detail: "The commercial question, the market it enters, and who is asking it.",
      evidence: ["Query intent class", "Buyer stage", "Category boundary"],
    },
    {
      id: "interpretation",
      name: "Interpretation",
      kind: "Model",
      detail: "How AI engines resolve ambiguous language into concrete criteria.",
      evidence: ["Criteria extraction", "Entity resolution", "Category mapping"],
    },
    {
      id: "market",
      name: "Market",
      kind: "Environment",
      detail: "Demand direction, narrative pressure, and who else is competing for the answer.",
      evidence: ["Narrative movement", "Demand shift", "Competitive density"],
    },
    {
      id: "channel",
      name: "Channel",
      kind: "Surface",
      detail: "Google and six AI engines: the surfaces where the answer is assembled.",
      evidence: ["Google presence", "AI engine coverage", "Surface consistency"],
    },
    {
      id: "outcome",
      name: "Outcome",
      kind: "Result",
      detail: "Whether the business is named, considered, or absent from the decision.",
      evidence: ["Named rate", "Consideration set", "Absence cause"],
    },
    {
      id: "action",
      name: "Action",
      kind: "Intervention",
      detail: "Prioritised interventions with owners, deadlines and measurement.",
      evidence: ["Owner assigned", "Deadline set", "Measurement bound"],
    },
  ],
  edges: [
    ["input", "interpretation"],
    ["interpretation", "market"],
    ["interpretation", "channel"],
    ["market", "outcome"],
    ["channel", "outcome"],
    ["outcome", "action"],
    ["action", "input"],
    ["market", "channel"],
  ],
} as const;

export const executive = {
  index: "09",
  label: "Executive intelligence",
  headline: "Ten measures, one decision position.",
  body: "Each measure opens its own evidence. The position is what the board actually asks for.",
  sample: true,
  sampleNote: "Sample reading: illustrative values shown to demonstrate the interface.",
  position: { label: "Decision position", value: 62, state: "Contested" },
  measures: [
    { name: "AI Recognition", value: 48 },
    { name: "Google Visibility", value: 81 },
    { name: "AI Visibility", value: 39 },
    { name: "Authority", value: 34 },
    { name: "Trust", value: 72 },
    { name: "Context", value: 55 },
    { name: "Consistency", value: 44 },
    { name: "Market Fit", value: 77 },
    { name: "Competitive Position", value: 41 },
    { name: "Narrative Alignment", value: 58 },
  ],
} as const;

export const actionPlan = {
  index: "10",
  label: "From insight to action",
  headline: "Prioritised interventions with owners, deadlines and measurement.",
  body: "The system does not stop at analysis. It resolves into a sequence someone can be held to.",
  items: [
    {
      n: "01",
      title: "Strengthen independent authority evidence",
      measure: "Authority",
      owner: "Strategy",
      horizon: "30 days",
    },
    {
      n: "02",
      title: "Publish canonical entity description",
      measure: "Consistency",
      owner: "Content",
      horizon: "14 days",
    },
    {
      n: "03",
      title: "Resolve entity confusion across surfaces",
      measure: "AI Recognition",
      owner: "Technical",
      horizon: "21 days",
    },
    {
      n: "04",
      title: "Build comparison content against named alternatives",
      measure: "Competitive Position",
      owner: "Content",
      horizon: "45 days",
    },
    {
      n: "05",
      title: "Reallocate paid spend toward contested decisions",
      measure: "Market Fit",
      owner: "Media",
      horizon: "30 days",
    },
  ],
} as const;

export const capabilities = [
  { value: "100+", label: "Deep business & marketing analyses", icon: "search" },
  { value: "6", label: "AI engines, plus Google", icon: "brain" },
  { value: "7", label: "Languages", icon: "globe" },
  { value: "PDCA", label: "Continuous measurement", icon: "cycle" },
] as const;

export const finalCta = {
  index: "11",
  label: "Analyze my business",
  headline: "The decision is already happening.",
  body: "GeoRepute shows you where it happens, why it moves, and what to change next.",
  primaryCta: { label: "Analyze My Business", href: "https://www.georepute.ai/signup" },
  secondaryCta: { label: "Book an Executive Briefing", href: "https://www.georepute.ai/signup" },
} as const;

export const footer = {
  brand: "GeoRepute",
  tagline: "The intelligence & execution layer for modern agencies.",
  note: "Traditional platforms optimize channels. GeoRepute reconstructs decisions.",
} as const;
