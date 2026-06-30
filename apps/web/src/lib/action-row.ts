import type { FeedItem, Gallery } from "@/lib/types";

export interface ActionRowVisibility {
  save: true;
  directions: boolean;
  share: boolean;
  goToArtist: boolean;
  viewOnMap: boolean;
  checkIn: boolean;
  artistUrl: string | null;
  mapGallerySlug: string | null;
}

/** Resolve which action-row buttons appear for a feed item and/or gallery context. */
export function resolveActionRowContext(
  item: FeedItem | undefined,
  gallery: Gallery | undefined,
): ActionRowVisibility {
  const hasCoords =
    gallery != null && gallery.latitude != null && gallery.longitude != null;
  const hasDirectionsTarget =
    gallery != null &&
    (hasCoords || gallery.formatted_address != null || gallery.name.length > 0);

  const artistUrl = item?.external_url ?? null;

  return {
    save: true,
    directions: hasDirectionsTarget,
    share: true,
    goToArtist: artistUrl != null,
    viewOnMap: item != null && hasCoords,
    checkIn: hasCoords,
    artistUrl,
    mapGallerySlug: hasCoords ? gallery!.slug : null,
  };
}

export function hasMappableGallery(gallery: Gallery | undefined): gallery is Gallery & {
  latitude: number;
  longitude: number;
} {
  return gallery != null && gallery.latitude != null && gallery.longitude != null;
}
