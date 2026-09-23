import Link from "next/link";
import { SectionShell } from "@/app/components/section-shell";

export default function InicioPage() {
  return <SectionShell active="/inicio">
    <section className="mx-auto grid min-h-[calc(100dvh-118px)] max-w-6xl place-items-center px-5 py-16 text-center">
      <div>
        <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-2 text-xs font-black tracking-[.2em] text-emerald-300">GAMING · PERFORMANCE · TECNOLOGÍA</span>
        <h1 className="mt-7 text-5xl font-black leading-[.92] tracking-[-.05em] sm:text-7xl lg:text-8xl">EQUIPATE PARA<br/><span className="text-emerald-400">JUGAR MEJOR.</span></h1>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Periféricos seleccionados por rendimiento, tecnología y relación precio-calidad, con stock real y atención directa.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/productos" className="rounded-xl bg-emerald-400 px-7 py-4 text-sm font-black text-[#031008]">VER PRODUCTOS</Link>
          <Link href="/comparar" className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-black">COMPARAR</Link>
        </div>
        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {[['🚚','Envíos nacionales','Por OCA'],['🔒','Compra segura','Pago verificado'],['💬','Atención directa','Soporte RXZ']].map(([icon,title,text]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[.03] p-5 text-left"><span className="text-2xl">{icon}</span><strong className="mt-3 block">{title}</strong><small className="text-slate-500">{text}</small></div>)}
        </div>
      </div>
    </section>
  </SectionShell>;
}
