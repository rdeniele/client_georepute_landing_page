/** Contact details shown on /briefing. */
export const CONTACT = {
  email: "georepute@gmail.com",
  phone: "972-55-6-800-600",
  phoneHref: "tel:+972556800600",
  whatsappHref: "https://wa.me/972556800600",
  headquarters: "Global Remote-first",
} as const;

/** Calendly page embedded on /briefing. Set to null to show the contact details only. */
export const CALENDLY_URL: string | null = "https://calendly.com/georepute/30min";
