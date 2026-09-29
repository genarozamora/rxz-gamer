"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("RXZ route error", error.digest || error.name);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#03070c] px-5 py-16 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-red-400/20 bg-[#09131e] p-8 text-center shadow-2xl sm:p-12">
        <p className="text-xs font-black tracking-[.25em] text-red-300">NO PUDIMOS CARGAR ESTA SECCIÓN</p>
        <h1 className="mt-4 text-3xl font-black">Intentemos nuevamente</h1>
        <p className="mt-4 leading-7 text-slate-300">Tus datos y tu carrito siguen guardados. Reintentá o volvé a la tienda.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black text-[#031008]">REINTENTAR</button>
          <Link href="/" className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 font-black text-white no-underline">VOLVER A LA TIENDA</Link>
        </div>
      </section>
    </main>
  );
}
