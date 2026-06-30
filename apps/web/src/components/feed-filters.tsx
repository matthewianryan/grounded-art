import Link from "next/link";
import type { FeedItemKind, FeedView } from "@/lib/types";

const VIEW_OPTIONS: { label: string; value: FeedView | undefined }[] = [
  { label: "All", value: undefined },
  { label: "This weekend", value: "this_weekend" },
  { label: "Opening this week", value: "opening_this_week" },
  { label: "Closing soon", value: "closing_soon" },
];

const KIND_OPTIONS: { label: string; value: FeedItemKind | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Art", value: "art_post" },
  { label: "Events", value: "event" },
  { label: "Announcements", value: "announcement" },
];

function hrefFor(
  view: FeedView | undefined,
  saved: boolean,
  q: string,
  kind: FeedItemKind | undefined,
): string {
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  if (kind) params.set("kind", kind);
  if (saved) params.set("saved", "1");
  if (q) params.set("q", q);
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
  saved,
  kind,
  q = "",
}: {
  view: FeedView | undefined;
  saved: boolean;
  kind: FeedItemKind | undefined;
  q?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Temporal views">
        {VIEW_OPTIONS.map((opt) => (
          <Pill
            key={opt.label}
            href={hrefFor(opt.value, false, q, kind)}
            active={!saved && view === opt.value}
            label={opt.label}
          />
        ))}
        <Pill
          href={saved ? hrefFor(view, false, q, kind) : hrefFor(view, true, q, kind)}
          active={saved}
          label="Saved"
        />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Post types">
        {KIND_OPTIONS.map((opt) => (
          <Pill
            key={opt.label}
            href={hrefFor(view, saved, q, opt.value)}
            active={kind === opt.value}
            label={opt.label}
          />
        ))}
      </div>
    </div>
  );
}
