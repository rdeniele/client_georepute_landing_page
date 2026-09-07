import { nav } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Band } from "@/components/ui/Band";
import { SiteFooter } from "@/components/ui/SiteFooter";

type NavPageData = {
  title: string;
  description: string;
  category: string;
  href: string;
};

const pages: Record<string, NavPageData> = {
  "/en/how-it-works": {
    title: "How GeoRepute reads the decision environment.",
    description: "GeoRepute reconstructs the questions, evidence, alternatives, and recommendations that shape a decision before the click.",
    category: "Orientation",
    href: "/en/how-it-works",
  },
  "/en/methodology": {
    title: "A method built around evidence.",
    description: "The system resolves independent signals into a decision position, with each measure opening the evidence behind it.",
    category: "Methodology",
    href: "/en/methodology",
  },
  "/en/signin": {
    title: "Return to the intelligence room.",
    description: "Sign in to continue to your GeoRepute workspace.",
    category: "Account",
    href: "/en/signin",
  },
  "/en/election-intelligence": {
    title: "See which narratives move the electorate.",
    description: "Which narratives are moving the electorate, who is carrying them, and what must change.",
    category: "Platform",
    href: "/en/election-intelligence",
  },
  "/en/app/mission-control": {
    title: "Ten measures. One decision position.",
    description: "Ten measures, one decision position, each opening its evidence.",
    category: "Platform",
    href: "/en/app/mission-control",
  },
  "/en/app/campaign-readiness": {
    title: "Know whether the business is ready to launch.",
    description: "Should we launch this campaign today? Campaign readiness assesses the business, not the campaign.",
    category: "Platform",
    href: "/en/app/campaign-readiness",
  },
  "/en/app/narrative": {
    title: "See the story the market is telling.",
    description: "What story is the market telling, and how is it influencing decisions?",
    category: "Platform",
    href: "/en/app/narrative",
  },
  "/en/app/actions": {
    title: "Turn intelligence into the next action.",
    description: "Prioritised interventions with owners, deadlines, and measurement.",
    category: "Platform",
    href: "/en/app/actions",
  },
  "/en/engines": {
    title: "Twelve engines. One connected system.",
    description: "Each engine answers a question the others depend on, from recognition and visibility to action and executive intelligence.",
    category: "Intelligence Engines",
    href: "/en/engines",
  },
  "/en/engines/ai-recognition": {
    title: "Does AI understand who the business is?",
    description: "AI Recognition examines whether AI engines understand the business, its category, and what it offers.",
    category: "Intelligence Engine",
    href: "/en/engines/ai-recognition",
  },
  "/en/engines/google-vs-ai": {
    title: "Google and AI: two discovery surfaces.",
    description: "Google vs AI Visibility examines whether the business exists consistently across both discovery surfaces.",
    category: "Intelligence Engine",
    href: "/en/engines/google-vs-ai",
  },
  "/en/engines/competitor-decision": {
    title: "Who receives the decision instead?",
    description: "Competitor Decision examines who receives the answer, what they have, and why they are named.",
    category: "Intelligence Engine",
    href: "/en/engines/competitor-decision",
  },
  "/en/engines/action": {
    title: "Know what must happen next.",
    description: "Action Intelligence resolves what must happen next, by whom, and by when.",
    category: "Intelligence Engine",
    href: "/en/engines/action",
  },
  "/en/marketplace": {
    title: "The intelligence ecosystem around the decision.",
    description: "Explore the intelligence surfaces that make recognition, visibility, competition, and executive action inspectable.",
    category: "Marketplace",
    href: "/en/marketplace",
  },
  "/en/marketplace/category/ai-visibility-intelligence": {
    title: "Does AI know the business exists?",
    description: "AI Visibility Intelligence examines what AI thinks the business is and where that understanding appears.",
    category: "Marketplace / AI visibility",
    href: "/en/marketplace/category/ai-visibility-intelligence",
  },
  "/en/marketplace/category/competitive-intelligence": {
    title: "Understand who receives the decision instead.",
    description: "Competitive Intelligence examines the alternatives competing for the answer and what distinguishes them.",
    category: "Marketplace / Competitive intelligence",
    href: "/en/marketplace/category/competitive-intelligence",
  },
  "/en/marketplace/category/executive-intelligence": {
    title: "Give the decision a position leadership can use.",
    description: "Executive Intelligence brings the measures and their evidence into one decision position.",
    category: "Marketplace / Executive intelligence",
    href: "/en/marketplace/category/executive-intelligence",
  },
};

function findPage(pathname: string) {
  const direct = pages[pathname];
  if (direct) return direct;

  for (const group of nav.groups) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) {
      return {
        title: item.name,
        description: item.desc,
        category: group.label,
        href: pathname,
      };
    }
  }

  return null;
}

export function NavSubpage({ pathname }: { pathname: string }) {
  const page = findPage(pathname);
  if (!page) return null;

  return (
    <div className="subpage subpage--generic">
      <section className="subhero" aria-labelledby="subpage-title">
        <Band tone="tint" edge="top-hard" />
        <div className="shell subhero__grid">
          <div className="subhero__copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/en">GeoRepute</a>
              <span aria-hidden="true">/</span>
              <span>{page.category}</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.title}</span>
            </nav>
            <span className="t-eyebrow subhero__eyebrow">{page.category}</span>
            <h1 id="subpage-title" className="subhero__title">
              {page.title}
            </h1>
            <p className="t-lead subhero__body">{page.description}</p>
            <div className="subhero__actions">
              <Button href="/en/app/reconstruct" variant="primary">Start with a reconstruction</Button>
              <Button href="/en/how-it-works" variant="ghost">See how it works</Button>
            </div>
          </div>

          <div className="generic-signal glass" aria-label={`${page.category} signal panel`}>
            <span className="t-eyebrow">Live question</span>
            <strong>{page.description}</strong>
            <div className="generic-signal__path">
              <span>Signal</span>
              <i aria-hidden="true" />
              <span>Evidence</span>
              <i aria-hidden="true" />
              <span>Decision</span>
            </div>
            <span className="generic-signal__route">{page.href}</span>
          </div>
        </div>
      </section>

      <nav className="subnav" aria-label={`${page.category} sections`}>
        <div className="shell subnav__inner">
          <span className="subnav__label">{page.category}</span>
          <a href="#overview">Overview</a>
          <a href="#evidence">Evidence</a>
          <a href="#next">Next action</a>
        </div>
      </nav>

      <section id="overview" className="subsection subsection--overview" data-section>
        <div className="shell subsection__intro">
          <div>
            <span className="t-eyebrow">01 / What it measures</span>
            <h2 className="t-h2">Make the invisible surface inspectable.</h2>
          </div>
          <p className="t-body">{page.description} GeoRepute keeps the question connected to the evidence so the position can be acted on.</p>
        </div>
        <div className="shell evidence-strip evidence-strip--generic">
          <span>Question</span>
          <span>Interpretation</span>
          <span>Evidence</span>
          <span>Context</span>
          <span>Position</span>
          <span>Action</span>
        </div>
      </section>

      <section id="evidence" className="subsection subsection--stages" data-section>
        <Band tone="paper" edge="feather" />
        <div className="shell subsection__heading">
          <div>
            <span className="t-eyebrow">02 / The working view</span>
            <h2 className="t-h2">Every signal opens its evidence.</h2>
          </div>
          <p className="t-body">The output stays connected to the reason behind it.</p>
        </div>
        <div className="shell generic-evidence-grid">
          <article className="generic-evidence-card" data-reveal>
            <span className="t-eyebrow">Signal</span>
            <h3>{page.category}</h3>
            <p>{page.description}</p>
          </article>
          <article className="generic-evidence-card" data-reveal data-reveal-delay="80">
            <span className="t-eyebrow">Decision position</span>
            <h3>Inspectable</h3>
            <p>Trace the path from what was asked to what the market is prepared to choose.</p>
          </article>
          <article className="generic-evidence-card" data-reveal data-reveal-delay="160">
            <span className="t-eyebrow">Next action</span>
            <h3>Connected</h3>
            <p>Use the evidence to decide what should change next, without separating analysis from execution.</p>
          </article>
        </div>
      </section>

      <section id="next" className="subpage-cta band band--color" data-section>
        <Band tone="color" network edge="top-hard" />
        <div className="shell subpage-cta__inner">
          <span className="t-eyebrow">03 / Continue into the system</span>
          <h2 className="t-h2">Start with the decision, then open the evidence.</h2>
          <p className="t-lead">Decision Reconstruction is the clearest way to see how the system connects the question to the answer.</p>
          <Button href="/en/app/reconstruct" variant="primary">Open Decision Reconstruction</Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}