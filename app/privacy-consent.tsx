"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MARKETING_CONSENT_EVENT, MARKETING_CONSENT_KEY } from "@/lib/marketing-consent";

export function PrivacyConsent({ onChoice }: { onChoice: (enabled: boolean) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem(MARKETING_CONSENT_KEY);
      if (saved === "granted" || saved === "denied") {
        onChoice(saved === "granted");
        return;
      }
      setVisible(true);
    });
  }, [onChoice]);

  function choose(enabled: boolean) {
    localStorage.setItem(MARKETING_CONSENT_KEY, enabled ? "granted" : "denied");
    window.dispatchEvent(new Event(MARKETING_CONSENT_EVENT));
    onChoice(enabled);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="privacy-consent-title"
      className="fixed inset-x-3 bottom-24 z-[1200] mx-auto max-w-2xl rounded-2xl border border-emerald-400/35 bg-[#07111cf5] p-4 text-white shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-5"
    >
      <strong id="privacy-consent-title" className="block text-base font-black text-emerald-300">Tu privacidad importa</strong>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Usamos almacenamiento necesario para la cuenta y el carrito. La medición publicitaria de Meta es opcional. Podés comprar aunque no la aceptes. <Link href="/legal/privacidad" className="font-bold text-emerald-300 underline">Ver privacidad</Link>.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => choose(false)} className="min-h-12 rounded-xl border border-white/20 bg-[#101c29] px-4 text-sm font-black text-white">SOLO NECESARIAS</button>
        <button type="button" onClick={() => choose(true)} className="min-h-12 rounded-xl bg-emerald-500 px-4 text-sm font-black text-[#031008]">ACEPTAR MEDICIÓN</button>
      </div>
    </div>
  );
}
