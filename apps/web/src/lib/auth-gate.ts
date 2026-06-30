const SIGN_IN_PATH = "/app/sign-in";

export function currentReturnTo(fallback = "/app/map"): string {
  if (typeof window === "undefined") return fallback;
  return `${window.location.pathname}${window.location.search}`;
}

export function signInHref(returnTo: string): string {
  return `${SIGN_IN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

/** Full-page navigation after sign-in. Uses the browser URL (with /app prefix), not the
 *  Next.js router, so multi-zone and basePath do not double-prefix the path. */
export function navigateAfterSignIn(returnTo: string): void {
  window.location.assign(returnTo);
}
