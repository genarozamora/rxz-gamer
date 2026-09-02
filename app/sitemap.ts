import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rxz-gamer-tflb.vercel.app";
  return [
    {
      url: "https://rxz-gamer-tflb.vercel.app/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...[1,2,3,4,5,6].map((id) => ({ url: `${base}/productos/${id}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["terminos","privacidad","garantias","envios"].map((slug) => ({ url: `${base}/legal/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 })),
    { url: `${base}/arrepentimiento`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
