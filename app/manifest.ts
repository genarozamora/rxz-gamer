import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RXZ Gamer",
    short_name: "RXZ Gamer",
    description: "Periféricos y tecnología gamer con envíos a toda Argentina.",
    start_url: "/",
    display: "standalone",
    background_color: "#03060b",
    theme_color: "#19d47f",
    lang: "es-AR",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
