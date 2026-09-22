import { adminClient, authenticatedUser, configureWebPush } from "@/lib/push-server";
import webpush from "web-push";

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
    const db = adminClient();
    const { data: staff } = await db.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!staff) return Response.json({ error: "Acceso restringido" }, { status: 403 });
    configureWebPush();
    const { data: subscriptions } = await db.from("admin_push_subscriptions").select("id,endpoint,p256dh,auth").eq("user_id", user.id);
    if (!subscriptions?.length) return Response.json({ error: "Este dispositivo todavía no está registrado" }, { status: 404 });
    const payload = JSON.stringify({
      title: "Prueba RXZ Gamer",
      body: "Los avisos de pedidos funcionan correctamente.",
      tag: `rxz-server-test-${Date.now()}`,
      url: "/admin#pedidos",
    });
    let delivered = 0;
    await Promise.allSettled(subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
        delivered += 1;
      } catch (error: unknown) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
        if (statusCode === 404 || statusCode === 410) await db.from("admin_push_subscriptions").delete().eq("id", sub.id);
      }
    }));
    if (!delivered) return Response.json({ error: "El servicio no pudo entregar el aviso. Volvé a activar las notificaciones." }, { status: 503 });
    return Response.json({ ok: true, delivered });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo probar el aviso" }, { status: 503 });
  }
}
