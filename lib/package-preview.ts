type ProductIdentity = {
  brand: string;
  name: string;
};

export type PackagePreview = {
  image: string;
  alt: string;
  caption: string;
};

export function getPackagePreview(product: ProductIdentity): PackagePreview | null {
  const identity = `${product.brand} ${product.name}`.toLowerCase();

  // D10 already shows the manufacturer's complete package as its main image.

  if (identity.includes("gamesir") && identity.includes("nova 2")) {
    return {
      image: "/gamesir-nova2-lite-2.jpg",
      alt: "GameSir Nova 2 Lite blanco y negro con el receptor USB compacto",
      caption: "Incluye base de carga y receptor USB",
    };
  }

  // X3 package photos show different dongles and optional grips. Do not claim
  // an exact bundle photo until the receiver in this shipment is confirmed.

  return null;
}
