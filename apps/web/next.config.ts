import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@anchor/ui", "@anchor/ai", "@anchor/db"],
};

export default nextConfig;
