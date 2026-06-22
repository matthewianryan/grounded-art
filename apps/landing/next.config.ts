import type { NextConfig } from "next";
import path from "path";

// The landing app owns the domain root. App routes under /app are routed
// through to the web app using Next.js multi-zones.
const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async rewrites() {
    return [
      { source: "/app", destination: `${WEB_APP_URL}/app` },
      { source: "/app/:path*", destination: `${WEB_APP_URL}/app/:path*` },
    ];
  },
};

export default nextConfig;
