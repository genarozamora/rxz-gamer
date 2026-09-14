import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/checkout", "/cuenta"],
    },
    sitemap: "https://rxz-gamer-tflb.vercel.app/sitemap.xml",
    host: "https://rxz-gamer-tflb.vercel.app",
  };
}
