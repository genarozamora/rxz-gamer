import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rxz-gamer-tflb.vercel.app"),
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
  },

  twitter: {
    card: "summary_large_image",
    title: "RXZ Gamer | Periféricos y Tecnología Gamer",
    description:
      "Mouse, teclados, controles y periféricos gamer. Envíos a todo el país.",
  },

  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
