import { nav, hero, invisibleDecision } from "./content";

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

type HeroCopy = {
  eyebrow: string;
  headlineLead: string;
  emphasis: readonly string[];
  supporting: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  scrollHint: string;
};

type InvisibleCopy = {
  index: string;
  label: string;
  headline: string;
  body: string;
  pullLead: string;
  pullEmphasis: string;
  timeline: readonly { t: string; visible: boolean }[];
  visibleLabel: string;
  invisibleLabel: string;
};

const translations: Record<Locale, {
  nav: Record<string, string>;
  hero: HeroCopy;
  invisible: InvisibleCopy;
}> = {
  en: { nav: {}, hero, invisible: invisibleDecision },
  he: {
    nav: { platform: "פלטפורמה", engines: "מנועי מודיעין", marketplace: "שוק המודיעין", how: "איך זה עובד", methodology: "מתודולוגיה", signIn: "כניסה", cta: "התחילו ניתוח", moreEngines: "ראו את כל שנים עשר המנועים", moreMarketplace: "ראו את כל מערכת המודיעין" },
    hero: { ...hero, eyebrow: "שכבת המודיעין והביצוע לסוכנויות מודרניות", headlineLead: "ראו היכן העסק שלכם", emphasis: ["מזוהה.", "מומלץ.", "נבחר."], supporting: "GeoRepute ממפה את סביבת קבלת ההחלטות סביב העסק שלכם: בינה מלאכותית, חיפוש, מוניטין, מתחרים והאותות שמשפיעים על בחירת הלקוחות.", primaryCta: { label: "נתחו את העסק שלי", href: "https://www.georepute.ai/signup" }, secondaryCta: { label: "גלו את המודיעין", href: "#signals" }, scrollHint: "היכנסו למערכת" },
    invisible: { ...invisibleDecision, label: "ההחלטה הבלתי נראית", headline: "האנליטיקה שלכם מתחילה אחרי שההחלטה כבר עוצבה.", body: "עד שהביקור נרשם, הלקוח כבר שאל שאלה, קיבל פרשנות, שקל ראיות והשווה חלופות. כל פלטפורמה שאתם מפעילים מודדת מה קורה אחר כך. אף אחת מהן לא מודדת את זה.", pullLead: "פלטפורמות מסורתיות מייעלות ערוצים.", pullEmphasis: "GeoRepute משחזרת החלטות.", timeline: [{ t: "השאלה נשאלת", visible: false }, { t: "הפרשנות מתגבשת", visible: false }, { t: "הראיות נשקלות", visible: false }, { t: "החלופות מושוות", visible: false }, { t: "ההמלצה ניתנת", visible: false }, { t: "ההחלטה מתקבלת", visible: false }, { t: "הביקור נרשם", visible: true }], visibleLabel: "כאן האנליטיקה שלכם מתחילה", invisibleLabel: "כאן ההחלטה מתקבלת בפועל" },
  },
  ar: {
    nav: { platform: "المنصة", engines: "محركات الذكاء", marketplace: "سوق الذكاء", how: "كيف تعمل", methodology: "المنهجية", signIn: "تسجيل الدخول", cta: "ابدأوا التحليل", moreEngines: "شاهدوا محركات الذكاء الاثني عشر", moreMarketplace: "استكشفوا منظومة الذكاء" },
    hero: { ...hero, eyebrow: "طبقة الذكاء والتنفيذ لوكالات التسويق الحديثة", headlineLead: "اعرفوا أين يُعرَف نشاطكم التجاري", emphasis: ["ويُوصى به.", "ويُختار."], supporting: "ترسم GeoRepute بيئة القرار حول نشاطكم التجاري: عبر الذكاء الاصطناعي والبحث والسمعة والمنافسين والإشارات التي تؤثر في ما يختاره العملاء.", primaryCta: { label: "حلّلوا نشاطكم التجاري", href: "https://www.georepute.ai/signup" }, secondaryCta: { label: "استكشفوا الذكاء", href: "#signals" }, scrollHint: "ادخلوا إلى النظام" },
    invisible: invisibleDecision,
  },
  ru: {
    nav: { platform: "Платформа", engines: "Аналитические движки", marketplace: "Маркетплейс интеллекта", how: "Как это работает", methodology: "Методология", signIn: "Вход", cta: "Начать анализ", moreEngines: "Все двенадцать движков", moreMarketplace: "Вся экосистема интеллекта" },
    hero: { ...hero, eyebrow: "Слой интеллекта и исполнения для современных агентств", headlineLead: "Узнайте, где ваш бизнес", emphasis: ["распознают.", "рекомендуют.", "выбирают."], supporting: "GeoRepute отображает среду принятия решений вокруг вашего бизнеса: ИИ, поиск, репутацию, конкурентов и сигналы, влияющие на выбор клиентов.", primaryCta: { label: "Анализировать мой бизнес", href: "https://www.georepute.ai/signup" }, secondaryCta: { label: "Изучить интеллект", href: "#signals" }, scrollHint: "Войти в систему" },
    invisible: invisibleDecision,
  },
  fr: {
    nav: { platform: "Plateforme", engines: "Moteurs d’intelligence", marketplace: "Marketplace de l’intelligence", how: "Comment ça marche", methodology: "Méthodologie", signIn: "Connexion", cta: "Lancer l’analyse", moreEngines: "Voir les douze moteurs", moreMarketplace: "Voir tout l’écosystème" },
    hero: { ...hero, eyebrow: "La couche d’intelligence et d’exécution pour les agences modernes", headlineLead: "Voyez où votre entreprise est", emphasis: ["reconnue.", "recommandée.", "choisie."], supporting: "GeoRepute cartographie l’environnement décisionnel autour de votre entreprise : IA, recherche, réputation, concurrents et signaux qui influencent les choix des clients.", primaryCta: { label: "Analyser mon entreprise", href: "https://www.georepute.ai/signup" }, secondaryCta: { label: "Explorer l’intelligence", href: "#signals" }, scrollHint: "Entrer dans le système" },
    invisible: invisibleDecision,
  },
  es: {
    nav: { platform: "Plataforma", engines: "Motores de inteligencia", marketplace: "Mercado de inteligencia", how: "Cómo funciona", methodology: "Metodología", signIn: "Iniciar sesión", cta: "Iniciar análisis", moreEngines: "Ver los doce motores", moreMarketplace: "Ver todo el ecosistema" },
    hero: { ...hero, eyebrow: "La capa de inteligencia y ejecución para agencias modernas", headlineLead: "Vea dónde su negocio es", emphasis: ["reconocido.", "recomendado.", "elegido."], supporting: "GeoRepute traza el entorno de decisión alrededor de su negocio: IA, búsqueda, reputación, competidores y las señales que influyen en lo que eligen los clientes.", primaryCta: { label: "Analizar mi negocio", href: "https://www.georepute.ai/signup" }, secondaryCta: { label: "Explorar la inteligencia", href: "#signals" }, scrollHint: "Entrar en el sistema" },
    invisible: invisibleDecision,
  },
  pt: {
    nav: { platform: "Plataforma", engines: "Motores de inteligência", marketplace: "Mercado de inteligência", how: "Como funciona", methodology: "Metodologia", signIn: "Iniciar sessão", cta: "Iniciar análise", moreEngines: "Ver os doze motores", moreMarketplace: "Ver todo o ecossistema" },
    hero: { ...hero, eyebrow: "A camada de inteligência e execução para agências modernas", headlineLead: "Veja onde o seu negócio é", emphasis: ["reconhecido.", "recomendado.", "escolhido."], supporting: "A GeoRepute mapeia o ambiente de decisão em torno do seu negócio: IA, pesquisa, reputação, concorrentes e os sinais que influenciam as escolhas dos clientes.", primaryCta: { label: "Analisar o meu negócio", href: "https://www.georepute.ai/signup" }, secondaryCta: { label: "Explorar a inteligência", href: "#signals" }, scrollHint: "Entrar no sistema" },
    invisible: invisibleDecision,
  },
};

export function normalizeLocale(value?: string): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : "en";
}

export function getLocaleCopy(locale: string) {
  return translations[normalizeLocale(locale)];
}

export function localizePath(path: string, locale: Locale) {
  return path.replace(/^\/en(?=\/|$)/, `/${locale}`);
}

export function localizeNav(localeValue: string) {
  const locale = normalizeLocale(localeValue);
  const copy = translations[locale].nav;
  return {
    ...nav,
    brand: { ...nav.brand, href: `/${locale}` },
    groups: nav.groups.map((group) => ({
      ...group,
      label: copy[group.id] || group.label,
      items: group.items.map((item) => ({ ...item, href: localizePath(item.href, locale) })),
      ...("feature" in group && group.feature ? { feature: { ...group.feature, href: localizePath(group.feature.href, locale) } } : {}),
      ...(group.id === "engines" && "more" in group ? { more: { ...group.more, label: copy.moreEngines, href: localizePath(group.more.href, locale) } } : {}),
      ...(group.id === "marketplace" && "more" in group ? { more: { ...group.more, label: copy.moreMarketplace, href: localizePath(group.more.href, locale) } } : {}),
    })),
    links: [
      { ...nav.links[0], label: copy.how || nav.links[0].label, href: localizePath(nav.links[0].href, locale) },
      { ...nav.links[1], label: copy.methodology || nav.links[1].label, href: localizePath(nav.links[1].href, locale) },
    ],
    signIn: { ...nav.signIn, label: copy.signIn || nav.signIn.label, href: localizePath(nav.signIn.href, locale) },
    cta: { ...nav.cta, label: copy.cta || nav.cta.label, href: localizePath(nav.cta.href, locale) },
  };
}