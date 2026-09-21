import { adminClient, authenticatedUser, configureWebPush } from "@/lib/push-server";
import webpush from "web-push";

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
    const { orderId } = await request.json();
    const db = adminClient();
    const { data: order } = await db.from("orders").select("id,order_number,total,user_id").eq("id", orderId).eq("user_id", user.id).maybeSingle();
    if (!order) return Response.json({ error: "Pedido inválido" }, { status: 404 });
    const { data: claimed } = await db.from("admin_push_deliveries").insert({ order_id: order.id }).select("order_id").maybeSingle();
    if (!claimed) return Response.json({ ok: true, duplicate: true });
    configureWebPush();
    const { data: subscriptions } = await db.from("admin_push_subscriptions").select("id,endpoint,p256dh,auth");
    const payload = JSON.stringify({ title: "Nuevo pedido en RXZ Gamer", body: `${order.order_number} · $${Number(order.total).toLocaleString("es-AR")}`, tag: `rxz-order-${order.id}`, url: "/admin" });
    await Promise.allSettled((subscriptions || []).map(async (sub) => {
      try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload); }
      catch (error: unknown) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
        if (statusCode === 404 || statusCode === 410) await db.from("admin_push_subscriptions").delete().eq("id", sub.id);
      }
    }));
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Push no configurado" }, { status: 503 }); }
}
