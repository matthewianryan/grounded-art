import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "path";

const rootDir = path.join(__dirname, "../../");
loadEnvConfig(rootDir);

// The web app is a separate Next.js app stitched into the landing site under the
// /app path prefix using multi-zones. basePath keeps its routes and assets under /app.
const nextConfig: NextConfig = {
  outputFileTracingRoot: rootDir,
  basePath: "/app",
  transpilePackages: ["@grounded-art/ui"],
};

export default nextConfig;
