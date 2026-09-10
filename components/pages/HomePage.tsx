"use client";

import { Hero } from "@/components/sections/Hero";
import { TryTool } from "@/components/sections/TryTool";
import { Differentiation } from "@/components/sections/Differentiation";
import { PlatformFlowSection } from "@/components/sections/PlatformFlowSection";
import { ValueAreas } from "@/components/sections/ValueAreas";
import { InvisibleDecision } from "@/components/sections/InvisibleDecision";
import { SignalMap } from "@/components/sections/SignalMap";
import { DecisionReconstruction } from "@/components/sections/DecisionReconstruction";
import { BlindSpot } from "@/components/sections/BlindSpot";
import { IntelligenceEngines } from "@/components/sections/IntelligenceEngines";
import { ClosedLoop } from "@/components/sections/ClosedLoop";
import { DecisionGraphSection } from "@/components/sections/DecisionGraphSection";
import { ExecutiveIntelligence } from "@/components/sections/ExecutiveIntelligence";
import { ActionPlan } from "@/components/sections/ActionPlan";
import { Results } from "@/components/sections/Results";
import { FinalCta } from "@/components/sections/FinalCta";

export function HomePage({ locale = "en" }: { locale?: string }) {
  return (
    <>
      <Hero locale={locale} />
      <TryTool locale={locale} />
      <Differentiation locale={locale} />
      <PlatformFlowSection locale={locale} />
      <ValueAreas locale={locale} />
      <InvisibleDecision locale={locale} />
      <SignalMap locale={locale} />
      <DecisionReconstruction locale={locale} />
      <BlindSpot locale={locale} />
      <IntelligenceEngines locale={locale} />
      <ClosedLoop locale={locale} />
      <DecisionGraphSection locale={locale} />
      <ExecutiveIntelligence locale={locale} />
      <ActionPlan locale={locale} />
      <Results locale={locale} />
      <FinalCta locale={locale} />
    </>
  );
}