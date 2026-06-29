import type { FeedGalleryContext, FeedItem, Gallery } from "@/lib/types";

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

export function buildGalleryMaps(galleries: Gallery[]) {
  const galleriesById = new Map<string, FeedGalleryContext>();
  const fullGalleriesById = new Map<string, Gallery>();
  for (const gallery of galleries) {
    galleriesById.set(gallery.id, toFeedGalleryContext(gallery));
    fullGalleriesById.set(gallery.id, gallery);
  }
  return { galleriesById, fullGalleriesById };
}
