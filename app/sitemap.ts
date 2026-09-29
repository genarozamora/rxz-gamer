import type { MetadataRoute } from "next";
import { PRODUCT_SEO_LIST } from "@/lib/product-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rxzgamer.com.ar";
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...PRODUCT_SEO_LIST.map((product) => ({ url: `${base}/productos/${product.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["terminos","privacidad","garantias","envios"].map((slug) => ({ url: `${base}/legal/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 })),
    { url: `${base}/arrepentimiento`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
