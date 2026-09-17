import type { NextConfig } from "next";

// Blog featured images render via plain <img> today, so this isn't required
// yet — but it's here so Supabase Storage URLs work out of the box the
// moment this project switches any of those to next/image's <Image>.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: "/screenshots/**",
      },
    ],
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
