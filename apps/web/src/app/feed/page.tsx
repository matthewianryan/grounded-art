import { listFeed, listGalleries } from "@/lib/api";
import type { FeedItemType, FeedView } from "@/lib/types";
import { FeedFilters } from "@/components/feed-filters";
import { FeedListClient } from "@/components/feed-list-client";
import type { GallerySummary } from "@/components/feed-card";

const FEED_VIEWS: FeedView[] = ["this_weekend", "opening_this_week", "closing_soon"];
const FEED_TYPES: FeedItemType[] = ["exhibition", "opening", "event", "post"];

function asView(value: string | undefined): FeedView | undefined {
  return value && (FEED_VIEWS as string[]).includes(value) ? (value as FeedView) : undefined;
}

function asType(value: string | undefined): FeedItemType | undefined {
  return value && (FEED_TYPES as string[]).includes(value) ? (value as FeedItemType) : undefined;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; type?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const view = asView(params.view);
  const type = asType(params.type);
  const savedOnly = params.saved === "1";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Feed</h1>
      <p className="mt-4 max-w-xl text-muted">
        Recent exhibitions, openings, and gallery posts from across Cape Town, kept current.
      </p>

      <div className="mt-8">
        <FeedFilters view={view} type={type} saved={savedOnly} />
      </div>

      <FeedList view={view} type={type} savedOnly={savedOnly} />
    </main>
  );
}

async function FeedList({
  view,
  type,
  savedOnly,
}: {
  view: FeedView | undefined;
  type: FeedItemType | undefined;
  savedOnly: boolean;
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

  return (
    <FeedListClient
      items={items}
      galleriesById={galleriesById}
      savedOnly={savedOnly}
    />
  );
}
