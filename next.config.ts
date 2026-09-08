import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: "/screenshots/**",
      },
    ],
  },
};

export default nextConfig;
