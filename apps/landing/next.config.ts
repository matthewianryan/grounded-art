import type { NextConfig } from "next";
import path from "path";

// The landing app owns the domain root. App routes under /app are routed
// through to the web app using Next.js multi-zones in dev and server builds.
const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3001";

// Cloudflare Pages serves a fully static export of the landing site. The /app
// multi-zone proxy is a server feature, so it is omitted from the static build
// until the web zone is deployed behind its own origin. Set STATIC_EXPORT=true
// to produce the static `out/` directory that Cloudflare Pages deploys.
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      outputFileTracingRoot: path.join(__dirname, "../../"),
      // next/image optimization needs a server; the static export ships the
      // source images as-is.
      images: { unoptimized: true },
    }
  : {
      outputFileTracingRoot: path.join(__dirname, "../../"),
      async rewrites() {
        return [
          { source: "/app", destination: `${WEB_APP_URL}/app` },
          { source: "/app/:path*", destination: `${WEB_APP_URL}/app/:path*` },
        ];
      },
    };

export default nextConfig;
