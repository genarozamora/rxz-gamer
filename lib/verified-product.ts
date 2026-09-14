import type { Product, ProductVariant } from "@/app/page";

/** Reviewed model facts are shared by the storefront and detail page.
 * Prices, discounts and inventory still come from the managed catalogue.
 * Older records must not restore a different model's specs or unavailable colours.
 */
export function mergeVerifiedProduct(row: Record<string, unknown>, reference?: Product): Product {
  const id = Number(row.id);
  const verified = reference?.id === id
    && reference.brand.toLowerCase() === String(row.brand).trim().toLowerCase()
    ? reference : undefined;
  const managedVariants = Array.isArray(row.variants) ? row.variants as ProductVariant[] : undefined;
  const variants = verified?.variants
    ? verified.variants.map((variant) => ({
        ...variant,
        stock: managedVariants
          ? Math.max(0, Number(managedVariants.find((item) => item.id === variant.id)?.stock) || 0)
          : variant.stock,
      }))
    : managedVariants;
  const images = verified?.images || (Array.isArray(row.images) && row.images.length
    ? row.images as string[] : ["/file.svg"]);

  return {
    id,
    brand: verified?.brand || String(row.brand || ""),
    name: verified?.name || String(row.name || ""),
    category: verified?.category || String(row.category || ""),
    subtitle: verified?.subtitle || String(row.subtitle || ""),
    description: verified?.description || String(row.description || ""),
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    stock: Number(row.stock),
    badge: row.badge ? String(row.badge) : undefined,
    images,
    fallbackImage: verified?.fallbackImage || images[0],
    features: verified?.features || (Array.isArray(row.features) ? row.features as string[] : []),
    specs: verified?.specs || (Array.isArray(row.specs) ? row.specs as Product["specs"] : []),
    variants,
  };
}
