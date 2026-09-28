export default function Loading() {
  return (
    <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white" aria-busy="true" aria-label="Cargando RXZ Gamer">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-12 w-48 rounded-xl bg-white/10" />
        <div className="mt-16 h-10 w-2/3 max-w-xl rounded-xl bg-white/10" />
        <div className="mt-4 h-5 w-1/2 max-w-md rounded-lg bg-white/5" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-[#09131e] p-4"><div className="aspect-square rounded-xl bg-white/10" /><div className="mt-5 h-4 w-24 rounded bg-emerald-400/15" /><div className="mt-3 h-6 w-full rounded bg-white/10" /><div className="mt-5 h-9 w-1/2 rounded bg-white/10" /></div>)}
        </div>
      </div>
      <p className="sr-only" role="status">Cargando productos y disponibilidad…</p>
    </main>
  );
}
