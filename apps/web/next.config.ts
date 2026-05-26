import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@anchor/ui", "@anchor/ai", "@anchor/db"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
