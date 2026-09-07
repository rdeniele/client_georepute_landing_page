"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ScrollProvider } from "@/lib/ScrollProvider";
import { useReveal } from "@/lib/useReveal";
import { useSectionBeats } from "@/lib/sectionBeats";
import { applyBeat } from "@/lib/director";
import { Navigation } from "@/components/ui/Navigation";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const IntelligenceCanvas = dynamic(
  () =>
    import("@/components/three/IntelligenceCanvas").then(
      (m) => m.IntelligenceCanvas,
    ),
  { ssr: false },
);

export function SiteShell({
  children,
  home = false,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  useReveal();
  useSectionBeats(home);

  useEffect(() => {
    if (home) return;
    applyBeat({
      focus: null,
      activate: [],
      dim: 0.78,
      cam: { pos: [0, 1.6, 28], look: [0, 0, 0] },
    });
  }, [home]);

  return (
    <ScrollProvider>
      <div className="void-wash" aria-hidden="true" />
      <IntelligenceCanvas />
      <Navigation />
      {home && <ScrollProgress />}
      <main id="main" className="content">
        {children}
      </main>
    </ScrollProvider>
  );
}