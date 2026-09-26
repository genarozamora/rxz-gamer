"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS } from "@/app/page";
import type { Product } from "@/app/page";
import { supabase } from "@/lib/supabase";
import { getPackagePreview } from "@/lib/package-preview";
import { mergeVerifiedProduct } from "@/lib/verified-product";
import { trackMetaEvent } from "@/lib/meta-pixel";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
type Review = { id: string; rating: number; comment: string; created_at: string };

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | undefined>();
  const [catalogResult, setCatalogResult] = useState<{ id: string; error: boolean } | null>(null);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewOrder] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("reviewOrder") || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [variantId, setVariantId] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [cartMessage, setCartMessage] = useState("");
  const trackedProductId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.from("products").select("id,brand,name,category,subtitle,description,price,old_price,stock,badge,images,features,specs,variants").eq("id", id).eq("active", true).maybeSingle().then(({ data, error }) => {
      if (cancelled) return;
      const curated = data ? PRODUCTS.find((item) => item.id === Number(data.id)) : undefined;
      setProduct(data && !error ? mergeVerifiedProduct(data, curated) : undefined);
      setCatalogResult({ id, error: Boolean(error) });
    });
    return () => { cancelled = true; };
  }, [id, catalogAttempt]);

  useEffect(() => {
    supabase.from("product_reviews").select("id,rating,comment,created_at").eq("product_id", id).eq("approved", true).order("created_at", { ascending: false }).then(({ data }) => setReviews((data || []) as Review[]));
  }, [id]);

  useEffect(() => {
    if (!product || catalogResult?.id !== id || trackedProductId.current === product.id) return;
    trackedProductId.current = product.id;
    trackMetaEvent("ViewContent", {
      content_ids: [String(product.id)],
      content_name: `${product.brand} ${product.name}`,
      content_type: "product",
      currency: "ARS",
      value: product.price,
    });
  }, [product, catalogResult, id]);

  async function sendReview() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !reviewOrder) { setReviewMessage("La reseña debe iniciarse desde un pedido entregado en Mi cuenta."); return; }
    const { error } = await supabase.from("product_reviews").insert({ product_id: id, user_id: user.id, order_id: reviewOrder, rating, comment: comment.trim() });
    if (error) setReviewMessage("No pudimos guardar la reseña. Verificá que el pedido esté entregado y corresponda a este producto.");
    else { setReviewMessage("Gracias. Tu reseña quedó pendiente de aprobación."); setComment(""); }
  }

  function addToCart() {
    if (!product) return;
    const variant = product.variants?.find((item) => item.id === variantId);
    if (product.variants?.length && !variant) {
      setCartMessage("Elegí un color antes de agregar el producto.");
      return;
    }

    const availableStock = variant?.stock ?? product.stock;
    if (availableStock <= 0) {
      setCartMessage("Esta variante no tiene stock disponible.");
      return;
    }

    const cartKey = `${product.id}:${variant?.id || "default"}`;
    try {
      const parsed = JSON.parse(localStorage.getItem("rxz-cart") || "[]") as Array<Product & { quantity: number; cartKey: string; variantId?: string; variantLabel?: string; variantStock?: number }>;
      const cart = Array.isArray(parsed) ? parsed : [];
      const existing = cart.find((item) => item.cartKey === cartKey);
      if (existing && existing.quantity >= availableStock) {
        setCartMessage("Ya alcanzaste el stock disponible de esta variante.");
        return;
      }
      const nextCart = existing
        ? cart.map((item) => item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item)
        : [...cart, {
            ...product,
            quantity: 1,
            cartKey,
            variantId: variant?.id,
            variantLabel: variant?.label,
            variantStock: availableStock,
            images: variant ? [variant.image, ...product.images.filter((image) => image !== variant.image)] : product.images,
          }];
      localStorage.setItem("rxz-cart", JSON.stringify(nextCart));
      trackMetaEvent("AddToCart", {
        content_ids: [String(product.id)],
        content_name: `${product.brand} ${product.name}`,
        content_type: "product",
        currency: "ARS",
        value: product.price,
      });
      router.push("/?cart=open");
    } catch {
      setCartMessage("No pudimos actualizar el carrito. Intentá nuevamente.");
    }
  }

  async function shareProduct() {
    if (!product) return;
    const url = window.location.href.split("?")[0];
    const payload = { title: `${product.brand} ${product.name}`, text: `${product.brand} ${product.name} en RXZ Gamer`, url };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(url);
        setCartMessage("Enlace del producto copiado.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setCartMessage("No pudimos compartir el producto.");
    }
  }

  if (catalogResult?.id !== id) {
    return <main className="grid min-h-screen place-items-center bg-[#03070c] p-5 text-white"><p role="status">Consultando precio y disponibilidad…</p></main>;
  }

  if (catalogResult.error) {
    return <main className="grid min-h-screen place-items-center bg-[#03070c] p-5 text-white"><div className="text-center"><h1 className="text-2xl font-black">No pudimos cargar el producto</h1><p className="mt-3 text-slate-300">Reintentá para consultar su precio y disponibilidad.</p><button onClick={() => { setCatalogResult(null); setCatalogAttempt((attempt) => attempt + 1); }} className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-black text-[#031008]">REINTENTAR</button><Link href="/#productos" className="mt-5 block text-emerald-400">Volver al catálogo</Link></div></main>;
  }

  if (!product) {
    return <main className="grid min-h-screen place-items-center bg-[#03070c] p-5 text-white"><div className="text-center"><h1 className="text-3xl font-black">Producto no encontrado</h1><Link href="/" className="mt-5 inline-block text-emerald-400">Volver a la tienda</Link></div></main>;
  }

  const selectedVariant = product.variants?.find((variant) => variant.id === variantId);
  const included = product.specs.find((spec) => spec.label === "Incluye")?.value;
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${product.brand} ${product.name} en RXZ Gamer: https://rxzgamer.com.ar/productos/${product.id}`)}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    description: product.description,
    image: product.images.map((image) => new URL(image, "https://rxzgamer.com.ar").toString()),
    url: `https://rxzgamer.com.ar/productos/${product.id}`,
    sku: `RXZ-${product.id}`,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `https://rxzgamer.com.ar/productos/${product.id}`,
      seller: { "@type": "Organization", name: "RXZ Gamer" },
    },
  };
  const packagePreview = getPackagePreview(product);

  return (
    <main className="min-h-screen bg-[#03070c] px-5 py-10 text-white">
      <Link href="/" className="fixed left-3 top-3 z-50 rounded-xl border border-emerald-400/40 bg-[#030a10]/95 px-4 py-3 text-xs font-black tracking-wide text-emerald-300 no-underline shadow-2xl backdrop-blur hover:border-emerald-400 hover:text-white sm:left-5 sm:top-5">
        ← VOLVER AL MENÚ
      </Link>
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
            <div className={`relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-white p-6 ${imageIndex === 0 && packagePreview ? "pb-32" : ""}`}>
              <img src={product.images[imageIndex] || selectedVariant?.image || product.images[0]} alt={`${product.brand} ${product.name} imagen ${imageIndex + 1}`} className="max-h-[420px] max-w-full object-contain" onError={(event) => { if (event.currentTarget.getAttribute("src") !== product.fallbackImage) event.currentTarget.src = product.fallbackImage; }} />
              {imageIndex === 0 && packagePreview && <div className="absolute inset-x-4 bottom-4 grid grid-cols-[96px_1fr] items-center gap-3 rounded-xl border border-emerald-400/60 bg-[#03080eef] p-2 text-left shadow-2xl"><img src={packagePreview.image} alt={packagePreview.alt} className="h-20 w-24 rounded-lg bg-white object-cover" /><span className="text-xs leading-5 text-slate-200"><b className="block text-emerald-400">TODO LO QUE INCLUYE</b>{packagePreview.caption}</span></div>}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">{product.images.map((image, index) => <button key={`${image}-${index}`} onClick={() => setImageIndex(index)} aria-label={`Ver imagen ${index + 1} de ${product.name}`} aria-pressed={imageIndex === index} className={`h-20 overflow-hidden rounded-xl border bg-white p-1 ${imageIndex === index ? "border-emerald-400" : "border-white/10"}`}><img src={image} alt={`Miniatura ${index + 1} de ${product.name}`} className="h-full w-full object-contain" /></button>)}</div>
          </div>
          <div>
            <p className="text-xs font-black tracking-[.22em] text-emerald-400">{product.brand}</p>
            <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
            <p className="mt-4 leading-7 text-slate-300">{product.description}</p>
            {included && <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-50"><strong className="block text-emerald-400">TODO LO QUE RECIBÍS</strong>{included}</div>}
            {product.variants?.length ? <div className="mt-5"><strong className="text-sm">Color</strong><div className="mt-2 flex flex-wrap gap-2">{product.variants.map((variant) => <button key={variant.id} disabled={variant.stock <= 0} aria-pressed={selectedVariant?.id === variant.id} onClick={() => { setVariantId(variant.id); const index = product.images.indexOf(variant.image); if (index >= 0) setImageIndex(index); }} className={`flex min-w-40 items-center gap-3 rounded-xl border p-2 pr-4 text-left text-sm ${selectedVariant?.id === variant.id ? "border-emerald-400 bg-emerald-400/10" : "border-white/15 bg-[#101c29]"} disabled:opacity-40`}><span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1"><img src={variant.image} alt={`Vista previa ${product.name} ${variant.label}`} className="h-full w-full object-contain" /></span><span><span className="block font-bold">{variant.label}</span><small className="text-slate-400">{variant.stock} u.</small></span></button>)}</div></div> : null}
            {product.oldPrice && product.oldPrice > product.price && <div className="mt-6 flex items-center gap-3"><span className="text-lg text-slate-500 line-through">{money(product.oldPrice)}</span><span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black text-red-300">AHORRÁS {discount}%</span></div>}
            <div className={product.oldPrice && product.oldPrice > product.price ? "mt-1 text-4xl font-black text-emerald-400" : "mt-6 text-4xl font-black text-emerald-400"}>{money(product.price)}</div>
            <p className="mt-2 text-sm text-slate-400">Precio final en pesos argentinos · Transferencia</p>
            <div className={`mt-5 rounded-xl border p-4 text-sm font-bold ${product.stock <= 0 ? "border-red-400/30 bg-red-400/10 text-red-400" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-100"}`}>
              {product.stock <= 0 ? "0 unidades · Producto sin stock" : "En stock · Entrega inmediata · Envíos a todo el país"}
            </div>
            {cartMessage && <p role="alert" className="mt-4 text-sm font-bold text-amber-300">{cartMessage}</p>}
            {product.stock <= 0 ? (
              <button disabled className="mt-6 block w-full cursor-not-allowed rounded-xl bg-slate-700 p-4 text-center font-black text-slate-400">SIN STOCK</button>
            ) : (
              <button onClick={addToCart} disabled={Boolean(product.variants?.length && !selectedVariant)} className="mt-6 block w-full rounded-xl bg-emerald-500 p-4 text-center font-black text-[#031008] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
                {product.variants?.length && !selectedVariant ? "ELEGÍ UN COLOR" : "AGREGAR AL CARRITO"}
              </button>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => void shareProduct()} className="rounded-xl border border-white/15 p-3 text-sm font-bold text-white">↗ COMPARTIR</button>
              <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-center text-sm font-bold text-emerald-300 no-underline">WHATSAPP</a>
            </div>
            <Link href="/ayuda" className="mt-3 block rounded-xl border border-white/15 p-4 text-center font-bold text-white no-underline">CONSULTAR A SOPORTE</Link>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-300">
              <span className="rounded-xl border border-white/10 bg-[#06101a] p-3">✓ Stock real</span>
              <span className="rounded-xl border border-white/10 bg-[#06101a] p-3">✓ Compra protegida</span>
              <span className="rounded-xl border border-white/10 bg-[#06101a] p-3">✓ Envío con seguimiento</span>
            </div>
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
