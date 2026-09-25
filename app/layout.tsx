import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreObservability } from "./observability";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rxzgamer.com.ar"),
  alternates: { canonical: "/" },
  applicationName: "RXZ Gamer",
  title: {
    default: "RXZ Gamer | Periféricos y Tecnología Gamer",
    template: "%s | RXZ Gamer",
  },

  description:
    "RXZ Gamer: periféricos y tecnología gamer seleccionada por rendimiento y relación precio-calidad. Mouse, teclados, controles y más. Envíos a todo el país.",

  keywords: [
    "RXZ Gamer",
    "RXZ Gamer Argentina",
    "periféricos gamer",
    "productos gamer",
    "gaming Argentina",
    "mouse gamer",
    "teclado gamer",
    "control gamer",
    "joystick gamer",
    "Attack Shark",
    "Attack Shark X3",
    "GameSir",
    "GameSir Nova 2 Lite",
    "EasySMX D10",
    "AULA F75 HE",
  ],

  authors: [{ name: "RXZ Gamer" }],
  creator: "RXZ Gamer",
  publisher: "RXZ Gamer",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "RXZ Gamer",
    url: "/",
    title: "RXZ Gamer | Periféricos y Tecnología Gamer",
    description:
      "Mouse, teclados, controles y periféricos gamer. Envíos a todo el país.",
    images: [{ url: "/rxz-logo-512.png?brand=rxz-v3", width: 512, height: 512, alt: "Logo oficial de RXZ Gamer" }],
  },

  twitter: {
    card: "summary",
    title: "RXZ Gamer | Periféricos y Tecnología Gamer",
    description:
      "Mouse, teclados, controles y periféricos gamer. Envíos a todo el país.",
    images: ["/rxz-logo-512.png?brand=rxz-v3"],
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      { url: "/rxz-logo-48.png", sizes: "48x48", type: "image/png" },
      { url: "/rxz-logo-96.png", sizes: "96x96", type: "image/png" },
      { url: "/rxz-logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/rxz-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/rxz-logo-48.png",
    apple: [{ url: "/rxz-logo-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://rxzgamer.com.ar/#website",
    url: "https://rxzgamer.com.ar/",
    name: "RXZ Gamer",
    alternateName: ["RXZ Gamer Argentina", "RXZ"],
    inLanguage: "es-AR",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "RXZ Gamer",
    url: "https://rxzgamer.com.ar",
    logo: {
      "@type": "ImageObject",
      url: "https://rxzgamer.com.ar/rxz-logo-512.png",
      width: 512,
      height: 512,
    },
    image: "https://rxzgamer.com.ar/rxz-logo-512.png",
    description: "Tienda argentina de periféricos y tecnología gamer con envíos nacionales.",
    areaServed: { "@type": "Country", name: "Argentina" },
    paymentAccepted: "Transferencia bancaria",
  };

  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#contenido-principal">Saltar al contenido</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
        {children}
        <StoreObservability />
      </body>
    </html>
  );
}
