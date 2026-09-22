"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getPackagePreview } from "@/lib/package-preview";
import { mergeVerifiedProduct } from "@/lib/verified-product";
import { trackMetaEvent } from "@/lib/meta-pixel";

type Spec = {
  label: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  color: string;
  stock: number;
  image: string;
};

export type Product = {
  id: number;
  brand: string;
  name: string;
  category: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  images: string[];
  fallbackImage: string;
  stock: number;
  description: string;
  features: string[];
  specs: Spec[];
  variants?: ProductVariant[];
};

type CartItem = Product & {
  quantity: number;
  cartKey: string;
  variantId?: string;
  variantLabel?: string;
  variantStock?: number;
};


const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    brand: "ATTACK SHARK",
    name: "X3 Pro 8K Wireless Gaming Mouse",
    category: "Mouse",
    subtitle: "PAW3395 • 26.000 DPI • Hasta 8K",
    price: 89990,
    oldPrice: 109990,
    badge: "BEST SELLER",
    images: [
      "/attack-shark-x3-white-receiver.webp",
      "/attack-shark-x3-black-receiver.webp",
      "/attack-shark-x3-colors.webp",
      "/attack-shark-x3-pro-white-real.jpg",
      "/attack-shark-x3-pro-black-real.jpg",
    ],
    fallbackImage: "/attack-shark-x3-white-receiver.webp",
    stock: 3,
    variants: [
      { id: "black", label: "Negro", color: "#17191d", stock: 1, image: "/attack-shark-x3-black-receiver.webp" },
      { id: "white", label: "Blanco", color: "#f4f4f3", stock: 2, image: "/attack-shark-x3-white-receiver.webp" },
    ],
    description:
      "Mouse gamer Attack Shark X3 Pro 8K con sensor PixArt PAW3395, hasta 26.000 DPI, conexión triple y polling de hasta 8000 Hz.",
    features: [
      "Sensor PixArt PAW3395",
      "Hasta 26.000 DPI programables",
      "Polling rate de hasta 8000 Hz",
      "Bluetooth 5.4",
      "Conexión inalámbrica 2.4 GHz y cable USB-C",
      "Batería recargable y software de configuración",
    ],
    specs: [
      { label: "Modelo", value: "X3 Pro (PAW3395)" },
      { label: "Sensor", value: "PixArt PAW3395" },
      { label: "DPI máximo", value: "26.000 DPI" },
      { label: "Polling rate", value: "Hasta 8000 Hz" },
      { label: "Conectividad", value: "Bluetooth 5.4 / 2.4 GHz / USB-C" },
      { label: "Batería", value: "Recargable" },
      { label: "Incluye", value: "Mouse, receptor inalámbrico 8K, cable USB-C y manual" },
    ],
  },
  {
    id: 2,
    brand: "MCHOSE",
    name: "Ace 60 Pro",
    category: "Teclados",
    subtitle: "Hall Effect • Rapid Trigger • 8000 Hz",
    price: 89990,
    oldPrice: 109990,
    badge: "ESPORTS",
    images: [
      "/mchose-ace60-pro.webp",
      "/mchose-ace60-pro-2.jpg",
      "/mchose-ace60-pro-3.jpg",
      "/mchose-ace60-pro-4.jpg",
    ],
    fallbackImage: "/mchose-ace60-pro.webp",
    stock: 5,
    description:
      "Teclado gamer 60% con switches magnéticos Hall Effect, Rapid Trigger y una plataforma de alto rendimiento orientada a esports.",
    features: [
      "Formato compacto 60%",
      "Switches magnéticos Hall Effect hot-swap",
      "Rapid Trigger de alta precisión",
      "Polling rate de hasta 8000 Hz",
      "Latencia declarada de 0,1 ms",
      "Actuación configurable",
      "RGB orientado al norte",
      "Memoria interna",
      "Software M HUB web y desktop",
    ],
    specs: [
      { label: "Modelo", value: "Ace 60 Pro" },
      { label: "Layout", value: "60%" },
      { label: "Cantidad de teclas", value: "61" },
      { label: "Tecnología", value: "Hall Effect magnético" },
      { label: "Precisión", value: "0,01 mm" },
      { label: "Rango Rapid Trigger", value: "0,01 – 3,4 mm" },
      { label: "Rango de actuación", value: "0,1 – 3,4 mm" },
      { label: "Polling rate", value: "Hasta 8000 Hz" },
      { label: "Latencia declarada", value: "0,1 ms" },
      { label: "Scan rate", value: "128K" },
      { label: "Conectividad", value: "USB-C cableado" },
      { label: "RGB", value: "North-facing RGB" },
      { label: "Memoria interna", value: "Sí" },
      { label: "Software", value: "M HUB Web / Desktop" },
      { label: "Dimensiones", value: "290 × 100 × 28 mm" },
    ],
  },
  {
    id: 3,
    brand: "GAMESIR",
    name: "Nova 2 Lite Wireless Gaming Controller",
    category: "Controles",
    subtitle: "Hall Effect • 1000 Hz • Multiplataforma",
    price: 89990,
    oldPrice: 109990,
    badge: "MULTIPLATAFORMA",
    images: [
      "/gamesir-nova2-lite.png",
      "/gamesir-nova2-lite-2.jpg",
      "/gamesir-nova2-lite-3.jpg",
      "/gamesir-nova2-lite-angle-4.jpg",
    ],
    fallbackImage: "/gamesir-nova2-lite.png",
    stock: 2,
    variants: [
      { id: "midnight-gray", label: "Negro (Midnight Gray)", color: "#30343b", stock: 1, image: "/gamesir-nova2-lite.png" },
      { id: "luminous-white", label: "Blanco (Luminous White)", color: "#f2f3f4", stock: 1, image: "/gamesir-nova2-lite-3.jpg" },
    ],
    description:
      "Control inalámbrico multiplataforma con sticks y gatillos Hall Effect, polling de alta velocidad y botones traseros configurables.",
    features: [
      "Sticks Hall Effect anti-drift",
      "Gatillos Hall Effect con trigger stops",
      "Polling rate de hasta 1000 Hz por cable y dongle 2.4 GHz",
      "D-pad mecánico circular",
      "2 botones traseros remapeables",
      "Doble motor de vibración asimétrica",
      "Turbo",
      "Configuración mediante GameSir Connect",
      "Bluetooth, dongle 2.4 GHz y USB-C",
      "Combo RXZ: base de carga RGB y receptor USB incluidos",
    ],
    specs: [
      { label: "Modelo", value: "GameSir Nova 2 Lite" },
      { label: "Conectividad", value: "Bluetooth / 2.4 GHz / USB-C" },
      { label: "Plataformas", value: "PC / Steam / Android / iOS / Switch" },
      { label: "Joysticks", value: "Hall Effect" },
      { label: "Gatillos", value: "Hall Effect con 2 posiciones" },
      { label: "D-pad", value: "Mecánico circular" },
      { label: "Botones traseros", value: "2 remapeables" },
      { label: "Polling cable", value: "Hasta 1000 Hz" },
      { label: "Polling 2.4 GHz", value: "Hasta 1000 Hz" },
      { label: "Vibración", value: "2 motores asimétricos" },
      { label: "Batería", value: "600 mAh" },
      { label: "Software", value: "GameSir Connect" },
      { label: "Incluye", value: "Combo RXZ: control, base de carga RGB, receptor USB 2.4 GHz, cable USB-C y manual" },
    ],
  },

  {
    id: 4,
    brand: "GAMEGAGA",
    name: "CM-619 Wireless Game Controller",
    category: "Controles",
    subtitle: "RGB • Bluetooth • Multiplataforma",
    price: 49990,
    oldPrice: 62990,
    badge: "NUEVO",
    images: [
      "/cm-619-alibaba-1.jpg",
      "/cm-619-alibaba-2.jpg",
      "/cm-619-alibaba-3.jpg",
    ],
    fallbackImage: "/cm-619-alibaba-1.jpg",
    stock: 100,
    description:
      "Control inalámbrico multiplataforma con iluminación RGB, vibración y batería recargable. Pensado para Nintendo Switch, PC y dispositivos móviles.",
    features: [
      "Conexión inalámbrica Bluetooth",
      "Compatibilidad con Nintendo Switch, PC, Android e iOS",
      "Iluminación RGB",
      "Vibración integrada",
      "Batería recargable de 600 mAh",
      "Autonomía declarada superior a 10 horas",
      "Carga mediante USB-C",
      "Diseño ergonómico para sesiones prolongadas",
    ],
    specs: [
      { label: "Modelo", value: "CM-619 / 2412-K12" },
      { label: "Tipo", value: "Gamepad inalámbrico" },
      { label: "Conectividad", value: "Bluetooth / USB-C" },
      { label: "Compatibilidad", value: "Nintendo Switch / PC / Android / iOS" },
      { label: "Iluminación", value: "RGB" },
      { label: "Vibración", value: "Sí" },
      { label: "Batería", value: "600 mAh" },
      { label: "Autonomía declarada", value: "Más de 10 horas" },
      { label: "Alcance Bluetooth", value: "Hasta 10 m aprox." },
      { label: "Carga", value: "USB-C" },
    ],
  },
  {
    id: 5,
    brand: "ATTACK SHARK",
    name: "X11 Wireless Gaming Mouse",
    category: "Mouse",
    subtitle: "PAW3311 • 22.000 DPI • Dock RGB",
    price: 44990,
    oldPrice: 54990,
    badge: "NUEVO",
    images: [
      "/attack-shark-x11-alibaba-1.jpg",
      "/attack-shark-x11-alibaba-2.jpg",
      "/attack-shark-x11-alibaba-3.jpg",
    ],
    fallbackImage: "/attack-shark-x11-alibaba-1.jpg",
    stock: 100,
    description:
      "Mouse gamer inalámbrico tri-mode con sensor PixArt PAW3311 y base magnética de carga RGB, pensado para gaming y uso diario.",
    features: [
      "Sensor PixArt PAW3311",
      "Hasta 22.000 DPI",
      "Polling rate de hasta 1000 Hz",
      "Conexión Bluetooth 5.2, 2.4 GHz y USB-C",
      "Base magnética de carga con iluminación RGB",
      "Peso aproximado de 63 g",
      "Switches HUANO de hasta 20 millones de clics",
      "Patines de PTFE",
      "Software y configurador web",
    ],
    specs: [
      { label: "Modelo", value: "X11" },
      { label: "Sensor", value: "PixArt PAW3311" },
      { label: "DPI máximo", value: "22.000 DPI" },
      { label: "Polling rate", value: "125–1000 Hz" },
      { label: "Velocidad máxima", value: "400 IPS" },
      { label: "Aceleración máxima", value: "40 G" },
      { label: "Peso", value: "63 g ± 3 g" },
      { label: "Conectividad", value: "Bluetooth 5.2 / 2.4 GHz / USB-C" },
      { label: "Batería", value: "300 mAh" },
      { label: "Dock", value: "Magnético con RGB" },
      { label: "Switches", value: "HUANO" },
      { label: "Durabilidad", value: "Hasta 20 millones de clics" },
      { label: "Dimensiones", value: "128 × 64 × 40 mm" },
      { label: "Pies", value: "PTFE" },
    ],
  },
  {
    id: 6,
    brand: "AULA",
    name: "F75 HE Magnetic Gaming Keyboard",
    category: "Teclados",
    subtitle: "Hall Effect • Rapid Trigger • 8000 Hz",
    price: 299990,
    oldPrice: 349990,
    badge: "HALL EFFECT",
    images: [
      "/aula-f75-he-black-contour-official.jpg",
      "/aula-f75-he-gradient-gray-official.jpg",
      "/aula-f75-he-alibaba-2.jpg",
      "/aula-f75-he-alibaba-3.jpg",
    ],
    fallbackImage: "/aula-f75-he-black-contour-official.jpg",
    stock: 4,
    variants: [
      { id: "black-contour", label: "Black Contour", color: "#14181d", stock: 3, image: "/aula-f75-he-black-contour-official.jpg" },
      { id: "gradient-gray", label: "Gradient Gray", color: "#9ca3af", stock: 1, image: "/aula-f75-he-gradient-gray-official.jpg" },
    ],
    description:
      "Teclado gamer 75% con switches magnéticos Hall Effect, Rapid Trigger, actuación configurable y conectividad tri-mode.",
    features: [
      "Formato compacto 75% con 80 teclas",
      "Switches magnéticos Hall Effect",
      "Rapid Trigger con actuación configurable",
      "Polling rate de hasta 8000 Hz por cable",
      "Conectividad 2.4 GHz, Bluetooth y USB-C",
      "Batería recargable de 4000 mAh",
      "Iluminación RGB",
      "Perilla multifunción",
      "Hot-swap para switches magnéticos compatibles",
    ],
    specs: [
      { label: "Modelo", value: "AULA F75 HE" },
      { label: "Formato", value: "75%" },
      { label: "Cantidad de teclas", value: "80" },
      { label: "Tecnología", value: "Hall Effect magnético" },
      { label: "Rapid Trigger", value: "Sí" },
      { label: "Actuación", value: "Configurable" },
      { label: "Polling rate cableado", value: "Hasta 8000 Hz" },
      { label: "Polling rate 2.4 GHz", value: "Hasta 1000 Hz" },
      { label: "Polling rate Bluetooth", value: "Hasta 125 Hz" },
      { label: "Conectividad", value: "2.4 GHz / Bluetooth / USB-C" },
      { label: "Batería", value: "4000 mAh" },
      { label: "Autonomía declarada", value: "Aprox. 23 h con iluminación predeterminada / 40 h con luces apagadas (manual AULA)" },
      { label: "RGB", value: "Sí" },
      { label: "Perilla", value: "Multifunción" },
      { label: "Hot-swap", value: "Switches magnéticos compatibles" },
      { label: "Incluye", value: "Teclado, receptor USB 2.4 GHz, cable USB-C, extractor y manual" },
    ],
  },
  {
    id: 7,
    brand: "EASYSMX",
    name: "D10 Wireless Gaming Controller",
    category: "Controles",
    subtitle: "TMR • 1000 Hz • Gatillos Hall Effect",
    price: 109990,
    oldPrice: 129990,
    badge: "COMBO COMPLETO",
    images: [
      "/easysmx-d10-official-4.jpg",
      "/easysmx-d10-official-1.png",
      "/easysmx-d10-official-2.jpg",
      "/easysmx-d10-official-3.jpg",
      "/easysmx-d10-trigger.webp",
      "/easysmx-d10-compatibility.webp",
    ],
    fallbackImage: "/easysmx-d10-official-1.png",
    stock: 1,
    variants: [
      { id: "space-black", label: "Negro (Space Black)", color: "#101216", stock: 1, image: "/easysmx-d10-official-1.png" },
    ],
    description: "Control inalámbrico multiplataforma con sticks TMR de alta precisión, gatillos de doble modo, botones mecánicos y base inteligente de carga. El combo incluye receptor USB 2.4 GHz.",
    features: [
      "Sticks TMR anti-drift de alta precisión",
      "Polling rate de 1000 Hz por cable y 2.4 GHz",
      "Gatillos Hall Effect con bloqueo de recorrido y modo microswitch",
      "D-pad EasyPos de 8 direcciones y botones mecánicos",
      "2 botones traseros programables",
      "Vibración regulable en 4 niveles y RGB personalizable",
      "Giroscopio de 6 ejes en Nintendo Switch",
      "Base de carga inteligente con reconexión automática",
      "Receptor USB 2.4 GHz incluido",
    ],
    specs: [
      { label: "Modelo", value: "EasySMX D10" },
      { label: "Plataformas", value: "PC / Steam Deck / Switch / Android / iOS" },
      { label: "Conectividad", value: "2.4 GHz / Bluetooth / USB-C" },
      { label: "Joysticks", value: "TMR" },
      { label: "Gatillos", value: "Hall Effect + microswitch con bloqueo de 2 posiciones" },
      { label: "Polling rate", value: "Hasta 1000 Hz por cable y receptor 2.4 GHz" },
      { label: "Botones", value: "Mecánicos + 2 traseros programables" },
      { label: "Batería", value: "1000 mAh" },
      { label: "Carga", value: "Base inteligente / USB-C" },
      { label: "Peso", value: "256 g" },
      { label: "Dimensiones", value: "156 × 103 × 63,6 mm" },
      { label: "Incluye", value: "Control, base de carga, receptor USB 2.4 GHz, cable USB-C y manual" },
    ],
  },

];

// Catálogo actual: solo los productos confirmados por RXZ Gamer.
export const PRODUCTS: Product[] = ALL_PRODUCTS.filter((product) => [1, 3, 6, 7].includes(product.id));

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function SafeImage({
  src,
  fallback,
  alt,
  className,
}: {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        const img = event.currentTarget;
        if (!img.src.endsWith(fallback)) img.src = fallback;
      }}
    />
  );
}

export default function Home() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("featured");
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem("rxz-cart");
        if (saved) {
          const parsed = JSON.parse(saved) as CartItem[];
          setCart(parsed.map((item) => ({ ...item, cartKey: item.cartKey || String(item.id) })));
        }
        const savedFavorites = localStorage.getItem("rxz-favorites");
        const savedRecent = localStorage.getItem("rxz-recent");
        if (savedFavorites) setFavoriteIds(JSON.parse(savedFavorites));
        if (savedRecent) setRecentIds(JSON.parse(savedRecent));
        if (new URLSearchParams(window.location.search).get("cart") === "open") setCartOpen(true);
      } catch {}
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    supabase.from("products").select("id,brand,name,category,subtitle,description,price,old_price,stock,badge,images,features,specs,variants,active").then(({ data }) => {
      if (!data?.length) return;
      const managed = data.filter((row) => row.active).map((row) => {
        const id = Number(row.id);
        const staticProduct = PRODUCTS.find((product) =>
          product.brand.toLowerCase() === String(row.brand).trim().toLowerCase()
          && product.name.toLowerCase() === String(row.name).trim().toLowerCase()
        ) || PRODUCTS.find((product) => product.id === id);
        return mergeVerifiedProduct(row, staticProduct);
      });
      setCatalogProducts(managed);
    });
  }, []);

  useEffect(() => {
    async function syncUser(user: User | null) {
      setUserEmail(user?.email ?? null);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(profile?.role === "admin");
    }

    supabase.auth.getUser().then(({ data }) => {
      void syncUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("rxz-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem("rxz-favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem("rxz-recent", JSON.stringify(recentIds));
  }, [recentIds, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const params = new URLSearchParams(window.location.search);
    const campaign = Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
        .map((key) => [key, params.get(key)?.slice(0, 120) || ""])
        .filter(([, value]) => value)
    );
    if (!Object.keys(campaign).length) return;
    localStorage.setItem("rxz-campaign", JSON.stringify({ ...campaign, captured_at: new Date().toISOString() }));
    const visitKey = `rxz-campaign-visit:${window.location.search}`;
    if (sessionStorage.getItem(visitKey)) return;
    sessionStorage.setItem(visitKey, "1");
    void supabase.from("store_events").insert({ event_name: "campaign_visit", product_id: null, metadata: campaign });
  }, [loaded]);

  useEffect(() => {
    if (!selected && !cartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected, cartOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedVariant = selected?.variants?.find((variant) => variant.id === selectedVariantId);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(catalogProducts.map((p) => p.category))), "Favoritos"],
    [catalogProducts]
  );

  const filtered = useMemo(() => {
    const matches = catalogProducts.filter((p) => {
      const categoryOK = category === "Todos"
        || (category === "Favoritos" ? favoriteIds.includes(p.id) : p.category === category);
      const text = `${p.brand} ${p.name} ${p.subtitle}`.toLowerCase();
      return categoryOK && text.includes(search.toLowerCase());
    });
    return [...matches].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "es");
      return 0;
    });
  }, [search, category, sort, catalogProducts, favoriteIds]);

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);
  const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  const recentProducts = recentIds
    .map((id) => catalogProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const selectedPackagePreview = selected ? getPackagePreview(selected) : null;
  const catalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catálogo de RXZ Gamer",
    numberOfItems: catalogProducts.length,
    itemListElement: catalogProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: `${product.brand} ${product.name}`,
        description: product.description,
        image: product.images.map((image) => `https://rxz-gamer-tflb.vercel.app${image}`),
        brand: { "@type": "Brand", name: product.brand },
        sku: `RXZ-${product.id}`,
        url: `https://rxz-gamer-tflb.vercel.app/productos/${product.id}`,
        offers: {
          "@type": "Offer",
          priceCurrency: "ARS",
          price: product.price,
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: `https://rxz-gamer-tflb.vercel.app/productos/${product.id}`,
        },
      },
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ["¿Los productos están disponibles para entrega inmediata?", "Sí. Los productos publicados como En stock están disponibles. El stock se descuenta al confirmar cada pedido."],
      ["¿Cómo se calcula el envío?", "Enviamos mediante OCA desde Villa Allende, Córdoba. El costo y el plazo se confirman según el código postal antes del despacho."],
      ["¿Cuándo veo los datos para pagar?", "El alias se muestra únicamente después de confirmar el pedido. Luego podés adjuntar el comprobante desde tu cuenta."],
      ["¿Puedo elegir el color?", "Sí. Antes de agregar un producto al carrito tenés que abrir su ficha y seleccionar una variante con stock."],
    ].map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };

  function track(eventName: string, productId?: number) {
    let campaign: Record<string, string> | null = null;
    try {
      const saved = localStorage.getItem("rxz-campaign");
      campaign = saved ? JSON.parse(saved) as Record<string, string> : null;
    } catch {}
    void supabase.from("store_events").insert({
      event_name: eventName,
      product_id: productId ? String(productId) : null,
      metadata: campaign ? { campaign } : {},
    });
  }

  function openProduct(product: Product) {
    setSelectedImage(0);
    setSelectedVariantId("");
    setSelected(product);
    setRecentIds((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 4));
    track("product_view", product.id);
  }

  function toggleFavorite(productId: number) {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [productId, ...current]
    );
    setToast(favoriteIds.includes(productId) ? "Producto quitado de favoritos" : "Producto guardado en favoritos");
  }

  async function shareProduct(product: Product) {
    const url = `${window.location.origin}/productos/${product.id}?utm_source=share&utm_medium=organic&utm_campaign=product_recommendation`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.brand} ${product.name}`, text: product.subtitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Enlace del producto copiado");
      }
      track("share_product", product.id);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setToast("No se pudo compartir el producto");
    }
  }

  async function shareStore() {
    const url = `${window.location.origin}/?utm_source=share&utm_medium=organic&utm_campaign=store_recommendation`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "RXZ Gamer", text: "Periféricos gamer con stock y entrega inmediata.", url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Enlace de la tienda copiado");
      }
      track("share_store");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setToast("No se pudo compartir la tienda");
    }
  }

  async function copyStoreLink() {
    const url = `${window.location.origin}/?utm_source=copy_link&utm_medium=organic&utm_campaign=store_recommendation`;
    try {
      await navigator.clipboard.writeText(url);
      track("copy_store_link");
      setToast("Enlace de la tienda copiado");
    } catch {
      setToast("No se pudo copiar el enlace");
    }
  }

  function buyNow(product: Product, variantId?: string) {
    add(product, variantId);
    const variant = product.variants?.find((item) => item.id === variantId);
    if ((!product.variants?.length || variant) && (variant?.stock ?? product.stock) > 0) {
      setSelected(null);
      setCartOpen(true);
    }
  }

  function add(product: Product, variantId?: string) {
    if (product.variants?.length && !variantId) {
      openProduct(product);
      setToast("Elegí un color antes de agregarlo.");
      return;
    }

    const variant = product.variants?.find((item) => item.id === variantId);
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock <= 0) {
      setToast("Este producto no tiene stock disponible.");
      return;
    }

    const cartKey = `${product.id}:${variant?.id || "default"}`;
    const existing = cart.find((p) => p.cartKey === cartKey);

    if (existing && existing.quantity >= availableStock) {
      setToast("Alcanzaste el stock disponible.");
      return;
    }

    setCart((current) => {
      const item = current.find((p) => p.cartKey === cartKey);
      if (item) {
        return current.map((p) =>
          p.cartKey === cartKey ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...current, {
        ...product,
        quantity: 1,
        cartKey,
        variantId: variant?.id,
        variantLabel: variant?.label,
        variantStock: availableStock,
        images: variant ? [variant.image, ...product.images.filter((image) => image !== variant.image)] : product.images,
      }];
    });

    setToast(`✓ ${product.name} agregado al carrito`);
    track("add_to_cart", product.id);
    trackMetaEvent("AddToCart", {
      content_ids: [String(product.id)],
      content_name: `${product.brand} ${product.name}`,
      content_type: "product",
      currency: "ARS",
      value: product.price,
    });
  }

  function changeQuantity(cartKey: string, amount: number) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.cartKey !== cartKey) return item;
          return {
            ...item,
            quantity: Math.min(item.variantStock ?? item.stock, Math.max(0, item.quantity + amount)),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function remove(cartKey: string) {
    setCart((current) => current.filter((p) => p.cartKey !== cartKey));
  }

  function goToCheckout() {
    setCartOpen(false);
    track("begin_checkout");
    window.location.href = userEmail ? "/checkout" : "/login?next=/checkout";
  }

  function nextImage(direction: number) {
    if (!selected) return;
    setSelectedImage((current) => {
      const totalImages = selected.images.length;
      return (current + direction + totalImages) % totalImages;
    });
  }

  return (
    <main id="contenido-principal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <div className="background">
        <div className="grid" />
        <div className="glow glow1" />
        <div className="glow glow2" />
      </div>

      <div className="siteTop">
        <div className="announcement">
          🚚 ENVÍOS A TODO EL PAÍS · OCA · ATENCIÓN PERSONALIZADA
        </div>

        <header>
        <a href="#inicio" className="logo">
          RXZ <span>GAMER</span>
        </a>

        <button className="menuBtn" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="navegacion-principal">
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav id="navegacion-principal" className={menuOpen ? "navOpen" : ""} onClick={() => setMenuOpen(false)}>
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#comparar">Comparar</a>
          <a href="#beneficios">Envíos</a>
          <a href="#preguntas">Preguntas</a>
          <a href="#contacto">Contacto</a>
          <a href={userEmail ? "/ayuda" : "/login?next=/ayuda"}>Ayuda</a>

          {isAdmin && (
            <a className="adminBtn" href="/admin">
              Soporte / Admin
            </a>
          )}

          <a className="accountBtn" href={userEmail ? "/cuenta" : "/login"}>
            👤 <span>{userEmail ? "Mi cuenta" : "Iniciar sesión"}</span>
          </a>

          <button className="cartBtn" onClick={() => setCartOpen(true)}>
            🛒 <span>Carrito</span>
            {totalItems > 0 && <b className="counter">{totalItems}</b>}
          </button>
        </nav>
        </header>
      </div>

      <section id="inicio" className="hero">
        <div className="heroBadge">GAMING · PERFORMANCE · TECNOLOGÍA</div>

        <h1>
          EQUIPATE PARA
          <br />
          <span>JUGAR MEJOR.</span>
        </h1>

        <p>
          Hardware y periféricos gamer seleccionados por rendimiento,
          tecnología y relación precio-calidad.
        </p>

        <div className="heroButtons">
          <a href="#productos" className="primary">
            VER PRODUCTOS
          </a>

          <a className="secondary" href={userEmail ? "/ayuda" : "/login?next=/ayuda"}>
            HABLAR CON SOPORTE
          </a>
        </div>

        <div className="trust">
          <div>
            <strong>🚚</strong>
            <span>
              <b>Envíos nacionales</b>
              <small>Por OCA</small>
            </span>
          </div>

          <div>
            <strong>🔒</strong>
            <span>
              <b>Compra segura</b>
              <small>Transferencia verificada</small>
            </span>
          </div>

          <div>
            <strong>💬</strong>
              <span>
                <b>Atención directa</b>
                <small>Chat interno RXZ</small>
              </span>
          </div>
        </div>
      </section>

      <section className="reelExperience" aria-labelledby="reel-experience-title">
        <div className="reelIntro">
          <span>LA EXPERIENCIA RXZ</span>
          <h2 id="reel-experience-title">Elegí tu próximo upgrade.</h2>
          <p>Información directa, comparaciones claras y tecnología que realmente suma a tu setup.</p>
        </div>
        <div className="reelCards">
          <a className="reelCard reelCardGreen" href="#productos"><small>01 · DESCUBRÍ</small><strong>TODO EMPIEZA CON EL SETUP.</strong><span>Explorá periféricos seleccionados por rendimiento.</span><b>VER CATÁLOGO →</b></a>
          <a className="reelCard reelCardBlue" href="#productos"><small>02 · COMPARÁ</small><strong>DATOS REALES. DECISIÓN SIMPLE.</strong><span>Revisá características, variantes, stock y precio.</span><b>COMPARAR OPCIONES →</b></a>
          <a className="reelCard reelCardDark" href="#beneficios"><small>03 · ELEGÍ</small><strong>TU SETUP. TU NIVEL.</strong><span>Compra segura, atención directa y envíos nacionales.</span><b>CONOCER RXZ →</b></a>
        </div>
        <div className="performanceTicker" aria-label="Características de RXZ Gamer"><div><span>GAMING</span><i>✦</i><span>PERFORMANCE</span><i>✦</i><span>TECNOLOGÍA</span><i>✦</i><span>GAMING</span><i>✦</i><span>PERFORMANCE</span><i>✦</i><span>TECNOLOGÍA</span><i>✦</i></div></div>
      </section>

      <section id="productos" className="products">
        <div className="sectionHead">
          <span>RXZ SELECTION</span>
          <h2>Productos destacados</h2>
          <p>Tecnología seleccionada para mejorar tu setup.</p>
        </div>

        <div className="tools">
          <div className="search">
            🔎
            <label className="srOnly" htmlFor="catalog-search">Buscar productos en el catálogo</label>
            <input
              id="catalog-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              autoComplete="off"
            />
          </div>

          <div className="categories">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c === "Favoritos" ? `♡ Favoritos (${favoriteIds.length})` : c}
              </button>
            ))}
          </div>
        </div>

        <div className="catalogStatus" aria-live="polite">
          <span>
            {filtered.length} {filtered.length === 1 ? "producto disponible" : "productos disponibles"}
          </span>
          <div className="catalogControls">
            <label htmlFor="catalog-sort">Ordenar:</label>
            <select id="catalog-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre A–Z</option>
            </select>
            {(search || category !== "Todos" || sort !== "featured") && (
              <button onClick={() => { setSearch(""); setCategory("Todos"); setSort("featured"); }}>
                LIMPIAR FILTROS
              </button>
            )}
          </div>
        </div>

        <div className="productGrid">
          {filtered.map((product) => {
            const discount = product.oldPrice
              ? Math.round((1 - product.price / product.oldPrice) * 100)
              : 0;
            const packagePreview = getPackagePreview(product);

            return (
              <article className="card" key={product.id}>
                <div
                  className="imageBox"
                  onClick={() => openProduct(product)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProduct(product);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalles de ${product.brand} ${product.name}`}
                >
                  <button
                    className={favoriteIds.includes(product.id) ? "favoriteBtn isFavorite" : "favoriteBtn"}
                    onClick={(event) => { event.stopPropagation(); toggleFavorite(product.id); }}
                    aria-label={favoriteIds.includes(product.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                    title={favoriteIds.includes(product.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    {favoriteIds.includes(product.id) ? "♥" : "♡"}
                  </button>
                  {product.badge && <span className="badge">{product.badge}</span>}
                  {discount > 0 && (
                    <span className="discount">-{discount}%</span>
                  )}

                  <SafeImage
                    src={product.images[0]}
                    fallback={product.fallbackImage}
                    alt={`${product.brand} ${product.name}`}
                  />

                  {packagePreview && (
                    <div className="packagePreview" aria-label={packagePreview.caption}>
                      <SafeImage
                        src={packagePreview.image}
                        fallback={product.fallbackImage}
                        alt={packagePreview.alt}
                      />
                      <span>
                        <b>TODO LO QUE INCLUYE</b>
                        {packagePreview.caption}
                      </span>
                    </div>
                  )}

                  <span className={`photoCount ${packagePreview ? "withPackagePreview" : ""}`}>
                    📷 {product.images.length} fotos
                  </span>
                </div>

                <div className="cardBody">
                  <div className="brand">{product.brand}</div>
                  <div className="productCardTitle">
                    <h3>{product.name}</h3>
                    <span className={product.stock <= 0 ? "stock stockInline outOfStock" : "stock stockInline"}>
                      <span className="stockDot" />
                      {product.stock <= 0 ? "0 unidades" : "En stock · Entrega inmediata"}
                    </span>
                  </div>
                  <p>{product.subtitle}</p>

                  {product.oldPrice && (
                    <div className="old">{money(product.oldPrice)}</div>
                  )}

                  <div className="price">{money(product.price)}</div>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="saving">AHORRÁS {money(product.oldPrice - product.price)}</div>
                  )}
                  <small className="transfer">
                    Precio especial por transferencia
                  </small>

                  <button className="details" onClick={() => openProduct(product)}>
                    VER DETALLES Y FICHA TÉCNICA
                  </button>

                  <button className="buy" disabled={product.stock <= 0} onClick={() => openProduct(product)}>
                    {product.stock <= 0 ? "SIN STOCK" : product.variants?.length ? "VER Y ELEGIR COLOR" : "VER ANTES DE COMPRAR"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {recentProducts.length > 0 && (
        <section className="recentSection" aria-labelledby="recent-title">
          <div className="sectionHead compactHead">
            <span>CONTINUÁ EXPLORANDO</span>
            <h2 id="recent-title">Vistos recientemente</h2>
          </div>
          <div className="recentGrid">
            {recentProducts.map((product) => (
              <button key={product.id} className="recentCard" onClick={() => openProduct(product)}>
                <SafeImage src={product.images[0]} fallback={product.fallbackImage} alt="" />
                <span><small>{product.brand}</small><strong>{product.name}</strong><b>{money(product.price)}</b></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {loaded && totalItems > 0 && !cartOpen && (
        <section className="savedCart" aria-label="Compra guardada">
          <div>
            <span>🛒 TU COMPRA SIGUE GUARDADA</span>
            <strong>{totalItems} {totalItems === 1 ? "producto" : "productos"} · {money(total)}</strong>
            <p>Podés continuar exactamente donde la dejaste.</p>
          </div>
          <button onClick={() => { setCartOpen(true); track("resume_cart"); }}>CONTINUAR COMPRA</button>
        </section>
      )}

      <section id="comparar" className="compareSection" aria-labelledby="compare-title">
        <div className="compareHead">
          <div>
            <span>COMPARÁ SIN COMPLICARTE</span>
            <h2 id="compare-title">Encontrá el ideal para vos</h2>
          </div>
          <p>Las diferencias más importantes de cada producto, juntas y fáciles de revisar.</p>
        </div>
        <div className="compareGrid">
          {catalogProducts.map((product) => {
            const included = product.specs.find((spec) => spec.label === "Incluye")?.value;
            return (
              <article className="compareCard" key={product.id}>
                <div className="compareProduct">
                  <SafeImage src={product.images[0]} fallback={product.fallbackImage} alt={product.name} />
                  <span><small>{product.brand}</small><strong>{product.name}</strong></span>
                </div>
                <dl>
                  <div><dt>Tipo</dt><dd>{product.category}</dd></div>
                  <div><dt>Lo principal</dt><dd>{product.subtitle}</dd></div>
                  <div><dt>Variantes</dt><dd>{product.variants?.map((variant) => variant.label).join(" · ") || "Única"}</dd></div>
                  <div><dt>Incluye</dt><dd>{included || "Ver ficha técnica"}</dd></div>
                </dl>
                <div className="compareBottom">
                  <strong>{money(product.price)}</strong>
                  <button onClick={() => openProduct(product)}>VER PRODUCTO</button>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="emptyCatalog">
              <span>⌕</span>
              <h3>{category === "Favoritos" ? "Todavía no guardaste productos" : "No encontramos coincidencias"}</h3>
              <p>{category === "Favoritos" ? "Tocá el corazón de un producto para guardarlo acá." : "Probá con otro nombre o restablecé los filtros."}</p>
              <button onClick={() => { setSearch(""); setCategory("Todos"); }}>VER TODO EL CATÁLOGO</button>
            </div>
          )}
        </div>
      </section>

      <section id="beneficios" className="benefits">
        <div>
          <span>🚚</span>
          <h3>Envíos a todo el país</h3>
          <p>Despachamos desde Villa Allende, Córdoba, mediante OCA.</p>
        </div>

        <div>
          <span>🏦</span>
          <h3>Transferencia bancaria</h3>
          <p>Precio especial abonando mediante transferencia.</p>
        </div>

        <div>
          <span>🔐</span>
          <h3>Pago verificado</h3>
          <p>
            Confirmamos cada pedido luego de verificar la acreditación.
          </p>
        </div>

        <div>
          <span>🎮</span>
          <h3>Selección RXZ</h3>
          <p>
            Elegimos productos por rendimiento y relación precio-calidad.
          </p>
        </div>
      </section>

      <section className="payment">
        <span>COMPRA SIMPLE</span>
        <h2>¿Cómo comprar?</h2>

        <div className="steps">
          <div>
            <b>01</b>
            <h3>Elegí</h3>
            <p>Agregá tus productos al carrito.</p>
          </div>
          <div>
            <b>02</b>
            <h3>Confirmá</h3>
            <p>Revisá cantidades y total.</p>
          </div>
          <div>
            <b>03</b>
            <h3>Pagá</h3>
            <p>
              Transferí al alias que te mostraremos al confirmar tu pedido.
            </p>
          </div>
          <div>
            <b>04</b>
            <h3>Recibí</h3>
            <p>Coordinamos tu envío por OCA.</p>
          </div>
        </div>
      </section>

      <section id="preguntas" className="faqSection" aria-labelledby="faq-title">
        <div className="faqIntro">
          <span>TODO CLARO ANTES DE COMPRAR</span>
          <h2 id="faq-title">Preguntas frecuentes</h2>
          <p>La información importante sobre pago, envío, stock y garantía en un solo lugar.</p>
        </div>
        <div className="faqList">
          <details>
            <summary>¿Los productos están disponibles para entrega inmediata?</summary>
            <p>Sí. Los productos publicados como “En stock” están disponibles. El stock se descuenta al confirmar cada pedido.</p>
          </details>
          <details>
            <summary>¿Cómo se calcula el envío?</summary>
            <p>Enviamos mediante OCA desde Villa Allende, Córdoba. El costo y el plazo se confirman según el código postal antes del despacho.</p>
          </details>
          <details>
            <summary>¿Cuándo veo los datos para pagar?</summary>
            <p>El alias se muestra únicamente después de confirmar el pedido. Luego podés adjuntar el comprobante desde tu cuenta.</p>
          </details>
          <details>
            <summary>¿Puedo elegir el color?</summary>
            <p>Sí. Antes de agregar un producto al carrito tenés que abrir su ficha y seleccionar una variante con stock.</p>
          </details>
          <details>
            <summary>¿Qué pasa si necesito ayuda o un cambio?</summary>
            <p>Podés hablar con soporte desde el botón de chat. También podés consultar las políticas de cambios, garantías y arrepentimiento al pie de la página.</p>
          </details>
        </div>
      </section>

      <section className="shareSection" aria-labelledby="share-title">
        <div>
          <span>COMPARTÍ RXZ GAMER</span>
          <h2 id="share-title">¿Conocés a alguien que está mejorando su setup?</h2>
          <p>Mandale el catálogo o compartí la tienda. El enlace abre directamente en RXZ Gamer y no incluye datos personales.</p>
        </div>
        <div className="shareButtons">
          <button onClick={() => void shareStore()}>↗ COMPARTIR TIENDA</button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Mirá estos periféricos gamer de RXZ Gamer: https://rxz-gamer-tflb.vercel.app/?utm_source=whatsapp&utm_medium=organic&utm_campaign=store_recommendation")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_store_whatsapp")}
          >WHATSAPP</a>
          <button className="secondaryShare" onClick={() => void copyStoreLink()}>COPIAR ENLACE</button>
        </div>
      </section>

      <section id="contacto" className="contact">
        <span>¿NECESITÁS AYUDA?</span>
        <h2>Estamos para ayudarte.</h2>
        <p>Consultanos sobre productos, stock, pagos o envíos.</p>

        <a href={userEmail ? "/ayuda" : "/login?next=/ayuda"}>
          💬 ABRIR CHAT DE SOPORTE
        </a>
      </section>

      <footer>
        <div className="footerLogo">
          RXZ <span>GAMER</span>
        </div>
        <p>Gaming · Performance · Tecnología</p>
        <div className="footerLinks">
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/garantias">Cambios y garantías</Link>
          <Link href="/legal/envios">Envíos</Link>
          <Link href="/arrepentimiento">BOTÓN DE ARREPENTIMIENTO</Link>
        </div>
        <small>© 2026 RXZ Gamer · Todos los derechos reservados.</small>
      </footer>

      <a
        className="supportFloat"
        href={userEmail ? "/ayuda" : "/login?next=/ayuda"}
        aria-label="Abrir chat de soporte RXZ Gamer"
      >
        💬
      </a>

      <a className="backToTop" href="#inicio" aria-label="Volver al inicio" title="Volver al inicio">
        ↑
      </a>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{toast}</span>
          {toast.toLowerCase().includes("carrito") && (
            <button onClick={() => setCartOpen(true)}>VER CARRITO</button>
          )}
        </div>
      )}

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)} role="dialog" aria-modal="true" aria-label={`Detalle de ${selected.name}`}>
          <button className="fixedMenuBack" onClick={() => setSelected(null)}>
            ← VOLVER AL MENÚ
          </button>
          <div className="modal productModal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)} aria-label="Cerrar detalle del producto">
              ×
            </button>

            <div className="modalGrid">
              <div>
                <div className="galleryMain">
                  <button
                    className="galleryArrow left"
                    onClick={() => nextImage(-1)}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>

                  <SafeImage
                    src={selected.images[selectedImage] || selectedVariant?.image || selected.fallbackImage}
                    fallback={selected.fallbackImage}
                    alt={`${selected.name} imagen ${selectedImage + 1}`}
                  />

                  {selectedImage === 0 && selectedPackagePreview && (
                    <div className="packagePreview modalPackagePreview">
                      <SafeImage
                        src={selectedPackagePreview.image}
                        fallback={selected.fallbackImage}
                        alt={selectedPackagePreview.alt}
                      />
                      <span>
                        <b>TODO LO QUE INCLUYE</b>
                        {selectedPackagePreview.caption}
                      </span>
                    </div>
                  )}

                  <button
                    className="galleryArrow right"
                    onClick={() => nextImage(1)}
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>

                  <span className="galleryCounter">
                    {selectedImage + 1} / {selected.images.length}
                  </span>
                </div>

                <div className="thumbnails">
                  {selected.images.map((image, index) => (
                    <button
                      key={`${selected.id}-${index}`}
                      className={selectedImage === index ? "thumb activeThumb" : "thumb"}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                      aria-pressed={selectedImage === index}
                    >
                      <SafeImage
                        src={image}
                        fallback={selected.fallbackImage}
                        alt={`${selected.name} miniatura ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="productInfo">
                <div className="productTopline">
                  <div className="brand">{selected.brand}</div>
                  <div className="productActions">
                    <button onClick={() => toggleFavorite(selected.id)} aria-label="Guardar producto en favoritos">
                      {favoriteIds.includes(selected.id) ? "♥ Guardado" : "♡ Guardar"}
                    </button>
                    <button onClick={() => void shareProduct(selected)} aria-label="Compartir producto">↗ Compartir</button>
                  </div>
                </div>
                <h2>{selected.name}</h2>
                <p className="description">{selected.description}</p>

                {selected.specs.find((spec) => spec.label === "Incluye") && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-50">
                    <strong className="block text-emerald-400">TODO LO QUE RECIBÍS</strong>
                    {selected.specs.find((spec) => spec.label === "Incluye")?.value}
                  </div>
                )}

                {selected.variants?.length ? (
                  <div className="variantPicker">
                    <strong>Elegí el color</strong>
                    <div className="variantOptions">
                      {selected.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={variant.stock <= 0}
                          className={selectedVariantId === variant.id ? "variantOption activeVariant" : "variantOption"}
                          onClick={() => {
                            setSelectedVariantId(variant.id);
                            const variantImageIndex = selected.images.indexOf(variant.image);
                            if (variantImageIndex >= 0) setSelectedImage(variantImageIndex);
                          }}
                        >
                          <SafeImage
                            src={variant.image}
                            fallback={selected.fallbackImage}
                            alt={`Vista previa ${selected.name} ${variant.label}`}
                            className="variantPreview"
                          />
                          <span className="colorDot" style={{ background: variant.color }} />
                          <span>{variant.label}<small>{variant.stock > 0 ? `${variant.stock} ${variant.stock === 1 ? "unidad" : "unidades"}` : "Sin stock"}</small></span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className={(selectedVariant ? selectedVariant.stock : selected.stock) <= 0 ? "modalStock outOfStock" : "modalStock"}>
                  <span className="stockDot" />
                  {(selectedVariant ? selectedVariant.stock : selected.stock) <= 0
                    ? "0 unidades"
                    : "En stock · Entrega inmediata"}
                </div>

                {selected.oldPrice && (
                  <div className="modalOld">{money(selected.oldPrice)}</div>
                )}

                <div className="modalPrice">{money(selected.price)}</div>
                <small className="transfer">
                  Precio especial por transferencia
                </small>

                <div className="purchaseTrust" aria-label="Beneficios de compra">
                  <span>🔒 Compra protegida</span>
                  <span>🚚 Envíos por OCA</span>
                  <span>💬 Soporte directo</span>
                </div>

                <a className="productDetailLink" href={`/productos/${selected.id}`}>
                  VER FICHA COMPLETA
                </a>

                <a
                  className="productSupport"
                  href={userEmail ? "/ayuda" : "/login?next=/ayuda"}
                >
                  CONSULTAR A SOPORTE
                </a>


              </div>
            </div>

            <div className="detailsSection">
              <div className="featuresPanel">
                <div className="sectionLabel">CARACTERÍSTICAS</div>
                <h3>Lo más importante</h3>
                <ul>
                  {selected.features.map((feature) => (
                    <li key={feature}>
                      <span>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="specPanel">
                <div className="sectionLabel">FICHA TÉCNICA</div>
                <h3>Especificaciones</h3>

                <div className="specTable">
                  {selected.specs.map((spec) => (
                    <div className="specRow" key={spec.label}>
                      <span>{spec.label}</span>
                      <strong>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="finalPurchase">
              <div>
                <strong>Último paso</strong>
                <span>
                  {selected.variants?.length
                    ? "Revisá las especificaciones y elegí arriba el color que querés."
                    : "Revisá las características y especificaciones antes de agregarlo."}
                </span>
              </div>
              <button
                className="buy modalBuy"
                disabled={(selected.variants?.length && !selectedVariant) || (selectedVariant ? selectedVariant.stock : selected.stock) <= 0}
                onClick={() => add(selected, selectedVariantId || undefined)}
              >
                {selected.variants?.length && !selectedVariant
                  ? "ELEGÍ UN COLOR"
                  : (selectedVariant ? selectedVariant.stock : selected.stock) <= 0
                  ? "SIN STOCK"
                : "AGREGAR AL CARRITO"}
              </button>
              <button
                className="buyNowBtn"
                disabled={(selected.variants?.length && !selectedVariant) || (selectedVariant ? selectedVariant.stock : selected.stock) <= 0}
                onClick={() => buyNow(selected, selectedVariantId || undefined)}
              >
                COMPRAR AHORA
              </button>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="overlay cartOverlay"
          onClick={() => setCartOpen(false)}
        >
          <aside className="cart" onClick={(e) => e.stopPropagation()}>
            <div className="cartHeader">
              <div>
                <small>RXZ GAMER</small>
                <h2>Tu carrito</h2>
              </div>

              <button className="closeNormal" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito">
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                <div>🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>Agregá un producto para comenzar tu compra.</p>

                <button className="buy" onClick={() => setCartOpen(false)}>
                  VER PRODUCTOS
                </button>
              </div>
            ) : (
              <>
                <div className="cartItems">
                  {cart.map((item) => (
                    <div className="cartItem" key={item.cartKey}>
                      <SafeImage
                        src={item.images[0]}
                        fallback={item.fallbackImage}
                        alt={item.name}
                      />

                      <div className="cartInfo">
                        <b>{item.name}</b>
                        {item.variantLabel && <small className="cartVariant">Color: {item.variantLabel}</small>}
                        <span>{money(item.price)}</span>

                        <div className="quantity">
                          <button onClick={() => changeQuantity(item.cartKey, -1)}>
                            −
                          </button>
                          <strong>{item.quantity}</strong>
                          <button
                            disabled={item.quantity >= (item.variantStock ?? item.stock)}
                            onClick={() => changeQuantity(item.cartKey, 1)}
                          >
                            +
                          </button>
                        </div>

                        <button className="remove" onClick={() => remove(item.cartKey)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary">
                  <div>
                    <span>Productos</span>
                    <strong>{totalItems}</strong>
                  </div>

                  <div className="total">
                    <span>Total</span>
                    <strong>{money(total)}</strong>
                  </div>

                  <small>El costo del envío se coordina según destino.</small>
                </div>

                <div className="cartAssurance" aria-label="Información de compra segura">
                  <span>🔒 Pedido protegido</span>
                  <span>📦 Stock confirmado</span>
                  <span>💬 Soporte directo</span>
                </div>

                <button className="buy checkout" onClick={goToCheckout}>
                  FINALIZAR COMPRA
                </button>

                <button
                  className="continue"
                  onClick={() => setCartOpen(false)}
                >
                  SEGUIR COMPRANDO
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          background: #03060b;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
        }
        button, input, select { font: inherit; }
        button { cursor: pointer; }
        button:disabled { cursor: not-allowed; opacity: .45; }
        .srOnly {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }
        :where(a, button, input, [role="button"]):focus-visible {
          outline: 3px solid rgba(74,222,128,.95);
          outline-offset: 3px;
        }
        main {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #03060b;
          padding-top: 112px;
        }
        .background {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size: 65px 65px;
        }
        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(130px);
          opacity: .17;
        }
        .glow1 {
          width: 650px;
          height: 650px;
          background: #16a34a;
          top: 50px;
          left: -300px;
          animation: move1 15s infinite alternate ease-in-out;
        }
        .glow2 {
          width: 750px;
          height: 750px;
          background: #1d4ed8;
          right: -350px;
          top: 350px;
          animation: move2 20s infinite alternate ease-in-out;
        }
        .siteTop, .announcement, header, section, footer {
          position: relative;
          z-index: 2;
        }
        .siteTop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 100;
        }
        .announcement {
          background: #22c55e;
          color: #031008;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.8px;
          padding: 9px 15px;
        }
        header {
          min-height: 76px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          background: rgba(3,6,11,.84);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .logo, .footerLogo {
          color: white;
          text-decoration: none;
          font-weight: 1000;
          font-size: 26px;
          letter-spacing: 1px;
        }
        .logo span, .footerLogo span { color: #22c55e; }
        section[id] { scroll-margin-top: 125px; }
        nav { display: flex; align-items: center; gap: 25px; }
        .menuBtn {
          display: none;
          border: 1px solid #344154;
          border-radius: 9px;
          background: #0f172a;
          color: white;
          padding: 9px 12px;
          font-size: 20px;
        }
        nav > a {
          color: #aab5c7;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: .2s;
        }
        nav > a:hover { color: white; }
        .accountBtn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 13px;
          border: 1px solid #344154;
          border-radius: 9px;
          color: #dbe5f3;
          background: rgba(15,23,42,.75);
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }
        .accountBtn:hover { border-color: rgba(34,197,94,.55); color: white; }
        .adminBtn {
          padding: 10px 13px;
          border: 1px solid rgba(34,197,94,.55);
          border-radius: 9px;
          background: rgba(34,197,94,.12);
          color: #86efac;
        }
        .cartBtn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(34,197,94,.45);
          border-radius: 9px;
          padding: 10px 14px;
          color: white;
          background: rgba(34,197,94,.08);
          font-weight: 800;
        }
        .counter {
          position: absolute;
          top: -9px;
          right: -9px;
          background: #22c55e;
          color: #031008;
          min-width: 22px;
          height: 22px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          font-size: 11px;
        }
        .hero {
          min-height: 760px;
          padding: 130px 20px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .heroBadge {
          color: #64f18d;
          border: 1px solid rgba(34,197,94,.3);
          background: rgba(34,197,94,.08);
          padding: 9px 15px;
          border-radius: 50px;
          font-size: 11px;
          letter-spacing: 2.5px;
          font-weight: 900;
        }
        .hero h1 {
          margin: 28px 0 0;
          max-width: 1100px;
          font-size: clamp(55px, 8vw, 105px);
          line-height: .91;
          letter-spacing: -5px;
          font-weight: 1000;
        }
        .hero h1 span {
          color: #22c55e;
          text-shadow: 0 0 55px rgba(34,197,94,.3);
        }
        .hero > p {
          max-width: 720px;
          color: #9aa7bb;
          font-size: 19px;
          line-height: 1.7;
          margin: 32px auto;
        }
        .heroButtons {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .primary, .secondary {
          text-decoration: none;
          padding: 16px 25px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 950;
        }
        .primary {
          background: #22c55e;
          color: #031008;
          box-shadow: 0 0 35px rgba(34,197,94,.25);
        }
        .secondary {
          color: white;
          border: 1px solid #344154;
          background: rgba(15,23,42,.75);
        }
        .trust {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 15px;
          width: min(850px,100%);
          margin-top: 70px;
        }
        .trust > div {
          display: flex;
          align-items: center;
          text-align: left;
          gap: 13px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          background: rgba(12,18,29,.65);
        }
        .trust strong { font-size: 24px; }
        .trust span { display: flex; flex-direction: column; gap: 4px; }
        .trust b { font-size: 13px; }
        .trust small { color: #7e8ca1; }

        .reelExperience { max-width: 1450px; margin: 0 auto; padding: 35px 5% 80px; overflow: hidden; }
        .reelIntro { display: grid; grid-template-columns: .75fr 1.35fr 1fr; align-items: end; gap: 30px; margin-bottom: 30px; }
        .reelIntro > span { color: #22c55e; font-size: 11px; font-weight: 950; letter-spacing: 3px; }
        .reelIntro h2 { margin: 0; font-size: clamp(34px,4.4vw,65px); line-height: .95; letter-spacing: -2.5px; }
        .reelIntro p { margin: 0; color: #8f9db1; line-height: 1.6; }
        .reelCards { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .reelCard { min-height: 390px; padding: 30px; border-radius: 24px; text-decoration: none; color: white; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; isolation: isolate; border: 1px solid rgba(255,255,255,.1); transition: transform .35s ease,border-color .35s ease,box-shadow .35s ease; }
        .reelCard::before { content: ""; position: absolute; inset: -35%; z-index: -1; background: conic-gradient(from 180deg,transparent,rgba(255,255,255,.13),transparent 35%); animation: reelSweep 8s linear infinite; }
        .reelCard::after { content: ""; position: absolute; width: 220px; height: 220px; border: 1px solid rgba(255,255,255,.2); border-radius: 50%; top: 35px; right: -60px; box-shadow: 0 0 80px currentColor; opacity: .35; z-index: -1; }
        .reelCard:hover { transform: translateY(-9px) scale(1.01); border-color: rgba(80,255,177,.55); box-shadow: 0 30px 70px rgba(0,0,0,.38); }
        .reelCard small { color: #b8c6d8; font-weight: 900; letter-spacing: 2px; }
        .reelCard strong { max-width: 390px; margin: 18px 0 13px; font-size: clamp(25px,2.4vw,39px); line-height: .95; letter-spacing: -1px; }
        .reelCard span { max-width: 360px; color: #c4cedb; line-height: 1.55; }
        .reelCard b { margin-top: 28px; color: #50ffb1; font-size: 12px; letter-spacing: 1.5px; }
        .reelCardGreen { background: radial-gradient(circle at 85% 15%,rgba(34,197,94,.38),transparent 35%),linear-gradient(145deg,#071c17,#07100e 65%); color: #6cffae; }
        .reelCardBlue { background: radial-gradient(circle at 85% 15%,rgba(34,211,238,.36),transparent 35%),linear-gradient(145deg,#071622,#050a11 65%); color: #38d9ff; }
        .reelCardDark { background: radial-gradient(circle at 85% 15%,rgba(168,85,247,.3),transparent 35%),linear-gradient(145deg,#161021,#07090e 65%); color: #a855f7; }
        .performanceTicker { margin-top: 18px; border-block: 1px solid rgba(80,255,177,.18); overflow: hidden; color: #dfffee; }
        .performanceTicker div { width: max-content; display: flex; gap: 28px; padding: 17px 0; font-size: 13px; font-weight: 950; letter-spacing: 3px; animation: tickerMove 18s linear infinite; }
        .performanceTicker i { color: #22c55e; font-style: normal; }
        @keyframes reelSweep { to { transform: rotate(360deg); } }
        @keyframes tickerMove { to { transform: translateX(-50%); } }

        .products {
          max-width: 1450px;
          margin: auto;
          padding: 90px 5%;
        }
        .sectionHead { text-align: center; margin-bottom: 40px; }
        .sectionHead > span, .payment > span, .contact > span, .sectionLabel {
          color: #22c55e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 3px;
        }
        .sectionHead h2, .payment h2, .contact h2 {
          font-size: clamp(35px,5vw,55px);
          margin: 10px 0;
        }
        .sectionHead p { color: #8794a8; }
        .tools { max-width: 900px; margin: 0 auto 45px; }
        .search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(9,14,24,.9);
          border: 1px solid #29364a;
          padding: 0 17px;
          border-radius: 12px;
        }
        .search input {
          flex: 1;
          border: 0;
          outline: 0;
          padding: 16px 5px;
          background: transparent;
          color: white;
        }
        .categories {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }
        .categories button {
          border: 1px solid #29364a;
          border-radius: 50px;
          background: rgba(15,23,42,.8);
          color: #9eabbe;
          padding: 9px 15px;
          font-size: 12px;
          font-weight: 800;
        }
        .categories .active {
          background: #22c55e;
          color: #031008;
          border-color: #22c55e;
        }
        .catalogStatus {
          min-height: 34px;
          margin: -28px 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          color: #8492a7;
          font-size: 12px;
        }
        .catalogStatus button {
          padding: 7px 10px;
          border: 0;
          background: transparent;
          color: #65e9a6;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .7px;
        }
        .catalogControls { display: flex; align-items: center; gap: 9px; }
        .catalogControls label { color: #718096; font-size: 11px; }
        .catalogControls select {
          padding: 8px 30px 8px 10px;
          border: 1px solid #29364a;
          border-radius: 9px;
          background: #0b1521;
          color: #dbe5f2;
          font-size: 11px;
          font-weight: 800;
        }
        .productGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(290px,1fr));
          gap: 25px;
        }
        .emptyCatalog {
          grid-column: 1 / -1;
          padding: 58px 24px;
          border: 1px dashed #2a3b50;
          border-radius: 18px;
          background: rgba(8,17,28,.7);
          text-align: center;
        }
        .emptyCatalog > span { color: #22c55e; font-size: 48px; }
        .emptyCatalog h3 { margin: 10px 0 8px; font-size: 24px; }
        .emptyCatalog p { margin: 0; color: #8794a8; }
        .emptyCatalog button { margin-top: 22px; padding: 12px 17px; border: 1px solid #22c55e; border-radius: 9px; background: #0b241c; color: #86efac; font-weight: 900; }
        .card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(72,85,105,.45);
          border-radius: 18px;
          background: linear-gradient(180deg,rgba(17,24,39,.95),rgba(6,10,17,.98));
          transition: .25s;
          box-shadow: 0 25px 60px rgba(0,0,0,.25);
        }
        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(34,197,94,.45);
          box-shadow: 0 30px 80px rgba(0,0,0,.45);
        }
        .imageBox {
          height: 320px;
          padding: 30px;
          position: relative;
          cursor: pointer;
          background: radial-gradient(circle,#233556,#090f19 70%);
        }
        .imageBox img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: .3s;
        }
        .packagePreview {
          position: absolute;
          z-index: 3;
          left: 14px;
          right: 14px;
          bottom: 14px;
          height: 88px;
          display: grid;
          grid-template-columns: 82px minmax(0,1fr);
          align-items: center;
          gap: 10px;
          padding: 7px;
          border: 1px solid rgba(34,197,94,.62);
          border-radius: 12px;
          background: rgba(3,8,14,.94);
          box-shadow: 0 12px 32px rgba(0,0,0,.48);
          backdrop-filter: blur(10px);
        }
        .packagePreview > img {
          width: 82px;
          height: 72px;
          object-fit: cover;
          border-radius: 8px;
          background: white;
        }
        .packagePreview > span {
          color: #dbe6f4;
          font-size: 10px;
          line-height: 1.35;
        }
        .packagePreview b {
          display: block;
          margin-bottom: 4px;
          color: #4ade80;
          font-size: 10px;
          letter-spacing: .8px;
        }
        .card:hover .imageBox img { transform: scale(1.05); }
        .card:hover .packagePreview img { transform: none; }
        .badge, .discount {
          position: absolute;
          z-index: 2;
          top: 15px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 950;
          padding: 7px 9px;
        }
        .badge { left: 15px; background: #22c55e; color: #031008; }
        .discount { right: 15px; top: 66px; background: #ef4444; }
        .photoCount {
          position: absolute;
          right: 14px;
          bottom: 14px;
          padding: 7px 10px;
          border-radius: 20px;
          background: rgba(3,6,11,.75);
          backdrop-filter: blur(8px);
          color: #d5deea;
          font-size: 11px;
          font-weight: 800;
        }
        .cardBody {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 24px;
        }
        .photoCount.withPackagePreview { bottom: 110px; }
        .brand {
          color: #22c55e;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
        }
        .card h3 {
          margin: 8px 0;
          font-size: 23px;
          line-height: 1.35;
        }
        .productCardTitle {
          display: flex;
          height: 112px;
          flex-direction: column;
          align-items: flex-start;
        }
        .cardBody > p {
          color: #8897ab;
          height: 48px;
          min-height: 48px;
          line-height: 1.5;
        }
        .stock, .modalStock {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #a7b3c5;
          font-size: 12px;
          margin: 18px 0;
        }
        .stockInline {
          display: inline-flex;
          margin: auto 0 0 10px;
          padding: 5px 8px;
          border: 1px solid rgba(34,197,94,.45);
          border-radius: 999px;
          background: rgba(34,197,94,.11);
          color: #4ade80;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .15px;
          vertical-align: middle;
          white-space: nowrap;
          box-shadow: 0 0 16px rgba(34,197,94,.12);
        }
        .stockInline .stockDot {
          width: 6px;
          height: 6px;
        }
        .stockDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }
        .outOfStock {
          color: #f87171;
          font-weight: 800;
        }
        .stockInline.outOfStock {
          border-color: rgba(248,113,113,.45);
          background: rgba(239,68,68,.11);
          box-shadow: 0 0 16px rgba(239,68,68,.12);
        }
        .outOfStock .stockDot {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }
        .old, .modalOld {
          color: #66758b;
          text-decoration: line-through;
          font-size: 13px;
        }
        .cardBody > .old { height: 18px; }
        .price {
          color: #22c55e;
          font-size: 29px;
          font-weight: 950;
          height: 42px;
          margin: 3px 0 0;
        }
        .saving {
          min-height: 22px;
          color: #7ef0b4;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .65px;
        }
        .transfer {
          display: block;
          height: 22px;
          color: #77869b;
        }
        .details, .buy {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          font-weight: 900;
        }
        .details {
          margin-top: auto;
          min-height: 76px;
          border: 1px solid #344154;
          background: #131d2c;
          color: white;
        }
        .buy {
          margin-top: 9px;
          min-height: 52px;
          border: 0;
          background: #22c55e;
          color: #031008;
        }

        .benefits {
          max-width: 1250px;
          margin: 60px auto;
          padding: 0 5%;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
        }
        .benefits > div {
          padding: 28px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          background: rgba(12,18,29,.7);
        }
        .benefits > div > span { font-size: 29px; }
        .benefits h3 { margin-bottom: 7px; }
        .benefits p { color: #8190a5; line-height: 1.6; font-size: 14px; }

        .payment {
          max-width: 1250px;
          margin: 120px auto;
          padding: 0 5%;
          text-align: center;
        }
        .steps {
          margin-top: 45px;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
          text-align: left;
        }
        .steps > div {
          padding: 27px;
          background: rgba(11,17,27,.8);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
        }
        .steps b { color: #22c55e; font-size: 25px; }
        .steps p { color: #8190a5; line-height: 1.6; }

        .contact {
          padding: 120px 20px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,.07);
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: radial-gradient(circle at center,rgba(34,197,94,.08),transparent 55%);
        }
        .contact p { color: #8c9aaf; font-size: 17px; }
        .contact a {
          display: inline-block;
          margin-top: 20px;
          padding: 16px 25px;
          border-radius: 9px;
          background: #22c55e;
          color: #031008;
          text-decoration: none;
          font-weight: 950;
        }
        footer { padding: 50px 5%; text-align: center; color: #69778b; }
        footer p { font-size: 13px; }
        .footerLinks {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 22px;
          margin: 22px auto;
        }
        .footerLinks a { color: #aab5c7; font-size: 12px; text-decoration: none; }
        .footerLinks a:last-child { color: #86efac; font-weight: 900; }
        .supportFloat {
          position: fixed;
          right: 23px;
          bottom: 23px;
          z-index: 500;
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #22c55e;
          text-decoration: none;
          font-size: 27px;
          box-shadow: 0 10px 40px rgba(34,197,94,.35);
        }
        .backToTop {
          position: fixed;
          right: 31px;
          bottom: 94px;
          z-index: 490;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid #314158;
          border-radius: 50%;
          background: rgba(8,17,28,.94);
          color: #dce7f3;
          text-decoration: none;
          font-size: 20px;
          box-shadow: 0 12px 32px rgba(0,0,0,.28);
          backdrop-filter: blur(10px);
        }
        .backToTop:hover { border-color: #22c55e; color: #6ee7a7; transform: translateY(-2px); }
        .toast {
          position: fixed;
          z-index: 900;
          right: 22px;
          top: 110px;
          max-width: 430px;
          padding: 15px 17px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(7,12,20,.97);
          border: 1px solid rgba(34,197,94,.5);
          box-shadow: 0 20px 60px rgba(0,0,0,.5);
        }
        .toast button {
          border: 0;
          background: #22c55e;
          color: #031008;
          border-radius: 7px;
          padding: 8px;
          font-size: 11px;
          font-weight: 950;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 700;
          background: rgba(0,0,0,.9);
          backdrop-filter: blur(10px);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          position: relative;
          width: min(1180px,100%);
          max-height: 94vh;
          overflow-y: auto;
          border-radius: 20px;
          padding: 40px;
          background: linear-gradient(145deg,#111827,#060a12);
          border: 1px solid #2b384d;
          box-shadow: 0 40px 100px rgba(0,0,0,.65);
        }
        .close, .closeNormal {
          border: 0;
          background: #263449;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 23px;
        }
        .close {
          position: absolute;
          right: 18px;
          top: 18px;
          z-index: 20;
        }
        .modalGrid {
          display: grid;
          grid-template-columns: minmax(0,1.05fr) minmax(320px,.95fr);
          gap: 45px;
        }
        .galleryMain {
          min-height: 470px;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 18px;
          padding: 28px;
          background: radial-gradient(circle,#293b60,#0c1320 68%);
          border: 1px solid rgba(255,255,255,.07);
        }
        .galleryMain > img {
          width: 100%;
          height: 430px;
          object-fit: contain;
        }
        .galleryArrow {
          position: absolute;
          z-index: 3;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(3,6,11,.72);
          color: white;
          font-size: 31px;
          line-height: 1;
        }
        .galleryArrow.left { left: 14px; }
        .galleryArrow.right { right: 14px; }
        .galleryCounter {
          position: absolute;
          right: 16px;
          bottom: 15px;
          padding: 7px 10px;
          border-radius: 20px;
          color: #d7e0ec;
          background: rgba(3,6,11,.7);
          font-size: 11px;
          font-weight: 900;
        }
        .modalPackagePreview {
          left: 18px;
          right: auto;
          bottom: 16px;
          width: min(440px,calc(100% - 90px));
          height: 105px;
          grid-template-columns: 112px minmax(0,1fr);
        }
        .modalPackagePreview > img {
          width: 112px;
          height: 89px;
        }
        .modalPackagePreview > span,
        .modalPackagePreview b { font-size: 12px; }
        .thumbnails {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 10px;
          margin-top: 12px;
        }
        .thumb {
          height: 92px;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid #2c3a50;
          background: #0a111d;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .activeThumb {
          border-color: #22c55e;
          box-shadow: 0 0 0 1px rgba(34,197,94,.35);
        }
        .productInfo {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-top: 15px;
        }
        .productInfo h2 {
          font-size: clamp(34px,4vw,48px);
          margin: 8px 0 16px;
        }
        .description {
          color: #a7b2c4;
          line-height: 1.75;
          font-size: 16px;
        }
        .variantPicker { width: 100%; max-width: 520px; margin: 18px 0 8px; }
        .variantPicker > strong { display: block; margin-bottom: 10px; font-size: 14px; }
        .variantOptions { display: flex; flex-wrap: wrap; gap: 10px; }
        .variantOption {
          display: flex; align-items: center; gap: 10px; min-width: 180px; padding: 11px 13px;
          border: 1px solid #344154; border-radius: 10px; background: #101a28; color: white; text-align: left;
        }
        .variantPreview { width: 58px; height: 58px; flex: 0 0 auto; object-fit: contain; padding: 4px; border-radius: 9px; background: white; }
        .fixedMenuBack {
          position: fixed; top: 18px; left: 18px; z-index: 120;
          padding: 12px 16px; border: 1px solid rgba(52,211,153,.45); border-radius: 12px;
          background: rgba(3,10,16,.94); color: #6ee7b7; font-size: 12px; font-weight: 900;
          letter-spacing: .05em; box-shadow: 0 12px 35px rgba(0,0,0,.35); backdrop-filter: blur(10px);
        }
        .fixedMenuBack:hover { border-color: #34d399; background: #0a1b20; color: white; }
        .variantOption:hover:not(:disabled), .activeVariant { border-color: #22c55e; box-shadow: 0 0 0 1px rgba(34,197,94,.25); }
        .variantOption:disabled { opacity: .45; cursor: not-allowed; }
        .variantOption small { display: block; margin-top: 3px; color: #8fa0b5; }
        .colorDot { width: 22px; height: 22px; flex: 0 0 auto; border: 2px solid rgba(255,255,255,.35); border-radius: 50%; }
        .modalPrice {
          color: #22c55e;
          font-size: 38px;
          font-weight: 950;
          margin-top: 4px;
        }
        .modalBuy {
          max-width: 430px;
          margin-top: 28px;
          padding: 16px;
        }
        .productSupport {
          width: 100%;
          max-width: 430px;
          margin-top: 10px;
          padding: 14px;
          border: 1px solid #344154;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          color: white;
          background: #111b2a;
          font-size: 13px;
          font-weight: 900;
        }
        .productDetailLink {
          display: block;
          width: 100%;
          max-width: 430px;
          margin-top: 10px;
          padding: 14px;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          color: #86efac;
          border: 1px solid rgba(34,197,94,.4);
          background: rgba(34,197,94,.08);
          font-size: 13px;
          font-weight: 900;
        }
        .detailsSection {
          display: grid;
          grid-template-columns: .85fr 1.15fr;
          gap: 22px;
          margin-top: 38px;
          padding-top: 34px;
          border-top: 1px solid #26344a;
        }
        .finalPurchase {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 22px;
          padding: 22px;
          border: 1px solid rgba(34,197,94,.3);
          border-radius: 15px;
          background: rgba(34,197,94,.07);
        }
        .finalPurchase strong, .finalPurchase span { display: block; }
        .finalPurchase span { margin-top: 5px; color: #9dacbd; font-size: 14px; }
        .finalPurchase .modalBuy { width: min(100%,360px); margin-top: 0; }
        .featuresPanel, .specPanel {
          padding: 26px;
          border-radius: 15px;
          background: rgba(11,17,28,.78);
          border: 1px solid rgba(255,255,255,.07);
        }
        .featuresPanel h3, .specPanel h3 {
          margin: 8px 0 20px;
          font-size: 25px;
        }
        .featuresPanel ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 12px;
        }
        .featuresPanel li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #b7c2d1;
          line-height: 1.5;
        }
        .featuresPanel li span {
          color: #22c55e;
          font-weight: 950;
        }
        .specTable {
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid #26354a;
        }
        .specRow {
          display: grid;
          grid-template-columns: minmax(130px,.8fr) minmax(160px,1.2fr);
          gap: 20px;
          padding: 13px 15px;
          border-bottom: 1px solid #26354a;
        }
        .specRow:last-child { border-bottom: 0; }
        .specRow:nth-child(odd) { background: rgba(255,255,255,.025); }
        .specRow span { color: #8391a6; }
        .specRow strong { color: #e4eaf2; font-weight: 800; }

        .cartOverlay { justify-content: flex-end; padding: 0; }
        .cart {
          width: min(480px,100%);
          height: 100%;
          overflow-y: auto;
          background: #080e18;
          border-left: 1px solid #28364a;
          padding: 28px;
        }
        .cartHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #253247;
        }
        .cartHeader small {
          color: #22c55e;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .cartHeader h2 { margin: 5px 0; }
        .empty { text-align: center; padding: 80px 10px; }
        .empty > div { font-size: 55px; }
        .empty p { color: #8492a7; }
        .cartItem {
          display: flex;
          gap: 15px;
          padding: 20px 0;
          border-bottom: 1px solid #222f42;
        }
        .cartItem > img {
          width: 85px;
          height: 85px;
          object-fit: contain;
          border-radius: 9px;
          background: #131d2d;
        }
        .cartInfo { flex: 1; }
        .cartInfo > b { display: block; }
        .cartVariant { display: block; margin-top: 5px; color: #a7b2c4; }
        .cartInfo > span {
          display: block;
          color: #22c55e;
          font-weight: 900;
          margin: 7px 0;
        }
        .quantity {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }
        .quantity button {
          width: 31px;
          height: 31px;
          border-radius: 6px;
          border: 1px solid #344154;
          background: #172234;
          color: white;
        }
        .remove {
          border: 0;
          padding: 0;
          margin-top: 11px;
          background: transparent;
          color: #f87171;
          font-size: 12px;
        }
        .summary { padding: 25px 0; }
        .summary > div {
          display: flex;
          justify-content: space-between;
          margin: 9px 0;
        }
        .summary .total {
          font-size: 24px;
          padding-top: 15px;
          border-top: 1px solid #29364a;
        }
        .summary .total strong { color: #22c55e; }
        .summary small {
          display: block;
          margin-top: 15px;
          color: #7e8ca1;
        }
        .checkout { font-size: 14px; padding: 16px; }
        .cartAssurance { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin:12px 0; }
        .cartAssurance span { padding:9px 6px; border:1px solid #1d3445; border-radius:9px; background:#09131e; color:#b8c5d4; text-align:center; font-size:10px; font-weight:700; }
        .continue {
          width: 100%;
          margin-top: 10px;
          padding: 13px;
          border: 1px solid #344154;
          background: transparent;
          color: #b9c3d2;
          border-radius: 8px;
          font-weight: 800;
        }
        .faqSection { position:relative; z-index:2; max-width:1180px; margin:100px auto; padding:0 24px; display:grid; grid-template-columns:.8fr 1.2fr; gap:60px; align-items:start; }
        .compareSection { position:relative; z-index:2; max-width:1500px; margin:20px auto 100px; padding:0 5%; }
        .compareHead { display:flex; align-items:end; justify-content:space-between; gap:30px; margin-bottom:28px; }
        .compareHead span { color:#19d47f; font-size:12px; font-weight:900; letter-spacing:3px; }
        .compareHead h2 { margin:10px 0 0; font-size:clamp(30px,4vw,48px); }
        .compareHead p { max-width:470px; margin:0; color:#94a3b8; line-height:1.6; }
        .compareGrid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .compareCard { min-width:0; display:flex; flex-direction:column; padding:16px; border:1px solid #203244; border-radius:18px; background:linear-gradient(145deg,rgba(13,25,38,.97),rgba(6,14,23,.97)); box-shadow:0 18px 45px rgba(0,0,0,.16); }
        .compareProduct { display:flex; align-items:center; gap:12px; min-height:76px; padding-bottom:15px; border-bottom:1px solid rgba(255,255,255,.08); }
        .compareProduct img { width:66px; height:66px; flex:0 0 auto; border-radius:11px; background:white; object-fit:contain; padding:4px; }
        .compareProduct span { min-width:0; }
        .compareProduct small { display:block; margin-bottom:5px; color:#25db89; font-size:10px; font-weight:900; letter-spacing:1px; }
        .compareProduct strong { display:block; font-size:14px; line-height:1.35; }
        .compareCard dl { margin:8px 0 18px; }
        .compareCard dl > div { display:grid; gap:5px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.06); }
        .compareCard dt { color:#718096; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.8px; }
        .compareCard dd { margin:0; color:#cbd5e1; font-size:12px; line-height:1.5; }
        .compareBottom { margin-top:auto; display:grid; gap:10px; }
        .compareBottom > strong { color:#21d477; font-size:22px; }
        .compareBottom button { width:100%; padding:11px; border:1px solid #2d4d40; border-radius:9px; background:#0b241c; color:#7ef0b4; font-weight:900; font-size:11px; }
        .compareBottom button:hover { background:#19d47f; color:#031008; }
        .faqIntro { position:sticky; top:110px; }
        .faqIntro > span { color:#19d47f; font-size:12px; font-weight:900; letter-spacing:3px; }
        .faqIntro h2 { margin:12px 0; font-size:clamp(34px,4vw,54px); line-height:1; }
        .faqIntro p { color:#9daabc; line-height:1.7; max-width:440px; }
        .faqList { display:grid; gap:12px; }
        .faqList details { border:1px solid #1b3040; border-radius:16px; background:linear-gradient(145deg,#0b1521,#07101a); overflow:hidden; }
        .faqList summary { padding:20px 22px; cursor:pointer; font-weight:800; list-style:none; display:flex; align-items:center; justify-content:space-between; gap:18px; }
        .faqList summary::-webkit-details-marker { display:none; }
        .faqList summary::after { content:"+"; color:#19d47f; font-size:24px; line-height:1; }
        .faqList details[open] summary::after { content:"−"; }
        .faqList details[open] summary { color:#45e99d; }
        .faqList p { margin:0; padding:0 22px 22px; color:#aab5c5; line-height:1.65; }

        @keyframes move1 {
          to { transform: translate(300px,180px); }
        }
        @keyframes move2 {
          to { transform: translate(-300px,150px); }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }

        .favoriteBtn { position:absolute; top:12px; right:12px; z-index:5; width:42px; height:42px; border:1px solid rgba(255,255,255,.16); border-radius:50%; background:rgba(3,6,11,.78); color:white; font-size:24px; line-height:1; backdrop-filter:blur(10px); transition:.2s; }
        .favoriteBtn:hover { transform:scale(1.07); border-color:#22c55e; }
        .favoriteBtn.isFavorite { color:#22c55e; border-color:rgba(34,197,94,.6); }
        .recentSection { padding:35px 5% 85px; max-width:1500px; margin:auto; }
        .compactHead { text-align:left; margin-bottom:22px; }
        .compactHead h2 { margin-bottom:0; font-size:clamp(25px,3vw,38px); }
        .recentGrid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:15px; }
        .recentCard { display:flex; align-items:center; gap:14px; min-width:0; padding:13px; text-align:left; color:white; background:rgba(15,23,42,.72); border:1px solid #253247; border-radius:14px; transition:.2s; }
        .recentCard:hover { border-color:#22c55e; transform:translateY(-2px); }
        .recentCard img { width:72px; height:72px; object-fit:contain; border-radius:10px; background:white; }
        .recentCard span { min-width:0; display:grid; gap:4px; }
        .recentCard small { color:#22c55e; font-weight:900; font-size:10px; letter-spacing:1px; }
        .recentCard strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .recentCard b { color:#cbd5e1; font-size:14px; }
        .savedCart { position:relative; z-index:2; max-width:1320px; margin:0 auto 80px; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:24px; border:1px solid rgba(34,197,94,.35); border-radius:18px; background:linear-gradient(120deg,rgba(12,43,32,.94),rgba(7,20,28,.96)); box-shadow:0 24px 70px rgba(0,0,0,.22); }
        .savedCart span { display:block; margin-bottom:7px; color:#5ff0aa; font-size:11px; font-weight:950; letter-spacing:1.8px; }
        .savedCart strong { display:block; font-size:24px; }
        .savedCart p { margin:6px 0 0; color:#9db0bd; }
        .savedCart button { flex:0 0 auto; padding:15px 22px; border:0; border-radius:10px; background:#22c55e; color:#031008; font-weight:950; }
        .shareSection { position:relative; z-index:2; max-width:1250px; margin:100px auto; padding:38px; display:grid; grid-template-columns:1.25fr .75fr; gap:38px; align-items:center; border:1px solid #1f3941; border-radius:22px; background:radial-gradient(circle at top left,rgba(34,197,94,.13),transparent 48%),#09131e; }
        .shareSection > div > span { color:#32df8a; font-size:11px; font-weight:950; letter-spacing:2.5px; }
        .shareSection h2 { margin:11px 0; font-size:clamp(28px,3.5vw,43px); line-height:1.08; }
        .shareSection p { max-width:690px; margin:0; color:#9babbc; line-height:1.7; }
        .shareButtons { display:grid; gap:10px; }
        .shareButtons button, .shareButtons a { display:block; width:100%; padding:14px 16px; border:1px solid #22c55e; border-radius:10px; background:#22c55e; color:#031008; text-align:center; text-decoration:none; font-size:12px; font-weight:950; }
        .shareButtons .secondaryShare { border-color:#354457; background:#111c2b; color:#d7e1ee; }
        .shareButtons button:hover, .shareButtons a:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .productTopline { display:flex; align-items:center; justify-content:space-between; gap:15px; }
        .productActions { display:flex; gap:8px; }
        .productActions button { border:1px solid #344154; border-radius:9px; background:#111c2d; color:#dce6f4; padding:8px 10px; font-size:12px; font-weight:800; }
        .productActions button:hover { border-color:#22c55e; color:#86efac; }
        .purchaseTrust { display:flex; flex-wrap:wrap; gap:8px; margin:17px 0; }
        .purchaseTrust span { padding:8px 10px; border:1px solid #263349; border-radius:9px; background:rgba(15,23,42,.75); color:#cbd5e1; font-size:12px; }
        .buyNowBtn { min-width:190px; border:1px solid #22c55e; border-radius:10px; padding:14px 20px; background:transparent; color:#86efac; font-weight:950; }
        .buyNowBtn:hover:not(:disabled) { background:rgba(34,197,94,.1); }

        @media(max-width:900px) {
          .compareHead { align-items:start; flex-direction:column; gap:12px; }
          .compareGrid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .faqSection { grid-template-columns:1fr; gap:25px; margin:70px auto; }
          .faqIntro { position:static; }
          .cartAssurance { grid-template-columns:1fr; }
          .reelExperience { padding: 20px 16px 60px; }
          .reelIntro { grid-template-columns: 1fr; gap: 12px; }
          .reelCards { grid-template-columns: 1fr; }
          .reelCard { min-height: 330px; padding: 24px; }
          .recentGrid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .savedCart { margin:0 5% 70px; }
          .shareSection { margin:70px 5%; grid-template-columns:1fr; }
          .menuBtn { display: block; margin-left: auto; }
          nav {
            display: none;
            position: absolute;
            top: 75px;
            left: 16px;
            right: 16px;
            padding: 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 14px;
            background: rgba(5,12,20,.98);
            box-shadow: 0 20px 50px rgba(0,0,0,.5);
          }
          nav.navOpen { display: flex; }
          nav > a { display: block; padding: 12px; }
          nav > a.adminBtn, nav > a.accountBtn { display: flex; }
          nav .cartBtn { width: 100%; justify-content: center; margin-top: 5px; }
          .trust, .benefits, .steps, .modalGrid, .detailsSection {
            grid-template-columns: 1fr;
          }
          .finalPurchase { align-items: stretch; flex-direction: column; }
          .finalPurchase .modalBuy { width: 100%; max-width: none; }
          .hero { padding-top: 100px; }
          .hero h1 { letter-spacing: -3px; }
          .modal { padding: 25px; }
          .galleryMain { min-height: 370px; }
          .galleryMain > img { height: 330px; }
        }

        @media(max-width:550px) {
          .compareGrid { grid-template-columns:1fr; }
          .card h3,
          .cardBody > p,
          .cardBody > .old,
          .price,
          .transfer {
            height: auto;
          }
          .card h3 { min-height: 0; }
          .catalogStatus { align-items: flex-start; flex-direction: column; margin-top: -28px; }
          .catalogControls { width: 100%; flex-wrap: wrap; }
          .catalogControls select { flex: 1; min-width: 150px; }
          .productCardTitle { height: auto; min-height: 0; }
          .stockInline { margin: 8px 0 0; }
          .cardBody > p { min-height: 0; }
          .recentGrid { grid-template-columns:1fr; }
          .recentSection { padding-bottom:60px; }
          .savedCart { align-items:stretch; flex-direction:column; margin:0 15px 55px; padding:21px; }
          .savedCart button { width:100%; }
          .shareSection { margin:55px 15px; padding:25px 20px; }
          .productTopline { align-items:flex-start; flex-direction:column; }
          .productActions { width:100%; }
          .productActions button { flex:1; }
          .finalPurchase .buyNowBtn { width:100%; }
          .fixedMenuBack { top: 10px; left: 10px; padding: 10px 12px; font-size: 10px; }
          header { padding: 0 16px; }
          .logo { font-size: 20px; }
          .cartBtn span { display: none; }
          .announcement { font-size: 9px; }
          .hero { min-height: 650px; }
          .hero h1 { font-size: 52px; }
          .trust { margin-top: 45px; }
          .products { padding-left: 15px; padding-right: 15px; }
          .toast {
            left: 14px;
            right: 14px;
            top: auto;
            bottom: 90px;
          }
          .overlay { padding: 10px; }
          .modal { padding: 18px; border-radius: 15px; }
          .close { right: 10px; top: 10px; }
          .galleryMain {
            min-height: 300px;
            padding: 18px;
          }
          .galleryMain > img { height: 270px; }
          .modalPackagePreview {
            width: calc(100% - 72px);
            height: 82px;
            grid-template-columns: 76px minmax(0,1fr);
          }
          .modalPackagePreview > img {
            width: 76px;
            height: 66px;
          }
          .modalPackagePreview > span,
          .modalPackagePreview b { font-size: 9px; }
          .galleryArrow {
            width: 38px;
            height: 38px;
          }
          .thumbnails { gap: 6px; }
          .thumb { height: 70px; padding: 5px; }
          .specRow {
            grid-template-columns: 1fr;
            gap: 5px;
          }
          .productInfo h2 { padding-right: 35px; }
        }
      `}</style>
    </main>
  );
}
