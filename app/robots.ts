import type { MetadataRoute } from "next";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.georepute.ai";
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/blog/preview"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
