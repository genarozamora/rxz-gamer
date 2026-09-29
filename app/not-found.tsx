import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#03070c] px-5 py-16 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#09131e] p-8 text-center shadow-2xl sm:p-12">
        <p className="text-xs font-black tracking-[.25em] text-emerald-400">ERROR 404</p>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Esta página no existe</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-300">
          El enlace puede haber cambiado. Volvé al catálogo para encontrar productos, precios y stock actualizado.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/#productos" className="rounded-xl bg-emerald-500 px-6 py-4 font-black text-[#031008] no-underline">VER PRODUCTOS</Link>
          <Link href="/ayuda" className="rounded-xl border border-white/15 px-6 py-4 font-black text-white no-underline">CONSULTAR A SOPORTE</Link>
        </div>
      </section>
    </main>
  );
}
