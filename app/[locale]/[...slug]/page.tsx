import { notFound } from "next/navigation";
import { DecisionReconstructionPage } from "@/components/pages/DecisionReconstructionPage";
import { NavSubpage } from "@/components/pages/NavSubpage";
import { SiteShell } from "@/components/layout/SiteShell";

export default async function SubpageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "en") notFound();

  const pathname = `/${locale}/${slug.join("/")}`;
  const page = pathname === "/en/app/reconstruct" ? (
    <DecisionReconstructionPage />
  ) : (
    <NavSubpage pathname={pathname} />
  );

  if (!page) notFound();

  return <SiteShell>{page}</SiteShell>;
}