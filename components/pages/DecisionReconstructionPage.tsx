import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { PlatformGlyph } from "@/components/ui/PlatformGlyph";
import { ConfidenceMark, Crumbs, CtaBand, DemoNote, DEMO_HREF, lhref, PageHero, Pill } from "@/components/subpages/kit";
import { CountUp, SubpageFx } from "@/components/subpages/fx";
import { StepRail } from "@/components/subpages/StepRail";
import { competitors, recognition, readiness } from "@/lib/subpages/demo";

const QUESTION = "Which industrial fastener suppliers are most reliable in the Midwest?";

/** How each engine handled this one question, from the live reconstruction. */
const ON_QUESTION: Record<string, { state: string; tone: "up" | "down" | "warn" | "muted"; note: string }> = {
  chatgpt: { state: "Wrong entity", tone: "warn", note: "Describes Ironvale as a hardware retailer rather than an MRO distributor." },
  claude: { state: "Absent", tone: "muted", note: "Recognises the business but did not consider it relevant to this question." },
  gemini: { state: "Wrong entity", tone: "down", note: "Conflates Ironvale Supply with a same-named logistics firm." },
  perplexity: { state: "Recommended", tone: "up", note: "Named Ironvale in its answer, citing company website." },
  copilot: { state: "Wrong entity", tone: "warn", note: "Knows the company exists but not which product categories it carries." },
  grok: { state: "Wrong entity", tone: "down", note: "No stable entity record. Answers reference the category without naming Ironvale." },
};

const STEPS = [
  { id: "step-understood", label: "What engines understood" },
  { id: "step-outcome", label: "Recognised or ignored" },
  { id: "step-competitor", label: "Who was selected instead" },
  { id: "step-sources", label: "What influenced the answer" },
  { id: "step-google", label: "Google demand and cost" },
  { id: "step-journey", label: "Where in the journey" },
  { id: "step-timing", label: "Timing and density" },
  { id: "step-exposure", label: "Commercial exposure" },
  { id: "step-signals", label: "Connected signals" },
];

const PULSE_NODES = ["Input", "Interpretation", "Market", "Channel", "Outcome", "Action"];

/** A live preview of the chain every reconstruction resolves into, expanded step by step below. */
function ReconstructPulse() {
  return (
    <div className="rc-pulse" aria-hidden="true">
      <span className="rc-pulse__track">
        <i className="rc-pulse__dot" />
      </span>
      <ol className="rc-pulse__nodes">
        {PULSE_NODES.map((n, i) => (
          <li key={n} style={{ "--i": i } as CSSProperties}>
            {n}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Step({ i, title, children, wide = false }: { i: number; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section id={STEPS[i].id} className={`rc-step${wide ? " rc-step--wide" : ""}`} aria-labelledby={`${STEPS[i].id}-t`}>
      <header className="rc-step__head" data-reveal>
        <span className="rc-step__n">{String(i + 1).padStart(2, "0")}</span>
        <h2 id={`${STEPS[i].id}-t`}>{title}</h2>
      </header>
      <div className="rc-step__body" data-reveal data-reveal-delay="80">
        {children}
      </div>
    </section>
  );
}

export function DecisionReconstructionPage({ locale = "en" }: { locale?: string }) {
  const lead = competitors[0];
  const decisive = readiness.stages[3];

  return (
    <div className="kit-page rc-page">
      <SubpageFx />
      <PageHero
        id="rc"
        layout="center"
        className="rc-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Platform" }, { label: "Decision Reconstruction" }]} />}
        eyebrow="Signature experience"
        title={
          <>
            Reconstruct the <em>decision.</em>
          </>
        }
        lead="Enter a domain and choose a commercial question. The system reconstructs what each surface understood, who received the decision and why."
        meta={
          <div className="rc-query" role="group" aria-label="Seeded reconstruction query">
            <span className="rc-query__domain">
              <span className="kit-mono">Domain</span>
              ironvale.example
            </span>
            <span className="rc-query__q">
              <span className="kit-mono">Commercial question · supplier evaluation</span>
              <span className="rc-query__text">{QUESTION}</span>
            </span>
            <a className="rc-query__go" href="#step-understood">
              Reconstruct <span aria-hidden="true">→</span>
            </a>
          </div>
        }
        actions={<DemoNote>Seeded environment, this demonstration always reconstructs Ironvale Supply across 24 tracked decision questions.</DemoNote>}
        aside={<ReconstructPulse />}
      />

      <div className="shell rc-layout">
        <aside className="rc-layout__rail">
          <StepRail steps={STEPS} />
        </aside>

        <div className="rc-layout__steps">
          <Step i={0} title="What each AI engine understood about the business">
            <ul className="rc-engines">
              {recognition.map((r) => {
                const q = ON_QUESTION[r.engine];
                return (
                  <li key={r.engine} className={`kit-card rc-engine rc-engine--${q.tone}`} data-spotlight>
                    <div className="rc-engine__top">
                      <span className="rc-engine__name">
                        <span className="rc-engine__glyph">
                          <PlatformGlyph id={r.engine} />
                        </span>
                        {r.name}
                      </span>
                      <span className={`kit-pill kit-pill--${q.tone}`}>{q.state}</span>
                    </div>
                    <p className="rc-engine__believes">
                      <span className="kit-mono">Understood as</span>
                      {r.believes}
                    </p>
                    <p className="rc-engine__note">{q.note}</p>
                    <span className="rc-engine__score">
                      <b className="kit-num">{r.score}</b>/100
                    </span>
                  </li>
                );
              })}
            </ul>
          </Step>

          <Step i={1} title="Whether the brand was recognised, mentioned, cited, recommended or ignored">
            <div className="rc-outcome">
              <div className="rc-outcome__big">
                <b className="kit-num">
                  <CountUp to={1} />
                  <small>/ 6</small>
                </b>
                <span>engines recommended the business on this question</span>
              </div>
              <ol className="rc-outcome__ladder">
                {recognition.map((r) => {
                  const q = ON_QUESTION[r.engine];
                  return (
                    <li key={r.engine} className={`rc-outcome__row rc-outcome__row--${q.state === "Recommended" ? "up" : q.state === "Absent" ? "muted" : "down"}`}>
                      <span className="rc-outcome__engine">
                        <PlatformGlyph id={r.engine} />
                        {r.name}
                      </span>
                      <span className="rc-outcome__state">{q.state}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="rc-outcome__read">1 of 6 engines named Ironvale, and none placed it first.</p>
            </div>
          </Step>

          <Step i={2} title="Which competitor was selected instead">
            <div className="rc-competitor">
              <div className="rc-competitor__card">
                <span className="kit-mono">Selected instead</span>
                <b className="rc-competitor__name">{lead.name}</b>
                <span className="rc-competitor__share">
                  <b className="kit-num">
                    <CountUp to={lead.share} decimals={1} suffix="%" />
                  </b>
                  of all recommendations across the tracked decision set
                </span>
              </div>
              <div className="rc-competitor__vs">
                <div>
                  <span>{lead.name.split(" ")[0]}</span>
                  <span className="rc-competitor__bar" style={{ "--w": lead.sources / 21 } as CSSProperties}>
                    <i />
                  </span>
                  <b>21</b>
                </div>
                <div className="is-you">
                  <span>Ironvale</span>
                  <span className="rc-competitor__bar" style={{ "--w": 3 / 21 } as CSSProperties}>
                    <i />
                  </span>
                  <b>3</b>
                </div>
                <p>Independent sources support each brand.</p>
              </div>
            </div>
          </Step>

          <Step i={3} title="Which sources, trust signals and narratives influenced the answer">
            <ul className="rc-sources">
              {[
                ["Trade publication coverage", "High", "Competitor", "Cindermark Industrial is cited by 21 independent sources; Ironvale by 3."],
                ["Company website", "Medium", "Brand", "Ironvale’s own pages are the only source engines can reach for its claims, self-citation carries little weight."],
                ["Supplier-comparison content", "High", "Competitor", "A published comparison library gives engines material they can quote directly."],
                ["Category evaluation criteria", "High", "Competitor", "Engines describe the category using a competitor's framing. Ironvale owns 12% of that language."],
              ].map(([src, infl, fav, why]) => (
                <li key={src} className="rc-source">
                  <div className="rc-source__head">
                    <b>{src}</b>
                    <span className="rc-source__tags">
                      <Pill tone={infl === "High" ? "signal" : "muted"}>{infl} influence</Pill>
                      <Pill tone={fav === "Brand" ? "up" : "down"}>Favours {fav.toLowerCase()}</Pill>
                    </span>
                  </div>
                  <p>{why}</p>
                </li>
              ))}
            </ul>
          </Step>

          <Step i={4} title="What Google demand, organic position and paid click cost indicate">
            <div className="rc-google">
              <div className="rc-google__serp">
                <span className="kit-mono">Closest tracked keyword</span>
                <div className="rc-google__bar">
                  <PlatformGlyph id="google" />
                  <span>industrial fastener supplier</span>
                </div>
                <dl>
                  <div>
                    <dt>Google position</dt>
                    <dd>Not in top 100</dd>
                  </div>
                  <div>
                    <dt>Monthly volume</dt>
                    <dd>320</dd>
                  </div>
                  <div>
                    <dt>Paid CPC</dt>
                    <dd>$9.20</dd>
                  </div>
                  <div>
                    <dt>AI presence</dt>
                    <dd>Absent</dd>
                  </div>
                </dl>
              </div>
              <div className="rc-google__class">
                <span className="kit-mono">Gap classification</span>
                <b>Compound blind spot</b>
                <p>Absent from both surfaces on a high-value commercial question. The most expensive class of gap.</p>
              </div>
            </div>
          </Step>

          <Step i={5} title="Where the question sits in the customer decision journey">
            <div className="rc-journey">
              <ol className="rc-journey__track">
                {readiness.stages.map((s, idx) => (
                  <li key={s.name} className={idx === 3 ? "is-here" : undefined}>
                    <i aria-hidden="true" />
                    <span>{s.name}</span>
                  </li>
                ))}
              </ol>
              <dl className="rc-journey__stats">
                <div>
                  <dt>Coverage at this stage</dt>
                  <dd className="kit-num">{decisive.coverage}%</dd>
                </div>
                <div>
                  <dt>Share of query volume</dt>
                  <dd className="kit-num">14.5%</dd>
                </div>
                <div className="is-key">
                  <dt>Share of revenue decided</dt>
                  <dd className="kit-num">60%</dd>
                </div>
              </dl>
              <p className="rc-journey__note">Supplier Evaluation · stage 4 of 5. Observable by SEO platforms, but only after the decision has already narrowed.</p>
            </div>
          </Step>

          <Step i={6} title="What timing, market maturity and competitive density indicate">
            <div className="rc-timing">
              <div className="rc-timing__window">
                <span className="kit-mono">Window remaining</span>
                <b className="kit-num">7 months</b>
                <span className="rc-timing__track" aria-hidden="true">
                  <i />
                </span>
                <span className="rc-timing__ends">
                  <span>Now · Emerging market</span>
                  <span>Decision deadline · Nov 30, 2026</span>
                </span>
              </div>
              <div className="rc-timing__ready">
                <span className="kit-mono">Market readiness</span>
                <b className="kit-num">63/100</b>
                <p>Query maturity accelerating. Displacement cost rises once engines settle on a stable answer set.</p>
              </div>
            </div>
          </Step>

          <Step i={7} title="What the directional commercial exposure may be">
            <div className="rc-exposure">
              <div className="rc-exposure__formula" aria-label="Demand times decision gap times estimated conversion times average deal value">
                {["Demand", "Decision gap", "Est. conversion", "Avg. deal value"].map((t, j) => (
                  <span key={t} className="rc-exposure__term">
                    {j > 0 ? <i aria-hidden="true">×</i> : null}
                    {t}
                  </span>
                ))}
              </div>
              <div className="rc-exposure__read">
                <ConfidenceMark level="directional" />
                <p>
                  This is the exposure attributable to this single question, a range, never a confirmed figure. The full-book figure across all 24 tracked decisions is materially larger and appears in Mission Control.
                </p>
                <small>Directional estimate, not confirmed lost revenue.</small>
              </div>
            </div>
          </Step>

          <Step i={8} title="Which connected signals explain the outcome">
            <div className="rc-signals">
              <ul>
                {[
                  ["Independent authority evidence", "3 sources vs 14 median", "up"],
                  ["Entity understanding", "4 of 6 resolve the wrong entity", "stable"],
                  ["Competitor recommendation share", "31%, Cindermark Industrial", "down"],
                  ["Paid dependency", "Above break-even CPC", "stable"],
                ].map(([n, v, t]) => (
                  <li key={n} className={`rc-signal rc-signal--${t}`}>
                    <span>{n}</span>
                    <b>
                      <span aria-hidden="true">{t === "up" ? "↑" : t === "down" ? "↓" : "→"}</span> {v}
                    </b>
                  </li>
                ))}
              </ul>
              <ol className="rc-graph" aria-label="Decision intelligence graph">
                {["Input", "Interpretation", "Market", "Channel", "Outcome", "Action"].map((n, j) => (
                  <li key={n} style={{ "--i": j } as CSSProperties}>
                    {n}
                  </li>
                ))}
              </ol>
              <p className="rc-signals__line">One decision. Many signals. One explanation.</p>
            </div>
          </Step>

          <div className="rc-end" data-reveal>
            <Button href={lhref("/en/app/mission-control", locale)} variant="primary">
              Open Mission Control
            </Button>
            <Button href={DEMO_HREF} variant="ghost">
              Reconstruct your own decision
            </Button>
          </div>
        </div>
      </div>

      <section className="kit-section kit-section--tight rc-after" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell rc-after__inner" data-reveal>
          <span className="t-label">After the reconstruction</span>
          <p>The click is the last visible moment. Everything that decided it (interpretation, evidence, alternatives) happened before it, and every step above can be opened back to its evidence.</p>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="Continue into the system"
        title="The reconstruction is where the work begins."
        body="Move from the named decision to the measures, evidence and actions behind it."
        primary={{ label: "Open Mission Control", href: "/en/app/mission-control" }}
        secondary={{ label: "See the engines", href: "/en/engines" }}
      />
    </div>
  );
}
