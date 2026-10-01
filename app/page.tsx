import { HomePage } from "@/components/pages/HomePage";
import { SiteShell } from "@/components/layout/SiteShell";

export default function Page() {
  return (
    <SiteShell home locale="en">
      <HomePage locale="en" />
    </SiteShell>
  );
}
