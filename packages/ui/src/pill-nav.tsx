"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { WordmarkLink } from "./wordmark-link";

export interface PillNavLink {
  href: string;
  label: string;
  /** Cross-zone absolute link; plain hover only, never active. */
  crossZone?: boolean;
}

export interface PillNavProps {
  links: PillNavLink[];
  wordmarkHref?: string;
  /** Plain anchor for the wordmark (escapes Next.js basePath to the landing root). */
  wordmarkExternal?: boolean;
}

export function PillNav({
  links,
  wordmarkHref = "/",
  wordmarkExternal = false,
}: PillNavProps) {
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
        <WordmarkLink href={wordmarkHref} external={wordmarkExternal} />

        <nav
          className="hidden items-center gap-2 rounded-full border border-line bg-paper px-2 py-1.5 font-normal text-xs uppercase tracking-[0.14em] md:flex"
          aria-label="Main"
        >
          {links.map((link) => (
            <InlineNavItem key={link.href} pathname={pathname} {...link} />
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
            className="flex flex-col gap-1 font-normal text-xs uppercase tracking-[0.14em]"
            aria-label="Mobile"
          >
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

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function InlineNavItem({
  href,
  label,
  crossZone,
  pathname,
}: PillNavLink & { pathname: string }) {
  if (crossZone) {
    return (
      <a
        href={href}
        className="rounded-full px-3 py-1.5 font-normal text-muted transition hover:bg-line/40 hover:text-ink"
      >
        {label}
      </a>
    );
  }

  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 font-normal transition ${
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
  crossZone,
  pathname,
  closeMenu,
}: PillNavLink & { pathname: string; closeMenu: () => void }) {
  if (crossZone) {
    return (
      <a
        href={href}
        className="rounded-full border border-line px-3 py-2 font-normal text-muted transition hover:border-ink hover:text-ink"
        onClick={closeMenu}
      >
        {label}
      </a>
    );
  }

  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-3 py-2 font-normal transition ${
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
