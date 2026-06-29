// Response types mirroring the read schemas in apps/api/app/schemas.py. The API deliberately
// omits internal and operational fields (status, provenance, source, maintenance timestamps),
// so these stay lean and match exactly what the endpoints return.

export type FeedItemType = "exhibition" | "opening" | "event" | "post";

export type FeedView = "this_weekend" | "opening_this_week" | "closing_soon";

export interface GalleryImage {
  id: string;
  url: string;
  attribution: string | null;
  width: number | null;
  height: number | null;
  is_primary: boolean;
  sort_rank: number | null;
}

export interface GalleryExternalRef {
  id: string;
  source: string;
  external_id: string | null;
  url: string | null;
}

export interface Gallery {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  formatted_address: string | null;
  suburb: string | null;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  phone: string | null;
  // Structured opening hours, keyed by short day name (mon, tue, ...).
  hours: Record<string, string> | null;
  business_status: string | null;
  featured: boolean;
  brand_name: string | null;
  brand_logo_url: string | null;
  last_refreshed_at: string | null;
  images: GalleryImage[];
  external_refs: GalleryExternalRef[];
}

/** Gallery fields needed by the feed carousel and post cards. */
export interface FeedGalleryContext {
  id: string;
  slug: string;
  name: string;
  brand_name: string | null;
  brand_logo_url: string | null;
  primary_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface FeedItem {
  id: string;
  slug: string;
  type: FeedItemType;
  title: string;
  body: string | null;
  gallery_id: string | null;
  creative_name: string | null;
  external_url: string | null;
  image_url: string | null;
  location_text: string | null;
  // Day-granularity ISO dates (YYYY-MM-DD).
  starts_on: string | null;
  ends_on: string | null;
  featured: boolean;
  published_at: string | null;
  last_refreshed_at: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type GalleryPage = Page<Gallery>;
export type FeedPage = Page<FeedItem>;
