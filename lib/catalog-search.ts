type SearchableProduct = {
  brand: string;
  name: string;
  category: string;
  subtitle: string;
  variants?: { label: string }[];
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();

export function matchesCatalogSearch(product: SearchableProduct, query: string) {
  const text = normalize([product.brand, product.name, product.category, product.subtitle,
    ...(product.variants?.map((variant) => variant.label) ?? [])].join(" "));
  return normalize(query).split(/\s+/).filter(Boolean).every((term) => text.includes(term));
}
