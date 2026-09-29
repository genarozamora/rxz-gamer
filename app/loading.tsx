export default function StoreLoading() {
  return (
    <main className="min-h-screen bg-[#03070c] px-5 py-24 text-white" aria-busy="true" aria-label="Cargando tienda">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mx-auto h-7 w-52 rounded-full bg-white/10" />
        <div className="mx-auto mt-8 h-16 max-w-3xl rounded-2xl bg-white/10" />
        <div className="mx-auto mt-4 h-5 max-w-xl rounded bg-white/5" />
        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-[#09131e] p-4"><div className="aspect-square rounded-xl bg-white/10" /><div className="mt-5 h-4 w-20 rounded bg-emerald-400/15" /><div className="mt-3 h-6 rounded bg-white/10" /><div className="mt-7 h-12 rounded-xl bg-white/10" /></div>)}
        </div>
      </div>
      <span className="sr-only">Cargando contenido y productos…</span>
    </main>
  );
}
