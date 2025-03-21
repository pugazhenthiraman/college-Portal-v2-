import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: false, // disable Turbopack and use Webpack instead
  },
};

export default nextConfig;
