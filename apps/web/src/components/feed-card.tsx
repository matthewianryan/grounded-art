import type { FeedItem, FeedItemType } from "@/lib/types";
import { formatDateRange } from "@/lib/format";

const TYPE_LABELS: Record<FeedItemType, string> = {
  exhibition: "Exhibition",
  opening: "Opening",
  event: "Event",
  post: "Post",
};

export interface GallerySummary {
  name: string;
  slug: string;
}

// One feed item. Presentation stays restrained so the title and the work lead. The attribution
// line resolves, in order, to the linked gallery, then a location-less creative, then a place.
export function FeedCard({
  item,
  gallery,
}: {
  item: FeedItem;
  gallery: GallerySummary | undefined;
}) {
  const dates = formatDateRange(item.starts_on, item.ends_on);

  return (
    <article className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted">
        <span className="uppercase tracking-[0.16em]">{TYPE_LABELS[item.type]}</span>
        {dates && (
          <>
            <span aria-hidden="true">·</span>
            <span>{dates}</span>
          </>
        )}
      </div>

      <h3 className="mt-2 font-display text-2xl leading-snug tracking-tight">{item.title}</h3>

      <Attribution item={item} gallery={gallery} />

      {item.body && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{item.body}</p>
      )}

      {item.external_url && (
        <a
          href={item.external_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-accent transition hover:text-ink"
        >
          More
        </a>
      )}
    </article>
  );
}

function Attribution({
  item,
  gallery,
}: {
  item: FeedItem;
  gallery: GallerySummary | undefined;
}) {
  if (gallery) {
    return <p className="mt-1 text-sm text-ink">{gallery.name}</p>;
  }
  if (item.creative_name) {
    return (
      <p className="mt-1 text-sm text-ink">
        {item.creative_name}
        {item.location_text && <span className="text-muted">, {item.location_text}</span>}
      </p>
    );
  }
  if (item.location_text) {
    return <p className="mt-1 text-sm text-muted">{item.location_text}</p>;
  }
  return null;
}
