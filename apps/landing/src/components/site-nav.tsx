import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

// Shared top navigation. The wordmark is "Grounded Art" in Noto Serif with a short rust rule
// beneath it. In v1 the Atlas and Feed links point to in-page previews on the landing, so they
// resolve from any page via the home anchors. They become live app links when v2 ships.
export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex flex-col" aria-label="Grounded Art home">
          <span className="font-display text-lg leading-none">Grounded Art</span>
          <span className="mt-1.5 h-px w-7 bg-accent" aria-hidden="true" />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted sm:gap-7">
          <Link href="/#atlas" className="transition hover:text-ink">
            Atlas
          </Link>
          <Link href="/#feed" className="transition hover:text-ink">
            Feed
          </Link>
          <Link href="/about" className="transition hover:text-ink">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
