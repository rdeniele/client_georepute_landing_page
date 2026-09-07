"use client";

import { useEffect } from "react";
import { localeDirections, normalizeLocale } from "@/lib/i18n";

export function LocaleAttributes({ locale }: { locale: string }) {
  useEffect(() => {
    const value = normalizeLocale(locale);
    document.documentElement.lang = value;
    document.documentElement.dir = localeDirections[value];
    document.documentElement.dataset.locale = value;
  }, [locale]);

  return null;
}