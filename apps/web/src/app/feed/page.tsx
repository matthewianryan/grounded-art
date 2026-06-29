import { listFeed, listGalleries } from "@/lib/api";
import type { FeedView } from "@/lib/types";
import { FeedFilters } from "@/components/feed-filters";
import { FeedBrowse } from "@/components/feed-browse";
import { buildGalleryMaps } from "@/lib/feed-display";

const FEED_VIEWS: FeedView[] = ["this_weekend", "opening_this_week", "closing_soon"];

function asView(value: string | undefined): FeedView | undefined {
  return value && (FEED_VIEWS as string[]).includes(value) ? (value as FeedView) : undefined;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; type?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const view = asView(params.view);
  const savedOnly = params.saved === "1";

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Feed</h1>
      <p className="mt-4 max-w-xl text-muted">
        Recent exhibitions, openings, and gallery posts from across Cape Town, kept current.
      </p>

      <div className="mt-8">
        <FeedFilters view={view} saved={savedOnly} />
      </div>

      <FeedList view={view} savedOnly={savedOnly} />
    </main>
  );
}

async function FeedList({
  view,
  savedOnly,
}: {
  view: FeedView | undefined;
  savedOnly: boolean;
}) {
  try {
    const [feed, galleries] = await Promise.all([
      listFeed({ view, limit: 100 }),
      listGalleries({ limit: 200 }),
    ]);
    const { galleriesById, fullGalleriesById } = buildGalleryMaps(galleries.items);

    return (
      <FeedBrowse
        items={feed.items}
        galleriesById={galleriesById}
        fullGalleriesById={fullGalleriesById}
        savedOnly={savedOnly}
      />
    );
  } catch {
    return (
      <p className="mt-10 text-sm text-muted">
        The feed could not be loaded right now. Please try again shortly.
      </p>
    );
  }
}
