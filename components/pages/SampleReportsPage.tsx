import { FileArrowDown } from "@phosphor-icons/react/ssr";
import { Crumbs, CtaBand, DEMO_HREF, PageHero, Pill, SectionIntro } from "@/components/subpages/kit";
import { getReportsCopy, sampleReports } from "@/lib/subpages/reports";

// The report PDFs have the business name redacted (shown as "Company A"), so
// the downloads are live. Names of competitors/cited domains in it are public.

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
          <SectionIntro index="01" label="Real reports, anonymized" title="See what they actually reveal." />

          <ul className={sampleReports.length === 1 ? "reports-grid reports-grid--single" : "reports-grid"}>
            {sampleReports.map((r, i) => (
              <li
                key={r.slug}
                className="kit-card kit-card--lift reports-card"
                data-reveal
                data-reveal-delay={String(i * 90)}
              >
                <div className="reports-card__top">
                  <span className="kit-mono">{r.name} · {r.kind}</span>
                  <Pill tone={r.priority === "Medium" ? "warn" : "down"}>{r.priority} priority</Pill>
                </div>
                <p className="t-body reports-card__intro">{r.intro}</p>
                <div className="reports-card__meta">
                  <span>{r.meta}</span>
                  <span>{r.sizeLabel}</span>
                </div>
                <details className="reports-card__why">
                  <summary>{c.why}</summary>
                  <p className="reports-card__explain">{r.explain}</p>
                  <p className="reports-card__checked">
                    <strong>{c.checkedLabel}.</strong> {r.checked}
                  </p>
                </details>
                <a className="btn btn--primary reports-card__cta" href={r.file} download>
                  <FileArrowDown size={18} weight="bold" aria-hidden="true" />
                  {c.download}
                </a>
              </li>
            ))}
          </ul>
          <p className="reports-note">{c.note}</p>
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
