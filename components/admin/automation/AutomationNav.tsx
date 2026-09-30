"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/automation", label: "Overview", hint: "See what is happening and turn it on or off" },
  { href: "/admin/automation/queue", label: "Articles", hint: "Every article: review, approve, fix or retry" },
  { href: "/admin/automation/topics", label: "Add topics", hint: "Upload a list of topics or add one" },
  { href: "/admin/automation/settings", label: "Settings", hint: "How much, how often, which languages, who approves" },
];

export function AutomationNav() {
  const pathname = usePathname();
  return (
    <nav className="auto-tabs" aria-label="AI Auto-Writer">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} title={tab.hint} aria-current={pathname === tab.href ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
