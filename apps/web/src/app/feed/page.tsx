import { listFeed, listGalleries } from "@/lib/api";
import type { FeedView } from "@/lib/types";
import { FeedBrowse } from "@/components/feed-browse";
import { FeedPageShell } from "@/components/feed-page-shell";
import { FeedToolbar } from "@/components/feed-toolbar";
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
      toolbar={<FeedToolbar view={view} saved={savedOnly} q={q} />}
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
