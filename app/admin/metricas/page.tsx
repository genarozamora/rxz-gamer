"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type EventRow = { event_name: string; product_id: string | null; created_at: string };

export default function MetricsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=/admin/metricas"; return; }
      const { data: staff } = await supabase.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!staff) { window.location.href = "/"; return; }
      const { data, error } = await supabase.from("store_events").select("event_name,product_id,created_at").order("created_at", { ascending: false }).limit(5000);
      if (error) setMessage(error.message); else setEvents((data || []) as EventRow[]);
    }
    void load();
  }, []);

  const count = (name: string) => events.filter((event) => event.event_name === name).length;
  const views = count("product_view");
  const carts = count("add_to_cart");
  const checkouts = count("begin_checkout");
  const purchases = count("purchase");
  const popular = Object.entries(events.filter((event) => event.event_name === "product_view" && event.product_id).reduce<Record<string, number>>((result, event) => ({ ...result, [event.product_id!]: (result[event.product_id!] || 0) + 1 }), {})).sort((a,b) => b[1]-a[1]).slice(0,5);

  return <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white"><div className="mx-auto max-w-5xl"><Link href="/admin" className="text-sm font-bold text-emerald-400">← PANEL ADMIN</Link><h1 className="mt-3 text-3xl font-black">Métricas de la tienda</h1><p className="mt-2 text-slate-400">Resumen de los últimos 5.000 eventos registrados.</p>{message && <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">{message}</div>}<div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Vistas",views],["Agregados",carts],["Checkouts",checkouts],["Compras",purchases]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><p className="text-sm text-slate-400">{label}</p><strong className="mt-2 block text-3xl text-emerald-400">{value}</strong></div>)}</div><div className="mt-6 rounded-2xl border border-white/10 bg-[#09131e] p-6"><h2 className="text-xl font-black">Conversión orientativa</h2><p className="mt-3 text-3xl font-black text-emerald-400">{views ? ((purchases/views)*100).toFixed(1) : "0.0"}%</p><p className="mt-2 text-sm text-slate-400">Compras registradas respecto de vistas de producto.</p></div><div className="mt-6 rounded-2xl border border-white/10 bg-[#09131e] p-6"><h2 className="text-xl font-black">Productos más vistos</h2>{popular.length ? <ol className="mt-4 space-y-3">{popular.map(([id,total]) => <li key={id} className="flex justify-between border-b border-white/10 pb-3"><span>Producto #{id}</span><strong>{total} vistas</strong></li>)}</ol> : <p className="mt-4 text-slate-400">Todavía no hay datos.</p>}</div></div></main>;
}
