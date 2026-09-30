"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Home", match: (p: string) => p === "/admin" },
  { href: "/admin/blogs", label: "Posts", match: (p: string) => p.startsWith("/admin/blogs") && !p.startsWith("/admin/blogs/new") },
  { href: "/admin/blogs/new", label: "Write a post", match: (p: string) => p.startsWith("/admin/blogs/new") },
  { href: "/admin/automation", label: "AI Auto-Writer", match: (p: string) => p.startsWith("/admin/automation") },
  { href: "/admin/help", label: "Help", match: (p: string) => p.startsWith("/admin/help") },
];

/** Top navigation. Marks the section you are in, so you always know where you are. */
export function AdminNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="admin-topbar__nav" aria-label="Main">
      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href} aria-current={item.match(pathname) ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
