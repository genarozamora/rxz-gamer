"use client";

import Link from "next/link";
import { SectionShell } from "@/app/components/section-shell";
import { PRODUCTS } from "@/app/page";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

export default function ProductosPage() {
  return <SectionShell active="/productos">
    <section className="mx-auto max-w-[1450px] px-5 py-14 sm:px-8">
      <span className="text-xs font-black tracking-[.2em] text-emerald-400">CATÁLOGO RXZ</span>
      <h1 className="mt-3 text-4xl font-black sm:text-6xl">Productos disponibles</h1>
      <p className="mt-4 max-w-2xl text-slate-400">Solo mostramos productos actualmente publicados y con stock confirmado.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PRODUCTS.map((product) => <article key={product.id} className="flex overflow-hidden rounded-3xl border border-white/10 bg-[#09131f] sm:flex-col">
          <div className="grid w-32 shrink-0 place-items-center bg-white p-3 sm:h-64 sm:w-full"><img src={product.images[0]} alt={`${product.brand} ${product.name}`} className="max-h-full max-w-full object-contain"/></div>
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5"><small className="font-black tracking-widest text-emerald-400">{product.brand}</small><h2 className="mt-2 text-lg font-bold leading-tight">{product.name}</h2><p className="mt-2 text-xs leading-5 text-slate-400">{product.subtitle}</p><strong className="mt-4 text-2xl text-emerald-400">{money(product.price)}</strong><span className="mt-1 text-xs text-emerald-300">● En stock · Entrega inmediata</span><Link href={`/productos/${product.id}`} className="mt-5 rounded-xl bg-emerald-400 px-4 py-3 text-center text-xs font-black text-[#031008]">VER PRODUCTO</Link></div>
        </article>)}
      </div>
    </section>
  </SectionShell>;
}
