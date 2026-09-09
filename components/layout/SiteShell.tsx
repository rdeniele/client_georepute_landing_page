"use client";

import { ScrollProvider } from "@/lib/ScrollProvider";
import { useReveal } from "@/lib/useReveal";
import { useSectionBeats } from "@/lib/sectionBeats";
import { Navigation } from "@/components/ui/Navigation";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { LocaleAttributes } from "@/components/ui/LocaleAttributes";
import { IntelligenceCanvas } from "@/components/three/IntelligenceCanvas";
import { Cursor } from "@/components/ui/Cursor";

export function SiteShell({
  children,
  home = false,
  locale = "en",
}: {
  children: React.ReactNode;
  home?: boolean;
  locale?: string;
}) {
  useReveal();
  // The camera timeline is keyed to this page's own section ids (#top,
  // #invisible, #signals, ...) — only meaningful on the home page.
  useSectionBeats(home);

  return (
    <ScrollProvider>
      <LocaleAttributes locale={locale} />
      <Cursor />
      <div className="void-wash" aria-hidden="true" />
      {home && <IntelligenceCanvas />}
      <Navigation />
      {home && <ScrollProgress locale={locale} />}
      <main id="main" className="content">
        {children}
      </main>
    </ScrollProvider>
  );
}