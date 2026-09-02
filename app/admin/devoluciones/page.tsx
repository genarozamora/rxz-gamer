"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type RequestRow = { id: string; request_code: string; full_name: string; email: string; order_number: string; detail: string; status: string; created_at: string };

export default function ReturnsAdminPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const { data, error } = await supabase.from("return_requests").select("*").order("created_at", { ascending: false }); if (error) setMessage(error.message); else setRequests((data || []) as RequestRow[]); }
  useEffect(() => { async function start() { const { data: { user } } = await supabase.auth.getUser(); if (!user) { window.location.href = "/login?next=/admin/devoluciones"; return; } const { data: staff } = await supabase.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle(); if (!staff) { window.location.href = "/"; return; } await load(); } void start(); }, []);
  async function setStatus(id: string, status: string) { const { error } = await supabase.from("return_requests").update({ status }).eq("id", id); if (error) setMessage(error.message); else await load(); }
  return <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white"><div className="mx-auto max-w-5xl"><Link href="/admin" className="text-sm font-bold text-emerald-400">← PANEL ADMIN</Link><h1 className="mt-3 text-3xl font-black">Arrepentimientos y devoluciones</h1>{message && <div className="mt-5 rounded-xl border border-white/10 bg-[#111c29] p-4">{message}</div>}<div className="mt-7 space-y-4">{requests.length === 0 ? <div className="rounded-2xl border border-white/10 bg-[#09131e] p-6 text-slate-400">No hay solicitudes.</div> : requests.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><div className="flex flex-wrap justify-between gap-3"><div><strong className="text-emerald-400">{item.request_code}</strong><h2 className="mt-1 text-lg font-black">Pedido {item.order_number}</h2></div><span className="text-sm text-slate-400">{new Date(item.created_at).toLocaleString("es-AR")}</span></div><p className="mt-3 text-sm text-slate-300">{item.full_name} · {item.email}</p><p className="mt-4 rounded-xl bg-[#111c29] p-4 leading-6 text-slate-300">{item.detail}</p><div className="mt-4 flex flex-wrap gap-2">{[["received","RECIBIDA"],["reviewing","EN REVISIÓN"],["resolved","RESUELTA"],["rejected","RECHAZADA"]].map(([value,label]) => <button key={value} onClick={() => setStatus(item.id,value)} className={`rounded-lg px-3 py-2 text-xs font-black ${item.status === value ? "bg-emerald-500 text-[#031008]" : "border border-white/15"}`}>{label}</button>)}</div></article>)}</div></div></main>;
}
