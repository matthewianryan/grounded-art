import type { MetadataRoute } from "next";

// Generated at build time so the route works with the static export.
export const dynamic = "force-static";

const SITE_URL = "https://www.grounded-art.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
