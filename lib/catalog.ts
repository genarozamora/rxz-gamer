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
  slug: string;
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

const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "attack-shark-x3-pro",
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
    slug: "mchose-ace-60-pro",
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
    slug: "gamesir-nova-2-lite",
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
    slug: "gamegaga-cm-619",
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
    slug: "attack-shark-x11",
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
    slug: "aula-f75-he",
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
    slug: "easysmx-d10",
    brand: "EASYSMX",
    name: "D10 Wireless Gaming Controller",
    category: "Controles",
    subtitle: "TMR • 1000 Hz • Gatillos Hall Effect",
    price: 109990,
    oldPrice: 129990,
    badge: "COMBO COMPLETO",
    images: [
      "/easysmx-d10-official-4.jpg",
      "/easysmx-d10-official-1.webp",
      "/easysmx-d10-official-2.jpg",
      "/easysmx-d10-official-3.jpg",
      "/easysmx-d10-trigger.webp",
      "/easysmx-d10-compatibility.webp",
    ],
    fallbackImage: "/easysmx-d10-official-1.webp",
    stock: 1,
    variants: [
      { id: "space-black", label: "Negro (Space Black)", color: "#101216", stock: 1, image: "/easysmx-d10-official-1.webp" },
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

export function findCatalogProduct(identifier: string | number): Product | undefined {
  const routeValue = String(identifier);
  return ALL_PRODUCTS.find((product) => product.slug === routeValue || String(product.id) === routeValue);
}

export function productPath(product: Pick<Product, "id" | "slug"> | string | number): string {
  if (typeof product === "object") return `/productos/${product.slug}`;
  const catalogProduct = findCatalogProduct(product);
  return `/productos/${catalogProduct?.slug || product}`;
}

