"use client";

import Link from "next/link";
import { SectionShell } from "@/app/components/section-shell";
import { PRODUCTS } from "@/app/page";

export default function CompararPage() {
  return <SectionShell active="/comparar"><section className="mx-auto max-w-7xl px-5 py-14"><span className="text-xs font-black tracking-[.2em] text-emerald-400">COMPARACIÓN SIMPLE</span><h1 className="mt-3 text-4xl font-black sm:text-6xl">Elegí el ideal para vos</h1><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{PRODUCTS.map((product) => <article key={product.id} className="flex flex-col rounded-3xl border border-white/10 bg-[#09131f] p-5"><img src={product.images[0]} alt={product.name} className="h-40 w-full rounded-2xl bg-white object-contain p-3"/><small className="mt-5 font-black text-emerald-400">{product.brand}</small><h2 className="mt-1 text-xl font-bold">{product.name}</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs font-black text-slate-500">TIPO</dt><dd>{product.category}</dd></div><div><dt className="text-xs font-black text-slate-500">LO PRINCIPAL</dt><dd>{product.subtitle}</dd></div><div><dt className="text-xs font-black text-slate-500">COLORES</dt><dd>{product.variants?.map((item) => item.label).join(" · ") || "Única variante"}</dd></div></dl><Link href={`/productos/${product.id}`} className="mt-auto pt-7 text-sm font-black text-emerald-300">VER DETALLES →</Link></article>)}</div></section></SectionShell>;
}
