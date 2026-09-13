/**
 * GeoRepute WAR ROOM, election intelligence page copy.
 *
 * Source: the client's "War Room" one-pager (English) and its Hebrew edition
 * ("GeoRepute Political Intelligence, Electoral Advantage"). Every reading on
 * the page (scores, members, trends) is the brochure's own illustrative data,
 * so the page labels it with `sampleNote`; it is never a real campaign result.
 *
 * Numbers live here once in `readings`; only text changes per locale. Arrays in
 * `WarRoomCopy` are index-aligned to the matching arrays in `readings`.
 */

import { normalizeLocale } from "./i18n";

export type Trend = "up" | "down" | "flat";

export const readings = {
  kpis: [
    { value: "Med", tone: "warn" },
    { value: "61%", tone: "signal" },
    { value: "72", tone: "signal" },
    { value: "+18%", tone: "up" },
  ],
  signals: [
    { delta: "+12%", trend: "up" },
    { delta: "+7%", trend: "up" },
    { delta: "-4%", trend: "down" },
  ],
  strengthA: [18, 22, 20, 24, 23, 27, 30, 29, 34, 38, 44, 52],
  strengthB: [30, 28, 29, 27, 28, 26, 27, 25, 26, 24, 25, 23],
  mapNodes: [
    { score: 78, tone: "signal", x: 50, y: 12 },
    { score: 72, tone: "signal", x: 86, y: 32 },
    { score: 68, tone: "up", x: 86, y: 70 },
    { score: 61, tone: "down", x: 50, y: 90 },
    { score: 74, tone: "up", x: 14, y: 70 },
    { score: 48, tone: "down", x: 14, y: 32 },
  ],
  candidate: [
    { value: 61, delta: "+8%", trend: "up" },
    { value: 74, delta: "+4%", trend: "up" },
    { value: 72, delta: null, trend: "flat" },
    { value: 68, delta: "+5%", trend: "up" },
    { value: 38, delta: null, trend: "flat" },
    { value: 65, delta: "-3%", trend: "down" },
  ],
  members: [
    { trend: "up", delta: "6%", sentiment: 78, trust: 82, influence: 82 },
    { trend: "up", delta: "3%", sentiment: 65, trust: 70, influence: 70 },
    { trend: "down", delta: "5%", sentiment: 42, trust: 48, influence: 48 },
    { trend: "down", delta: "2%", sentiment: 58, trust: 55, influence: 55 },
  ],
  /** Radar values in axis order: trust, sentiment, AI, momentum, narrative */
  arena: [
    { series: "you", values: [82, 70, 60, 84, 76] },
    { series: "a", values: [64, 58, 52, 60, 66] },
    { series: "b", values: [50, 62, 44, 48, 54] },
    { series: "c", values: [56, 48, 86, 58, 50] },
  ],
  weeklyRings: [
    { value: 32.8, tone: "warn" },
    { value: 59.3, tone: "signal" },
    { value: 32.5, tone: "warn" },
    { value: 57.5, tone: "signal" },
    { value: 89.6, tone: "down" },
  ],
  weeklyStats: ["13", "45.4", "-25.4", "44.8", "70.8", "38.9"],
  weeklySeries: [
    { tone: "down", values: [58, 60, 62, 63, 64, 66, 66, 67, 68, 69, 70, 70, 71] },
    { tone: "signal", values: [70, 52, 40, 38, 40, 42, 41, 43, 44, 45, 44, 46, 47] },
    { tone: "up", values: [30, 44, 50, 46, 42, 40, 38, 39, 40, 41, 43, 44, 46] },
    { tone: "warn", values: [40, 36, 34, 35, 36, 36, 37, 36, 38, 37, 38, 38, 39] },
  ],
} as const;

type Titled = { title: string; body: string };

export type WarRoomCopy = {
  breadcrumb: { home: string; group: string; page: string };
  subnav: { label: string; links: readonly string[] };
  sampleNote: string;
  hero: {
    eyebrow: string;
    title: string;
    lines: readonly [string, string, string];
    body: string;
    scopes: readonly string[];
    primary: string;
    secondary: string;
  };
  panel: {
    title: string;
    live: string;
    kpis: readonly string[];
    chartTitle: string;
    legend: readonly [string, string];
    signals: readonly string[];
  };
  layer: {
    eyebrow: string;
    google: { title: string; sub: string };
    ai: { title: string; sub: string };
  };
  map: {
    eyebrow: string;
    title: string;
    body: string;
    cards: readonly (Titled & { tag: string })[];
    panelTitle: string;
    panelBadge: string;
    core: string;
    nodes: readonly string[];
  };
  levels: {
    eyebrow: string;
    title: string;
    body: string;
    tabs: readonly [string, string, string];
    candidate: {
      tag: string;
      name: string;
      question: string;
      body: string;
      metrics: readonly string[];
      states: { stable: string; medium: string };
      footLabel: string;
      foot: string;
    };
    party: {
      tag: string;
      name: string;
      question: string;
      body: string;
      columns: readonly [string, string, string, string];
      member: string;
      strengthening: string;
      weakening: string;
      footLabel: string;
      foot: string;
    };
    arena: {
      tag: string;
      name: string;
      question: string;
      body: string;
      axes: readonly [string, string, string, string, string];
      series: { you: string; a: string; b: string; c: string };
      leading: string;
      footLabel: string;
      foot: string;
    };
    banner: string;
    chain: readonly [string, string, string];
  };
  action: {
    eyebrow: string;
    title: string;
    body: string;
    window: string;
    steps: readonly Titled[];
    foot: string;
  };
  weekly: {
    eyebrow: string;
    title: string;
    badge: string;
    questions: readonly string[];
    rings: readonly string[];
    stats: readonly string[];
    chartTitle: string;
    series: readonly string[];
  };
  loop: {
    eyebrow: string;
    title: string;
    steps: readonly { code: string; name: string }[];
  };
  cta: { title: string; body: string; button: string };
};

const en: WarRoomCopy = {
  breadcrumb: { home: "GeoRepute", group: "Platform", page: "War Room" },
  subnav: {
    label: "War Room",
    links: ["What moves the map", "Three levels", "Action plan", "Weekly scan", "The loop"],
  },
  sampleNote: "Illustrative readings, sample data showing what the War Room reports, not a live campaign.",
  hero: {
    eyebrow: "GeoRepute / Election intelligence",
    title: "War Room",
    lines: ["Know what is changing.", "Understand what is driving it.", "Know what to do next."],
    body: "Real-time decision intelligence for municipal, regional, national and global elections.",
    scopes: ["Global", "National", "Regional", "Municipal"],
    primary: "Contact us",
    secondary: "See what moves the map",
  },
  panel: {
    title: "War Room · Live intelligence",
    live: "Live",
    kpis: ["Risk level", "AI visibility", "Trust score", "Momentum"],
    chartTitle: "Narrative strength · 30 days",
    legend: ["Candidate A", "Candidate B"],
    signals: ["Economic narrative · rising", "Candidate X · security", "Trust · health issue"],
  },
  layer: {
    eyebrow: "Primary intelligence layer",
    google: { title: "Google / Search", sub: "Real-time search intelligence" },
    ai: { title: "6 leading AI engines", sub: "ChatGPT · Gemini and more" },
  },
  map: {
    eyebrow: "02 · What moves the map",
    title: "Know what is moving the political landscape.",
    body: "Go beyond what people are saying. See what is gaining strength, who is driving it, what is working, and where the opportunity lies.",
    cards: [
      { tag: "Strengthening", title: "What strengthens you?", body: "See which narratives and topics are gaining ground." },
      { tag: "Weakening", title: "What weakens you?", body: "See where trust is eroding and risk is growing." },
      { tag: "Opportunity", title: "Where is the opportunity?", body: "See what to say, what to amplify, and where the trend can shift." },
      { tag: "Driving change", title: "Who is driving the change?", body: "See who is amplifying the narrative and where it comes from." },
      { tag: "Public questions", title: "What is the public asking?", body: "See which questions and topics are shaping the conversation." },
      { tag: "Competition", title: "Where is the power shifting?", body: "See who is gaining ground and where competitors are advancing." },
    ],
    panelTitle: "Narrative & influence map",
    panelBadge: "Live analysis",
    core: "GeoRepute",
    nodes: ["Candidate A", "Party", "Economic narrative", "Candidate B", "Supporting audience", "Opposing audience"],
  },
  levels: {
    eyebrow: "03 · Three levels",
    title: "See the full picture at three levels.",
    body: "See what is happening to the candidate, who is shaping the party, and how it all compares across the political landscape.",
    tabs: ["01 · Candidate", "02 · Party / list", "03 · Political landscape"],
    candidate: {
      tag: "Executive overview",
      name: "Candidate A",
      question: "How is the candidate perceived right now?",
      body: "A focused snapshot of public perception and key trends.",
      metrics: ["AI engine visibility", "Trust", "Narrative stability", "Momentum", "Risk level", "Sentiment"],
      states: { stable: "Stable", medium: "Medium" },
      footLabel: "Current status",
      foot: "Trust and momentum are strengthening. Sentiment and risk level require monitoring.",
    },
    party: {
      tag: "Party analysis",
      name: "Party A",
      question: "Who is strengthening or weakening the party?",
      body: "See which players within the party are affecting its power, trust, and momentum.",
      columns: ["Trend", "Sentiment", "Trust", "Influence"],
      member: "Member",
      strengthening: "Strengthening",
      weakening: "Weakening",
      footLabel: "The power within",
      foot: "Members 01 and 02 are advancing the party. Member 03 is a significant hindering factor.",
    },
    arena: {
      tag: "Competitive view",
      name: "Competitive comparison",
      question: "How do you compare to competitors?",
      body: "A direct comparison between candidates and parties within the same arena.",
      axes: ["Trust", "Sentiment", "AI", "Momentum", "Narrative"],
      series: { you: "You", a: "Candidate A", b: "Candidate B", c: "Candidate C" },
      leading: "Leading",
      footLabel: "The big picture",
      foot: "Advantage in trust and momentum. Candidate C leads in AI, requires monitoring.",
    },
    banner: "You don't measure a candidate in isolation. You measure them within the arena they compete in.",
    chain: ["Candidate", "Party", "Political arena"],
  },
  action: {
    eyebrow: "04 · Action plan",
    title: "Intelligence doesn't stop at analysis. It drives execution.",
    body: "GeoRepute turns findings into a clear, prioritized action plan for execution on short timelines.",
    window: "Action window: 24–48h",
    steps: [
      { title: "Identify", body: "Detect signals early across all channels." },
      { title: "Understand", body: "Analyze the context and understand what's really happening." },
      { title: "Prioritize", body: "Focus on what matters most right now." },
      { title: "Act", body: "Act quickly and decisively." },
      { title: "Measure", body: "Measure impact using clear metrics." },
      { title: "Adapt", body: "Learn, refine, and stay one step ahead." },
    ],
    foot: "The system doesn't just identify what happened, it tells the campaign what to do now.",
  },
  weekly: {
    eyebrow: "05 · Weekly scan",
    title: "The arena changes. Intelligence updates with it.",
    badge: "Weekly narrative scan",
    questions: [
      "What changed?",
      "What strengthened?",
      "What weakened?",
      "What are competitors doing?",
      "Which narrative is gaining momentum?",
      "What requires action now?",
    ],
    rings: ["Trust", "AI visibility", "Momentum", "Narrative stability", "Risk level"],
    stats: ["Runs tracked", "Current index", "Change in period", "Average index", "Best index", "Worst index"],
    chartTitle: "Score trends across all runs",
    series: ["Risk", "Reputation index", "Trust", "AI visibility"],
  },
  loop: {
    eyebrow: "06 · The intelligence loop",
    title: "Scan, understand, act, then scan again.",
    steps: [
      { code: "Scan", name: "Scan" },
      { code: "Understand", name: "Understanding" },
      { code: "Identify", name: "Impact identification" },
      { code: "Compare", name: "Comparison" },
      { code: "Act", name: "Action" },
      { code: "Measure", name: "Measurement" },
      { code: "Scan again", name: "Rescan" },
    ],
  },
  cta: {
    title: "Get the situational picture that decision-makers don't have today.",
    body: "GeoRepute War Room turns scattered information into clear, comparative, and actionable intelligence.",
    button: "Contact us",
  },
};

const he: WarRoomCopy = {
  breadcrumb: { home: "GeoRepute", group: "פלטפורמה", page: "War Room" },
  subnav: {
    label: "War Room",
    links: ["מה מזיז את המפה", "שלוש רמות", "תוכנית פעולה", "סריקה שבועית", "לולאת המודיעין"],
  },
  sampleNote: "נתונים להמחשה, דוגמה למה שה-War Room מציג, לא קמפיין אמיתי.",
  hero: {
    eyebrow: "GeoRepute / מודיעין בחירות",
    title: "War Room",
    lines: ["לדעת מה משתנה,", "להבין מי מזיז את השיח,", "ולדעת מה צריך לעשות עכשיו."],
    body: "מערכת מודיעין לקבלת החלטות עבור מערכות בחירות מוניציפליות, אזוריות, ארציות וגלובליות.",
    scopes: ["גלובלית", "ארצית", "אזורית", "מוניציפלית"],
    primary: "צרו קשר",
    secondary: "מה מזיז את המפה",
  },
  panel: {
    title: "War Room · מודיעין חי",
    live: "חי",
    kpis: ["רמת סיכון", "נראות AI", "ציון אמון", "מומנטום"],
    chartTitle: "עוצמת נרטיב · 30 יום",
    legend: ["מתמודד א׳", "מתמודד ב׳"],
    signals: ["נרטיב כלכלי · עולה", "מתמודד X · ביטחון", "אמון · נושא בריאות"],
  },
  layer: {
    eyebrow: "שכבת המודיעין הראשית",
    google: { title: "Google / Search", sub: "תוצאות חיפוש בזמן אמת" },
    ai: { title: "6 מנועי AI מובילים", sub: "ChatGPT · Gemini ועוד" },
  },
  map: {
    eyebrow: "02 · מה מזיז את המפה",
    title: "להבין מה באמת מזיז את המפה.",
    body: "לא רק לדעת מה אומרים, להבין מה מתחזק, מי משפיע, מה עובד ואיפה קיימת הזדמנות לשנות את המגמה.",
    cards: [
      { tag: "מתחזק", title: "מי מחזק?", body: "אילו נרטיבים ונושאים צוברים כוח." },
      { tag: "נחלש", title: "מי מחליש?", body: "איפה נוצרת שחיקה, פגיעה באמון או סיכון." },
      { tag: "הזדמנות", title: "איפה נמצאת ההזדמנות?", body: "מה נכון להציג, על מה נכון לדבר ואיפה אפשר לשנות מגמה." },
      { tag: "מניע שינוי", title: "מי מניע את השינוי?", body: "מי מגביר את הנרטיב ומאילו מקורות הוא מגיע." },
      { tag: "שאלות הציבור", title: "מה הציבור שואל?", body: "אילו שאלות ונושאים מתחילים לעצב את השיח." },
      { tag: "תחרות", title: "לאן הכוח זז?", body: "מי מתחזק, מי נחלש ואיפה המתחרים צוברים יתרון." },
    ],
    panelTitle: "מפת נרטיבים והשפעה",
    panelBadge: "ניתוח חי",
    core: "GeoRepute",
    nodes: ["מועמד A", "מפלגה", "נרטיב כלכלי", "מועמד B", "קהל תומך", "קהל מתנגד"],
  },
  levels: {
    eyebrow: "03 · שלוש רמות מודיעין",
    title: "לראות את התמונה בשלוש רמות.",
    body: "מה קורה למתמודד, מי משפיע בתוך המפלגה, ואיך הכול נראה ביחס לזירה המתחרה.",
    tabs: ["01 · מתמודד", "02 · מפלגה / רשימה", "03 · הזירה הפוליטית"],
    candidate: {
      tag: "סקירה מנהלית",
      name: "מתמודד A",
      question: "איך המתמודד נתפס עכשיו?",
      body: "תמונת מצב ממוקדת של התפיסה הציבורית והמגמות המרכזיות.",
      metrics: ["נראות במנועי AI", "אמון", "יציבות נרטיבית", "מומנטום", "רמת סיכון", "סנטימנט"],
      states: { stable: "יציב", medium: "בינוני" },
      footLabel: "המצב הנוכחי",
      foot: "אמון ומומנטום מתחזקים. סנטימנט ורמת סיכון דורשים מעקב.",
    },
    party: {
      tag: "ניתוח מפלגה",
      name: "מפלגה A",
      question: "מי מחזק או מחליש את המפלגה?",
      body: "לראות אילו שחקנים בתוך המפלגה משפיעים על הכוח, האמון והמומנטום שלה.",
      columns: ["מגמה", "סנטימנט", "אמון", "השפעה"],
      member: "חבר/ה",
      strengthening: "מחזק",
      weakening: "מחליש",
      footLabel: "העוצמה מבפנים",
      foot: "חברי/ות 01 ו-02 מקדמים את המפלגה. חבר/ה 03 מהווה גורם עיכוב משמעותי.",
    },
    arena: {
      tag: "מבט תחרותי",
      name: "השוואה תחרותית",
      question: "איך אתם נראים ביחס למתחרים?",
      body: "השוואה ישירה בין מתמודדים ומפלגות בתוך אותה זירה.",
      axes: ["אמון", "סנטימנט", "AI", "מומנטום", "נרטיב"],
      series: { you: "אתם", a: "מתמודד A", b: "מתמודד B", c: "מתמודד C" },
      leading: "מוביל",
      footLabel: "התמונה הגדולה",
      foot: "יתרון באמון ובמומנטום. מתמודד C מוביל ב-AI, דורש מעקב.",
    },
    banner: "לא מודדים מועמד בבידוד. מודדים אותו בתוך הזירה שבה הוא מתחרה.",
    chain: ["מתמודד", "מפלגה", "זירה פוליטית"],
  },
  action: {
    eyebrow: "04 · תוכנית פעולה",
    title: "המודיעין לא נעצר בניתוח. הוא מוביל לביצוע.",
    body: "GeoRepute הופכת את הממצאים לתוכנית עבודה ברורה ומתועדפת לביצוע בלוחות זמנים קצרים.",
    window: "חלון פעולה: 24–48 שעות",
    steps: [
      { title: "מזהים", body: "לזהות אותות מוקדם בכל הערוצים." },
      { title: "מבינים", body: "לנתח את ההקשר ולהבין מה באמת קורה." },
      { title: "מתעדפים", body: "להתמקד במה שהכי חשוב עכשיו." },
      { title: "פועלים", body: "לפעול במהירות ובנחישות." },
      { title: "מודדים", body: "למדוד השפעה באמצעות מדדים ברורים." },
      { title: "מתאימים", body: "ללמוד, לדייק ולהישאר צעד קדימה." },
    ],
    foot: "המערכת לא רק מזהה מה קרה, היא אומרת לקמפיין מה לעשות עכשיו.",
  },
  weekly: {
    eyebrow: "05 · סריקה שבועית",
    title: "הזירה משתנה. המודיעין מתעדכן איתה.",
    badge: "סריקה נרטיבית שבועית",
    questions: [
      "מה השתנה?",
      "מה התחזק?",
      "מה נחלש?",
      "מה המתחרים עושים?",
      "איזה נרטיב מתחיל לצבור כוח?",
      "מה דורש פעולה עכשיו?",
    ],
    rings: ["אמון", "נראות AI", "מומנטום", "יציבות נרטיבית", "רמת סיכון"],
    stats: ["סריקות", "מדד נוכחי", "שינוי בתקופה", "מדד ממוצע", "מדד מיטבי", "מדד נמוך"],
    chartTitle: "מגמות ציון לאורך כל הסריקות",
    series: ["סיכון", "מדד מוניטין", "אמון", "נראות AI"],
  },
  loop: {
    eyebrow: "06 · לולאת המודיעין",
    title: "סורקים, מבינים, פועלים, וסורקים שוב.",
    steps: [
      { code: "Scan", name: "סריקה" },
      { code: "Understand", name: "הבנה" },
      { code: "Identify", name: "זיהוי השפעה" },
      { code: "Compare", name: "השוואה" },
      { code: "Act", name: "פעולה" },
      { code: "Measure", name: "מדידה" },
      { code: "Scan again", name: "סריקה מחדש" },
    ],
  },
  cta: {
    title: "לקבל תמונת מצב שאין למקבלי ההחלטות היום.",
    body: "GeoRepute War Room הופכת מידע מפוזר למודיעין ברור, השוואתי ובר־פעולה.",
    button: "צרו קשר",
  },
};

const packs: Partial<Record<string, WarRoomCopy>> = { en, he };

/** English is the fallback until the other five locales are translated. */
export function getWarRoomCopy(locale: string): WarRoomCopy {
  return packs[normalizeLocale(locale)] ?? en;
}
