"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

// Top navigation for the web app. Unlike the landing nav, Map and Feed are real routes, so the
// current page is marked. The wordmark carries the same rust rule as the landing for continuity.
const links = [
  { href: "/map", label: "Map" },
  { href: "/feed", label: "Feed" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex flex-col" aria-label="Grounded Art home">
          <span className="font-display text-lg leading-none">Grounded Art</span>
          <span className="mt-1.5 h-px w-7 bg-accent" aria-hidden="true" />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted sm:gap-7">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`transition hover:text-ink ${active ? "text-ink" : ""}`}
              >
                {label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
