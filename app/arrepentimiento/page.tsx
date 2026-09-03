"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ArrepentimientoPage() {
  const [requestCode, setRequestCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const { data: code, error: insertError } = await supabase.rpc("create_return_request", {
      p_full_name: String(form.get("full_name") || "").trim(),
      p_email: String(form.get("email") || "").trim().toLowerCase(),
      p_order_number: String(form.get("order_number") || "").trim(),
      p_detail: String(form.get("detail") || "").trim(),
    });
    if (insertError) setError("No pudimos registrar la solicitud. Intentá nuevamente o comunicate mediante Ayuda.");
    else if (code) setRequestCode(String(code));
    setSending(false);
  }

  return (
    <main className="min-h-screen bg-[#03070c] px-5 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#09131e] p-6 shadow-2xl sm:p-10">
        <Link href="/" className="text-sm font-bold text-emerald-400 no-underline">← VOLVER A RXZ GAMER</Link>
        <p className="mt-8 text-xs font-black tracking-[.25em] text-emerald-400">GESTIÓN DE COMPRA</p>
        <h1 className="mt-2 text-3xl font-black">Botón de arrepentimiento</h1>
        <p className="mt-4 leading-7 text-slate-300">Solicitá la revocación de una compra realizada a distancia. No necesitás iniciar sesión.</p>

        {requestCode ? (
          <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-100">
            Recibimos tu solicitud. Tu código de gestión es <strong className="mt-2 block text-xl">{requestCode}</strong>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input name="full_name" required minLength={2} maxLength={120} autoComplete="name" aria-label="Nombre y apellido" placeholder="Nombre y apellido" className="w-full rounded-xl border border-white/10 bg-[#101c29] p-4 outline-none focus:border-emerald-400" />
            <input name="email" required type="email" maxLength={200} autoComplete="email" aria-label="Correo electrónico" placeholder="Correo electrónico de la compra" className="w-full rounded-xl border border-white/10 bg-[#101c29] p-4 outline-none focus:border-emerald-400" />
            <input name="order_number" required minLength={2} maxLength={100} autoComplete="off" aria-label="Número de pedido" placeholder="Número de pedido" className="w-full rounded-xl border border-white/10 bg-[#101c29] p-4 outline-none focus:border-emerald-400" />
            <textarea name="detail" required minLength={5} maxLength={3000} aria-label="Detalle" placeholder="Detalle de la solicitud" rows={5} className="w-full resize-y rounded-xl border border-white/10 bg-[#101c29] p-4 outline-none focus:border-emerald-400" />
            {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
            <button disabled={sending} className="w-full rounded-xl bg-emerald-500 p-4 font-black text-[#031008] disabled:opacity-50">{sending ? "ENVIANDO..." : "ENVIAR SOLICITUD"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
