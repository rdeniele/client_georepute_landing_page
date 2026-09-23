import { FileArrowDown } from "@phosphor-icons/react/ssr";
import { Crumbs, CtaBand, DEMO_HREF, PageHero, Pill, SectionIntro } from "@/components/subpages/kit";
import { getReportsCopy, sampleReports } from "@/lib/subpages/reports";

// Downloads are intentionally disabled for now — the report files aren't
// published (see public/reports/ removal), so this button is a preview of
// what the CTA will look like once they go live, not a working link.

export function SampleReportsPage({ locale }: { locale: string }) {
  const c = getReportsCopy(locale);

  return (
    <div className="kit-page reports-page">
      <PageHero
        id="reports"
        layout="stack"
        backdrop="network"
        crumbs={<Crumbs locale={locale} trail={[{ label: c.crumb }]} />}
        eyebrow={c.eyebrow}
        title={c.title}
        lead={c.lead}
      />

      <section className="kit-section" data-section>
        <div className="shell">
          <SectionIntro index="01" label="Real reports, real domains" title="Pick one, see what it actually reveals." />

          <ul className="reports-grid">
            {sampleReports.map((r, i) => (
              <li
                key={r.slug}
                className="kit-card kit-card--lift reports-card"
                data-reveal
                data-reveal-delay={String(i * 90)}
              >
                <div className="reports-card__top">
                  <span className="kit-mono">{r.domain}</span>
                  <Pill tone={r.priority === "Critical" ? "down" : "warn"}>{r.priority} priority</Pill>
                </div>
                <p className="t-body reports-card__intro">{r.intro}</p>
                <div className="reports-card__meta">
                  <span>{c.meta(r.dataCoverage, r.analysisWindow)}</span>
                  <span>{r.sizeLabel}</span>
                </div>
                <button type="button" className="btn btn--primary reports-card__cta">
                  <FileArrowDown size={18} weight="bold" aria-hidden="true" />
                  {c.download}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="See your own"
        title="This is what GeoRepute would generate for your business."
        body="Every score above came from the same engine. Run it on your own domain."
        primary={{ label: "Analyze My Business", href: DEMO_HREF }}
        secondary={{ label: "Browse the full intelligence library", href: "/en/marketplace" }}
      />
    </div>
  );
}
