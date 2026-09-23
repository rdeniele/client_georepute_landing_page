import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Envelope, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { Crumbs, PageHero } from "@/components/subpages/kit";
import { MeetingRequestForm } from "@/components/forms/MeetingRequestForm";
import { CONTACT } from "@/lib/contact";
import { getBriefingCopy } from "@/lib/subpages/briefing";
import { LOCALES } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Schedule a Meeting | GeoRepute",
  description: "Tell us a bit about your business and we'll get back to you to find a time.",
  alternates: { canonical: "/en/briefing" },
};

// Reads server env at request time, so the Meet option follows the deployment's credentials rather than the build's.
export const dynamic = "force-dynamic";

export default async function BriefingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) notFound();

  const c = getBriefingCopy(locale);
  const rows = [
    { label: c.contactLabels.email, value: CONTACT.email, href: `mailto:${CONTACT.email}`, Icon: Envelope },
    { label: c.contactLabels.phone, value: CONTACT.phone, href: CONTACT.phoneHref, Icon: Phone },
    { label: c.contactLabels.headquarters, value: CONTACT.headquarters, href: undefined, Icon: MapPin },
  ];

  return (
    <SiteShell locale={locale}>
      <div className="kit-page">
        <PageHero
          id="briefing"
          layout="split"
          backdrop="network"
          className="briefing-hero"
          crumbs={<Crumbs locale={locale} trail={[{ label: c.crumb }]} />}
          eyebrow={c.eyebrow}
          title={
            <>
              {c.titleLead} <span className="briefing-accent">{c.titleAccent}</span>
            </>
          }
          lead={c.lead}
          meta={
            <ul className="briefing-contact">
              {rows.map(({ label, value, href, Icon }) => (
                <li key={label}>
                  <span className="briefing-contact__icon" aria-hidden="true">
                    <Icon size={20} weight="duotone" />
                  </span>
                  <span>
                    <span className="briefing-contact__label">{label}</span>
                    {href ? (
                      <a className="briefing-contact__value" href={href}>
                        {value}
                      </a>
                    ) : (
                      <span className="briefing-contact__value">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          }
          actions={
            <>
              <a className="briefing-btn briefing-btn--mail" href={`mailto:${CONTACT.email}`}>
                <Envelope size={18} weight="bold" aria-hidden="true" />
                {c.emailUs}
              </a>
              <a className="briefing-btn briefing-btn--wa" href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
                {c.chatWhatsapp}
              </a>
            </>
          }
          aside={<MeetingRequestForm locale={locale} />}
        />
      </div>
    </SiteShell>
  );
}
