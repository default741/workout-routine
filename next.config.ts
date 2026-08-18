import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/workout-routine",
  assetPrefix: "/workout-routine/",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
