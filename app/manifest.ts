import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RXZ Gamer",
    short_name: "RXZ Gamer",
    description: "Tienda de Córdoba especializada en periféricos y tecnología gamer.",
    start_url: "/",
    display: "standalone",
    background_color: "#03060b",
    theme_color: "#19d47f",
    lang: "es-AR",
    icons: [
      { src: "/rxz-logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/rxz-logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/rxz-logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
