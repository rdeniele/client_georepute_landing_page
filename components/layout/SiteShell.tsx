"use client";

import { ScrollProvider } from "@/lib/ScrollProvider";
import { useReveal } from "@/lib/useReveal";
import { Navigation } from "@/components/ui/Navigation";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { LocaleAttributes } from "@/components/ui/LocaleAttributes";

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

  return (
    <ScrollProvider>
      <LocaleAttributes locale={locale} />
      <div className="void-wash" aria-hidden="true" />
      <Navigation />
      {home && <ScrollProgress />}
      <main id="main" className="content">
        {children}
      </main>
    </ScrollProvider>
  );
}