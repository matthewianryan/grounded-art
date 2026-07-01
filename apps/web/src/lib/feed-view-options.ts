import type { FeedView } from "@/lib/types";

export const VIEW_OPTIONS: { label: string; value: FeedView | undefined }[] = [
  { label: "All", value: undefined },
  { label: "This weekend", value: "this_weekend" },
  { label: "Opening this week", value: "opening_this_week" },
  { label: "Closing soon", value: "closing_soon" },
];

// The feed is not sliced by category. Per redesign decision D11 the only slicing is the
// temporal views (plus the personal "Saved" view); the feed item type is internal and is
// never exposed as a filter.
export function hrefFor(view: FeedView | undefined, saved: boolean, q: string): string {
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  if (saved) params.set("saved", "1");
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/feed?${query}` : "/feed";
}
