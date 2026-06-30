import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  API_BASE,
  SESSION_COOKIE_NAME,
  WEB_SESSION_COOKIE_PATH,
} from "@/lib/api-proxy";

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const cookieHeader = sessionCookie
    ? `${SESSION_COOKIE_NAME}=${sessionCookie.value}`
    : undefined;

  if (cookieHeader) {
    try {
      await fetch(`${API_BASE}/auth/sign-out`, {
        method: "POST",
        headers: { Cookie: cookieHeader },
      });
    } catch {
      // Best-effort revoke on the API origin.
    }
  }

  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    path: WEB_SESSION_COOKIE_PATH,
  });

  return new NextResponse(null, { status: 204 });
}
