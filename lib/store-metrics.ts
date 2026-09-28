export type StoreEvent = { event_name: string; product_id: string | null; metadata: Record<string, unknown> | null };
export type MetricOrder = { id: string; status: string; total: number | string };
export function summarizeMetrics(events: StoreEvent[], orders: MetricOrder[]) {
  const count = (name: string) => events.filter((event) => event.event_name === name).length;
  const paid = orders.filter((order) => ["payment_verified", "preparing_shipment", "shipped", "delivered"].includes(order.status));
  const popular: Record<string, number> = {};
  const sources: Record<string, number> = {};
  const queries: Record<string, number> = {};
  const emptyQueries: Record<string, number> = {};
  const categories: Record<string, number> = {};
  for (const event of events) {
    if (event.event_name === "product_view" && event.product_id) popular[event.product_id] = (popular[event.product_id] || 0) + 1;
    if (["search", "search_no_results"].includes(event.event_name)) {
      const query = event.metadata?.query;
      if (typeof query === "string" && query.trim()) {
        const normalized = query.trim().toLocaleLowerCase("es");
        queries[normalized] = (queries[normalized] || 0) + 1;
        if (event.event_name === "search_no_results") emptyQueries[normalized] = (emptyQueries[normalized] || 0) + 1;
      }
    }
    if (event.event_name === "category_view") {
      const category = event.metadata?.category;
      if (typeof category === "string" && category.trim()) categories[category] = (categories[category] || 0) + 1;
    }
    if (event.event_name !== "campaign_visit") continue;
    const nested = event.metadata?.campaign as Record<string, unknown> | undefined;
    const source = event.metadata?.utm_source || nested?.utm_source;
    if (typeof source === "string" && source.trim()) sources[source] = (sources[source] || 0) + 1;
  }
  return {
    views: count("product_view"), carts: count("add_to_cart"), checkouts: count("begin_checkout"),
    cartViews: count("view_cart"), cartRemovals: count("remove_from_cart"), filterUses: count("filter_use"),
    searches: count("search") + count("search_no_results"), noResultSearches: count("search_no_results"),
    shares: events.filter((event) => ["share_product", "share_store", "share_store_whatsapp", "copy_store_link"].includes(event.event_name)).length,
    orders: orders.length, cancelled: orders.filter((order) => order.status === "cancelled").length,
    paid: paid.length, revenue: paid.reduce((sum, order) => sum + Number(order.total), 0),
    popular: Object.entries(popular).sort((a,b) => b[1]-a[1]).slice(0,5),
    sources: Object.entries(sources).sort((a,b) => b[1]-a[1]).slice(0,8),
    queries: Object.entries(queries).sort((a,b) => b[1]-a[1]).slice(0,8),
    emptyQueries: Object.entries(emptyQueries).sort((a,b) => b[1]-a[1]).slice(0,8),
    categories: Object.entries(categories).sort((a,b) => b[1]-a[1]).slice(0,8),
  };
}
