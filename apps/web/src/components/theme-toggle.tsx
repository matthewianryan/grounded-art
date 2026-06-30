"use client";

import { useEffect, useState } from "react";

// Mirrors the landing theme toggle so both zones share one mechanism: the no-flash script in
// the root layout reads ga-theme on load, and this flips the .dark class and persists it.
export function ThemeToggle({ variant = "inline" }: { variant?: "inline" | "mobile" }) {
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

  const className =
    variant === "mobile"
      ? "flex w-full items-center justify-between rounded-full border border-line px-3 py-2 text-muted transition hover:border-ink hover:text-ink"
      : "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-muted transition hover:bg-line/40 hover:text-ink";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      <span>{dark ? "Light" : "Dark"}</span>
      <span
        aria-hidden="true"
        className={`relative h-3.5 w-6 rounded-full border border-line transition ${
          dark ? "bg-ink" : "bg-line/40"
        }`}
      >
        <span
          className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition ${
            dark ? "left-3 bg-paper" : "left-0.5 bg-muted"
          }`}
        />
      </span>
    </button>
  );
}
