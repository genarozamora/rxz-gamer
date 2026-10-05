"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "../admin-nav";
import { supabase } from "@/lib/supabase";
import { summarizeMetrics, type StoreEvent, type MetricOrder } from "@/lib/store-metrics";

type Report = ReturnType<typeof summarizeMetrics>;
export default function MetricsPage() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [attempt, setAttempt] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [names, setNames] = useState<Record<string,string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");
  const [partial, setPartial] = useState(false);
  const ratio = (value: number, base: number) => base > 0 ? `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(value / base * 100)}%` : "—";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setMessage(""); setReport(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace("/login?next=/admin/metricas"); return; }
        const { data: staff, error: accessError } = await supabase.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle();
        if (accessError || !staff) throw new Error("No se pudo verificar tu acceso al panel.");
        const until = new Date().toISOString();
        const since = new Date(Date.parse(until) - days * 86400000).toISOString();
        // Supabase caps each response; retrieve explicit pages rather than silently counting only the first 1,000 rows.
        async function rows(table: "orders" | "store_events", columns: string) {
          const result: unknown[] = [];
          let total = 0;
          for (let from = 0; from < 50000; from += 1000) {
            const { data, error, count } = await supabase.from(table).select(columns, { count: "exact" }).gte("created_at", since).lte("created_at", until).order("created_at", {ascending:false}).order("id", {ascending:false}).range(from, from + 999);
            if (error) throw new Error(`No se pudieron cargar ${table === "orders" ? "los pedidos" : "las interacciones"}: ${error.message}`);
            result.push(...(data || [])); total = count || 0;
            if (result.length >= total || !data?.length) break;
          }
          return {data:result, partial:result.length < total};
        }
        const [events, orders, products] = await Promise.all([
          rows("store_events", "id,event_name,product_id,metadata,created_at"),
          rows("orders", "id,status,total,created_at"),
          supabase.from("products").select("id,brand,name"),
        ]);
        if (cancelled) return;
        setReport(summarizeMetrics(events.data as StoreEvent[], orders.data as MetricOrder[]));
        setNames(Object.fromEntries((products.data || []).map((product) => [String(product.id), `${product.brand} ${product.name}`])));
        setPartial(events.partial || orders.partial);
        setUpdated(new Date(until).toLocaleString("es-AR"));
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : "No se pudieron cargar las métricas."); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, [days, attempt, router]);

  return <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white"><div className="mx-auto max-w-6xl"><AdminNav />
    <h1 className="text-3xl font-black">Métricas de la tienda</h1>
    <div className="my-6 flex flex-wrap items-end gap-4"><label className="text-sm text-slate-300">Período<select className="ml-3 rounded-xl border border-white/15 bg-[#111c29] p-3 text-white" value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>Últimos 7 días</option><option value={30}>Últimos 30 días</option><option value={90}>Últimos 90 días</option></select></label><button disabled={loading} onClick={() => setAttempt((value) => value + 1)} className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-[#031008] disabled:opacity-50">{loading ? "Cargando…" : "Actualizar"}</button></div>
    {message && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{message} Podés volver a intentar con Actualizar.</p>}
    {loading && <p role="status" className="text-slate-300">Consultando interacciones y pedidos reales…</p>}
    {report && <>
      <p className="text-sm text-slate-400">Actualizado: {updated}. Período móvil de {days} días.</p>
      {partial && <p role="alert" className="mt-4 rounded-xl bg-amber-500/10 p-4 text-amber-200">El período supera 50.000 registros. Estos resultados son parciales: elegí un período menor.</p>}
      <h2 className="mt-7 text-xl font-bold">Actividad en la tienda</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Vistas de productos",report.views],["Agregados al carrito",report.carts],["Carritos abiertos",report.cartViews],["Productos eliminados",report.cartRemovals],["Inicios de compra",report.checkouts],["Uso de filtros",report.filterUses],["Acciones de compartir",report.shares]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><p className="text-sm text-slate-300">{label}</p><strong className="mt-2 block text-3xl text-emerald-400">{value}</strong></div>)}</div>
      <p className="mt-3 text-sm leading-6 text-slate-400">Son acciones registradas, no personas únicas. Compartir incluye copiar enlaces y abrir WhatsApp; no confirma que el mensaje se haya enviado. Las interacciones que antes no se registraban no se pueden recuperar.</p>
      <h2 className="mt-7 text-xl font-bold">Recorrido de compra</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Vista → carrito",ratio(report.carts,report.views)],["Carrito → checkout",ratio(report.checkouts,report.carts)],["Checkout → pedido",ratio(report.orders,report.checkouts)],["Pedido → pago aprobado",ratio(report.paid,report.orders)]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><p className="text-sm text-slate-300">{label}</p><strong className="mt-2 block text-3xl text-emerald-400">{value}</strong></div>)}</div>
      <p className="mt-3 text-sm leading-6 text-slate-400">Relaciones orientativas entre cantidades de acciones y pedidos del período. No representan personas únicas y pueden superar el 100% si una persona repite una acción.</p>
      <h2 className="mt-7 text-xl font-bold">Qué buscan los clientes</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><p className="text-sm text-slate-300">Búsquedas realizadas</p><strong className="mt-2 block text-3xl text-emerald-400">{report.searches}</strong></div><div className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><p className="text-sm text-slate-300">Búsquedas sin resultados</p><strong className="mt-2 block text-3xl text-amber-300">{report.noResultSearches}</strong></div></div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">{[["Términos más buscados",report.queries],["Oportunidades sin resultados",report.emptyQueries]].map(([title,items]) => <section key={String(title)} className="rounded-2xl border border-white/10 bg-[#09131e] p-6"><h3 className="text-lg font-bold">{String(title)}</h3>{(items as [string,number][]).length ? <ol className="mt-4 space-y-3">{(items as [string,number][]).map(([query,total]) => <li key={query} className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="break-words">{query}</span><strong>{total}</strong></li>)}</ol> : <p className="mt-4 text-slate-400">Sin búsquedas registradas en este período.</p>}</section>)}</div>
      <p className="mt-3 text-sm leading-6 text-slate-400">Una búsqueda se registra después de que la persona deja de escribir. “Sin resultados” muestra productos que conviene sumar o palabras que conviene asociar al catálogo.</p>
      <section className="mt-6 rounded-2xl border border-white/10 bg-[#09131e] p-6"><h3 className="text-lg font-bold">Categorías más consultadas</h3>{report.categories.length ? <ol className="mt-4 grid gap-3 sm:grid-cols-2">{report.categories.map(([category,total]) => <li key={category} className="flex justify-between gap-4 rounded-xl border border-white/10 p-3"><span>{category}</span><strong>{total}</strong></li>)}</ol> : <p className="mt-4 text-slate-400">Sin categorías registradas en este período.</p>}</section>
      <h2 className="mt-7 text-xl font-bold">Pedidos creados en este período</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Pedidos creados",report.orders],["Cancelados",report.cancelled],["Con pago verificado",report.paid],["Total con pago verificado",new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(report.revenue)]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><p className="text-sm text-slate-300">{label}</p><strong className="mt-2 block text-2xl text-emerald-400">{value}</strong></div>)}</div>
      <p className="mt-3 text-sm text-slate-400">Datos de los pedidos reales según su estado actual. Los pendientes y cancelados no suman al total con pago verificado. El importe incluye el envío si está cargado.</p>
      <div className="mt-7 grid gap-6 md:grid-cols-3">{[["Productos más vistos",report.popular],["Productos más agregados",report.popularAdded],["Visitas desde campañas",report.sources]].map(([title,items]) => <section key={String(title)} className="rounded-2xl border border-white/10 bg-[#09131e] p-6"><h2 className="text-xl font-bold">{String(title)}</h2>{(items as [string,number][]).length ? <ol className="mt-4 space-y-3">{(items as [string,number][]).map(([id,total]) => <li key={id} className="flex justify-between gap-4 border-b border-white/10 pb-3"><span>{title !== "Visitas desde campañas" ? names[id] || `Producto #${id}` : id}</span><strong>{total}</strong></li>)}</ol> : <p className="mt-4 text-slate-400">Sin registros en este período.</p>}</section>)}</div>
    </>}
  </div></main>;
}
