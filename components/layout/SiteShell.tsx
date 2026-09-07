"use client";

import { ScrollProvider } from "@/lib/ScrollProvider";
import { useReveal } from "@/lib/useReveal";
import { Navigation } from "@/components/ui/Navigation";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export function SiteShell({
  children,
  home = false,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  useReveal();

  return (
    <ScrollProvider>
      <div className="void-wash" aria-hidden="true" />
      <Navigation />
      {home && <ScrollProgress />}
      <main id="main" className="content">
        {children}
      </main>
    </ScrollProvider>
  );
}