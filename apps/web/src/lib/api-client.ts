// Browser-side API client for authenticated requests.
//
// Auth endpoints go through the web app BFF (/app/api/auth) so the session cookie is set on the
// web origin for SSR and middleware. Other endpoints call the API directly with credentials so
// the API-origin session cookie (path /) is sent.

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTH_BASE = "/app/api/auth";

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

function apiDirectFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  return apiFetch<T>(API_BASE, path, init);
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
  return apiDirectFetch<Account>("/me");
}

export function updateMe(body: AccountUpdate): Promise<Account> {
  return apiDirectFetch<Account>("/me", { method: "PATCH", json: body });
}

export function fetchSaved(): Promise<SavedPage> {
  return apiDirectFetch<SavedPage>("/me/saved");
}

export function addSaved(kind: "feed" | "gallery", slug: string): Promise<SavedItem> {
  return apiDirectFetch<SavedItem>("/me/saved", {
    method: "POST",
    json: { kind, slug },
  });
}

export function removeSaved(kind: "feed" | "gallery", slug: string): Promise<void> {
  return apiDirectFetch<void>(`/me/saved/${kind}/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export function fetchWallet(): Promise<Wallet> {
  return apiDirectFetch<Wallet>("/me/wallet");
}

export function fetchCheckIns(): Promise<CheckInPage> {
  return apiDirectFetch<CheckInPage>("/me/check-ins");
}

export function requestCheckInChallenge(gallerySlug: string): Promise<CheckInChallenge> {
  return apiDirectFetch<CheckInChallenge>("/me/check-in-challenge", {
    method: "POST",
    json: { gallery_slug: gallerySlug },
  });
}

export function submitCheckIn(body: CheckInSubmitBody): Promise<CheckInResult> {
  return apiDirectFetch<CheckInResult>("/me/check-ins", {
    method: "POST",
    json: body,
  });
}
