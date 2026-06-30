import type {
  FeedGalleryContext,
  FeedItem,
  FeedItemKind,
  FeedItemLink,
  Gallery,
} from "@/lib/types";

/** A display image with the dimensions the detail page uses to reserve an aspect box. */
export interface FeedDisplayImage {
  url: string;
  width: number | null;
  height: number | null;
  attribution: string | null;
}

export interface PostBadgeInfo {
  showBrand: boolean;
  brandName: string | null;
  showPin: boolean;
}

export interface FeedCarouselItem {
  id: string;
  slug: string;
  imageUrl: string | null;
  displayName: string;
  badges: PostBadgeInfo;
}

export function galleryPrimaryImage(gallery: Gallery | FeedGalleryContext | undefined): string | null {
  if (!gallery || !("images" in gallery)) {
    if (gallery && "primary_image_url" in gallery) {
      return gallery.primary_image_url;
    }
    return null;
  }
  const primary = gallery.images.find((img) => img.is_primary);
  return primary?.url ?? gallery.images[0]?.url ?? null;
}

export function toFeedGalleryContext(gallery: Gallery): FeedGalleryContext {
  return {
    id: gallery.id,
    slug: gallery.slug,
    name: gallery.name,
    brand_name: gallery.brand_name,
    brand_logo_url: gallery.brand_logo_url,
    primary_image_url: galleryPrimaryImage(gallery),
    latitude: gallery.latitude,
    longitude: gallery.longitude,
  };
}

export function feedDisplayName(item: FeedItem): string {
  return item.creative_name?.trim() || item.title;
}

export function postBadges(
  item: FeedItem,
  gallery: FeedGalleryContext | undefined,
): PostBadgeInfo {
  return {
    showBrand: Boolean(gallery?.brand_name),
    brandName: gallery?.brand_name ?? null,
    showPin: Boolean(item.gallery_id || item.location_text),
  };
}

export function feedCarouselImage(
  item: FeedItem,
  gallery: FeedGalleryContext | undefined,
): string | null {
  return item.image_url ?? gallery?.primary_image_url ?? null;
}

/** The reveal kind that drives the two-stage behaviour. Read directly; never inferred. */
export function feedPostKind(item: FeedItem): FeedItemKind {
  return item.kind;
}

/** Announcements stop at the expanded card. Art posts and events open the full detail page. */
export function kindOpensDetail(kind: FeedItemKind): boolean {
  return kind !== "announcement";
}

/** Links on a post, ordered by sort rank then insertion. */
export function feedPostLinks(item: FeedItem): FeedItemLink[] {
  return [...item.links].sort((a, b) => (a.sort_rank ?? 999) - (b.sort_rank ?? 999));
}

function sortByPrimaryThenRank<T extends { is_primary: boolean; sort_rank: number | null }>(
  images: T[],
): T[] {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return (a.sort_rank ?? 999) - (b.sort_rank ?? 999);
  });
}

/**
 * The full set of display images with dimensions, for the detail page masonry. Prefers the
 * post's own images; falls back to the gallery images, then the single image_url, with null
 * dimensions so the masonry loads those at natural size.
 */
export function feedPostImageSet(
  item: FeedItem,
  gallery: Gallery | undefined,
): FeedDisplayImage[] {
  const out: FeedDisplayImage[] = [];
  const seen = new Set<string>();
  const add = (image: FeedDisplayImage | null) => {
    if (image && !seen.has(image.url)) {
      seen.add(image.url);
      out.push(image);
    }
  };

  if (item.images.length) {
    for (const img of sortByPrimaryThenRank(item.images)) {
      add({ url: img.url, width: img.width, height: img.height, attribution: img.attribution });
    }
    return out;
  }

  if (item.image_url) {
    add({ url: item.image_url, width: null, height: null, attribution: null });
  }

  if (gallery?.images.length) {
    for (const img of sortByPrimaryThenRank(gallery.images)) {
      add({ url: img.url, width: img.width, height: img.height, attribution: img.attribution });
    }
  }

  if (out.length === 0) {
    const fallback = feedCarouselImage(
      item,
      gallery ? toFeedGalleryContext(gallery) : undefined,
    );
    if (fallback) add({ url: fallback, width: null, height: null, attribution: null });
  }

  return out;
}

/** Image URLs only, for the expanded-card carousel. Prefers the post's own images. */
export function feedPostImages(item: FeedItem, gallery: Gallery | undefined): string[] {
  return feedPostImageSet(item, gallery).map((image) => image.url);
}

export function toFeedCarouselItem(
  item: FeedItem,
  gallery: FeedGalleryContext | undefined,
): FeedCarouselItem {
  return {
    id: item.id,
    slug: item.slug,
    imageUrl: feedCarouselImage(item, gallery),
    displayName: feedDisplayName(item),
    badges: postBadges(item, gallery),
  };
}

export function feedGalleryImageUrl(imageUrl: string | null, label: string): string {
  if (imageUrl) return imageUrl;
  const safe = label.slice(0, 40).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect fill="#2a2419" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#968a75" font-family="Georgia,serif" font-size="22">${safe}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function buildGalleryMaps(galleries: Gallery[]) {
  const galleriesById = new Map<string, FeedGalleryContext>();
  const fullGalleriesById = new Map<string, Gallery>();
  for (const gallery of galleries) {
    galleriesById.set(gallery.id, toFeedGalleryContext(gallery));
    fullGalleriesById.set(gallery.id, gallery);
  }
  return { galleriesById, fullGalleriesById };
}
