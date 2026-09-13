import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { Crumbs, CtaBand, DemoNote, lhref, PageHero, SectionIntro } from "@/components/subpages/kit";
import { CountUp, SubpageFx } from "@/components/subpages/fx";
import { ActionCenter } from "@/components/subpages/ActionWidgets";
import { interventions } from "@/lib/subpages/demo";

export function ActionCenterPage({ locale }: { locale: string }) {
  const immediate = interventions.filter((i) => i.urgency === "Immediate").length;
  const owners = new Set(interventions.map((i) => i.owner)).size;

  return (
    <div className="kit-page ac-page">
      <SubpageFx />
      <PageHero
        id="ac"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Platform" }, { label: "Strategic Action Center" }]} />}
        eyebrow="Strategic Action Center"
        title={
          <>
            The platform does not end with <em>insight.</em>
          </>
        }
        lead="Each intervention names an owner, a deadline, the signal it should move and how that movement will be verified."
        actions={
          <>
            <Button href="#queue" variant="primary">
              Open the priority queue
            </Button>
            <Button href={lhref("/en/app/mission-control", locale)} variant="ghost">
              Back to Mission Control
            </Button>
          </>
        }
        aside={
          <div className="ac-stats">
            <div className="ac-stats__big">
              <span className="kit-mono">Interventions</span>
              <b className="kit-num">
                <CountUp to={interventions.length} />
              </b>
            </div>
            <div className="ac-stats__cell ac-stats__cell--hot">
              <span className="kit-mono">Immediate</span>
              <b className="kit-num">
                <CountUp to={immediate} />
              </b>
            </div>
            <div className="ac-stats__cell">
              <span className="kit-mono">Owners</span>
              <b className="kit-num">
                <CountUp to={owners} />
              </b>
            </div>
            <div className="ac-stats__cell ac-stats__cell--wide">
              <span className="kit-mono">Verified after execution</span>
              <b className="ac-stats__verify">0 of 6, re-observed once work lands</b>
            </div>
          </div>
        }
      />

      <section id="queue" className="kit-section ac-main" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="Interventions"
            title="Six moves. One order to make them in."
            body="Switch between the ranked queue and the dated roadmap. Open any intervention for its evidence, owner and the metric that proves it worked."
            align="split"
          />
          <div className="kit-card ac-main__panel" data-reveal>
            <ActionCenter />
          </div>
          <DemoNote className="ac-demo" />
        </div>
      </section>

      <section className="kit-section ac-verify" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell ac-verify__grid">
          <SectionIntro
            index="02"
            label="How impact is verified"
            title={<>Completion is not <em className="t-editorial">impact.</em></>}
            body="Each action is verified by re-observing the signal it targets, across the same engines and questions, after execution. Until that re-observation happens, measured change stays empty."
          />
          <ol className="ac-steps">
            {[
              ["Before", "The signal is observed and recorded: engine, question, date."],
              ["Action", "The intervention ships, with its owner and deadline attached."],
              ["After", "The same engines and questions are observed again."],
              ["Verdict", "Measured change is written back, including the actions that did not work."],
            ].map(([name, body], i) => (
              <li key={name} className="kit-card ac-step" data-reveal data-reveal-delay={String(i * 80)}>
                <span className="ac-step__n">{String(i + 1).padStart(2, "0")}</span>
                <b>{name}</b>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="Why this order"
        title="Every intervention traces back to evidence you can open."
        primary={{ label: "Read the methodology", href: "/en/methodology" }}
        secondary={{ label: "Back to Mission Control", href: "/en/app/mission-control" }}
      />
    </div>
  );
}
