import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/app/map", label: "Map", app: true },
  { href: "/app/feed", label: "Feed", app: true },
  { href: "/app/sign-in?returnTo=/app/profile", label: "Profile", app: true },
  { href: "/contact", label: "Contact us" },
];

// Shared top navigation. The wordmark is "Grounded Art" in Noto Serif with a short rust rule
// beneath it. Redesign nav links lead into the live app surfaces, with Contact us owned by the
// landing zone at the domain root.
export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
        <Link href="/" className="inline-flex flex-col" aria-label="Grounded Art home">
          <span className="font-display text-lg leading-none">Grounded Art</span>
          <span className="mt-1.5 h-px w-7 bg-accent" aria-hidden="true" />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted sm:gap-6 sm:text-sm">
          {links.map((link) =>
            link.app ? (
              <a key={link.href} href={link.href} className="transition hover:text-ink">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="transition hover:text-ink">
                {link.label}
              </Link>
            ),
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
