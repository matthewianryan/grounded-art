import { listFeed, listGalleries } from "@/lib/api";
import type { FeedItemType, FeedView } from "@/lib/types";
import { FeedFilters } from "@/components/feed-filters";
import { FeedCard, type GallerySummary } from "@/components/feed-card";

const FEED_VIEWS: FeedView[] = ["this_weekend", "opening_this_week", "closing_soon"];
const FEED_TYPES: FeedItemType[] = ["exhibition", "opening", "event", "post"];

// Validate the query params against the values the API accepts, so a stray URL never reaches the
// API or the filter UI.
function asView(value: string | undefined): FeedView | undefined {
  return value && (FEED_VIEWS as string[]).includes(value) ? (value as FeedView) : undefined;
}

function asType(value: string | undefined): FeedItemType | undefined {
  return value && (FEED_TYPES as string[]).includes(value) ? (value as FeedItemType) : undefined;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; type?: string }>;
}) {
  const params = await searchParams;
  const view = asView(params.view);
  const type = asType(params.type);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Feed</h1>
      <p className="mt-4 max-w-xl text-muted">
        Recent exhibitions, openings, and gallery posts from across Cape Town, kept current.
      </p>

      <div className="mt-8">
        <FeedFilters view={view} type={type} />
      </div>

      <FeedList view={view} type={type} />
    </main>
  );
}

async function FeedList({
  view,
  type,
}: {
  view: FeedView | undefined;
  type: FeedItemType | undefined;
}) {
  let items;
  let galleriesById: Map<string, GallerySummary>;
  try {
    const [feed, galleries] = await Promise.all([
      listFeed({ view, type, limit: 100 }),
      listGalleries({ limit: 200 }),
    ]);
    items = feed.items;
    galleriesById = new Map(
      galleries.items.map((g) => [g.id, { name: g.name, slug: g.slug }]),
    );
  } catch {
    return (
      <p className="mt-10 text-sm text-muted">
        The feed could not be loaded right now. Please try again shortly.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted">
        Nothing in this view yet. Try another filter, or check back soon.
      </p>
    );
  }

  return (
    <div className="mt-10">
      {items.map((item) => (
        <FeedCard
          key={item.id}
          item={item}
          gallery={item.gallery_id ? galleriesById.get(item.gallery_id) : undefined}
        />
      ))}
    </div>
  );
}
