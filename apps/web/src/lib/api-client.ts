// Browser-side API client for authenticated requests.
//
// Auth and /me endpoints go through the web app BFF (/api/auth, /api/me) so the session
// cookie lives on the web origin. NEXT_PUBLIC_API_URL is used by the BFF server-side only.

import type {
  Account,
  AccountUpdate,
  CheckInChallenge,
  CheckInPage,
  CheckInResult,
  CheckInSubmitBody,
  SavedItem,
  SavedPage,
  Wallet,
} from "@/lib/account-types";

const AUTH_BASE = "/api/auth";
const ME_BASE = "/api/me";

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string | { msg: string }[] };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

async function apiFetch<T>(
  base: string,
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers,
      credentials: "include",
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    });
  } catch {
    throw new ApiClientError("Could not reach the API", 0, undefined);
  }

  if (!response.ok) {
    const detail = await parseError(response);
    throw new ApiClientError(detail, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function apiAuthFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  return apiFetch<T>(AUTH_BASE, path, init);
}

function apiMeFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  return apiFetch<T>(ME_BASE, path, init);
}

export function requestLoginCode(email: string): Promise<void> {
  return apiAuthFetch<void>("/request-code", {
    method: "POST",
    json: { email },
  });
}

export function verifyLoginCode(
  email: string,
  code: string,
  savedKeys: string[],
): Promise<Account> {
  return apiAuthFetch<Account>("/verify-code", {
    method: "POST",
    json: { email, code, saved_keys: savedKeys },
  });
}

export function signOut(): Promise<void> {
  return apiAuthFetch<void>("/sign-out", { method: "POST" });
}

export function fetchMe(): Promise<Account> {
  return apiMeFetch<Account>("");
}

export function updateMe(body: AccountUpdate): Promise<Account> {
  return apiMeFetch<Account>("", { method: "PATCH", json: body });
}

export function fetchSaved(): Promise<SavedPage> {
  return apiMeFetch<SavedPage>("/saved");
}

export function addSaved(kind: "feed" | "gallery", slug: string): Promise<SavedItem> {
  return apiMeFetch<SavedItem>("/saved", {
    method: "POST",
    json: { kind, slug },
  });
}

export function removeSaved(kind: "feed" | "gallery", slug: string): Promise<void> {
  return apiMeFetch<void>(`/saved/${kind}/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export function fetchWallet(): Promise<Wallet> {
  return apiMeFetch<Wallet>("/wallet");
}

export function fetchCheckIns(): Promise<CheckInPage> {
  return apiMeFetch<CheckInPage>("/check-ins");
}

export function requestCheckInChallenge(
  gallerySlug: string,
  code?: string,
): Promise<CheckInChallenge> {
  return apiMeFetch<CheckInChallenge>("/check-in-challenge", {
    method: "POST",
    json: { gallery_slug: gallerySlug, code },
  });
}

export function submitCheckIn(body: CheckInSubmitBody): Promise<CheckInResult> {
  return apiMeFetch<CheckInResult>("/check-ins", {
    method: "POST",
    json: body,
  });
}
