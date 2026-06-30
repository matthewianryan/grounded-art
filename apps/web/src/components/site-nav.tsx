"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/map", label: "Map", live: true },
  { href: "/feed", label: "Feed", live: true },
  { href: "/profile", label: "Profile", live: false },
  { href: "/contact", label: "Contact us", live: false },
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

        <nav
          className="flex items-center gap-2 rounded-full border border-line bg-paper px-2 py-1.5 text-xs uppercase tracking-[0.14em] sm:gap-1 sm:px-3"
          aria-label="Main"
        >
          <span className="hidden px-2 text-muted sm:inline-flex" aria-hidden="true">
            <MenuIcon />
          </span>

          {links.map(({ href, label, live }) => {
            const active = live && (pathname === href || pathname.startsWith(`${href}/`));

            if (!live) {
              return (
                <span
                  key={href}
                  aria-disabled="true"
                  className="cursor-default px-2.5 py-1.5 text-muted/70 sm:px-3"
                  title="Coming soon"
                >
                  {label}
                </span>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-2.5 py-1.5 transition sm:px-3 ${
                  active
                    ? "bg-ink text-paper"
                    : "text-muted hover:bg-line/40 hover:text-ink"
                }`}
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

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
