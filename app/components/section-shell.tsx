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
    <main className="min-h-screen bg-[#030811] text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#030811]/95 backdrop-blur-xl">
        <div className="bg-emerald-500 px-3 py-2 text-center text-[10px] font-black tracking-[.18em] text-[#031008] sm:text-xs">
          🚚 ENVÍOS A TODO EL PAÍS · OCA · ATENCIÓN PERSONALIZADA
        </div>
        <header className="mx-auto flex min-h-20 max-w-[1500px] items-center gap-5 px-4 sm:px-7">
          <Link href="/inicio" className="shrink-0 text-xl font-black tracking-tight sm:text-2xl">
            RXZ <span className="text-emerald-400">GAMER</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {links.map(([href, label]) => (
              <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold ${active === href ? "bg-emerald-400/10 text-emerald-300" : "text-slate-300 hover:text-white"}`}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/cuenta#pedidos" className="ml-auto rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-slate-200 lg:ml-2">PEDIDOS</Link>
          <Link href="/?cart=open" className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">🛒 CARRITO</Link>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-t border-white/5 px-3 py-2 lg:hidden" aria-label="Secciones">
          {links.map(([href, label]) => (
            <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${active === href ? "bg-emerald-400 text-[#031008]" : "bg-white/5 text-slate-300"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
      <footer className="border-t border-white/10 px-5 py-10 text-center text-sm text-slate-500">
        <Link href="/inicio" className="font-black text-white">RXZ <span className="text-emerald-400">GAMER</span></Link>
        <p className="mt-2">Gaming · Performance · Tecnología</p>
      </footer>
    </main>
  );
}
