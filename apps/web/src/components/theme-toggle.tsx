"use client";

import { useEffect, useState } from "react";

type ThemeToggleVariant = "default" | "inline" | "mobile";

// Mirrors the landing theme toggle so both zones share one mechanism: the no-flash script in
// the root layout reads ga-theme on load, and this flips the .dark class and persists it.
export function ThemeToggle({ variant = "default" }: { variant?: ThemeToggleVariant }) {
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

  const label = dark ? "Light" : "Dark";

  const className =
    variant === "inline"
      ? "rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-muted transition hover:bg-line/40 hover:text-ink"
      : variant === "mobile"
        ? "mt-2 w-full rounded-full border border-line px-3 py-2 text-left text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
        : "text-sm text-muted transition hover:text-ink";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {label}
    </button>
  );
}
