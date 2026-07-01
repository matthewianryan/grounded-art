export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

// The standalone web app (Map, Feed) is not deployed yet. Until it is, Map/Feed
// links stay on the landing and scroll to the on-page explainer sections. Flip
// NEXT_PUBLIC_APP_LIVE to "true" (in the Cloudflare Pages env or the build) once
// app.grounded-art.co.za is serving, and the same links start pointing at the
// real app instead.
export const APP_LIVE = process.env.NEXT_PUBLIC_APP_LIVE === "true";

// Landing homepage anchors for the explainer sections shown while the app is offline.
const EXPLAINER_ANCHOR: Record<AppSurface, string> = {
  map: "/#atlas",
  feed: "/#feed",
};

export type AppSurface = "map" | "feed";

export function appHref(path: string): string {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Resolve where a Map/Feed link should go. When the app is live it points at the
 * real app origin; otherwise it points at the landing's own explainer section.
 */
export function surfaceHref(surface: AppSurface): string {
  return APP_LIVE ? appHref(`/${surface}`) : EXPLAINER_ANCHOR[surface];
}

export const mapHref = () => surfaceHref("map");
export const feedHref = () => surfaceHref("feed");
