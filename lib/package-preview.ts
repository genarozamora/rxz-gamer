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

  // The GameSir gallery shows the compatible charging base and compact
  // receiver separately. There is no verified photo of the combined RXZ bundle.

  // X3 package photos show different dongles and optional grips. Do not claim
  // an exact bundle photo until the receiver in this shipment is confirmed.

  return null;
}
