"use client";

import { Hero } from "@/components/sections/Hero";
import { Differentiation } from "@/components/sections/Differentiation";
import { PlatformFlowSection } from "@/components/sections/PlatformFlowSection";
import { ExecutiveIntelligence } from "@/components/sections/ExecutiveIntelligence";
import { Infrastructure } from "@/components/sections/Infrastructure";
import { FinalCta } from "@/components/sections/FinalCta";

export function HomePage({ locale = "en" }: { locale?: string }) {
  return (
    <>
      <Hero locale={locale} />
      <Differentiation locale={locale} />
      <PlatformFlowSection locale={locale} />
      <ExecutiveIntelligence locale={locale} />
      <Infrastructure locale={locale} />
      <FinalCta locale={locale} />
    </>
  );
}
