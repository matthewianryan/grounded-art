import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api-proxy";

export async function POST(request: Request) {
  const body = await request.text();

  const upstream = await fetch(`${API_BASE}/auth/request-code`, {
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

  return new NextResponse(null, { status: 204 });
}
