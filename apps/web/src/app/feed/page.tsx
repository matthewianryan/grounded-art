import { listFeed, listGalleries } from "@/lib/api";
import type { FeedView } from "@/lib/types";
import { FeedFilters } from "@/components/feed-filters";
import { FeedBrowse } from "@/components/feed-browse";
import { FeedPageShell } from "@/components/feed-page-shell";
import { buildGalleryMaps } from "@/lib/feed-display";

const FEED_VIEWS: FeedView[] = ["this_weekend", "opening_this_week", "closing_soon"];

function asView(value: string | undefined): FeedView | undefined {
  return value && (FEED_VIEWS as string[]).includes(value) ? (value as FeedView) : undefined;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; saved?: string; q?: string }>;
}) {
  const params = await searchParams;
  const view = asView(params.view);
  const savedOnly = params.saved === "1";
  const q = params.q?.trim() ?? "";

  return (
    <FeedPageShell
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form method="get" className="flex flex-1 gap-2 sm:max-w-md">
            {view ? <input type="hidden" name="view" value={view} /> : null}
            {savedOnly ? <input type="hidden" name="saved" value="1" /> : null}
            <label className="block flex-1">
              <span className="sr-only">Search feed</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search feed"
                className="w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-muted"
              />
            </label>
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2.5 text-sm text-muted transition hover:border-ink hover:text-ink"
            >
              Search
            </button>
          </form>
          <FeedFilters view={view} saved={savedOnly} q={q} />
        </div>
      }
    >
      <FeedList view={view} savedOnly={savedOnly} q={q} />
    </FeedPageShell>
  );
}

async function FeedList({
  view,
  savedOnly,
  q,
}: {
  view: FeedView | undefined;
  savedOnly: boolean;
  q: string;
}) {
  try {
    const [feed, galleries] = await Promise.all([
      listFeed({ view, limit: 100 }),
      listGalleries({ limit: 200 }),
    ]);
    const { galleriesById, fullGalleriesById } = buildGalleryMaps(galleries.items);
    // Curated gallery public profile cards on the feed canvas use the featured flag as the
    // curation signal, in feed order behind the interleave.
    const featuredGalleries = galleries.items.filter((gallery) => gallery.featured);

    return (
      <FeedBrowse
        items={feed.items}
        galleriesById={galleriesById}
        fullGalleriesById={fullGalleriesById}
        featuredGalleries={featuredGalleries}
        savedOnly={savedOnly}
        searchTerm={q}
      />
    );
  } catch {
    return (
      <p className="mx-auto max-w-6xl px-4 text-sm text-muted sm:px-6">
        The feed could not be loaded right now. Please try again shortly.
      </p>
    );
  }
}
