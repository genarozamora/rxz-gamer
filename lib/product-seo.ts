export type ProductSeo = {
  id: string;
  brand: string;
  name: string;
  description: string;
  image: string;
};

export const PRODUCT_SEO: Record<string, ProductSeo> = {
  "1": {
    id: "1",
    brand: "ATTACK SHARK",
    name: "X3 Pro 8K Wireless Gaming Mouse",
    description: "Mouse gamer Attack Shark X3 Pro 8K con sensor PixArt PAW3395, hasta 26.000 DPI, conexión triple y polling de hasta 8000 Hz.",
    image: "/attack-shark-x3-white-receiver.webp",
  },
  "3": {
    id: "3",
    brand: "GAMESIR",
    name: "Nova 2 Lite Wireless Gaming Controller",
    description: "Control inalámbrico multiplataforma con sticks y gatillos Hall Effect, polling de alta velocidad y botones traseros configurables.",
    image: "/gamesir-nova2-lite.png",
  },
  "6": {
    id: "6",
    brand: "AULA",
    name: "F75 HE Magnetic Gaming Keyboard",
    description: "Teclado gamer 75% con switches magnéticos Hall Effect, Rapid Trigger, actuación configurable y conectividad tri-mode.",
    image: "/aula-f75-he-black-contour-official.jpg",
  },
  "7": {
    id: "7",
    brand: "EASYSMX",
    name: "D10 Wireless Gaming Controller",
    description: "Control inalámbrico multiplataforma con sticks TMR de alta precisión, gatillos de doble modo, botones mecánicos y base inteligente de carga. El combo incluye receptor USB 2.4 GHz.",
    image: "/easysmx-d10-official-4.jpg",
  },
};
