import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { WarRoomPage } from "@/components/pages/WarRoomPage";
import { EngineDetailPage } from "@/components/pages/EngineDetailPage";
import { EnginesIndexPage } from "@/components/pages/EnginesIndexPage";
import { MissionControlPage } from "@/components/pages/MissionControlPage";
import { ActionCenterPage } from "@/components/pages/ActionCenterPage";
import { CampaignReadinessPage } from "@/components/pages/CampaignReadinessPage";
import { NarrativePage } from "@/components/pages/NarrativePage";
import { DecisionReconstructionPage } from "@/components/pages/DecisionReconstructionPage";
import { HowItWorksPage } from "@/components/pages/HowItWorksPage";
import { MethodologyPage } from "@/components/pages/MethodologyPage";
import { MarketplaceCategoryPage, MarketplacePage } from "@/components/pages/MarketplacePages";
import { SignInPage } from "@/components/pages/SignInPage";
import { PrivacyPolicyPage } from "@/components/pages/PrivacyPolicyPage";
import { LOCALES } from "@/lib/i18n";

const ROUTES: Record<string, (locale: string) => ReactNode> = {
  "election-intelligence": (l) => <WarRoomPage locale={l} />,
  "how-it-works": (l) => <HowItWorksPage locale={l} />,
  methodology: (l) => <MethodologyPage locale={l} />,
  signin: (l) => <SignInPage locale={l} />,
  privacy: (l) => <PrivacyPolicyPage locale={l} />,

  "app/mission-control": (l) => <MissionControlPage locale={l} />,
  "app/reconstruct": (l) => <DecisionReconstructionPage locale={l} />,
  "app/campaign-readiness": (l) => <CampaignReadinessPage locale={l} />,
  "app/narrative": (l) => <NarrativePage locale={l} />,
  "app/actions": (l) => <ActionCenterPage locale={l} />,

  engines: (l) => <EnginesIndexPage locale={l} />,
  "engines/ai-recognition": (l) => <EngineDetailPage slug="ai-recognition" locale={l} />,
  "engines/google-vs-ai": (l) => <EngineDetailPage slug="google-vs-ai" locale={l} />,
  "engines/competitor-decision": (l) => <EngineDetailPage slug="competitor-decision" locale={l} />,
  "engines/action": (l) => <EngineDetailPage slug="action" locale={l} />,

  marketplace: (l) => <MarketplacePage locale={l} />,
  "marketplace/category/ai-visibility-intelligence": (l) => <MarketplaceCategoryPage slug="ai-visibility-intelligence" locale={l} />,
  "marketplace/category/search-intelligence": (l) => <MarketplaceCategoryPage slug="search-intelligence" locale={l} />,
  "marketplace/category/competitive-intelligence": (l) => <MarketplaceCategoryPage slug="competitive-intelligence" locale={l} />,
  "marketplace/category/trust-intelligence": (l) => <MarketplaceCategoryPage slug="trust-intelligence" locale={l} />,
  "marketplace/category/content-intelligence": (l) => <MarketplaceCategoryPage slug="content-intelligence" locale={l} />,
  "marketplace/category/market-intelligence": (l) => <MarketplaceCategoryPage slug="market-intelligence" locale={l} />,
  "marketplace/category/executive-intelligence": (l) => <MarketplaceCategoryPage slug="executive-intelligence" locale={l} />,
};

/** The subpage slugs this route serves, e.g. `"app/mission-control"` — read by app/sitemap.ts so it doesn't have to duplicate this list. */
export const SUBPAGE_ROUTE_SLUGS = Object.keys(ROUTES);

export default async function SubpageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) notFound();

  const render = ROUTES[slug.join("/")];
  if (!render) notFound();

  return <SiteShell locale={locale}>{render(locale)}</SiteShell>;
}
