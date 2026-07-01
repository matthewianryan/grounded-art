"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ThemeToggle, WordmarkLink } from "@grounded-art/ui";
import { useAuth } from "@/components/auth-provider";
import { ProfileAvatar } from "@/components/profile-ui";
import { signInHref } from "@/lib/auth-gate";

// The app carries its own navigation, distinct from the landing site's inline pill nav:
// a single hamburger at the top right. Opening it reveals the primary destinations in a
// row beside the control, with account configuration stacked beneath. The hamburger is the
// nav at every breakpoint, which is what sets the app apart from the marketing header.

const primaryLinks = [
  { href: "/map", label: "Map" },
  { href: "/feed", label: "Feed" },
];

const accountLinks = [
  { href: "/profile", label: "Profile", exact: true },
  { href: "/profile/wallet", label: "Wallet", exact: false },
  { href: "/profile/saved", label: "Saved", exact: false },
  { href: "/profile/check-ins", label: "Check-ins", exact: false },
  { href: "/profile/account", label: "Account", exact: false },
];

function isActive(pathname: string, href: string, exact = false): boolean {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isSignedIn, account, signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Collapse the menu whenever navigation lands on a new route.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      "a,button,[tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
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
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    try {
      await signOut();
    } catch {
      // signOut clears local state in finally; still navigate away.
    }
    router.replace("/feed");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <WordmarkLink href="/feed" />

        <button
          ref={buttonRef}
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-line bg-paper p-2.5 text-muted transition hover:border-ink hover:text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>

        {open && (
          <div
            id={panelId}
            ref={panelRef}
            className="absolute right-4 top-full z-50 mt-2 flex max-h-[calc(100vh-5rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-md border border-line bg-paper shadow-[0_16px_40px_-12px_rgb(22_19_14/0.28)] sm:right-6"
          >
            <nav
              className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-3.5"
              aria-label="Main"
            >
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line text-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 py-3.5">
              <AccountSection
                ready={ready}
                isSignedIn={isSignedIn}
                account={account}
                pathname={pathname}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function AccountSection({
  ready,
  isSignedIn,
  account,
  pathname,
  onSignOut,
}: {
  ready: boolean;
  isSignedIn: boolean;
  account: ReturnType<typeof useAuth>["account"];
  pathname: string;
  onSignOut: () => void;
}) {
  if (!ready) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">Checking your session…</span>
        <ThemeToggle variant="inline" />
      </div>
    );
  }

  if (!isSignedIn || !account) {
    return (
      <div>
        <p className="text-sm text-muted">
          Sign in to check in, save galleries, and open your wallet.
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <Link
            href={signInHref(pathname)}
            className="rounded-full border border-ink bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-paper transition hover:opacity-90"
          >
            Sign in
          </Link>
          <ThemeToggle variant="inline" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <ProfileAvatar account={account} size="md" />
        <div className="min-w-0">
          <p className="truncate font-display text-base leading-tight">
            {account.display_name}
          </p>
          {account.title ? (
            <p className="truncate text-xs text-muted">{account.title}</p>
          ) : null}
        </div>
      </div>

      <nav
        className="mt-3.5 flex flex-wrap gap-1.5"
        aria-label="Account"
      >
        {accountLinks.map((link) => {
          const active = isActive(pathname, link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          Sign out
        </button>
        <ThemeToggle variant="inline" />
      </div>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
