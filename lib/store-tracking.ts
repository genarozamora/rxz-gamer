import { supabase } from "./supabase";

export async function trackStoreEvent(eventName: string, productId?: number, extra: Record<string, unknown> = {}) {
  try {
    let campaign: Record<string, unknown> = {};
    try {
      const saved = JSON.parse(localStorage.getItem("rxz-campaign") || "{}");
      if (saved.captured_at && Date.now() - Date.parse(saved.captured_at) < 30 * 86400000) campaign = saved;
    } catch { /* Tracking must never prevent a purchase. */ }
    const metadata = { ...extra, ...(Object.keys(campaign).length ? { campaign } : {}) };
    const { error } = await supabase.from("store_events").insert({
      event_name: eventName, product_id: productId ? String(productId) : null,
      metadata,
    });
    if (error?.code === "42501" && eventName !== "resume_cart") {
      const { error: fallbackError } = await supabase.from("store_events").insert({
        event_name: "resume_cart",
        product_id: productId ? String(productId) : null,
        metadata: { ...metadata, event_alias: eventName },
      });
      if (fallbackError) console.warn("RXZ: no se pudo registrar la interacción", fallbackError.code);
    } else if (error) console.warn("RXZ: no se pudo registrar la interacción", error.code);
  } catch { console.warn("RXZ: registro de interacción no disponible"); }
}
