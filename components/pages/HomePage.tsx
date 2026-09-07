"use client";

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

export function HomePage({ locale = "en" }: { locale?: string }) {
  return (
    <>
      <Hero locale={locale} />
      <InvisibleDecision locale={locale} />
      <SignalMap />
      <DecisionReconstruction />
      <BlindSpot />
      <IntelligenceEngines />
      <ClosedLoop />
      <DecisionGraphSection />
      <ExecutiveIntelligence />
      <ActionPlan />
      <FinalCta />
    </>
  );
}