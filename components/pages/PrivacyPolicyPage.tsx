import { Crumbs, CtaBand, DEMO_HREF, MEETING_HREF, PageHero } from "@/components/subpages/kit";
import { DocToc } from "@/components/subpages/MethodWidgets";

const TOC = [
  { id: "data-we-collect", label: "Data we collect" },
  { id: "cookies", label: "Cookies & local storage" },
  { id: "how-we-use-it", label: "How it's used" },
  { id: "third-parties", label: "Third-party services" },
  { id: "retention", label: "Retention & deletion" },
  { id: "changes", label: "Changes to this policy" },
];

function DocSection({
  id,
  n,
  label,
  title,
  children,
}: {
  id: string;
  n: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="meth-sec" aria-labelledby={`${id}-t`}>
      <header className="meth-sec__head" data-reveal>
        <span className="meth-sec__n">{n}</span>
        <span className="t-label">{label}</span>
      </header>
      <h2 id={`${id}-t`} className="t-h2 meth-sec__title" data-reveal data-reveal-delay="60">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * English-only for now, like the CookieConsentBanner it's linked from — kept
 * locale-prop-shaped so it isn't a special case among the other subpages
 * registered in app/[locale]/[...slug]/page.tsx, even though the copy below
 * doesn't branch on it yet.
 */
export function PrivacyPolicyPage({ locale }: { locale: string }) {
  return (
    <div className="kit-page privacy-page">
      <PageHero
        id="privacy"
        layout="stack"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Privacy Policy" }]} />}
        eyebrow="Privacy & cookies"
        title="What we collect, why, and how to have it removed."
        lead="This page describes, plainly, what GeoRepute's marketing site collects, what it stores in your browser, and who else ever sees it. It intentionally does not describe the separate georepute.ai platform product, which has its own account and data terms."
      />

      <div className="shell meth-layout">
        <aside className="meth-layout__toc">
          <DocToc items={TOC} />
        </aside>

        <div className="meth-layout__doc">
          <DocSection id="data-we-collect" n="01" label="Data we collect" title="Only what you hand us directly.">
            <p className="t-body meth-p" data-reveal>
              This site does not track visitors by default. The only personal data it collects is what you choose to
              submit:
            </p>
            <ul className="meth-rules" data-reveal>
              <li>
                <b>Meeting / contact requests:</b> the name, email, company, phone number, subject and message you
                enter on the <a href="/briefing">/briefing</a> form. It's emailed to our team through Resend, a
                transactional email provider, with your address set as reply-to.
              </li>
              <li>
                <b>Optional Google Meet booking:</b> if you request a specific time, that slot and the resulting
                Meet link are included in the same email and, when a link is created, sent back to you in a
                confirmation email.
              </li>
              <li>
                <b>Basic local preferences:</b> your theme (light/dark), locale, whether you've seen the intro
                video, and this cookie banner's own choice, all stored only in your browser's localStorage (see
                Cookies below).
              </li>
              <li>
                <b>Staff blog authentication:</b> the admin area used by our own team to publish blog posts is
                protected by Supabase authentication. This applies to GeoRepute staff only, never to site visitors.
              </li>
            </ul>
          </DocSection>

          <DocSection id="cookies" n="02" label="Cookies & local storage" title="Necessary and preference only, nothing else.">
            <p className="t-body meth-p" data-reveal>
              This site does not run any third-party analytics, advertising, or tracking scripts of any kind. There
              is no Google Analytics, no ad pixel, no cross-site tracking cookie. What it does use is your browser's
              own localStorage, for two categories:
            </p>
            <ul className="meth-rules" data-reveal>
              <li>
                <b>Necessary:</b> keeps the site itself functioning: your theme choice, the detected page locale,
                and whether you've already seen the intro video or the Try-it preview.
              </li>
              <li>
                <b>Preference:</b> remembers the choice you make on the cookie banner itself
                (<code>georepute-cookie-consent</code>), so it doesn&apos;t ask again.
              </li>
            </ul>
            <p className="t-body meth-p" data-reveal>
              Choosing &ldquo;Necessary only&rdquo; on the banner works identically to &ldquo;Accept&rdquo;, since
              neither unlocks any additional tracking; there isn&apos;t any to unlock. The choice is recorded
              for transparency, and so the banner doesn&apos;t reappear.
            </p>
          </DocSection>

          <DocSection id="how-we-use-it" n="03" label="How it's used" title="To answer you, and to remember your settings.">
            <ul className="meth-rules" data-reveal>
              <li>Contact and meeting details are used only to respond to your enquiry or confirm a booking.</li>
              <li>We don&apos;t sell, rent, or share your contact details with third parties for marketing.</li>
              <li>Local storage preferences never leave your browser; we don&apos;t receive or see them.</li>
            </ul>
          </DocSection>

          <DocSection id="third-parties" n="04" label="Third-party services" title="The vendors this site relies on.">
            <ul className="meth-rules" data-reveal>
              <li>
                <b>Resend:</b> delivers the emails generated by the /briefing form. Resend processes the message
                content and your email address solely to deliver that message.
              </li>
              <li>
                <b>Google Meet:</b> used only when you explicitly request a scheduled call; Google handles the
                video call itself under its own terms.
              </li>
              <li>
                <b>Supabase:</b> authenticates GeoRepute staff for the internal blog admin area. Site visitors never
                authenticate against it.
              </li>
            </ul>
          </DocSection>

          <DocSection id="retention" n="05" label="Retention & deletion" title="Ask, and we'll remove it.">
            <p className="t-body meth-p" data-reveal>
              We keep contact and meeting request emails only as long as needed to respond to you and keep a record
              of the conversation. To request that we delete any data you've sent us, email{" "}
              <a href="mailto:georepute@gmail.com">georepute@gmail.com</a> or use the{" "}
              <a href={MEETING_HREF}>contact form</a> and ask for your data to be removed; we'll confirm once it's
              done.
            </p>
          </DocSection>

          <DocSection id="changes" n="06" label="Changes to this policy" title="This page will say so if anything changes.">
            <p className="t-body meth-p" data-reveal>
              If GeoRepute ever adds analytics, advertising, or other tracking to this marketing site, this page and
              the cookie banner it's linked from will be updated first, honestly describing what's been added, before
              it goes live.
            </p>
          </DocSection>
        </div>
      </div>

      <CtaBand
        locale={locale}
        eyebrow="Questions about your data"
        title="Reach the team directly."
        body="Every request above is handled by a person, not a form queue."
        primary={{ label: "Book a Live Demo", href: MEETING_HREF }}
        secondary={{ label: "Analyze My Business", href: DEMO_HREF }}
      />
    </div>
  );
}
