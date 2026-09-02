"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Review = { id: string; product_id: string; rating: number; comment: string; approved: boolean; created_at: string };

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const { data, error } = await supabase.from("product_reviews").select("id,product_id,rating,comment,approved,created_at").order("created_at", { ascending: false }); if (error) setMessage(error.message); else setReviews((data || []) as Review[]); }
  useEffect(() => { async function start() { const { data: { user } } = await supabase.auth.getUser(); if (!user) { window.location.href = "/login?next=/admin/resenas"; return; } const { data: staff } = await supabase.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle(); if (!staff) { window.location.href = "/"; return; } await load(); } void start(); }, []);
  async function setApproved(id: string, approved: boolean) { const { error } = await supabase.from("product_reviews").update({ approved }).eq("id", id); if (error) setMessage(error.message); else { setMessage(approved ? "Reseña publicada." : "Reseña ocultada."); await load(); } }
  return <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white"><div className="mx-auto max-w-4xl"><Link href="/admin" className="text-sm font-bold text-emerald-400">← PANEL ADMIN</Link><h1 className="mt-3 text-3xl font-black">Reseñas verificadas</h1><p className="mt-2 text-slate-400">Revisá cada opinión antes de mostrarla públicamente.</p>{message && <div className="mt-5 rounded-xl border border-white/10 bg-[#111c29] p-4">{message}</div>}<div className="mt-7 space-y-4">{reviews.length === 0 ? <div className="rounded-2xl border border-white/10 bg-[#09131e] p-6 text-slate-400">Todavía no hay reseñas.</div> : reviews.map((review) => <article key={review.id} className="rounded-2xl border border-white/10 bg-[#09131e] p-5"><div className="flex flex-wrap justify-between gap-3"><div><span className="text-amber-300">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><p className="mt-1 text-xs text-slate-500">Producto #{review.product_id} · Compra verificada</p></div><span className={review.approved ? "text-emerald-400" : "text-amber-300"}>{review.approved ? "Publicada" : "Pendiente"}</span></div><p className="mt-4 rounded-xl bg-[#111c29] p-4 leading-6 text-slate-200">{review.comment}</p><div className="mt-4">{review.approved ? <button onClick={() => setApproved(review.id,false)} className="rounded-lg border border-white/15 px-4 py-2 font-bold">OCULTAR</button> : <button onClick={() => setApproved(review.id,true)} className="rounded-lg bg-emerald-500 px-4 py-2 font-black text-[#031008]">PUBLICAR</button>}</div></article>)}</div></div></main>;
}
