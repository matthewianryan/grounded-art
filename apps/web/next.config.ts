import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "path";

const rootDir = path.join(__dirname, "../../");
loadEnvConfig(rootDir);

// The web app is a separate Next.js app stitched into the landing site under the
// app.grounded-art.co.za subdomain in production. It runs at the origin root; the
// landing app stays independently deployable as a static Cloudflare Pages site.
const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: rootDir,
  transpilePackages: ["@grounded-art/ui"],
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    NEXT_PUBLIC_COOKIE_PATH: process.env.NEXT_PUBLIC_COOKIE_PATH ?? "/",
  },
};

export default nextConfig;
