"use client";

import Link from "next/link";
import { ReactNode } from "react";

const links = [
  ["/inicio", "Inicio"],
  ["/productos", "Productos"],
  ["/comparar", "Comparar"],
  ["/envios", "Envíos"],
  ["/preguntas", "Preguntas"],
  ["/contacto", "Contacto"],
] as const;

export function SectionShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030811] text-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(34,197,94,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,.12)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[#22c55e]/15 blur-[130px]" />
        <div className="absolute -right-44 top-44 h-[560px] w-[560px] rounded-full bg-blue-600/15 blur-[150px]" />
      </div>
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#030811]/95 backdrop-blur-xl">
        <div className="bg-[#22c55e] px-3 py-2 text-center text-[10px] font-black tracking-[.18em] text-[#031008] sm:text-xs">
          🚚 ENVÍOS A TODO EL PAÍS · OCA · ATENCIÓN PERSONALIZADA
        </div>
        <header className="mx-auto flex min-h-20 max-w-[1500px] items-center gap-5 px-4 sm:px-7">
          <Link href="/inicio" className="shrink-0 text-xl font-black tracking-tight sm:text-2xl">
            RXZ <span className="text-[#22c55e]">GAMER</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {links.map(([href, label]) => (
              <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold ${active === href ? "bg-[#22c55e]/10 text-[#86efac]" : "text-slate-300 hover:text-white"}`}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/cuenta#pedidos" className="ml-auto rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-slate-200 lg:ml-2">PEDIDOS</Link>
          <Link href="/?cart=open" className="rounded-xl border border-[#22c55e]/40 bg-[#22c55e]/10 px-3 py-2 text-xs font-black text-[#86efac]">🛒 CARRITO</Link>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-t border-white/5 px-3 py-2 lg:hidden" aria-label="Secciones">
          {links.map(([href, label]) => (
            <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${active === href ? "bg-[#22c55e] text-[#031008]" : "bg-white/5 text-slate-300"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="relative z-10">{children}</div>
      <footer className="relative z-10 border-t border-white/10 px-5 py-10 text-center text-sm text-slate-500">
        <Link href="/inicio" className="font-black text-white">RXZ <span className="text-[#22c55e]">GAMER</span></Link>
        <p className="mt-2">Gaming · Performance · Tecnología</p>
      </footer>
    </div>
  );
}
