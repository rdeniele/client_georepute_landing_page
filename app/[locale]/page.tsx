import { HomePage } from "@/components/pages/HomePage";
import { SiteShell } from "@/components/layout/SiteShell";

export default function LocaleHomePage() {
  return (
    <SiteShell home>
      <HomePage />
    </SiteShell>
  );
}