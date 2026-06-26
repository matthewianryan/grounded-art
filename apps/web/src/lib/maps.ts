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
}

export const mapConfig: MapProviderConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  center: { lat: -33.925, lng: 18.42 },
  defaultZoom: 12,
  bounds: { south: -34.36, west: 18.3, north: -33.47, east: 18.95 },
};

// Whether a map base layer can be rendered. The map page uses this to degrade gracefully (showing
// the gallery list without the base map) when no key is configured, e.g. in local development.
export function isMapConfigured(): boolean {
  return Boolean(mapConfig.apiKey);
}
