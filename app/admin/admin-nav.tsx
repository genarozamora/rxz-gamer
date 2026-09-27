"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [["/admin", "Inicio y soporte"], ["/admin/pedidos", "Pedidos"], ["/admin/productos", "Productos"], ["/admin/metricas", "Métricas"], ["/admin/devoluciones", "Devoluciones"], ["/admin/resenas", "Reseñas"]];

export function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="Administración" className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#09131e] p-3">
    {sections.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`min-h-11 rounded-lg px-4 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-emerald-300 ${pathname === href ? "bg-emerald-500 text-[#031008]" : "text-slate-300 hover:bg-white/10"}`}>{label}</Link>)}
    <Link href="/" className="min-h-11 rounded-lg px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-white/10">Ver tienda ↗</Link>
  </nav>;
}
