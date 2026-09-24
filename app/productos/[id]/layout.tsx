import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PRODUCT_SEO } from "@/lib/product-seo";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCT_SEO[id];

  if (!product) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.brand} ${product.name}`;
  const canonical = `/productos/${product.id}`;

  return {
    title,
    description: product.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: canonical,
      siteName: "RXZ Gamer",
      title,
      description: product.description,
      images: [{ url: "/icon.png", width: 1024, height: 1024, alt: "Logo RXZ Gamer" }],
    },
    twitter: {
      card: "summary",
      title,
      description: product.description,
      images: ["/icon.png"],
    },
  };
}

export default function ProductLayout({ children }: Props) {
  return children;
}
