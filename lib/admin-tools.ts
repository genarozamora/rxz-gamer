export function matchesAdminSearch(query: string, values: (string | null | undefined)[]) {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const haystack = normalize(values.filter(Boolean).join(" "));
  return normalize(query).trim().split(/\s+/).every((word) => haystack.includes(word));
}

export function matchesOrderStatus(status: string, filter: string) {
  if (filter === "all") return true;
  if (filter === "preparing") return ["payment_verified", "preparing_shipment"].includes(status);
  return status === filter;
}

// Editing the cover must not erase the remaining gallery or change visibility.
export function productEditorImages(cover: string, existing: string[] = []) {
  const first = cover.trim();
  return Array.from(new Set([...(first ? [first] : []), ...existing.slice(1)]));
}
