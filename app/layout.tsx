import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/CartContext";

/* =========================================
   PREMIUM FASHION DISPLAY FONT
   Bodoni Moda
========================================= */

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-bodoni",
  display: "swap",
});

/* =========================================
   CLEAN LUXURY UI FONT
   DM Sans
========================================= */

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

/* =========================================
   METADATA
========================================= */

export const metadata: Metadata = {
  title: {
    default: "House of Orive",
    template: "%s | House of Orive",
  },

  description:
    "House of Orive — timeless fashion, refined essentials and modern elegance.",

  keywords: [
    "House of Orive",
    "fashion",
    "clothing",
    "premium clothing",
    "luxury fashion",
    "online fashion",
    "fashion store",
  ],

  applicationName: "House of Orive",

  openGraph: {
    title: "House of Orive",
    description:
      "Timeless fashion, refined essentials and modern elegance.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "House of Orive",
    description:
      "Timeless fashion, refined essentials and modern elegance.",
  },
};

/* =========================================
   ROOT LAYOUT
========================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${dmSans.variable}`}
    >
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}