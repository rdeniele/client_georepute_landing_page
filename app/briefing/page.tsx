import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Envelope, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { Crumbs, PageHero } from "@/components/subpages/kit";
import { MeetingRequestForm } from "@/components/forms/MeetingRequestForm";
import { CONTACT } from "@/lib/contact";
import { getCalendlyUrl } from "@/lib/services/calendly";

export const metadata: Metadata = {
  title: "Schedule a Meeting | GeoRepute",
  description: "Tell us a bit about your business and we'll get back to you to find a time.",
  alternates: { canonical: "/briefing" },
};

// Reads server env at request time, so the Calendly tab follows the deployment's settings rather than the build's.
export const dynamic = "force-dynamic";

export default function BriefingPage() {
  const rows = [
    { label: "Email us", value: CONTACT.email, href: `mailto:${CONTACT.email}`, Icon: Envelope },
    { label: "Phone", value: CONTACT.phone, href: CONTACT.phoneHref, Icon: Phone },
    { label: "Headquarters", value: CONTACT.headquarters, href: undefined, Icon: MapPin },
  ];

  return (
    <SiteShell locale="en">
      <div className="kit-page">
        <PageHero
          id="briefing"
          layout="split"
          backdrop="network"
          className="briefing-hero"
          crumbs={<Crumbs locale="en" trail={[{ label: "Schedule a Meeting" }]} />}
          eyebrow="Get in touch"
          title={
            <>
              Schedule <span className="briefing-accent">a meeting.</span>
            </>
          }
          lead="Tell us a bit about your business and what you'd like to cover. We'll reply directly to find a time that works."
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
                Email us
              </a>
              <a className="briefing-btn briefing-btn--wa" href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </>
          }
          aside={<MeetingRequestForm calendlyUrl={getCalendlyUrl()} />}
        />
      </div>
    </SiteShell>
  );
}
