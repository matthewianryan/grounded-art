// Internal map provider boundary.
//
// The base map is a Live dependency (Google Maps). Per docs/external-dependencies.md, the rest of
// the app reads map configuration only from here, so the provider can later be swapped to MapLibre
// with vector tiles without touching the map page, the gallery nodes, or the cards. Everything
// drawn on top of the base map is rendered from our own data.

export interface MapProviderConfig {
  // Browser key for the Maps JavaScript API. Undefined when the map is not configured.
  apiKey: string | undefined;
  // Default view, centred on the Cape Town city bowl.
  center: { lat: number; lng: number };
  defaultZoom: number;
  // Cape Town bounding box, the scope of the atlas. Matches the discovery box used at seed time.
  bounds: { south: number; west: number; north: number; east: number };
  // Grounded Art map skin. The base layer remains Google Maps, with visual noise stripped back.
  styles: google.maps.MapTypeStyle[];
}

export const mapConfig: MapProviderConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  center: { lat: -33.925, lng: 18.42 },
  defaultZoom: 12,
  bounds: { south: -34.36, west: 18.3, north: -33.47, east: 18.95 },
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#f8f8f4" }],
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#5b5348" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f8f8f4" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#d8d6ce" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#16130e" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [{ color: "#f0efea" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#dedbd2" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6f665a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#e6e4dc" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#d0ccc1" }],
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#d6ded9" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#59645f" }],
    },
  ],
};

// Whether a map base layer can be rendered. The map page uses this to degrade gracefully (showing
// the gallery list without the base map) when no key is configured, e.g. in local development.
export function isMapConfigured(): boolean {
  return Boolean(mapConfig.apiKey);
}

export function galleryDirectionsUrl(
  gallery: Pick<import("@/lib/types").Gallery, "name" | "formatted_address" | "latitude" | "longitude">,
): string {
  const destination =
    gallery.latitude != null && gallery.longitude != null
      ? `${gallery.latitude},${gallery.longitude}`
      : `${gallery.name}${gallery.formatted_address ? `, ${gallery.formatted_address}` : ""}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
