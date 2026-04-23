import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/new", "/settings", "/api/"],
      },
    ],
    sitemap: "https://quotefix.co.uk/sitemap.xml",
  };
}
