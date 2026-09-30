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
  inlineImages: number;
  charts: number;
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
    inlineImages: s.config.inlineImages,
    charts: s.config.charts,
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
      inlineImages: f.inlineImages,
      charts: f.charts,
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

  // The two publishing switches, presented as the three choices a person actually has.
  const approval: "ask" | "auto" | "manual" = f.requireReview && f.autoPublish ? "ask" : !f.requireReview && f.autoPublish ? "auto" : "manual";
  function setApproval(v: "ask" | "auto" | "manual") {
    setMsg(null);
    setF((c) => ({ ...c, requireReview: v !== "auto", autoPublish: v !== "manual" }));
  }

  function save() {
    setMsg(null);
    if (!f.allLanguages && f.languages.length === 0) {
      setMsg({ tone: "error", text: "Choose at least one language, or switch on “All the languages your website has”." });
      return;
    }
    start(async () => {
      const res = await saveSettingsAction(toInput(f, defaultPrompt) as never);
      setMsg(res.ok ? { tone: "ok", text: "Saved. It applies from the next round of work." } : { tone: "error", text: res.error });
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
        <strong>In plain words: </strong>
        {workload.sentence}
      </div>

      <Card title="1. How much, how often, which languages" hint="The main choices. The summary above updates as you change them.">
        <div className="admin-field">
          <label htmlFor="perday">How many new articles a day? (1 to {MAX_ARTICLES_PER_DAY})</label>
          <div className="auto-inline">
            <input id="perday" type="number" min={1} max={MAX_ARTICLES_PER_DAY} value={f.articlesPerDay} onChange={(e) => set("articlesPerDay", Number(e.target.value))} style={{ maxWidth: 110 }} />
            {PRESETS.map((n) => (
              <button key={n} type="button" className={`admin-btn auto-btn-sm ${f.articlesPerDay === n ? "admin-btn--primary" : "admin-btn--ghost"}`} onClick={() => set("articlesPerDay", n)}>
                {n}
              </button>
            ))}
          </div>
          <span className="admin-field__hint">Not sure? Start with 1 or 2 a day. You can change it any time.</span>
        </div>

        <fieldset className="admin-field">
          <legend>How should languages work?</legend>
          <div className="ui-choice-grid">
            <label className="ui-choice">
              <input type="radio" name="mode" checked={f.languageMode === "all_languages"} onChange={() => set("languageMode", "all_languages")} />
              <div>
                <strong>Every article in every language you choose</strong>
                <span>The AI writes the article once, then adapts it for each other language (its own title, search descriptions, web address and questions). 10 articles a day in 7 languages is 70 posts a day.</span>
              </div>
            </label>
            <label className="ui-choice">
              <input type="radio" name="mode" checked={f.languageMode === "rotate"} onChange={() => set("languageMode", "rotate")} />
              <div>
                <strong>One language per article, taking turns</strong>
                <span>Each article is written in just one language, and the languages rotate. 10 articles a day is exactly 10 posts a day. The cheapest option.</span>
              </div>
            </label>
          </div>
        </fieldset>

        <fieldset className="admin-field">
          <legend>Which languages?</legend>
          <Switch id="all-langs" checked={f.allLanguages} onChange={(v) => set("allLanguages", v)} title="All the languages your website has">
            It keeps up with your website: when a language is added to the site, the Auto-Writer starts using it. Right now that is {languages.length}: {languages.map((l) => l.name).join(", ")}.
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
            <label htmlFor="source">Write the first version in</label>
            <select id="source" value={effective.sourceLocale} onChange={(e) => set("sourceLocale", e.target.value)}>
              {canonicalOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <span className="admin-field__hint">The other languages are translated from this one. English is a safe choice.</span>
          </div>
        ) : null}

        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="start">Start on (optional)</label>
            <input id="start" type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} />
            <span className="admin-field__hint">Nothing goes live before this day. Empty means as soon as the Auto-Writer is on.</span>
          </div>
          <div className="admin-field">
            <label htmlFor="time">Time of day articles go live</label>
            <input id="time" type="time" value={f.publishTime} onChange={(e) => set("publishTime", e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="tz">Your time zone</label>
            <select id="tz" value={f.timezone} onChange={(e) => set("timezone", e.target.value)}>
              {timezones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <details className="ui-more">
          <summary>More timing options</summary>
          <div className="admin-row" style={{ marginTop: 12 }}>
            <div className="admin-field">
              <label htmlFor="spread">Minutes between articles on the same day</label>
              <input id="spread" type="number" min={0} max={240} value={f.spreadMinutes} onChange={(e) => set("spreadMinutes", Number(e.target.value))} />
              <span className="admin-field__hint">0 puts the whole day live at once. Very big days are squeezed into about 12 hours.</span>
            </div>
            <div className="admin-field">
              <label htmlFor="ahead">Prepare articles this many days early</label>
              <input id="ahead" type="number" min={1} max={30} value={f.lookaheadDays} onChange={(e) => set("lookaheadDays", Number(e.target.value))} />
              <span className="admin-field__hint">Early is safer: a slow day at the AI never delays your blog. It also means more is written in advance.</span>
            </div>
          </div>
        </details>
      </Card>

      <Card title="2. Who approves articles?" hint="You always stay in control. Articles that fail a check (broken link, wrong language, missing parts) never go live in any of these modes.">
        <div className="ui-choice-grid">
          <label className="ui-choice">
            <input type="radio" name="approval" checked={approval === "ask"} onChange={() => setApproval("ask")} />
            <div>
              <strong>Ask me first</strong>
              <span>Each article waits for your OK. Press Approve on the Articles page, and it goes live at its scheduled time.</span>
            </div>
          </label>
          <label className="ui-choice">
            <input type="radio" name="approval" checked={approval === "auto"} onChange={() => setApproval("auto")} />
            <div>
              <strong>Fully automatic</strong>
              <span>Articles that pass every check go live by themselves. Choose this once you have read a few and trust the results.</span>
            </div>
          </label>
          <label className="ui-choice">
            <input type="radio" name="approval" checked={approval === "manual"} onChange={() => setApproval("manual")} />
            <div>
              <strong>
                I publish by hand<span className="ui-badge">safest</span>
              </strong>
              <span>Articles are written and checked, but never go live until you press Publish on each one.</span>
            </div>
          </label>
        </div>
      </Card>

      <Card title="3. What the articles are like" hint="These become part of the instructions the AI follows for every article.">
        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor="length">How long should they be?</label>
            <select id="length" value={f.length} onChange={(e) => set("length", e.target.value as BlogLength)}>
              {(Object.keys(BLOG_LENGTHS) as BlogLength[]).map((k) => (
                <option key={k} value={k}>
                  {BLOG_LENGTHS[k].label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="faq">Questions and answers at the end</label>
            <select id="faq" value={f.faq} onChange={(e) => set("faq", e.target.value as FaqMode)}>
              <option value="auto">When the topic has natural questions</option>
              <option value="always">Always (at least 3)</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
        <div className="admin-field" style={{ maxWidth: 420 }}>
          <label htmlFor="inline-images">Pictures inside each article</label>
          <select id="inline-images" value={f.inlineImages} onChange={(e) => set("inlineImages", Number(e.target.value))}>
            <option value={0}>None (only the main picture)</option>
            <option value={1}>1 picture</option>
            <option value={2}>2 pictures</option>
            <option value={3}>3 pictures</option>
            <option value={4}>4 pictures</option>
          </select>
          <span className="admin-field__hint">
            Free stock photos placed next to the sections where they help, each with a description for search engines and a credit to the photographer. The AI may use fewer. Needs the photo key (see Help). Each picture uses a few of Unsplash&apos;s hourly requests.
          </span>
        </div>
        <div className="admin-field" style={{ maxWidth: 420 }}>
          <label htmlFor="charts">Charts and diagrams inside each article</label>
          <select id="charts" value={f.charts} onChange={(e) => set("charts", Number(e.target.value))}>
            <option value={0}>None</option>
            <option value={1}>1 chart or diagram</option>
            <option value={2}>2 charts or diagrams</option>
          </select>
          <span className="admin-field__hint">
            A step-by-step diagram when the article explains a process, or a bar chart when you gave real numbers in the topic notes. It never makes up statistics: a chart whose numbers are not in your notes is clearly labelled &ldquo;illustrative example, not real data&rdquo;. The AI may use fewer.
          </span>
        </div>
        <div className="admin-field">
          <label htmlFor="tone">Tone and style</label>
          <textarea id="tone" rows={2} value={f.tone} onChange={(e) => set("tone", e.target.value)} />
          <span className="admin-field__hint">Describe how you want it to sound, as you would brief a human writer.</span>
        </div>
        <div className="admin-field">
          <label htmlFor="cta">What should readers do at the end?</label>
          <textarea id="cta" rows={2} value={f.ctaInstructions} onChange={(e) => set("ctaInstructions", e.target.value)} />
          <span className="admin-field__hint">Every article ends with a short call to action. Say what it should invite people to do.</span>
        </div>

        <details className="ui-more">
          <summary>More writing options (optional)</summary>
          <div style={{ marginTop: 12 }}>
            <div className="admin-field">
              <label htmlFor="seo">Search-engine instructions</label>
              <textarea id="seo" rows={3} value={f.seoInstructions} onChange={(e) => set("seoInstructions", e.target.value)} />
              <span className="admin-field__hint">The AI already follows good SEO practice on its own. Add your own rules here only if you have them.</span>
            </div>
            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="cats">Allowed categories (one per line)</label>
                <textarea id="cats" rows={4} value={f.categories} onChange={(e) => set("categories", e.target.value)} placeholder={"Local SEO\nAI visibility\nReputation"} />
                <span className="admin-field__hint">Empty lets the AI choose. A category set on a topic always wins.</span>
              </div>
              <div className="admin-field">
                <label htmlFor="sections">Sections every article must have (one per line)</label>
                <textarea id="sections" rows={4} value={f.requiredSections} onChange={(e) => set("requiredSections", e.target.value)} placeholder={"Common mistakes\nNext steps"} />
                <span className="admin-field__hint">Each becomes a heading in every article, and is checked.</span>
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="links">Pages articles may link to</label>
              <textarea id="links" rows={4} value={f.internalLinkingRules} onChange={(e) => set("internalLinkingRules", e.target.value)} placeholder={"/en/platform | when talking about the product\n/en/methodology | when explaining how results are measured"} />
              <span className="admin-field__hint">
                One per line: <code>/page | when to link there</code>. The AI can only link to these and to your site&apos;s main pages; any other link is removed. Write them as /en/... and they are adjusted for each language.
              </span>
            </div>
          </div>
        </details>
      </Card>

      <details className="auto-card auto-card--fold">
        <summary>
          <h2>Advanced settings</h2>
          <span className="auto-card__hint">Most people never need these. The defaults work well.</span>
        </summary>

        <div style={{ marginTop: 16 }}>
          <h3 className="auto-card__sub">The AI&apos;s full instructions</h3>
          <p className="auto-card__hint">The complete instructions the AI receives for every article. Edit them to change how it writes, without needing a developer.</p>
          <div className="admin-field">
            <label htmlFor="prompt">Instructions {promptIsDefault ? "(the built-in ones)" : "(customized)"}</label>
            <textarea id="prompt" rows={18} value={f.systemPrompt} onChange={(e) => set("systemPrompt", e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-mono-xs)" }} />
            <span className="admin-field__hint">
              Whatever these say, the AI&apos;s answer is still put into a fixed structure and checked before anything is saved. The search-engine rules are always applied on top.
            </span>
          </div>
          {!promptIsDefault ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => set("systemPrompt", defaultPrompt)}>
              Go back to the built-in instructions
            </button>
          ) : null}

          <h3 className="auto-card__sub" style={{ marginTop: 28 }}>Quality and cost</h3>
          <Switch id="loc-review" checked={f.localizationReview} onChange={(v) => set("localizationReview", v)} title="Have every translation double-checked">
            A second AI reads each translation next to the original and flags mistakes. Recommended when articles go live without you reading them. Turning it off saves one AI call per language.
          </Switch>
          <div className="admin-row" style={{ marginTop: 12 }}>
            <div className="admin-field">
              <label htmlFor="gen-model">AI model for writing</label>
              <input id="gen-model" type="text" value={f.generationModel} onChange={(e) => set("generationModel", e.target.value)} placeholder={`Leave empty to use the default (${modelDefaults.generation})`} />
            </div>
            <div className="admin-field">
              <label htmlFor="tr-model">AI model for translating</label>
              <input id="tr-model" type="text" value={f.translationModel} onChange={(e) => set("translationModel", e.target.value)} placeholder={`Leave empty to use the default (${modelDefaults.translation})`} />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-field">
              <label htmlFor="attempts">Tries before giving up on an article</label>
              <input id="attempts" type="number" min={1} max={8} value={f.maxAttempts} onChange={(e) => set("maxAttempts", Number(e.target.value))} />
              <span className="admin-field__hint">Each failed try is repeated automatically after a growing pause.</span>
            </div>
            <div className="admin-field">
              <label htmlFor="conc">Articles written at the same time (1 to 4)</label>
              <input id="conc" type="number" min={1} max={4} value={f.concurrency} onChange={(e) => set("concurrency", Number(e.target.value))} />
              <span className="admin-field__hint">Higher is faster but uses more of your AI allowance.</span>
            </div>
          </div>
        </div>
      </details>

      <div className="auto-savebar">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {msg ? (
          <span role={msg.tone === "error" ? "alert" : "status"} className={msg.tone === "error" ? "auto-count auto-count--over" : "auto-count"}>
            {msg.text}
          </span>
        ) : (
          <span className="auto-count">Changes apply from the next round of work. Articles already written are not changed.</span>
        )}
      </div>
    </form>
  );
}
