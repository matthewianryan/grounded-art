"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { WordmarkLink } from "./wordmark-link";

const links = [
  { href: "/#atlas", label: "Map" },
  { href: "/#feed", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact us" },
];

const appLinks = [
  { href: "/app/map", label: "Map", app: true },
  { href: "/app/feed", label: "Feed", app: true },
  { href: "/app/sign-in?returnTo=/app/profile", label: "Profile", app: true },
  { href: "/contact", label: "Contact us", landing: true },
];

// Shared top navigation. The wordmark is "Grounded Art" in Noto Serif with a short rust rule
// beneath it. Redesign nav links lead into the live app surfaces, with Contact us owned by the
// landing zone at the domain root. Use variant="app" on Contact for the pill nav used in the web app.
export function SiteNav({ variant = "marketing" }: { variant?: "marketing" | "app" }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "app" || !menuOpen) return;

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      "a,button,[tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (
        target &&
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen, variant]);

  if (variant === "app") {
    return (
      <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <WordmarkLink />

          <nav
            className="hidden items-center gap-2 rounded-full border border-line bg-paper px-2 py-1.5 text-xs uppercase tracking-[0.14em] md:flex"
            aria-label="Main"
          >
            {appLinks.map((link) => (
              <AppInlineNavItem key={link.href} pathname={pathname} {...link} />
            ))}
            <ThemeToggle variant="inline" />
          </nav>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-line bg-paper p-2 text-muted transition hover:border-ink hover:text-ink md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav-panel"
            ref={panelRef}
            className="border-t border-line bg-paper px-4 py-3 md:hidden"
          >
            <nav
              className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em]"
              aria-label="Mobile"
            >
              {appLinks.map((link) => (
                <AppMobileNavItem
                  key={link.href}
                  pathname={pathname}
                  closeMenu={() => setMenuOpen(false)}
                  {...link}
                />
              ))}
              <ThemeToggle variant="mobile" />
            </nav>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
        <Link href="/" className="inline-flex flex-col" aria-label="Grounded Art home">
          <span className="font-display text-lg leading-none">Grounded Art</span>
          <span className="mt-1.5 h-px w-7 bg-accent" aria-hidden="true" />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted sm:gap-6 sm:text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function AppInlineNavItem({
  href,
  label,
  app,
  landing,
  pathname,
}: {
  href: string;
  label: string;
  app?: boolean;
  landing?: boolean;
  pathname: string;
}) {
  const active = landing && (pathname === href || pathname.startsWith(`${href}/`));

  if (app) {
    return (
      <a
        href={href}
        className="rounded-full px-3 py-1.5 text-muted transition hover:bg-line/40 hover:text-ink"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 transition ${
        active ? "bg-ink text-paper" : "text-muted hover:bg-line/40 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function AppMobileNavItem({
  href,
  label,
  app,
  landing,
  pathname,
  closeMenu,
}: {
  href: string;
  label: string;
  app?: boolean;
  landing?: boolean;
  pathname: string;
  closeMenu: () => void;
}) {
  const active = landing && (pathname === href || pathname.startsWith(`${href}/`));

  if (app) {
    return (
      <a
        href={href}
        className="rounded-full border border-line px-3 py-2 text-muted transition hover:border-ink hover:text-ink"
        onClick={closeMenu}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-3 py-2 transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-muted hover:border-ink hover:text-ink"
      }`}
      onClick={closeMenu}
    >
      {label}
    </Link>
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
