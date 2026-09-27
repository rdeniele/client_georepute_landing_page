"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "@/lib/actions/blogAutomation";
import { BLOG_LENGTHS, type BlogLength } from "@/lib/blog/generation";
import { MAX_ARTICLES_PER_DAY, describeWorkload, normalizeSettings, type AutomationSettings, type FaqMode, type LanguageMode } from "@/lib/blog/automation/config";

export type LanguageOption = { code: string; name: string; native: string };

type Form = {
  articlesPerDay: number;
  languageMode: LanguageMode;
  allLanguages: boolean;
  languages: string[];
  sourceLocale: string;
  startDate: string;
  publishTime: string;
  timezone: string;
  spreadMinutes: number;
  lookaheadDays: number;
  autoPublish: boolean;
  requireReview: boolean;
  maxAttempts: number;
  concurrency: number;
  length: BlogLength;
  tone: string;
  seoInstructions: string;
  ctaInstructions: string;
  internalLinkingRules: string;
  categories: string;
  requiredSections: string;
  faq: FaqMode;
  systemPrompt: string;
  generationModel: string;
  translationModel: string;
  localizationReview: boolean;
};

const PRESETS = [1, 2, 5, 10, 25, 50, 100];

function fromSettings(s: AutomationSettings, defaultPrompt: string): Form {
  return {
    articlesPerDay: s.articlesPerDay,
    languageMode: s.languageMode,
    allLanguages: s.languages === null,
    languages: s.languages ?? [],
    sourceLocale: s.sourceLocale,
    startDate: s.startDate ?? "",
    publishTime: s.publishTime,
    timezone: s.timezone,
    spreadMinutes: s.spreadMinutes,
    lookaheadDays: s.lookaheadDays,
    autoPublish: s.autoPublish,
    requireReview: s.requireReview,
    maxAttempts: s.maxAttempts,
    concurrency: s.concurrency,
    length: s.config.length,
    tone: s.config.tone,
    seoInstructions: s.config.seoInstructions,
    ctaInstructions: s.config.ctaInstructions,
    internalLinkingRules: s.config.internalLinkingRules,
    categories: s.config.categories.join("\n"),
    requiredSections: s.config.requiredSections.join("\n"),
    faq: s.config.faq,
    systemPrompt: s.config.systemPrompt || defaultPrompt,
    generationModel: s.config.generationModel,
    translationModel: s.config.translationModel,
    localizationReview: s.config.localizationReview,
  };
}

/** The form as the settings the server will store. The server runs the same normalization again; this copy only drives the live summary. */
function toInput(f: Form, defaultPrompt: string) {
  return {
    articlesPerDay: f.articlesPerDay,
    languageMode: f.languageMode,
    languages: f.allLanguages ? null : f.languages,
    sourceLocale: f.sourceLocale,
    startDate: f.startDate || null,
    publishTime: f.publishTime,
    timezone: f.timezone,
    spreadMinutes: f.spreadMinutes,
    lookaheadDays: f.lookaheadDays,
    autoPublish: f.autoPublish,
    requireReview: f.requireReview,
    maxAttempts: f.maxAttempts,
    concurrency: f.concurrency,
    config: {
      length: f.length,
      tone: f.tone,
      seoInstructions: f.seoInstructions,
      ctaInstructions: f.ctaInstructions,
      internalLinkingRules: f.internalLinkingRules,
      categories: f.categories.split("\n"),
      requiredSections: f.requiredSections.split("\n"),
      faq: f.faq,
      // Unchanged built-in rules are stored as "use the default", so improvements to the default reach this site automatically.
      systemPrompt: f.systemPrompt.trim() === defaultPrompt.trim() ? "" : f.systemPrompt,
      generationModel: f.generationModel,
      translationModel: f.translationModel,
      localizationReview: f.localizationReview,
    },
  };
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="auto-card">
      <h2>{title}</h2>
      {hint ? <p className="auto-card__hint">{hint}</p> : null}
      {children}
    </section>
  );
}

function Switch({ id, checked, onChange, title, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; title: string; children: ReactNode }) {
  return (
    <label className="auto-switch" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div>
        <strong>{title}</strong>
        <span>{children}</span>
      </div>
    </label>
  );
}

export function SettingsForm({
  initial,
  languages,
  timezones,
  defaultPrompt,
  modelDefaults,
}: {
  initial: AutomationSettings;
  languages: LanguageOption[];
  timezones: string[];
  defaultPrompt: string;
  modelDefaults: { generation: string; translation: string };
}) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => fromSettings(initial, defaultPrompt));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setMsg(null);
    setF((c) => ({ ...c, [key]: value }));
  };

  const supported = useMemo(() => languages.map((l) => l.code), [languages]);
  const effective = useMemo(() => normalizeSettings(toInput(f, defaultPrompt) as never, initial, supported), [f, defaultPrompt, initial, supported]);
  const workload = describeWorkload(effective, supported);
  const promptIsDefault = f.systemPrompt.trim() === defaultPrompt.trim();
  const canonicalOptions = languages.filter((l) => workload.languages.includes(l.code));

  function save() {
    setMsg(null);
    if (!f.allLanguages && f.languages.length === 0) {
      setMsg({ tone: "error", text: "Choose at least one language, or switch on all languages." });
      return;
    }
    start(async () => {
      const res = await saveSettingsAction(toInput(f, defaultPrompt) as never);
      setMsg(res.ok ? { tone: "ok", text: "Settings saved. They apply from the next scheduler run." } : { tone: "error", text: res.error });
      if (res.ok) router.refresh();
    });
  }

  return (
    <form
      className="auto-settings"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="auto-summary" role="status" aria-live="polite">
        <strong>What this means: </strong>
        {workload.sentence}
      </div>

      <Card title="Publishing schedule" hint="How much is published, when, and in which languages.">
        <div className="admin-field">
          <label htmlFor="perday">Articles per day (1 to {MAX_ARTICLES_PER_DAY})</label>
          <div className="auto-inline">
            <input id="perday" type="number" min={1} max={MAX_ARTICLES_PER_DAY} value={f.articlesPerDay} onChange={(e) => set("articlesPerDay", Number(e.target.value))} style={{ maxWidth: 110 }} />
            {PRESETS.map((n) => (
              <button key={n} type="button" className={`admin-btn auto-btn-sm ${f.articlesPerDay === n ? "admin-btn--primary" : "admin-btn--ghost"}`} onClick={() => set("articlesPerDay", n)}>
                {n}
              </button>
            ))}
          </div>
          <span className="admin-field__hint">A topic is one article idea. Whether each topic becomes one piece or one per language is the next choice.</span>
        </div>

        <fieldset className="admin-field">
          <legend>How languages are used</legend>
          <label className="auto-choice">
            <input type="radio" name="mode" checked={f.languageMode === "all_languages"} onChange={() => set("languageMode", "all_languages")} />
            <div>
              <strong>Every topic in every selected language</strong>
              <span>Claude writes the article once, then adapts it naturally into each other language, with its own title, meta tags, URL and FAQ. 10 topics a day in 7 languages is 70 pieces a day.</span>
            </div>
          </label>
          <label className="auto-choice">
            <input type="radio" name="mode" checked={f.languageMode === "rotate"} onChange={() => set("languageMode", "rotate")} />
            <div>
              <strong>One language per topic, taking turns</strong>
              <span>Each topic is written directly in a single language and the languages rotate, so 10 topics a day is exactly 10 pieces a day. The cheapest option.</span>
            </div>
          </label>
        </fieldset>

        <fieldset className="admin-field">
          <legend>Languages</legend>
          <Switch id="all-langs" checked={f.allLanguages} onChange={(v) => set("allLanguages", v)} title="All languages the site supports">
            Follows the website automatically: when a language is added to the site, the automation starts using it. Currently {languages.length}: {languages.map((l) => l.name).join(", ")}.
          </Switch>
          {!f.allLanguages ? (
            <div className="auto-langgrid" style={{ marginTop: 10 }}>
              {languages.map((l) => (
                <label key={l.code}>
                  <input
                    type="checkbox"
                    checked={f.languages.includes(l.code)}
                    onChange={(e) => set("languages", e.target.checked ? [...f.languages, l.code] : f.languages.filter((x) => x !== l.code))}
                  />
                  {l.name} <span className="auto-count">{l.native !== l.name ? l.native : ""}</span>
                </label>
              ))}
            </div>
          ) : null}
        </fieldset>

        {f.languageMode === "all_languages" && workload.languages.length > 1 ? (
          <div className="admin-field" style={{ maxWidth: 360 }}>
            <label htmlFor="source">Language the article is first written in</label>
            <select id="source" value={effective.sourceLocale} onChange={(e) => set("sourceLocale", e.target.value)}>
              {canonicalOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <span className="admin-field__hint">The other languages are adapted from this one.</span>
          </div>
        ) : null}

        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="start">Start date (optional)</label>
            <input id="start" type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} />
            <span className="admin-field__hint">Nothing is published before this day. Leave empty to start as soon as automation is on.</span>
          </div>
          <div className="admin-field">
            <label htmlFor="time">Publishing time</label>
            <input id="time" type="time" value={f.publishTime} onChange={(e) => set("publishTime", e.target.value)} />
          </div>
        </div>
        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="tz">Time zone</label>
            <select id="tz" value={f.timezone} onChange={(e) => set("timezone", e.target.value)}>
              {timezones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="spread">Minutes between articles on the same day</label>
            <input id="spread" type="number" min={0} max={240} value={f.spreadMinutes} onChange={(e) => set("spreadMinutes", Number(e.target.value))} />
            <span className="admin-field__hint">0 publishes the whole day at once. Large days are compressed to fit within about 12 hours.</span>
          </div>
        </div>
        <div className="admin-field" style={{ maxWidth: 360 }}>
          <label htmlFor="ahead">Write this many days ahead</label>
          <input id="ahead" type="number" min={1} max={30} value={f.lookaheadDays} onChange={(e) => set("lookaheadDays", Number(e.target.value))} />
          <span className="admin-field__hint">Articles are written and checked this far before they publish, so a slow day at Claude never delays the blog. Higher means more content generated in advance.</span>
        </div>
      </Card>

      <Card title="Publishing controls">
        <Switch id="autopub" checked={f.autoPublish} onChange={(v) => set("autoPublish", v)} title="Publish automatically">
          Articles that pass every check go live at their scheduled time. Off means they wait as Ready until you publish them by hand.
        </Switch>
        <Switch id="review" checked={f.requireReview} onChange={(v) => set("requireReview", v)} title="Require human review before publishing">
          Every article waits for you to approve it (Approve, or Approve all ready) before it is scheduled. Turn this off only once you trust the output.
        </Switch>
        <p className="auto-meta">Articles that fail a check (missing fields, placeholder text, wrong language, invalid links) never publish either way: they are held as Needs review.</p>
      </Card>

      <Card title="Content" hint="These become part of the instructions Claude follows for every article.">
        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="length">Article length</label>
            <select id="length" value={f.length} onChange={(e) => set("length", e.target.value as BlogLength)}>
              {(Object.keys(BLOG_LENGTHS) as BlogLength[]).map((k) => (
                <option key={k} value={k}>
                  {BLOG_LENGTHS[k].label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="faq">FAQ section</label>
            <select id="faq" value={f.faq} onChange={(e) => set("faq", e.target.value as FaqMode)}>
              <option value="auto">When the topic has natural questions</option>
              <option value="always">Always (at least 3 questions)</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="tone">Tone and style</label>
          <textarea id="tone" rows={2} value={f.tone} onChange={(e) => set("tone", e.target.value)} />
        </div>
        <div className="admin-field">
          <label htmlFor="seo">SEO instructions</label>
          <textarea id="seo" rows={3} value={f.seoInstructions} onChange={(e) => set("seoInstructions", e.target.value)} />
        </div>
        <div className="admin-field">
          <label htmlFor="cta">Call to action</label>
          <textarea id="cta" rows={2} value={f.ctaInstructions} onChange={(e) => set("ctaInstructions", e.target.value)} />
        </div>
        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="cats">Allowed categories (one per line)</label>
            <textarea id="cats" rows={4} value={f.categories} onChange={(e) => set("categories", e.target.value)} placeholder={"Local SEO\nAI visibility\nReputation"} />
            <span className="admin-field__hint">Empty lets Claude choose. A category set on a topic always wins.</span>
          </div>
          <div className="admin-field">
            <label htmlFor="sections">Required sections (one per line)</label>
            <textarea id="sections" rows={4} value={f.requiredSections} onChange={(e) => set("requiredSections", e.target.value)} placeholder={"Key takeaways\nCommon mistakes"} />
            <span className="admin-field__hint">Each becomes a heading in every article, and is checked.</span>
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="links">Internal linking rules</label>
          <textarea id="links" rows={4} value={f.internalLinkingRules} onChange={(e) => set("internalLinkingRules", e.target.value)} placeholder={"/en/platform | when talking about the product\n/en/methodology | when explaining how results are measured"} />
          <span className="admin-field__hint">
            One per line: <code>/path | when to link there</code>. Claude may only link to these and to the site&apos;s own pages (the same ones as the navigation); any other link is removed and the publish check rejects it. Write paths as /en/... and they are localized for each language.
          </span>
        </div>
      </Card>

      <Card title="Generation rules" hint="The full instructions Claude receives, for every article. Edit them here to improve the writing without a developer.">
        <div className="admin-field">
          <label htmlFor="prompt">Rules {promptIsDefault ? "(built-in default)" : "(customized)"}</label>
          <textarea id="prompt" rows={18} value={f.systemPrompt} onChange={(e) => set("systemPrompt", e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-mono-xs)" }} />
          <span className="admin-field__hint">
            Whatever these say, Claude&apos;s answer is still forced into a fixed structure and checked by the site before saving; the rules guide the writing, they cannot change what the system does.
          </span>
        </div>
        {!promptIsDefault ? (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => set("systemPrompt", defaultPrompt)}>
            Reset to the built-in rules
          </button>
        ) : null}
      </Card>

      <Card title="Reliability and cost">
        <Switch id="loc-review" checked={f.localizationReview} onChange={(v) => set("localizationReview", v)} title="Independent review of every translation">
          A second Claude call reads each adapted article next to the original and flags mistakes. Recommended when publishing without human review. Turning it off saves one call per language.
        </Switch>
        <div className="admin-row" style={{ marginTop: 12 }}>
          <div className="admin-field">
            <label htmlFor="gen-model">Writing model</label>
            <input id="gen-model" type="text" value={f.generationModel} onChange={(e) => set("generationModel", e.target.value)} placeholder={`Server default (${modelDefaults.generation})`} />
          </div>
          <div className="admin-field">
            <label htmlFor="tr-model">Translation model</label>
            <input id="tr-model" type="text" value={f.translationModel} onChange={(e) => set("translationModel", e.target.value)} placeholder={`Server default (${modelDefaults.translation})`} />
          </div>
        </div>
        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="attempts">Attempts before an article is marked Failed</label>
            <input id="attempts" type="number" min={1} max={8} value={f.maxAttempts} onChange={(e) => set("maxAttempts", Number(e.target.value))} />
            <span className="admin-field__hint">Failed attempts are retried automatically with a growing delay.</span>
          </div>
          <div className="admin-field">
            <label htmlFor="conc">Articles written at the same time (1 to 4)</label>
            <input id="conc" type="number" min={1} max={4} value={f.concurrency} onChange={(e) => set("concurrency", Number(e.target.value))} />
            <span className="admin-field__hint">Higher is faster but uses more of your Claude rate limit.</span>
          </div>
        </div>
      </Card>

      <div className="auto-savebar">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {msg ? (
          <span role={msg.tone === "error" ? "alert" : "status"} className={msg.tone === "error" ? "auto-count auto-count--over" : "auto-count"}>
            {msg.text}
          </span>
        ) : null}
      </div>
    </form>
  );
}
