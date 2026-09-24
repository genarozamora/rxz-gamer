import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rxzgamer.com.ar";
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...[1, 3, 6, 7].map((id) => ({ url: `${base}/productos/${id}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["terminos","privacidad","garantias","envios"].map((slug) => ({ url: `${base}/legal/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 })),
    { url: `${base}/arrepentimiento`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
