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
    images: [{ url: "/icon.png?social=rxz-logo-v2", width: 1024, height: 1024, alt: "Logo RXZ Gamer" }],
  },

  twitter: {
    card: "summary",
    title: "RXZ Gamer | Periféricos y Tecnología Gamer",
    description:
      "Mouse, teclados, controles y periféricos gamer. Envíos a todo el país.",
    images: ["/icon.png?social=rxz-logo-v2"],
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "RXZ Gamer",
    url: "https://rxzgamer.com.ar",
    logo: "https://rxzgamer.com.ar/icon.png",
    image: "https://rxzgamer.com.ar/icon.png",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
        {children}
        <StoreObservability />
      </body>
    </html>
  );
}
