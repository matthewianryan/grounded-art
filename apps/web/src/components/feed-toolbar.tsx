"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FeedView } from "@/lib/types";
import { GridIcon } from "@/components/icons";
import { FeedCategoriesGrid } from "@/components/feed-categories-grid";

export function FeedToolbar({
  view,
  saved,
  q,
}: {
  view: FeedView | undefined;
  saved: boolean;
  q: string;
}) {
  const [browseOpen, setBrowseOpen] = useState(false);
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!browseOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setBrowseOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [browseOpen]);

  useEffect(() => {
    if (browseOpen) dialogRef.current?.focus();
  }, [browseOpen]);

  const panel = (
    <div
      ref={dialogRef}
      id="feed-categories-panel"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Browse categories"
      className="rounded-2xl border border-line bg-paper p-4 shadow-[0_20px_50px_-20px_rgb(22_19_14/0.45)] outline-none"
    >
      <FeedCategoriesGrid
        view={view}
        saved={saved}
        q={q}
        onNavigate={() => {
          setBrowseOpen(false);
          triggerRef.current?.focus();
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <form
        method="get"
        className="flex items-center gap-1 rounded-full border border-line bg-paper py-1.5 pl-4 pr-1.5 shadow-[0_6px_16px_-6px_rgb(22_19_14/0.35)]"
      >
        {view ? <input type="hidden" name="view" value={view} /> : null}
        {saved ? <input type="hidden" name="saved" value="1" /> : null}
        <label className="block flex-1">
          <span className="sr-only">Search feed</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search feed"
            className="w-full bg-transparent py-1.5 text-base text-ink placeholder:text-muted focus:outline-none"
          />
        </label>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={browseOpen}
          aria-controls="feed-categories-panel"
          aria-label="Browse categories"
          onClick={() => setBrowseOpen((value) => !value)}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            browseOpen ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
        >
          <GridIcon />
        </button>
      </form>

      <AnimatePresence>
        {browseOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[55] border-0 bg-ink/10 p-0"
              aria-label="Close categories"
              onClick={() => setBrowseOpen(false)}
            />
            <div className="pointer-events-none fixed inset-x-0 top-24 z-[65] flex justify-center px-4">
              <div className="pointer-events-auto w-full max-w-xl">
                {reduce ? (
                  panel
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {panel}
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
