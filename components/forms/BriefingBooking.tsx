import { CalendlyEmbed } from "@/components/forms/CalendlyEmbed";

/** The booking card on /briefing: the Calendly scheduler under a short heading. */
export function BriefingBooking({
  locale,
  calendlyUrl,
  booking,
}: {
  locale: string;
  calendlyUrl: string;
  booking: { title: string; hint: string };
}) {
  return (
    <div className="briefing-card">
      <h2 className="briefing-card__title">{booking.title}</h2>
      <p className="briefing-card__hint">{booking.hint}</p>
      <CalendlyEmbed url={calendlyUrl} locale={locale} />
    </div>
  );
}
