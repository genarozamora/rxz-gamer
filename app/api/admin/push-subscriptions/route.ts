import { adminClient, authenticatedUser } from "@/lib/push-server";

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
    const db = adminClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const token = request.headers.get("authorization")!.replace(/^Bearer\s+/i, "");
    const { createClient } = await import("@supabase/supabase-js");
    const userDb = createClient(url, publishableKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: staff } = await userDb.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!staff) return Response.json({ error: "Acceso restringido" }, { status: 403 });
    const body = await request.json();
    const endpoint = String(body?.endpoint || "");
    const p256dh = String(body?.keys?.p256dh || "");
    const auth = String(body?.keys?.auth || "");
    if (!endpoint.startsWith("https://") || endpoint.length > 2048 || !p256dh || !auth) return Response.json({ error: "Suscripción inválida" }, { status: 400 });
    const { error } = await db.from("admin_push_subscriptions").upsert({ user_id: user.id, endpoint, p256dh, auth, user_agent: request.headers.get("user-agent")?.slice(0, 500) || null, updated_at: new Date().toISOString() }, { onConflict: "endpoint" });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "No se pudo guardar la suscripción" }, { status: 500 }); }
}
