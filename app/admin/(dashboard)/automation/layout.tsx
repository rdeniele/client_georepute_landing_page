import type { Metadata } from "next";
import { AutomationNav } from "@/components/admin/automation/AutomationNav";
import { PageHead } from "@/components/admin/ui/kit";

export const metadata: Metadata = { title: "AI Auto-Writer | GeoRepute Admin" };

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auto-wrap">
      <PageHead title="AI Auto-Writer">
        Give it a list of topics. It writes each article, translates it into your languages and publishes on a schedule, while you stay in control.{" "}
        <a href="/admin/help#auto">How does this work?</a>
      </PageHead>
      <AutomationNav />
      {children}
    </div>
  );
}
