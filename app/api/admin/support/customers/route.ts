import { NextResponse } from "next/server";
import { adminClient, authenticatedClient } from "@/lib/push-server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const session = await authenticatedClient(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: staff } = await session.db
      .from("support_staff")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!staff) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const userIds: string[] = Array.from(
      new Set(
        (Array.isArray(body.userIds) ? body.userIds : [])
          .map((value: unknown) => String(value))
          .filter((value: string) => UUID_PATTERN.test(value)),
      ) as Set<string>,
    ).slice(0, 100);

    const service = adminClient();
    const customers = await Promise.all(
      userIds.map(async (userId) => {
        const { data } = await service.auth.admin.getUserById(userId);
        return { user_id: userId, email: data.user?.email || null };
      }),
    );

    return NextResponse.json(
      { customers },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json({ error: "No se pudieron consultar los clientes" }, { status: 500 });
  }
}
