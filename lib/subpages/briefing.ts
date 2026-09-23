/**
 * Copy for /briefing (the meeting-request page) and its form, in the same
 * locale-pack shape as lib/warRoom.ts: one typed `en` object, one `he`
 * object, a `packs` map, and a getter that falls back to English.
 *
 * MEETING_SUBJECTS (lib/contact.ts) is intentionally NOT translated here —
 * those values are validated server-side (lib/actions/meeting.ts) and used
 * verbatim as the email subject / calendar event title the team reads, so
 * they stay in English regardless of visitor locale.
 */
import { normalizeLocale } from "@/lib/i18n";

export type BriefingCopy = {
  crumb: string;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  lead: string;
  contactLabels: { email: string; phone: string; headquarters: string };
  emailUs: string;
  chatWhatsapp: string;
  form: {
    title: string;
    hint: string;
    honeypotLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    meetLabel: string;
    meetHint: string;
    meetStartLabel: string;
    meetStartHint: (timeZone: string) => string;
    submit: string;
    sending: string;
    successTitle: string;
    successWithMeet: (slotLabel: string) => string;
    successConfirmationSent: string;
    successConfirmationNotSent: string;
    successConfirmationSentGeneral: string;
    successConfirmationNotSentGeneral: string;
    successNoMeet: string;
    successMeetPendingAutomatic: (slotLabel: string) => string;
    successMeetPendingManual: (slotLabel: string) => string;
  };
};

const en: BriefingCopy = {
  crumb: "Schedule a Meeting",
  eyebrow: "Get in touch",
  titleLead: "Schedule",
  titleAccent: "a meeting.",
  lead: "Tell us a bit about your business and what you'd like to cover. We'll reply directly to find a time that works.",
  contactLabels: { email: "Email us", phone: "Phone", headquarters: "Headquarters" },
  emailUs: "Email us",
  chatWhatsapp: "Chat on WhatsApp",
  form: {
    title: "Request a meeting",
    hint: "Fields marked with an asterisk (*) are mandatory.",
    honeypotLabel: "Leave this field empty",
    nameLabel: "Full name",
    namePlaceholder: "John Doe",
    companyLabel: "Company",
    companyPlaceholder: "Your company",
    emailLabel: "Email address",
    emailPlaceholder: "you@company.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+1 555 123 4567",
    subjectLabel: "Subject",
    subjectPlaceholder: "Select a subject",
    messageLabel: "Message",
    messagePlaceholder: "How can we help you reach your goals?",
    meetLabel: "Book a Google Meet call",
    meetHint: "Pick a time now and we'll email you the link.",
    meetStartLabel: "Preferred date & time",
    meetStartHint: (timeZone) => `30 minutes · ${timeZone}. We'll email you the Meet link.`,
    submit: "Send request",
    sending: "Sending…",
    successTitle: "Thanks, your request is in.",
    successWithMeet: (slotLabel) => `Your Google Meet is set for ${slotLabel}.`,
    successConfirmationSent: "We've emailed you the link too.",
    successConfirmationNotSent: "Keep this link, we couldn't email it to you.",
    successConfirmationSentGeneral: "We've also emailed you a copy of this for your records.",
    successConfirmationNotSentGeneral: "We have your message, but couldn't email you a copy of it right now.",
    successNoMeet: "We'll reply from georepute@gmail.com shortly to find a time.",
    successMeetPendingAutomatic: (slotLabel) =>
      `We couldn't create the Google Meet link automatically, so we'll reply from georepute@gmail.com to confirm ${slotLabel}.`,
    successMeetPendingManual: (slotLabel) =>
      `We've noted ${slotLabel} as your preferred time. We'll reply from georepute@gmail.com to confirm it and send your Google Meet link.`,
  },
};

const he: BriefingCopy = {
  crumb: "קביעת פגישה",
  eyebrow: "צרו קשר",
  titleLead: "קביעת",
  titleAccent: "פגישה.",
  lead: "ספרו לנו קצת על העסק שלכם ועל מה תרצו לדבר. נחזור אליכם ישירות כדי למצוא זמן מתאים.",
  contactLabels: { email: "כתבו לנו", phone: "טלפון", headquarters: "משרדים" },
  emailUs: "כתבו לנו",
  chatWhatsapp: "שיחה בוואטסאפ",
  form: {
    title: "בקשת פגישה",
    hint: "שדות המסומנים בכוכבית (*) הם שדות חובה.",
    honeypotLabel: "השאירו שדה זה ריק",
    nameLabel: "שם מלא",
    namePlaceholder: "ישראל ישראלי",
    companyLabel: "חברה",
    companyPlaceholder: "שם החברה שלכם",
    emailLabel: "כתובת אימייל",
    emailPlaceholder: "you@company.com",
    phoneLabel: "מספר טלפון",
    phonePlaceholder: "+972 55 123 4567",
    subjectLabel: "נושא",
    subjectPlaceholder: "בחרו נושא",
    messageLabel: "הודעה",
    messagePlaceholder: "איך נוכל לעזור לכם להשיג את המטרות שלכם?",
    meetLabel: "קביעת שיחת Google Meet",
    meetHint: "בחרו זמן עכשיו ונשלח לכם את הקישור באימייל.",
    meetStartLabel: "תאריך ושעה מועדפים",
    meetStartHint: (timeZone) => `30 דקות · ${timeZone}. נשלח לכם את קישור ה-Meet באימייל.`,
    submit: "שליחת בקשה",
    sending: "שולח…",
    successTitle: "תודה, הבקשה שלכם התקבלה.",
    successWithMeet: (slotLabel) => `שיחת ה-Google Meet שלכם נקבעה ל-${slotLabel}.`,
    successConfirmationSent: "שלחנו לכם את הקישור גם באימייל.",
    successConfirmationNotSent: "שמרו את הקישור הזה, לא הצלחנו לשלוח אותו אליכם באימייל.",
    successConfirmationSentGeneral: "שלחנו לכם גם עותק של הפנייה באימייל, לתיעוד.",
    successConfirmationNotSentGeneral: "הפנייה שלכם התקבלה, אך לא הצלחנו לשלוח לכם עותק באימייל כרגע.",
    successNoMeet: "נחזור אליכם בקרוב מהכתובת georepute@gmail.com כדי למצוא זמן מתאים.",
    successMeetPendingAutomatic: (slotLabel) =>
      `לא הצלחנו ליצור את קישור ה-Google Meet באופן אוטומטי, ולכן נחזור אליכם מהכתובת georepute@gmail.com כדי לאשר את ${slotLabel}.`,
    successMeetPendingManual: (slotLabel) =>
      `רשמנו את ${slotLabel} כזמן המועדף עליכם. נחזור אליכם מהכתובת georepute@gmail.com כדי לאשר אותו ולשלוח את קישור ה-Google Meet.`,
  },
};

const packs: Partial<Record<string, BriefingCopy>> = { en, he };

/** English is the fallback until the other five locales are translated. */
export function getBriefingCopy(locale: string): BriefingCopy {
  return packs[normalizeLocale(locale)] ?? en;
}
