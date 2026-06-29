import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/calendar",
        destination: "/assortment/plan",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
