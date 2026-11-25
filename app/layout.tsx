
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";

import "./globals.css";

import { CartProvider } from "@/components/CartContext";
import GlobalAnimations from "@/components/GlobalAnimations";
import PageLoader from "@/components/PageLoader";

// Fonts
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

// Global SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://houseoforive.in"),

  title: {
    default: "House of Orive | Timeless Fashion & Modern Elegance",
    template: "%s | House of Orive",
  },

  description:
    "Discover House of Orive for timeless fashion, refined essentials and contemporary styles. Explore our collection and shop online.",

  applicationName: "House of Orive",

  keywords: [
    "House of Orive",
    "House of Orive official website",
    "House of Orive clothing",
    "online fashion store India",
    "fashion clothing online",
    "modern fashion",
    "timeless fashion",
    "wardrobe essentials",
    "contemporary clothing",
  ],

  authors: [{ name: "House of Orive" }],
  creator: "House of Orive",
  publisher: "House of Orive",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "House of Orive | Timeless Fashion & Modern Elegance",
    description:
      "Discover House of Orive for timeless fashion, refined essentials and contemporary styles.",
    url: "https://houseoforive.in/",
    siteName: "House of Orive",
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "House of Orive | Timeless Fashion & Modern Elegance",
    description:
      "Discover House of Orive for timeless fashion, refined essentials and contemporary styles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <body className="antialiased">
        <PageLoader />
        <MetaPixel />

        <CartProvider>
          <GlobalAnimations />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
