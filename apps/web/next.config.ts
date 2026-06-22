import type { NextConfig } from "next";
import path from "path";

// The web app is a separate Next.js app stitched into the landing site under the
// /app path prefix using multi-zones. basePath keeps its routes and assets under /app.
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  basePath: "/app",
};

export default nextConfig;
