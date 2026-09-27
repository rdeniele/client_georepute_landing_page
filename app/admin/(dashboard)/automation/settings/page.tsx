import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseAutomationStore } from "@/lib/services/blogAutomation";
import { SettingsForm, type LanguageOption } from "@/components/admin/automation/SettingsForm";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/blog/automation/prompt";
import { BLOG_LANGUAGES } from "@/lib/blog/generation";
import { LOCALES } from "@/lib/i18n";
import { getBlogModel, getTranslationModel } from "@/lib/services/claude";

export default async function AutomationSettingsPage() {
  const supabase = await createSupabaseServerClient();
  let settings;
  try {
    settings = await new SupabaseAutomationStore(supabase).getSettings();
  } catch (error) {
    return (
      <div className="admin-banner admin-banner--error" role="alert">
        Could not load the settings{error instanceof Error ? `: ${error.message}` : "."} If you have not run the SQL in SUPABASE_SETUP.md, Step 13, do that first.
      </div>
    );
  }

  // Every language the site supports, straight from lib/i18n.ts: a language added there shows up here by itself.
  const languages: LanguageOption[] = LOCALES.map((code) => ({ code, name: BLOG_LANGUAGES[code].name, native: BLOG_LANGUAGES[code].native }));
  const zones = new Set<string>(["UTC", settings.timezone]);
  try {
    for (const z of Intl.supportedValuesOf("timeZone")) zones.add(z);
  } catch {
    // Older runtimes have no list; the current zone and UTC are still offered.
  }

  return (
    <SettingsForm
      initial={settings}
      languages={languages}
      timezones={[...zones].sort()}
      defaultPrompt={DEFAULT_SYSTEM_PROMPT}
      modelDefaults={{ generation: getBlogModel(), translation: getTranslationModel() }}
    />
  );
}
