import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow production builds even with type errors in old pages (budget, debts, etc.)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
