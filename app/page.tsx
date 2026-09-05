"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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

const ALIAS = "genaroperaltaz";

const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    brand: "ATTACK SHARK",
    name: "X3 Pro 8K Wireless Gaming Mouse",
    category: "Mouse",
    subtitle: "PAW3395 • 26.000 DPI • 4K/8K Hz",
    price: 64990,
    oldPrice: 74990,
    badge: "BEST SELLER",
    images: [
      "https://e-topshop.com.ua/image/cache/catalog/mouse/ASX3/Pro/black-800x800.jpeg",
      "https://attackshark.com/cdn/shop/files/1_4K_logo_d23c047c-0870-4d14-981a-82735559aa68.jpg?v=1712546749&width=2048",
      "https://m.media-amazon.com/images/I/71aZBHC2tyL._AC_SL1500_.jpg",
      "https://techdiversitybd.com/wp-content/uploads/2024/04/Attack-Shark-x3-pro.png",
      "https://http2.mlstatic.com/D_Q_NP_2X_972874-MLB77246414533_062024-E-mouse-game-attack-shark-x3-pro-4k-sfio-8k-cfio-paw3395-59g.webp",
    ],
    fallbackImage: "/attack-shark-x3-2.jpg",
    stock: 3,
    variants: [
      { id: "black", label: "Negro", color: "#17191d", stock: 1, image: "https://e-topshop.com.ua/image/cache/catalog/mouse/ASX3/Pro/black-800x800.jpeg" },
      { id: "white", label: "Blanco", color: "#f4f4f3", stock: 1, image: "https://attackshark.com/cdn/shop/files/1_4K_logo_d23c047c-0870-4d14-981a-82735559aa68.jpg?v=1712546749&width=2048" },
      { id: "red", label: "Rojo", color: "#df2635", stock: 1, image: "https://m.media-amazon.com/images/I/71aZBHC2tyL._AC_SL1500_.jpg" },
    ],
    description:
      "Mouse gamer ultraliviano de alto rendimiento con sensor PixArt PAW3395, conectividad triple y polling de hasta 4K inalámbrico y 8K cableado.",
    features: [
      "Sensor PixArt PAW3395",
      "Hasta 26.000 DPI programables",
      "Polling rate de hasta 4000 Hz inalámbrico y 8000 Hz cableado",
      "Peso aproximado de 59 g",
      "Conexión Bluetooth 5.2, 2.4 GHz y USB-C",
      "Switches Kailh con vida útil de hasta 80 millones de clics",
      "Patines PTFE",
      "Software de configuración y memoria interna",
    ],
    specs: [
      { label: "Modelo", value: "X3 Pro 8K" },
      { label: "Sensor", value: "PixArt PAW3395" },
      { label: "DPI máximo", value: "26.000 DPI" },
      { label: "Polling rate", value: "Hasta 4000 Hz inalámbrico / 8000 Hz cableado" },
      { label: "Velocidad máxima", value: "650 IPS" },
      { label: "Aceleración máxima", value: "50 G" },
      { label: "Peso", value: "59 g ± 3 g" },
      { label: "Conectividad", value: "Bluetooth 5.2 / 2.4 GHz / USB-C" },
      { label: "Batería", value: "300 mAh" },
      { label: "Autonomía declarada", value: "Hasta 200 horas" },
      { label: "Switches", value: "Kailh Black Mamba" },
      { label: "Durabilidad switches", value: "Hasta 80 millones de clics" },
      { label: "Dimensiones", value: "118,5 × 61 × 39,7 mm" },
      { label: "Pies", value: "PTFE" },
      { label: "Incluye", value: "Mouse, receptor inalámbrico, cable USB-C y manual" },
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
    name: "Nova 2 Lite",
    category: "Controles",
    subtitle: "Hall Effect • 1000 Hz • Multiplataforma",
    price: 69990,
    oldPrice: 79990,
    badge: "MULTIPLATAFORMA",
    images: [
      "/gamesir-nova2-lite.png",
      "/gamesir-nova2-lite-2.jpg",
      "/gamesir-nova2-lite-3.jpg",
      "https://down-ph.img.susercontent.com/file/my-11134208-820lb-mio261i1lgjmce",
      "https://down-ph.img.susercontent.com/file/my-11134208-820l8-mio261i1ineq8a",
    ],
    fallbackImage: "/gamesir-nova2-lite.png",
    stock: 2,
    variants: [
      { id: "midnight-gray", label: "Negro (Midnight Gray)", color: "#30343b", stock: 1, image: "/gamesir-nova2-lite.png" },
      { id: "luminous-white", label: "Blanco (Luminous White)", color: "#f2f3f4", stock: 1, image: "https://gamesir.com/cdn/shop/files/10_5bd11b1c-e7fa-4b78-b551-6785e3c99861.png?v=1748246138" },
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
      { label: "Resolución sticks", value: "12-bit" },
      { label: "Gatillos", value: "Hall Effect con 2 posiciones" },
      { label: "D-pad", value: "Mecánico circular" },
      { label: "Botones traseros", value: "2 remapeables" },
      { label: "Polling cable", value: "Hasta 1000 Hz" },
      { label: "Polling 2.4 GHz", value: "Hasta 1000 Hz" },
      { label: "Polling Bluetooth", value: "Hasta 125 Hz" },
      { label: "Vibración", value: "2 motores asimétricos" },
      { label: "Batería", value: "600 mAh" },
      { label: "Peso aproximado", value: "225 g" },
      { label: "Software", value: "GameSir Connect" },
      { label: "Incluye", value: "Control, base de carga RGB, receptor USB 2.4 GHz, cable USB-C y manual" },
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
    price: 149990,
    oldPrice: 179990,
    badge: "HALL EFFECT",
    images: [
      "/aula-f75-he-alibaba-1.jpg",
      "/aula-f75-he-alibaba-2.jpg",
      "/aula-f75-he-alibaba-3.jpg",
      "https://lacdau.com/media/product/6546-z6511049706330_d7050573782eed397359cc42f36080ed.jpg",
      "https://lacdau.com/media/product/250-6546-z6511049698713_415ee834ab8cf5d7da8ff7332767e332.jpg",
    ],
    fallbackImage: "/aula-f75-he-alibaba-1.jpg",
    stock: 4,
    variants: [
      { id: "black-contour", label: "Black Contour", color: "#14181d", stock: 3, image: "/aula-f75-he-alibaba-3.jpg" },
      { id: "gradient-gray", label: "Gradient Gray", color: "#9ca3af", stock: 1, image: "/aula-f75-he-alibaba-1.jpg" },
    ],
    description:
      "Teclado gamer 75% con switches magnéticos Hall Effect, Rapid Trigger, actuación configurable y conectividad tri-mode.",
    features: [
      "Formato compacto 75% con 80 teclas",
      "Switches magnéticos Hall Effect",
      "Rapid Trigger con actuación configurable",
      "Polling rate de hasta 8000 Hz por cable",
      "Conectividad 2.4 GHz, Bluetooth 5.0 y USB-C",
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
      { label: "Conectividad", value: "2.4 GHz / Bluetooth 5.0 / USB-C" },
      { label: "Batería", value: "4000 mAh" },
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
    subtitle: "TMR • 1000 Hz • Base de carga incluida",
    price: 89990,
    oldPrice: 109990,
    badge: "COMBO COMPLETO",
    images: [
      "https://www.easysmx.com/cdn/shop/files/D10_-1000X1000_b7bff737-127f-492d-8436-120915dce879_1024x1024.png?v=1747905818",
      "https://cdn.qeemat.com.pk/product/11116/easysmx-d10-wireless-gaming-controller-black.png",
      "https://m.media-amazon.com/images/I/71iCwG4m6RL._AC_SL1500_.jpg",
    ],
    fallbackImage: "/file.svg",
    stock: 1,
    variants: [
      { id: "space-black", label: "Negro (Space Black)", color: "#101216", stock: 1, image: "https://www.easysmx.com/cdn/shop/files/D10_-1000X1000_b7bff737-127f-492d-8436-120915dce879_1024x1024.png?v=1747905818" },
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
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rxz-cart");
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        setCart(parsed.map((item) => ({ ...item, cartKey: item.cartKey || String(item.id) })));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    supabase.from("products").select("id,brand,name,category,subtitle,description,price,old_price,stock,badge,images,features,specs,variants").eq("active", true).then(({ data }) => {
      if (!data?.length) return;
      const managed = data.map((row) => ({
        id: Number(row.id), brand: row.brand, name: row.name, category: row.category,
        subtitle: row.subtitle || "", description: row.description || "",
        price: Number(row.price), oldPrice: row.old_price ? Number(row.old_price) : undefined,
        stock: Number(row.stock), badge: row.badge || undefined,
        images: Array.isArray(row.images) && row.images.length ? row.images as string[] : ["/file.svg"],
        fallbackImage: Array.isArray(row.images) && row.images[0] ? String(row.images[0]) : "/file.svg",
        features: Array.isArray(row.features) ? row.features as string[] : [],
        specs: Array.isArray(row.specs) ? row.specs as Spec[] : [],
        variants: Array.isArray(row.variants) ? row.variants as ProductVariant[] : undefined,
      }));
      const managedIds = new Set(managed.map((item) => item.id));
      setCatalogProducts([...managed, ...PRODUCTS.filter((item) => !managedIds.has(item.id))]);
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
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariantId("");
  }, [selected?.id]);

  const selectedVariant = selected?.variants?.find((variant) => variant.id === selectedVariantId);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(catalogProducts.map((p) => p.category)))],
    [catalogProducts]
  );

  const filtered = useMemo(() => {
    return catalogProducts.filter((p) => {
      const categoryOK = category === "Todos" || p.category === category;
      const text = `${p.brand} ${p.name} ${p.subtitle}`.toLowerCase();
      return categoryOK && text.includes(search.toLowerCase());
    });
  }, [search, category, catalogProducts]);

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);
  const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);

  function track(eventName: string, productId?: number) {
    void supabase.from("store_events").insert({ event_name: eventName, product_id: productId ? String(productId) : null });
  }

  function openProduct(product: Product) {
    setSelected(product);
    track("product_view", product.id);
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
    <main>
      <div className="background">
        <div className="grid" />
        <div className="glow glow1" />
        <div className="glow glow2" />
      </div>

      <div className="announcement">
        🚚 ENVÍOS A TODO EL PAÍS · OCA · ATENCIÓN PERSONALIZADA
      </div>

      <header>
        <a href="#inicio" className="logo">
          RXZ <span>GAMER</span>
        </a>

        <button className="menuBtn" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menú">
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={menuOpen ? "navOpen" : ""} onClick={() => setMenuOpen(false)}>
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#beneficios">Envíos</a>
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

      <section id="productos" className="products">
        <div className="sectionHead">
          <span>RXZ SELECTION</span>
          <h2>Productos destacados</h2>
          <p>Tecnología seleccionada para mejorar tu setup.</p>
        </div>

        <div className="tools">
          <div className="search">
            🔎
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
            />
          </div>

          <div className="categories">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="productGrid">
          {filtered.map((product) => {
            const discount = product.oldPrice
              ? Math.round((1 - product.price / product.oldPrice) * 100)
              : 0;

            return (
              <article className="card" key={product.id}>
                <div className="imageBox" onClick={() => openProduct(product)}>
                  {product.badge && <span className="badge">{product.badge}</span>}
                  {discount > 0 && (
                    <span className="discount">-{discount}%</span>
                  )}

                  <SafeImage
                    src={product.images[0]}
                    fallback={product.fallbackImage}
                    alt={`${product.brand} ${product.name}`}
                  />

                  <span className="photoCount">
                    📷 {product.images.length} fotos
                  </span>
                </div>

                <div className="cardBody">
                  <div className="brand">{product.brand}</div>
                  <h3>{product.name}</h3>
                  <p>{product.subtitle}</p>

                  <div className={product.stock <= 0 ? "stock outOfStock" : "stock"}>
                    <span className="stockDot" />
                    {product.stock <= 0
                      ? "0 unidades"
                      : product.stock > 5
                      ? "Stock disponible"
                      : `Últimas ${product.stock} unidades`}
                  </div>

                  {product.oldPrice && (
                    <div className="old">{money(product.oldPrice)}</div>
                  )}

                  <div className="price">{money(product.price)}</div>
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
              Transferí al alias <strong>{ALIAS}</strong>.
            </p>
          </div>
          <div>
            <b>04</b>
            <h3>Recibí</h3>
            <p>Coordinamos tu envío por OCA.</p>
          </div>
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
          <a href="/legal/terminos">Términos</a>
          <a href="/legal/privacidad">Privacidad</a>
          <a href="/legal/garantias">Cambios y garantías</a>
          <a href="/legal/envios">Envíos</a>
          <a href="/arrepentimiento">BOTÓN DE ARREPENTIMIENTO</a>
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

      {toast && (
        <div className="toast">
          <span>{toast}</span>
          <button onClick={() => setCartOpen(true)}>VER CARRITO</button>
        </div>
      )}

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <button className="fixedMenuBack" onClick={() => setSelected(null)}>
            ← VOLVER AL MENÚ
          </button>
          <div className="modal productModal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
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
                <div className="brand">{selected.brand}</div>
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
                    : (selectedVariant ? selectedVariant.stock : selected.stock) > 5
                    ? "Stock disponible"
                    : `${selectedVariant ? "Disponible" : "Últimas"} ${selectedVariant ? selectedVariant.stock : selected.stock} ${(selectedVariant ? selectedVariant.stock : selected.stock) === 1 ? "unidad" : "unidades"}`}
                </div>

                {selected.oldPrice && (
                  <div className="modalOld">{money(selected.oldPrice)}</div>
                )}

                <div className="modalPrice">{money(selected.price)}</div>
                <small className="transfer">
                  Precio especial por transferencia
                </small>

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

              <button className="closeNormal" onClick={() => setCartOpen(false)}>
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
        button, input { font: inherit; }
        button { cursor: pointer; }
        button:disabled { cursor: not-allowed; opacity: .45; }
        main {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #03060b;
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
        .announcement, header, section, footer {
          position: relative;
          z-index: 2;
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
          position: sticky;
          top: 0;
          z-index: 100;
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
        .productGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(290px,1fr));
          gap: 25px;
        }
        .card {
          overflow: hidden;
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
        .card:hover .imageBox img { transform: scale(1.05); }
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
        .discount { right: 15px; background: #ef4444; }
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
        .cardBody { padding: 24px; }
        .brand {
          color: #22c55e;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
        }
        .card h3 { margin: 8px 0; font-size: 23px; }
        .cardBody > p {
          color: #8897ab;
          min-height: 40px;
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
        .outOfStock .stockDot {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }
        .old, .modalOld {
          color: #66758b;
          text-decoration: line-through;
          font-size: 13px;
        }
        .price {
          color: #22c55e;
          font-size: 29px;
          font-weight: 950;
          margin: 3px 0;
        }
        .transfer { color: #77869b; }
        .details, .buy {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          font-weight: 900;
        }
        .details {
          margin-top: 22px;
          border: 1px solid #344154;
          background: #131d2c;
          color: white;
        }
        .buy {
          margin-top: 9px;
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

        @keyframes move1 {
          to { transform: translate(300px,180px); }
        }
        @keyframes move2 {
          to { transform: translate(-300px,150px); }
        }

        @media(max-width:900px) {
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
