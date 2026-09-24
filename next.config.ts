import type { NextConfig } from "next";

// Blog featured images render via plain <img> today, so this isn't required
// yet — but it's here so Supabase Storage URLs work out of the box the
// moment this project switches any of those to next/image's <Image>.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// Baseline hardening headers for every route. Deliberately no Content-Security-Policy yet: a correct one
// needs nonces for the inline theme script and JSON-LD plus allowances for the Calendly embed and the
// intro video, and should be introduced in report-only mode and tested first.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // SAMEORIGIN, not DENY: blocks other sites from framing this one (clickjacking) while the site's own pages may still frame each other.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Do not advertise the framework and version on every response.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
