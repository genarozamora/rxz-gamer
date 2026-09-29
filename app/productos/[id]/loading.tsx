export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#03070c] px-4 pb-10 pt-24 text-white" aria-busy="true" aria-label="Cargando producto">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-56 rounded bg-white/10" />
        <div className="mt-7 grid gap-8 rounded-3xl border border-white/10 bg-[#09131e] p-5 md:grid-cols-2 md:p-9">
          <div className="aspect-square rounded-2xl bg-white/10" />
          <div className="py-3"><div className="h-4 w-28 rounded bg-emerald-400/15" /><div className="mt-5 h-10 rounded bg-white/10" /><div className="mt-4 h-5 w-3/4 rounded bg-white/5" /><div className="mt-10 h-12 w-44 rounded bg-white/10" /><div className="mt-8 h-14 rounded-xl bg-emerald-400/15" /><div className="mt-3 h-14 rounded-xl bg-white/10" /></div>
        </div>
      </div>
      <span className="sr-only">Consultando el producto, su precio y disponibilidad…</span>
    </main>
  );
}
