import type { Confidence, Trend } from "./demo";

/** The shared "signal → evidence → consequence → action" readout each built engine produces. */
export type EngineReadout = {
  slug: "ai-recognition" | "google-vs-ai" | "competitor-decision" | "action";
  name: string;
  short: string;
  question: string;
  lead: string;
  modules: string[];
  meaning: string;
  confidence: Confidence;
  urgency: string;
  competitor: string;
  evidence: { observed: string; source: string; finding: string; date: string }[];
  signals: { name: string; trend: Trend; value: string }[];
  prescription: string;
  movement: { value: string; label: string };
  owner: string;
  deadline: string;
  trend: Trend;
  screens: string[];
  next: { href: string; label: string };
};

export const engineReadouts: Record<EngineReadout["slug"], EngineReadout> = {
  "ai-recognition": {
    slug: "ai-recognition",
    name: "AI Recognition Intelligence",
    short: "AI Recognition",
    question: "Do AI engines understand who the business is and when it should be considered?",
    lead: "An engine that cannot categorise a business cannot recommend it. This readout shows what each of six AI engines currently believes the business is, and where that belief breaks.",
    modules: ["Recognition by engine", "Entity understanding", "Category association", "Confusion detection", "Outdated knowledge", "Source influence", "Recognition decay"],
    meaning: "An engine that cannot categorise a business cannot recommend it. This is upstream of every visibility metric: no amount of content moves an answer if the entity record is wrong.",
    confidence: "directional",
    urgency: "Immediate",
    competitor: "Cindermark Industrial is correctly categorised by all six engines.",
    evidence: [
      { observed: "Entity category association", source: "ChatGPT", finding: "Classified as a hardware retailer, not an MRO distributor.", date: "Jul 29, 2026" },
      { observed: "Entity disambiguation", source: "Gemini", finding: "Conflated with a same-named logistics firm.", date: "Jul 28, 2026" },
      { observed: "Entity record", source: "Grok", finding: "No stable entity record. Category answered without naming any Midwest distributor.", date: "Jul 27, 2026" },
    ],
    signals: [
      { name: "Supplier-evaluation coverage", trend: "down", value: "7%" },
      { name: "Source influence", trend: "up", value: "3 independent sources" },
    ],
    prescription: "Publish a single canonical entity description and propagate identical category language to trade directories and structured data.",
    movement: { value: "55 /100", label: "Average recognition score" },
    owner: "Head of Digital",
    deadline: "Sep 30, 2026",
    trend: "stable",
    screens: ["AI Recognition Matrix", "Entity Understanding", "Source Influence Map", "Confusion Detector"],
    next: { href: "/en/engines/google-vs-ai", label: "Google vs AI Visibility" },
  },
  "google-vs-ai": {
    slug: "google-vs-ai",
    name: "Google vs AI Visibility Intelligence",
    short: "Google vs AI",
    question: "Does the business exist consistently across traditional search and AI-mediated discovery?",
    lead: "Google rank and AI recommendation are separate commercial assets that fail independently. Every tracked commercial question is plotted on both surfaces and classified by the gap between them.",
    modules: ["Google position", "AI recommendation presence", "Gap classification", "Recoverable search", "Strategic blind spot", "Compound blind spot", "Channel asymmetry"],
    meaning: "Google rank and AI recommendation are separate commercial assets. Ironvale ranks first for account setup, a question asked only after the vendor has already been chosen, and is absent from every question that decides the vendor.",
    confidence: "medium",
    urgency: "This quarter",
    competitor: "Cindermark Industrial holds top-three organic positions and AI presence on the four highest-volume commercial questions.",
    evidence: [
      { observed: "industrial fastener supplier", source: "Google + 6 engines", finding: "Not in top 100 organic. No AI recommendation. 320 searches per month.", date: "Jul 31, 2026" },
      { observed: "industrial supply account setup", source: "Google + Perplexity", finding: "Position 1 organic, AI present. Volume 40 per month.", date: "Jul 31, 2026" },
      { observed: "fastener sourcing best practices", source: "Google + ChatGPT", finding: "Position 3 and recommended, the pattern that works.", date: "Jul 30, 2026" },
    ],
    signals: [
      { name: "Blended CPC vs break-even", trend: "down", value: "Above break-even" },
      { name: "Supplier-evaluation coverage", trend: "up", value: "7%" },
    ],
    prescription: "Build supplier-comparison content against the eleven compound and strategic blind-spot questions, structured so it is both rankable and citable.",
    movement: { value: "9 of 20", label: "Questions with AI presence" },
    owner: "Content Lead",
    deadline: "Oct 31, 2026",
    trend: "down",
    screens: ["Gap Matrix", "Query Inventory", "Recoverable Search Opportunity", "Compound Blind Spot"],
    next: { href: "/en/engines/competitor-decision", label: "Competitor Decision" },
  },
  "competitor-decision": {
    slug: "competitor-decision",
    name: "Competitor Decision Intelligence",
    short: "Competitor Decision",
    question: "Where do competitors receive the decision before the business receives the lead?",
    lead: "Not who ranks above you, who gets recommended when a buyer asks a machine whom to choose, at which stage, and on the strength of which evidence.",
    modules: ["Recommendation share", "Winning prompts", "Decision-stage control", "Authority drivers", "Source advantage", "Narrative control", "Vulnerability"],
    meaning: "This gap is not brand preference. It is an evidence gap: Cindermark supplies engines with material they can cite, and Ironvale does not. The lead never reaches the CRM because the decision resolved before contact.",
    confidence: "directional",
    urgency: "Immediate",
    competitor: "Cindermark Industrial receives the recommendation in 31% of decisions and controls the supplier-evaluation stage.",
    evidence: [
      { observed: "Recommendation share across 24 decision questions", source: "All six engines", finding: "Cindermark 31%, Hollowpine 18%, Greyfen 11%, Ashcombe 7%, Ironvale 4.2%.", date: "Jul 31, 2026" },
      { observed: "Independent authority sources cited", source: "Engine citation analysis", finding: "Cindermark 21 sources, Ironvale 3.", date: "Jul 30, 2026" },
      { observed: "Supplier-evaluation first mention", source: "All six engines", finding: "Cindermark named first in four of seven questions.", date: "Jul 30, 2026" },
    ],
    signals: [
      { name: "Authority evidence", trend: "up", value: "Weak" },
      { name: "Supplier-evaluation coverage", trend: "stable", value: "7%" },
      { name: "Narrative ownership", trend: "down", value: "12%" },
    ],
    prescription: "Publish an independent, verifiable supplier-comparison resource and secure third-party validation in at least two trade publications.",
    movement: { value: "11%", label: "Recommendation share" },
    owner: "VP Marketing",
    deadline: "Nov 30, 2026",
    trend: "down",
    screens: ["Recommendation Map", "Decision Hijack", "Strength Drivers", "Authority Gap"],
    next: { href: "/en/engines/action", label: "Action Intelligence" },
  },
  action: {
    slug: "action",
    name: "Action Intelligence",
    short: "Action",
    question: "What must happen next, by whom and by when?",
    lead: "Diagnosis without sequence produces activity, not movement. Every intervention names an owner, a deadline, the signal it should move and how that movement will be verified.",
    modules: ["Action", "Evidence", "Expected impact", "Confidence", "Urgency", "Effort", "Owner", "Deadline", "Success metric", "Measured change"],
    meaning: "Diagnosis without sequence produces activity, not movement. Each intervention names an owner, a deadline, the signal it should move and how that movement will be verified.",
    confidence: "directional",
    urgency: "Immediate",
    competitor: "Cindermark Industrial holds position while no counter-intervention is running.",
    evidence: [
      { observed: "Priority ranking model", source: "Composite", finding: "Ranked by exposure, confidence, urgency, effort and competitor pressure.", date: "Jul 31, 2026" },
      { observed: "Top intervention", source: "Causal signal chain", finding: "Independent authority evidence, the constraint holding every downstream signal.", date: "Jul 31, 2026" },
      { observed: "Effort assessment", source: "Customer-configured", finding: "Two of six interventions are low effort with measurable movement inside 60 days.", date: "Jul 31, 2026" },
    ],
    signals: [
      { name: "Authority evidence", trend: "up", value: "Weak" },
      { name: "Supplier-evaluation coverage", trend: "down", value: "7% → 19% target" },
    ],
    prescription: "Strengthen independent authority evidence and supplier-comparison coverage.",
    movement: { value: "56 /100", label: "Decision Health Index" },
    owner: "VP Marketing",
    deadline: "Nov 30, 2026",
    trend: "stable",
    screens: ["Action Center", "Priority Queue", "30/60/90-Day Roadmap", "Impact Tracker"],
    next: { href: "/en/app/mission-control", label: "Mission Control" },
  },
};

export const ENGINE_ORDER: EngineReadout["slug"][] = ["ai-recognition", "google-vs-ai", "competitor-decision", "action"];
