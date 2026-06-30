// Typed client for the Grounded Art read API.
//
// These functions run on the server (in server components and route handlers). The feed and
// galleries are "kept current", so reads are uncached: every request reflects the latest data.
// The API base URL is configured with NEXT_PUBLIC_API_URL and defaults to the local API.

import type {
  FeedItem,
  FeedItemType,
  FeedPage,
  FeedView,
  Gallery,
  GalleryPage,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

function buildPath(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(path, API_BASE);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const url = buildPath(path, params);
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (cause) {
    throw new ApiError(`Could not reach the API at ${url}`, 0, { cause });
  }
  if (!response.ok) {
    throw new ApiError(`API request to ${path} failed`, response.status);
  }
  return (await response.json()) as T;
}

async function authedRequest<T>(path: string, cookieHeader: string, init?: RequestInit): Promise<T> {
  const url = buildPath(path);
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      ...init?.headers,
      Cookie: cookieHeader,
    },
  });
  if (response.status === 401) {
    throw new ApiError("Not signed in", 401);
  }
  if (!response.ok) {
    throw new ApiError(`API request to ${path} failed`, response.status);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export interface ListGalleriesParams extends Record<string, QueryValue> {
  suburb?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export function listGalleries(params: ListGalleriesParams = {}): Promise<GalleryPage> {
  return request<GalleryPage>("/galleries", params);
}

export function getGallery(slug: string): Promise<Gallery> {
  return request<Gallery>(`/galleries/${encodeURIComponent(slug)}`);
}

export interface ListFeedParams extends Record<string, QueryValue> {
  type?: FeedItemType;
  view?: FeedView;
  limit?: number;
  offset?: number;
}

export function listFeed(params: ListFeedParams = {}): Promise<FeedPage> {
  return request<FeedPage>("/feed", params);
}

export function getFeedItem(slug: string): Promise<FeedItem> {
  return request<FeedItem>(`/feed/${encodeURIComponent(slug)}`);
}

// Server-side authenticated read. Forwards the session cookie to the API.
export async function getMe(
  cookieHeader?: string,
): Promise<import("@/lib/account-types").Account | null> {
  if (!cookieHeader) return null;
  try {
    return await authedRequest<import("@/lib/account-types").Account>("/me", cookieHeader);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function getWallet(
  cookieHeader: string,
): Promise<import("@/lib/account-types").Wallet> {
  return authedRequest("/me/wallet", cookieHeader);
}

export async function getSaved(
  cookieHeader: string,
): Promise<import("@/lib/account-types").SavedPage> {
  return authedRequest("/me/saved", cookieHeader);
}

export async function getCheckIns(
  cookieHeader: string,
): Promise<import("@/lib/account-types").CheckInPage> {
  return authedRequest("/me/check-ins", cookieHeader);
}

export async function getSessionCookieHeader(): Promise<string | undefined> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ga-session");
  return sessionCookie ? `ga-session=${sessionCookie.value}` : undefined;
}
