/**
 * Contact details and meeting-subject choices shown on /briefing.
 * The email is where the request form delivers (see lib/services/mailer.ts).
 */
export const CONTACT = {
  email: "georepute@gmail.com",
  phone: "972-55-6-800-600",
  phoneHref: "tel:+972556800600",
  whatsappHref: "https://wa.me/972556800600",
  headquarters: "Global Remote-first",
} as const;

export const MEETING_SUBJECTS = [
  "Request a demo",
  "Partnership opportunities",
  "Pricing and plans",
  "Product question",
  "Something else",
] as const;
