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
    const { data: delivered } = await db.from("admin_push_deliveries").select("order_id").eq("order_id", order.id).maybeSingle();
    if (delivered) return Response.json({ ok: true, duplicate: true });
    configureWebPush();
    const { data: subscriptions } = await db.from("admin_push_subscriptions").select("id,endpoint,p256dh,auth");
    if (!subscriptions?.length) return Response.json({ error: "No hay dispositivos administradores suscriptos" }, { status: 503 });
    const payload = JSON.stringify({ title: "Nuevo pedido en RXZ Gamer", body: `${order.order_number} · $${Number(order.total).toLocaleString("es-AR")}`, tag: `rxz-order-${order.id}`, url: "/admin" });
    let successfulDeliveries = 0;
    await Promise.allSettled(subscriptions.map(async (sub) => {
      try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload); }
      catch (error: unknown) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
        if (statusCode === 404 || statusCode === 410) await db.from("admin_push_subscriptions").delete().eq("id", sub.id);
        throw error;
      }
      successfulDeliveries += 1;
    }));
    if (successfulDeliveries === 0) return Response.json({ error: "Ningún dispositivo recibió el aviso" }, { status: 503 });
    await db.from("admin_push_deliveries").upsert({ order_id: order.id }, { onConflict: "order_id" });
    return Response.json({ ok: true, delivered: successfulDeliveries });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Push no configurado";
    return Response.json({ error: detail }, { status: 503 });
  }
}
