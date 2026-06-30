const SESSION_COOKIE_NAMES = ["ga-session", "grounded-session"];
const SIGN_IN_PATH = "/app/sign-in";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

export function hasAccountSession(): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(readCookie(name)));
}

export function currentReturnTo(fallback = "/app/map"): string {
  if (typeof window === "undefined") return fallback;
  return `${window.location.pathname}${window.location.search}`;
}

export function signInHref(returnTo: string): string {
  return `${SIGN_IN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}
