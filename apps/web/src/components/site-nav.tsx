"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/map", label: "Map", live: true },
  { href: "/feed", label: "Feed", live: true },
  { href: "/sign-in?returnTo=/app/profile", label: "Profile", live: true },
  { href: "/contact", label: "Contact us", live: true, root: true },
];

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

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
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex flex-col" aria-label="Grounded Art home">
          <span className="font-display text-lg leading-none">Grounded Art</span>
          <span className="mt-1.5 h-px w-7 bg-accent" aria-hidden="true" />
        </Link>

        <nav
          className="hidden items-center gap-2 rounded-full border border-line bg-paper px-2 py-1.5 text-xs uppercase tracking-[0.14em] md:flex"
          aria-label="Main"
        >
          {links.map((link) => (
            <InlineNavItem key={link.href} pathname={pathname} {...link} />
          ))}
          <ThemeToggle />
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
          <nav className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em]" aria-label="Mobile">
            {links.map((link) => (
              <MobileNavItem
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

function InlineNavItem({
  href,
  label,
  live,
  root,
  pathname,
}: {
  href: string;
  label: string;
  live: boolean;
  root?: boolean;
  pathname: string;
}) {
  const active = live && !root && (pathname === href || pathname.startsWith(`${href}/`));

  if (!live) {
    return (
      <span
        aria-disabled="true"
        className="cursor-default px-3 py-1.5 text-muted/70"
        title="Coming soon"
      >
        {label}
      </span>
    );
  }

  if (root) {
    return (
      <a href={href} className="rounded-full px-3 py-1.5 text-muted transition hover:bg-line/40 hover:text-ink">
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

function MobileNavItem({
  href,
  label,
  live,
  root,
  pathname,
  closeMenu,
}: {
  href: string;
  label: string;
  live: boolean;
  root?: boolean;
  pathname: string;
  closeMenu: () => void;
}) {
  const active = live && !root && (pathname === href || pathname.startsWith(`${href}/`));

  if (!live) {
    return (
      <span
        aria-disabled="true"
        className="rounded-full border border-line px-3 py-2 text-muted/70"
        title="Coming soon"
      >
        {label}
      </span>
    );
  }

  if (root) {
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
