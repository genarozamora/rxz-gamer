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
    ...[
      ["inicio", 0.9],
      ["productos", 0.95],
      ["comparar", 0.8],
      ["envios", 0.65],
      ["preguntas", 0.65],
      ["contacto", 0.65],
    ].map(([slug, priority]) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: Number(priority),
    })),
    ...[1, 3, 6, 7].map((id) => ({ url: `${base}/productos/${id}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["terminos","privacidad","garantias","envios"].map((slug) => ({ url: `${base}/legal/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 })),
    { url: `${base}/arrepentimiento`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
