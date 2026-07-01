import { proxyToApi } from "@/lib/api-proxy";

type RouteContext = { params: Promise<{ path?: string[] }> };

async function handle(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const suffix = path?.length ? `/${path.join("/")}` : "";
  return proxyToApi(`/me${suffix}`, request);
}

export function GET(request: Request, context: RouteContext) {
  return handle(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return handle(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return handle(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return handle(request, context);
}
