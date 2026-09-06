"use client";

import dynamic from "next/dynamic";
import { ScrollProvider } from "@/lib/ScrollProvider";
import { useReveal } from "@/lib/useReveal";
import { useSectionBeats } from "@/lib/sectionBeats";
import { Navigation } from "@/components/ui/Navigation";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { InvisibleDecision } from "@/components/sections/InvisibleDecision";
import { SignalMap } from "@/components/sections/SignalMap";
import { DecisionReconstruction } from "@/components/sections/DecisionReconstruction";
import { BlindSpot } from "@/components/sections/BlindSpot";
import { IntelligenceEngines } from "@/components/sections/IntelligenceEngines";
import { ClosedLoop } from "@/components/sections/ClosedLoop";
import { DecisionGraphSection } from "@/components/sections/DecisionGraphSection";
import { ExecutiveIntelligence } from "@/components/sections/ExecutiveIntelligence";
import { ActionPlan } from "@/components/sections/ActionPlan";
import { FinalCta } from "@/components/sections/FinalCta";

// The scene owns a WebGL context and reads window on mount — it must never
// render on the server, and it must not block first paint of the copy.
const IntelligenceCanvas = dynamic(
  () =>
    import("@/components/three/IntelligenceCanvas").then(
      (m) => m.IntelligenceCanvas,
    ),
  { ssr: false },
);

export default function Page() {
  useReveal();
  useSectionBeats();

  return (
    <ScrollProvider>
      <div className="void-wash" aria-hidden="true" />
      <IntelligenceCanvas />

      <Navigation />
      <ScrollProgress />

      <main id="main" className="content">
        <Hero />
        <InvisibleDecision />
        <SignalMap />
        <DecisionReconstruction />
        <BlindSpot />
        <IntelligenceEngines />
        <ClosedLoop />
        <DecisionGraphSection />
        <ExecutiveIntelligence />
        <ActionPlan />
        <FinalCta />
      </main>
    </ScrollProvider>
  );
}
