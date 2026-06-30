import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  API_BASE,
  parseSessionTokenFromSetCookie,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  WEB_SESSION_COOKIE_PATH,
} from "@/lib/api-proxy";

export async function POST(request: Request) {
  const body = await request.text();

  const upstream = await fetch(`${API_BASE}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!upstream.ok) {
    const detail = await upstream.text();
    return new NextResponse(detail, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
    });
  }

  const account = await upstream.json();
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie")!]
        : [];
  const token = parseSessionTokenFromSetCookie(setCookies);

  if (token) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      path: WEB_SESSION_COOKIE_PATH,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL_SECONDS,
    });
  }

  return NextResponse.json(account);
}
