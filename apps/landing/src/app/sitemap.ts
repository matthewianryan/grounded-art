import type { MetadataRoute } from "next";

// Generated at build time so the route works with the static export.
export const dynamic = "force-static";

const SITE_URL = "https://www.grounded-art.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
