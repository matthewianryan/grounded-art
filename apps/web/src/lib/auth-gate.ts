const SIGN_IN_PATH = "/sign-in";

export function currentReturnTo(fallback = "/map"): string {
  if (typeof window === "undefined") return fallback;
  return `${window.location.pathname}${window.location.search}`;
}

export function signInHref(returnTo: string): string {
  return `${SIGN_IN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

/** Full-page navigation after sign-in. */
export function navigateAfterSignIn(returnTo: string): void {
  window.location.assign(returnTo);
}
