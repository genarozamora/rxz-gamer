"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PRODUCTS } from "@/app/page";
import type { Product } from "@/app/page";
import { supabase } from "@/lib/supabase";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
type Review = { id: string; rating: number; comment: string; created_at: string };

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>(() => PRODUCTS.find((item) => String(item.id) === id));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewOrder, setReviewOrder] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [variantId, setVariantId] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    supabase.from("products").select("id,brand,name,category,subtitle,description,price,old_price,stock,badge,images,features,specs,variants").eq("id", id).eq("active", true).maybeSingle().then(({ data }) => {
      if (!data) return;
      setProduct({ id: Number(data.id), brand: data.brand, name: data.name, category: data.category, subtitle: data.subtitle || "", description: data.description || "", price: Number(data.price), oldPrice: data.old_price ? Number(data.old_price) : undefined, stock: Number(data.stock), badge: data.badge || undefined, images: Array.isArray(data.images) && data.images.length ? data.images as string[] : ["/file.svg"], fallbackImage: Array.isArray(data.images) && data.images[0] ? String(data.images[0]) : "/file.svg", features: Array.isArray(data.features) ? data.features as string[] : [], specs: Array.isArray(data.specs) ? data.specs : [], variants: Array.isArray(data.variants) ? data.variants : undefined });
    });
  }, [id]);

  useEffect(() => {
    setReviewOrder(new URLSearchParams(window.location.search).get("reviewOrder") || "");
    supabase.from("product_reviews").select("id,rating,comment,created_at").eq("product_id", id).eq("approved", true).order("created_at", { ascending: false }).then(({ data }) => setReviews((data || []) as Review[]));
  }, [id]);

  async function sendReview() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !reviewOrder) { setReviewMessage("La reseña debe iniciarse desde un pedido entregado en Mi cuenta."); return; }
    const { error } = await supabase.from("product_reviews").insert({ product_id: id, user_id: user.id, order_id: reviewOrder, rating, comment: comment.trim() });
    if (error) setReviewMessage("No pudimos guardar la reseña. Verificá que el pedido esté entregado y corresponda a este producto.");
    else { setReviewMessage("Gracias. Tu reseña quedó pendiente de aprobación."); setComment(""); }
  }

  if (!product) {
    return <main className="grid min-h-screen place-items-center bg-[#03070c] p-5 text-white"><div className="text-center"><h1 className="text-3xl font-black">Producto no encontrado</h1><Link href="/" className="mt-5 inline-block text-emerald-400">Volver a la tienda</Link></div></main>;
  }

  const selectedVariant = product.variants?.find((variant) => variant.id === variantId) || product.variants?.find((variant) => variant.stock > 0) || product.variants?.[0];
  const included = product.specs.find((spec) => spec.label === "Incluye")?.value;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: product.brand },
    offers: { "@type": "Offer", priceCurrency: "ARS", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold text-emerald-400 no-underline">← VOLVER A PRODUCTOS</Link>
        <div className="mt-7 grid gap-8 rounded-3xl border border-white/10 bg-[#09131e] p-5 shadow-2xl md:grid-cols-2 md:p-9">
          <div>
          <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-white p-6">
            <img src={product.images[imageIndex] || selectedVariant?.image || product.images[0]} alt={`${product.brand} ${product.name} imagen ${imageIndex + 1}`} className="max-h-[420px] max-w-full object-contain" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">{product.images.map((image, index) => <button key={`${image}-${index}`} onClick={() => setImageIndex(index)} className={`h-20 overflow-hidden rounded-xl border bg-white p-1 ${imageIndex === index ? "border-emerald-400" : "border-white/10"}`}><img src={image} alt={`Miniatura ${index + 1} de ${product.name}`} className="h-full w-full object-contain" /></button>)}</div>
          </div>
          <div>
            <p className="text-xs font-black tracking-[.22em] text-emerald-400">{product.brand}</p>
            <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
            <p className="mt-4 leading-7 text-slate-300">{product.description}</p>
            {included && <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-50"><strong className="block text-emerald-400">TODO LO QUE RECIBÍS</strong>{included}</div>}
            {product.variants?.length ? <div className="mt-5"><strong className="text-sm">Color</strong><div className="mt-2 flex flex-wrap gap-2">{product.variants.map((variant) => <button key={variant.id} disabled={variant.stock <= 0} onClick={() => setVariantId(variant.id)} className={`rounded-xl border px-4 py-3 text-left text-sm ${selectedVariant?.id === variant.id ? "border-emerald-400 bg-emerald-400/10" : "border-white/15 bg-[#101c29]"} disabled:opacity-40`}><span className="font-bold">{variant.label}</span><small className="ml-2 text-slate-400">{variant.stock} u.</small></button>)}</div></div> : null}
            <div className="mt-6 text-4xl font-black text-emerald-400">{money(product.price)}</div>
            <p className="mt-2 text-sm text-slate-400">Precio final en pesos argentinos · Transferencia</p>
            <div className={`mt-5 rounded-xl border p-4 text-sm font-bold ${product.stock <= 0 ? "border-red-400/30 bg-red-400/10 text-red-400" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-100"}`}>
              {product.stock <= 0 ? "0 unidades · Producto sin stock" : `${product.stock > 5 ? "Stock disponible" : `Últimas ${product.stock} unidades`} · Envíos nacionales por OCA`}
            </div>
            {product.stock <= 0 ? (
              <button disabled className="mt-6 block w-full cursor-not-allowed rounded-xl bg-slate-700 p-4 text-center font-black text-slate-400">SIN STOCK</button>
            ) : (
              <Link href="/" className="mt-6 block rounded-xl bg-emerald-500 p-4 text-center font-black text-[#031008] no-underline">AGREGAR DESDE LA TIENDA</Link>
            )}
            <Link href="/ayuda" className="mt-3 block rounded-xl border border-white/15 p-4 text-center font-bold text-white no-underline">CONSULTAR A SOPORTE</Link>
          </div>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#09131e] p-6"><h2 className="text-xl font-black">Características</h2><ul className="mt-5 space-y-3 text-slate-300">{product.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></section>
          <section className="rounded-2xl border border-white/10 bg-[#09131e] p-6"><h2 className="text-xl font-black">Especificaciones</h2><dl className="mt-5 divide-y divide-white/10">{product.specs.map((spec) => <div key={spec.label} className="flex justify-between gap-5 py-3"><dt className="text-slate-400">{spec.label}</dt><dd className="text-right font-bold">{spec.value}</dd></div>)}</dl></section>
        </div>
        <section className="mt-7 rounded-2xl border border-white/10 bg-[#09131e] p-6">
          <h2 className="text-xl font-black">Opiniones verificadas</h2>
          {reviews.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="rounded-xl border border-white/10 bg-[#101c29] p-4"><div className="text-amber-300">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</div><p className="mt-3 leading-6 text-slate-300">{review.comment}</p><small className="mt-3 block text-slate-500">Compra verificada · {new Date(review.created_at).toLocaleDateString("es-AR")}</small></article>)}</div> : <p className="mt-4 text-slate-400">Este producto todavía no tiene opiniones verificadas.</p>}
          {reviewOrder && <div className="mt-7 border-t border-white/10 pt-6"><h3 className="font-black">Contá tu experiencia</h3><select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-4 rounded-xl border border-white/10 bg-[#101c29] p-3">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}</select><textarea value={comment} onChange={(event) => setComment(event.target.value)} minLength={5} maxLength={1500} rows={4} placeholder="¿Cómo fue tu experiencia con el producto?" className="mt-3 block w-full rounded-xl border border-white/10 bg-[#101c29] p-4 outline-none focus:border-emerald-400" /><button disabled={comment.trim().length < 5} onClick={sendReview} className="mt-3 rounded-xl bg-emerald-500 px-5 py-3 font-black text-[#031008] disabled:opacity-40">ENVIAR RESEÑA</button></div>}
          {reviewMessage && <p className="mt-4 text-sm text-emerald-300">{reviewMessage}</p>}
        </section>
      </div>
    </main>
  );
}
