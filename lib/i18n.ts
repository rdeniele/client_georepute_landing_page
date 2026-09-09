import { nav } from "./content";

export const LOCALES = ["en", "he", "ar", "ru", "fr", "es", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  he: "עברית",
  ar: "العربية",
  ru: "Русский",
  fr: "Français",
  es: "Español",
  pt: "Português",
};

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
  ar: "rtl",
  ru: "ltr",
  fr: "ltr",
  es: "ltr",
  pt: "ltr",
};

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
    headlineLead: string;
    emphasis: readonly string[];
    supporting: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    scrollHint: string;
  };
  scrollRail: readonly string[];
  heroPanel: { title: string; surfaces: string; signals: string; position: string; state: string };
  capabilityLabels: readonly string[];
  platformsLabel: string;
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
  };
  footer: { tagline: string; note: string };
};

const SIGNAL_NAMES_EN = [
  "AI Recognition", "Google Visibility", "AI Visibility", "Authority", "Trust",
  "Context", "Consistency", "Market Fit", "Competitive Position", "Narrative Alignment",
] as const;

const en: Copy = {
  nav: {},
  navItems: {},
  navFeature: { eyebrow: "Signature experience", title: "Reconstruct the decision.", desc: "Ten surfaces, one commercial question, from what each engine understood to what must change next.", cta: "Open the reconstruction" },
  hero: {
    eyebrow: "The intelligence & execution layer for modern agencies",
    headlineLead: "See where your business is",
    emphasis: ["Recognized.", "Recommended.", "Chosen."],
    supporting: "GeoRepute maps the decision environment around your business: across AI, search, reputation, competitors, and the signals that influence what customers choose.",
    primaryCta: { label: "Analyze My Business", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "Explore the Intelligence", href: "#signals" },
    scrollHint: "Enter the system",
  },
  scrollRail: ["Enter", "Invisible", "Signals", "Decision", "Blind spot", "Engines", "Loop", "Graph", "Executive", "Action", "Analyze"],
  heroPanel: { title: "Decision environment", surfaces: "Surfaces watched", signals: "Signals resolved", position: "Decision position", state: "Reconstructing" },
  capabilityLabels: ["Deep business & marketing analyses", "AI engines, plus Google", "Languages", "Continuous measurement"],
  platformsLabel: "GeoRepute scans Google + 6 AI engines — the surfaces where your business is discovered",
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
    secondaryCta: "Book an Executive Briefing",
  },
  footer: {
    tagline: "The intelligence & execution layer for modern agencies.",
    note: "Traditional platforms optimize channels. GeoRepute reconstructs decisions.",
  },
};

const he: Copy = {
  nav: { platform: "פלטפורמה", engines: "מנועי מודיעין", marketplace: "שוק המודיעין", how: "איך זה עובד", methodology: "מתודולוגיה", signIn: "כניסה", cta: "התחילו ניתוח", moreEngines: "ראו את כל שנים עשר המנועים", moreMarketplace: "ראו את כל מערכת המודיעין", language: "שפה" },
  navItems: {
    "/en/app/mission-control": { name: "מרכז בקרת ההנהלה", desc: "עשרה מדדים, עמדת החלטה אחת, כשכל אחד פותח את הראיות שלו." },
    "/en/app/reconstruct": { name: "שחזור החלטה", desc: "הזינו דומיין, בחרו שאלה מסחרית, וצפו בהחלטה נבנית מחדש." },
    "/en/app/campaign-readiness": { name: "מוכנות קמפיין", desc: "האם כדאי להשיק את הקמפיין הזה היום? בוחן את העסק, לא את הקמפיין." },
    "/en/app/narrative": { name: "מודיעין נרטיבי", desc: "איזה סיפור השוק מספר, וכיצד הוא משפיע על החלטות?" },
    "/en/app/actions": { name: "מרכז פעולה אסטרטגי", desc: "התערבויות בסדר עדיפויות עם בעלי אחריות, מועדים ומדידה." },
    "/en/election-intelligence": { name: "מודיעין בחירות", desc: "אילו נרטיבים מניעים את הציבור, מי נושא אותם, ומה צריך להשתנות." },
    "/en/engines/ai-recognition": { name: "זיהוי בינה מלאכותית", desc: "האם מנועי הבינה המלאכותית מבינים מי העסק?" },
    "/en/engines/google-vs-ai": { name: "גוגל מול נראות בבינה מלאכותית", desc: "האם הוא קיים באופן עקבי בשני משטחי הגילוי?" },
    "/en/engines/competitor-decision": { name: "החלטת המתחרה", desc: "מי מקבל את ההחלטה במקומו, ומדוע?" },
    "/en/engines/action": { name: "מודיעין פעולה", desc: "מה צריך לקרות הלאה, מי אחראי, ועד מתי?" },
    "/en/marketplace/category/ai-visibility-intelligence": { name: "מודיעין נראות בבינה מלאכותית", desc: "האם הבינה המלאכותית יודעת שהעסק קיים, ומה היא חושבת שהוא?" },
    "/en/marketplace/category/competitive-intelligence": { name: "מודיעין תחרותי", desc: "מי מקבל את ההחלטה במקומו, ומה יש לו?" },
    "/en/marketplace/category/executive-intelligence": { name: "מודיעין הנהלה", desc: "כמה זה שווה, ומה קורה הלאה?" },
  },
  navFeature: { eyebrow: "חוויית הדגל", title: "שחזרו את ההחלטה.", desc: "עשרה משטחים, שאלה מסחרית אחת, ממה שכל מנוע הבין ועד למה שצריך להשתנות הלאה.", cta: "פתחו את השחזור" },
  hero: {
    eyebrow: "שכבת המודיעין והביצוע לסוכנויות מודרניות",
    headlineLead: "ראו היכן העסק שלכם",
    emphasis: ["מזוהה.", "מומלץ.", "נבחר."],
    supporting: "GeoRepute ממפה את סביבת קבלת ההחלטות סביב העסק שלכם: בינה מלאכותית, חיפוש, מוניטין, מתחרים והאותות שמשפיעים על בחירת הלקוחות.",
    primaryCta: { label: "נתחו את העסק שלי", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "גלו את המודיעין", href: "#signals" },
    scrollHint: "היכנסו למערכת",
  },
  scrollRail: ["כניסה", "בלתי נראה", "אותות", "החלטה", "נקודה עיוורת", "מנועים", "לולאה", "גרף", "הנהלה", "פעולה", "ניתוח"],
  heroPanel: { title: "סביבת קבלת ההחלטות", surfaces: "משטחים במעקב", signals: "אותות שנפתרו", position: "מיקום ההחלטה", state: "בשחזור" },
  capabilityLabels: ["ניתוחי עסק ושיווק מעמיקים", "מנועי בינה מלאכותית, בתוספת גוגל", "שפות", "מדידה מתמשכת"],
  platformsLabel: "GeoRepute סורקת את גוגל ועוד 6 מנועי בינה מלאכותית — המשטחים שבהם העסק שלכם מתגלה",
  invisible: {
    label: "ההחלטה הבלתי נראית",
    headline: "האנליטיקה שלכם מתחילה אחרי שההחלטה כבר עוצבה.",
    body: "עד שהביקור נרשם, הלקוח כבר שאל שאלה, קיבל פרשנות, שקל ראיות והשווה חלופות. כל פלטפורמה שאתם מפעילים מודדת מה קורה אחר כך. אף אחת מהן לא מודדת את זה.",
    pullLead: "פלטפורמות מסורתיות מייעלות ערוצים.",
    pullEmphasis: "GeoRepute משחזרת החלטות.",
    timeline: ["השאלה נשאלת", "הפרשנות מתגבשת", "הראיות נשקלות", "החלופות מושוות", "ההמלצה ניתנת", "ההחלטה מתקבלת", "הביקור נרשם"],
    visibleLabel: "כאן האנליטיקה שלכם מתחילה",
    invisibleLabel: "כאן ההחלטה מתקבלת בפועל",
    notMeasured: "לא נמדד",
  },
  signals: {
    label: "צפו באותות",
    headline: "עשרה מדדים. עמדת החלטה אחת. כל אחד פותח את הראיות שלו.",
    body: "כל אות למטה נמדד באופן בלתי תלוי, ולאחר מכן מתגבש לעמדה אחת לגבי האם העסק שלכם במצב לזכות בהחלטה.",
    items: [
      { name: "זיהוי בינה מלאכותית", q: "האם מנועי הבינה המלאכותית מבינים מי העסק?" },
      { name: "נראות בגוגל", q: "האם העסק נוכח היכן שהחיפוש המסורתי עדיין מכריע?" },
      { name: "נראות בבינה מלאכותית", q: "האם הוא קיים באופן עקבי בשתי משטחי הגילוי?" },
      { name: "סמכות", q: "האם ראיות בלתי תלויות תומכות בטענות שמוצגות?" },
      { name: "אמון", q: "האם השוק רואה בבחירה בעסק בחירה בטוחה?" },
      { name: "הקשר", q: "האם העסק מובן בקטגוריה ובשימוש הנכונים?" },
      { name: "עקביות", q: "האם כל משטח מתאר את אותה ישות באותו אופן?" },
      { name: "התאמה לשוק", q: "האם הביקוש נע לכיוון מה שהעסק באמת מוכר?" },
      { name: "מיצוב תחרותי", q: "מי מקבל את ההחלטה במקומו, ומדוע?" },
      { name: "יישור נרטיבי", q: "איזה סיפור השוק מספר, וכיצד הוא משפיע על החלטות?" },
    ],
    signalCursor: "אות",
  },
  reconstruction: {
    label: "צפו בהחלטה מתגבשת",
    headline: "הזינו דומיין, בחרו שאלה מסחרית, וצפו בהחלטה נבנית מחדש.",
    sampleNote: "דוגמה מעובדת: שחזור להמחשה בלבד, לא נתוני לקוח.",
    query: "אילו ספקי חומרי חיבור תעשייתיים הכי אמינים באמצע המערב האמריקאי?",
    commercialQuestion: "שאלה מסחרית",
    stages: [
      { label: "שאלה", title: "שאלה מסחרית נכנסת למערכת", detail: "לא מילת מפתח. החלטה שמאחוריה קונה, תקציב ולוח זמנים." },
      { label: "פרשנות בינה מלאכותית", title: "המנוע קובע מה השאלה אומרת", detail: "'אמין' מתפרש כאספקה בזמן, עומק הסמכה ועקביות מלאי — עוד לפני שנבחר ספק כלשהו." },
      { label: "ראיות", title: "מקורות בלתי תלויים נשקלים", detail: "ראיות צד שלישי גוברות על טענות שפורסמו עצמאית. עסק בלעדיהן לא נפסל; הוא פשוט לעולם לא משולב בתשובה." },
      { label: "הקשר תחרותי", title: "חלופות נכנסות ומתחרות על התשובה", detail: "כל עסק בקטגוריה נבחן לפי אותם קריטריונים בו-זמנית. מי מקבל את ההחלטה במקומו, ומדוע?" },
      { label: "המלצה", title: "מופקת תשובה בעלת שם", detail: "עד שלושה עסקים מוזכרים בשם. כל השאר נעדרים לחלוטין מההחלטה." },
      { label: "ההחלטה", title: "ההחלטה התקבלה עוד לפני הקליק", detail: "היא לא נוצרה בשלב האחרון. היא הורכבה מכל אות שקדם לה — וזה בדיוק החלק שהאנליטיקה שלכם מעולם לא ראתה." },
    ],
  },
  blindSpot: {
    label: "הנקודה העיוורת",
    headline: "שתי מפות שונות של אותו לקוח.",
    body: "אחת מתחילה כשההחלטה כבר הסתיימה. השנייה מתחילה כשהיא רק נפתחת.",
    alreadyDecided: "כבר הוכרע לפני האירוע הראשון שניתן למדידה",
    axisLabel: "החלטה אחת, משמאל לימין",
    traditionalTitle: "אנליטיקה מסורתית",
    traditionalSteps: ["ביקור", "קליק", "ליד", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["שאלה", "שיקול", "המלצה", "החלטה", "תוצאה"],
  },
  engines: {
    label: "מנועי המודיעין",
    headline: "שנים עשר מנועים. מערכת אחת מחוברת.",
    body: "כל מנוע עונה על שאלה שהאחרים תלויים בה. תשעה מהמנועים המרכזיים ממופים כאן; התמקדו באחד כדי לראות מה הוא מזין.",
    items: [
      { name: "זיהוי בינה מלאכותית", q: "האם מנועי הבינה המלאכותית מבינים מי העסק?" },
      { name: "גוגל מול נראות בבינה מלאכותית", q: "האם הוא קיים באופן עקבי בשני משטחי הגילוי?" },
      { name: "החלטת המתחרה", q: "מי מקבל את ההחלטה במקומו, ומדוע?" },
      { name: "סמכות", q: "האם ראיות בלתי תלויות תומכות בטענות שמוצגות?" },
      { name: "אמון", q: "האם השוק רואה בבחירה בעסק בחירה בטוחה?" },
      { name: "הקשר", q: "האם העסק מובן בקטגוריה הנכונה?" },
      { name: "מודיעין נרטיבי", q: "איזה סיפור השוק מספר, וכיצד הוא משפיע על החלטות?" },
      { name: "מודיעין פעולה", q: "מה צריך לקרות הלאה, מי אחראי, ועד מתי?" },
      { name: "מודיעין הנהלה", q: "עשרה מדדים, עמדת החלטה אחת, כשכל אחד פותח את הראיות שלו." },
    ],
    feedsPrefix: "מזין",
    engineSingular: "מנוע",
    enginePlural: "מנועים",
    idle: "במצב המתנה",
    idleHint: "התמקדו במנוע כדי לבודד את מה שהוא מזין.",
    sourceCursor: "מקור",
    focusCursor: "מיקוד",
  },
  loop: {
    label: "הלולאה הסגורה",
    headline: "מודיעין שמצטבר במקום להתיישן.",
    body: "מדידת PDCA מתמשכת. כל מחזור חוזר לרשת כשהוא מיודע יותר מקודמו.",
    details: ["להבין את המציאות.", "לבצע התערבויות.", "למדוד מה השתנה.", "להחליט מה הלאה."],
    everyCycle: "כל מחזור",
    returnsBetter: "חוזר מיודע יותר",
  },
  decisionGraph: {
    label: "גרף ההחלטה",
    headline: "הסביבה, הפכה לניתנת לבדיקה.",
    body: "התמקדו בכל צומת כדי לבודד את מה שמתחבר אליו. נתיבים לא קשורים דועכים; ראיות תומכות מתבהרות.",
    barLabel: "גרף ההחלטה",
    allPaths: "כל הנתיבים",
    isolating: "מבודד את",
    nodesLabel: "צמתים",
    edgesLabel: "קשתות",
    nodes: [
      { name: "קלט", kind: "אות", detail: "השאלה המסחרית, השוק שאליו היא נכנסת, ומי שואל אותה.", evidence: ["סוג כוונת השאילתה", "שלב הקונה", "גבול הקטגוריה"] },
      { name: "פרשנות", kind: "מודל", detail: "כיצד מנועי בינה מלאכותית פותרים שפה מעורפלת לכדי קריטריונים קונקרטיים.", evidence: ["חילוץ קריטריונים", "זיהוי ישות", "מיפוי קטגוריה"] },
      { name: "שוק", kind: "סביבה", detail: "כיוון הביקוש, לחץ נרטיבי, ומי עוד מתחרה על התשובה.", evidence: ["תנועה נרטיבית", "שינוי בביקוש", "צפיפות תחרותית"] },
      { name: "ערוץ", kind: "משטח", detail: "גוגל ושישה מנועי בינה מלאכותית: המשטחים שבהם מורכבת התשובה.", evidence: ["נוכחות בגוגל", "כיסוי מנועי בינה מלאכותית", "עקביות בין משטחים"] },
      { name: "תוצאה", kind: "תוצאה", detail: "האם העסק מוזכר בשם, נשקל, או נעדר מההחלטה.", evidence: ["שיעור אזכור בשם", "קבוצת שיקול", "סיבת היעדרות"] },
      { name: "פעולה", kind: "התערבות", detail: "התערבויות בסדר עדיפויות עם בעלי אחריות, מועדים ומדידה.", evidence: ["בעל אחריות שהוקצה", "מועד שנקבע", "מדידה שהוגדרה"] },
    ],
    supportingEvidence: "ראיות תומכות",
    noNodeSelected: "לא נבחר צומת",
    noNodeHint: "התמקדו בכל צומת כדי לבודד את מה שמתחבר אליו ולפתוח את ראיותיו.",
    isolateCursor: "בידוד",
  },
  executive: {
    label: "מודיעין הנהלה",
    headline: "עשרה מדדים, עמדת החלטה אחת.",
    body: "כל מדד פותח את הראיות שלו. העמדה היא בדיוק מה שההנהלה מבקשת בפועל.",
    sampleNote: "קריאה לדוגמה: ערכים להמחשה בלבד להצגת הממשק.",
    positionLabel: "עמדת ההחלטה",
    positionState: "שנויה במחלוקת",
    measureNames: ["זיהוי בינה מלאכותית", "נראות בגוגל", "נראות בבינה מלאכותית", "סמכות", "אמון", "הקשר", "עקביות", "התאמה לשוק", "מיצוב תחרותי", "יישור נרטיבי"],
    outOf100: "מתוך 100",
  },
  actionPlan: {
    label: "מתובנה לפעולה",
    headline: "התערבויות בסדר עדיפויות עם בעלי אחריות, מועדים ומדידה.",
    body: "המערכת לא נעצרת בניתוח. היא מתגבשת לרצף שמישהו יכול להיות אחראי עליו.",
    movesLabel: "משפיע על",
    ownerLabel: "אחראי",
    horizonLabel: "לוח זמנים",
    items: [
      { title: "לחזק ראיות סמכות בלתי תלויות", measure: "סמכות", owner: "אסטרטגיה", horizon: "30 יום" },
      { title: "לפרסם תיאור ישות קנוני", measure: "עקביות", owner: "תוכן", horizon: "14 יום" },
      { title: "לפתור בלבול ישות בין משטחים", measure: "זיהוי בינה מלאכותית", owner: "טכני", horizon: "21 יום" },
      { title: "לבנות תוכן השוואתי מול חלופות בשם", measure: "מיצוב תחרותי", owner: "תוכן", horizon: "45 יום" },
      { title: "להעביר תקציב מדיה בתשלום לעבר החלטות שנויות במחלוקת", measure: "התאמה לשוק", owner: "מדיה", horizon: "30 יום" },
    ],
  },
  finalCta: {
    label: "נתחו את העסק שלי",
    headline: "ההחלטה כבר מתרחשת עכשיו.",
    body: "GeoRepute מראה לכם היכן היא מתרחשת, מדוע היא זזה, ומה לשנות הלאה.",
    primaryCta: "נתחו את העסק שלי",
    secondaryCta: "קבעו תדריך להנהלה",
  },
  footer: {
    tagline: "שכבת המודיעין והביצוע לסוכנויות מודרניות.",
    note: "פלטפורמות מסורתיות מייעלות ערוצים. GeoRepute משחזרת החלטות.",
  },
};

const ar: Copy = {
  nav: { platform: "المنصة", engines: "محركات الذكاء", marketplace: "سوق الذكاء", how: "كيف تعمل", methodology: "المنهجية", signIn: "تسجيل الدخول", cta: "ابدأوا التحليل", moreEngines: "شاهدوا محركات الذكاء الاثني عشر", moreMarketplace: "استكشفوا منظومة الذكاء", language: "اللغة" },
  navItems: {
    "/en/app/mission-control": { name: "مركز التحكم التنفيذي", desc: "عشرة مقاييس، موقع قرار واحد، كل منها يفتح أدلته." },
    "/en/app/reconstruct": { name: "إعادة بناء القرار", desc: "أدخلوا نطاقًا، اختاروا سؤالًا تجاريًا، وشاهدوا القرار يُعاد بناؤه." },
    "/en/app/campaign-readiness": { name: "جاهزية الحملة", desc: "هل يجب إطلاق هذه الحملة اليوم؟ يقيّم النشاط التجاري، لا الحملة." },
    "/en/app/narrative": { name: "ذكاء السردية", desc: "ما القصة التي يرويها السوق، وكيف تؤثر في القرارات؟" },
    "/en/app/actions": { name: "مركز الإجراءات الاستراتيجية", desc: "تدخلات ذات أولوية مع مسؤولين ومواعيد نهائية وقياس." },
    "/en/election-intelligence": { name: "ذكاء الانتخابات", desc: "أي السرديات تحرّك الناخبين، ومن يحملها، وما الذي يجب أن يتغيّر." },
    "/en/engines/ai-recognition": { name: "التعرّف عبر الذكاء الاصطناعي", desc: "هل تفهم محركات الذكاء الاصطناعي هوية النشاط التجاري؟" },
    "/en/engines/google-vs-ai": { name: "جوجل مقابل الظهور عبر الذكاء الاصطناعي", desc: "هل يظهر باتساق عبر واجهتي الاكتشاف كلتيهما؟" },
    "/en/engines/competitor-decision": { name: "قرار المنافس", desc: "من يحصل على القرار بدلًا منه، ولماذا؟" },
    "/en/engines/action": { name: "ذكاء الإجراءات", desc: "ما الذي يجب أن يحدث تاليًا، ومن يتولاه، وبحلول متى؟" },
    "/en/marketplace/category/ai-visibility-intelligence": { name: "ذكاء الظهور عبر الذكاء الاصطناعي", desc: "هل يعرف الذكاء الاصطناعي أن النشاط موجود، وماذا يظن أنه يكون؟" },
    "/en/marketplace/category/competitive-intelligence": { name: "الذكاء التنافسي", desc: "من يحصل على القرار بدلًا منه، وماذا لديه؟" },
    "/en/marketplace/category/executive-intelligence": { name: "الذكاء التنفيذي", desc: "كم تبلغ قيمته، وماذا يحدث بعد ذلك؟" },
  },
  navFeature: { eyebrow: "تجربة مميزة", title: "إعادة بناء القرار.", desc: "عشر واجهات، سؤال تجاري واحد، من ما فهمه كل محرك إلى ما يجب أن يتغيّر تاليًا.", cta: "افتحوا إعادة البناء" },
  hero: {
    eyebrow: "طبقة الذكاء والتنفيذ لوكالات التسويق الحديثة",
    headlineLead: "اعرفوا أين يُعرَف نشاطكم التجاري",
    emphasis: ["ويُوصى به.", "ويُختار."],
    supporting: "ترسم GeoRepute بيئة القرار حول نشاطكم التجاري: عبر الذكاء الاصطناعي والبحث والسمعة والمنافسين والإشارات التي تؤثر في ما يختاره العملاء.",
    primaryCta: { label: "حلّلوا نشاطكم التجاري", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "استكشفوا الذكاء", href: "#signals" },
    scrollHint: "ادخلوا إلى النظام",
  },
  scrollRail: ["دخول", "غير مرئي", "إشارات", "قرار", "نقطة عمياء", "محركات", "حلقة", "مخطط", "تنفيذي", "إجراء", "تحليل"],
  heroPanel: { title: "بيئة القرار", surfaces: "الواجهات المراقَبة", signals: "الإشارات المحلولة", position: "موقع القرار", state: "قيد إعادة البناء" },
  capabilityLabels: ["تحليلات تجارية وتسويقية معمّقة", "محركات ذكاء اصطناعي، بالإضافة إلى جوجل", "لغات", "قياس مستمر"],
  platformsLabel: "تفحص GeoRepute جوجل وستة محركات ذكاء اصطناعي أخرى — الواجهات التي يُكتشف فيها نشاطكم التجاري",
  invisible: {
    label: "القرار غير المرئي",
    headline: "تحليلاتكم تبدأ بعد أن يكون القرار قد تشكّل بالفعل.",
    body: "بحلول وقت تسجيل الزيارة، يكون العميل قد طرح سؤالًا، وتلقّى تفسيرًا، ووازن بين الأدلة، وقارنكم بالبدائل. كل منصة تشغّلونها تقيس ما يحدث بعد ذلك. لا شيء منها يقيس ما سبق.",
    pullLead: "المنصات التقليدية تُحسّن القنوات.",
    pullEmphasis: "أما GeoRepute فتُعيد بناء القرارات.",
    timeline: ["طُرح السؤال", "تشكّل التفسير", "وُزنت الأدلة", "قُورنت البدائل", "قُدّمت التوصية", "اتُّخذ القرار", "سُجّلت الزيارة"],
    visibleLabel: "هنا تبدأ تحليلاتكم",
    invisibleLabel: "هنا يُتّخذ القرار فعليًا",
    notMeasured: "غير مقاس",
  },
  signals: {
    label: "اطّلعوا على الإشارات",
    headline: "عشرة مقاييس. موقع قرار واحد. كل واحد يفتح أدلته.",
    body: "يُقاس كل إشارة أدناه بشكل مستقل، ثم تتجمّع في موقع واحد يحدد ما إذا كان نشاطكم في وضع يؤهله للفوز بالقرار.",
    items: [
      { name: "التعرّف عبر الذكاء الاصطناعي", q: "هل تفهم محركات الذكاء الاصطناعي هوية النشاط التجاري؟" },
      { name: "الظهور في جوجل", q: "هل يظهر النشاط التجاري حيث لا يزال البحث التقليدي يحسم القرار؟" },
      { name: "الظهور عبر الذكاء الاصطناعي", q: "هل يظهر باتساق عبر واجهتي الاكتشاف كلتيهما؟" },
      { name: "السلطة المرجعية", q: "هل تدعم أدلة مستقلة الادعاءات المطروحة؟" },
      { name: "الثقة", q: "هل يعتبر السوق اختيار هذا النشاط آمنًا؟" },
      { name: "السياق", q: "هل يُفهم النشاط في الفئة والاستخدام الصحيحين؟" },
      { name: "الاتساق", q: "هل تصف كل واجهة الكيان نفسه بالطريقة نفسها؟" },
      { name: "ملاءمة السوق", q: "هل يتجه الطلب نحو ما يبيعه النشاط فعليًا؟" },
      { name: "الموقع التنافسي", q: "من يحصل على القرار بدلًا منه، ولماذا؟" },
      { name: "اتساق السردية", q: "ما القصة التي يرويها السوق، وكيف تؤثر في القرارات؟" },
    ],
    signalCursor: "إشارة",
  },
  reconstruction: {
    label: "شاهدوا قرارًا يتشكّل",
    headline: "أدخلوا نطاقًا، اختاروا سؤالًا تجاريًا، وشاهدوا القرار يُعاد بناؤه.",
    sampleNote: "مثال توضيحي: إعادة بناء توضيحية، وليست بيانات عملاء.",
    query: "ما هي أكثر شركات توريد المشدات الصناعية موثوقية في الغرب الأوسط؟",
    commercialQuestion: "السؤال التجاري",
    stages: [
      { label: "السؤال", title: "سؤال تجاري يدخل النظام", detail: "ليس كلمة مفتاحية، بل قرار يقف خلفه مشترٍ وميزانية وموعد نهائي." },
      { label: "تفسير الذكاء الاصطناعي", title: "يقرر المحرك ما يعنيه السؤال", detail: "تُترجم كلمة 'موثوق' إلى التسليم في الوقت المحدد وعمق الشهادات واتساق التوفر، قبل النظر في أي مورّد." },
      { label: "الأدلة", title: "تُوزَن المصادر المستقلة", detail: "الأدلة من طرف ثالث تتفوق على الادعاءات المنشورة ذاتيًا. غيابها لا يستبعد الشركة؛ بل يعني ببساطة أنها لن تُدرَج أبدًا في الإجابة." },
      { label: "السياق التنافسي", title: "تدخل البدائل للتنافس على الإجابة", detail: "تُقيَّم كل شركة في الفئة وفق المعايير نفسها في الوقت ذاته. من يحصل على القرار بدلًا منها، ولماذا؟" },
      { label: "التوصية", title: "تُنتَج إجابة محددة بالاسم", detail: "تُذكر من شركة إلى ثلاث شركات بالاسم. جميع البقية غائبة تمامًا عن القرار." },
      { label: "القرار", title: "اتُّخذ القرار قبل النقرة", detail: "لم يُصنع في الخطوة الأخيرة، بل تجمّع من كل إشارة سبقته؛ وهذا هو الجزء الذي لم تره تحليلاتكم أبدًا." },
    ],
  },
  blindSpot: {
    label: "النقطة العمياء",
    headline: "خريطتان مختلفتان لنفس العميل.",
    body: "إحداهما تبدأ بعد انتهاء القرار فعليًا. والأخرى تبدأ عندما يبدأ هو.",
    alreadyDecided: "تقرّر بالفعل قبل أول حدث قابل للقياس",
    axisLabel: "قرار واحد، من اليسار إلى اليمين",
    traditionalTitle: "التحليلات التقليدية",
    traditionalSteps: ["زيارة", "نقرة", "عميل محتمل", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["السؤال", "الدراسة", "التوصية", "القرار", "النتيجة"],
  },
  engines: {
    label: "محركات الذكاء",
    headline: "اثنا عشر محركًا. نظام واحد مترابط.",
    body: "يجيب كل محرك عن سؤال تعتمد عليه المحركات الأخرى. تُعرض هنا تسعة من المحركات الأساسية؛ ركّزوا على واحد لرؤية ما يغذّيه.",
    items: [
      { name: "التعرّف عبر الذكاء الاصطناعي", q: "هل تفهم محركات الذكاء الاصطناعي هوية النشاط التجاري؟" },
      { name: "جوجل مقابل الظهور عبر الذكاء الاصطناعي", q: "هل يظهر باتساق عبر واجهتي الاكتشاف كلتيهما؟" },
      { name: "قرار المنافس", q: "من يحصل على القرار بدلًا منه، ولماذا؟" },
      { name: "السلطة المرجعية", q: "هل تدعم أدلة مستقلة الادعاءات المطروحة؟" },
      { name: "الثقة", q: "هل يعتبر السوق اختيار هذا النشاط آمنًا؟" },
      { name: "السياق", q: "هل يُفهم النشاط في الفئة الصحيحة؟" },
      { name: "ذكاء السردية", q: "ما القصة التي يرويها السوق، وكيف تؤثر في القرارات؟" },
      { name: "ذكاء الإجراءات", q: "ما الذي يجب أن يحدث تاليًا، ومن يتولاه، وبحلول متى؟" },
      { name: "الذكاء التنفيذي", q: "عشرة مقاييس، موقع قرار واحد، كل منها يفتح أدلته." },
    ],
    feedsPrefix: "يغذّي",
    engineSingular: "محركًا واحدًا",
    enginePlural: "محركات",
    idle: "خامل",
    idleHint: "ركّزوا على محرك لعزل ما يغذّيه.",
    sourceCursor: "المصدر",
    focusCursor: "تركيز",
  },
  loop: {
    label: "الحلقة المغلقة",
    headline: "ذكاء يتراكم بدلاً من أن ينتهي.",
    body: "قياس مستمر وفق دورة PDCA. كل دورة تعود إلى الشبكة بمعرفة أعمق من سابقتها.",
    details: ["فهم الواقع.", "تنفيذ الإجراءات.", "قياس ما تغيّر.", "تحديد الخطوة التالية."],
    everyCycle: "كل دورة",
    returnsBetter: "تعود بمعرفة أعمق",
  },
  decisionGraph: {
    label: "مخطط القرار",
    headline: "البيئة، قابلة للفحص.",
    body: "ركّزوا على أي عقدة لعزل ما يتصل بها. المسارات غير ذات الصلة تخفت؛ والأدلة الداعمة تتّضح.",
    barLabel: "مخطط القرار",
    allPaths: "كل المسارات",
    isolating: "عزل",
    nodesLabel: "عقد",
    edgesLabel: "روابط",
    nodes: [
      { name: "المدخل", kind: "إشارة", detail: "السؤال التجاري، والسوق الذي يدخله، ومن يطرحه.", evidence: ["فئة نية الاستعلام", "مرحلة المشتري", "حدود الفئة"] },
      { name: "التفسير", kind: "نموذج", detail: "كيف تحوّل محركات الذكاء الاصطناعي اللغة الغامضة إلى معايير ملموسة.", evidence: ["استخلاص المعايير", "تحديد الكيان", "تخطيط الفئات"] },
      { name: "السوق", kind: "بيئة", detail: "اتجاه الطلب، وضغط السردية، ومن ينافس أيضًا على الإجابة.", evidence: ["حركة السردية", "تحوّل الطلب", "كثافة المنافسة"] },
      { name: "القناة", kind: "واجهة", detail: "جوجل وستة محركات ذكاء اصطناعي: الواجهات التي تُجمَع فيها الإجابة.", evidence: ["الحضور في جوجل", "تغطية محركات الذكاء الاصطناعي", "اتساق الواجهات"] },
      { name: "النتيجة", kind: "نتيجة", detail: "هل تُذكر الشركة بالاسم، أم تُدرَج ضمن الخيارات المدروسة، أم تغيب عن القرار.", evidence: ["معدل الذكر بالاسم", "مجموعة الدراسة", "سبب الغياب"] },
      { name: "الإجراء", kind: "تدخّل", detail: "تدخلات ذات أولوية مع مسؤولين ومواعيد نهائية وقياس.", evidence: ["تعيين مسؤول", "تحديد موعد نهائي", "ربط القياس"] },
    ],
    supportingEvidence: "الأدلة الداعمة",
    noNodeSelected: "لم يتم اختيار أي عقدة",
    noNodeHint: "ركّزوا على أي عقدة لعزل ما يتصل بها وفتح أدلتها.",
    isolateCursor: "عزل",
  },
  executive: {
    label: "الذكاء التنفيذي",
    headline: "عشرة مقاييس، موقع قرار واحد.",
    body: "يفتح كل مقياس أدلته الخاصة. الموقع هو ما يطلبه مجلس الإدارة فعليًا.",
    sampleNote: "قراءة توضيحية: قيم تمثيلية معروضة لعرض الواجهة.",
    positionLabel: "موقع القرار",
    positionState: "محل نزاع",
    measureNames: ["التعرّف عبر الذكاء الاصطناعي", "الظهور في جوجل", "الظهور عبر الذكاء الاصطناعي", "السلطة المرجعية", "الثقة", "السياق", "الاتساق", "ملاءمة السوق", "الموقع التنافسي", "اتساق السردية"],
    outOf100: "من أصل 100",
  },
  actionPlan: {
    label: "من الرؤية إلى الإجراء",
    headline: "تدخلات ذات أولوية مع مسؤولين ومواعيد نهائية وقياس.",
    body: "لا يتوقف النظام عند التحليل، بل يتحول إلى تسلسل يمكن مساءلة شخص عنه.",
    movesLabel: "يؤثر على",
    ownerLabel: "المسؤول",
    horizonLabel: "المهلة",
    items: [
      { title: "تعزيز أدلة المصداقية المستقلة", measure: "السلطة المرجعية", owner: "الاستراتيجية", horizon: "30 يومًا" },
      { title: "نشر وصف موحّد للكيان", measure: "الاتساق", owner: "المحتوى", horizon: "14 يومًا" },
      { title: "حل التباس الكيان عبر الواجهات", measure: "التعرّف عبر الذكاء الاصطناعي", owner: "التقني", horizon: "21 يومًا" },
      { title: "بناء محتوى مقارن مقابل البدائل المذكورة بالاسم", measure: "الموقع التنافسي", owner: "المحتوى", horizon: "45 يومًا" },
      { title: "إعادة توزيع الإنفاق المدفوع نحو القرارات محل النزاع", measure: "ملاءمة السوق", owner: "الإعلام", horizon: "30 يومًا" },
    ],
  },
  finalCta: {
    label: "تحليل نشاطي التجاري",
    headline: "القرار يحدث الآن بالفعل.",
    body: "توضح لكم GeoRepute أين يحدث، ولماذا يتغيّر، وما الذي يجب تغييره تاليًا.",
    primaryCta: "حلّلوا نشاطكم التجاري",
    secondaryCta: "احجزوا إحاطة تنفيذية",
  },
  footer: {
    tagline: "طبقة الذكاء والتنفيذ لوكالات التسويق الحديثة.",
    note: "المنصات التقليدية تُحسّن القنوات. أما GeoRepute فتُعيد بناء القرارات.",
  },
};

const ru: Copy = {
  nav: { platform: "Платформа", engines: "Аналитические движки", marketplace: "Маркетплейс интеллекта", how: "Как это работает", methodology: "Методология", signIn: "Вход", cta: "Начать анализ", moreEngines: "Все двенадцать движков", moreMarketplace: "Вся экосистема интеллекта", language: "Язык" },
  navItems: {
    "/en/app/mission-control": { name: "Центр управления руководителя", desc: "Десять показателей, одна позиция решения, у каждой — своя доказательная база." },
    "/en/app/reconstruct": { name: "Реконструкция решения", desc: "Введите домен, выберите коммерческий вопрос — и наблюдайте, как решение восстанавливается заново." },
    "/en/app/campaign-readiness": { name: "Готовность кампании", desc: "Стоит ли запускать эту кампанию сегодня? Оценивает бизнес, а не кампанию." },
    "/en/app/narrative": { name: "Нарративная аналитика", desc: "Какую историю рассказывает рынок и как она влияет на решения?" },
    "/en/app/actions": { name: "Центр стратегических действий", desc: "Приоритизированные меры с ответственными, сроками и измерением." },
    "/en/election-intelligence": { name: "Электоральная аналитика", desc: "Какие нарративы движут электоратом, кто их продвигает и что нужно изменить." },
    "/en/engines/ai-recognition": { name: "Распознавание ИИ", desc: "Понимают ли ИИ-системы, кто эта компания?" },
    "/en/engines/google-vs-ai": { name: "Google против видимости в ИИ", desc: "Существует ли она одинаково на обеих поверхностях обнаружения?" },
    "/en/engines/competitor-decision": { name: "Решение в пользу конкурента", desc: "Кто получает решение вместо неё, и почему?" },
    "/en/engines/action": { name: "Аналитика действий", desc: "Что должно произойти дальше, кем и к какому сроку?" },
    "/en/marketplace/category/ai-visibility-intelligence": { name: "Аналитика видимости в ИИ", desc: "Знает ли ИИ о существовании компании, и что он о ней думает?" },
    "/en/marketplace/category/competitive-intelligence": { name: "Конкурентная аналитика", desc: "Кто получает решение вместо неё, и что у него есть?" },
    "/en/marketplace/category/executive-intelligence": { name: "Руководящая аналитика", desc: "Сколько это стоит, и что будет дальше?" },
  },
  navFeature: { eyebrow: "Фирменный опыт", title: "Реконструировать решение.", desc: "Десять поверхностей, один коммерческий вопрос — от того, что понял каждый движок, до того, что нужно изменить дальше.", cta: "Открыть реконструкцию" },
  hero: {
    eyebrow: "Слой интеллекта и исполнения для современных агентств",
    headlineLead: "Узнайте, где ваш бизнес",
    emphasis: ["распознают.", "рекомендуют.", "выбирают."],
    supporting: "GeoRepute отображает среду принятия решений вокруг вашего бизнеса: ИИ, поиск, репутацию, конкурентов и сигналы, влияющие на выбор клиентов.",
    primaryCta: { label: "Анализировать мой бизнес", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "Изучить интеллект", href: "#signals" },
    scrollHint: "Войти в систему",
  },
  scrollRail: ["Вход", "Невидимое", "Сигналы", "Решение", "Слепая зона", "Движки", "Цикл", "Граф", "Руководство", "Действие", "Анализ"],
  heroPanel: { title: "Среда принятия решений", surfaces: "Отслеживаемые поверхности", signals: "Разрешённые сигналы", position: "Позиция решения", state: "Восстановление" },
  capabilityLabels: ["Глубокий бизнес- и маркетинговый анализ", "ИИ-системы, плюс Google", "Языки", "Непрерывное измерение"],
  platformsLabel: "GeoRepute сканирует Google и ещё 6 ИИ-систем — поверхности, на которых обнаруживают ваш бизнес",
  invisible: {
    label: "Невидимое решение",
    headline: "Ваша аналитика начинается уже после того, как решение сформировалось.",
    body: "К моменту, когда фиксируется визит, клиент уже задал вопрос, получил интерпретацию, взвесил доказательства и сравнил вас с альтернативами. Каждая ваша платформа измеряет то, что происходит после. Ни одна не измеряет это.",
    pullLead: "Традиционные платформы оптимизируют каналы.",
    pullEmphasis: "GeoRepute восстанавливает решения.",
    timeline: ["Вопрос задан", "Интерпретация сформирована", "Доказательства взвешены", "Альтернативы сравнены", "Рекомендация дана", "Решение принято", "Визит зафиксирован"],
    visibleLabel: "Здесь начинается ваша аналитика",
    invisibleLabel: "Здесь решение принимается на самом деле",
    notMeasured: "не измеряется",
  },
  signals: {
    label: "Смотрите сигналы",
    headline: "Десять показателей. Одна позиция решения. Каждый раскрывает свои доказательства.",
    body: "Каждый сигнал ниже измеряется независимо, а затем сводится в единую позицию — готов ли ваш бизнес выиграть решение.",
    items: [
      { name: "Распознавание ИИ", q: "Понимают ли ИИ-системы, кто эта компания?" },
      { name: "Видимость в Google", q: "Присутствует ли компания там, где решение всё ещё принимает обычный поиск?" },
      { name: "Видимость в ИИ", q: "Существует ли она одинаково на обеих поверхностях обнаружения?" },
      { name: "Авторитетность", q: "Подтверждают ли независимые источники заявленное?" },
      { name: "Доверие", q: "Считает ли рынок компанию безопасным выбором?" },
      { name: "Контекст", q: "Понимают ли компанию в правильной категории и сценарии использования?" },
      { name: "Согласованность", q: "Описывает ли каждая поверхность одну и ту же сущность одинаково?" },
      { name: "Соответствие рынку", q: "Движется ли спрос к тому, что компания действительно продаёт?" },
      { name: "Конкурентная позиция", q: "Кто получает решение вместо неё, и почему?" },
      { name: "Согласованность нарратива", q: "Какую историю рассказывает рынок и как она влияет на решения?" },
    ],
    signalCursor: "Сигнал",
  },
  reconstruction: {
    label: "Наблюдайте, как формируется решение",
    headline: "Введите домен, выберите коммерческий вопрос — и наблюдайте, как решение восстанавливается заново.",
    sampleNote: "Рабочий пример: иллюстративная реконструкция, не данные клиента.",
    query: "Какие поставщики промышленного крепежа наиболее надёжны на Среднем Западе?",
    commercialQuestion: "Коммерческий вопрос",
    stages: [
      { label: "Вопрос", title: "Коммерческий вопрос поступает в систему", detail: "Это не ключевое слово. Это решение, за которым стоит покупатель, бюджет и срок." },
      { label: "Интерпретация ИИ", title: "Система решает, что означает вопрос", detail: "«Надёжный» раскладывается на своевременность поставок, глубину сертификации и стабильность запасов — ещё до рассмотрения поставщиков." },
      { label: "Доказательства", title: "Взвешиваются независимые источники", detail: "Стороннее подтверждение важнее самопубликуемых заявлений. Без него компанию не исключают — её просто никогда не включают в ответ." },
      { label: "Конкурентный контекст", title: "Альтернативы вступают в борьбу за ответ", detail: "Каждая компания в категории оценивается по одним и тем же критериям одновременно. Кто получает решение вместо неё, и почему?" },
      { label: "Рекомендация", title: "Формируется именованный ответ", detail: "Называются от одной до трёх компаний. Все остальные полностью отсутствуют в решении." },
      { label: "Решение", title: "Решение было принято до клика", detail: "Оно не создавалось на последнем шаге. Оно собиралось из каждого предыдущего сигнала — и это та часть, которую ваша аналитика никогда не видела." },
    ],
  },
  blindSpot: {
    label: "Слепая зона",
    headline: "Две разные карты одного и того же клиента.",
    body: "Одна начинается, когда решение уже принято. Другая — когда оно только зарождается.",
    alreadyDecided: "Решено ещё до первого измеримого события",
    axisLabel: "Одно решение, слева направо",
    traditionalTitle: "Обычная аналитика",
    traditionalSteps: ["Визит", "Клик", "Лид", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["Вопрос", "Рассмотрение", "Рекомендация", "Решение", "Итог"],
  },
  engines: {
    label: "Аналитические движки",
    headline: "Двенадцать движков. Единая связанная система.",
    body: "Каждый движок отвечает на вопрос, от которого зависят остальные. Здесь показаны девять ключевых движков — выберите один, чтобы увидеть, что он питает.",
    items: [
      { name: "Распознавание ИИ", q: "Понимают ли ИИ-системы, кто эта компания?" },
      { name: "Google против видимости в ИИ", q: "Существует ли она одинаково на обеих поверхностях обнаружения?" },
      { name: "Решение в пользу конкурента", q: "Кто получает решение вместо неё, и почему?" },
      { name: "Авторитетность", q: "Подтверждают ли независимые источники заявленное?" },
      { name: "Доверие", q: "Считает ли рынок компанию безопасным выбором?" },
      { name: "Контекст", q: "Понимают ли компанию в правильной категории?" },
      { name: "Нарративная аналитика", q: "Какую историю рассказывает рынок и как она влияет на решения?" },
      { name: "Аналитика действий", q: "Что должно произойти дальше, кем и к какому сроку?" },
      { name: "Руководящая аналитика", q: "Десять показателей, одна позиция решения, у каждой — своя доказательная база." },
    ],
    feedsPrefix: "Питает",
    engineSingular: "движок",
    enginePlural: "движка",
    idle: "Ожидание",
    idleHint: "Выберите движок, чтобы изолировать то, что он питает.",
    sourceCursor: "Источник",
    focusCursor: "Фокус",
  },
  loop: {
    label: "Замкнутый цикл",
    headline: "Аналитика, которая накапливается, а не устаревает.",
    body: "Непрерывное измерение по циклу PDCA. Каждый цикл возвращает сети более полное понимание, чем предыдущий.",
    details: ["Понять реальность.", "Выполнить меры.", "Измерить, что изменилось.", "Решить, что дальше."],
    everyCycle: "Каждый цикл",
    returnsBetter: "возвращается более осведомлённым",
  },
  decisionGraph: {
    label: "Граф решений",
    headline: "Среда, доступная для анализа.",
    body: "Выберите любой узел, чтобы изолировать связанные с ним элементы. Несвязанные пути гаснут, а подтверждающие доказательства проявляются.",
    barLabel: "Граф решений",
    allPaths: "Все пути",
    isolating: "Изоляция",
    nodesLabel: "узлов",
    edgesLabel: "рёбер",
    nodes: [
      { name: "Вход", kind: "Сигнал", detail: "Коммерческий вопрос, рынок, в который он поступает, и кто его задаёт.", evidence: ["Класс намерения запроса", "Этап покупателя", "Граница категории"] },
      { name: "Интерпретация", kind: "Модель", detail: "Как ИИ-системы превращают неоднозначный язык в конкретные критерии.", evidence: ["Извлечение критериев", "Разрешение сущностей", "Сопоставление категорий"] },
      { name: "Рынок", kind: "Среда", detail: "Направление спроса, нарративное давление и кто ещё борется за ответ.", evidence: ["Движение нарратива", "Сдвиг спроса", "Плотность конкуренции"] },
      { name: "Канал", kind: "Поверхность", detail: "Google и шесть ИИ-систем: поверхности, где собирается ответ.", evidence: ["Присутствие в Google", "Охват ИИ-систем", "Согласованность поверхностей"] },
      { name: "Итог", kind: "Результат", detail: "Названа ли компания, рассматривается ли она, или отсутствует в решении.", evidence: ["Доля упоминаний", "Набор рассмотрения", "Причина отсутствия"] },
      { name: "Действие", kind: "Вмешательство", detail: "Приоритизированные меры с ответственными, сроками и измерением.", evidence: ["Назначен ответственный", "Установлен срок", "Привязано измерение"] },
    ],
    supportingEvidence: "Подтверждающие доказательства",
    noNodeSelected: "Узел не выбран",
    noNodeHint: "Выберите любой узел, чтобы изолировать связанные с ним элементы и открыть доказательства.",
    isolateCursor: "Изолировать",
  },
  executive: {
    label: "Руководящая аналитика",
    headline: "Десять показателей, одна позиция решения.",
    body: "Каждый показатель раскрывает собственные доказательства. Позиция — это именно то, что запрашивает совет директоров.",
    sampleNote: "Пример показаний: иллюстративные значения для демонстрации интерфейса.",
    positionLabel: "Позиция решения",
    positionState: "Оспаривается",
    measureNames: ["Распознавание ИИ", "Видимость в Google", "Видимость в ИИ", "Авторитетность", "Доверие", "Контекст", "Согласованность", "Соответствие рынку", "Конкурентная позиция", "Согласованность нарратива"],
    outOf100: "из 100",
  },
  actionPlan: {
    label: "От анализа к действию",
    headline: "Приоритизированные меры с ответственными, сроками и измерением.",
    body: "Система не останавливается на анализе. Она превращается в последовательность, за которую кто-то несёт ответственность.",
    movesLabel: "Влияет на",
    ownerLabel: "Ответственный",
    horizonLabel: "Срок",
    items: [
      { title: "Укрепить независимые доказательства авторитетности", measure: "Авторитетность", owner: "Стратегия", horizon: "30 дней" },
      { title: "Опубликовать каноническое описание сущности", measure: "Согласованность", owner: "Контент", horizon: "14 дней" },
      { title: "Устранить путаницу сущности между поверхностями", measure: "Распознавание ИИ", owner: "Технический отдел", horizon: "21 день" },
      { title: "Создать сравнительный контент против названных альтернатив", measure: "Конкурентная позиция", owner: "Контент", horizon: "45 дней" },
      { title: "Перераспределить платный бюджет в пользу оспариваемых решений", measure: "Соответствие рынку", owner: "Медиа", horizon: "30 дней" },
    ],
  },
  finalCta: {
    label: "Анализировать мой бизнес",
    headline: "Решение уже принимается прямо сейчас.",
    body: "GeoRepute показывает, где это происходит, почему меняется и что изменить дальше.",
    primaryCta: "Анализировать мой бизнес",
    secondaryCta: "Записаться на брифинг для руководителей",
  },
  footer: {
    tagline: "Слой интеллекта и исполнения для современных агентств.",
    note: "Традиционные платформы оптимизируют каналы. GeoRepute восстанавливает решения.",
  },
};

const fr: Copy = {
  nav: { platform: "Plateforme", engines: "Moteurs d’intelligence", marketplace: "Marketplace de l’intelligence", how: "Comment ça marche", methodology: "Méthodologie", signIn: "Connexion", cta: "Lancer l’analyse", moreEngines: "Voir les douze moteurs", moreMarketplace: "Voir tout l’écosystème", language: "Langue" },
  navItems: {
    "/en/app/mission-control": { name: "Centre de contrôle exécutif", desc: "Dix mesures, une position de décision, chacune ouvrant ses preuves." },
    "/en/app/reconstruct": { name: "Reconstruction de décision", desc: "Entrez un domaine, choisissez une question commerciale, regardez la décision se reconstruire." },
    "/en/app/campaign-readiness": { name: "Préparation de campagne", desc: "Devons-nous lancer cette campagne aujourd’hui ? Évalue l’entreprise, pas la campagne." },
    "/en/app/narrative": { name: "Intelligence narrative", desc: "Quelle histoire le marché raconte-t-il, et comment influence-t-elle les décisions ?" },
    "/en/app/actions": { name: "Centre d’action stratégique", desc: "Interventions priorisées avec responsables, échéances et mesure." },
    "/en/election-intelligence": { name: "Intelligence électorale", desc: "Quels récits mobilisent l’électorat, qui les porte, et ce qui doit changer." },
    "/en/engines/ai-recognition": { name: "Reconnaissance IA", desc: "Les moteurs d’IA comprennent-ils qui est l’entreprise ?" },
    "/en/engines/google-vs-ai": { name: "Google contre visibilité IA", desc: "Existe-t-elle de façon cohérente sur les deux surfaces de découverte ?" },
    "/en/engines/competitor-decision": { name: "Décision face aux concurrents", desc: "Qui reçoit la décision à sa place, et pourquoi ?" },
    "/en/engines/action": { name: "Intelligence d’action", desc: "Que doit-il se passer ensuite, par qui et pour quand ?" },
    "/en/marketplace/category/ai-visibility-intelligence": { name: "Intelligence de visibilité IA", desc: "L’IA sait-elle que l’entreprise existe, et que pense-t-elle qu’elle est ?" },
    "/en/marketplace/category/competitive-intelligence": { name: "Intelligence concurrentielle", desc: "Qui reçoit la décision à sa place, et que possède-t-il ?" },
    "/en/marketplace/category/executive-intelligence": { name: "Intelligence exécutive", desc: "Quelle est sa valeur, et que se passe-t-il ensuite ?" },
  },
  navFeature: { eyebrow: "Expérience signature", title: "Reconstruire la décision.", desc: "Dix surfaces, une question commerciale, de ce que chaque moteur a compris à ce qui doit changer ensuite.", cta: "Ouvrir la reconstruction" },
  hero: {
    eyebrow: "La couche d’intelligence et d’exécution pour les agences modernes",
    headlineLead: "Voyez où votre entreprise est",
    emphasis: ["reconnue.", "recommandée.", "choisie."],
    supporting: "GeoRepute cartographie l’environnement décisionnel autour de votre entreprise : IA, recherche, réputation, concurrents et signaux qui influencent les choix des clients.",
    primaryCta: { label: "Analyser mon entreprise", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "Explorer l’intelligence", href: "#signals" },
    scrollHint: "Entrer dans le système",
  },
  scrollRail: ["Entrer", "Invisible", "Signaux", "Décision", "Angle mort", "Moteurs", "Boucle", "Graphe", "Exécutif", "Action", "Analyser"],
  heroPanel: { title: "Environnement décisionnel", surfaces: "Surfaces surveillées", signals: "Signaux résolus", position: "Position de décision", state: "Reconstruction" },
  capabilityLabels: ["Analyses commerciales et marketing approfondies", "Moteurs d’IA, plus Google", "Langues", "Mesure continue"],
  platformsLabel: "GeoRepute analyse Google et 6 moteurs d’IA supplémentaires — les surfaces où votre entreprise est découverte",
  invisible: {
    label: "La décision invisible",
    headline: "Votre analytique ne commence qu’après que la décision a déjà pris forme.",
    body: "Au moment où une visite est enregistrée, le client a déjà posé une question, reçu une interprétation, pesé des preuves et vous a comparé à des alternatives. Chaque plateforme que vous utilisez mesure ce qui se passe ensuite. Aucune ne mesure cela.",
    pullLead: "Les plateformes traditionnelles optimisent des canaux.",
    pullEmphasis: "GeoRepute reconstruit des décisions.",
    timeline: ["Question posée", "Interprétation formée", "Preuves pesées", "Alternatives comparées", "Recommandation faite", "Décision prise", "Visite enregistrée"],
    visibleLabel: "Là où votre analytique commence",
    invisibleLabel: "Là où la décision est réellement prise",
    notMeasured: "non mesuré",
  },
  signals: {
    label: "Voir les signaux",
    headline: "Dix mesures. Une position de décision. Chacune ouvrant ses preuves.",
    body: "Chaque signal ci-dessous est mesuré indépendamment, puis résolu en une seule position sur la capacité de votre entreprise à remporter la décision.",
    items: [
      { name: "Reconnaissance IA", q: "Les moteurs d’IA comprennent-ils qui est l’entreprise ?" },
      { name: "Visibilité Google", q: "L’entreprise est-elle présente là où la recherche classique décide encore ?" },
      { name: "Visibilité IA", q: "Existe-t-elle de façon cohérente sur les deux surfaces de découverte ?" },
      { name: "Autorité", q: "Des preuves indépendantes soutiennent-elles les affirmations avancées ?" },
      { name: "Confiance", q: "Le marché considère-t-il l’entreprise comme un choix sûr ?" },
      { name: "Contexte", q: "L’entreprise est-elle comprise dans la bonne catégorie et le bon usage ?" },
      { name: "Cohérence", q: "Chaque surface décrit-elle la même entité de la même façon ?" },
      { name: "Adéquation au marché", q: "La demande évolue-t-elle vers ce que l’entreprise vend réellement ?" },
      { name: "Position concurrentielle", q: "Qui reçoit la décision à sa place, et pourquoi ?" },
      { name: "Alignement narratif", q: "Quelle histoire le marché raconte-t-il, et comment influence-t-elle les décisions ?" },
    ],
    signalCursor: "Signal",
  },
  reconstruction: {
    label: "Voyez une décision se former",
    headline: "Entrez un domaine, choisissez une question commerciale, regardez la décision se reconstruire.",
    sampleNote: "Exemple travaillé : reconstruction illustrative, pas des données clients.",
    query: "Quels fournisseurs de fixations industrielles sont les plus fiables dans le Midwest ?",
    commercialQuestion: "Question commerciale",
    stages: [
      { label: "Question", title: "Une question commerciale entre dans le système", detail: "Pas un mot-clé. Une décision portée par un acheteur, un budget et une échéance." },
      { label: "Interprétation IA", title: "Le moteur décide ce que signifie la question", detail: "« Fiable » est traduit en livraison à temps, profondeur de certification et régularité des stocks, avant même d’envisager un fournisseur." },
      { label: "Preuves", title: "Des sources indépendantes sont évaluées", detail: "Les preuves tierces l’emportent sur les affirmations auto-publiées. Sans elles, une entreprise n’est pas disqualifiée ; elle n’est simplement jamais intégrée à la réponse." },
      { label: "Contexte concurrentiel", title: "Les alternatives entrent en concurrence pour la réponse", detail: "Chaque entreprise de la catégorie est évaluée selon les mêmes critères, en même temps. Qui reçoit la décision à sa place, et pourquoi ?" },
      { label: "Recommandation", title: "Une réponse nommée est produite", detail: "Une à trois entreprises sont nommées. Toutes les autres sont totalement absentes de la décision." },
      { label: "Décision", title: "La décision a été prise avant le clic", detail: "Elle n’a pas été créée à la dernière étape. Elle a été assemblée à partir de chaque signal qui l’a précédée ; c’est la partie que votre analytique n’a jamais vue." },
    ],
  },
  blindSpot: {
    label: "La zone aveugle",
    headline: "Deux cartes différentes du même client.",
    body: "L’une commence quand la décision est déjà terminée. L’autre commence quand elle débute.",
    alreadyDecided: "Déjà décidé avant le premier événement mesurable",
    axisLabel: "Une seule décision, de gauche à droite",
    traditionalTitle: "Analytique conventionnelle",
    traditionalSteps: ["Visite", "Clic", "Prospect", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["Question", "Considération", "Recommandation", "Décision", "Résultat"],
  },
  engines: {
    label: "Les moteurs d’intelligence",
    headline: "Douze moteurs. Un seul système connecté.",
    body: "Chaque moteur répond à une question dont dépendent les autres. Neuf des moteurs principaux sont cartographiés ici ; sélectionnez-en un pour voir ce qu’il alimente.",
    items: [
      { name: "Reconnaissance IA", q: "Les moteurs d’IA comprennent-ils qui est l’entreprise ?" },
      { name: "Google contre visibilité IA", q: "Existe-t-elle de façon cohérente sur les deux surfaces de découverte ?" },
      { name: "Décision face aux concurrents", q: "Qui reçoit la décision à sa place, et pourquoi ?" },
      { name: "Autorité", q: "Des preuves indépendantes soutiennent-elles les affirmations avancées ?" },
      { name: "Confiance", q: "Le marché considère-t-il l’entreprise comme un choix sûr ?" },
      { name: "Contexte", q: "L’entreprise est-elle comprise dans la bonne catégorie ?" },
      { name: "Intelligence narrative", q: "Quelle histoire le marché raconte-t-il, et comment influence-t-elle les décisions ?" },
      { name: "Intelligence d’action", q: "Que doit-il se passer ensuite, par qui et pour quand ?" },
      { name: "Intelligence exécutive", q: "Dix mesures, une seule position de décision, chacune ouvrant ses preuves." },
    ],
    feedsPrefix: "Alimente",
    engineSingular: "moteur",
    enginePlural: "moteurs",
    idle: "Inactif",
    idleHint: "Sélectionnez un moteur pour isoler ce qu’il alimente.",
    sourceCursor: "Source",
    focusCursor: "Focus",
  },
  loop: {
    label: "La boucle fermée",
    headline: "Une intelligence qui s’accumule au lieu de se périmer.",
    body: "Mesure PDCA continue. Chaque cycle revient au réseau plus informé que le précédent.",
    details: ["Comprendre la réalité.", "Exécuter les interventions.", "Mesurer ce qui a changé.", "Décider de la suite."],
    everyCycle: "Chaque cycle",
    returnsBetter: "revient mieux informé",
  },
  decisionGraph: {
    label: "Le graphe de décision",
    headline: "L’environnement, rendu inspectable.",
    body: "Sélectionnez un nœud pour isoler ce qui s’y connecte. Les chemins non liés s’estompent ; les preuves à l’appui se révèlent.",
    barLabel: "Graphe de décision",
    allPaths: "Tous les chemins",
    isolating: "Isolement de",
    nodesLabel: "nœuds",
    edgesLabel: "arêtes",
    nodes: [
      { name: "Entrée", kind: "Signal", detail: "La question commerciale, le marché qu’elle touche, et qui la pose.", evidence: ["Classe d’intention de requête", "Étape de l’acheteur", "Limite de catégorie"] },
      { name: "Interprétation", kind: "Modèle", detail: "Comment les moteurs d’IA transforment un langage ambigu en critères concrets.", evidence: ["Extraction des critères", "Résolution d’entité", "Cartographie des catégories"] },
      { name: "Marché", kind: "Environnement", detail: "Direction de la demande, pression narrative, et qui d’autre est en concurrence pour la réponse.", evidence: ["Mouvement narratif", "Évolution de la demande", "Densité concurrentielle"] },
      { name: "Canal", kind: "Surface", detail: "Google et six moteurs d’IA : les surfaces où la réponse est assemblée.", evidence: ["Présence sur Google", "Couverture des moteurs d’IA", "Cohérence des surfaces"] },
      { name: "Résultat", kind: "Résultat", detail: "Si l’entreprise est nommée, considérée, ou absente de la décision.", evidence: ["Taux de mention", "Ensemble de considération", "Cause d’absence"] },
      { name: "Action", kind: "Intervention", detail: "Interventions priorisées avec responsables, échéances et mesure.", evidence: ["Responsable assigné", "Échéance fixée", "Mesure définie"] },
    ],
    supportingEvidence: "Preuves à l’appui",
    noNodeSelected: "Aucun nœud sélectionné",
    noNodeHint: "Sélectionnez un nœud pour isoler ce qui s’y connecte et ouvrir ses preuves.",
    isolateCursor: "Isoler",
  },
  executive: {
    label: "Intelligence exécutive",
    headline: "Dix mesures, une seule position de décision.",
    body: "Chaque mesure ouvre ses propres preuves. La position est ce que le conseil demande réellement.",
    sampleNote: "Lecture d’exemple : valeurs illustratives montrées pour présenter l’interface.",
    positionLabel: "Position de décision",
    positionState: "Contestée",
    measureNames: ["Reconnaissance IA", "Visibilité Google", "Visibilité IA", "Autorité", "Confiance", "Contexte", "Cohérence", "Adéquation au marché", "Position concurrentielle", "Alignement narratif"],
    outOf100: "sur 100",
  },
  actionPlan: {
    label: "De l’analyse à l’action",
    headline: "Interventions priorisées avec responsables, échéances et mesure.",
    body: "Le système ne s’arrête pas à l’analyse. Il aboutit à une séquence dont quelqu’un peut être tenu responsable.",
    movesLabel: "Impacte",
    ownerLabel: "Responsable",
    horizonLabel: "Échéance",
    items: [
      { title: "Renforcer les preuves d’autorité indépendantes", measure: "Autorité", owner: "Stratégie", horizon: "30 jours" },
      { title: "Publier une description canonique de l’entité", measure: "Cohérence", owner: "Contenu", horizon: "14 jours" },
      { title: "Résoudre la confusion d’entité entre les surfaces", measure: "Reconnaissance IA", owner: "Technique", horizon: "21 jours" },
      { title: "Construire un contenu comparatif face aux alternatives nommées", measure: "Position concurrentielle", owner: "Contenu", horizon: "45 jours" },
      { title: "Réaffecter les dépenses payantes vers les décisions contestées", measure: "Adéquation au marché", owner: "Médias", horizon: "30 jours" },
    ],
  },
  finalCta: {
    label: "Analyser mon entreprise",
    headline: "La décision est déjà en train de se produire.",
    body: "GeoRepute vous montre où elle se produit, pourquoi elle évolue, et ce qu’il faut changer ensuite.",
    primaryCta: "Analyser mon entreprise",
    secondaryCta: "Réserver un briefing exécutif",
  },
  footer: {
    tagline: "La couche d’intelligence et d’exécution pour les agences modernes.",
    note: "Les plateformes traditionnelles optimisent des canaux. GeoRepute reconstruit des décisions.",
  },
};

const es: Copy = {
  nav: { platform: "Plataforma", engines: "Motores de inteligencia", marketplace: "Mercado de inteligencia", how: "Cómo funciona", methodology: "Metodología", signIn: "Iniciar sesión", cta: "Iniciar análisis", moreEngines: "Ver los doce motores", moreMarketplace: "Ver todo el ecosistema", language: "Idioma" },
  navItems: {
    "/en/app/mission-control": { name: "Centro de control ejecutivo", desc: "Diez medidas, una posición de decisión, cada una con su evidencia." },
    "/en/app/reconstruct": { name: "Reconstrucción de decisiones", desc: "Introduzca un dominio, elija una pregunta comercial y observe cómo se reconstruye la decisión." },
    "/en/app/campaign-readiness": { name: "Preparación de campaña", desc: "¿Deberíamos lanzar esta campaña hoy? Evalúa la empresa, no la campaña." },
    "/en/app/narrative": { name: "Inteligencia narrativa", desc: "¿Qué historia cuenta el mercado, y cómo influye en las decisiones?" },
    "/en/app/actions": { name: "Centro de acción estratégica", desc: "Intervenciones priorizadas con responsables, plazos y medición." },
    "/en/election-intelligence": { name: "Inteligencia electoral", desc: "Qué narrativas movilizan al electorado, quién las impulsa, y qué debe cambiar." },
    "/en/engines/ai-recognition": { name: "Reconocimiento de IA", desc: "¿Los motores de IA entienden quién es la empresa?" },
    "/en/engines/google-vs-ai": { name: "Google frente a visibilidad en IA", desc: "¿Existe de forma coherente en ambas superficies de descubrimiento?" },
    "/en/engines/competitor-decision": { name: "Decisión frente a competidores", desc: "¿Quién recibe la decisión en su lugar, y por qué?" },
    "/en/engines/action": { name: "Inteligencia de acción", desc: "¿Qué debe suceder a continuación, por quién y para cuándo?" },
    "/en/marketplace/category/ai-visibility-intelligence": { name: "Inteligencia de visibilidad en IA", desc: "¿Sabe la IA que la empresa existe, y qué cree que es?" },
    "/en/marketplace/category/competitive-intelligence": { name: "Inteligencia competitiva", desc: "¿Quién recibe la decisión en su lugar, y qué tiene?" },
    "/en/marketplace/category/executive-intelligence": { name: "Inteligencia ejecutiva", desc: "¿Cuánto vale, y qué sucede después?" },
  },
  navFeature: { eyebrow: "Experiencia insignia", title: "Reconstruir la decisión.", desc: "Diez superficies, una pregunta comercial, desde lo que cada motor entendió hasta lo que debe cambiar a continuación.", cta: "Abrir la reconstrucción" },
  hero: {
    eyebrow: "La capa de inteligencia y ejecución para agencias modernas",
    headlineLead: "Vea dónde su negocio es",
    emphasis: ["reconocido.", "recomendado.", "elegido."],
    supporting: "GeoRepute traza el entorno de decisión alrededor de su negocio: IA, búsqueda, reputación, competidores y las señales que influyen en lo que eligen los clientes.",
    primaryCta: { label: "Analizar mi negocio", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "Explorar la inteligencia", href: "#signals" },
    scrollHint: "Entrar en el sistema",
  },
  scrollRail: ["Entrar", "Invisible", "Señales", "Decisión", "Punto ciego", "Motores", "Bucle", "Grafo", "Ejecutivo", "Acción", "Analizar"],
  heroPanel: { title: "Entorno de decisión", surfaces: "Superficies vigiladas", signals: "Señales resueltas", position: "Posición de decisión", state: "Reconstruyendo" },
  capabilityLabels: ["Análisis profundos de negocio y marketing", "Motores de IA, más Google", "Idiomas", "Medición continua"],
  platformsLabel: "GeoRepute analiza Google y 6 motores de IA más — las superficies donde se descubre su negocio",
  invisible: {
    label: "La decisión invisible",
    headline: "Su analítica comienza después de que la decisión ya se ha formado.",
    body: "Para cuando se registra una visita, el cliente ya ha hecho una pregunta, recibido una interpretación, sopesado evidencia y comparado su empresa con alternativas. Cada plataforma que usa mide lo que ocurre después. Ninguna mide eso.",
    pullLead: "Las plataformas tradicionales optimizan canales.",
    pullEmphasis: "GeoRepute reconstruye decisiones.",
    timeline: ["Pregunta formulada", "Interpretación formada", "Evidencia sopesada", "Alternativas comparadas", "Recomendación hecha", "Decisión tomada", "Visita registrada"],
    visibleLabel: "Donde comienza su analítica",
    invisibleLabel: "Donde realmente se toma la decisión",
    notMeasured: "no medido",
  },
  signals: {
    label: "Vea las señales",
    headline: "Diez medidas. Una posición de decisión. Cada una con su evidencia.",
    body: "Cada señal a continuación se mide de forma independiente y luego se resuelve en una sola posición sobre si su negocio está en condiciones de ganar la decisión.",
    items: [
      { name: "Reconocimiento de IA", q: "¿Los motores de IA entienden quién es la empresa?" },
      { name: "Visibilidad en Google", q: "¿Está presente la empresa donde la búsqueda tradicional sigue decidiendo?" },
      { name: "Visibilidad en IA", q: "¿Existe de forma coherente en ambas superficies de descubrimiento?" },
      { name: "Autoridad", q: "¿Hay evidencia independiente que respalde las afirmaciones realizadas?" },
      { name: "Confianza", q: "¿El mercado considera segura la elección de la empresa?" },
      { name: "Contexto", q: "¿Se entiende la empresa en la categoría y el uso correctos?" },
      { name: "Coherencia", q: "¿Todas las superficies describen la misma entidad de la misma forma?" },
      { name: "Ajuste al mercado", q: "¿La demanda se mueve hacia lo que la empresa realmente vende?" },
      { name: "Posición competitiva", q: "¿Quién recibe la decisión en su lugar, y por qué?" },
      { name: "Alineación narrativa", q: "¿Qué historia cuenta el mercado, y cómo influye en las decisiones?" },
    ],
    signalCursor: "Señal",
  },
  reconstruction: {
    label: "Vea cómo se forma una decisión",
    headline: "Introduzca un dominio, elija una pregunta comercial y observe cómo se reconstruye la decisión.",
    sampleNote: "Ejemplo trabajado: reconstrucción ilustrativa, no datos de clientes.",
    query: "¿Qué proveedores de sujetadores industriales son más confiables en el Medio Oeste?",
    commercialQuestion: "Pregunta comercial",
    stages: [
      { label: "Pregunta", title: "Una pregunta comercial entra al sistema", detail: "No es una palabra clave. Es una decisión con un comprador, un presupuesto y un plazo detrás." },
      { label: "Interpretación de IA", title: "El motor decide qué significa la pregunta", detail: "'Confiable' se traduce en entrega puntual, nivel de certificación y consistencia de inventario, antes de considerar a ningún proveedor." },
      { label: "Evidencia", title: "Se sopesan fuentes independientes", detail: "La evidencia de terceros supera a las afirmaciones autopublicadas. Sin ella, una empresa no queda descalificada; simplemente nunca se incorpora a la respuesta." },
      { label: "Contexto competitivo", title: "Las alternativas entran a competir por la respuesta", detail: "Cada empresa de la categoría se evalúa con los mismos criterios a la vez. ¿Quién recibe la decisión en su lugar, y por qué?" },
      { label: "Recomendación", title: "Se produce una respuesta con nombre", detail: "Se nombran de una a tres empresas. Todas las demás quedan totalmente ausentes de la decisión." },
      { label: "Decisión", title: "La decisión se tomó antes del clic", detail: "No se creó en el paso final. Se ensambló a partir de cada señal anterior; esa es la parte que su analítica nunca vio." },
    ],
  },
  blindSpot: {
    label: "El punto ciego",
    headline: "Dos mapas distintos del mismo cliente.",
    body: "Uno comienza cuando la decisión ya terminó. El otro comienza cuando empieza.",
    alreadyDecided: "Ya decidido antes del primer evento medible",
    axisLabel: "Una decisión, de izquierda a derecha",
    traditionalTitle: "Analítica convencional",
    traditionalSteps: ["Visita", "Clic", "Lead", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["Pregunta", "Consideración", "Recomendación", "Decisión", "Resultado"],
  },
  engines: {
    label: "Los motores de inteligencia",
    headline: "Doce motores. Un solo sistema conectado.",
    body: "Cada motor responde a una pregunta de la que dependen los demás. Aquí se muestran nueve de los motores principales; seleccione uno para ver qué alimenta.",
    items: [
      { name: "Reconocimiento de IA", q: "¿Los motores de IA entienden quién es la empresa?" },
      { name: "Google frente a visibilidad en IA", q: "¿Existe de forma coherente en ambas superficies de descubrimiento?" },
      { name: "Decisión frente a competidores", q: "¿Quién recibe la decisión en su lugar, y por qué?" },
      { name: "Autoridad", q: "¿Hay evidencia independiente que respalde las afirmaciones realizadas?" },
      { name: "Confianza", q: "¿El mercado considera segura la elección de la empresa?" },
      { name: "Contexto", q: "¿Se entiende la empresa en la categoría correcta?" },
      { name: "Inteligencia narrativa", q: "¿Qué historia cuenta el mercado, y cómo influye en las decisiones?" },
      { name: "Inteligencia de acción", q: "¿Qué debe suceder a continuación, por quién y para cuándo?" },
      { name: "Inteligencia ejecutiva", q: "Diez medidas, una posición de decisión, cada una con su evidencia." },
    ],
    feedsPrefix: "Alimenta",
    engineSingular: "motor",
    enginePlural: "motores",
    idle: "Inactivo",
    idleHint: "Seleccione un motor para aislar lo que alimenta.",
    sourceCursor: "Fuente",
    focusCursor: "Enfocar",
  },
  loop: {
    label: "El bucle cerrado",
    headline: "Inteligencia que se acumula en lugar de caducar.",
    body: "Medición PDCA continua. Cada ciclo vuelve a la red más informado que el anterior.",
    details: ["Entender la realidad.", "Ejecutar las intervenciones.", "Medir lo que cambió.", "Decidir qué sigue."],
    everyCycle: "Cada ciclo",
    returnsBetter: "vuelve más informado",
  },
  decisionGraph: {
    label: "El grafo de decisión",
    headline: "El entorno, hecho inspeccionable.",
    body: "Seleccione cualquier nodo para aislar lo que se conecta a él. Las rutas no relacionadas se atenúan; la evidencia de respaldo se revela.",
    barLabel: "Grafo de decisión",
    allPaths: "Todas las rutas",
    isolating: "Aislando",
    nodesLabel: "nodos",
    edgesLabel: "aristas",
    nodes: [
      { name: "Entrada", kind: "Señal", detail: "La pregunta comercial, el mercado al que entra y quién la formula.", evidence: ["Clase de intención de búsqueda", "Etapa del comprador", "Límite de categoría"] },
      { name: "Interpretación", kind: "Modelo", detail: "Cómo los motores de IA resuelven un lenguaje ambiguo en criterios concretos.", evidence: ["Extracción de criterios", "Resolución de entidades", "Mapeo de categorías"] },
      { name: "Mercado", kind: "Entorno", detail: "Dirección de la demanda, presión narrativa, y quién más compite por la respuesta.", evidence: ["Movimiento narrativo", "Cambio de demanda", "Densidad competitiva"] },
      { name: "Canal", kind: "Superficie", detail: "Google y seis motores de IA: las superficies donde se ensambla la respuesta.", evidence: ["Presencia en Google", "Cobertura en motores de IA", "Consistencia entre superficies"] },
      { name: "Resultado", kind: "Resultado", detail: "Si la empresa es nombrada, considerada o está ausente de la decisión.", evidence: ["Tasa de mención", "Conjunto de consideración", "Causa de ausencia"] },
      { name: "Acción", kind: "Intervención", detail: "Intervenciones priorizadas con responsables, plazos y medición.", evidence: ["Responsable asignado", "Plazo establecido", "Medición vinculada"] },
    ],
    supportingEvidence: "Evidencia de respaldo",
    noNodeSelected: "Ningún nodo seleccionado",
    noNodeHint: "Seleccione cualquier nodo para aislar lo que se conecta a él y abrir su evidencia.",
    isolateCursor: "Aislar",
  },
  executive: {
    label: "Inteligencia ejecutiva",
    headline: "Diez medidas, una posición de decisión.",
    body: "Cada medida abre su propia evidencia. La posición es lo que realmente pide la junta directiva.",
    sampleNote: "Lectura de muestra: valores ilustrativos mostrados para presentar la interfaz.",
    positionLabel: "Posición de decisión",
    positionState: "Disputada",
    measureNames: ["Reconocimiento de IA", "Visibilidad en Google", "Visibilidad en IA", "Autoridad", "Confianza", "Contexto", "Coherencia", "Ajuste al mercado", "Posición competitiva", "Alineación narrativa"],
    outOf100: "de 100",
  },
  actionPlan: {
    label: "De la percepción a la acción",
    headline: "Intervenciones priorizadas con responsables, plazos y medición.",
    body: "El sistema no se detiene en el análisis. Se traduce en una secuencia de la que alguien puede rendir cuentas.",
    movesLabel: "Impacta",
    ownerLabel: "Responsable",
    horizonLabel: "Plazo",
    items: [
      { title: "Fortalecer evidencia de autoridad independiente", measure: "Autoridad", owner: "Estrategia", horizon: "30 días" },
      { title: "Publicar descripción canónica de la entidad", measure: "Coherencia", owner: "Contenido", horizon: "14 días" },
      { title: "Resolver confusión de entidad entre superficies", measure: "Reconocimiento de IA", owner: "Técnico", horizon: "21 días" },
      { title: "Crear contenido comparativo frente a alternativas nombradas", measure: "Posición competitiva", owner: "Contenido", horizon: "45 días" },
      { title: "Reasignar la inversión paga hacia decisiones disputadas", measure: "Ajuste al mercado", owner: "Medios", horizon: "30 días" },
    ],
  },
  finalCta: {
    label: "Analizar mi negocio",
    headline: "La decisión ya está ocurriendo.",
    body: "GeoRepute le muestra dónde ocurre, por qué cambia, y qué hacer a continuación.",
    primaryCta: "Analizar mi negocio",
    secondaryCta: "Reservar una sesión ejecutiva",
  },
  footer: {
    tagline: "La capa de inteligencia y ejecución para agencias modernas.",
    note: "Las plataformas tradicionales optimizan canales. GeoRepute reconstruye decisiones.",
  },
};

const pt: Copy = {
  nav: { platform: "Plataforma", engines: "Motores de inteligência", marketplace: "Mercado de inteligência", how: "Como funciona", methodology: "Metodologia", signIn: "Iniciar sessão", cta: "Iniciar análise", moreEngines: "Ver os doze motores", moreMarketplace: "Ver todo o ecossistema", language: "Idioma" },
  navItems: {
    "/en/app/mission-control": { name: "Centro de controle executivo", desc: "Dez medidas, uma posição de decisão, cada uma com sua evidência." },
    "/en/app/reconstruct": { name: "Reconstrução de decisão", desc: "Insira um domínio, escolha uma pergunta comercial e veja a decisão se reconstruir." },
    "/en/app/campaign-readiness": { name: "Prontidão de campanha", desc: "Devemos lançar esta campanha hoje? Avalia o negócio, não a campanha." },
    "/en/app/narrative": { name: "Inteligência narrativa", desc: "Que história o mercado está contando, e como ela influencia as decisões?" },
    "/en/app/actions": { name: "Centro de ação estratégica", desc: "Intervenções priorizadas com responsáveis, prazos e medição." },
    "/en/election-intelligence": { name: "Inteligência eleitoral", desc: "Quais narrativas estão mobilizando o eleitorado, quem as carrega, e o que precisa mudar." },
    "/en/engines/ai-recognition": { name: "Reconhecimento de IA", desc: "Os mecanismos de IA entendem quem é a empresa?" },
    "/en/engines/google-vs-ai": { name: "Google vs. visibilidade em IA", desc: "Ela existe de forma consistente nas duas superfícies de descoberta?" },
    "/en/engines/competitor-decision": { name: "Decisão frente a concorrentes", desc: "Quem recebe a decisão em seu lugar, e por quê?" },
    "/en/engines/action": { name: "Inteligência de ação", desc: "O que precisa acontecer a seguir, por quem e até quando?" },
    "/en/marketplace/category/ai-visibility-intelligence": { name: "Inteligência de visibilidade em IA", desc: "A IA sabe que a empresa existe, e o que ela pensa que é?" },
    "/en/marketplace/category/competitive-intelligence": { name: "Inteligência competitiva", desc: "Quem recebe a decisão em seu lugar, e o que eles têm?" },
    "/en/marketplace/category/executive-intelligence": { name: "Inteligência executiva", desc: "Quanto vale, e o que acontece a seguir?" },
  },
  navFeature: { eyebrow: "Experiência de assinatura", title: "Reconstruir a decisão.", desc: "Dez superfícies, uma pergunta comercial, desde o que cada mecanismo entendeu até o que precisa mudar a seguir.", cta: "Abrir a reconstrução" },
  hero: {
    eyebrow: "A camada de inteligência e execução para agências modernas",
    headlineLead: "Veja onde o seu negócio é",
    emphasis: ["reconhecido.", "recomendado.", "escolhido."],
    supporting: "A GeoRepute mapeia o ambiente de decisão em torno do seu negócio: IA, pesquisa, reputação, concorrentes e os sinais que influenciam as escolhas dos clientes.",
    primaryCta: { label: "Analisar o meu negócio", href: "https://www.georepute.ai/signup" },
    secondaryCta: { label: "Explorar a inteligência", href: "#signals" },
    scrollHint: "Entrar no sistema",
  },
  scrollRail: ["Entrar", "Invisível", "Sinais", "Decisão", "Ponto cego", "Motores", "Ciclo", "Grafo", "Executivo", "Ação", "Analisar"],
  heroPanel: { title: "Ambiente de decisão", surfaces: "Superfícies monitoradas", signals: "Sinais resolvidos", position: "Posição de decisão", state: "Reconstruindo" },
  capabilityLabels: ["Análises profundas de negócios e marketing", "Motores de IA, além do Google", "Idiomas", "Medição contínua"],
  platformsLabel: "A GeoRepute analisa o Google e mais 6 motores de IA — as superfícies onde o seu negócio é descoberto",
  invisible: {
    label: "A decisão invisível",
    headline: "Sua análise começa depois que a decisão já foi moldada.",
    body: "No momento em que uma visita é registrada, o cliente já fez uma pergunta, recebeu uma interpretação, ponderou evidências e comparou você com alternativas. Toda plataforma que você usa mede o que acontece depois. Nenhuma delas mede isso.",
    pullLead: "Plataformas tradicionais otimizam canais.",
    pullEmphasis: "A GeoRepute reconstrói decisões.",
    timeline: ["Pergunta feita", "Interpretação formada", "Evidências ponderadas", "Alternativas comparadas", "Recomendação feita", "Decisão tomada", "Visita registrada"],
    visibleLabel: "Onde sua análise começa",
    invisibleLabel: "Onde a decisão realmente é tomada",
    notMeasured: "não medido",
  },
  signals: {
    label: "Veja os sinais",
    headline: "Dez medidas. Uma posição de decisão. Cada uma abrindo sua evidência.",
    body: "Cada sinal abaixo é medido de forma independente e depois resolvido em uma única posição sobre se o seu negócio está em condições de vencer a decisão.",
    items: [
      { name: "Reconhecimento de IA", q: "Os mecanismos de IA entendem quem é a empresa?" },
      { name: "Visibilidade no Google", q: "A empresa está presente onde a busca tradicional ainda decide?" },
      { name: "Visibilidade em IA", q: "Ela existe de forma consistente nas duas superfícies de descoberta?" },
      { name: "Autoridade", q: "Evidências independentes sustentam as afirmações feitas?" },
      { name: "Confiança", q: "O mercado considera a empresa uma escolha segura?" },
      { name: "Contexto", q: "A empresa é compreendida na categoria e no uso corretos?" },
      { name: "Consistência", q: "Todas as superfícies descrevem a mesma entidade da mesma forma?" },
      { name: "Adequação ao mercado", q: "A demanda está se movendo em direção ao que a empresa realmente vende?" },
      { name: "Posição competitiva", q: "Quem recebe a decisão em seu lugar, e por quê?" },
      { name: "Alinhamento narrativo", q: "Que história o mercado está contando, e como ela influencia as decisões?" },
    ],
    signalCursor: "Sinal",
  },
  reconstruction: {
    label: "Veja uma decisão se formar",
    headline: "Insira um domínio, escolha uma pergunta comercial e veja a decisão se reconstruir.",
    sampleNote: "Exemplo elaborado: reconstrução ilustrativa, não dados de clientes.",
    query: "Quais fornecedores de fixadores industriais são mais confiáveis no Meio-Oeste?",
    commercialQuestion: "Pergunta comercial",
    stages: [
      { label: "Pergunta", title: "Uma pergunta comercial entra no sistema", detail: "Não é uma palavra-chave. É uma decisão com um comprador, um orçamento e um prazo por trás." },
      { label: "Interpretação de IA", title: "O mecanismo decide o que a pergunta significa", detail: "'Confiável' é traduzido em entrega no prazo, profundidade de certificação e consistência de estoque, antes de qualquer fornecedor ser considerado." },
      { label: "Evidências", title: "Fontes independentes são avaliadas", detail: "Evidências de terceiros superam alegações autopublicadas. Sem elas, uma empresa não é desqualificada; ela simplesmente nunca é incorporada à resposta." },
      { label: "Contexto competitivo", title: "Alternativas entram para competir pela resposta", detail: "Cada empresa da categoria é avaliada pelos mesmos critérios, ao mesmo tempo. Quem recebe a decisão em seu lugar, e por quê?" },
      { label: "Recomendação", title: "Uma resposta nomeada é produzida", detail: "De uma a três empresas são nomeadas. Todas as outras ficam totalmente ausentes da decisão." },
      { label: "Decisão", title: "A decisão foi tomada antes do clique", detail: "Ela não foi criada na etapa final. Foi montada a partir de cada sinal anterior; essa é a parte que sua análise nunca viu." },
    ],
  },
  blindSpot: {
    label: "O ponto cego",
    headline: "Dois mapas diferentes do mesmo cliente.",
    body: "Um começa quando a decisão já terminou. O outro começa quando ela se inicia.",
    alreadyDecided: "Já decidido antes do primeiro evento mensurável",
    axisLabel: "Uma decisão, da esquerda para a direita",
    traditionalTitle: "Analytics convencional",
    traditionalSteps: ["Visita", "Clique", "Lead", "CRM"],
    georeputeTitle: "GeoRepute",
    georeputeSteps: ["Pergunta", "Consideração", "Recomendação", "Decisão", "Resultado"],
  },
  engines: {
    label: "Os motores de inteligência",
    headline: "Doze motores. Um único sistema conectado.",
    body: "Cada motor responde a uma pergunta da qual os outros dependem. Nove dos motores principais estão mapeados aqui; selecione um para ver o que ele alimenta.",
    items: [
      { name: "Reconhecimento de IA", q: "Os mecanismos de IA entendem quem é a empresa?" },
      { name: "Google vs. visibilidade em IA", q: "Ela existe de forma consistente nas duas superfícies de descoberta?" },
      { name: "Decisão frente a concorrentes", q: "Quem recebe a decisão em seu lugar, e por quê?" },
      { name: "Autoridade", q: "Evidências independentes sustentam as afirmações feitas?" },
      { name: "Confiança", q: "O mercado considera a empresa uma escolha segura?" },
      { name: "Contexto", q: "A empresa é compreendida na categoria correta?" },
      { name: "Inteligência narrativa", q: "Que história o mercado está contando, e como ela influencia as decisões?" },
      { name: "Inteligência de ação", q: "O que precisa acontecer a seguir, por quem e até quando?" },
      { name: "Inteligência executiva", q: "Dez medidas, uma posição de decisão, cada uma com sua evidência." },
    ],
    feedsPrefix: "Alimenta",
    engineSingular: "motor",
    enginePlural: "motores",
    idle: "Ocioso",
    idleHint: "Selecione um motor para isolar o que ele alimenta.",
    sourceCursor: "Origem",
    focusCursor: "Focar",
  },
  loop: {
    label: "O ciclo fechado",
    headline: "Inteligência que se acumula em vez de expirar.",
    body: "Medição PDCA contínua. Cada ciclo retorna à rede mais informado que o anterior.",
    details: ["Entender a realidade.", "Executar as intervenções.", "Medir o que mudou.", "Decidir o que vem a seguir."],
    everyCycle: "Cada ciclo",
    returnsBetter: "retorna mais informado",
  },
  decisionGraph: {
    label: "O grafo de decisão",
    headline: "O ambiente, tornado inspecionável.",
    body: "Selecione qualquer nó para isolar o que se conecta a ele. Caminhos não relacionados se apagam; as evidências de apoio se revelam.",
    barLabel: "Grafo de decisão",
    allPaths: "Todos os caminhos",
    isolating: "Isolando",
    nodesLabel: "nós",
    edgesLabel: "arestas",
    nodes: [
      { name: "Entrada", kind: "Sinal", detail: "A pergunta comercial, o mercado em que ela entra e quem a está fazendo.", evidence: ["Classe de intenção da consulta", "Estágio do comprador", "Limite da categoria"] },
      { name: "Interpretação", kind: "Modelo", detail: "Como os mecanismos de IA transformam linguagem ambígua em critérios concretos.", evidence: ["Extração de critérios", "Resolução de entidades", "Mapeamento de categorias"] },
      { name: "Mercado", kind: "Ambiente", detail: "Direção da demanda, pressão narrativa e quem mais está competindo pela resposta.", evidence: ["Movimento narrativo", "Mudança de demanda", "Densidade competitiva"] },
      { name: "Canal", kind: "Superfície", detail: "Google e seis mecanismos de IA: as superfícies onde a resposta é montada.", evidence: ["Presença no Google", "Cobertura em mecanismos de IA", "Consistência entre superfícies"] },
      { name: "Resultado", kind: "Resultado", detail: "Se a empresa é nomeada, considerada ou está ausente da decisão.", evidence: ["Taxa de menção", "Conjunto de consideração", "Causa da ausência"] },
      { name: "Ação", kind: "Intervenção", detail: "Intervenções priorizadas com responsáveis, prazos e medição.", evidence: ["Responsável designado", "Prazo definido", "Medição vinculada"] },
    ],
    supportingEvidence: "Evidências de apoio",
    noNodeSelected: "Nenhum nó selecionado",
    noNodeHint: "Selecione qualquer nó para isolar o que se conecta a ele e abrir suas evidências.",
    isolateCursor: "Isolar",
  },
  executive: {
    label: "Inteligência executiva",
    headline: "Dez medidas, uma posição de decisão.",
    body: "Cada medida abre sua própria evidência. A posição é o que a diretoria realmente pede.",
    sampleNote: "Leitura de amostra: valores ilustrativos exibidos para demonstrar a interface.",
    positionLabel: "Posição de decisão",
    positionState: "Contestada",
    measureNames: ["Reconhecimento de IA", "Visibilidade no Google", "Visibilidade em IA", "Autoridade", "Confiança", "Contexto", "Consistência", "Adequação ao mercado", "Posição competitiva", "Alinhamento narrativo"],
    outOf100: "de 100",
  },
  actionPlan: {
    label: "Do insight à ação",
    headline: "Intervenções priorizadas com responsáveis, prazos e medição.",
    body: "O sistema não para na análise. Ele se resolve em uma sequência pela qual alguém pode ser responsabilizado.",
    movesLabel: "Impacta",
    ownerLabel: "Responsável",
    horizonLabel: "Prazo",
    items: [
      { title: "Fortalecer evidências de autoridade independente", measure: "Autoridade", owner: "Estratégia", horizon: "30 dias" },
      { title: "Publicar descrição canônica da entidade", measure: "Consistência", owner: "Conteúdo", horizon: "14 dias" },
      { title: "Resolver confusão de entidade entre superfícies", measure: "Reconhecimento de IA", owner: "Técnico", horizon: "21 dias" },
      { title: "Criar conteúdo comparativo contra alternativas nomeadas", measure: "Posição competitiva", owner: "Conteúdo", horizon: "45 dias" },
      { title: "Realocar investimento pago para decisões disputadas", measure: "Adequação ao mercado", owner: "Mídia", horizon: "30 dias" },
    ],
  },
  finalCta: {
    label: "Analisar meu negócio",
    headline: "A decisão já está acontecendo.",
    body: "A GeoRepute mostra onde ela acontece, por que muda, e o que fazer a seguir.",
    primaryCta: "Analisar meu negócio",
    secondaryCta: "Agendar um briefing executivo",
  },
  footer: {
    tagline: "A camada de inteligência e execução para agências modernas.",
    note: "Plataformas tradicionais otimizam canais. A GeoRepute reconstrói decisões.",
  },
};

export { SIGNAL_NAMES_EN };
export const translations: Record<Locale, Copy> = { en, he, ar, ru, fr, es, pt };

export function normalizeLocale(value?: string): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : "en";
}

export function getLocaleCopy(locale: string): Copy {
  return translations[normalizeLocale(locale)];
}

export function localizePath(path: string, locale: Locale) {
  return path.replace(/^\/en(?=\/|$)/, `/${locale}`);
}

export function localizeNav(localeValue: string) {
  const locale = normalizeLocale(localeValue);
  const copy = translations[locale];
  const navText = copy.nav;
  return {
    ...nav,
    brand: { ...nav.brand, href: `/${locale}` },
    groups: nav.groups.map((group) => ({
      ...group,
      label: navText[group.id] || group.label,
      items: group.items.map((item) => ({
        ...item,
        name: copy.navItems[item.href]?.name || item.name,
        desc: copy.navItems[item.href]?.desc || item.desc,
        href: localizePath(item.href, locale),
      })),
      ...("feature" in group && group.feature
        ? { feature: { ...group.feature, ...copy.navFeature, href: localizePath(group.feature.href, locale) } }
        : {}),
      ...(group.id === "engines" && "more" in group
        ? { more: { ...group.more, label: navText.moreEngines, href: localizePath(group.more.href, locale) } }
        : {}),
      ...(group.id === "marketplace" && "more" in group
        ? { more: { ...group.more, label: navText.moreMarketplace, href: localizePath(group.more.href, locale) } }
        : {}),
    })),
    links: [
      { ...nav.links[0], label: navText.how || nav.links[0].label, href: localizePath(nav.links[0].href, locale) },
      { ...nav.links[1], label: navText.methodology || nav.links[1].label, href: localizePath(nav.links[1].href, locale) },
    ],
    signIn: { ...nav.signIn, label: navText.signIn || nav.signIn.label, href: localizePath(nav.signIn.href, locale) },
    cta: { ...nav.cta, label: navText.cta || nav.cta.label, href: localizePath(nav.cta.href, locale) },
  };
}
