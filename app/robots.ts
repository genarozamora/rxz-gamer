import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/cuenta", "/login", "/ayuda"],
    },
    sitemap: "https://rxzgamer.com.ar/sitemap.xml",
    host: "https://rxzgamer.com.ar",
  };
}
