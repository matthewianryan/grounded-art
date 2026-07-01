export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export function appHref(path: string): string {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
