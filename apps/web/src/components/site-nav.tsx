"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { signInHref } from "@/lib/auth-gate";

// The app has no header or footer: the whole viewport belongs to the content (map, feed,
// profile). Navigation lives in a single floating control at the top-left. Closed, it is
// just a hamburger. Open, the primary destinations fan out to the right of it and the
// account controls stack beneath — an L anchored on the button, over the content.

const primaryLinks: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/map", label: "Map", icon: <MapIcon /> },
  { href: "/feed", label: "Feed", icon: <FeedIcon /> },
];

const accountLinks: {
  href: string;
  label: string;
  exact?: boolean;
  icon: ReactNode;
}[] = [
  { href: "/profile", label: "Profile", exact: true, icon: <PersonIcon /> },
  { href: "/profile/wallet", label: "Wallet", icon: <WalletIcon /> },
  { href: "/profile/saved", label: "Saved", icon: <BookmarkIcon /> },
  { href: "/profile/check-ins", label: "Check-ins", icon: <PinIcon /> },
  { href: "/profile/account", label: "Account", icon: <SlidersIcon /> },
];

const ICON_BUTTON =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_6px_16px_-6px_rgb(22_19_14/0.35)] backdrop-blur transition";

function iconButtonClass(active: boolean): string {
  return `${ICON_BUTTON} ${
    active
      ? "border-ink bg-ink text-paper"
      : "border-line bg-paper/95 text-muted hover:border-ink hover:text-ink"
  }`;
}

function isActive(pathname: string, href: string, exact = false): boolean {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isSignedIn, signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Collapse whenever navigation lands on a new route.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && !navRef.current?.contains(target)) {
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
    <nav
      ref={navRef}
      aria-label="App navigation"
      className="fixed left-4 top-4 z-50 flex flex-col items-start gap-2"
    >
      <div className="flex items-start gap-2">
        <button
          ref={buttonRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="app-menu"
          onClick={() => setOpen((value) => !value)}
          className={`${ICON_BUTTON} border-line bg-paper/95 text-ink hover:border-ink`}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        {open && (
          <div className="ga-menu-pop flex items-center gap-2">
            {primaryLinks.map((link) => (
              <IconLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(pathname, link.href)}
              >
                {link.icon}
              </IconLink>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div
          id="app-menu"
          className="ga-menu-pop flex flex-col items-start gap-2"
        >
          {ready && isSignedIn
            ? accountLinks.map((link) => (
                <IconLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={isActive(pathname, link.href, link.exact)}
                >
                  {link.icon}
                </IconLink>
              ))
            : null}

          {ready && !isSignedIn ? (
            <IconLink href={signInHref(pathname)} label="Sign in">
              <SignInIcon />
            </IconLink>
          ) : null}

          <span className="my-0.5 h-px w-11 bg-line" aria-hidden="true" />

          <ThemeToggleIcon />

          {ready && isSignedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className={iconButtonClass(false)}
            >
              <SignOutIcon />
            </button>
          ) : null}
        </div>
      )}
    </nav>
  );
}

function IconLink({
  href,
  label,
  active = false,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={iconButtonClass(active)}
    >
      {children}
    </Link>
  );
}

function ThemeToggleIcon() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ga-theme", next ? "dark" : "light");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={iconButtonClass(false)}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

function CloseIcon() {
  return (
    <Icon>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

function MapIcon() {
  return (
    <Icon>
      <path d="M9 4 3 6.2v13.8l6-2.2 6 2.2 6-2.2V4l-6 2.2L9 4z" />
      <path d="M9 4v13.8" />
      <path d="M15 6.2V20" />
    </Icon>
  );
}

function FeedIcon() {
  return (
    <Icon>
      <path d="M12 3.5 3.5 8 12 12.5 20.5 8 12 3.5z" />
      <path d="M4 12.5 12 17l8-4.5" />
    </Icon>
  );
}

function PersonIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </Icon>
  );
}

function WalletIcon() {
  return (
    <Icon>
      <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
      <path d="M3.5 10.5h17" />
    </Icon>
  );
}

function BookmarkIcon() {
  return (
    <Icon>
      <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.5L6 20V5.5a1 1 0 0 1 1-1z" />
    </Icon>
  );
}

function PinIcon() {
  return (
    <Icon>
      <path d="M12 21c4-4.5 6-7.6 6-10.5A6 6 0 0 0 6 10.5C6 13.4 8 16.5 12 21z" />
      <path d="M9.5 10.4l1.7 1.7 3.3-3.3" />
    </Icon>
  );
}

function SlidersIcon() {
  return (
    <Icon>
      <path d="M4 8h9" />
      <path d="M17 8h3" />
      <path d="M4 16h3" />
      <path d="M11 16h9" />
      <circle cx="15" cy="8" r="2" />
      <circle cx="7" cy="16" r="2" />
    </Icon>
  );
}

function SignInIcon() {
  return (
    <Icon>
      <path d="M10 5.5V4.5a1 1 0 0 1 1-1h7.5a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1v-1" />
      <path d="M4 12h10" />
      <path d="M10.5 8.5 14 12l-3.5 3.5" />
    </Icon>
  );
}

function SignOutIcon() {
  return (
    <Icon>
      <path d="M14 5.5V4.5a1 1 0 0 0-1-1H5.5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1H13a1 1 0 0 0 1-1v-1" />
      <path d="M10 12h10" />
      <path d="M16.5 8.5 20 12l-3.5 3.5" />
    </Icon>
  );
}

function SunIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  );
}

function MoonIcon() {
  return (
    <Icon>
      <path d="M20.5 13.5A8 8 0 1 1 10.5 3.5a6.5 6.5 0 0 0 10 10z" />
    </Icon>
  );
}
