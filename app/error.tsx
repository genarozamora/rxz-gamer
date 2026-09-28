"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("RXZ page error", error); }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-[#03070c] px-5 py-16 text-white">
      <section className="max-w-xl text-center" role="alert">
        <p className="text-sm font-black tracking-[.25em] text-amber-300">NO PUDIMOS CARGAR ESTA PANTALLA</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">Probemos nuevamente.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">Tu carrito permanece guardado en este dispositivo. Reintentá la operación o volvé al catálogo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="rounded-xl bg-emerald-500 px-6 py-4 font-black text-[#031008]">REINTENTAR</button><Link href="/#productos" className="rounded-xl border border-white/15 bg-[#101927] px-6 py-4 font-black text-white no-underline">VER PRODUCTOS</Link></div>
        {error.digest && <p className="mt-6 text-xs text-slate-500">Referencia: {error.digest}</p>}
      </section>
    </main>
  );
}
