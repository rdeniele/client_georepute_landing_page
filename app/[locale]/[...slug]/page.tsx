import { notFound } from "next/navigation";
import { DecisionReconstructionPage } from "@/components/pages/DecisionReconstructionPage";
import { NavSubpage } from "@/components/pages/NavSubpage";
import { SiteShell } from "@/components/layout/SiteShell";
import { LOCALES, normalizeLocale } from "@/lib/i18n";

export default async function SubpageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) notFound();

  const pathname = `/${locale}/${slug.join("/")}`;
  const sourcePathname = `/${normalizeLocale("en")}/${slug.join("/")}`;
  const page = slug.join("/") === "app/reconstruct" ? (
    <DecisionReconstructionPage />
  ) : (
    <NavSubpage pathname={sourcePathname} />
  );

  if (!page) notFound();

  return <SiteShell locale={locale}>{page}</SiteShell>;
}