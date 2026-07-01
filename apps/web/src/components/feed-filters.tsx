import Link from "next/link";
import type { FeedView } from "@/lib/types";
import { VIEW_OPTIONS, hrefFor } from "@/lib/feed-view-options";

function Pill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

export function FeedFilters({
  view,
  saved,
  q = "",
}: {
  view: FeedView | undefined;
  saved: boolean;
  q?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Temporal views">
      {VIEW_OPTIONS.map((opt) => (
        <Pill
          key={opt.label}
          href={hrefFor(opt.value, false, q)}
          active={!saved && view === opt.value}
          label={opt.label}
        />
      ))}
      <Pill
        href={saved ? hrefFor(view, false, q) : hrefFor(view, true, q)}
        active={saved}
        label="Saved"
      />
    </div>
  );
}
