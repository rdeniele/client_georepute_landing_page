/**
 * Chrome copy for /blog and /blog/[slug] — the page shell text around
 * whatever post content the CMS holds (post title/body/category are the
 * author's own words and are never translated by this file). Same
 * locale-pack shape as lib/warRoom.ts and lib/subpages/briefing.ts.
 */
import { normalizeLocale, type Locale } from "@/lib/i18n";

export type BlogChromeCopy = {
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  eyebrow: string;
  title: string;
  lead: string;
  recentLabel: string;
  recentTitle: string;
  allFilter: string;
  insightFallback: string;
  minRead: (n: number) => string;
  unavailableTitle: string;
  unavailableBody: string;
  emptyTitle: string;
  emptyBody: string;
  postUnavailableTitle: string;
  ctaTitle: string;
  ctaBody: string;
  startAnalysis: string;
  backToBlog: string;
  faqTitle: string;
  newerPosts: string;
  olderPosts: string;
  onThisPage: string;
  relatedTitle: string;
};

const en: BlogChromeCopy = {
  metaTitle: "Blog | GeoRepute",
  metaDescription:
    "Notes on AI visibility, competitive intelligence and how strategic business decisions actually get made, from the GeoRepute team.",
  crumb: "Blog",
  eyebrow: "Insights",
  title: "From the GeoRepute team.",
  lead: "Notes on AI visibility, competitive intelligence and how strategic decisions actually get made.",
  recentLabel: "Latest",
  recentTitle: "Recent posts",
  allFilter: "All",
  insightFallback: "Insight",
  minRead: (n) => `${n} min read`,
  unavailableTitle: "Posts are temporarily unavailable",
  unavailableBody: "We couldn't reach the content service. Please try again shortly.",
  emptyTitle: "No posts published yet",
  emptyBody: "Check back soon, new posts will appear here as soon as they're published.",
  postUnavailableTitle: "This post is temporarily unavailable",
  ctaTitle: "See what GeoRepute sees about your business.",
  ctaBody: "A living intelligence layer that turns hundreds of signals into one strategic picture.",
  startAnalysis: "Start Analysis",
  backToBlog: "Back to Blog",
  faqTitle: "Frequently asked questions",
  newerPosts: "Newer posts",
  olderPosts: "Older posts",
  onThisPage: "On this page",
  relatedTitle: "Keep reading",
};

const he: BlogChromeCopy = {
  metaTitle: "בלוג | GeoRepute",
  metaDescription: "תובנות על נראות ב-AI, מודיעין תחרותי ואיך מתקבלות בפועל החלטות עסקיות אסטרטגיות, מצוות GeoRepute.",
  crumb: "בלוג",
  eyebrow: "תובנות",
  title: "מצוות GeoRepute.",
  lead: "תובנות על נראות ב-AI, מודיעין תחרותי ואיך מתקבלות בפועל החלטות אסטרטגיות.",
  recentLabel: "עדכני",
  recentTitle: "פוסטים אחרונים",
  allFilter: "הכול",
  insightFallback: "תובנה",
  minRead: (n) => `${n} דקות קריאה`,
  unavailableTitle: "הפוסטים אינם זמינים כרגע",
  unavailableBody: "לא הצלחנו להתחבר לשירות התוכן. נסו שוב בעוד רגע.",
  emptyTitle: "עדיין לא פורסמו פוסטים",
  emptyBody: "חזרו לבדוק בקרוב, פוסטים חדשים יופיעו כאן מיד עם פרסומם.",
  postUnavailableTitle: "הפוסט הזה אינו זמין כרגע",
  ctaTitle: "גלו מה GeoRepute רואה על העסק שלכם.",
  ctaBody: "שכבת מודיעין חיה ההופכת מאות איתותים לתמונה אסטרטגית אחת.",
  startAnalysis: "נתחו את העסק שלי",
  backToBlog: "חזרה לבלוג",
  faqTitle: "שאלות נפוצות",
  newerPosts: "פוסטים חדשים יותר",
  olderPosts: "פוסטים ישנים יותר",
  onThisPage: "בעמוד זה",
  relatedTitle: "להמשך קריאה",
};

const ar: BlogChromeCopy = {
  metaTitle: "المدونة | GeoRepute",
  metaDescription: "ملاحظات حول الظهور في الذكاء الاصطناعي والاستخبارات التنافسية وكيف تُتخذ القرارات الاستراتيجية فعلًا، من فريق GeoRepute.",
  crumb: "المدونة",
  eyebrow: "رؤى",
  title: "من فريق GeoRepute.",
  lead: "ملاحظات حول الظهور في الذكاء الاصطناعي والاستخبارات التنافسية وكيف تُتخذ القرارات الاستراتيجية فعلًا.",
  recentLabel: "الأحدث",
  recentTitle: "أحدث المقالات",
  allFilter: "الكل",
  insightFallback: "رؤية",
  minRead: (n) => `مدة القراءة ${n} د`,
  unavailableTitle: "المقالات غير متاحة مؤقتًا",
  unavailableBody: "تعذّر الوصول إلى خدمة المحتوى. يُرجى المحاولة مرة أخرى بعد قليل.",
  emptyTitle: "لم يُنشر أي مقال بعد",
  emptyBody: "عاودوا الزيارة قريبًا، ستظهر المقالات الجديدة هنا فور نشرها.",
  postUnavailableTitle: "هذا المقال غير متاح مؤقتًا",
  ctaTitle: "اكتشفوا ما تراه GeoRepute عن عملكم.",
  ctaBody: "طبقة استخبارات حيّة تحوّل مئات الإشارات إلى صورة استراتيجية واحدة.",
  startAnalysis: "ابدأوا التحليل",
  backToBlog: "العودة إلى المدونة",
  faqTitle: "الأسئلة الشائعة",
  newerPosts: "مقالات أحدث",
  olderPosts: "مقالات أقدم",
  onThisPage: "في هذه الصفحة",
  relatedTitle: "تابع القراءة",
};

const ru: BlogChromeCopy = {
  metaTitle: "Блог | GeoRepute",
  metaDescription: "Заметки о видимости в ИИ, конкурентной аналитике и о том, как на самом деле принимаются стратегические решения, от команды GeoRepute.",
  crumb: "Блог",
  eyebrow: "Аналитика",
  title: "От команды GeoRepute.",
  lead: "Заметки о видимости в ИИ, конкурентной аналитике и о том, как на самом деле принимаются стратегические решения.",
  recentLabel: "Свежее",
  recentTitle: "Последние статьи",
  allFilter: "Все",
  insightFallback: "Инсайт",
  minRead: (n) => `${n} мин чтения`,
  unavailableTitle: "Статьи временно недоступны",
  unavailableBody: "Не удалось связаться с сервисом контента. Повторите попытку чуть позже.",
  emptyTitle: "Статьи пока не опубликованы",
  emptyBody: "Загляните позже: новые статьи появятся здесь сразу после публикации.",
  postUnavailableTitle: "Эта статья временно недоступна",
  ctaTitle: "Узнайте, что GeoRepute видит о вашем бизнесе.",
  ctaBody: "Живой аналитический слой, который превращает сотни сигналов в одну стратегическую картину.",
  startAnalysis: "Начать анализ",
  backToBlog: "Назад в блог",
  faqTitle: "Часто задаваемые вопросы",
  newerPosts: "Новые записи",
  olderPosts: "Более старые записи",
  onThisPage: "На этой странице",
  relatedTitle: "Читайте также",
};

const fr: BlogChromeCopy = {
  metaTitle: "Blog | GeoRepute",
  metaDescription: "Notes sur la visibilité dans l'IA, l'intelligence concurrentielle et la façon dont les décisions stratégiques se prennent réellement, par l'équipe GeoRepute.",
  crumb: "Blog",
  eyebrow: "Analyses",
  title: "De la part de l'équipe GeoRepute.",
  lead: "Notes sur la visibilité dans l'IA, l'intelligence concurrentielle et la façon dont les décisions stratégiques se prennent réellement.",
  recentLabel: "Récents",
  recentTitle: "Derniers articles",
  allFilter: "Tous",
  insightFallback: "Analyse",
  minRead: (n) => `${n} min de lecture`,
  unavailableTitle: "Les articles sont temporairement indisponibles",
  unavailableBody: "Nous n'avons pas pu joindre le service de contenu. Veuillez réessayer dans un instant.",
  emptyTitle: "Aucun article publié pour le moment",
  emptyBody: "Revenez bientôt : les nouveaux articles apparaîtront ici dès leur publication.",
  postUnavailableTitle: "Cet article est temporairement indisponible",
  ctaTitle: "Découvrez ce que GeoRepute voit de votre entreprise.",
  ctaBody: "Une couche d'intelligence vivante qui transforme des centaines de signaux en une seule image stratégique.",
  startAnalysis: "Lancer l'analyse",
  backToBlog: "Retour au blog",
  faqTitle: "Questions fréquentes",
  newerPosts: "Articles plus récents",
  olderPosts: "Articles plus anciens",
  onThisPage: "Dans cet article",
  relatedTitle: "À lire aussi",
};

const es: BlogChromeCopy = {
  metaTitle: "Blog | GeoRepute",
  metaDescription: "Notas sobre visibilidad en la IA, inteligencia competitiva y cómo se toman realmente las decisiones estratégicas, del equipo de GeoRepute.",
  crumb: "Blog",
  eyebrow: "Perspectivas",
  title: "Del equipo de GeoRepute.",
  lead: "Notas sobre visibilidad en la IA, inteligencia competitiva y cómo se toman realmente las decisiones estratégicas.",
  recentLabel: "Recientes",
  recentTitle: "Últimas publicaciones",
  allFilter: "Todas",
  insightFallback: "Perspectiva",
  minRead: (n) => `${n} min de lectura`,
  unavailableTitle: "Las publicaciones no están disponibles por ahora",
  unavailableBody: "No pudimos conectar con el servicio de contenido. Inténtalo de nuevo en unos momentos.",
  emptyTitle: "Aún no hay publicaciones",
  emptyBody: "Vuelve pronto: las nuevas publicaciones aparecerán aquí en cuanto se publiquen.",
  postUnavailableTitle: "Esta publicación no está disponible por ahora",
  ctaTitle: "Descubre lo que GeoRepute ve sobre tu negocio.",
  ctaBody: "Una capa de inteligencia viva que convierte cientos de señales en una sola imagen estratégica.",
  startAnalysis: "Iniciar análisis",
  backToBlog: "Volver al blog",
  faqTitle: "Preguntas frecuentes",
  newerPosts: "Artículos más recientes",
  olderPosts: "Artículos anteriores",
  onThisPage: "En esta página",
  relatedTitle: "Sigue leyendo",
};

const pt: BlogChromeCopy = {
  metaTitle: "Blog | GeoRepute",
  metaDescription: "Notas sobre visibilidade na IA, inteligência competitiva e como as decisões estratégicas realmente são tomadas, da equipe da GeoRepute.",
  crumb: "Blog",
  eyebrow: "Insights",
  title: "Da equipe da GeoRepute.",
  lead: "Notas sobre visibilidade na IA, inteligência competitiva e como as decisões estratégicas realmente são tomadas.",
  recentLabel: "Recentes",
  recentTitle: "Publicações recentes",
  allFilter: "Todas",
  insightFallback: "Insight",
  minRead: (n) => `${n} min de leitura`,
  unavailableTitle: "As publicações estão temporariamente indisponíveis",
  unavailableBody: "Não conseguimos acessar o serviço de conteúdo. Tente novamente em instantes.",
  emptyTitle: "Ainda não há publicações",
  emptyBody: "Volte em breve: as novas publicações aparecerão aqui assim que forem publicadas.",
  postUnavailableTitle: "Esta publicação está temporariamente indisponível",
  ctaTitle: "Descubra o que a GeoRepute enxerga sobre o seu negócio.",
  ctaBody: "Uma camada de inteligência viva que transforma centenas de sinais em uma única visão estratégica.",
  startAnalysis: "Iniciar análise",
  backToBlog: "Voltar ao blog",
  faqTitle: "Perguntas frequentes",
  newerPosts: "Artigos mais recentes",
  olderPosts: "Artigos anteriores",
  onThisPage: "Nesta página",
  relatedTitle: "Continue lendo",
};

const packs: Record<Locale, BlogChromeCopy> = { en, he, ar, ru, fr, es, pt };

export function getBlogChromeCopy(locale: string): BlogChromeCopy {
  return packs[normalizeLocale(locale)] ?? en;
}
