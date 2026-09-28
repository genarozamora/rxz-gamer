import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#03070c] px-5 py-16 text-white">
      <section className="max-w-xl text-center">
        <p className="text-sm font-black tracking-[.25em] text-emerald-400">ERROR 404</p>
        <h1 className="mt-4 text-4xl font-black sm:text-6xl">Esta página no está disponible.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">El enlace puede haber cambiado o el producto ya no está publicado. Volvé al catálogo para consultar el stock actual.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/#productos" className="rounded-xl bg-emerald-500 px-6 py-4 font-black text-[#031008] no-underline">VER PRODUCTOS</Link><Link href="/" className="rounded-xl border border-white/15 bg-[#101927] px-6 py-4 font-black text-white no-underline">IR AL INICIO</Link></div>
      </section>
    </main>
  );
}
