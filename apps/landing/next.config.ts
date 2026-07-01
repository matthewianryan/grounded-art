import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "path";

const rootDir = path.join(__dirname, "../../");
loadEnvConfig(rootDir);

// Cloudflare Pages serves a fully static export of the landing site. The /app
// multi-zone proxy has been retired: the app lives on its own origin
// (app.grounded-art.co.za in production, localhost:3001 in local dev). Set
// STATIC_EXPORT=true to produce the static `out/` directory that Cloudflare Pages deploys.
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      outputFileTracingRoot: rootDir,
      transpilePackages: ["@grounded-art/ui"],
      // next/image optimization needs a server; the static export ships the
      // source images as-is.
      images: { unoptimized: true },
    }
  : {
      outputFileTracingRoot: rootDir,
      transpilePackages: ["@grounded-art/ui"],
    };

export default nextConfig;
