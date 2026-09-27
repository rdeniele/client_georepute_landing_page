import type { Metadata } from "next";
import { AutomationNav } from "@/components/admin/automation/AutomationNav";

export const metadata: Metadata = { title: "AI Content Automation | GeoRepute Admin" };

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auto-wrap">
      <div className="admin-header">
        <div>
          <h1>AI Content Automation</h1>
          <p>Upload topics once. Claude writes, adapts and publishes them on your schedule.</p>
        </div>
      </div>
      <AutomationNav />
      {children}
    </div>
  );
}
