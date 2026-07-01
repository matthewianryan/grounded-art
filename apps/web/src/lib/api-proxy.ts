// Server-side helpers for proxying requests to the FastAPI backend.

import { cookies } from "next/headers";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const SESSION_COOKIE_NAME = "ga-session";
export const WEB_SESSION_COOKIE_PATH = process.env.WEB_SESSION_COOKIE_PATH ?? "/";
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

/** Read the session cookie for forwarding to the API. */
export async function sessionCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie ? `${SESSION_COOKIE_NAME}=${sessionCookie.value}` : undefined;
}

/** Proxy an authenticated request to the API using the web-origin session cookie. */
export async function proxyToApi(apiPath: string, request: Request): Promise<Response> {
  const cookieHeader = await sessionCookieHeader();
  if (!cookieHeader) {
    return Response.json({ detail: "Not signed in" }, { status: 401 });
  }

  const query = new URL(request.url).search;
  const upstreamUrl = `${API_BASE}${apiPath}${query}`;

  const headers: Record<string, string> = { Cookie: cookieHeader };
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });
  } catch {
    return Response.json({ detail: "Could not reach the API" }, { status: 502 });
  }

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  if (upstream.status === 204) {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: responseHeaders });
}
