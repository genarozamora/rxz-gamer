"use client";

import { useState } from "react";
import { MARKETING_CONSENT_EVENT, MARKETING_CONSENT_KEY } from "@/lib/marketing-consent";

export function PrivacySettings() {
  const [message, setMessage] = useState("");

  function save(enabled: boolean) {
    localStorage.setItem(MARKETING_CONSENT_KEY, enabled ? "granted" : "denied");
    window.dispatchEvent(new Event(MARKETING_CONSENT_EVENT));
    setMessage(enabled ? "Medición publicitaria aceptada." : "Medición publicitaria desactivada.");
  }

  return (
    <section className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-5" aria-labelledby="privacy-settings-title">
      <h2 id="privacy-settings-title" className="text-lg font-bold">Preferencias de medición</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">Podés cambiar esta elección en cualquier momento. La cuenta, el carrito y la compra siguen funcionando con cualquiera de las dos opciones.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => save(false)} className="min-h-12 rounded-xl border border-white/20 bg-[#101c29] px-4 text-sm font-black text-white">SOLO NECESARIAS</button>
        <button type="button" onClick={() => save(true)} className="min-h-12 rounded-xl bg-emerald-500 px-4 text-sm font-black text-[#031008]">ACEPTAR MEDICIÓN</button>
      </div>
      {message && <p role="status" className="mt-3 text-sm font-bold text-emerald-300">{message}</p>}
    </section>
  );
}
