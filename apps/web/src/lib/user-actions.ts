// Client-side persistence for saved items and gallery check-ins via first-party cookies.
// Theme uses localStorage; this layer does not.

const SAVED_COOKIE = "ga-saved";
const CHECKINS_COOKIE = "ga-checkins";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // one year
const COOKIE_PATH = "/app";

export type SavedKey = `feed:${string}` | `gallery:${string}`;

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=${COOKIE_PATH}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function readSavedKeys(): SavedKey[] {
  return parseJsonArray(readCookie(SAVED_COOKIE)) as SavedKey[];
}

export function writeSavedKeys(keys: SavedKey[]): void {
  writeCookie(SAVED_COOKIE, JSON.stringify([...new Set(keys)]));
}

export function readCheckedInSlugs(): string[] {
  return parseJsonArray(readCookie(CHECKINS_COOKIE));
}

export function writeCheckedInSlugs(slugs: string[]): void {
  writeCookie(CHECKINS_COOKIE, JSON.stringify([...new Set(slugs)]));
}

export function feedKey(slug: string): SavedKey {
  return `feed:${slug}`;
}

export function galleryKey(slug: string): SavedKey {
  return `gallery:${slug}`;
}
