// Server-side helpers for proxying auth requests to the FastAPI backend.

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const SESSION_COOKIE_NAME = "ga-session";
export const WEB_SESSION_COOKIE_PATH = "/app";
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Extract ga-session value from Set-Cookie header(s). */
export function parseSessionTokenFromSetCookie(
  setCookie: string | string[] | null,
): string | null {
  if (!setCookie) return null;

  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];

  for (const cookie of parts) {
    const [nameValue] = cookie.trim().split(";");
    const eq = nameValue?.indexOf("=");
    if (eq === undefined || eq < 0) continue;
    const name = nameValue!.slice(0, eq).trim();
    if (name === SESSION_COOKIE_NAME) {
      return nameValue!.slice(eq + 1).trim();
    }
  }

  return null;
}
