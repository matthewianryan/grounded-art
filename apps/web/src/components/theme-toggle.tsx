"use client";

import { useEffect, useState } from "react";

// Mirrors the landing theme toggle so both zones share one mechanism: the no-flash script in
// the root layout reads ga-theme on load, and this flips the .dark class and persists it.
export function ThemeToggle() {
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
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-sm text-muted transition hover:text-ink"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
