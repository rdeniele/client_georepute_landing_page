"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/automation", label: "Overview" },
  { href: "/admin/automation/queue", label: "Content queue" },
  { href: "/admin/automation/topics", label: "Add topics" },
  { href: "/admin/automation/settings", label: "Settings" },
];

export function AutomationNav() {
  const pathname = usePathname();
  return (
    <nav className="auto-tabs" aria-label="AI Content Automation">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
