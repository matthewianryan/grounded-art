"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/profile", label: "Profile", exact: true },
  { href: "/profile/wallet", label: "Wallet", exact: false },
  { href: "/profile/saved", label: "Saved", exact: false },
  { href: "/profile/check-ins", label: "Check-ins", exact: false },
  { href: "/profile/account", label: "Account", exact: false },
];

export function ProfileSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4"
      aria-label="Profile sections"
    >
      {sections.map((section) => {
        const active = section.exact
          ? pathname === section.href
          : pathname === section.href || pathname.startsWith(`${section.href}/`);

        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
