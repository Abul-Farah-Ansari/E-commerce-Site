
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import GlobalAnimations from "@/components/GlobalAnimations";


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
      <body>
        <CartProvider>
          <GlobalAnimations />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
