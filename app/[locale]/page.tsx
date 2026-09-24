import { HomePage } from "@/components/pages/HomePage";
import { SiteShell } from "@/components/layout/SiteShell";
import { LOCALES, normalizeLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { homeMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return LOCALES.includes(locale as (typeof LOCALES)[number]) ? homeMetadata(locale) : {};
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) notFound();
  return (
    <SiteShell home locale={normalizeLocale(locale)}>
      <HomePage locale={locale} />
    </SiteShell>
  );
}