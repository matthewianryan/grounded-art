import Link from "next/link";
import type { FeedItemType, FeedView } from "@/lib/types";

// The feed filter bars. The temporal views are the decided headline feature (this weekend,
// opening this week, closing soon); the type row is a secondary filter. Each link preserves the
// other selection, so view and type compose. Selecting "All" clears that dimension.

const VIEW_OPTIONS: { label: string; value: FeedView | undefined }[] = [
  { label: "All", value: undefined },
  { label: "This weekend", value: "this_weekend" },
  { label: "Opening this week", value: "opening_this_week" },
  { label: "Closing soon", value: "closing_soon" },
];

const TYPE_OPTIONS: { label: string; value: FeedItemType | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Exhibitions", value: "exhibition" },
  { label: "Openings", value: "opening" },
  { label: "Events", value: "event" },
  { label: "Posts", value: "post" },
];

function hrefFor(
  view: FeedView | undefined,
  type: FeedItemType | undefined,
  saved: boolean,
): string {
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  if (type) params.set("type", type);
  if (saved) params.set("saved", "1");
  const query = params.toString();
  return query ? `/feed?${query}` : "/feed";
}

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
  type,
  saved,
}: {
  view: FeedView | undefined;
  type: FeedItemType | undefined;
  saved: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Temporal views">
        {VIEW_OPTIONS.map((opt) => (
          <Pill
            key={opt.label}
            href={hrefFor(opt.value, type, saved)}
            active={!saved && view === opt.value}
            label={opt.label}
          />
        ))}
        <Pill
          href={saved ? hrefFor(view, type, false) : hrefFor(view, type, true)}
          active={saved}
          label="Saved"
        />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Item types">
        {TYPE_OPTIONS.map((opt) => (
          <Pill
            key={opt.label}
            href={hrefFor(view, opt.value, saved)}
            active={!saved && type === opt.value}
            label={opt.label}
          />
        ))}
      </div>
    </div>
  );
}
