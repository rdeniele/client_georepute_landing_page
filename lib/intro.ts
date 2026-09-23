import { normalizeLocale } from "./i18n";

/**
 * The entry introduction shown to first-time visitors.
 *
 * ─── HOW TO ADD/CHANGE THE SYSTEM VIDEO ─────────────────────────────────────
 * `introVideo.desktop` and `introVideo.mobile` are independent, each `null`
 * until supplied, in which case the modal renders a clearly labelled
 * placeholder for that breakpoint only (see DESKTOP_QUERY in
 * IntroModal.tsx, which picks between them at render time). Set either to
 * one of the two shapes below, nothing in the component needs to change:
 *
 *   // A self-hosted file (drop it in /public/videos/):
 *   { kind: "file", src: "/videos/georepute-system.mp4",
 *     poster: "/videos/georepute-system-poster.jpg", // optional
 *     captions: "/videos/georepute-system.en.vtt" }  // optional, recommended
 *
 *   // Or a hosted player (YouTube / Vimeo / Wistia embed URL):
 *   { kind: "embed", src: "https://player.vimeo.com/video/000000000" }
 *
 * Bump INTRO_VERSION whenever a video changes, so returning visitors who
 * dismissed the old introduction see the new one once.
 * ────────────────────────────────────────────────────────────────────────────
 */
export type IntroVideoSource =
  | { kind: "file"; src: string; poster?: string; captions?: string }
  | { kind: "embed"; src: string };

export const introVideo: { desktop: IntroVideoSource | null; mobile: IntroVideoSource | null } = {
  // 16:9 widescreen cut.
  desktop: { kind: "file", src: "/videos/16x9_intro_video.mp4" },
  // 9:16 portrait cut.
  mobile: { kind: "file", src: "/videos/9x16_intro_video.mp4" },
};

export const INTRO_VERSION = "3";
export const INTRO_STORAGE_KEY = `georepute-intro-seen:v${INTRO_VERSION}`;
/** Fired on window to reopen the introduction from anywhere (e.g. the hero). */
export const INTRO_OPEN_EVENT = "georepute:open-intro";

export type IntroCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  videoLabel: string;
  placeholderTag: string;
  placeholderTitle: string;
  placeholderNote: string;
  pointsLabel: string;
  points: readonly string[];
  takeaway: string;
  explore: string;
  skip: string;
  close: string;
  replay: string;
};

const en: IntroCopy = {
  eyebrow: "Introduction",
  title: "Strategic Business Intelligence Infrastructure",
  intro:
    "A short overview of how GeoRepute builds a living intelligence layer around a business, connecting hundreds of signals into one strategic picture and the next move.",
  videoLabel: "GeoRepute system overview",
  placeholderTag: "System video",
  placeholderTitle: "The GeoRepute system overview will play here.",
  placeholderNote: "Video to be supplied by GeoRepute.",
  pointsLabel: "In this overview",
  points: [
    "Hundreds of signals, connected",
    "One strategic picture",
    "Business implications and priorities",
    "The next move",
    "Intelligence that compounds over time",
  ],
  takeaway: "People can change. The business intelligence remains.",
  explore: "Explore GeoRepute",
  skip: "Skip introduction",
  close: "Close introduction",
  replay: "Watch the introduction",
};

const he: IntroCopy = {
  eyebrow: "היכרות",
  title: "תשתית מודיעין עסקי אסטרטגי",
  intro: "סקירה קצרה של האופן שבו GeoRepute בונה סביב העסק שכבת מודיעין חיה, ומחברת מאות אותות לתמונה אסטרטגית אחת ולצעד הבא.",
  videoLabel: "סקירת מערכת GeoRepute",
  placeholderTag: "סרטון המערכת",
  placeholderTitle: "סקירת מערכת GeoRepute תוצג כאן.",
  placeholderNote: "הסרטון יסופק על ידי GeoRepute.",
  pointsLabel: "בסקירה",
  points: ["מאות אותות, מחוברים", "תמונה אסטרטגית אחת", "השלכות עסקיות וסדרי עדיפויות", "הצעד הבא", "מודיעין שמתחזק עם הזמן"],
  takeaway: "אנשים יכולים להתחלף. המודיעין העסקי נשאר.",
  explore: "גלו את GeoRepute",
  skip: "דלגו על ההיכרות",
  close: "סגירת ההיכרות",
  replay: "צפו בהיכרות",
};

const ar: IntroCopy = {
  eyebrow: "مقدمة",
  title: "بنية تحتية للذكاء الاستراتيجي للأعمال",
  intro: "نظرة سريعة على كيفية بناء GeoRepute طبقة ذكاء حيّة حول النشاط التجاري, تربط مئات الإشارات في صورة استراتيجية واحدة وخطوة تالية.",
  videoLabel: "نظرة عامة على نظام GeoRepute",
  placeholderTag: "فيديو النظام",
  placeholderTitle: "سيُعرض هنا فيديو النظرة العامة على نظام GeoRepute.",
  placeholderNote: "ستزوّدنا GeoRepute بالفيديو.",
  pointsLabel: "في هذه النظرة العامة",
  points: ["مئات الإشارات، مترابطة", "صورة استراتيجية واحدة", "انعكاسات الأعمال والأولويات", "الخطوة التالية", "ذكاء يتعزّز بمرور الوقت"],
  takeaway: "قد يتغيّر الأشخاص. أما ذكاء الأعمال فيبقى.",
  explore: "استكشف GeoRepute",
  skip: "تخطَّ المقدمة",
  close: "إغلاق المقدمة",
  replay: "شاهد المقدمة",
};

const ru: IntroCopy = {
  eyebrow: "Знакомство",
  title: "Инфраструктура стратегической бизнес-аналитики",
  intro: "Короткий обзор того, как GeoRepute выстраивает вокруг бизнеса живой слой аналитики, объединяя сотни сигналов в единую стратегическую картину и следующий шаг.",
  videoLabel: "Обзор системы GeoRepute",
  placeholderTag: "Видео о системе",
  placeholderTitle: "Здесь будет обзор системы GeoRepute.",
  placeholderNote: "Видео предоставит GeoRepute.",
  pointsLabel: "В этом обзоре",
  points: ["Сотни сигналов, связанных воедино", "Единая стратегическая картина", "Выводы для бизнеса и приоритеты", "Следующий ход", "Аналитика, которая накапливается"],
  takeaway: "Люди меняются. Бизнес-аналитика остаётся.",
  explore: "Изучить GeoRepute",
  skip: "Пропустить",
  close: "Закрыть знакомство",
  replay: "Смотреть знакомство",
};

const fr: IntroCopy = {
  eyebrow: "Introduction",
  title: "Infrastructure d’intelligence stratégique d’entreprise",
  intro: "Un bref aperçu de la façon dont GeoRepute construit une couche d’intelligence vivante autour de l’entreprise, en reliant des centaines de signaux en une vision stratégique et un prochain coup.",
  videoLabel: "Présentation du système GeoRepute",
  placeholderTag: "Vidéo du système",
  placeholderTitle: "La présentation du système GeoRepute sera diffusée ici.",
  placeholderNote: "Vidéo fournie par GeoRepute.",
  pointsLabel: "Dans cette présentation",
  points: ["Des centaines de signaux, reliés", "Une vision stratégique unique", "Implications et priorités", "Le prochain coup", "Une intelligence qui se renforce"],
  takeaway: "Les personnes changent. L’intelligence de l’entreprise demeure.",
  explore: "Découvrir GeoRepute",
  skip: "Passer l’introduction",
  close: "Fermer l’introduction",
  replay: "Voir l’introduction",
};

const es: IntroCopy = {
  eyebrow: "Introducción",
  title: "Infraestructura de inteligencia estratégica empresarial",
  intro: "Un breve recorrido por cómo GeoRepute construye una capa viva de inteligencia alrededor del negocio, conectando cientos de señales en una visión estratégica y la próxima jugada.",
  videoLabel: "Presentación del sistema GeoRepute",
  placeholderTag: "Vídeo del sistema",
  placeholderTitle: "Aquí se reproducirá la presentación del sistema GeoRepute.",
  placeholderNote: "Vídeo proporcionado por GeoRepute.",
  pointsLabel: "En esta presentación",
  points: ["Cientos de señales, conectadas", "Una visión estratégica única", "Implicaciones y prioridades", "La próxima jugada", "Inteligencia que se acumula"],
  takeaway: "Las personas cambian. La inteligencia del negocio permanece.",
  explore: "Explorar GeoRepute",
  skip: "Saltar introducción",
  close: "Cerrar introducción",
  replay: "Ver la introducción",
};

const pt: IntroCopy = {
  eyebrow: "Introdução",
  title: "Infraestrutura de inteligência estratégica de negócios",
  intro: "Uma breve visão de como a GeoRepute constrói uma camada viva de inteligência em torno do negócio, conectando centenas de sinais em uma visão estratégica e no próximo movimento.",
  videoLabel: "Apresentação do sistema GeoRepute",
  placeholderTag: "Vídeo do sistema",
  placeholderTitle: "A apresentação do sistema GeoRepute será exibida aqui.",
  placeholderNote: "Vídeo fornecido pela GeoRepute.",
  pointsLabel: "Nesta apresentação",
  points: ["Centenas de sinais, conectados", "Uma visão estratégica única", "Implicações e prioridades", "O próximo movimento", "Inteligência que se acumula"],
  takeaway: "Pessoas mudam. A inteligência do negócio permanece.",
  explore: "Explorar a GeoRepute",
  skip: "Pular introdução",
  close: "Fechar introdução",
  replay: "Assistir à introdução",
};

const packs = { en, he, ar, ru, fr, es, pt };

export function getIntroCopy(locale: string): IntroCopy {
  return packs[normalizeLocale(locale)];
}
