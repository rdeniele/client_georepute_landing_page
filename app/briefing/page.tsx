import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Crumbs, PageHero } from "@/components/subpages/kit";
import { MeetingRequestForm } from "@/components/forms/MeetingRequestForm";

export const metadata: Metadata = {
  title: "Schedule a Meeting | GeoRepute",
  description: "Tell us a bit about your business and we'll get back to you to find a time.",
  alternates: { canonical: "/briefing" },
};

export default function BriefingPage() {
  return (
    <SiteShell locale="en">
      <div className="kit-page">
        <PageHero
          id="briefing"
          crumbs={<Crumbs locale="en" trail={[{ label: "Schedule a Meeting" }]} />}
          eyebrow="Get in touch"
          title="Schedule a meeting."
          lead="Tell us a bit about your business and what you'd like to cover. We'll reply directly to find a time that works."
        />

        <section className="kit-section kit-section--tight" data-section>
          <div className="shell">
            <MeetingRequestForm />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
