"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PRODUCTS } from "@/app/page";

type ProductRow = { id: number; slug: string; brand: string; name: string; category: string; price: number; stock: number; description: string; active: boolean; images: string[] };
const empty = { brand: "", name: "", category: "", price: "", stock: "0", description: "", image: "" };

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login?next=/admin/productos"; return; }
    const { data: staff } = await supabase.from("support_staff").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!staff) { window.location.href = "/"; return; }
    const { data, error } = await supabase.from("products").select("id,slug,brand,name,category,price,stock,description,active,images").order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setProducts((data || []) as ProductRow[]);
  }

  useEffect(() => { void load(); }, []);

  async function save(event: FormEvent) {
    event.preventDefault(); setMessage("");
    const payload = { slug: `${form.brand}-${form.name}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), brand: form.brand.trim(), name: form.name.trim(), category: form.category.trim(), subtitle: "", description: form.description.trim(), price: Number(form.price), stock: Number(form.stock), images: form.image.trim() ? [form.image.trim()] : [], active: true };
    const query = editingId ? supabase.from("products").update(payload).eq("id", editingId) : supabase.from("products").insert(payload);
    const { error } = await query;
    if (error) setMessage(error.message); else { setForm(empty); setEditingId(null); setMessage("Producto guardado correctamente."); await load(); }
  }

  async function toggle(product: ProductRow) {
    const { error } = await supabase.from("products").update({ active: !product.active }).eq("id", product.id);
    if (error) setMessage(error.message); else await load();
  }

  async function importCurrentProducts() {
    setMessage("Importando productos actuales...");
    const rows = PRODUCTS.map((product) => ({
      id: product.id,
      slug: `${product.brand}-${product.name}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      brand: product.brand, name: product.name, category: product.category,
      subtitle: product.subtitle, description: product.description,
      price: product.price, old_price: product.oldPrice ?? null, stock: product.stock,
      badge: product.badge ?? null, images: product.images,
      features: product.features, specs: product.specs, active: true,
    }));
    const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
    if (error) setMessage(`No se pudieron importar: ${error.message}`);
    else { setMessage("Los productos actuales ya se pueden administrar."); await load(); }
  }

  return <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin" className="text-sm font-bold text-emerald-400">← PANEL ADMIN</Link><h1 className="mt-3 text-3xl font-black">Catálogo</h1></div></div>
    {message && <div className="mt-5 rounded-xl border border-white/10 bg-[#111c29] p-4 text-sm">{message}</div>}
    <div className="mt-7 grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-white/10 bg-[#09131e] p-5">
        <h2 className="text-xl font-black">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
        {([['brand','Marca'],['name','Nombre'],['category','Categoría'],['price','Precio'],['stock','Stock disponible'],['image','URL o ruta de imagen']] as const).map(([key,label]) => <label key={key} className="block text-xs font-bold text-slate-400"><span className="mb-1 block">{label}</span><input required={key !== 'image'} type={key === 'price' || key === 'stock' ? 'number' : 'text'} min={key === 'price' || key === 'stock' ? 0 : undefined} value={form[key]} onChange={(e) => setForm({...form,[key]:e.target.value})} placeholder={label} className="w-full rounded-xl border border-white/10 bg-[#111c29] p-3 text-base text-white outline-none focus:border-emerald-400" /></label>)}
        <textarea required value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} placeholder="Descripción" rows={5} className="w-full rounded-xl border border-white/10 bg-[#111c29] p-3 outline-none focus:border-emerald-400" />
        <button className="w-full rounded-xl bg-emerald-500 p-3 font-black text-[#031008]">GUARDAR PRODUCTO</button>
        {editingId && <button type="button" onClick={() => {setEditingId(null);setForm(empty);}} className="w-full rounded-xl border border-white/15 p-3">CANCELAR</button>}
      </form>
      <div className="space-y-3">{products.length === 0 ? <div className="rounded-2xl border border-white/10 bg-[#09131e] p-6 text-slate-400"><p>El catálogo administrable está vacío. Los productos actuales siguen visibles desde el catálogo base.</p><button onClick={importCurrentProducts} className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-black text-[#031008]">IMPORTAR PRODUCTOS ACTUALES</button></div> : products.map((product) => <article key={product.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#09131e] p-5"><div><p className="text-xs font-black text-emerald-400">{product.brand} · {product.category}</p><h2 className="mt-1 text-lg font-black">{product.name}</h2><p className="mt-1 text-sm text-slate-400">${Number(product.price).toLocaleString('es-AR')} · Stock {product.stock} · {product.active ? 'Visible' : 'Oculto'}</p></div><div className="flex gap-2"><button onClick={() => {setEditingId(product.id);setForm({brand:product.brand,name:product.name,category:product.category,price:String(product.price),stock:String(product.stock),description:product.description,image:product.images?.[0] || ''});}} className="rounded-lg border border-white/15 px-3 py-2 text-sm">EDITAR</button><button onClick={() => toggle(product)} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-black text-[#031008]">{product.active ? 'OCULTAR' : 'MOSTRAR'}</button></div></article>)}</div>
    </div>
  </div></main>;
}
