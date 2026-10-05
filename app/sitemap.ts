import type { MetadataRoute } from "next";
import { PRODUCT_SEO_LIST } from "@/lib/product-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rxzgamer.com.ar";
  const lastContentUpdate = new Date("2026-10-04T00:00:00-03:00");
  return [
    {
      url: `${base}/`,
      lastModified: lastContentUpdate,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...PRODUCT_SEO_LIST.map((product) => ({ url: `${base}/productos/${product.slug}`, lastModified: lastContentUpdate, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["terminos","privacidad","garantias","envios"].map((slug) => ({ url: `${base}/legal/${slug}`, lastModified: lastContentUpdate, changeFrequency: "monthly" as const, priority: 0.3 })),
    { url: `${base}/arrepentimiento`, lastModified: lastContentUpdate, changeFrequency: "yearly", priority: 0.4 },
  ];
}
