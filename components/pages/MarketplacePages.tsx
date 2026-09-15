import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { Crumbs, CtaBand, DEMO_HREF, lhref, PageHero, SectionIntro } from "@/components/subpages/kit";
import { CountUp, SubpageFx } from "@/components/subpages/fx";
import { ModuleExplorer } from "@/components/subpages/MarketWidgets";
import { categories, CATEGORY_ROUTES, marketplace as mk, type Category } from "@/lib/subpages/copy";

const catHref = (slug: string) => `/en/marketplace/category/${slug}`;

/** The seven categories as one ring, segment size by module count, lit where a category is live in this demo. */
function CategoryRing() {
  const total = categories.reduce((s, c) => s + c.modules, 0);
  const totalLive = categories.reduce((s, c) => s + c.live, 0);
  const size = 168;
  const c = size / 2;
  const r = 68;
  let acc = 0;
  return (
    <div className="mkt-ring" aria-label={`${categories.length} intelligence categories, ${total} modules, ${totalLive} live in this demo`}>
      <div className="mkt-ring__wrap">
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {categories.map((cat, i) => {
            const gap = 2.4;
            const seg = (cat.modules / total) * 360;
            const a0 = ((-90 + acc + gap / 2) * Math.PI) / 180;
            const a1 = ((-90 + acc + seg - gap / 2) * Math.PI) / 180;
            acc += seg;
            const large = seg - gap > 180 ? 1 : 0;
            const x0 = c + r * Math.cos(a0);
            const y0 = c + r * Math.sin(a0);
            const x1 = c + r * Math.cos(a1);
            const y1 = c + r * Math.sin(a1);
            return (
              <path
                key={cat.slug}
                d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
                className={`mkt-ring__seg${cat.live ? " is-live" : ""}`}
                style={{ "--i": i } as CSSProperties}
              />
            );
          })}
        </svg>
        <div className="mkt-ring__core">
          <b className="kit-num">{total}</b>
          <span>modules</span>
        </div>
      </div>
      <ul className="mkt-ring__legend">
        <li className="is-live">
          <i aria-hidden="true" /> {totalLive} live in this demo
        </li>
        <li>
          <i aria-hidden="true" /> {total - totalLive} in platform
        </li>
      </ul>
    </div>
  );
}

/* ==========================================================================
   /marketplace, the intelligence ecosystem
   ======================================================================= */

export function MarketplacePage({ locale }: { locale: string }) {
  return (
    <div className="kit-page mkt-page">
      <SubpageFx />
      <PageHero
        id="mkt"
        layout="center"
        className="mkt-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Marketplace" }]} />}
        eyebrow={mk.eyebrow}
        title={
          <>
            Whatever the business question, <em>there is already intelligence built for it.</em>
          </>
        }
        lead={mk.lead}
        meta={
          <dl className="mkt-stats">
            {mk.stats.map((s) => (
              <div key={s.label}>
                <dd className="kit-num">
                  <CountUp to={s.value} />
                </dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        }
        actions={
          <>
            <Button href="#categories" variant="primary">
              Start with your question
            </Button>
            <Button href={lhref("/en/methodology", locale)} variant="ghost">
              How the models work
            </Button>
          </>
        }
        aside={<CategoryRing />}
      />

      <section id="categories" className="kit-section mkt-cats" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label="Seven categories"
            title="Start with the question you actually have."
            body="Each category opens into the modules underneath it. Every module answers one business question and returns evidence, an analysis and a recommendation, never a figure on its own."
            align="split"
          />
          <ul className="mkt-bento">
            {categories.map((c, i) => {
              const routed = CATEGORY_ROUTES.has(c.slug);
              const inner = (
                <>
                  <span className="mkt-cat__top">
                    <span className="mkt-cat__n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="kit-mono">{c.name}</span>
                  </span>
                  <strong className="mkt-cat__q">{c.question}</strong>
                  <span className="mkt-cat__body">{c.body}</span>
                  <span className="mkt-cat__chips">
                    {c.chips.map((ch) => (
                      <span key={ch}>{ch}</span>
                    ))}
                  </span>
                  <span className="mkt-cat__foot">
                    <span className="mkt-cat__count">
                      <b className="kit-num">{c.modules}</b> modules
                      {c.live ? <span className="mkt-cat__live">{c.live} live in demo</span> : null}
                    </span>
                    {routed ? (
                      <span className="mkt-cat__open">
                        Explore <span aria-hidden="true">→</span>
                      </span>
                    ) : (
                      <span className="mkt-cat__soon">Available in platform</span>
                    )}
                  </span>
                </>
              );
              return (
                <li key={c.slug} className={`mkt-bento__item mkt-bento__item--${i}`} data-reveal data-reveal-delay={String((i % 3) * 70)}>
                  {routed ? (
                    <a className="kit-card mkt-cat is-routed" href={lhref(catHref(c.slug), locale)} data-spotlight>
                      {inner}
                    </a>
                  ) : (
                    <div className="kit-card mkt-cat">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="kit-section mkt-buy" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="02"
            label="What you are buying"
            title={<>The document is the output. <em className="t-editorial">The intelligence is the product.</em></>}
            align="center"
          />
          <ol className="mkt-triad">
            {mk.triad.map((t, i) => (
              <li key={t.name} className="mkt-triad__step" data-reveal data-reveal-delay={String(i * 100)}>
                <span className="mkt-triad__n">{String(i + 1).padStart(2, "0")}</span>
                <b>{t.name}</b>
                <p>{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="See it run"
        title="Watch a module answer a question live."
        primary={{ label: "See a module run live", href: "/en/app/reconstruct" }}
        secondary={{ label: "Monitor continuously instead", href: "/en/app/mission-control" }}
      />
    </div>
  );
}

/* ==========================================================================
   /marketplace/category/{slug}
   ======================================================================= */

function CategoryHeroVisual({ c }: { c: Category }) {
  const modules = c.detail!.modules;
  return (
    <div className="cat-visual">
      <div className="cat-visual__ring">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          {modules.map((m, i) => {
            const gap = 3;
            const seg = 360 / modules.length;
            const a0 = ((-90 + i * seg + gap / 2) * Math.PI) / 180;
            const a1 = ((-90 + (i + 1) * seg - gap / 2) * Math.PI) / 180;
            const r = 68;
            return (
              <path
                key={m.name}
                d={`M ${80 + r * Math.cos(a0)} ${80 + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${80 + r * Math.cos(a1)} ${80 + r * Math.sin(a1)}`}
                className={`cat-visual__seg${m.live ? " is-live" : ""}`}
                style={{ "--i": i } as CSSProperties}
              />
            );
          })}
        </svg>
        <div className="cat-visual__core">
          <b className="kit-num">{c.modules}</b>
          <span>modules</span>
        </div>
      </div>
      <ul className="cat-visual__legend">
        <li className="is-live">
          <i aria-hidden="true" /> {c.live} live in demo
        </li>
        <li>
          <i aria-hidden="true" /> {c.modules - c.live} in platform
        </li>
        <li className="cat-visual__engines">{c.detail!.engines.length === 1 ? "1 engine" : `${c.detail!.engines.length} engines`} underneath</li>
      </ul>
    </div>
  );
}

export function MarketplaceCategoryPage({ slug, locale }: { slug: string; locale: string }) {
  const c = categories.find((x) => x.slug === slug)!;
  const d = c.detail!;
  const others = categories.filter((x) => x.slug !== slug);

  return (
    <div className={`kit-page cat-page cat-page--${slug}`}>
      <SubpageFx />
      <PageHero
        id="cat"
        className="cat-hero"
        crumbs={<Crumbs locale={locale} trail={[{ label: "Marketplace", href: "/en/marketplace" }, { label: c.name }]} />}
        eyebrow={c.name}
        title={c.question}
        lead={c.body}
        actions={
          <>
            <Button href="#offers" variant="primary">
              Buy this intelligence
            </Button>
            <Button href="#modules" variant="ghost">
              Browse the modules
            </Button>
          </>
        }
        aside={<CategoryHeroVisual c={c} />}
      />

      <section id="modules" className="kit-section cat-modsec" data-section>
        <div className="shell">
          <SectionIntro
            index="01"
            label={`${c.modules} modules`}
            title="Every module answers one question."
            body="Each returns the evidence behind its answer, what that answer means commercially, and what should change as a result."
            align="split"
          />
          <div data-reveal>
            <ModuleExplorer modules={d.modules} />
          </div>
        </div>
      </section>

      <section id="offers" className="kit-section cat-offers" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <SectionIntro
            index="02"
            label="Buy this intelligence"
            title="Take one question, or take the whole category."
            body="Each purchase states what it examines, what it needs from you, how confident it can be and how it is delivered. No sales call is required to find any of that out."
            align="split"
          />
          <ul className={`cat-offers__grid cat-offers__grid--${d.offers.length}`}>
            {d.offers.map((o, i) => (
              <li key={o.name} className={`kit-card kit-card--lift cat-offer cat-offer--${o.tier.toLowerCase()}`} data-reveal data-reveal-delay={String(i * 90)} data-spotlight>
                <span className="cat-offer__tier">{o.tier}</span>
                <h3>{o.name}</h3>
                <p className="cat-offer__q">{o.question}</p>
                <ul className="cat-offer__scope">
                  {o.scope.split(" · ").map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <span className="cat-offer__delivery">
                  <span className="kit-mono">Delivery</span>
                  {o.delivery}
                </span>
                <Button href={DEMO_HREF} variant={i === d.offers.length - 1 ? "primary" : "ghost"}>
                  Start {o.tier.toLowerCase()}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="kit-section cat-under" data-section>
        <div className="shell cat-under__grid">
          <div>
            <SectionIntro
              index="03"
              label="Underneath"
              title={d.engines.length === 1 ? "One engine produces this category." : `${d.engines.length} engines produce this category.`}
              body="Engines are the machinery, not the offer. Nothing above required you to know one existed."
            />
          </div>
          <ul className="cat-engines">
            {d.engines.map((e, i) => (
              <li key={e.name} data-reveal data-reveal-delay={String(i * 80)}>
                {e.href ? (
                  <a className="kit-card cat-engine" href={lhref(e.href, locale)} data-spotlight>
                    <span className="kit-pill kit-pill--up">Built</span>
                    <b>{e.name}</b>
                    <p>{e.question}</p>
                    <span className="cat-engine__open">
                      Open the engine <span aria-hidden="true">→</span>
                    </span>
                  </a>
                ) : (
                  <div className="kit-card cat-engine">
                    <span className="kit-pill kit-pill--muted">In platform</span>
                    <b>{e.name}</b>
                    <p>{e.question}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="kit-section kit-section--tight cat-others" data-section>
        <Band tone="tint" edge="feather" />
        <div className="shell">
          <div className="cat-others__head">
            <span className="t-label">Other intelligence categories</span>
            <a className="cat-others__all" href={lhref("/en/marketplace", locale)}>
              All categories <span aria-hidden="true">→</span>
            </a>
          </div>
          <ul className="cat-others__rail">
            {others.map((o) => {
              const routed = CATEGORY_ROUTES.has(o.slug);
              const inner = (
                <>
                  <b>{o.name}</b>
                  <span>{o.modules} modules</span>
                </>
              );
              return (
                <li key={o.slug}>
                  {routed ? (
                    <a className="kit-card cat-other is-routed" href={lhref(catHref(o.slug), locale)} data-spotlight>
                      {inner}
                      <i aria-hidden="true">→</i>
                    </a>
                  ) : (
                    <div className="kit-card cat-other">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand
        locale={locale}
        eyebrow="Not sure where to start"
        title="Start with a decision, then open the intelligence behind it."
        primary={{ label: "Start Analysis", href: DEMO_HREF }}
        secondary={{ label: "Reconstruct a decision", href: "/en/app/reconstruct" }}
      />
    </div>
  );
}
