import Link from "next/link";
import type { ReactNode } from "react";
import type { FeedView } from "@/lib/types";
import { VIEW_OPTIONS, hrefFor } from "@/lib/feed-view-options";
import {
  AllViewsIcon,
  BookmarkIcon,
  ClosingSoonIcon,
  OpeningSoonIcon,
  WeekendIcon,
} from "@/components/icons";

// Tonal opacity ramp on the ink token, one step per temporal tile — per D8 (no blue/orange,
// rust used sparingly) the grid can't lean on hue variety like a typical category grid, so
// tiles are differentiated by weight + icon instead.
const TILE_TONE = ["bg-ink/[0.04]", "bg-ink/[0.07]", "bg-ink/[0.10]", "bg-ink/[0.13]"];

const TILE_ICONS: ReactNode[] = [
  <AllViewsIcon key="all" />,
  <WeekendIcon key="weekend" />,
  <OpeningSoonIcon key="opening" />,
  <ClosingSoonIcon key="closing" />,
];

const TILE_CLASS =
  "flex min-h-[88px] flex-col justify-between gap-3 rounded-xl border p-4 text-left transition";

function tileClass(active: boolean, tone: string): string {
  if (active) {
    return `${TILE_CLASS} border-ink bg-ink text-paper`;
  }
  return `${TILE_CLASS} border-line ${tone} text-ink hover:border-ink`;
}

function savedTileClass(active: boolean): string {
  if (active) {
    return `${TILE_CLASS} border-accent bg-accent text-paper`;
  }
  return `${TILE_CLASS} border-accent/30 bg-accent/10 text-accent hover:border-accent`;
}

export function FeedCategoriesGrid({
  view,
  saved,
  q,
  onNavigate,
}: {
  view: FeedView | undefined;
  saved: boolean;
  q: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {VIEW_OPTIONS.map((opt, index) => {
        const active = !saved && view === opt.value;
        return (
          <Link
            key={opt.label}
            href={hrefFor(opt.value, false, q)}
            aria-current={active ? "true" : undefined}
            onClick={onNavigate}
            className={tileClass(active, TILE_TONE[index])}
          >
            {TILE_ICONS[index]}
            <span className="text-sm font-medium">{opt.label}</span>
          </Link>
        );
      })}
      <Link
        href={saved ? hrefFor(view, false, q) : hrefFor(view, true, q)}
        aria-current={saved ? "true" : undefined}
        onClick={onNavigate}
        className={savedTileClass(saved)}
      >
        <BookmarkIcon />
        <span className="text-sm font-medium">Saved</span>
      </Link>
    </div>
  );
}
